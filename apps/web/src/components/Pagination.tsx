import type { PaginationMeta } from '@repo/shared';

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <button
        type="button"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40"
      >
        ← Previous
      </button>
      <span className="text-sm text-slate-500">
        Page {meta.page} of {meta.totalPages} · {meta.total} prompts
      </span>
      <button
        type="button"
        disabled={!meta.hasNextPage}
        onClick={() => onPageChange(meta.page + 1)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
