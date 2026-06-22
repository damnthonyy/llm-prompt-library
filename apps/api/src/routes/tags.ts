import { Router } from 'express';
import type { TagsResponse } from '@repo/shared';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { parseTags } from '../lib/tags.js';

export const tagsRouter: Router = Router();

// GET /tags — distinct, alphabetically sorted list of all tags in use (public).
// Tags live in a JSON column, so we aggregate them in JS.
tagsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.prompt.findMany({ select: { tags: true } });
    const unique = new Set<string>();
    for (const row of rows) {
      for (const t of parseTags(row.tags)) unique.add(t);
    }
    const body: TagsResponse = { tags: [...unique].sort((a, b) => a.localeCompare(b)) };
    res.json(body);
  }),
);
