import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Prompt } from '@repo/shared';
import { ApiClientError, api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { CopyButton } from '../components/CopyButton';
import { TagChip } from '../components/TagChip';
import { Spinner } from '../components/Spinner';

export function PromptDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    api
      .getPrompt(id)
      .then((res) => !cancelled && setPrompt(res))
      .catch(
        (err) =>
          !cancelled &&
          setError(err instanceof ApiClientError ? err.message : 'Failed to load prompt'),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!prompt || !window.confirm('Delete this prompt? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.deletePrompt(prompt.id);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete prompt');
      setDeleting(false);
    }
  }

  if (loading) return <Spinner label="Loading prompt…" />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!prompt) return null;

  const isOwner = user?.id === prompt.authorId;

  return (
    <article className="space-y-5">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to all prompts
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{prompt.title}</h1>
        <div className="flex items-center gap-2">
          <CopyButton text={prompt.body} />
          {isOwner && (
            <>
              <Link
                to={`/prompts/${prompt.id}/edit`}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>

      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.map((tag) => (
            <Link key={tag} to={`/?tag=${encodeURIComponent(tag)}`}>
              <TagChip tag={tag} />
            </Link>
          ))}
        </div>
      )}

      <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 font-sans text-sm leading-relaxed text-slate-800">
        {prompt.body}
      </pre>
    </article>
  );
}
