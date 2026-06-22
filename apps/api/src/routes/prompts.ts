import { Router } from 'express';
import { Prisma, type Prompt as PrismaPrompt } from '@prisma/client';
import {
  createPromptInputSchema,
  listPromptsQuerySchema,
  updatePromptInputSchema,
} from '@repo/shared';
import type { PromptsPage } from '@repo/shared';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../lib/httpError.js';
import { serializePrompt } from '../lib/serializePrompt.js';
import { stringifyTags } from '../lib/tags.js';
import { requireAuth } from '../middleware/auth.js';

export const promptsRouter: Router = Router();

/** Load a prompt by id, asserting it exists and is owned by the given user. */
async function loadOwnedPrompt(id: string, userId: string): Promise<PrismaPrompt> {
  const prompt = await prisma.prompt.findUnique({ where: { id } });
  if (!prompt) {
    throw HttpError.notFound('Prompt not found');
  }
  if (prompt.authorId !== userId) {
    throw HttpError.forbidden('You do not own this prompt');
  }
  return prompt;
}

// GET /prompts — list with optional search (?q=), tag filter (?tag=), and
// pagination (?page=&limit=). Public. Returns a Paginated<Prompt> envelope.
promptsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, tag, page, limit } = listPromptsQuerySchema.parse(req.query);

    const where: Prisma.PromptWhereInput = {};
    // SQLite `contains` compiles to LIKE, which is ASCII case-insensitive.
    if (q) {
      where.OR = [{ title: { contains: q } }, { body: { contains: q } }];
    }
    // Tags are a JSON string (e.g. ["a","b"]); match the quoted tag so "code"
    // doesn't match "coding".
    if (tag) {
      where.tags = { contains: JSON.stringify(tag) };
    }

    const [total, rows] = await prisma.$transaction([
      prisma.prompt.count({ where }),
      prisma.prompt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const body: PromptsPage = {
      data: rows.map(serializePrompt),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasNextPage: page * limit < total,
      },
    };
    res.json(body);
  }),
);

// GET /prompts/:id — fetch one (public).
promptsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const prompt = await prisma.prompt.findUnique({ where: { id: req.params.id! } });
    if (!prompt) {
      throw HttpError.notFound('Prompt not found');
    }
    res.json(serializePrompt(prompt));
  }),
);

// POST /prompts — create (auth required; owned by the caller).
promptsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createPromptInputSchema.parse(req.body);
    const prompt = await prisma.prompt.create({
      data: {
        title: input.title,
        body: input.body,
        tags: stringifyTags(input.tags),
        authorId: req.user!.id,
      },
    });
    res.status(201).json(serializePrompt(prompt));
  }),
);

// PATCH /prompts/:id — update (auth + ownership).
promptsRouter.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = req.params.id!;
    await loadOwnedPrompt(id, req.user!.id);
    const input = updatePromptInputSchema.parse(req.body);

    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.body !== undefined && { body: input.body }),
        ...(input.tags !== undefined && { tags: stringifyTags(input.tags) }),
      },
    });
    res.json(serializePrompt(prompt));
  }),
);

// DELETE /prompts/:id — delete (auth + ownership).
promptsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = req.params.id!;
    await loadOwnedPrompt(id, req.user!.id);
    await prisma.prompt.delete({ where: { id } });
    res.status(204).end();
  }),
);
