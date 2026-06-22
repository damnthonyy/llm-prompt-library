import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiClientError, api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { TextField } from '../components/TextField';
import { Spinner } from '../components/Spinner';

function parseTagsInput(input: string): string[] {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function PromptFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(editing);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load existing prompt when editing.
  useEffect(() => {
    if (!editing || !id) return;
    let cancelled = false;
    api
      .getPrompt(id)
      .then((p) => {
        if (cancelled) return;
        if (user && p.authorId !== user.id) {
          setForbidden(true);
          return;
        }
        setTitle(p.title);
        setBody(p.body);
        setTagsInput(p.tags.join(', '));
      })
      .catch(
        (err) =>
          !cancelled &&
          setError(err instanceof ApiClientError ? err.message : 'Failed to load prompt'),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [editing, id, user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = { title, body, tags: parseTagsInput(tagsInput) };
    try {
      const prompt =
        editing && id ? await api.updatePrompt(id, payload) : await api.createPrompt(payload);
      navigate(`/prompts/${prompt.id}`);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? (err.fieldMessage ?? err.message) : 'Failed to save',
      );
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Loading…" />;
  if (forbidden) return <p className="text-sm text-red-600">You can only edit your own prompts.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{editing ? 'Edit prompt' : 'New prompt'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Title" value={title} onChange={setTitle} />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Body</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={10}
            className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <TextField
          label="Tags (comma-separated)"
          value={tagsInput}
          onChange={setTagsInput}
          required={false}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create prompt'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
