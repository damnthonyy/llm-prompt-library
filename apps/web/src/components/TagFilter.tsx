import { TagChip } from './TagChip';

/** Row of selectable tag chips; clicking the active tag clears the filter. */
export function TagFilter({
  tags,
  selected,
  onSelect,
}: {
  tags: string[];
  selected?: string;
  onSelect: (tag: string | undefined) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          selected ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-white'
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <TagChip
          key={tag}
          tag={tag}
          active={selected === tag}
          onClick={() => onSelect(selected === tag ? undefined : tag)}
        />
      ))}
    </div>
  );
}
