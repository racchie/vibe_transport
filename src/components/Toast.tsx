'use client';

import React from 'react';
import type { ToastItem } from '../hooks/useToast';

interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

// Icon components for each toast type
function SuccessIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4v2m0 0H9m3 0h3"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

const toastConfig = {
  success: {
    icon: SuccessIcon,
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-700',
    textColor: 'text-green-800 dark:text-green-200',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  error: {
    icon: ErrorIcon,
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-700',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  warning: {
    icon: WarningIcon,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    icon: InfoIcon,
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-700',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
};

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div
      className="fixed right-4 bottom-4 z-50 flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const config = toastConfig[toast.type];
        const IconComponent = config.icon;

        return (
          <div
            key={toast.id}
            className={`
              animate-fadeIn max-w-xs w-full pointer-events-auto
              ${config.bgColor} ${config.borderColor} ${config.textColor}
              border rounded-lg shadow-lg px-4 py-3
              flex items-start gap-3 transition-all
            `}
          >
            <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
              <IconComponent />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className={`flex-shrink-0 ml-2 ${config.iconColor} hover:opacity-75 transition-opacity`}
              aria-label={`Close notification`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
