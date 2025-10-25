'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { EchoChannel } from '@/lib/echo-config';

/**
 * Custom hook that automatically subscribes to the backend-gpu-server-processing presence channel
 *
 * This hook will automatically join the presence channel when the user is authenticated
 * and leave it when they log out or the component unmounts.
 *
 * @returns The Echo presence channel instance if authenticated, null otherwise
 */
export function useGpuServerChannel(): EchoChannel | null {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Don't attempt to subscribe if still loading auth state
    if (loading) {
      return;
    }

    // Only subscribe if user is authenticated
    if (!user) {
      return;
    }

    // Ensure Echo is available
    if (typeof window === 'undefined' || !window.Echo) {
      console.warn('Laravel Echo is not initialized');
      return;
    }

    const channelName = 'backend-gpu-server-processing';

    // Subscribe to the presence channel
    console.log(`[Echo] Joining presence channel: ${channelName}`);
    window.Echo.join(channelName);

    // Cleanup: leave the channel when component unmounts or user logs out
    return () => {
      if (typeof window !== 'undefined' && window.Echo) {
        console.log(`[Echo] Leaving presence channel: ${channelName}`);
        window.Echo.leave(channelName);
      }
    };
  }, [user, loading]);

  // Return the channel instance if authenticated, otherwise null
  if (typeof window !== 'undefined' && user && window.Echo) {
    return window.Echo.join('backend-gpu-server-processing') as EchoChannel;
  }
  return null;
}
