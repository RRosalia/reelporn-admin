'use client';

import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: '⚠️',
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      iconText: 'text-red-600 dark:text-red-400',
      confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    },
    warning: {
      icon: '⚠️',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconText: 'text-yellow-600 dark:text-yellow-400',
      confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-700',
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconText: 'text-blue-600 dark:text-blue-400',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all dark:bg-zinc-800">
          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg}`}>
              <span className={`text-2xl ${styles.iconText}`}>{styles.icon}</span>
            </div>

            {/* Title */}
            <h3 className="mt-4 text-center text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {title}
            </h3>

            {/* Message */}
            <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="bg-zinc-50 px-6 py-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end dark:bg-zinc-900">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto rounded-md px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmBtn}`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
