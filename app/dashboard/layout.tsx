'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Admin Panel
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {user?.username}
                </span>
                <button
                  onClick={logout}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
