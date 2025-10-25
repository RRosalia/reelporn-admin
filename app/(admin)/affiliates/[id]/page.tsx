'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';

interface Affiliate {
  id: number;
  company_name: string;
  email: string;
  contact_person: string;
  phone: string;
  website: string;
  lc_country_id: number;
  address: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function AffiliateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const affiliateId = params.id as string;

  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAffiliate();
  }, [affiliateId]);

  const fetchAffiliate = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axiosInstance.get<{ data: Affiliate }>(
        `/affiliates/${affiliateId}`
      );

      setAffiliate(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch affiliate details');
      setAffiliate(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading affiliate details...</p>
        </div>
      </div>
    );
  }

  if (error || !affiliate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Affiliate Details
          </h2>
          <button
            onClick={() => router.push('/affiliates')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
          >
            Back to Affiliates
          </button>
        </div>

        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            {error || 'Affiliate not found'}
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
            {affiliate.company_name}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Affiliate Details
          </p>
        </div>
        <button
          onClick={() => router.push('/affiliates')}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
        >
          Back to Affiliates
        </button>
      </div>

      {affiliate.deleted_at && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            This affiliate was deleted on {new Date(affiliate.deleted_at).toLocaleString()}
          </p>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Company Information
          </h3>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Company Name
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {affiliate.company_name}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Email
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                <a
                  href={`mailto:${affiliate.email}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {affiliate.email}
                </a>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Contact Person
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {affiliate.contact_person}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Phone
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                <a
                  href={`tel:${affiliate.phone}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {affiliate.phone}
                </a>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Website
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {affiliate.website ? (
                  <a
                    href={affiliate.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {affiliate.website}
                  </a>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-600">Not provided</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Country ID
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {affiliate.lc_country_id}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Address
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {affiliate.address}
              </dd>
            </div>
          </dl>
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
                {new Date(affiliate.created_at).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Updated At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(affiliate.updated_at).toLocaleString()}
              </dd>
            </div>

            {affiliate.deleted_at && (
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Deleted At
                </dt>
                <dd className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {new Date(affiliate.deleted_at).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Status
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2">
            {affiliate.deleted_at ? (
              <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800 dark:bg-red-900/20 dark:text-red-400">
                Deleted
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Active
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
