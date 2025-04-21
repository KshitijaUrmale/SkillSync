import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertSkillSchema, insertExchangeSchema, insertMessageSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup session store
  const SessionStore = MemoryStore(session);
  
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "skillsync-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        // Remove password field from the user object before sending to client
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (err) {
        return done(err);
      }
    })
  );
  
  // Serialize and deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (err) {
      done(err);
    }
  });
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });
  
  app.post("/api/auth/logout", (req: any, res) => {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true, user: req.user });
    } else {
      res.json({ authenticated: false });
    }
  });

  // User Routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Ensure users can only update their own profile
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate update fields
      const updateSchema = z.object({
        fullName: z.string().optional(),
        avatar: z.string().optional(),
        bio: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // Skill Routes
  app.get("/api/skills", async (req, res) => {
    try {
      let skills;
      
      if (req.query.userId) {
        const userId = parseInt(req.query.userId as string);
        skills = await storage.getSkillsByUser(userId);
      } else if (req.query.category) {
        skills = await storage.getSkillsByCategory(req.query.category as string);
      } else if (req.query.type) {
        skills = await storage.getSkillsByType(req.query.type as string);
      } else {
        skills = await storage.getAllSkills();
      }
      
      // Enhance skills with user information
      const enhancedSkills = await Promise.all(
        skills.map(async (skill) => {
          const user = await storage.getUser(skill.userId);
          if (!user) return skill;
          
          const { password: _, ...userWithoutPassword } = user;
          return {
            ...skill,
            user: userWithoutPassword,
          };
        })
      );
      
      res.json(enhancedSkills);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/skills/:id", async (req, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const skill = await storage.getSkill(skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Include user information
      const user = await storage.getUser(skill.userId);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        res.json({ ...skill, user: userWithoutPassword });
      } else {
        res.json(skill);
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/skills", isAuthenticated, async (req: any, res) => {
    try {
      // Add the authenticated user's ID to the skill data
      const skillData = { ...req.body, userId: req.user.id };
      
      const validatedData = insertSkillSchema.parse(skillData);
      const skill = await storage.createSkill(validatedData);
      
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  app.put("/api/skills/:id", isAuthenticated, async (req: any, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const skill = await storage.getSkill(skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Ensure users can only update their own skills
      if (req.user.id !== skill.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate update fields
      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      const updatedSkill = await storage.updateSkill(skillId, validatedData);
      
      res.json(updatedSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  app.delete("/api/skills/:id", isAuthenticated, async (req: any, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const skill = await storage.getSkill(skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Ensure users can only delete their own skills
      if (req.user.id !== skill.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteSkill(skillId);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete skill" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Exchange Routes
  app.get("/api/exchanges", isAuthenticated, async (req: any, res) => {
    try {
      const exchanges = await storage.getExchangesByUser(req.user.id);
      
      // Enhance exchanges with related data
      const enhancedExchanges = await Promise.all(
        exchanges.map(async (exchange) => {
          const initiator = await storage.getUser(exchange.initiatorId);
          const responder = await storage.getUser(exchange.responderId);
          const initiatorSkill = await storage.getSkill(exchange.initiatorSkillId);
          const responderSkill = await storage.getSkill(exchange.responderSkillId);
          
          // Remove passwords from user objects
          let initiatorData;
          let responderData;
          
          if (initiator) {
            const { password: _, ...initiatorWithoutPassword } = initiator;
            initiatorData = initiatorWithoutPassword;
          }
          
          if (responder) {
            const { password: _, ...responderWithoutPassword } = responder;
            responderData = responderWithoutPassword;
          }
          
          return {
            ...exchange,
            initiator: initiatorData,
            responder: responderData,
            initiatorSkill,
            responderSkill,
          };
        })
      );
      
      res.json(enhancedExchanges);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/exchanges/:id", isAuthenticated, async (req: any, res) => {
    try {
      const exchangeId = parseInt(req.params.id);
      const exchange = await storage.getExchange(exchangeId);
      
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      // Ensure users can only view exchanges they're participating in
      if (req.user.id !== exchange.initiatorId && req.user.id !== exchange.responderId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Include related data
      const initiator = await storage.getUser(exchange.initiatorId);
      const responder = await storage.getUser(exchange.responderId);
      const initiatorSkill = await storage.getSkill(exchange.initiatorSkillId);
      const responderSkill = await storage.getSkill(exchange.responderSkillId);
      
      // Remove passwords from user objects
      let initiatorData;
      let responderData;
      
      if (initiator) {
        const { password: _, ...initiatorWithoutPassword } = initiator;
        initiatorData = initiatorWithoutPassword;
      }
      
      if (responder) {
        const { password: _, ...responderWithoutPassword } = responder;
        responderData = responderWithoutPassword;
      }
      
      res.json({
        ...exchange,
        initiator: initiatorData,
        responder: responderData,
        initiatorSkill,
        responderSkill,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/exchanges", isAuthenticated, async (req: any, res) => {
    try {
      // Set initiator to current user
      const exchangeData = { 
        ...req.body,
        initiatorId: req.user.id,
        status: 'pending'
      };
      
      const validatedData = insertExchangeSchema.parse(exchangeData);
      
      // Validate that the skills exist and belong to the right users
      const initiatorSkill = await storage.getSkill(validatedData.initiatorSkillId);
      const responderSkill = await storage.getSkill(validatedData.responderSkillId);
      
      if (!initiatorSkill || !responderSkill) {
        return res.status(400).json({ message: "Invalid skill IDs" });
      }
      
      if (initiatorSkill.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only offer your own skills" });
      }
      
      if (responderSkill.userId !== validatedData.responderId) {
        return res.status(400).json({ message: "Responder skill does not belong to responder" });
      }
      
      const exchange = await storage.createExchange(validatedData);
      
      res.status(201).json(exchange);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  app.put("/api/exchanges/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const exchangeId = parseInt(req.params.id);
      const exchange = await storage.getExchange(exchangeId);
      
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      // Validate the status update
      const statusSchema = z.object({
        status: z.enum(['pending', 'accepted', 'rejected', 'completed'])
      });
      
      const { status } = statusSchema.parse(req.body);
      
      // Check permissions for status updates
      if (status === 'accepted' || status === 'rejected') {
        // Only the responder can accept or reject
        if (req.user.id !== exchange.responderId) {
          return res.status(403).json({ message: "Only the responder can accept or reject" });
        }
      } else if (status === 'completed') {
        // Either party can mark as completed
        if (req.user.id !== exchange.initiatorId && req.user.id !== exchange.responderId) {
          return res.status(403).json({ message: "You are not part of this exchange" });
        }
      } else {
        // Can't revert to pending
        return res.status(400).json({ message: "Invalid status transition" });
      }
      
      const updatedExchange = await storage.updateExchangeStatus(exchangeId, status);
      
      res.json(updatedExchange);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // Message Routes
  app.get("/api/exchanges/:exchangeId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const exchangeId = parseInt(req.params.exchangeId);
      const exchange = await storage.getExchange(exchangeId);
      
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      // Ensure users can only view messages for exchanges they're participating in
      if (req.user.id !== exchange.initiatorId && req.user.id !== exchange.responderId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const messages = await storage.getMessagesByExchange(exchangeId);
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/exchanges/:exchangeId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const exchangeId = parseInt(req.params.exchangeId);
      const exchange = await storage.getExchange(exchangeId);
      
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      // Ensure users can only send messages for exchanges they're participating in
      if (req.user.id !== exchange.initiatorId && req.user.id !== exchange.responderId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const messageData = {
        exchangeId,
        senderId: req.user.id,
        content: req.body.content
      };
      
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  return httpServer;
}
