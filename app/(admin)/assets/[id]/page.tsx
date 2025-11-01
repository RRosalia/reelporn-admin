'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { assetService } from '@/services/assetService';
import ConfirmModal from '@/components/ConfirmModal';
import type { Asset } from '@/types/asset';

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const getTitle = (asset: Asset): string => {
    if (!asset.title) return 'Untitled';

    // Handle case where title might be a string (JSON string)
    const titleValue = asset.title;
    if (typeof titleValue === 'string') {
      try {
        const parsed = JSON.parse(titleValue) as Record<string, string>;
        // Try English first
        if (parsed.en) return parsed.en;
        // Get first available translation
        const keys = Object.keys(parsed);
        if (keys.length > 0) return parsed[keys[0]];
        return 'Untitled';
      } catch {
        return titleValue; // If it's a plain string, just return it
      }
    }

    // If titleValue is an object
    if (typeof titleValue === 'object' && titleValue !== null) {
      // Try English first
      if (titleValue.en) return titleValue.en;
      // Get first available translation
      const keys = Object.keys(titleValue);
      if (keys.length > 0) return titleValue[keys[0]];
    }

    return 'Untitled';
  };

  const getDescription = (asset: Asset): string => {
    if (!asset.description) return '-';

    // Handle case where description might be a string (JSON string)
    const descValue = asset.description;
    if (typeof descValue === 'string') {
      try {
        const parsed = JSON.parse(descValue) as Record<string, string>;
        // Try English first
        if (parsed.en) return parsed.en;
        // Get first available translation
        const keys = Object.keys(parsed);
        if (keys.length > 0) return parsed[keys[0]];
        return '-';
      } catch {
        return descValue; // If it's a plain string, just return it
      }
    }

    // If descValue is an object
    if (typeof descValue === 'object' && descValue !== null) {
      // Try English first
      if (descValue.en) return descValue.en;
      // Get first available translation
      const keys = Object.keys(descValue);
      if (keys.length > 0) return descValue[keys[0]];
    }

    return '-';
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await assetService.delete(assetId);
      router.push('/assets');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete asset');
      setDeleting(false);
      setShowDeleteModal(false);
    }
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
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
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
        <div className="flex items-center gap-3">
          {!asset.deleted_at && (
            <button
              onClick={handleDeleteClick}
              disabled={deleting}
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer dark:border-red-600 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Delete Asset
            </button>
          )}
          <button
            onClick={() => router.push('/assets')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
          >
            Back to Assets
          </button>
        </div>
      </div>

      {asset.deleted_at && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            This asset was deleted on {new Date(asset.deleted_at).toLocaleString()}
          </p>
        </div>
      )}

      {/* Two column layout: Media on left, Information on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Media */}
        <div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Media
            </h3>
            {asset.media?.url ? (
              <>
                <div
                  onClick={() => setShowMediaModal(true)}
                  className="cursor-pointer group relative"
                >
                  <img
                    src={asset.media.url}
                    alt={getTitle(asset)}
                    className="w-full rounded-lg transition-opacity group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                    <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">Size:</span> {(asset.media.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-64 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No media available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Asset Information */}
        <div>
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
                Status
              </dt>
              <dd className="mt-1">
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  asset.status === 'published'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : asset.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {asset.status}
                </span>
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
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Metadata
          </h3>
        </div>
        <div className="p-6">
          <pre className="text-sm text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-900 p-4 rounded overflow-x-auto max-w-full whitespace-pre-wrap break-words">
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

      {/* Media Enlargement Modal */}
      {showMediaModal && asset.media?.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowMediaModal(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setShowMediaModal(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={asset.media.url}
              alt={getTitle(asset)}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Asset"
        message={`Are you sure you want to delete "${getTitle(asset)}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
