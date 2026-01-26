import { db } from '../db/client';
import { users, roles, sessions } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import type { User, NewUser, Session, NewSession } from '../db/schema';

export class UserRepository {
  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  async findByUsername(username: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return user;
  }

  async findById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  async findByIdWithRole(id: string) {
    const [result] = await db
      .select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, id))
      .limit(1);

    if (!result) return null;

    return {
      ...result.users,
      role: result.roles,
    };
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async findAll(limit = 50, offset = 0) {
    return await db
      .select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .limit(limit)
      .offset(offset);
  }

  // Session methods
  async createSession(data: NewSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(data).returning();
    return session;
  }

  async findSessionByToken(token: string) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.refreshToken, token), eq(sessions.isActive, true)))
      .limit(1);
    return session;
  }

  async invalidateSession(token: string): Promise<void> {
    await db
      .update(sessions)
      .set({ isActive: false })
      .where(eq(sessions.refreshToken, token));
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ isActive: false })
      .where(eq(sessions.userId, userId));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(eq(sessions.isActive, false));
  }
}

export const userRepository = new UserRepository();
