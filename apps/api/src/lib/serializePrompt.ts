import type { Prompt as PrismaPrompt } from '@prisma/client';
import type { Prompt } from '@repo/shared';
import { parseTags } from './tags.js';

/** Map a Prisma Prompt row to the public API shape (tags parsed, dates ISO). */
export function serializePrompt(p: PrismaPrompt): Prompt {
  return {
    id: p.id,
    title: p.title,
    body: p.body,
    tags: parseTags(p.tags),
    authorId: p.authorId,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
