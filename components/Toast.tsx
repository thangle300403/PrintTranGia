
import React, { useEffect } from 'react';
import { CheckCircleIcon, CloseIcon, WarningIcon } from './icons/Icons';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose, duration]);

  if (!message) return null;

  let bgClass = 'bg-gray-800';
  let icon = null;

  switch (type) {
      case 'success':
          bgClass = 'bg-green-600';
          icon = <CheckCircleIcon className="w-5 h-5 text-white" />;
          break;
      case 'error':
          bgClass = 'bg-red-600';
          icon = <CloseIcon className="w-5 h-5 text-white" />;
          break;
      case 'warning':
          bgClass = 'bg-yellow-500'; // Orange/Yellow for warnings
          icon = <WarningIcon className="w-5 h-5 text-white" />;
          break;
      case 'info':
      default:
          bgClass = 'bg-gray-800';
          icon = <WarningIcon className="w-5 h-5 text-white" />;
          break;
  }

  return (
    <div className={`fixed top-5 right-5 ${bgClass} text-white px-6 py-4 rounded-lg shadow-lg z-[100] animate-slide-in-right flex items-start gap-3 max-w-md`}>
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1">
          <p className="font-medium text-sm leading-snug whitespace-pre-line">{message}</p>
      </div>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 flex-shrink-0">
          <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
