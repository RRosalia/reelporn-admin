'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { userService } from '@/services/userService';
import type { User } from '@/types/user';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await userService.getById(userId);
      setUser(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    };

    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusColors[status] || statusColors.inactive}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            User Details
          </h2>
          <button
            onClick={() => router.push('/users')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
          >
            Back to Users
          </button>
        </div>

        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            {error || 'User not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {user.name}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            User Details
          </p>
        </div>
        <button
          onClick={() => router.push('/users')}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
        >
          Back to Users
        </button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            User Information
          </h3>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Name
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {user.name}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Nickname
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {user.nickname}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Email
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                <a
                  href={`mailto:${user.email}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {user.email}
                </a>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Email Verified
              </dt>
              <dd className="mt-1 text-sm">
                {user.email_verified_at ? (
                  <div>
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Verified
                    </span>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {new Date(user.email_verified_at).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    Unverified
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Status
              </dt>
              <dd className="mt-1">
                {getStatusBadge(user.status)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Timestamps
          </h3>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Created At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(user.created_at).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Updated At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(user.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
