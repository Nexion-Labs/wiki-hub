import { db } from '../db/client';
import { tags } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import type { NewTag, Tag } from '../db/schema';

export class TagRepository {
  async create(data: NewTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(data).returning();
    return tag;
  }

  async findBySlug(slug: string) {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);
    return tag;
  }

  async findById(id: string) {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    return tag;
  }

  async findAll() {
    return await db.select().from(tags).orderBy(desc(tags.usageCount));
  }

  async update(id: string, data: Partial<Tag>) {
    const [tag] = await db
      .update(tags)
      .set(data)
      .where(eq(tags.id, id))
      .returning();
    return tag;
  }

  async delete(id: string) {
    await db.delete(tags).where(eq(tags.id, id));
  }

  async findOrCreate(name: string): Promise<Tag> {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const existing = await this.findBySlug(slug);

    if (existing) {
      return existing;
    }

    return await this.create({ name, slug, usageCount: 0 });
  }
}

export const tagRepository = new TagRepository();
