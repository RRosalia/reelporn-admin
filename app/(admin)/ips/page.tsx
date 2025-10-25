'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';

interface IP {
  id: number;
  ip_address: string;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function IPWhitelistPage() {
  const [ips, setIps] = useState<IP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    ip_address: '',
    expiration_date: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchIPs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/ips');
      setIps(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch IP addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload: any = {
        ip_address: formData.ip_address,
      };

      if (formData.expiration_date) {
        payload.expiration_date = formData.expiration_date;
      }

      const response = await axiosInstance.post('/ips', payload);
      setSuccess(response.data.message || 'IP address successfully whitelisted');
      setFormData({ ip_address: '', expiration_date: '' });
      fetchIPs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to whitelist IP address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ipAddress: string) => {
    if (!confirm(`Are you sure you want to remove ${ipAddress} from the whitelist?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await axiosInstance.delete(`/ips/${ipAddress}`);
      setSuccess(response.data.message || 'IP address successfully removed');
      fetchIPs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove IP address');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          IP Whitelist Management
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage whitelisted IP addresses for admin access
        </p>
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

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Add IP Address
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ip_address" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              IP Address *
            </label>
            <input
              id="ip_address"
              type="text"
              required
              value={formData.ip_address}
              onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
              placeholder="192.168.1.100"
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="expiration_date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Expiration Date (Optional)
            </label>
            <input
              id="expiration_date"
              type="datetime-local"
              value={formData.expiration_date}
              onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Leave empty for permanent whitelist
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? 'Adding...' : 'Add IP Address'}
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Whitelisted IP Addresses
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-zinc-600 dark:text-zinc-400">
            Loading...
          </div>
        ) : ips.length === 0 ? (
          <div className="p-6 text-center text-zinc-600 dark:text-zinc-400">
            No whitelisted IP addresses found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-y border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Expiration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {ips.map((ip) => (
                  <tr key={ip.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {ip.ip_address}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {formatDate(ip.expiration_date)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {formatDate(ip.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleDelete(ip.ip_address)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
