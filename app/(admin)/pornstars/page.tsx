'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pornstarService } from '@/services/pornstarService';
import { countryService } from '@/services/countryService';
import type { Pornstar, PaginationMeta, Country } from '@/types/pornstar';
import CountrySelect from '@/components/CountrySelect';
import ConfirmModal from '@/components/ConfirmModal';

export default function PornstarsPage() {
  const router = useRouter();
  const [pornstars, setPornstars] = useState<Pornstar[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTrashed, setShowTrashed] = useState(false);
  const [perPage, setPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'real' | 'virtual'>('all');
  const [filterCountry, setFilterCountry] = useState<number | null>(null);
  const [modalAction, setModalAction] = useState<{ type: 'delete' | 'restore', id: string, name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await countryService.getAll();
        setCountries(data);
      } catch (err) {
        console.error('Failed to load countries:', err);
      }
    };
    loadCountries();
  }, []);

  const fetchPornstars = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await pornstarService.getAll({
        page,
        per_page: perPage,
        trashed: showTrashed,
        type: filterType !== 'all' ? filterType : undefined,
        country_id: filterCountry || undefined,
        query: searchQuery || undefined,
      });
      setPornstars(response.data);
      setMeta(response.meta);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pornstars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPornstars(1);
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [perPage, showTrashed, filterType, filterCountry, searchQuery]);

  const handleDeleteClick = (id: string, name: string) => {
    setModalAction({ type: 'delete', id, name });
  };

  const handleRestoreClick = (id: string, name: string) => {
    setModalAction({ type: 'restore', id, name });
  };

  const handleModalConfirm = async () => {
    if (!modalAction) return;

    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      if (modalAction.type === 'delete') {
        await pornstarService.delete(modalAction.id);
        setSuccess('Pornstar deleted successfully');
      } else {
        await pornstarService.restore(modalAction.id);
        setSuccess('Pornstar restored successfully');
      }
      fetchPornstars(currentPage);
      setModalAction(null);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${modalAction.type} pornstar`);
    } finally {
      setActionLoading(false);
    }
  };

  const getFullName = (pornstar: Pornstar) => {
    return `${pornstar.first_name} ${pornstar.last_name}`.trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Pornstars Management
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage pornstars in the system
          </p>
        </div>
        <button
          onClick={() => router.push('/pornstars/create')}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add Pornstar
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-400">{success}</p>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Pornstars List {meta && `(${meta.total} total)`}
            </h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={showTrashed}
                  onChange={(e) => setShowTrashed(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-600"
                />
                Show Deleted
              </label>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
              >
                <option value={15}>15 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search pornstars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'real' | 'virtual')}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
              >
                <option value="all">All Types</option>
                <option value="real">Real</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>

            <div>
              <CountrySelect
                countries={countries}
                value={filterCountry || undefined}
                onChange={(countryId) => setFilterCountry(countryId || null)}
                placeholder="All Countries"
                className="w-full text-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-zinc-600 dark:text-zinc-400">Loading...</div>
        ) : pornstars.length === 0 ? (
          <div className="p-6 text-center text-zinc-600 dark:text-zinc-400">
            No pornstars found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Views
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {pornstars.map((pornstar) => (
                    <tr
                      key={pornstar.id}
                      className={`cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700 ${pornstar.deleted_at ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                      onClick={() => router.push(`/pornstars/${pornstar.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {pornstar.profile_image && (
                            <img
                              src={pornstar.profile_image.thumb}
                              alt={getFullName(pornstar)}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                              {getFullName(pornstar)}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{pornstar.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          pornstar.type === 'real'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                          {pornstar.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {pornstar.age}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {pornstar.country?.name || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="flex flex-col gap-1 text-xs">
                          <span>Videos: {pornstar.videos_count}</span>
                          <span>Images: {pornstar.images_count}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {pornstar.views_count.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm space-x-3">
                        {pornstar.deleted_at ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreClick(pornstar.id, getFullName(pornstar));
                            }}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/pornstars/${pornstar.id}/edit`);
                              }}
                              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(pornstar.id, getFullName(pornstar));
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 dark:border-zinc-700">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Showing {meta.from} to {meta.to} of {meta.total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchPornstars(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-md border border-zinc-300 px-3 py-1 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-3 text-sm text-zinc-600 dark:text-zinc-400">
                    Page {currentPage} of {meta.last_page}
                  </span>
                  <button
                    onClick={() => fetchPornstars(currentPage + 1)}
                    disabled={currentPage === meta.last_page}
                    className="rounded-md border border-zinc-300 px-3 py-1 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={modalAction !== null}
        onClose={() => setModalAction(null)}
        onConfirm={handleModalConfirm}
        title={modalAction?.type === 'delete' ? 'Delete Pornstar' : 'Restore Pornstar'}
        message={
          modalAction?.type === 'delete'
            ? `Are you sure you want to delete ${modalAction.name}? This action cannot be undone.`
            : `Are you sure you want to restore ${modalAction?.name}?`
        }
        confirmText={modalAction?.type === 'delete' ? 'Delete' : 'Restore'}
        cancelText="Cancel"
        variant={modalAction?.type === 'delete' ? 'danger' : 'info'}
        isLoading={actionLoading}
      />
    </div>
  );
}
