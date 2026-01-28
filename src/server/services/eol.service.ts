import { eolRepository } from '../repositories/eol.repository';
import { generateSlug, generateUniqueSlug } from '../utils/slug';
import { NotFoundError, ConflictError } from '../utils/errors';
import type { ExpiringVersionsFilter, EOLDashboardSummary } from '../../types/eol';

export class EOLService {
  async createProduct(data: any, userId: string) {
    const baseSlug = generateSlug(data.name);
    const existingProducts = await eolRepository.findAllProducts(1000);
    const existingSlugs = existingProducts.map((p) => p.slug);
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    return await eolRepository.createProduct({
      ...data,
      slug: uniqueSlug,
      createdBy: userId,
      isActive: true,
    });
  }

  async getProduct(slug: string) {
    const product = await eolRepository.findProductBySlug(slug);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async listProducts(limit = 50, offset = 0) {
    const products = await eolRepository.findAllProducts(limit, offset);
    const productIds = products.map((p) => p.id);
    const versions = await eolRepository.findVersionsByProductIds(productIds);
    const versionsCount = versions.reduce((acc, version) => {
      acc[version.productId] = (acc[version.productId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return products.map((product) => {
      return {
        ...product,
        versionsCount: versionsCount[product.id] || 0,
      };
    });
  }

  async updateProduct(id: string, data: any) {
    const product = await eolRepository.findProductById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return await eolRepository.updateProduct(id, data);
  }

  async deleteProduct(id: string) {
    await eolRepository.deleteProduct(id);
  }

  // Version methods
  async createVersion(data: any, userId: string) {
    const { version, ...rest } = data;
    return await eolRepository.createVersion({
      ...rest,
      versionNumber: version,
      createdBy: userId,
    });
  }

  async getVersionsByProduct(productId: string) {
    return await eolRepository.findVersionsByProduct(productId);
  }

  async getExpiringVersions(daysAhead = 90) {
    const versions = await eolRepository.findExpiringVersions(daysAhead);
    const products = await eolRepository.findAllProducts(1000);
    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {} as Record<string, any>);

    const versionsWithProducts = versions.map((version) => {
      const product = productMap[version.productId];
      return { ...version, product };
    });
    return versionsWithProducts;
  }

  async getNearExpiringVersions(daysAhead = 90) {
    const versions = await eolRepository.findNearExpiringVersions(daysAhead);
  const products = await eolRepository.findAllProducts(1000);
    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {} as Record<string, any>);

    const versionsWithProducts = versions.map((version) => {
      const product = productMap[version.productId];
      return { ...version, product };
    });
    return versionsWithProducts;
  }

  async getExpiringVersionsWithFilters(filters: ExpiringVersionsFilter) {
    const versions = await eolRepository.findExpiringVersionsWithFilters(filters);

    // Get all products to attach to versions
    const productIds = [...new Set(versions.map((v) => v.productId))];
    const products = await Promise.all(
      productIds.map((id) => eolRepository.findProductById(id))
    );

    const productMap = products.reduce((acc, product) => {
      if (product) {
        acc[product.id] = product;
      }
      return acc;
    }, {} as Record<string, any>);

    // Calculate urgency level and days remaining for each version
    const versionsWithDetails = versions.map((version) => {
      const product = productMap[version.productId];
      const daysUntilEol = version.eolDate
        ? Math.ceil((new Date(version.eolDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      let urgencyLevel: string = 'safe';
      if (daysUntilEol !== null) {
        if (daysUntilEol < 0) urgencyLevel = 'expired';
        else if (daysUntilEol < 30) urgencyLevel = 'critical';
        else if (daysUntilEol <= 60) urgencyLevel = 'warning';
        else if (daysUntilEol <= 90) urgencyLevel = 'attention';
      }

      return {
        ...version,
        product,
        daysUntilEol,
        urgencyLevel,
      };
    });

    return versionsWithDetails;
  }

  async updateVersion(id: string, data: any) {
    const { version, ...rest } = data;
    const updateData = version ? { ...rest, versionNumber: version } : rest;
    return await eolRepository.updateVersion(id, updateData);
  }

  async deleteVersion(id: string) {
    await eolRepository.deleteVersion(id);
  }

  // Alert methods
  async subscribeToAlert(userId: string, versionId: string, alertDaysBefore = 90) {
    const existing = await eolRepository.findAlertByUserAndVersion(
      userId,
      versionId
    );
    if (existing) {
      throw new ConflictError('Already subscribed to this version');
    }

    return await eolRepository.createAlert({
      userId,
      versionId,
      alertDaysBefore,
      isActive: true,
    });
  }

  async getUserAlerts(userId: string) {
    return await eolRepository.findAlertsByUser(userId);
  }

  async unsubscribeFromAlert(alertId: string) {
    await eolRepository.deleteAlert(alertId);
  }

  // Dashboard summary
  async getDashboardSummary(): Promise<EOLDashboardSummary> {
    // Run queries in parallel for better performance
    const [
      products,
      totalVersions,
      versionsByLifecycle,
      totalLTSVersions,
      nearExpiringVersions,
      recentlyExpiredVersions,
      upcomingEOLVersions,
      productsByCategory,
    ] = await Promise.all([
      eolRepository.findAllProducts(1000),
      eolRepository.countAllVersions(),
      eolRepository.countVersionsByLifecycle(),
      eolRepository.countLTSVersions(),
      eolRepository.findNearExpiringVersions(90),
      eolRepository.findRecentlyExpiredVersions(10),
      eolRepository.findUpcomingEOLVersions(10),
      eolRepository.countProductsByCategory(),
    ]);

    // Calculate urgency levels for expiring versions
    const calculateDaysUntil = (eolDate: string) =>
      Math.ceil((new Date(eolDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const expiringVersionsWithUrgency = nearExpiringVersions.map((v) => ({
      ...v,
      daysUntilEol: calculateDaysUntil(v.eolDate),
    }));

    const criticalVersions = expiringVersionsWithUrgency.filter((v) => v.daysUntilEol < 30);
    const warningVersions = expiringVersionsWithUrgency.filter(
      (v) => v.daysUntilEol >= 30 && v.daysUntilEol <= 60
    );
    const attentionVersions = expiringVersionsWithUrgency.filter(
      (v) => v.daysUntilEol > 60 && v.daysUntilEol <= 90
    );
    const ltsExpiringVersions = expiringVersionsWithUrgency.filter((v) => v.lts);
    const activeLTSVersions = await eolRepository.findExpiringVersionsWithFilters({
      ltsOnly: true,
      lifecycleStages: ['active' as any],
    });

    // Get all expired versions
    const allVersions = await eolRepository.findExpiringVersions(9999);
    const expiredVersions = allVersions.filter((v) => calculateDaysUntil(v.eolDate) < 0);

    // Build product map
    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {} as Record<string, any>);

    // Calculate top expiring products
    const productExpiringMap = new Map<string, { count: number; criticalCount: number; versions: any[] }>();

    nearExpiringVersions.forEach((v) => {
      const existing = productExpiringMap.get(v.productId) || { count: 0, criticalCount: 0, versions: [] };
      existing.count += 1;
      existing.versions.push(v);
      if (calculateDaysUntil(v.eolDate) < 30) {
        existing.criticalCount += 1;
      }
      productExpiringMap.set(v.productId, existing);
    });

    const topExpiringProducts = Array.from(productExpiringMap.entries())
      .map(([productId, data]) => {
        const product = productMap[productId];
        const oldestVersion = data.versions.sort(
          (a, b) => new Date(a.eolDate).getTime() - new Date(b.eolDate).getTime()
        )[0];

        return {
          productId,
          productName: product?.name || 'Unknown',
          slug: product?.slug || '',
          categoryId: product?.categoryId || '',
          expiringCount: data.count,
          criticalCount: data.criticalCount,
          oldestExpiringVersion: {
            versionNumber: oldestVersion.versionNumber,
            eolDate: oldestVersion.eolDate,
            daysUntilEol: calculateDaysUntil(oldestVersion.eolDate),
          },
        };
      })
      .sort((a, b) => b.criticalCount - a.criticalCount || b.expiringCount - a.expiringCount)
      .slice(0, 5);

    // Get EOL categories with expiring count
    const { eolCategoryService } = await import('./eol-category.service');
    const categoriesResult = await eolCategoryService.getAllCategories(100, 0);
    const categories = categoriesResult.items;

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, any>);

    // Calculate expiring count by category
    const categoryExpiringMap = new Map<string, number>();
    nearExpiringVersions.forEach((v) => {
      const product = productMap[v.productId];
      if (product?.categoryId) {
        const count = categoryExpiringMap.get(product.categoryId) || 0;
        categoryExpiringMap.set(product.categoryId, count + 1);
      }
    });

    const topCategories: any[] = productsByCategory
      .map((item) => {
        const category = categoryMap[item.categoryId!];
        return {
          categoryId: item.categoryId,
          categoryName: category?.name || 'Unknown',
          categoryIcon: category?.icon || '📦',
          productCount: Number(item.count),
          expiringCount: categoryExpiringMap.get(item.categoryId!) || 0,
        };
      })
      .filter((c) => c.categoryId) // Remove null categories
      .sort((a, b) => b.expiringCount - a.expiringCount || b.productCount - a.productCount)
      .slice(0, 5);

    // Format recently expired versions
    const recentlyExpiredFormatted = recentlyExpiredVersions.slice(0, 5).map((v) => ({
      versionId: v.id,
      productName: productMap[v.productId]?.name || 'Unknown',
      versionNumber: v.versionNumber,
      eolDate: v.eolDate,
    }));

    // Format upcoming EOL versions
    const upcomingEOLFormatted = upcomingEOLVersions.map((v) => ({
      versionId: v.id,
      productName: productMap[v.productId]?.name || 'Unknown',
      versionNumber: v.versionNumber,
      eolDate: v.eolDate,
      daysUntilEol: calculateDaysUntil(v.eolDate),
      isLts: v.lts,
    }));

    return {
      totalProducts: products.length,
      totalVersions,
      activeProducts: products.filter((p) => p.isActive).length,

      expiringVersions: {
        total: nearExpiringVersions.length,
        critical: criticalVersions.length,
        warning: warningVersions.length,
        attention: attentionVersions.length,
        expired: expiredVersions.length,
      },

      ltsVersions: {
        total: totalLTSVersions,
        expiring: ltsExpiringVersions.length,
        active: activeLTSVersions.length,
      },

      versionsByLifecycle: {
        active: versionsByLifecycle['active'] || 0,
        maintenance: versionsByLifecycle['maintenance'] || 0,
        deprecated: versionsByLifecycle['deprecated'] || 0,
        eol: versionsByLifecycle['eol'] || 0,
      },

      topCategories,
      topExpiringProducts,
      recentlyExpired: recentlyExpiredFormatted,
      upcomingEOL: upcomingEOLFormatted,
    };
  }
}

export const eolService = new EOLService();
