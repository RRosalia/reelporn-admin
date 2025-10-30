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

interface AffiliateUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface PayoutFields {
  email?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  address?: string;
  zip_code?: string;
  iban?: string;
  swift_code?: string;
  [key: string]: string | undefined;
}

interface Payout {
  id: number;
  affiliate_user_id: number;
  affiliate_user: AffiliateUser;
  type: string;
  fields: PayoutFields;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export default function AffiliateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const affiliateId = params.id as string;

  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPayouts, setLoadingPayouts] = useState(true);
  const [error, setError] = useState('');
  const [showAllPayouts, setShowAllPayouts] = useState(false);

  useEffect(() => {
    fetchAffiliate();
    fetchPayouts();
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

  const fetchPayouts = async () => {
    try {
      setLoadingPayouts(true);

      const response = await axiosInstance.get<{ data: Payout[] }>(
        `/affiliates/${affiliateId}/payouts`
      );

      // Sort payouts to put primary first
      const sortedPayouts = response.data.data.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return 0;
      });

      setPayouts(sortedPayouts);
    } catch (err: any) {
      console.error('Failed to fetch payouts:', err);
      setPayouts([]);
    } finally {
      setLoadingPayouts(false);
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

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Payment Methods
            </h3>
            {!loadingPayouts && payouts.length > 1 && (
              <button
                onClick={() => setShowAllPayouts(!showAllPayouts)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showAllPayouts ? 'Show Primary Only' : `Show All (${payouts.length})`}
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          {loadingPayouts ? (
            <div className="text-center py-4">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-zinc-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Loading payment methods...</p>
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No payment methods configured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(showAllPayouts ? payouts : payouts.filter((p) => p.is_primary)).map((payout) => (
                <div
                  key={payout.id}
                  className={`rounded-lg border p-4 ${
                    payout.is_primary
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                      : 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 uppercase">
                          {payout.type}
                        </h4>
                        {payout.is_primary && (
                          <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-400">
                            Primary
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          <span className="font-medium">User:</span>{' '}
                          {payout.affiliate_user.first_name} {payout.affiliate_user.last_name}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {payout.affiliate_user.email}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {payout.type === 'paypal' && payout.fields.email && (
                          <div>
                            <dt className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              PayPal Email
                            </dt>
                            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                              {payout.fields.email}
                            </dd>
                          </div>
                        )}

                        {payout.type === 'wire' && (
                          <>
                            {payout.fields.first_name && (
                              <div>
                                <dt className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                  First Name
                                </dt>
                                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                                  {payout.fields.first_name}
                                </dd>
                              </div>
                            )}
                            {payout.fields.last_name && (
                              <div>
                                <dt className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                  Last Name
                                </dt>
                                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                                  {payout.fields.last_name}
                                </dd>
                              </div>
                            )}
                            {payout.fields.address && (
                              <div>
                                <dt className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                  Address
                                </dt>
                                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                                  {payout.fields.address}
                                </dd>
                              </div>
                            )}
                            {payout.fields.city && (
                              <div>
                                <dt className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                  City
                                </dt>
                                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                                  {payout.fields.city}
                                </dd>
                              </div>
                            )}
                            {payout.fields.zip_code && (
                              <div>
                                <dt className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                  Zip Code
                                </dt>
                                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                                  {payout.fields.zip_code}
                                </dd>
                              </div>
                            )}
                            {payout.fields.iban && (
                              <div>
                                <dt className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                  IBAN
                                </dt>
                                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50 font-mono">
                                  {payout.fields.iban}
                                </dd>
                              </div>
                            )}
                            {payout.fields.swift_code && (
                              <div>
                                <dt className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                  SWIFT Code
                                </dt>
                                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50 font-mono">
                                  {payout.fields.swift_code}
                                </dd>
                              </div>
                            )}
                          </>
                        )}

                        {/* Display any other fields dynamically */}
                        {Object.entries(payout.fields)
                          .filter(([key]) => {
                            // Skip already displayed fields
                            if (payout.type === 'paypal' && key === 'email') return false;
                            if (
                              payout.type === 'wire' &&
                              ['first_name', 'last_name', 'address', 'city', 'zip_code', 'iban', 'swift_code'].includes(key)
                            ) {
                              return false;
                            }
                            return true;
                          })
                          .map(([key, value]) => (
                            <div key={key}>
                              <dt className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </dt>
                              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                                {value}
                              </dd>
                            </div>
                          ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">
                          Added on {new Date(payout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
