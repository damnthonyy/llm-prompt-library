import { Router } from 'express';
import type { Prompt as PrismaPrompt } from '@prisma/client';
import { createPromptInputSchema, updatePromptInputSchema } from '@repo/shared';
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

// GET /prompts — list all prompts (public). Search/pagination added in #7.
promptsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const prompts = await prisma.prompt.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(prompts.map(serializePrompt));
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
