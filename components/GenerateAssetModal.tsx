'use client';

import { useState, useEffect } from 'react';

interface GenerateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GenerateAssetFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface GenerateAssetFormData {
  asset_type?: 'image' | 'video';
  title: string;
  description?: string;
  prompt: string;
  negative_prompt?: string;
  duration_seconds?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
}

export default function GenerateAssetModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: GenerateAssetModalProps) {
  const [formData, setFormData] = useState<GenerateAssetFormData>({
    asset_type: 'image',
    title: '',
    description: '',
    prompt: '',
    negative_prompt: '',
    duration_seconds: 5,
    guidance_scale: 7.5,
    num_inference_steps: 50,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        asset_type: 'image',
        title: '',
        description: '',
        prompt: '',
        negative_prompt: '',
        duration_seconds: 5,
        guidance_scale: 7.5,
        num_inference_steps: 50,
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleAssetTypeChange = (asset_type: 'image' | 'video') => {
    setFormData({
      ...formData,
      asset_type,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.title) {
      newErrors.title = 'Title is required';
    }

    if (!formData.prompt) {
      newErrors.prompt = 'Prompt is required';
    }

    if (formData.asset_type === 'video' && (!formData.duration_seconds || formData.duration_seconds <= 0)) {
      newErrors.duration_seconds = 'Duration must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Generate Asset
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Asset Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="image"
                  checked={formData.asset_type === 'image'}
                  onChange={(e) => handleAssetTypeChange(e.target.value as 'image' | 'video')}
                  disabled={isLoading}
                  className="mr-2"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Image</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="video"
                  checked={formData.asset_type === 'video'}
                  onChange={(e) => handleAssetTypeChange(e.target.value as 'image' | 'video')}
                  disabled={isLoading}
                  className="mr-2"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Video</span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isLoading}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
              placeholder="Enter asset title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              rows={3}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
              placeholder="Enter asset description"
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Prompt *
            </label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              disabled={isLoading}
              rows={4}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
              placeholder="Enter generation prompt"
            />
            {errors.prompt && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prompt}</p>
            )}
          </div>

          {/* Negative Prompt */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Negative Prompt
            </label>
            <textarea
              value={formData.negative_prompt}
              onChange={(e) => setFormData({ ...formData, negative_prompt: e.target.value })}
              disabled={isLoading}
              rows={2}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
              placeholder="Enter negative prompt (optional)"
            />
          </div>

          {/* Video-specific fields */}
          {formData.asset_type === 'video' && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Duration (seconds) *
                </label>
                <input
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) })}
                  disabled={isLoading}
                  min={1}
                  max={60}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                />
                {errors.duration_seconds && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration_seconds}</p>
                )}
              </div>
            </>
          )}

          {/* Advanced Options */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Guidance Scale
            </label>
            <input
              type="number"
              value={formData.guidance_scale}
              onChange={(e) => setFormData({ ...formData, guidance_scale: parseFloat(e.target.value) })}
              disabled={isLoading}
              step={0.1}
              min={1}
              max={20}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Inference Steps
            </label>
            <input
              type="number"
              value={formData.num_inference_steps}
              onChange={(e) => setFormData({ ...formData, num_inference_steps: parseInt(e.target.value) })}
              disabled={isLoading}
              min={1}
              max={150}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading ? 'Generating...' : 'Generate Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
