import { db } from '../db/client';
import { eolCategories } from '../db/schema/eol';
import { eq, desc, sql } from 'drizzle-orm';
import type { NewEOLCategory } from '../db/schema/eol';

export class EOLCategoryRepository {
    async findAll(limit?: number, offset?: number) {
        let query = db.select().from(eolCategories).orderBy(desc(eolCategories.createdAt));

        if (limit) {
            query = query.limit(limit) as any;
        }

        if (offset) {
            query = query.offset(offset) as any;
        }

        const items = await query;

        // Get total count
        const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(eolCategories);

        return {
            items,
            total: Number(countResult.count)
        };
    }

    async findByCode(code: string) {
        const [result] = await db
            .select()
            .from(eolCategories)
            .where(eq(eolCategories.code, code))
            .limit(1);
        return result;
    }

    async create(data: NewEOLCategory) {
        const [result] = await db.insert(eolCategories).values(data).returning();
        return result;
    }

    async update(id: string, data: Partial<NewEOLCategory>) {
        const [result] = await db
            .update(eolCategories)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(eolCategories.id, id))
            .returning();
        return result;
    }

    async delete(id: string) {
        await db.delete(eolCategories).where(eq(eolCategories.id, id));
    }
}

export const eolCategoryRepository = new EOLCategoryRepository();
