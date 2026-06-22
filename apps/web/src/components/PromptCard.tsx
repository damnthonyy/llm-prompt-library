import { Link } from 'react-router-dom';
import type { Prompt } from '@repo/shared';
import { CopyButton } from './CopyButton';
import { TagChip } from './TagChip';

export function PromptCard({ prompt }: { prompt: Prompt }) {
  return (
    <Link
      to={`/prompts/${prompt.id}`}
      className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{prompt.title}</h3>
        <CopyButton text={prompt.body} />
      </div>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{prompt.body}</p>
      {prompt.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prompt.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}
    </Link>
  );
}
