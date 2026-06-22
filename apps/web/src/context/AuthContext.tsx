/* eslint-disable react-refresh/only-export-components -- context + hook colocated by convention */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LoginInput, PublicUser, RegisterInput } from '@repo/shared';
import { api, ApiClientError } from '../lib/api';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: PublicUser | null;
  status: Status;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  // Bootstrap the session from the auth cookie on first load.
  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then((res) => {
        if (!cancelled) {
          setUser(res.user);
          setStatus('authenticated');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        // 401 simply means not logged in; anything else is also treated as anon.
        if (!(err instanceof ApiClientError)) console.error(err);
        setUser(null);
        setStatus('anonymous');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login: async (input) => {
        const res = await api.login(input);
        setUser(res.user);
        setStatus('authenticated');
      },
      register: async (input) => {
        const res = await api.register(input);
        setUser(res.user);
        setStatus('authenticated');
      },
      logout: async () => {
        await api.logout();
        setUser(null);
        setStatus('anonymous');
      },
    }),
    [user, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
