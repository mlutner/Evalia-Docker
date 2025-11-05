import { type User, type UpsertUser, type Survey, type InsertSurvey } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Survey operations
  getSurvey(id: string): Promise<Survey | undefined>;
  getAllSurveys(): Promise<Survey[]>;
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  updateSurvey(id: string, survey: Partial<InsertSurvey>): Promise<Survey | undefined>;
  deleteSurvey(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private surveys: Map<string, Survey>;

  constructor() {
    this.users = new Map();
    this.surveys = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = userData.id ? this.users.get(userData.id) : undefined;
    const now = new Date();
    
    const user: User = {
      id: userData.id || randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async getSurvey(id: string): Promise<Survey | undefined> {
    return this.surveys.get(id);
  }

  async getAllSurveys(): Promise<Survey[]> {
    return Array.from(this.surveys.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const id = randomUUID();
    const now = new Date();
    const survey: Survey = {
      id,
      ...insertSurvey,
      description: insertSurvey.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.surveys.set(id, survey);
    return survey;
  }

  async updateSurvey(id: string, updates: Partial<InsertSurvey>): Promise<Survey | undefined> {
    const survey = this.surveys.get(id);
    if (!survey) return undefined;

    const updatedSurvey: Survey = {
      ...survey,
      ...updates,
      updatedAt: new Date(),
    };
    this.surveys.set(id, updatedSurvey);
    return updatedSurvey;
  }

  async deleteSurvey(id: string): Promise<boolean> {
    return this.surveys.delete(id);
  }
}

export const storage = new MemStorage();
