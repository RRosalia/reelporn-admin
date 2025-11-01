'use client';

import { useState, useEffect, useRef } from 'react';
import type { Asset } from '@/types/asset';

interface ImageGalleryViewProps {
  assets: Asset[];
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  onAssetClick: (asset: Asset) => void;
}

export default function ImageGalleryView({
  assets,
  onLoadMore,
  hasMore,
  loading,
  onAssetClick,
}: ImageGalleryViewProps) {
  const [clickedAsset, setClickedAsset] = useState<string | null>(null);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Get title from asset
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

  // Handle single and double click
  const handleAssetClick = (asset: Asset) => {
    if (clickTimeout) {
      // Double click - open in new tab
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      setClickedAsset(null);
      window.open(`/assets/${asset.id}`, '_blank');
    } else {
      // Single click
      setClickedAsset(asset.id);
      const timeout = setTimeout(() => {
        onAssetClick(asset);
        setClickedAsset(null);
        setClickTimeout(null);
      }, 250); // 250ms delay to detect double click
      setClickTimeout(timeout);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
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
  }, [hasMore, loading, onLoadMore]);

  if (assets.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 dark:text-zinc-400">
        No assets found
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => handleAssetClick(asset)}
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all hover:shadow-lg"
          >
            {/* Asset Preview */}
            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
              {asset.media_url ? (
                asset.asset_type === 'video' ? (
                  <video
                    src={asset.media_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={asset.media_url}
                    alt={getTitle(asset)}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-zinc-400"
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
                <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Asset Info */}
            <div className="p-3 bg-white dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                {getTitle(asset)}
              </p>
              <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span className="capitalize">{asset.asset_type}</span>
                {asset.media?.size && (
                  <span>{formatFileSize(asset.media.size)}</span>
                )}
              </div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    asset.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : asset.status === 'ready_for_review'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                  }`}
                >
                  {asset.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
        </div>
      )}

      {/* Intersection observer target */}
      <div ref={observerTarget} className="h-10" />
    </div>
  );
}
