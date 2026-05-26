'use client';

import React, { useEffect } from 'react';
import { Toast, ToastType } from '@/context/ToastContext';

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  const { id, type, message, duration } = toast;

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  // Color theme definitions
  const themes: Record<ToastType, { border: string; bg: string; text: string; icon: React.ReactNode }> = {
    success: {
      border: '#10b981', // emerald
      bg: 'rgba(240, 253, 244, 0.95)',
      text: '#065f46',
      icon: (
        <svg style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      border: '#ef4444', // red
      bg: 'rgba(254, 242, 242, 0.95)',
      text: '#991b1b',
      icon: (
        <svg style={{ width: '20px', height: '20px', color: '#ef4444', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    warning: {
      border: '#f59e0b', // amber
      bg: 'rgba(255, 251, 235, 0.95)',
      text: '#92400e',
      icon: (
        <svg style={{ width: '20px', height: '20px', color: '#f59e0b', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      border: '#3b82f6', // blue
      bg: 'rgba(239, 246, 255, 0.95)',
      text: '#1e40af',
      icon: (
        <svg style={{ width: '20px', height: '20px', color: '#3b82f6', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const theme = themes[type];

  return (
    <div
      style={{
        pointerEvents: 'auto',
        background: theme.bg,
        borderLeft: `4px solid ${theme.border}`,
        borderRadius: '8px',
        padding: '0.85rem 1.1rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        width: '100%',
        boxSizing: 'border-box',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'toast-slide-in 0.28s cubic-bezier(0.215, 0.610, 0.355, 1) forwards',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
        {theme.icon}
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: theme.text,
            lineHeight: 1.4,
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </span>
      </div>
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          color: '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'background-color 0.2s, color 0.2s',
          marginLeft: '4px',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
          e.currentTarget.style.color = '#4b5563';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#9ca3af';
        }}
      >
        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          0% {
            transform: translateX(110%) scale(0.95);
            opacity: 0;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          pointerEvents: 'none',
          maxWidth: '380px',
          width: 'calc(100% - 3rem)',
          boxSizing: 'border-box'
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </>
  );
};

export default ToastContainer;
