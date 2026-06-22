import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            🧠 Prompt Library
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {status === 'authenticated' && user ? (
              <>
                <Link
                  to="/prompts/new"
                  className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
                >
                  New prompt
                </Link>
                <span className="hidden text-slate-500 sm:inline">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100"
                >
                  Log out
                </button>
              </>
            ) : status === 'anonymous' ? (
              <>
                <Link to="/login" className="font-medium text-slate-600 hover:text-slate-900">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
                >
                  Sign up
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
