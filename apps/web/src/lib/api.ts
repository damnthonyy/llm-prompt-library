import type {
  ApiError,
  AuthResponse,
  CreatePromptInput,
  ListPromptsQuery,
  LoginInput,
  Prompt,
  PromptsPage,
  RegisterInput,
  TagsResponse,
  UpdatePromptInput,
} from '@repo/shared';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

/** Error thrown for non-2xx responses, carrying status + field details. */
export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }

  /** Flatten field details into a single readable string, if present. */
  get fieldMessage(): string | undefined {
    if (!this.details) return undefined;
    return Object.values(this.details).flat().join(' ');
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include', // send/receive the auth cookie
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let details: Record<string, string[]> | undefined;
    try {
      const body = (await res.json()) as ApiError;
      message = body.error?.message ?? message;
      details = body.error?.details;
    } catch {
      // non-JSON error body
    }
    throw new ApiClientError(res.status, message, details);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function toQueryString(params: Partial<ListPromptsQuery>): string {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.tag) search.set('tag', params.tag);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  // --- auth ---
  register: (input: RegisterInput) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  login: (input: LoginInput) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  me: () => request<AuthResponse>('/auth/me'),

  // --- prompts ---
  listPrompts: (params: Partial<ListPromptsQuery> = {}) =>
    request<PromptsPage>(`/prompts${toQueryString(params)}`),
  getPrompt: (id: string) => request<Prompt>(`/prompts/${id}`),
  createPrompt: (input: CreatePromptInput) =>
    request<Prompt>('/prompts', { method: 'POST', body: JSON.stringify(input) }),
  updatePrompt: (id: string, input: UpdatePromptInput) =>
    request<Prompt>(`/prompts/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deletePrompt: (id: string) => request<void>(`/prompts/${id}`, { method: 'DELETE' }),

  // --- tags ---
  listTags: () => request<TagsResponse>('/tags'),
};
