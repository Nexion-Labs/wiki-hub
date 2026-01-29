import { createServerFn } from '@tanstack/react-start';
import { EOLService } from '../services/eol.service';
import type { ExpiringVersionsFilter } from '../../types/eol';

const eolService = new EOLService();

// List all products
export const listProducts = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const products = await eolService.listProducts();
      return { success: true, data: products };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list products';
      return { success: false, error: message };
    }
  });

// Get product by slug
export const getProduct = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    try {
      const product = await eolService.getProduct(data.slug);
      return { success: true, data: product };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Product not found';
      return { success: false, error: message, data: null };
    }
  });

// Get versions by product ID
export const getVersionsByProduct = createServerFn({ method: 'GET' })
  .inputValidator((data: { productId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const versions = await eolService.getVersionsByProduct(data.productId);
      return { success: true, data: versions };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get versions';
      return { success: false, error: message };
    }
  });

// Get expiring versions
export const getExpiringVersions = createServerFn({ method: 'GET' })
  .inputValidator((data: { daysAhead: number }) => data)
  .handler(async ({ data }) => {
    try {
      const versions = await eolService.getNearExpiringVersions(data.daysAhead);
      return { success: true, data: versions };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get expiring versions';
      return { success: false, error: message };
    }
  });

// Get expiring versions with advanced filters
export const getExpiringVersionsWithFilters = createServerFn({ method: 'GET' })
  .inputValidator((data: { filters: ExpiringVersionsFilter }) => data)
  .handler(async ({ data }) => {
    try {
      const versions = await eolService.getExpiringVersionsWithFilters(data.filters);
      return { success: true, data: versions };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get expiring versions';
      return { success: false, error: message };
    }
  });

// Create product (admin only)
export const createProductFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string; vendor?: string; description?: string; categoryId: string; homepageUrl?: string; documentationUrl?: string; commandGuide?: string; userId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const { userId, ...productData } = data;
      const product = await eolService.createProduct(productData, userId);
      return { success: true, data: product };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create product';
      return { success: false, error: message, data: null };
    }
  });

// Update product (admin only)
export const updateProductFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; name?: string; vendor?: string; description?: string; categoryId?: string; homepageUrl?: string; documentationUrl?: string; commandGuide?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const { id, ...updateData } = data;
      const product = await eolService.updateProduct(id, updateData);
      return { success: true, data: product };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update product';
      return { success: false, error: message, data: null };
    }
  });

// Delete product (admin only)
export const deleteProductFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    try {
      await eolService.deleteProduct(data.id);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete product';
      return { success: false, error: message };
    }
  });

// Create version
export const createVersionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { productId: string; version: string; eolDate?: string; releaseDate?: string; extendedSupportDate?: string; lts?: boolean; lifecycleStage?: string; userId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const { userId, ...versionData } = data;
      const version = await eolService.createVersion(versionData, userId);
      return { success: true, data: version };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create version';
      return { success: false, error: message, data: null };
    }
  });

// Update version
export const updateVersionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; version?: string; eolDate?: string; releaseDate?: string; extendedSupportDate?: string; lts?: boolean; lifecycleStage?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const { id, ...updateData } = data;
      const version = await eolService.updateVersion(id, updateData);
      return { success: true, data: version };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update version';
      return { success: false, error: message, data: null };
    }
  });

// Delete version
export const deleteVersionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    try {
      await eolService.deleteVersion(data.id);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete version';
      return { success: false, error: message };
    }
  });

// Get EOL dashboard summary
export const getEOLDashboardSummary = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const summary = await eolService.getDashboardSummary();
      return { success: true, data: summary };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get dashboard summary';
      return { success: false, error: message };
    }
  });
