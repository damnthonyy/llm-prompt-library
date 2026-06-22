import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-slate-500">This page could not be found.</p>
      <Link to="/" className="mt-4 inline-block font-medium text-slate-900 underline">
        Back home
      </Link>
    </div>
  );
}
