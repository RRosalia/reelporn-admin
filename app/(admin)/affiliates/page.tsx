'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

interface AffiliatesResponse {
  data: Affiliate[];
  meta: PaginationMeta;
}

export default function AffiliatesPage() {
  const router = useRouter();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrashed, setShowTrashed] = useState(false);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const fetchAffiliates = async (page = 1, search = '', trashed = false) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());

      if (search.trim()) {
        params.append('query', search.trim());
      }

      if (trashed) {
        params.append('trashed', '1');
      }

      const response = await axiosInstance.get<AffiliatesResponse>(
        `/affiliates?${params.toString()}`
      );

      setAffiliates(response.data.data || []);
      setMeta(response.data.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch affiliates');
      setAffiliates([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates(currentPage, searchQuery, showTrashed);
  }, [currentPage, showTrashed, perPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchAffiliates(1, query, showTrashed);
  };

  const handleToggleTrashed = () => {
    setShowTrashed(!showTrashed);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Affiliates Management
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage affiliate companies and partners
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Affiliates</h3>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {meta?.total || 0}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Current Page</h3>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {affiliates.length} of {meta?.total || 0}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by company, email, contact person, phone, website..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
            <div className="flex gap-2">
              <label className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTrashed}
                  onChange={handleToggleTrashed}
                  className="rounded border-zinc-300 text-zinc-600 focus:ring-zinc-500"
                />
                <span>Include Deleted</span>
              </label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
              >
                <option value="10">10 per page</option>
                <option value="15">15 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-zinc-600 dark:text-zinc-400">Loading...</div>
        ) : affiliates.length === 0 ? (
          <div className="p-6 text-center text-zinc-600 dark:text-zinc-400">
            {searchQuery ? 'No affiliates found matching your search' : 'No affiliates found'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {affiliates.map((affiliate) => (
                    <tr
                      key={affiliate.id}
                      onClick={() => router.push(`/affiliates/${affiliate.id}`)}
                      className={`cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors ${
                        affiliate.deleted_at ? 'bg-red-50 dark:bg-red-900/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {affiliate.company_name}
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          {affiliate.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                        {affiliate.contact_person}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                        {affiliate.phone}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {affiliate.website ? (
                          <a
                            href={affiliate.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Visit
                          </a>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="max-w-xs truncate" title={affiliate.address}>
                          {affiliate.address}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(affiliate.created_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {affiliate.deleted_at ? (
                          <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            Deleted
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === meta.last_page}
                    className="relative ml-3 inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-400">
                      Showing <span className="font-medium">{meta.from || 0}</span> to{' '}
                      <span className="font-medium">{meta.to || 0}</span> of{' '}
                      <span className="font-medium">{meta.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-zinc-600 dark:hover:bg-zinc-700"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === meta.last_page ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                page === currentPage
                                  ? 'z-10 bg-zinc-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600'
                                  : 'text-zinc-900 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 focus:z-20 focus:outline-offset-0 dark:text-zinc-50 dark:ring-zinc-600 dark:hover:bg-zinc-700'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span
                              key={page}
                              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-300 dark:text-zinc-400 dark:ring-zinc-600"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === meta.last_page}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-zinc-600 dark:hover:bg-zinc-700"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
