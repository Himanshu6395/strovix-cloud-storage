import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FolderPlus,
  LayoutGrid,
  List,
  Plus,
  Upload,
  ArrowUpDown,
  Filter,
  FileText,
  Image as ImageIcon,
  Film,
  Folder as FolderIcon,
  Star,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs } from '../components/layout/Breadcrumbs.jsx';
import { FileExplorer } from '../components/files/FileExplorer.jsx';
import { UploadZone, UploadProgress } from '../components/files/UploadZone.jsx';
import { CreateFolderModal, RenameModal } from '../components/folders/FolderModals.jsx';
import { ShareModal } from '../components/sharing/ShareModal.jsx';
import { FilePreviewModal } from '../components/files/FilePreviewModal.jsx';
import { ConfirmModal, EmptyState, SkeletonGrid } from '../components/common/ui.jsx';
import { useFolderContents, useCreateFolder, useRenameFolder, useDeleteFolder } from '../hooks/useFolders.js';
import { useDeleteFile, useDownloadFile, useRenameFile } from '../hooks/useFiles.js';
import { useUpload } from '../hooks/useUpload.js';
import { fileApi } from '../services/file.api.js';
import { starApi } from '../services/publicLink.api.js';
import { loadPreviewObjectUrl, revokePreviewObjectUrl } from '../utils/filePreview.js';

const FILTERS = [
  { id: 'all', label: 'All Files', icon: Sparkles },
  { id: 'folders', label: 'Folders', icon: FolderIcon },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'media', label: 'Audio & Video', icon: Film },
  { id: 'starred', label: 'Starred', icon: Star },
];

