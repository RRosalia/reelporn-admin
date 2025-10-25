'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useGpuServerChannel } from '@/lib/hooks/useGpuServerChannel';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Connect to GPU server processing channel after login
  useGpuServerChannel();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Users', href: '/users' },
    { name: 'Pornstars', href: '/pornstars' },
    { name: 'Categories', href: '/categories' },
    { name: 'Assets', href: '/assets' },
    { name: 'Plans', href: '/plans' },
    { name: 'Affiliates', href: '/affiliates' },
    { name: 'Payments', href: '/payments' },
    { name: 'Subscriptions', href: '/subscriptions' },
    { name: 'IP Whitelist', href: '/ips' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        {/* Top Navigation Bar */}
        <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Admin Panel
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
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

        <div className="flex">
          {/* Left Sidebar */}
          <aside className="w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800 min-h-[calc(100vh-4rem)]">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
