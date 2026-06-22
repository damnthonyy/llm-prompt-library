type Props = {
  tag: string;
  active?: boolean;
  onClick?: (tag: string) => void;
};

/** A tag pill. Rendered as a button when onClick is provided, else a span. */
export function TagChip({ tag, active = false, onClick }: Props) {
  const base = 'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium';
  const color = active
    ? 'bg-slate-900 text-white'
    : 'bg-slate-100 text-slate-600 hover:bg-slate-200';

  if (!onClick) {
    return <span className={`${base} ${color}`}>{tag}</span>;
  }
  return (
    <button type="button" onClick={() => onClick(tag)} className={`${base} ${color}`}>
      {tag}
    </button>
  );
}
