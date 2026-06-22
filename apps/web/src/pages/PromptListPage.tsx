import { useSearchParams } from 'react-router-dom';
import { usePrompts } from '../hooks/usePrompts';
import { useTags } from '../hooks/useTags';
import { SearchBar } from '../components/SearchBar';
import { TagFilter } from '../components/TagFilter';
import { PromptCard } from '../components/PromptCard';
import { Pagination } from '../components/Pagination';
import { Spinner } from '../components/Spinner';

const PAGE_SIZE = 12;

export function PromptListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const tag = searchParams.get('tag') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1') || 1;

  const tags = useTags();
  const { data, loading, error } = usePrompts({
    q: q || undefined,
    tag,
    page,
    limit: PAGE_SIZE,
  });

  /** Merge updates into the URL params; changing q/tag resets to page 1. */
  function update(next: { q?: string; tag?: string; page?: number }) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if ('q' in next) {
        if (next.q) params.set('q', next.q);
        else params.delete('q');
      }
      if ('tag' in next) {
        if (next.tag) params.set('tag', next.tag);
        else params.delete('tag');
      }
      // Changing the query or tag resets pagination; otherwise honor the page.
      if ('q' in next || 'tag' in next) {
        params.delete('page');
      } else if (next.page && next.page > 1) {
        params.set('page', String(next.page));
      } else {
        params.delete('page');
      }
      return params;
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Browse prompts</h1>
        <p className="text-sm text-slate-500">Search, filter by tag, and copy with one click.</p>
      </div>

      <SearchBar value={q} onChange={(value) => update({ q: value })} />
      <TagFilter tags={tags} selected={tag} onSelect={(value) => update({ tag: value })} />

      {loading && <Spinner label="Loading prompts…" />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && data && data.data.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No prompts match your filters.
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={(p) => update({ page: p })} />
        </>
      )}
    </div>
  );
}
