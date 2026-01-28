import { db } from '../db/client';
import { eolProducts, eolVersions, eolAlerts } from '../db/schema';
import { eq, and, desc, lt, inArray, gte, lte, or, sql } from 'drizzle-orm';
import type { NewEOLProduct, NewEOLVersion, NewEOLAlert } from '../db/schema';
import { LifecycleStage, type ExpiringVersionsFilter, UrgencyLevel } from '../../types/eol';

export class EOLRepository {
  // Product methods
  async createProduct(data: NewEOLProduct) {
    const [product] = await db.insert(eolProducts).values(data).returning();
    return product;
  }

  async findProductBySlug(slug: string) {
    const [product] = await db
      .select()
      .from(eolProducts)
      .where(eq(eolProducts.slug, slug))
      .limit(1);
    return product;
  }

  async findProductById(id: string) {
    const [product] = await db
      .select()
      .from(eolProducts)
      .where(eq(eolProducts.id, id))
      .limit(1);
    return product;
  }

  async findAllProducts(limit = 50, offset = 0) {
    return await db
      .select()
      .from(eolProducts)
      .where(eq(eolProducts.isActive, true))
      .orderBy(desc(eolProducts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateProduct(id: string, data: Partial<NewEOLProduct>) {
    const [product] = await db
      .update(eolProducts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(eolProducts.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string) {
    await db
      .update(eolProducts)
      .set({ isActive: false })
      .where(eq(eolProducts.id, id));
  }

  // Version methods
  async createVersion(data: NewEOLVersion) {
    const [version] = await db.insert(eolVersions).values(data).returning();
    return version;
  }

  async findVersionsByProduct(productId: string) {
    return await db
      .select()
      .from(eolVersions)
      .where(eq(eolVersions.productId, productId))
      .orderBy(desc(eolVersions.releaseDate));
  }

  async findVersionsByProductIds(productIds: string[]) {
    return await db
      .select()
      .from(eolVersions)
      .where(inArray(eolVersions.productId, productIds))
      .orderBy(desc(eolVersions.releaseDate));
  }

  async findVersionById(id: string) {
    const [version] = await db
      .select()
      .from(eolVersions)
      .where(eq(eolVersions.id, id))
      .limit(1);
    return version;
  }

  async findExpiringVersions(daysAhead: number = 90) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await db
      .select()
      .from(eolVersions)
      .where(lt(eolVersions.eolDate, futureDate.toISOString().split('T')[0]))
      .orderBy(eolVersions.eolDate);
  }

  async findNearExpiringVersions(daysAhead: number = 90) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await db
      .select()
      .from(eolVersions)
      .where(
        and(
          gte(eolVersions.eolDate, sql`CURRENT_DATE`),
          lt(eolVersions.eolDate, futureDate.toISOString().split('T')[0])
        )
      )
      .orderBy(eolVersions.eolDate);
  }

  // Advanced expiring versions query with filters
  async findExpiringVersionsWithFilters(filters: ExpiringVersionsFilter = {}) {
    const {
      daysAhead = 90,
      urgencyLevels,
      productIds,
      categoryIds,
      ltsOnly,
      lifecycleStages,
      includeExpired = false,
      limit,
      offset,
    } = filters;

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    // Build WHERE conditions
    const conditions: any[] = [];

    // Date range filter
    if (includeExpired) {
      conditions.push(lte(eolVersions.eolDate, futureDateStr));
    } else {
      conditions.push(
        and(
          gte(eolVersions.eolDate, todayStr),
          lte(eolVersions.eolDate, futureDateStr)
        )
      );
    }

    // Urgency level filter (based on days remaining)
    if (urgencyLevels && urgencyLevels.length > 0) {
      const urgencyConditions: any[] = [];

      urgencyLevels.forEach((level) => {
        const now = new Date();
        let minDate: Date, maxDate: Date;

        switch (level) {
          case UrgencyLevel.CRITICAL:
            // < 30 days
            minDate = now;
            maxDate = new Date(now);
            maxDate.setDate(maxDate.getDate() + 30);
            urgencyConditions.push(
              and(
                gte(eolVersions.eolDate, minDate.toISOString().split('T')[0]),
                lt(eolVersions.eolDate, maxDate.toISOString().split('T')[0])
              )
            );
            break;
          case UrgencyLevel.WARNING:
            // 30-60 days
            minDate = new Date(now);
            minDate.setDate(minDate.getDate() + 30);
            maxDate = new Date(now);
            maxDate.setDate(maxDate.getDate() + 60);
            urgencyConditions.push(
              and(
                gte(eolVersions.eolDate, minDate.toISOString().split('T')[0]),
                lt(eolVersions.eolDate, maxDate.toISOString().split('T')[0])
              )
            );
            break;
          case UrgencyLevel.ATTENTION:
            // 60-90 days
            minDate = new Date(now);
            minDate.setDate(minDate.getDate() + 60);
            maxDate = new Date(now);
            maxDate.setDate(maxDate.getDate() + 90);
            urgencyConditions.push(
              and(
                gte(eolVersions.eolDate, minDate.toISOString().split('T')[0]),
                lte(eolVersions.eolDate, maxDate.toISOString().split('T')[0])
              )
            );
            break;
        }
      });

      if (urgencyConditions.length > 0) {
        conditions.push(or(...urgencyConditions));
      }
    }

    // LTS filter
    if (ltsOnly !== undefined) {
      conditions.push(eq(eolVersions.lts, ltsOnly));
    }

    // Lifecycle stages filter
    if (lifecycleStages && lifecycleStages.length > 0) {
      conditions.push(inArray(eolVersions.lifecycleStage, lifecycleStages));
    }

    // Product IDs filter
    if (productIds && productIds.length > 0) {
      conditions.push(inArray(eolVersions.productId, productIds));
    }

    // Build the base query
    let query = db
      .select()
      .from(eolVersions)
      .orderBy(eolVersions.eolDate);

    // Apply WHERE conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Apply pagination
    if (limit !== undefined) {
      query = query.limit(limit) as any;
    }
    if (offset !== undefined) {
      query = query.offset(offset) as any;
    }

    let results = await query;

    // Filter by category (requires JOIN, so we do it post-query for simplicity)
    if (categoryIds && categoryIds.length > 0) {
      const productIdsInCategories = await db
        .select({ id: eolProducts.id })
        .from(eolProducts)
        .where(inArray(eolProducts.categoryId, categoryIds));

      const productIdSet = new Set(productIdsInCategories.map((p) => p.id));
      results = results.filter((v) => productIdSet.has(v.productId));
    }

    return results;
  }

  async updateVersion(id: string, data: Partial<NewEOLVersion>) {
    const [version] = await db
      .update(eolVersions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(eolVersions.id, id))
      .returning();
    return version;
  }

  async deleteVersion(id: string) {
    await db.delete(eolVersions).where(eq(eolVersions.id, id));
  }

  // Alert methods
  async createAlert(data: NewEOLAlert) {
    const [alert] = await db.insert(eolAlerts).values(data).returning();
    return alert;
  }

  async findAlertsByUser(userId: string) {
    return await db
      .select()
      .from(eolAlerts)
      .where(and(eq(eolAlerts.userId, userId), eq(eolAlerts.isActive, true)));
  }

  async deleteAlert(id: string) {
    await db.delete(eolAlerts).where(eq(eolAlerts.id, id));
  }

  async findAlertByUserAndVersion(userId: string, versionId: string) {
    const [alert] = await db
      .select()
      .from(eolAlerts)
      .where(
        and(eq(eolAlerts.userId, userId), eq(eolAlerts.versionId, versionId))
      )
      .limit(1);
    return alert;
  }

  // Dashboard summary queries
  async countAllVersions() {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(eolVersions);
    return Number(result[0]?.count || 0);
  }

  async countVersionsByLifecycle() {
    const results = await db
      .select({
        lifecycleStage: eolVersions.lifecycleStage,
        count: sql<number>`count(*)`,
      })
      .from(eolVersions)
      .groupBy(eolVersions.lifecycleStage);

    return results.reduce((acc, row) => {
      acc[row.lifecycleStage] = Number(row.count);
      return acc;
    }, {} as Record<string, number>);
  }

  async countLTSVersions() {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(eolVersions)
      .where(eq(eolVersions.lts, true));
    return Number(result[0]?.count || 0);
  }

  async findRecentlyExpiredVersions(limit = 10) {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await db
      .select()
      .from(eolVersions)
      .where(
        and(
          lt(eolVersions.eolDate, today),
          gte(eolVersions.eolDate, thirtyDaysAgo.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(eolVersions.eolDate))
      .limit(limit);
  }

  async findUpcomingEOLVersions(limit = 10) {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);

    return await db
      .select()
      .from(eolVersions)
      .where(
        and(
          gte(eolVersions.eolDate, today),
          lte(eolVersions.eolDate, thirtyDaysAhead.toISOString().split('T')[0])
        )
      )
      .orderBy(eolVersions.eolDate)
      .limit(limit);
  }

  async countProductsByCategory() {
    const results = await db
      .select({
        categoryId: eolProducts.categoryId,
        count: sql<number>`count(*)`,
      })
      .from(eolProducts)
      .where(eq(eolProducts.isActive, true))
      .groupBy(eolProducts.categoryId);

    return results;
  }
}

export const eolRepository = new EOLRepository();
