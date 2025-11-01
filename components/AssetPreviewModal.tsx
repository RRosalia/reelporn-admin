'use client';

import { useEffect, useRef } from 'react';
import type { Asset } from '@/types/asset';

interface AssetPreviewModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssetPreviewModal({
  asset,
  isOpen,
  onClose,
}: AssetPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Auto-play video when modal opens
  useEffect(() => {
    if (isOpen && asset?.asset_type === 'video' && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, [isOpen, asset]);

  if (!isOpen || !asset) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-zinc-300 transition-colors"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Asset preview */}
        <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row">
            {/* Media preview */}
            <div className="flex-1 flex items-center justify-center bg-black">
              {asset.media_url ? (
                asset.asset_type === 'video' ? (
                  <video
                    ref={videoRef}
                    src={asset.media_url}
                    controls
                    autoPlay
                    loop
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                ) : (
                  <img
                    src={asset.media_url}
                    alt={getTitle(asset)}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                )
              ) : (
                <div className="flex items-center justify-center p-12">
                  <svg
                    className="w-24 h-24 text-zinc-600"
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
            </div>

            {/* Asset details sidebar */}
            <div className="w-full lg:w-80 bg-zinc-900 p-6 overflow-y-auto max-h-[70vh]">
              <h2 className="text-xl font-bold text-white mb-4">
                {getTitle(asset)}
              </h2>

              <div className="space-y-4">
                {/* Status */}
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
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

                {/* Type */}
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Type</p>
                  <p className="text-sm text-white capitalize">{asset.asset_type}</p>
                </div>

                {/* File size */}
                {asset.media?.size && (
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">File Size</p>
                    <p className="text-sm text-white">
                      {formatFileSize(asset.media.size)}
                    </p>
                  </div>
                )}

                {/* MIME type */}
                {asset.media?.mime_type && (
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Format</p>
                    <p className="text-sm text-white">{asset.media.mime_type}</p>
                  </div>
                )}

                {/* Dimensions (if available in custom_properties) */}
                {asset.media?.custom_properties?.width &&
                  asset.media?.custom_properties?.height && (
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Dimensions</p>
                      <p className="text-sm text-white">
                        {asset.media.custom_properties.width} ×{' '}
                        {asset.media.custom_properties.height}
                      </p>
                    </div>
                  )}

                {/* Created at */}
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Created</p>
                  <p className="text-sm text-white">
                    {new Date(asset.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Asset ID */}
                <div>
                  <p className="text-xs text-zinc-400 mb-1">ID</p>
                  <p className="text-sm text-white font-mono">{asset.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hint */}
        <p className="text-center text-sm text-zinc-400 mt-4">
          Double-click to view full asset page
        </p>
      </div>
    </div>
  );
}
