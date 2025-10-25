'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { subscriptionService } from '@/services/subscriptionService';
import type { Subscription } from '@/types/subscription';

export default function SubscriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subscriptionId = params.id as string;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscription();
  }, [subscriptionId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await subscriptionService.getById(subscriptionId);
      setSubscription(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subscription details');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriberType = (type: string) => {
    const parts = type.split('\\');
    return parts[parts.length - 1];
  };

  const getSubscriptionState = (subscription: Subscription) => {
    const now = new Date();

    if (subscription.suppressed_at) {
      return { state: 'Suppressed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' };
    }

    if (subscription.canceled_at) {
      return { state: 'Canceled', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' };
    }

    if (subscription.expired_at && new Date(subscription.expired_at) < now) {
      return { state: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' };
    }

    if (subscription.grace_days_ended_at) {
      const graceEnd = new Date(subscription.grace_days_ended_at);
      if (graceEnd > now) {
        return { state: 'In Grace Period', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' };
      }
    }

    if (!subscription.started_at || new Date(subscription.started_at) > now) {
      return { state: 'Pending', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' };
    }

    return { state: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Subscription Details
          </h2>
          <button
            onClick={() => router.push('/subscriptions')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
          >
            Back to Subscriptions
          </button>
        </div>

        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            {error || 'Subscription not found'}
          </p>
        </div>
      </div>
    );
  }

  const { state, color } = getSubscriptionState(subscription);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Subscription #{subscription.id}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Subscription Details
          </p>
        </div>
        <button
          onClick={() => router.push('/subscriptions')}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
        >
          Back to Subscriptions
        </button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Subscription Information
            </h3>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${color}`}>
              {state}
            </span>
          </div>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                ID
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {subscription.id}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Plan ID
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {subscription.plan_id}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Subscriber Type
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {getSubscriberType(subscription.subscriber_type)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Subscriber ID
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {subscription.subscriber_id}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Was Switched
              </dt>
              <dd className="mt-1">
                {subscription.was_switched ? (
                  <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                    Yes
                  </span>
                ) : (
                  <span className="text-zinc-600 dark:text-zinc-400">No</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Subscription Dates
          </h3>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Started At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(subscription.started_at).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Canceled At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {subscription.canceled_at ? new Date(subscription.canceled_at).toLocaleString() : 'Not canceled'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Expired At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {subscription.expired_at ? new Date(subscription.expired_at).toLocaleString() : 'Not expired'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Grace Days Ended At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {subscription.grace_days_ended_at ? new Date(subscription.grace_days_ended_at).toLocaleString() : 'N/A'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Suppressed At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {subscription.suppressed_at ? new Date(subscription.suppressed_at).toLocaleString() : 'Not suppressed'}
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
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Created At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(subscription.created_at).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Updated At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(subscription.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
