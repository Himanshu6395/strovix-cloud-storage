import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch.js';
import { EmptyState, LoadingSpinner } from '../components/common/ui.jsx';
import { formatDate } from '../utils/formatDate.js';
import { getFileIcon } from '../utils/fileIcons.js';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [type, setType] = useState(params.get('type') || 'all');
  const q = params.get('q') || '';

  const queryParams = useMemo(() => ({ q, type: type === 'all' ? undefined : type, page: 1, limit: 40 }), [q, type]);
  const { data, isLoading, isFetching } = useSearch(queryParams, Boolean(q));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900 dark:text-slate-100">Search</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{q ? `Results for "${q}"` : 'Search files and folders...'}</p>
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            const next = new URLSearchParams(params);
            if (e.target.value === 'all') next.delete('type');
            else next.set('type', e.target.value);
            setParams(next);
          }}
          className="rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="all">All</option>
          <option value="file">Files</option>
          <option value="folder">Folders</option>
        </select>
      </div>

      {!q && <EmptyState title="Start searching" description="Use the top search bar to find files and folders." />}
      {q && (isLoading || isFetching) && <LoadingSpinner label="Searching..." />}
      {q && !isLoading && (data?.items || []).length === 0 && (
        <EmptyState title="No matches" description="Try a different keyword or filter." />
      )}

      <div className="space-y-2">
        {(data?.items || []).map((item) => {
          const isFolder = item.resourceType === 'folder';
          const Icon = getFileIcon(item.mimeType, isFolder);
          return (
            <div
              key={`${item.resourceType}-${item._id}`}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-white/80 px-4 py-3 dark:bg-slate-800/80"
            >
              <Icon size={20} className={isFolder ? 'text-amber-500' : 'text-teal-600'} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isFolder ? 'Folder' : item.mimeType} · {formatDate(item.updatedAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
