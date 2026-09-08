import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Activity, ActivityPack, Session, SavedActivity, AuditLog } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  users: User[];
  activities: Activity[];
  packs: ActivityPack[];
  sessions: Session[];
  savedActivities: SavedActivity[];
  auditLogs: AuditLog[];
}

class Database {
  private data: DatabaseSchema;
  private isSaving: boolean = false;
  private savePending: boolean = false;

  constructor() {
    this.data = {
      users: [],
      activities: [],
      packs: [],
      sessions: [],
      savedActivities: [],
      auditLogs: []
    };
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || [],
          activities: parsed.activities || [],
          packs: parsed.packs || [],
          sessions: parsed.sessions || [],
          savedActivities: parsed.savedActivities || [],
          auditLogs: parsed.auditLogs || []
        };
      } catch (err) {
        console.error('Error reading database file, initializing empty:', err);
        this.persist();
      }
    } else {
      this.persist();
    }
  }

  public persist(): void {
    if (this.isSaving) {
      this.savePending = true;
      return;
    }

    this.isSaving = true;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const json = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(DB_FILE, json, 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    } finally {
      this.isSaving = false;
      if (this.savePending) {
        this.savePending = false;
        this.persist();
      }
    }
  }

  // --- Users Table ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public insertUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.users[index];
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    // Also remove user sessions and saved activities
    this.data.sessions = this.data.sessions.filter(s => s.userId !== id);
    this.data.savedActivities = this.data.savedActivities.filter(sa => sa.userId !== id);
    this.persist();
    return this.data.users.length < initialLen;
  }

  // --- Activities Table ---
  public getActivities(): Activity[] {
    return this.data.activities;
  }

  public getActivityById(id: number): Activity | undefined {
    return this.data.activities.find(a => a.id === id);
  }

  public insertActivity(activity: Activity): Activity {
    if (!activity.id) {
      const maxId = this.data.activities.reduce((max, a) => Math.max(max, a.id), 0);
      activity.id = maxId + 1;
    }
    this.data.activities.push(activity);
    this.persist();
    return activity;
  }

  public updateActivity(id: number, updates: Partial<Activity>): Activity | null {
    const index = this.data.activities.findIndex(a => a.id === id);
    if (index === -1) return null;

    this.data.activities[index] = {
      ...this.data.activities[index],
      ...updates
    };
    this.persist();
    return this.data.activities[index];
  }

  public deleteActivity(id: number): boolean {
    const initialLen = this.data.activities.length;
    this.data.activities = this.data.activities.filter(a => a.id !== id);
    this.persist();
    return this.data.activities.length < initialLen;
  }

  // --- Activity Packs Table ---
  public getPacks(): ActivityPack[] {
    return this.data.packs;
  }

  public getPackById(id: number): ActivityPack | undefined {
    return this.data.packs.find(p => p.id === id);
  }

  public insertPack(pack: ActivityPack): ActivityPack {
    if (!pack.id) {
      const maxId = this.data.packs.reduce((max, p) => Math.max(max, p.id), 0);
      pack.id = maxId + 1;
    }
    this.data.packs.push(pack);
    this.persist();
    return pack;
  }

  public updatePack(id: number, updates: Partial<ActivityPack>): ActivityPack | null {
    const index = this.data.packs.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.data.packs[index] = {
      ...this.data.packs[index],
      ...updates
    };
    this.persist();
    return this.data.packs[index];
  }

  public deletePack(id: number): boolean {
    const initialLen = this.data.packs.length;
    this.data.packs = this.data.packs.filter(p => p.id !== id);
    this.persist();
    return this.data.packs.length < initialLen;
  }

  // --- Sessions Table ---
  public getSessions(userId?: string): Session[] {
    if (userId) {
      return this.data.sessions.filter(s => s.userId === userId);
    }
    return this.data.sessions;
  }

  public getSessionById(id: string): Session | undefined {
    return this.data.sessions.find(s => s.id === id);
  }

  public insertSession(session: Session): Session {
    this.data.sessions.push(session);
    this.persist();
    return session;
  }

  public updateSession(id: string, updates: Partial<Session>): Session | null {
    const index = this.data.sessions.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.data.sessions[index] = {
      ...this.data.sessions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.sessions[index];
  }

  public deleteSession(id: string): boolean {
    const initialLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter(s => s.id !== id);
    this.persist();
    return this.data.sessions.length < initialLen;
  }

  // --- Saved Activities Table ---
  public getSavedActivities(userId: string): number[] {
    return this.data.savedActivities
      .filter(sa => sa.userId === userId)
      .map(sa => sa.activityId);
  }

  public toggleSaveActivity(userId: string, activityId: number): { isSaved: boolean; savedIds: number[] } {
    const existsIndex = this.data.savedActivities.findIndex(
      sa => sa.userId === userId && sa.activityId === activityId
    );

    let isSaved = false;
    if (existsIndex >= 0) {
      this.data.savedActivities.splice(existsIndex, 1);
      isSaved = false;
    } else {
      this.data.savedActivities.push({
        id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        activityId,
        createdAt: new Date().toISOString()
      });
      isSaved = true;
    }
    this.persist();
    const savedIds = this.getSavedActivities(userId);
    return { isSaved, savedIds };
  }

  // --- Audit Logs Table ---
  public getAuditLogs(limit: number = 100): AuditLog[] {
    return [...this.data.auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public insertAuditLog(action: string, details: string, userId?: string, userName?: string, ipAddress?: string): AuditLog {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      userName,
      action,
      details,
      ipAddress,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.push(log);
    // Keep max 500 audit logs to prevent excessive file size
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(-500);
    }
    this.persist();
    return log;
  }

  public resetData(newData: DatabaseSchema): void {
    this.data = newData;
    this.persist();
  }
}

export const db = new Database();
