import { 
  users, 
  User, 
  InsertUser, 
  skills, 
  Skill, 
  InsertSkill,
  exchanges,
  Exchange,
  InsertExchange,
  messages,
  Message,
  InsertMessage
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Skill operations
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillsByUser(userId: number): Promise<Skill[]>;
  getSkillsByCategory(category: string): Promise<Skill[]>;
  getSkillsByType(type: string): Promise<Skill[]>;
  getAllSkills(): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Exchange operations
  getExchange(id: number): Promise<Exchange | undefined>;
  getExchangesByUser(userId: number): Promise<Exchange[]>;
  createExchange(exchange: InsertExchange): Promise<Exchange>;
  updateExchangeStatus(id: number, status: string): Promise<Exchange | undefined>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByExchange(exchangeId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skills: Map<number, Skill>;
  private exchanges: Map<number, Exchange>;
  private messages: Map<number, Message>;
  
  private userCurrentId: number;
  private skillCurrentId: number;
  private exchangeCurrentId: number;
  private messageCurrentId: number;

  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.exchanges = new Map();
    this.messages = new Map();
    
    this.userCurrentId = 1;
    this.skillCurrentId = 1;
    this.exchangeCurrentId = 1;
    this.messageCurrentId = 1;
    
    // Add some initial data for development
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      rating: 0, 
      exchangeCount: 0,
      avatar: insertUser.avatar || null,
      bio: insertUser.bio || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Skill operations
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }
  
  async getSkillsByUser(userId: number): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.userId === userId
    );
  }
  
  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.category === category
    );
  }
  
  async getSkillsByType(type: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.type === type
    );
  }
  
  async getAllSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }
  
  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.skillCurrentId++;
    const now = new Date();
    const skill: Skill = { 
      ...insertSkill, 
      id,
      createdAt: now 
    };
    this.skills.set(id, skill);
    return skill;
  }
  
  async updateSkill(id: number, skillUpdate: Partial<Skill>): Promise<Skill | undefined> {
    const existingSkill = await this.getSkill(id);
    if (!existingSkill) return undefined;
    
    const updatedSkill = { ...existingSkill, ...skillUpdate };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }
  
  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }

  // Exchange operations
  async getExchange(id: number): Promise<Exchange | undefined> {
    return this.exchanges.get(id);
  }
  
  async getExchangesByUser(userId: number): Promise<Exchange[]> {
    return Array.from(this.exchanges.values()).filter(
      (exchange) => exchange.initiatorId === userId || exchange.responderId === userId
    );
  }
  
  async createExchange(insertExchange: InsertExchange): Promise<Exchange> {
    const id = this.exchangeCurrentId++;
    const now = new Date();
    const exchange: Exchange = { 
      ...insertExchange, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.exchanges.set(id, exchange);
    return exchange;
  }
  
  async updateExchangeStatus(id: number, status: string): Promise<Exchange | undefined> {
    const existingExchange = await this.getExchange(id);
    if (!existingExchange) return undefined;
    
    const now = new Date();
    const updatedExchange = { 
      ...existingExchange, 
      status,
      updatedAt: now
    };
    this.exchanges.set(id, updatedExchange);
    
    // If exchange is completed, update user exchange counts
    if (status === 'completed') {
      const initiator = await this.getUser(updatedExchange.initiatorId);
      const responder = await this.getUser(updatedExchange.responderId);
      
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
    
    return updatedExchange;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByExchange(exchangeId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.exchangeId === exchangeId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id,
      createdAt: now
    };
    this.messages.set(id, message);
    return message;
  }

  // Seed data for development
  private seedData() {
    // Seed users
    const users: InsertUser[] = [
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
    
    users.forEach(user => this.createUser(user));

    // Seed skills
    const skills: InsertSkill[] = [
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
    
    skills.forEach(skill => this.createSkill(skill));

    // Seed exchanges
    const exchanges: InsertExchange[] = [
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
    
    exchanges.forEach(exchange => this.createExchange(exchange));

    // Seed messages
    const messages: InsertMessage[] = [
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
    
    messages.forEach(message => this.createMessage(message));
  }
}

// Import DatabaseStorage after defining the interface
import { DatabaseStorage } from "./database-storage";

// Choose which storage implementation to use
const useDatabase = process.env.DATABASE_URL ? true : false;

// Create and export the appropriate storage implementation
export const storage = useDatabase ? new DatabaseStorage() : new MemStorage();