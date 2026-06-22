import { z } from 'zod';

/**
 * Single source of truth for the wire format.
 * The API validates requests with these schemas; the web client infers its
 * types from them (see ./types.ts). Keep this file framework-agnostic.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export const emailSchema = z.string().trim().toLowerCase().email();

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128);

/** A tag: trimmed, lowercased, url/display-friendly. */
export const tagSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Tag cannot be empty')
  .max(30, 'Tag must be 30 characters or fewer');

export const tagsSchema = z
  .array(tagSchema)
  .max(10, 'A prompt can have at most 10 tags')
  // de-duplicate while preserving order
  .transform((tags) => [...new Set(tags)])
  .default([]);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const registerInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const publicUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  createdAt: z.string(), // ISO 8601
});

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

export const promptSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  authorId: z.string(),
  createdAt: z.string(), // ISO 8601
  updatedAt: z.string(), // ISO 8601
});

export const createPromptInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  body: z.string().trim().min(1, 'Body is required').max(20_000),
  tags: tagsSchema,
});

// All fields optional for PATCH semantics, but at least one must be present.
export const updatePromptInputSchema = createPromptInputSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

// ---------------------------------------------------------------------------
// List query (search / tag filter / pagination)
// ---------------------------------------------------------------------------

export const listPromptsQuerySchema = z.object({
  q: z.string().trim().optional(),
  tag: tagSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ---------------------------------------------------------------------------
// Generic paginated envelope
// ---------------------------------------------------------------------------

export const paginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  hasNextPage: z.boolean(),
});
