'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { pornstarService } from '@/services/pornstarService';
import type { Pornstar } from '@/types/pornstar';
import type { Asset } from '@/types/asset';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConfirmModal from '@/components/ConfirmModal';
import GenerateAssetModal, { type GenerateAssetFormData } from '@/components/GenerateAssetModal';

export default function ViewPornstarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [pornstar, setPornstar] = useState<Pornstar | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activating, setActivating] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showGenerateAssetModal, setShowGenerateAssetModal] = useState(false);
  const [generatingAsset, setGeneratingAsset] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const pornstarData = await pornstarService.getById(id);
        setPornstar(pornstarData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load pornstar');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setAssetsLoading(true);
        const assetsData = await pornstarService.getAssets(id);
        setAssets(assetsData);
      } catch (err: any) {
        console.error('Failed to load assets:', err);
      } finally {
        setAssetsLoading(false);
      }
    };

    fetchAssets();
  }, [id]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await pornstarService.delete(id);
      router.push('/pornstars');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete pornstar');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleActivateClick = () => {
    setShowActivateModal(true);
    setShowActionsMenu(false);
  };

  const handleActivateConfirm = async () => {
    setActivating(true);
    try {
      const updatedPornstar = await pornstarService.activate(id);
      setPornstar(updatedPornstar);
      setShowActivateModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate pornstar');
    } finally {
      setActivating(false);
    }
  };

  const handleGenerateAsset = async (formData: GenerateAssetFormData) => {
    setGeneratingAsset(true);
    try {
      await pornstarService.generateAsset(id, formData);
      setShowGenerateAssetModal(false);
      // Refresh assets list
      const assetsData = await pornstarService.getAssets(id);
      setAssets(assetsData);
    } catch (err: any) {
      // Re-throw the error so the modal can catch and display it
      throw err;
    } finally {
      setGeneratingAsset(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
          <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !pornstar) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
          <div className="text-red-600 dark:text-red-400">{error || 'Pornstar not found'}</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/pornstars')}
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-2"
            >
              ← Back to Pornstars
            </button>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {pornstar.first_name} {pornstar.last_name}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {pornstar.slug}
            </p>
          </div>
          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 cursor-pointer dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Actions ▼
            </button>

            {showActionsMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActionsMenu(false)}
                />
                <div className="absolute right-0 top-12 z-20 w-48 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="py-1">
                    {pornstar.status === 'pending_review' && (
                      <button
                        onClick={handleActivateClick}
                        disabled={activating}
                        className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        Activate Pornstar
                      </button>
                    )}
                    {!pornstar.deleted_at && (
                      <button
                        onClick={() => {
                          setShowActionsMenu(false);
                          handleDeleteClick();
                        }}
                        disabled={deleting}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Delete Pornstar
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Basic Information with Avatar */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Profile Avatar */}
            <div className="md:col-span-1">
              {pornstar.profile_image ? (
                <img
                  src={pornstar.profile_image.large}
                  alt={`${pornstar.first_name} ${pornstar.last_name}`}
                  className="w-full aspect-square rounded-lg object-cover border-2 border-zinc-200 dark:border-zinc-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full aspect-square rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900"><p class="text-sm text-zinc-500 dark:text-zinc-400 text-center px-4">Profile image not available</p></div>';
                    }
                  }}
                />
              ) : (
                <div className="w-full aspect-square rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center px-4">
                    No profile image set
                  </p>
                </div>
              )}
            </div>

            {/* Information Grid */}
            <div className="md:col-span-3">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Type</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      pornstar.type === 'real'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                      {pornstar.type}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      pornstar.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : pornstar.status === 'pending_review'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : pornstar.status === 'inactive'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {pornstar.status.replace(/_/g, ' ')}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Age</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{pornstar.age} years old</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {pornstar.date_of_birth || 'Not specified'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Country</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {pornstar.country?.name || 'Not specified'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Ethnicity</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {pornstar.ethnicity || 'Not specified'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Height</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {pornstar.height_cm ? `${pornstar.height_cm} cm` : 'Not specified'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Weight</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {pornstar.weight_kg ? `${pornstar.weight_kg} kg` : 'Not specified'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Hair Color</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {pornstar.hair_color || 'Not specified'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Eye Color</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {pornstar.eye_color || 'Not specified'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Bio */}
        {pornstar.bio && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Biography</h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {pornstar.bio.content}
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Statistics</h3>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Views</dt>
              <dd className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {pornstar.views_count.toLocaleString()}
              </dd>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Videos</dt>
              <dd className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {pornstar.videos_count}
              </dd>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Images</dt>
              <dd className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {pornstar.images_count}
              </dd>
            </div>
          </dl>
        </div>

        {/* Assets */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Assets ({assets.length})</h3>
            <button
              onClick={() => setShowGenerateAssetModal(true)}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 cursor-pointer dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Generate Asset
            </button>
          </div>

          {assetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-zinc-600 dark:text-zinc-400">Loading assets...</div>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-zinc-500 dark:text-zinc-400">No assets found for this pornstar</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Thumbnail
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        {asset.thumbnail_url ? (
                          <img
                            src={asset.thumbnail_url}
                            alt={asset.title.en || 'Asset thumbnail'}
                            className="h-16 w-16 rounded object-cover border border-zinc-200 dark:border-zinc-700"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <span className="text-xs text-zinc-400">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {asset.title.en || 'Untitled'}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {asset.slug}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          asset.asset_type === 'video'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {asset.asset_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          asset.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : asset.status === 'ready_for_review'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {asset.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => router.push(`/assets/${asset.id}`)}
                          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Metadata</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Created</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(pornstar.created_at).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Last Updated</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(pornstar.updated_at).toLocaleString()}
              </dd>
            </div>

            {pornstar.deleted_at && (
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Deleted</dt>
                <dd className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {new Date(pornstar.deleted_at).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Pornstar"
          message={`Are you sure you want to delete ${pornstar.first_name} ${pornstar.last_name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleting}
        />

        <ConfirmModal
          isOpen={showActivateModal}
          onClose={() => setShowActivateModal(false)}
          onConfirm={handleActivateConfirm}
          title="Activate Pornstar"
          message={`Are you sure you want to activate ${pornstar.first_name} ${pornstar.last_name}? This will make the pornstar visible on the platform.`}
          confirmText="Activate"
          cancelText="Cancel"
          variant="info"
          isLoading={activating}
        />

        <GenerateAssetModal
          isOpen={showGenerateAssetModal}
          onClose={() => setShowGenerateAssetModal(false)}
          onSubmit={handleGenerateAsset}
          isLoading={generatingAsset}
          characterId={pornstar?.id}
          readOnlyCharacter={true}
        />
      </div>
    </ProtectedRoute>
  );
}
