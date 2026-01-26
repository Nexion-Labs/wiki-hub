import { z } from 'zod';

export const createWikiPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  contentMarkdown: z.string().min(1, 'Content is required'),
  categoryIds: z.array(z.string()).optional().default([]),
  tagIds: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(false),
});

export const updateWikiPageSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  contentMarkdown: z.string().min(1).optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  changeSummary: z.string().optional(),
});

export type CreateWikiPageInput = z.infer<typeof createWikiPageSchema>;
export type UpdateWikiPageInput = z.infer<typeof updateWikiPageSchema>;
