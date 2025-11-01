'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { assetService } from '@/services/assetService';
import { pornstarService } from '@/services/pornstarService';
import MediaLibrarySelector from './MediaLibrarySelector';
import type { Asset } from '@/types/asset';
import type { Pornstar } from '@/types/pornstar';

interface GenerateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GenerateAssetFormData) => Promise<void>;
  isLoading?: boolean;
  characterId?: string; // Pre-select a character (from pornstar page)
  readOnlyCharacter?: boolean; // Prevent changing character when set from pornstar page
}

export interface GenerateAssetFormData {
  asset_type?: 'image' | 'video';
  title: string;
  description?: string;
  prompt: string;
  negative_prompt?: string;
  image_model?: string;
  reference_asset_id?: string;
  character_id?: string;
  // Image quality settings
  width?: number;
  height?: number;
  aspect_ratio?: string; // 'landscape', 'portrait', 'square', '16:9', 'custom'
  // Video quality settings
  video_resolution?: string; // e.g., "1280x720"
  duration_seconds?: number; // 1-15 seconds
  fps?: number; // Default 24
  // Advanced settings
  guidance_scale?: number;
  num_inference_steps?: number;
}

interface ImageModel {
  value: string;
  label: string;
  supports_negative_prompt: boolean;
}

export default function GenerateAssetModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  characterId,
  readOnlyCharacter = false,
}: GenerateAssetModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<GenerateAssetFormData>({
    asset_type: 'image',
    title: '',
    description: '',
    prompt: '',
    negative_prompt: '',
    image_model: '',
    // Image quality defaults
    width: 1024,
    height: 1024,
    aspect_ratio: 'square',
    // Video quality defaults
    video_resolution: '1280x720', // HD
    duration_seconds: 5, // 5 seconds default
    fps: 24,
    // Advanced defaults
    guidance_scale: 3.0,
    num_inference_steps: 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [imageModels, setImageModels] = useState<ImageModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ImageModel | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [useReferenceImage, setUseReferenceImage] = useState(false);
  const [selectedReferenceAsset, setSelectedReferenceAsset] = useState<Asset | null>(null);
  const [pornstars, setPornstars] = useState<Pornstar[]>([]);
  const [loadingPornstars, setLoadingPornstars] = useState(false);
  const [pornstarSearchQuery, setPornstarSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        asset_type: 'image',
        title: '',
        description: '',
        prompt: '',
        negative_prompt: '',
        image_model: '',
        character_id: characterId || '', // Set character if provided
        // Image quality defaults
        width: 1024,
        height: 1024,
        aspect_ratio: 'square',
        // Video quality defaults
        video_resolution: '1280x720',
        duration_seconds: 5,
        fps: 24,
        // Advanced defaults
        guidance_scale: 3.0,
        num_inference_steps: 30,
      });
      setErrors({});
      setSubmitError('');
      setSelectedModel(null);
      setCanSubmit(false);
      setUseReferenceImage(false);
      setSelectedReferenceAsset(null);
      setPornstarSearchQuery('');
      fetchImageModels();
      fetchPornstars();
    }
  }, [isOpen, characterId]);

  const fetchImageModels = async () => {
    try {
      setLoadingModels(true);
      const models = await assetService.getImageModels();
      console.log('[GenerateAssetModal] Loaded models:', models);
      setImageModels(models as ImageModel[]);
    } catch (err) {
      console.error('Failed to fetch image models:', err);
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchPornstars = async () => {
    try {
      setLoadingPornstars(true);
      const response = await pornstarService.getAll({
        per_page: 100,
        status: 'active',
        query: pornstarSearchQuery || undefined,
      });
      setPornstars(response.data || []);
    } catch (err) {
      console.error('Failed to fetch pornstars:', err);
    } finally {
      setLoadingPornstars(false);
    }
  };

  // Fetch pornstars when search query changes (with debounce)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchPornstars();
    }, 300);
    return () => clearTimeout(timer);
  }, [pornstarSearchQuery, isOpen]);

  // Update selected model when image_model changes
  useEffect(() => {
    if (formData.image_model && imageModels.length > 0) {
      const model = imageModels.find(m => m.value === formData.image_model);
      console.log('[GenerateAssetModal] Selected model:', model);
      setSelectedModel(model || null);
    } else {
      setSelectedModel(null);
    }
  }, [formData.image_model, imageModels]);

  const handleModelChange = (modelValue: string) => {
    const model = imageModels.find(m => m.value === modelValue);
    setSelectedModel(model || null);
    // Clear negative prompt if model doesn't support it
    if (model && !model.supports_negative_prompt) {
      setFormData({ ...formData, image_model: modelValue, negative_prompt: '' });
    } else {
      setFormData({ ...formData, image_model: modelValue });
    }
  };

  const handleAspectRatioChange = (ratio: string) => {
    let width = formData.width || 1024;
    let height = formData.height || 1024;

    switch (ratio) {
      case 'square': // 1:1
        width = 1024;
        height = 1024;
        break;
      case 'landscape': // 4:3
        width = 1024;
        height = 768;
        break;
      case 'portrait': // 3:4
        width = 768;
        height = 1024;
        break;
      case '16:9':
        width = 1024;
        height = 576;
        break;
      case 'custom':
        // Keep current values
        break;
    }

    setFormData({ ...formData, aspect_ratio: ratio, width, height });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.asset_type) {
        newErrors.asset_type = 'Please select an asset type';
      }
    }

    if (step === 2) {
      if (!formData.title) {
        newErrors.title = 'Title is required';
      }
    }

    if (step === 3) {
      if (formData.asset_type === 'image' && !formData.image_model) {
        newErrors.image_model = 'Please select a model';
      }
      if (!formData.prompt) {
        newErrors.prompt = 'Prompt is required';
      }
    }

    if (step === 4) {
      // Quality settings validation
      if (formData.asset_type === 'image') {
        if (!formData.width || formData.width <= 0) {
          newErrors.width = 'Width must be greater than 0';
        }
        if (!formData.height || formData.height <= 0) {
          newErrors.height = 'Height must be greater than 0';
        }
      }
      if (formData.asset_type === 'video') {
        if (!formData.duration_seconds || formData.duration_seconds < 1 || formData.duration_seconds > 15) {
          newErrors.duration_seconds = 'Duration must be between 1 and 15 seconds';
        }
        if (!formData.fps || formData.fps <= 0) {
          newErrors.fps = 'FPS must be greater than 0';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    console.log('[GenerateAssetModal] handleNext called, currentStep:', currentStep, 'totalSteps:', totalSteps);
    if (validateStep(currentStep)) {
      console.log('[GenerateAssetModal] Validation passed, advancing to step:', currentStep + 1);
      setCanSubmit(false); // Disable submission when advancing
      setCurrentStep(currentStep + 1);

      // Re-enable submission after a short delay to prevent immediate submission
      setTimeout(() => {
        setCanSubmit(true);
      }, 100);
    } else {
      console.log('[GenerateAssetModal] Validation failed for step:', currentStep, 'errors:', errors);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[GenerateAssetModal] handleSubmit called, currentStep:', currentStep, 'totalSteps:', totalSteps, 'canSubmit:', canSubmit);

    // CRITICAL: Prevent submission if not on final step
    if (currentStep !== totalSteps) {
      console.error('[GenerateAssetModal] BLOCKING SUBMISSION - not on final step! currentStep:', currentStep, 'totalSteps:', totalSteps);
      return;
    }

    // CRITICAL: Prevent immediate submission after step change
    if (!canSubmit) {
      console.error('[GenerateAssetModal] BLOCKING SUBMISSION - canSubmit is false (too soon after step change)');
      return;
    }

    if (!validateStep(totalSteps)) {
      console.log('[GenerateAssetModal] Validation failed on final step');
      return;
    }

    console.log('[GenerateAssetModal] Submitting form data:', formData);

    // Clear previous errors
    setSubmitError('');

    try {
      await onSubmit(formData);
    } catch (err: any) {
      console.error('[GenerateAssetModal] Submission error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate asset';
      setSubmitError(errorMessage);
    }
  };

  const totalSteps = 5;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Prevent Enter key from submitting form on intermediate steps
    if (e.key === 'Enter' && currentStep !== totalSteps) {
      const target = e.target as HTMLElement;
      // Only allow Enter in textareas for line breaks
      if (target.tagName === 'TEXTAREA') {
        return; // Let textarea handle Enter normally
      }
      // For all other elements (input, select, etc.), prevent form submission
      e.preventDefault();
      // Don't advance to next step, just prevent submission
      // User must click the Next button explicitly
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`relative w-full ${useReferenceImage ? 'max-w-6xl' : 'max-w-2xl'} max-h-[90vh] rounded-lg bg-white shadow-xl dark:bg-zinc-800 flex`}>
        {/* Main Form Content */}
        <div className={`${useReferenceImage ? 'w-1/2 border-r border-zinc-200 dark:border-zinc-700' : 'w-full'} overflow-y-auto p-6`}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Generate Asset
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
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

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < 5 ? 'flex-1' : ''}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    step <= currentStep
                      ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                      : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`mx-2 h-1 flex-1 rounded ${
                      step < currentStep
                        ? 'bg-zinc-900 dark:bg-zinc-50'
                        : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>Type</span>
            <span>Details</span>
            <span>Prompts</span>
            <span>Quality</span>
            <span>Advanced</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          {/* Step 1: Asset Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">
                  What type of asset do you want to generate?
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Choose between generating an image or a video asset.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, asset_type: 'image' })}
                  className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                    formData.asset_type === 'image'
                      ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-700'
                      : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500'
                  }`}
                >
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 mb-3 text-zinc-700 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">Image</p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Generate a static image</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, asset_type: 'video' })}
                  className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                    formData.asset_type === 'video'
                      ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-700'
                      : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500'
                  }`}
                >
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 mb-3 text-zinc-700 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">Video</p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Generate an animated video</p>
                  </div>
                </button>
              </div>

              {errors.asset_type && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.asset_type}</p>
              )}
            </div>
          )}

          {/* Step 2: Title & Description */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">
                  Add identifying information
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  This information is only for reference purposes. It helps you find and identify this asset later in the admin panel.
                </p>
              </div>

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
                  placeholder="e.g., Beach Scene Sunset"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isLoading}
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  placeholder="Add any notes or details about this asset..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Model & Prompts */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">
                  {formData.asset_type === 'image' ? 'Configure generation settings' : 'Configure video settings'}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  {formData.asset_type === 'image'
                    ? 'Select the AI model and provide prompts to describe what you want to generate.'
                    : 'Provide prompts to describe the video you want to generate.'}
                </p>
              </div>

              {/* Image Model Selection */}
              {formData.asset_type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    AI Model *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.image_model}
                      onChange={(e) => handleModelChange(e.target.value)}
                      disabled={isLoading || loadingModels}
                      className="w-full appearance-none rounded-md border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a model...</option>
                      {imageModels.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-700 dark:text-zinc-300">
                      <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  {loadingModels && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Loading models...</p>
                  )}
                  {errors.image_model && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image_model}</p>
                  )}
                </div>
              )}

              {/* Character Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Character (Optional)
                  {readOnlyCharacter && characterId && (
                    <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">(Set from character page)</span>
                  )}
                </label>
                {readOnlyCharacter && characterId ? (
                  <div className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-300">
                    {pornstars.find(p => p.id === formData.character_id)
                      ? `${pornstars.find(p => p.id === formData.character_id)?.first_name || ''} ${pornstars.find(p => p.id === formData.character_id)?.last_name || ''}`.trim()
                      : 'Loading character...'}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Search for a character..."
                      value={pornstarSearchQuery}
                      onChange={(e) => setPornstarSearchQuery(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 mb-2"
                    />
                    <div className="relative">
                      <select
                        value={formData.character_id}
                        onChange={(e) => setFormData({ ...formData, character_id: e.target.value })}
                        disabled={isLoading || loadingPornstars}
                        className="w-full appearance-none rounded-md border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">No character</option>
                        {pornstars.map((pornstar) => (
                          <option key={pornstar.id} value={pornstar.id}>
                            {`${pornstar.first_name || ''} ${pornstar.last_name || ''}`.trim() || 'Unnamed'}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-700 dark:text-zinc-300">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                    {loadingPornstars && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Loading characters...</p>
                    )}
                  </>
                )}
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Associate this asset with a specific character/pornstar
                </p>
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
                  placeholder="Describe what you want to generate..."
                />
                {errors.prompt && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prompt}</p>
                )}
              </div>

              {/* Negative Prompt - Only if model supports it */}
              {formData.asset_type === 'image' && selectedModel?.supports_negative_prompt && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Negative Prompt (Optional)
                  </label>
                  <textarea
                    value={formData.negative_prompt}
                    onChange={(e) => setFormData({ ...formData, negative_prompt: e.target.value })}
                    disabled={isLoading}
                    rows={2}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                    placeholder="Describe what you don't want in the generation..."
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Specify elements to avoid in the generated image
                  </p>
                </div>
              )}

              {/* Reference Image - For both images and videos */}
              {(formData.asset_type === 'image' || formData.asset_type === 'video') && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Reference Image (Optional)
                  </h3>
                  <ul className="grid w-full gap-4">
                    <li>
                      <input
                        type="checkbox"
                        id="reference-image-option"
                        checked={useReferenceImage}
                        onChange={(e) => {
                          setUseReferenceImage(e.target.checked);
                          if (!e.target.checked) {
                            setSelectedReferenceAsset(null);
                            setFormData({ ...formData, reference_asset_id: undefined });
                          }
                        }}
                        disabled={isLoading}
                        className="hidden peer"
                      />
                      <label
                        htmlFor="reference-image-option"
                        className="inline-flex items-center justify-between w-full p-4 text-zinc-500 bg-white border-2 border-zinc-200 rounded-lg cursor-pointer dark:hover:text-zinc-300 dark:border-zinc-700 peer-checked:border-blue-600 dark:peer-checked:border-blue-600 hover:text-zinc-600 dark:peer-checked:text-zinc-300 peer-checked:text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                      >
                        <div className="block w-full">
                          <div className="flex items-center gap-3 mb-2">
                            <svg
                              className="w-6 h-6 text-blue-500"
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
                            <div className="w-full text-base font-semibold">Use Reference Image</div>
                          </div>
                          <div className="w-full text-sm text-zinc-500 dark:text-zinc-400">
                            Select an existing asset to use as reference for image-to-image generation
                          </div>
                        </div>
                      </label>
                    </li>
                  </ul>

                  {/* Selected reference asset preview */}
                  {useReferenceImage && selectedReferenceAsset && (
                    <div className="mt-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0 relative">
                          {selectedReferenceAsset.media_url ? (
                            <Image
                              src={selectedReferenceAsset.media_url}
                              alt="Reference"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-zinc-400"
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                            {typeof selectedReferenceAsset.title === 'string'
                              ? selectedReferenceAsset.title
                              : (selectedReferenceAsset.title as any)?.en || 'Untitled'}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                            {selectedReferenceAsset.asset_type}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReferenceAsset(null);
                            setFormData({ ...formData, reference_asset_id: undefined });
                          }}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Quality Settings */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">
                  Quality Settings
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Configure the output quality and dimensions for your {formData.asset_type}.
                </p>
              </div>

              {/* Image Quality Settings */}
              {formData.asset_type === 'image' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Aspect Ratio
                    </label>
                    <div className="relative">
                      <select
                        value={formData.aspect_ratio}
                        onChange={(e) => handleAspectRatioChange(e.target.value)}
                        disabled={isLoading}
                        className="w-full appearance-none rounded-md border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="square">Square (1:1) - 1024x1024</option>
                        <option value="landscape">Landscape (4:3) - 1024x768</option>
                        <option value="portrait">Portrait (3:4) - 768x1024</option>
                        <option value="16:9">Widescreen (16:9) - 1024x576</option>
                        <option value="custom">Custom</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-700 dark:text-zinc-300">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {formData.aspect_ratio === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Width (px)
                        </label>
                        <input
                          type="number"
                          value={formData.width}
                          onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                          disabled={isLoading}
                          min={256}
                          max={2048}
                          step={64}
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                        />
                        {errors.width && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.width}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Height (px)
                        </label>
                        <input
                          type="number"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                          disabled={isLoading}
                          min={256}
                          max={2048}
                          step={64}
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                        />
                        {errors.height && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.height}</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Video Quality Settings */}
              {formData.asset_type === 'video' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Resolution
                    </label>
                    <div className="relative">
                      <select
                        value={formData.video_resolution}
                        onChange={(e) => setFormData({ ...formData, video_resolution: e.target.value })}
                        disabled={isLoading}
                        className="w-full appearance-none rounded-md border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="640x480">SD (640x480)</option>
                        <option value="1280x720">HD (1280x720)</option>
                        <option value="1280x704">HD Portrait (1280x704)</option>
                        <option value="1024x704">Custom (1024x704)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-700 dark:text-zinc-300">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Duration: {formData.duration_seconds} seconds
                    </label>
                    <input
                      type="range"
                      value={formData.duration_seconds}
                      onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) })}
                      disabled={isLoading}
                      min={1}
                      max={15}
                      step={1}
                      className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      <span>1s</span>
                      <span>15s</span>
                    </div>
                    {errors.duration_seconds && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration_seconds}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      FPS (Frames Per Second)
                    </label>
                    <input
                      type="number"
                      value={formData.fps}
                      onChange={(e) => setFormData({ ...formData, fps: parseInt(e.target.value) })}
                      disabled={isLoading}
                      min={12}
                      max={60}
                      step={1}
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                    />
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Default: 24 FPS (Recommended for most videos)
                    </p>
                    {errors.fps && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fps}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Advanced Settings */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">
                  Advanced Settings
                </h3>
                <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20 mb-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        <strong>Advanced Users Only:</strong> These settings control the generation quality and behavior. The default values are recommended for most use cases.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Default: 3.0 - Controls how closely the generation follows the prompt (1-20)
                </p>
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
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Default: 30 - More steps = higher quality but slower generation (1-150)
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {submitError && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {submitError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handleBack}
              disabled={isLoading}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Manually call handleSubmit
                  await handleSubmit(e as any);
                }}
                disabled={isLoading || !canSubmit}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? 'Generating...' : 'Generate Asset'}
              </button>
            )}
          </div>
        </form>
        </div>

        {/* Media Library Selector - Right Side */}
        {useReferenceImage && (
          <div className="w-1/2 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Select Reference Image
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Choose an asset to use as reference for generation
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <MediaLibrarySelector
                onSelect={(asset) => {
                  setSelectedReferenceAsset(asset);
                  setFormData({ ...formData, reference_asset_id: asset.id });
                }}
                selectedAssetId={formData.reference_asset_id}
                assetType={formData.asset_type}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
