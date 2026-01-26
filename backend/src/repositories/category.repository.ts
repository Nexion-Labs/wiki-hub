import { db } from '../db/client';
import { categories } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { NewCategory, Category } from '../db/schema';

export class CategoryRepository {
  async create(data: NewCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  }

  async findBySlug(slug: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    return category;
  }

  async findById(id: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return category;
  }

  async findAll() {
    return await db.select().from(categories).orderBy(categories.orderIndex);
  }

  async update(id: string, data: Partial<Category>) {
    const [category] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async delete(id: string) {
    await db.delete(categories).where(eq(categories.id, id));
  }
}

export const categoryRepository = new CategoryRepository();
