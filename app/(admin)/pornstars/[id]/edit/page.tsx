'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { pornstarService } from '@/services/pornstarService';
import { countryService } from '@/services/countryService';
import type { Pornstar, CreatePornstarData, Country } from '@/types/pornstar';
import ProtectedRoute from '@/components/ProtectedRoute';
import CountrySelect from '@/components/CountrySelect';

export default function EditPornstarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [pornstar, setPornstar] = useState<Pornstar | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreatePornstarData>({
    first_name: '',
    last_name: '',
    type: 'virtual',
    bio_content: '',
    bio_language: 'en',
    date_of_birth: '',
    country_id: undefined,
    height_cm: undefined,
    weight_kg: undefined,
    hair_color: '',
    eye_color: '',
    ethnicity: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pornstarData, countriesData] = await Promise.all([
          pornstarService.getById(id),
          countryService.getAll(),
        ]);

        setPornstar(pornstarData);
        setCountries(countriesData);
        setFormData({
          first_name: pornstarData.first_name,
          last_name: pornstarData.last_name,
          type: pornstarData.type,
          bio_content: pornstarData.bio?.content || '',
          bio_language: pornstarData.bio?.language || 'en',
          date_of_birth: pornstarData.date_of_birth || '',
          country_id: pornstarData.country?.id || undefined,
          height_cm: pornstarData.height_cm || undefined,
          weight_kg: pornstarData.weight_kg || undefined,
          hair_color: pornstarData.hair_color || '',
          eye_color: pornstarData.eye_color || '',
          ethnicity: pornstarData.ethnicity || '',
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load pornstar');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const submitData: CreatePornstarData = {
        ...formData,
        height_cm: formData.height_cm || undefined,
        weight_kg: formData.weight_kg || undefined,
        country_id: formData.country_id || undefined,
      };

      await pornstarService.update(id, submitData);
      router.push(`/pornstars/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update pornstar');
    } finally {
      setSubmitting(false);
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

  if (!pornstar) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
          <div className="text-red-600 dark:text-red-400">Pornstar not found</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.push(`/pornstars/${id}`)}
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              ← Back to Pornstar
            </button>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
              Edit Pornstar: {pornstar.first_name} {pornstar.last_name}
            </h1>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    First Name *
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Last Name *
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Type *
                  </label>
                  <select
                    id="type"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'real' | 'virtual' })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  >
                    <option value="virtual">Virtual</option>
                    <option value="real">Real</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="country_id" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Country
                  </label>
                  <CountrySelect
                    countries={countries}
                    value={formData.country_id}
                    onChange={(countryId) => setFormData({ ...formData, country_id: countryId })}
                    placeholder="Select a country"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio_content" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Bio
                </label>
                <textarea
                  id="bio_content"
                  value={formData.bio_content}
                  onChange={(e) => setFormData({ ...formData, bio_content: e.target.value })}
                  rows={6}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Date of Birth
                  </label>
                  <input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  />
                </div>

                <div>
                  <label htmlFor="ethnicity" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Ethnicity
                  </label>
                  <input
                    id="ethnicity"
                    type="text"
                    value={formData.ethnicity}
                    onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="height_cm" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Height (cm)
                  </label>
                  <input
                    id="height_cm"
                    type="number"
                    value={formData.height_cm || ''}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value ? Number(e.target.value) : undefined })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  />
                </div>

                <div>
                  <label htmlFor="weight_kg" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Weight (kg)
                  </label>
                  <input
                    id="weight_kg"
                    type="number"
                    value={formData.weight_kg || ''}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value ? Number(e.target.value) : undefined })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hair_color" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Hair Color
                  </label>
                  <input
                    id="hair_color"
                    type="text"
                    value={formData.hair_color}
                    onChange={(e) => setFormData({ ...formData, hair_color: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  />
                </div>

                <div>
                  <label htmlFor="eye_color" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Eye Color
                  </label>
                  <input
                    id="eye_color"
                    type="text"
                    value={formData.eye_color}
                    onChange={(e) => setFormData({ ...formData, eye_color: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push(`/pornstars/${id}`)}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
