import { tagRepository } from '../repositories/tag.repository';
import { generateSlug } from '../utils/slug';
import { NotFoundError } from '../utils/errors';

export class TagService {
  async createTag(name: string) {
    const slug = generateSlug(name);
    return await tagRepository.create({
      name,
      slug,
      usageCount: 0,
    });
  }

  async getTag(slug: string) {
    const tag = await tagRepository.findBySlug(slug);
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }
    return tag;
  }

  async listTags() {
    return await tagRepository.findAll();
  }

  async deleteTag(id: string) {
    const tag = await tagRepository.findById(id);
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    // Only delete if not in use
    if (tag.usageCount > 0) {
      throw new Error('Cannot delete tag that is in use');
    }

    await tagRepository.delete(id);
  }

  async findOrCreateTags(names: string[]) {
    const tags = [];
    for (const name of names) {
      const tag = await tagRepository.findOrCreate(name);
      tags.push(tag);
    }
    return tags;
  }
}

export const tagService = new TagService();