export default function MyDrive() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [folderId, setFolderId] = useState(null);
  const [view, setView] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'date' | 'size'
  const [sortOrder, setSortOrder] = useState('asc');

  const [createOpen, setCreateOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [preview, setPreview] = useState({ file: null, url: null });
  const qc = useQueryClient();

  const contents = useFolderContents(folderId || 'root');
  const createFolder = useCreateFolder(folderId);
  const renameFolder = useRenameFolder();
  const deleteFolder = useDeleteFolder();
  const renameFile = useRenameFile();
  const deleteFile = useDeleteFile();
  const downloadFile = useDownloadFile();
  const { uploads, uploadFiles, cancelUpload, clearFinished } = useUpload(folderId);

  useEffect(() => {
    if (params.get('createFolder') === '1') setCreateOpen(true);
  }, [params]);

  const openItem = (item, type) => {
    if (type === 'folder') {
      setFolderId(item._id);
      setActiveFilter('all');
    } else {
      handlePreview(item);
    }
  };

  const handlePreview = async (file) => {
    try {
      const res = await fileApi.getPreviewDownload(file._id);
      const url = await loadPreviewObjectUrl(file, res.data.downloadUrl);
      setPreview((prev) => {
        revokePreviewObjectUrl(prev.url);
        return { file, url };
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const closePreview = () => {
    setPreview((prev) => {
      revokePreviewObjectUrl(prev.url);
      return { file: null, url: null };
    });
  };

  const onStar = async (item, type) => {
    try {
      await starApi.star(type === 'file' ? { fileId: item._id } : { folderId: item._id });
      qc.invalidateQueries({ queryKey: ['starred'] });
      qc.invalidateQueries({ queryKey: ['folder-contents'] });
      toast.success(item.isStarred ? 'Unstarred' : 'Added to Starred');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const rawFolders = contents.data?.folders || [];
  const rawFiles = contents.data?.files || [];

  // Filter & Sort Logic
  const { filteredFolders, filteredFiles } = useMemo(() => {
    let fList = [...rawFolders];
    let fileList = [...rawFiles];

    // Filter
    if (activeFilter === 'folders') {
      fileList = [];
    } else if (activeFilter === 'documents') {
      fList = [];
      fileList = fileList.filter((f) =>
        f.mimeType?.includes('pdf') ||
        f.mimeType?.startsWith('text/') ||
        f.mimeType?.includes('document') ||
        f.mimeType?.includes('sheet')
      );
    } else if (activeFilter === 'images') {
      fList = [];
      fileList = fileList.filter((f) => f.mimeType?.startsWith('image/'));
    } else if (activeFilter === 'media') {
      fList = [];
      fileList = fileList.filter((f) => f.mimeType?.startsWith('audio/') || f.mimeType?.startsWith('video/'));
    } else if (activeFilter === 'starred') {
      fList = fList.filter((f) => f.isStarred);
      fileList = fileList.filter((f) => f.isStarred);
    }

    // Sort
    const sortFn = (a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'date') {
        valA = new Date(a.updatedAt || 0).getTime();
        valB = new Date(b.updatedAt || 0).getTime();
      } else if (sortBy === 'size') {
        valA = a.size || 0;
        valB = b.size || 0;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    };

    fList.sort(sortFn);
    fileList.sort(sortFn);

    return { filteredFolders: fList, filteredFiles: fileList };
  }, [rawFolders, rawFiles, activeFilter, sortBy, sortOrder]);

  if (contents.isLoading) return <SkeletonGrid />;

  const isEmpty = rawFolders.length === 0 && rawFiles.length === 0;
  const isFilteredEmpty = !isEmpty && filteredFolders.length === 0 && filteredFiles.length === 0;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              My Drive
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-400 dark:ring-blue-500/30">
              {rawFolders.length + rawFiles.length} items
            </span>
          </div>
          <Breadcrumbs
            items={contents.data?.breadcrumb || [{ id: null, name: 'My Drive' }]}
            onNavigate={(id) => setFolderId(id)}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* New Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNewMenuOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-indigo-700 active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>New</span>
            </button>

            {newMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setNewMenuOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 top-12 z-30 w-48 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-md animate-scale-up dark:border-slate-700 dark:bg-slate-800/95">
                  <button
                    type="button"
                    onClick={() => {
                      setNewMenuOpen(false);
                      setCreateOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <FolderPlus size={16} className="text-amber-500" />
                    New folder
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMenuOpen(false);
                      document.querySelector('input[type="file"]')?.click();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Upload size={16} className="text-blue-600" />
                    Upload file
                  </button>
                </div>
              </>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-slate-700/80 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`rounded-xl p-1.5 transition ${
                view === 'grid'
                  ? 'bg-blue-50 text-blue-700 shadow-xs font-bold dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`rounded-xl p-1.5 transition ${
                view === 'list'
                  ? 'bg-blue-50 text-blue-700 shadow-xs font-bold dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips & Sort Toolbar */}
      {!isEmpty && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map(({ id, label, icon: Icon }) => {
              const active = activeFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveFilter(id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:border-slate-700/70'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-blue-400' : 'text-slate-400'} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <ArrowUpDown size={14} />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
            >
              <option value="name">Name</option>
              <option value="date">Date modified</option>
              <option value="size">File size</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      )}

      {/* Embedded Drag & Drop Banner */}
      <UploadZone onDrop={(accepted) => uploadFiles(accepted)} />

      {/* File Explorer Content */}
      {isEmpty ? (
        <EmptyState
          title="Your drive is empty"
          description="Drag files anywhere on screen or click below to upload your first file."
          action={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[var(--color-accent-dark)] transition"
            >
              <FolderPlus size={16} /> Create first folder
            </button>
          }
        />
      ) : isFilteredEmpty ? (
        <EmptyState
          title="No matching items"
          description={`No files or folders matched the "${activeFilter}" filter.`}
          action={
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Reset Filter
            </button>
          }
        />
      ) : (
        <FileExplorer
          folders={filteredFolders}
          files={filteredFiles}
          view={view}
          onOpen={openItem}
          onDownload={(file) => downloadFile.mutate(file._id)}
          onRename={(item, type) => setRenameTarget({ item, type })}
          onDelete={(item, type) => setDeleteTarget({ item, type })}
          onShare={(item, type) => setShareTarget({ ...item, type })}
          onStar={onStar}
          onPreview={handlePreview}
        />
      )}

      {/* Modals & Upload Widgets */}
      <UploadProgress uploads={uploads} onCancel={cancelUpload} onClear={clearFinished} />

      <CreateFolderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        loading={createFolder.isPending}
        onCreate={async (name) => {
          await createFolder.mutateAsync(name);
          setCreateOpen(false);
        }}
      />

      <RenameModal
        open={Boolean(renameTarget)}
        initialName={renameTarget?.item?.name || ''}
        onClose={() => setRenameTarget(null)}
        loading={renameFile.isPending || renameFolder.isPending}
        onRename={async (name) => {
          if (renameTarget.type === 'file') {
            await renameFile.mutateAsync({ id: renameTarget.item._id, name });
          } else {
            await renameFolder.mutateAsync({ id: renameTarget.item._id, name });
          }
          setRenameTarget(null);
        }}
      />

      <ShareModal open={Boolean(shareTarget)} onClose={() => setShareTarget(null)} resource={shareTarget} />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Move to trash?"
        message={`"${deleteTarget?.item?.name}" will be moved to trash.`}
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          if (deleteTarget.type === 'file') await deleteFile.mutateAsync(deleteTarget.item._id);
          else await deleteFolder.mutateAsync(deleteTarget.item._id);
          setDeleteTarget(null);
        }}
      />

      <FilePreviewModal
        open={Boolean(preview.file)}
        file={preview.file}
        previewUrl={preview.url}
        onClose={closePreview}
        onDownload={(file) => downloadFile.mutate(file._id)}
      />
    </div>
  );
}
