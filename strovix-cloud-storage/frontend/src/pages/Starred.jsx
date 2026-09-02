import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { starApi } from '../services/publicLink.api.js';
import { EmptyState, LoadingSpinner } from '../components/common/ui.jsx';
import { getFileIcon } from '../utils/fileIcons.js';
import { formatDate } from '../utils/formatDate.js';
import { StarOff } from 'lucide-react';

export default function Starred() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['starred'],
    queryFn: () => starApi.list().then((r) => r.data),
  });

  const unstar = useMutation({
    mutationFn: (payload) => starApi.unstar(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['starred'] });
      toast.success('Removed from starred');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <LoadingSpinner label="Loading starred..." />;
  const items = data || [];

  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900 dark:text-slate-100">Starred</h1>
      {items.length === 0 ? (
        <EmptyState title="No starred files" description="Star files and folders to find them quickly." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((star) => {
            const item = star.file || star.folder;
            const isFolder = Boolean(star.folder);
            const Icon = getFileIcon(item?.mimeType, isFolder);
            return (
              <div key={star._id} className="rounded-2xl border border-[var(--color-line)] bg-white/80 p-4 dark:bg-slate-800/80">
                <div className="mb-3 flex items-start justify-between">
                  <Icon size={28} className={isFolder ? 'text-amber-500' : 'text-teal-600'} />
                  <button
                    type="button"
                    onClick={() =>
                      unstar.mutate(isFolder ? { folderId: item._id } : { fileId: item._id })
                    }
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    <StarOff size={16} />
                  </button>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{item?.name}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {isFolder ? 'Folder' : 'File'} · {formatDate(star.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
