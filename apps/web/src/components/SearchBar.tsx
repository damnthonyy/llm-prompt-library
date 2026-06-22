import { useEffect, useRef, useState } from 'react';

/** Debounced search input. Calls onChange ~300ms after the user stops typing. */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search prompts…',
}: {
  value: string;
  onChange: (q: string) => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  const first = useRef(true);

  // Keep in sync if the external value changes (e.g. cleared elsewhere).
  useEffect(() => setLocal(value), [value]);

  // Debounce emitting changes upward.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <input
      type="search"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-slate-300 px-4 py-2 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
    />
  );
}
