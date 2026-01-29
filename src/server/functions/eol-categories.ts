import { createServerFn } from '@tanstack/react-start';
import { eolCategoryService } from '../services/eol-category.service';

// List all EOL categories
export const listEOLCategoriesFn = createServerFn({ method: 'GET' })
    .inputValidator((data: { limit?: number; page?: number } | undefined) => data)
    .handler(async ({ data }) => {
        try {
            const limit = data?.limit || 10;
            const page = data?.page || 1;
            const offset = (page - 1) * limit;

            const result = await eolCategoryService.getAllCategories(limit, offset);

            return {
                success: true,
                data: result.items,
                meta: {
                    total: result.total,
                    page,
                    limit,
                    totalPages: Math.ceil(result.total / limit)
                }
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to list categories';
            return { success: false, error: message };
        }
    });

// Create EOL category (admin only)
export const createEOLCategoryFn = createServerFn({ method: 'POST' })
    .inputValidator((data: { name: string; code: string; icon: string; description?: string }) => data)
    .handler(async ({ data }) => {
        try {
            const category = await eolCategoryService.createCategory(data);
            return { success: true, data: category };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create category';
            return { success: false, error: message };
        }
    });

// Update EOL category (admin only)
export const updateEOLCategoryFn = createServerFn({ method: 'POST' })
    .inputValidator((data: { id: string; name?: string; icon?: string; description?: string }) => data)
    .handler(async ({ data }) => {
        try {
            const { id, ...updateData } = data;
            const category = await eolCategoryService.updateCategory(id, updateData);
            return { success: true, data: category };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update category';
            return { success: false, error: message };
        }
    });

// Delete EOL category (admin only)
export const deleteEOLCategoryFn = createServerFn({ method: 'POST' })
    .inputValidator((data: { id: string }) => data)
    .handler(async ({ data }) => {
        try {
            await eolCategoryService.deleteCategory(data.id);
            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete category';
            return { success: false, error: message };
        }
    });
