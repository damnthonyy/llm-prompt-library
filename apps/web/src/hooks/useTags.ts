import { useEffect, useState } from 'react';
import { api } from '../lib/api';

/** Load the distinct list of tags once. */
export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    api
      .listTags()
      .then((res) => {
        if (!cancelled) setTags(res.tags);
      })
      .catch(() => {
        if (!cancelled) setTags([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return tags;
}
