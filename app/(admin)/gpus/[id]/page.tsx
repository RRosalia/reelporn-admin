'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gpuService } from '@/services/gpuService';
import type { GpuServer, GpuMessage } from '@/types/gpu';

export default function GpuServerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [server, setServer] = useState<GpuServer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGpuServer = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await gpuService.getById(params.id);
      setServer(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('GPU server not found');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch GPU server');
      }
      setServer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchGpuServer();
  }, [params.id]);

  // Listen to real-time GPU updates via WebSocket
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Echo) {
      return;
    }

    const channel = window.Echo.join('backend-gpu-server-processing');

    // Listen for client status updates for this specific server
    channel.listen('.client-status-update', (data: any) => {
      if (data.server_uuid === params.id) {
        console.log('[GPU Detail] Real-time update:', data);

        // Update server state in real-time
        setServer((prevServer) => {
          if (!prevServer) return null;

          // Create new message object
          const newMessage: GpuMessage = {
            timestamp: data.timestamp || new Date().toISOString(),
            received_at: new Date().toISOString(),
            server_uuid: data.server_uuid,
            event: data.event,
            task_id: data.task_id,
            task_type: data.task_type,
            details: data.details || {},
            ...data,
          };

          // Add message to beginning of array (newest first)
          const updatedMessages = [newMessage, ...prevServer.messages];

          // Update server with new message and metadata
          return {
            ...prevServer,
            last_seen: data.timestamp || new Date().toISOString(),
            event: data.event,
            last_event_timestamp: data.timestamp || new Date().toISOString(),
            messages: updatedMessages,
            message_count: updatedMessages.length,
          };
        });
      }
    });

    return () => {
      if (typeof window !== 'undefined' && window.Echo) {
        window.Echo.leave('backend-gpu-server-processing');
      }
    };
  }, [params.id]);

  const getEventColor = (event: string): string => {
    switch (event) {
      case 'task_started':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'task_completed':
      case 'image_generated':
      case 'video_generated':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'task_failed':
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'task_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading && !server) {
    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => router.push('/gpus')}
            className="mb-4 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Back to GPU Servers
          </button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => router.push('/gpus')}
            className="mb-4 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Back to GPU Servers
          </button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">GPU Server Not Found</h1>
        </div>
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/gpus')}
          className="mb-4 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to GPU Servers
        </button>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          GPU Server Details
        </h1>
        <p className="mt-1 font-mono text-sm text-zinc-600 dark:text-zinc-400">
          {server.server_uuid}
        </p>
      </div>

      {/* Server Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Last Event</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {server.event || 'N/A'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Total Messages</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {server.message_count}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Last Seen</p>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {new Date(server.last_seen).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">First Seen</p>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {new Date(server.first_seen).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Message History
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Last {server.message_count} events from this GPU server
          </p>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {server.messages.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No messages yet</p>
            </div>
          ) : (
            server.messages.map((message, index) => (
              <div key={index} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getEventColor(message.event)}`}>
                        {message.event}
                      </span>
                      {message.task_type && (
                        <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          {message.task_type}
                        </span>
                      )}
                    </div>
                    {message.task_id && (
                      <p className="mt-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        Task: {message.task_id}
                      </p>
                    )}
                    {message.details && Object.keys(message.details).length > 0 && (
                      <pre className="mt-2 overflow-x-auto rounded bg-zinc-100 p-3 text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50">
                        {JSON.stringify(message.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(message.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
