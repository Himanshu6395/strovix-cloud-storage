import { useQuery } from '@tanstack/react-query';
import { shareApi } from '../services/share.api.js';
import { EmptyState, LoadingSpinner } from '../components/common/ui.jsx';
import { formatDate } from '../utils/formatDate.js';
import { getFileIcon } from '../utils/fileIcons.js';

export default function SharedWithMe() {
  const { data, isLoading } = useQuery({
    queryKey: ['shared-with-me'],
    queryFn: () => shareApi.sharedWithMe().then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner label="Loading shared items..." />;

  const items = data || [];

  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900 dark:text-slate-100">Shared with me</h1>
      {items.length === 0 ? (
        <EmptyState title="Nothing shared yet" description="Files and folders shared with you will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-white/80 dark:bg-slate-800/80">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[var(--color-line)] text-left text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Shared</th>
              </tr>
            </thead>
            <tbody>
              {items.map((share) => {
                const item = share.file || share.folder;
                const isFolder = Boolean(share.folder);
                const Icon = getFileIcon(item?.mimeType, isFolder);
                return (
                  <tr key={share._id} className="border-b border-slate-100 dark:border-slate-700">
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <Icon size={18} className={isFolder ? 'text-amber-500' : 'text-teal-600'} />
                        {item?.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{share.owner?.name || share.owner?.email}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{share.role}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(share.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
