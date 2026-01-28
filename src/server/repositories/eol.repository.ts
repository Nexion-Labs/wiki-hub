import { db } from '../db/client';
import { eolProducts, eolVersions, eolAlerts } from '../db/schema';
import { eq, and, desc, lt, inArray } from 'drizzle-orm';
import type { NewEOLProduct, NewEOLVersion, NewEOLAlert } from '../db/schema';
import { LifecycleStage } from '../../types/eol';

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
      .where(
        and(
          lt(eolVersions.eolDate, futureDate.toISOString().split('T')[0]),
          eq(eolVersions.lifecycleStage, LifecycleStage.ACTIVE)
        )
      );
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
}

export const eolRepository = new EOLRepository();
