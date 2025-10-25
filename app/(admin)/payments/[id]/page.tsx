'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { paymentService } from '@/services/paymentService';
import type { Payment } from '@/types/payment';

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayment();
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await paymentService.getById(paymentId);
      setPayment(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payment details');
      setPayment(null);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusBadge = (status: Payment['status']) => {
    const statusColors: Record<Payment['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      detected: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      cancelled: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    };

    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const getPayableType = (type: string) => {
    const parts = type.split('\\');
    return parts[parts.length - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Payment Details
          </h2>
          <button
            onClick={() => router.push('/payments')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
          >
            Back to Payments
          </button>
        </div>

        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            {error || 'Payment not found'}
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
            Payment #{payment.id}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Payment Details
          </p>
        </div>
        <button
          onClick={() => router.push('/payments')}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
        >
          Back to Payments
        </button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Payment Information
          </h3>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                ID
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {payment.id}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                User ID
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {payment.user_id}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Payable Type
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {getPayableType(payment.payable_type)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Payable ID
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {payment.payable_id}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Payment Method
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {payment.payment_method.replace('_', ' ')}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Amount
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {formatAmount(payment.amount_cents)}
                <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                  ({payment.amount_cents} cents)
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Status
              </dt>
              <dd className="mt-1">
                {getStatusBadge(payment.status)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Completed At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {payment.completed_at ? new Date(payment.completed_at).toLocaleString() : 'Not completed'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Expires At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {payment.expires_at ? new Date(payment.expires_at).toLocaleString() : 'No expiration'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Payment Data
          </h3>
        </div>
        <div className="p-6">
          <pre className="text-sm text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-900 p-4 rounded overflow-auto">
            {JSON.stringify(payment.payment_data, null, 2)}
          </pre>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Metadata
          </h3>
        </div>
        <div className="p-6">
          <pre className="text-sm text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-900 p-4 rounded overflow-auto">
            {JSON.stringify(payment.metadata, null, 2)}
          </pre>
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
                {new Date(payment.created_at).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Updated At
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {new Date(payment.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
