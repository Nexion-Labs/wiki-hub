import { eolCategoryRepository } from '../repositories/eol-category.repository';

export class EOLCategoryService {
    async getAllCategories(limit?: number, offset?: number) {
        return await eolCategoryRepository.findAll(limit, offset);
    }

    async createCategory(data: { name: string; code: string; icon: string; description?: string }) {
        const existing = await eolCategoryRepository.findByCode(data.code);
        if (existing) {
            throw new Error('Category code already exists');
        }
        return await eolCategoryRepository.create(data);
    }

    async updateCategory(id: string, data: { name?: string; icon?: string; description?: string }) {
        return await eolCategoryRepository.update(id, data);
    }

    async deleteCategory(id: string) {
        return await eolCategoryRepository.delete(id);
    }
}

export const eolCategoryService = new EOLCategoryService();
