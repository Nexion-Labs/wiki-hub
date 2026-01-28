import { eolRepository } from '../repositories/eol.repository';
import { generateSlug, generateUniqueSlug } from '../utils/slug';
import { NotFoundError, ConflictError } from '../utils/errors';

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
    return await eolRepository.findAllProducts(limit, offset,);
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
    return await eolRepository.findExpiringVersions(daysAhead);
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
}

export const eolService = new EOLService();
