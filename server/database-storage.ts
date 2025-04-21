import { db } from "./db";
import { users, skills, exchanges, messages } from "@shared/schema";
import type { User, InsertUser, Skill, InsertSkill, Exchange, InsertExchange, Message, InsertMessage } from "@shared/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        rating: 0,
        exchangeCount: 0,
        avatar: insertUser.avatar || null,
        bio: insertUser.bio || null
      })
      .returning();
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Skill operations
  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill || undefined;
  }

  async getSkillsByUser(userId: number): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.userId, userId));
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.category, category));
  }

  async getSkillsByType(type: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.type, type));
  }

  async getAllSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db
      .insert(skills)
      .values(insertSkill)
      .returning();
    return skill;
  }

  async updateSkill(id: number, skillUpdate: Partial<Skill>): Promise<Skill | undefined> {
    const [updatedSkill] = await db
      .update(skills)
      .set(skillUpdate)
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill || undefined;
  }

  async deleteSkill(id: number): Promise<boolean> {
    await db.delete(skills).where(eq(skills.id, id));
    // Query to check if the skill still exists
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill === undefined;
  }

  // Exchange operations
  async getExchange(id: number): Promise<Exchange | undefined> {
    const [exchange] = await db.select().from(exchanges).where(eq(exchanges.id, id));
    return exchange || undefined;
  }

  async getExchangesByUser(userId: number): Promise<Exchange[]> {
    return await db
      .select()
      .from(exchanges)
      .where(or(
        eq(exchanges.initiatorId, userId),
        eq(exchanges.responderId, userId)
      ))
      .orderBy(desc(exchanges.updatedAt));
  }

  async createExchange(insertExchange: InsertExchange): Promise<Exchange> {
    const [exchange] = await db
      .insert(exchanges)
      .values({
        ...insertExchange,
        status: insertExchange.status || "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return exchange;
  }

  async updateExchangeStatus(id: number, status: string): Promise<Exchange | undefined> {
    const [updatedExchange] = await db
      .update(exchanges)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(exchanges.id, id))
      .returning();
    
    // If exchange is completed, update user exchange counts
    if (status === 'completed') {
      const exchange = updatedExchange;
      if (exchange) {
        const initiator = await this.getUser(exchange.initiatorId);
        const responder = await this.getUser(exchange.responderId);
        
        if (initiator) {
          await this.updateUser(initiator.id, { 
            exchangeCount: (initiator.exchangeCount || 0) + 1 
          });
        }
        
        if (responder) {
          await this.updateUser(responder.id, { 
            exchangeCount: (responder.exchangeCount || 0) + 1 
          });
        }
      }
    }
    
    return updatedExchange || undefined;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByExchange(exchangeId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.exchangeId, exchangeId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Seed the database with initial data
  async seedDatabase() {
    // Check if users already exist
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database with initial data...");

    // Seed users
    const usersList: InsertUser[] = [
      {
        username: 'michaelchen',
        password: 'password123',
        email: 'michael@example.com',
        fullName: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: 'Frontend developer specializing in React and modern JavaScript frameworks.'
      },
      {
        username: 'sarahkim',
        password: 'password123',
        email: 'sarah@example.com',
        fullName: 'Sarah Kim',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: 'UI/UX designer with 5 years of experience in creating user-centered digital products.'
      },
      {
        username: 'davidwilson',
        password: 'password123',
        email: 'david@example.com',
        fullName: 'David Wilson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: 'DevOps engineer passionate about automation and cloud infrastructure.'
      },
      {
        username: 'priyasharma',
        password: 'password123',
        email: 'priya@example.com',
        fullName: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: 'Data scientist with expertise in machine learning and predictive analytics.'
      }
    ];
    
    const createdUsers: User[] = [];
    for (const userData of usersList) {
      createdUsers.push(await this.createUser(userData));
    }

    // Seed skills
    const skillsList: InsertSkill[] = [
      {
        userId: 1,
        title: 'React Development',
        description: 'I can help with React component architecture, hooks implementation, and state management solutions.',
        type: 'offering',
        category: 'development',
        tags: ['React', 'JavaScript', 'Redux']
      },
      {
        userId: 1,
        title: 'UI/UX Design',
        description: 'Looking to learn about user experience design principles and wireframing techniques.',
        type: 'seeking',
        category: 'design',
        tags: ['UI/UX Design']
      },
      {
        userId: 2,
        title: 'UI/UX Design',
        description: 'I specialize in creating user-centered designs, wireframes, and interactive prototypes for web and mobile applications.',
        type: 'offering',
        category: 'design',
        tags: ['Figma', 'Wireframing', 'Prototyping']
      },
      {
        userId: 2,
        title: 'Front-end Development',
        description: 'Interested in learning modern frontend development frameworks and best practices.',
        type: 'seeking',
        category: 'development',
        tags: ['Front-end Development']
      },
      {
        userId: 3,
        title: 'DevOps & CI/CD',
        description: 'I can teach how to set up continuous integration pipelines, container orchestration, and cloud infrastructure.',
        type: 'offering',
        category: 'devops',
        tags: ['Docker', 'Kubernetes', 'AWS']
      },
      {
        userId: 3,
        title: 'Python & Data Science',
        description: 'Would like to learn Python for data analysis and basic machine learning concepts.',
        type: 'seeking',
        category: 'data science',
        tags: ['Python', 'Data Science']
      },
      {
        userId: 4,
        title: 'Data Science',
        description: 'I can provide guidance on data analysis, machine learning models, and data visualization techniques.',
        type: 'offering',
        category: 'data science',
        tags: ['Python', 'TensorFlow', 'Pandas']
      },
      {
        userId: 4,
        title: 'Mobile Development',
        description: 'Interested in learning React Native or Flutter for cross-platform mobile app development.',
        type: 'seeking',
        category: 'development',
        tags: ['Mobile Development']
      }
    ];
    
    const createdSkills: Skill[] = [];
    for (const skillData of skillsList) {
      createdSkills.push(await this.createSkill(skillData));
    }

    // Seed exchanges
    const exchangesList: InsertExchange[] = [
      {
        initiatorId: 1,
        responderId: 2,
        initiatorSkillId: 1,
        responderSkillId: 3,
        status: 'accepted'
      },
      {
        initiatorId: 3,
        responderId: 4,
        initiatorSkillId: 5,
        responderSkillId: 7,
        status: 'pending'
      }
    ];
    
    const createdExchanges: Exchange[] = [];
    for (const exchangeData of exchangesList) {
      createdExchanges.push(await this.createExchange(exchangeData));
    }

    // Seed messages
    const messagesList: InsertMessage[] = [
      {
        exchangeId: 1,
        senderId: 1,
        content: 'Hi Sarah, I\'d love to learn about UI/UX design from you. When would you be available for a session?'
      },
      {
        exchangeId: 1,
        senderId: 2,
        content: 'Hi Michael! I\'m available this weekend. We could do a video call on Saturday afternoon if that works for you?'
      },
      {
        exchangeId: 1,
        senderId: 1,
        content: 'Saturday afternoon works perfectly for me. Looking forward to it!'
      }
    ];
    
    for (const messageData of messagesList) {
      await this.createMessage(messageData);
    }

    console.log("Database seeding completed successfully!");
  }
}