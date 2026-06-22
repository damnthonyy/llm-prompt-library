import { useAuth } from '../context/AuthContext';

/**
 * Placeholder home for the app shell. The full prompt list (cards, search,
 * tag filter, pagination) is implemented in the next issue (#9).
 */
export function HomePage() {
  const { user } = useAuth();
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h1 className="text-2xl font-bold">You&apos;re in 🎉</h1>
      <p className="mt-2 text-slate-500">
        Signed in as <span className="font-medium text-slate-700">{user?.email}</span>.
      </p>
      <p className="mt-4 text-sm text-slate-400">The prompt browser arrives in the next update.</p>
    </div>
  );
}
