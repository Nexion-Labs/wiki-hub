import { db } from '../db/client';
import { roles } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Role } from '../db/schema';

export class RoleRepository {
  async findByName(name: string): Promise<Role | undefined> {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);
    return role;
  }

  async findById(id: string): Promise<Role | undefined> {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);
    return role;
  }

  async findAll(): Promise<Role[]> {
    return await db.select().from(roles);
  }
}

export const roleRepository = new RoleRepository();
