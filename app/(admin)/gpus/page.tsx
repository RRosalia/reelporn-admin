'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gpuService } from '@/services/gpuService';
import type { GpuServer, GpuStatistics } from '@/types/gpu';

export default function GpusPage() {
  const router = useRouter();
  const [servers, setServers] = useState<GpuServer[]>([]);
  const [statistics, setStatistics] = useState<GpuStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState('');

  const fetchGpuServers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await gpuService.getAll(20);
      setServers(response.data || []);
      setStatistics(response.statistics);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch GPU servers');
      setServers([]);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  };

  const handleProvisionGpu = async () => {
    try {
      setProvisioning(true);
      setError('');
      setProvisionSuccess('');

      const response = await gpuService.provision();
      setProvisionSuccess(response.message || 'GPU provisioning initiated successfully');

      // Clear success message after 5 seconds
      setTimeout(() => setProvisionSuccess(''), 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to provision GPU server';
      setError(errorMessage);
    } finally {
      setProvisioning(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchGpuServers();
  }, []);

  // Listen to real-time GPU updates via WebSocket
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Echo) {
      return;
    }

    const channel = window.Echo.join('backend-gpu-server-processing');

    // Listen for client status updates
    channel.listen('.client-status-update', (data: any) => {
      console.log('[GPU] Real-time update:', data);

      // Update the servers list in real-time
      setServers((prevServers) => {
        const serverUuid = data.server_uuid;
        const existingIndex = prevServers.findIndex(s => s.server_uuid === serverUuid);

        if (existingIndex >= 0) {
          // Update existing server
          const updatedServers = [...prevServers];
          updatedServers[existingIndex] = {
            ...updatedServers[existingIndex],
            last_seen: data.timestamp || new Date().toISOString(),
            event: data.event,
            last_event_timestamp: data.timestamp || new Date().toISOString(),
            message_count: updatedServers[existingIndex].message_count + 1,
          };
          return updatedServers;
        } else {
          // Add new server
          const newServer: GpuServer = {
            server_uuid: serverUuid,
            first_seen: data.timestamp || new Date().toISOString(),
            last_seen: data.timestamp || new Date().toISOString(),
            event: data.event,
            last_event_timestamp: data.timestamp || new Date().toISOString(),
            messages: [],
            message_count: 1,
          };
          return [newServer, ...prevServers];
        }
      });

      // Update statistics
      setStatistics((prevStats) => {
        if (!prevStats) {
          return { total_servers: 1, active_servers: 1, idle_servers: 0 };
        }
        // Recalculate stats - this is approximate, but avoids API call
        return {
          ...prevStats,
          active_servers: prevStats.active_servers + (prevStats.total_servers === 0 ? 1 : 0),
          total_servers: Math.max(prevStats.total_servers, servers.length),
        };
      });
    });

    return () => {
      if (typeof window !== 'undefined' && window.Echo) {
        window.Echo.leave('backend-gpu-server-processing');
      }
    };
  }, []);

  const getTimeSinceLastSeen = (lastSeen: string): string => {
    const diff = Date.now() - new Date(lastSeen).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const isServerActive = (lastSeen: string): boolean => {
    const diff = Date.now() - new Date(lastSeen).getTime();
    return diff < 5 * 60 * 1000; // Active if seen in last 5 minutes
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            GPU Servers
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Monitor GPU servers connected via Vast.ai (Real-time updates via WebSocket)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchGpuServers}
            disabled={loading}
            className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleProvisionGpu}
            disabled={provisioning}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {provisioning ? 'Provisioning...' : 'Provision GPU'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {provisionSuccess && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-400">{provisionSuccess}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm font-semibold text-red-800 dark:text-red-400">Error:</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Servers
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {statistics.total_servers}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Active Servers
            </p>
            <p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">
              {statistics.active_servers}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Idle Servers
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-500 dark:text-zinc-400">
              {statistics.idle_servers}
            </p>
          </div>
        </div>
      )}

      {/* Servers List */}
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="overflow-x-auto">
          {loading && servers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading GPU servers...</p>
            </div>
          ) : servers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No GPU servers connected
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Server UUID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Last Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Last Seen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    First Seen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {servers.map((server) => (
                  <tr
                    key={server.server_uuid}
                    onClick={() => router.push(`/gpus/${server.server_uuid}`)}
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">
                      <div className="font-mono text-zinc-900 dark:text-zinc-50">
                        {server.server_uuid.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          isServerActive(server.last_seen)
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}
                      >
                        {isServerActive(server.last_seen) ? 'Active' : 'Idle'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {server.event || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {getTimeSinceLastSeen(server.last_seen)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {server.message_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(server.first_seen).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
