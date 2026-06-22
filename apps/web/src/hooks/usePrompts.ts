import { useCallback, useEffect, useState } from 'react';
import type { ListPromptsQuery, PromptsPage } from '@repo/shared';
import { ApiClientError, api } from '../lib/api';

/** Fetch a page of prompts for the given query; re-runs when params change. */
export function usePrompts(params: Partial<ListPromptsQuery>) {
  const { q, tag, page, limit } = params;
  const [data, setData] = useState<PromptsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .listPrompts({ q, tag, page, limit })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : 'Failed to load prompts');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, tag, page, limit]);

  useEffect(() => load(), [load]);

  return { data, loading, error, reload: load };
}
