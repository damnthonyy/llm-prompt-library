import { useEffect, useState, type MouseEvent } from 'react';

/** Copies the given text to the clipboard and shows transient confirmation. */
export function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleCopy(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 ${className}`}
      aria-label="Copy prompt to clipboard"
    >
      {copied ? '✅ Copied' : '📋 Copy'}
    </button>
  );
}
