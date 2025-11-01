'use client';

import { useState, useEffect } from 'react';
import { assetService } from '@/services/assetService';

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
  image_model?: string;
  duration_seconds?: number;
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
}: GenerateAssetModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<GenerateAssetFormData>({
    asset_type: 'image',
    title: '',
    description: '',
    prompt: '',
    negative_prompt: '',
    image_model: '',
    duration_seconds: 5,
    guidance_scale: 7.5,
    num_inference_steps: 50,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageModels, setImageModels] = useState<ImageModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ImageModel | null>(null);

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
        duration_seconds: 5,
        guidance_scale: 7.5,
        num_inference_steps: 50,
      });
      setErrors({});
      setSelectedModel(null);
      fetchImageModels();
    }
  }, [isOpen]);

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
      if (formData.asset_type === 'video' && (!formData.duration_seconds || formData.duration_seconds <= 0)) {
        newErrors.duration_seconds = 'Duration must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if not on final step
    if (currentStep !== totalSteps) {
      return;
    }

    if (!validateStep(4)) {
      return;
    }

    await onSubmit(formData);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Prevent Enter key from submitting form on intermediate steps
    if (e.key === 'Enter' && currentStep !== totalSteps && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      handleNext();
    }
  };

  if (!isOpen) return null;

  const totalSteps = 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-800">
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
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
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
                {step < 4 && (
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

              {/* Video Duration */}
              {formData.asset_type === 'video' && (
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
              )}

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
            </div>
          )}

          {/* Step 4: Advanced Settings */}
          {currentStep === 4 && (
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
                  Default: 7.5 - Controls how closely the generation follows the prompt (1-20)
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
                  Default: 50 - More steps = higher quality but slower generation (1-150)
                </p>
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
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? 'Generating...' : 'Generate Asset'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
