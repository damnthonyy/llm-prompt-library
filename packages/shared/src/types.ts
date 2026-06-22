import type { z } from 'zod';
import type {
  registerInputSchema,
  loginInputSchema,
  publicUserSchema,
  promptSchema,
  createPromptInputSchema,
  updatePromptInputSchema,
  listPromptsQuerySchema,
  paginationMetaSchema,
} from './schemas.js';

// Domain entities -----------------------------------------------------------

/** A user as exposed to clients (never includes the password hash). */
export type PublicUser = z.infer<typeof publicUserSchema>;

/** A prompt as returned by the API. */
export type Prompt = z.infer<typeof promptSchema>;

// Request inputs ------------------------------------------------------------

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type CreatePromptInput = z.infer<typeof createPromptInputSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptInputSchema>;

/** Input shape of the prompt list query, after coercion + defaults. */
export type ListPromptsQuery = z.infer<typeof listPromptsQuerySchema>;

// Responses -----------------------------------------------------------------

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/** Generic envelope for paginated list endpoints. */
export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export type PromptsPage = Paginated<Prompt>;

export interface AuthResponse {
  user: PublicUser;
}

export interface TagsResponse {
  tags: string[];
}

/** Shape of error responses from the API. */
export interface ApiError {
  error: {
    message: string;
    /** Field-level validation issues, keyed by field path. */
    details?: Record<string, string[]>;
  };
}
