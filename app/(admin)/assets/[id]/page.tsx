'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { assetService } from '@/services/assetService';
import type { Asset } from '@/types/asset';

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAsset();
  }, [assetId]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await assetService.getById(assetId);
      setAsset(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch asset details');
      setAsset(null);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (asset: Asset) => {
    return asset.title?.en || asset.title?.[Object.keys(asset.title)[0]] || 'Untitled';
  };

  const getDescription = (asset: Asset) => {
    return asset.description?.en || asset.description?.[Object.keys(asset.description)[0]] || '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Asset Details
          </h2>
          <button
            onClick={() => router.push('/assets')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
          >
            Back to Assets
          </button>
        </div>

        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            {error || 'Asset not found'}
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
            {getTitle(asset)}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Asset Details
          </p>
        </div>
        <button
          onClick={() => router.push('/assets')}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
        >
          Back to Assets
        </button>
      </div>

      {asset.deleted_at && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            This asset was deleted on {new Date(asset.deleted_at).toLocaleString()}
          </p>
        </div>
      )}

      {asset.thumbnail_url && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Thumbnail
          </h3>
          <img
            src={asset.thumbnail_url}
            alt={getTitle(asset)}
            className="max-w-md rounded-lg"
          />
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Asset Information
          </h3>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                ID
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50 break-all">
                {asset.id}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Slug
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {asset.slug}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Title
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {getTitle(asset)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Type
              </dt>
              <dd className="mt-1">
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  asset.asset_type === 'video'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                }`}>
                  {asset.asset_type}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Featured
              </dt>
              <dd className="mt-1">
                {asset.is_featured ? (
                  <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    Featured
                  </span>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-600">No</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Premium
              </dt>
              <dd className="mt-1">
                {asset.is_premium ? (
                  <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                    Premium
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                    Free
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Published At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {asset.published_at ? new Date(asset.published_at).toLocaleString() : 'Not published'}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Description
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {getDescription(asset)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Metadata
          </h3>
        </div>
        <div className="p-6">
          <pre className="text-sm text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-900 p-4 rounded overflow-auto">
            {JSON.stringify(asset.metadata, null, 2)}
          </pre>
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
                {new Date(asset.created_at).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Updated At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(asset.updated_at).toLocaleString()}
              </dd>
            </div>

            {asset.deleted_at && (
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Deleted At
                </dt>
                <dd className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {new Date(asset.deleted_at).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
