import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Folder, HardDrive, AlertTriangle, X, LogOut } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading drive contents...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500 dark:text-slate-400">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-teal-400/20" />
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-600 dark:border-teal-900 dark:border-t-teal-400" />
      </div>
      <p className="animate-pulse text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description, action, icon: Icon = Folder }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300/80 bg-white/70 px-6 py-16 text-center shadow-sm backdrop-blur-md dark:border-slate-600/80 dark:bg-slate-800/70">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-50 to-emerald-100 text-teal-600 shadow-inner dark:from-teal-900/40 dark:to-emerald-900/30 dark:text-teal-400">
        <Icon size={32} />
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  // Handle Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-up"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal Container */}
      <div
        className={`relative z-10 flex max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 animate-scale-up dark:bg-slate-900 dark:ring-slate-700/50 ${
          wide ? 'sm:w-full sm:max-w-[640px]' : 'sm:w-full sm:max-w-md'
        }`}
      >
        {/* Sticky Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 id="modal-title" className="truncate pr-3 font-[family-name:var(--font-display)] text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus:ring-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  icon: Icon = AlertTriangle,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              danger
                ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                : 'bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400'
            }`}
          >
            <Icon size={18} />
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md transition ${
              danger
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function StorageIndicator({ used = 0, quota = 1 }) {
  const pct = Math.min(100, Math.max(0, quota ? (used / quota) * 100 : 0));
  const format = (n) => {
    if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
    if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
    return `${Math.round(n / 1024)} KB`;
  };

  const isHigh = pct > 85;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-3.5 shadow-sm dark:border-slate-700/80 dark:from-slate-800 dark:to-slate-900/70">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <HardDrive size={14} className="text-teal-600 dark:text-teal-400" />
          <span>Storage</span>
        </div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {format(used)} / {format(quota)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 p-0.5 dark:bg-slate-700/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isHigh
              ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-sm'
              : 'bg-gradient-to-r from-teal-500 to-emerald-400 shadow-sm'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500">
        <span>{pct.toFixed(0)}% used</span>
        {isHigh && <span className="text-amber-600 font-semibold">Running low</span>}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Folder Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-700" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/80 border border-slate-100 shadow-sm dark:bg-slate-800/80 dark:border-slate-700" />
          ))}
        </div>
      </div>
      {/* File Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-700" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: count - 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-white/80 border border-slate-100 shadow-sm dark:bg-slate-800/80 dark:border-slate-700" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default { LoadingSpinner, EmptyState, Modal, ConfirmModal, StorageIndicator, SkeletonGrid };
