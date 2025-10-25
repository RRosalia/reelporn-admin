'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { categoryService } from '@/services/categoryService';
import type { Category } from '@/types/category';

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await categoryService.getById(categoryId);
      setCategory(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch category details');
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Category Details
          </h2>
          <button
            onClick={() => router.push('/categories')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
          >
            Back to Categories
          </button>
        </div>

        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            {error || 'Category not found'}
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
            {category.name}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Category Details
          </p>
        </div>
        <button
          onClick={() => router.push('/categories')}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
        >
          Back to Categories
        </button>
      </div>

      {category.deleted_at && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            This category was deleted on {new Date(category.deleted_at).toLocaleString()}
          </p>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Category Information
          </h3>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                ID
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {category.id}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Name
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {category.name}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Slug
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {category.slug}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Assets Count
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {category.assets_count}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Status
              </dt>
              <dd className="mt-1">
                {category.is_active ? (
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                    Inactive
                  </span>
                )}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Description
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {category.description || '-'}
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
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Created At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(category.created_at).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Updated At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(category.updated_at).toLocaleString()}
              </dd>
            </div>

            {category.deleted_at && (
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Deleted At
                </dt>
                <dd className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {new Date(category.deleted_at).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
