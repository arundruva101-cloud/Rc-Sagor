import React, { useEffect } from 'react';
import { XMarkIcon } from './icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className={`${bgColor} text-white font-bold rounded-lg shadow-lg flex items-center justify-between p-4 min-w-[300px] animate-fade-in-up`}>
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
