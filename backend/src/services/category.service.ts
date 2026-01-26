import { categoryRepository } from '../repositories/category.repository';
import { generateSlug } from '../utils/slug';
import { NotFoundError, ConflictError } from '../utils/errors';

export class CategoryService {
  async createCategory(data: { name: string; description?: string; parentId?: string; color?: string; icon?: string }) {
    const slug = generateSlug(data.name);

    // Check if slug exists
    const existing = await categoryRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError('Category with this name already exists');
    }

    return await categoryRepository.create({
      ...data,
      slug,
      orderIndex: 0,
    });
  }

  async getCategory(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async listCategories() {
    return await categoryRepository.findAll();
  }

  async updateCategory(id: string, data: Partial<{ name: string; description?: string; color?: string; icon?: string }>) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const updateData: any = { ...data };

    if (data.name) {
      updateData.slug = generateSlug(data.name);
    }

    return await categoryRepository.update(id, updateData);
  }

  async deleteCategory(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    await categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();
