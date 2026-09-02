import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { trashApi } from '../services/publicLink.api.js';
import { ConfirmModal, EmptyState, LoadingSpinner } from '../components/common/ui.jsx';
import { formatDate } from '../utils/formatDate.js';

export default function Trash() {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ['trash'],
    queryFn: () => trashApi.list().then((r) => r.data),
  });

  const restore = useMutation({
    mutationFn: ({ id, type }) => trashApi.restore(id, type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trash'] });
      qc.invalidateQueries({ queryKey: ['folder-contents'] });
      toast.success('Restored');
    },
    onError: (err) => toast.error(err.message),
  });

  const permanent = useMutation({
    mutationFn: ({ id, type }) => trashApi.permanentDelete(id, type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trash'] });
      qc.invalidateQueries({ queryKey: ['storage'] });
      toast.success('Permanently deleted');
      setConfirm(null);
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <LoadingSpinner label="Loading trash..." />;
  const items = data || [];

  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900 dark:text-slate-100">Trash</h1>
      {items.length === 0 ? (
        <EmptyState title="Trash is empty" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-white/80 dark:bg-slate-800/80">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[var(--color-line)] text-left text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Deleted</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{item.name}</td>
                  <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">{item.type}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(item.deletedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => restore.mutate({ id: item.id, type: item.type })}
                        className="text-blue-700 hover:underline dark:text-blue-400"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirm(item)}
                        className="text-red-600 hover:underline dark:text-red-400"
                      >
                        Delete forever
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title="Delete forever?"
        message={`"${confirm?.name}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete forever"
        danger
        onConfirm={() => permanent.mutate({ id: confirm.id, type: confirm.type })}
      />
    </div>
  );
}
