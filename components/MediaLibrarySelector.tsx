'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { assetService } from '@/services/assetService';
import { pornstarService } from '@/services/pornstarService';
import type { Asset } from '@/types/asset';
import type { Pornstar } from '@/types/pornstar';

interface MediaLibrarySelectorProps {
  onSelect: (asset: Asset) => void;
  selectedAssetId?: string;
  assetType?: 'image' | 'video'; // Type of asset being generated
}

export default function MediaLibrarySelector({
  onSelect,
  selectedAssetId,
  assetType: _assetType = 'image', // Reserved for future use
}: MediaLibrarySelectorProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPornstarId, setSelectedPornstarId] = useState<string>('');
  const [pornstars, setPornstars] = useState<Pornstar[]>([]);
  const [loadingPornstars, setLoadingPornstars] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchAssets = async (page: number, query: string, pornstarId: string, append = false) => {
    try {
      setLoading(true);
      const response = await assetService.getAll({
        page,
        per_page: 20,
        query: query || undefined,
        status: 'active', // Only show active assets
        type: 'image', // Reference images must be images (even for video generation)
        pornstar_id: pornstarId || undefined,
      });

      const newAssets = response.data || [];

      if (append) {
        // Deduplicate assets by ID before appending
        const existingIds = new Set(assets.map(a => a.id));
        const uniqueNewAssets = newAssets.filter(asset => !existingIds.has(asset.id));
        setAssets(prev => [...prev, ...uniqueNewAssets]);
      } else {
        setAssets(newAssets);
      }

      setHasMore(response.meta ? page < response.meta.last_page : false);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pornstars on mount
  useEffect(() => {
    const fetchPornstars = async () => {
      try {
        setLoadingPornstars(true);
        const response = await pornstarService.getAll({
          per_page: 100,
          status: 'active',
        });
        setPornstars(response.data || []);
      } catch (err) {
        console.error('Failed to fetch pornstars:', err);
      } finally {
        setLoadingPornstars(false);
      }
    };

    fetchPornstars();
  }, []);

  // Initial fetch when filters change
  useEffect(() => {
    fetchAssets(1, searchQuery, selectedPornstarId, false);
  }, [searchQuery, selectedPornstarId]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchAssets(currentPage + 1, searchQuery, selectedPornstarId, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, currentPage, searchQuery, selectedPornstarId]);

  const getTitle = (asset: Asset): string => {
    if (!asset.title) return 'Untitled';
    const titleValue = asset.title;
    if (typeof titleValue === 'string') {
      try {
        const parsed = JSON.parse(titleValue) as Record<string, string>;
        return parsed.en || Object.values(parsed)[0] || 'Untitled';
      } catch {
        return titleValue;
      }
    }
    if (typeof titleValue === 'object' && titleValue !== null) {
      return titleValue.en || Object.values(titleValue)[0] || 'Untitled';
    }
    return 'Untitled';
  };

  const getPornstarName = (pornstar: Pornstar): string => {
    const fullName = `${pornstar.first_name || ''} ${pornstar.last_name || ''}`.trim();
    return fullName || 'Unnamed';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
        />

        {/* Character/Pornstar Filter */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Filter by Character
          </label>
          <select
            value={selectedPornstarId}
            onChange={(e) => {
              setSelectedPornstarId(e.target.value);
              setCurrentPage(1);
            }}
            disabled={loadingPornstars}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
          >
            <option value="">All Characters</option>
            {pornstars.map((pornstar) => (
              <option key={pornstar.id} value={pornstar.id}>
                {getPornstarName(pornstar)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && assets.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-zinc-500">
            Loading...
          </div>
        ) : assets.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-zinc-500">
            No assets found
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => onSelect(asset)}
                  className={`relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:border-zinc-400 dark:hover:border-zinc-500 ${
                    selectedAssetId === asset.id
                      ? 'border-blue-500 dark:border-blue-400'
                      : 'border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {/* Asset Preview */}
                  <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                    {asset.media_url ? (
                      asset.asset_type === 'video' ? (
                        <video
                          src={asset.media_url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <Image
                          src={asset.media_url}
                          alt={getTitle(asset)}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-zinc-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Video indicator */}
                    {asset.asset_type === 'video' && (
                      <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    )}

                    {/* Selected indicator */}
                    {selectedAssetId === asset.id && (
                      <div className="absolute top-2 left-2 bg-blue-500 rounded-full p-1">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Asset Info */}
                  <div className="p-2 bg-white dark:bg-zinc-900">
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      {getTitle(asset)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                      {asset.asset_type}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading indicator */}
            {loading && assets.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
              </div>
            )}

            {/* Intersection observer target */}
            <div ref={observerTarget} className="h-4" />
          </>
        )}
      </div>
    </div>
  );
}
