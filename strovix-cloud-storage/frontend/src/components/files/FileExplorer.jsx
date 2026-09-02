import { useState } from 'react';
import {
  MoreVertical,
  Download,
  Pencil,
  Trash2,
  Star,
  Share2,
  Eye,
  Folder,
  File,
  FileImage,
  FileText,
  FileArchive,
  FileAudio,
  FileVideo,
  FileSpreadsheet,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { formatFileSize } from '../../utils/formatFileSize.js';
import { formatDate } from '../../utils/formatDate.js';
import { AIFileAssistantDrawer } from '../ai/AIFileAssistantDrawer.jsx';

// Get rich custom gradient styles and icons for file types
function getFileTypeConfig(mimeType = '', isFolder = false) {
  if (isFolder) {
    return {
      icon: Folder,
      gradient: 'from-amber-400/20 to-orange-400/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300',
      label: 'Folder',
    };
  }
  if (mimeType.startsWith('image/')) {
    return {
      icon: FileImage,
      gradient: 'from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/40',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300',
      label: 'Image',
    };
  }
  if (mimeType.startsWith('audio/')) {
    return {
      icon: FileAudio,
      gradient: 'from-pink-500/20 to-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/40',
      badgeBg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300',
      label: 'Audio',
    };
  }
  if (mimeType.startsWith('video/')) {
    return {
      icon: FileVideo,
      gradient: 'from-violet-500/20 to-fuchsia-500/20 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/40',
      badgeBg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300',
      label: 'Video',
    };
  }
  if (mimeType.includes('pdf')) {
    return {
      icon: FileText,
      gradient: 'from-red-500/20 to-orange-500/20 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-900/40',
      badgeBg: 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300',
      label: 'PDF',
    };
  }
  if (mimeType.startsWith('text/')) {
    return {
      icon: FileText,
      gradient: 'from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/40',
      badgeBg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300',
      label: 'Text',
    };
  }
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
    return {
      icon: FileSpreadsheet,
      gradient: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300',
      label: 'Spreadsheet',
    };
  }
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('tar')) {
    return {
      icon: FileArchive,
      gradient: 'from-cyan-500/20 to-teal-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-900/40',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300',
      label: 'Archive',
    };
  }
  return {
    icon: File,
    gradient: 'from-slate-500/20 to-gray-500/20 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800',
    badgeBg: 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300',
    label: 'File',
  };
}

function ContextMenu({ open, onClose, actions }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-2 top-10 z-30 min-w-[170px] overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 p-1.5 shadow-xl backdrop-blur-md animate-scale-up">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              action.onClick();
            }}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition cursor-pointer ${
              action.danger
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </>
  );
}

export function FileCard({ item, type, onOpen, onDownload, onRename, onDelete, onShare, onStar, onPreview, onAi, view }) {
  const [menu, setMenu] = useState(false);
  const isFolder = type === 'folder';
  const config = getFileTypeConfig(item.mimeType, isFolder);
  const Icon = config.icon;
  const isStarred = item.isStarred;

  const actions = [
    !isFolder && {
      label: 'AI Assistant',
      icon: <Sparkles size={14} className="text-teal-500" />,
      onClick: () => onAi?.(item),
    },
    !isFolder && { label: 'Preview', icon: <Eye size={14} />, onClick: () => onPreview?.(item) },
    !isFolder && { label: 'Download', icon: <Download size={14} />, onClick: () => onDownload?.(item) },
    { label: 'Rename', icon: <Pencil size={14} />, onClick: () => onRename?.(item, type) },
    { label: 'Share', icon: <Share2 size={14} />, onClick: () => onShare?.(item, type) },
    {
      label: isStarred ? 'Unstar' : 'Add to Starred',
      icon: <Star size={14} className={isStarred ? 'fill-amber-400 text-amber-400' : ''} />,
      onClick: () => onStar?.(item, type),
    },
    { label: 'Move to trash', icon: <Trash2 size={14} />, onClick: () => onDelete?.(item, type), danger: true },
  ].filter(Boolean);

  // List View Layout
  if (view === 'list') {
    return (
      <div
        className="group relative flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 px-4 py-3 transition hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xs cursor-pointer"
        onDoubleClick={() => onOpen?.(item, type)}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} border`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer" onClick={() => onOpen?.(item, type)}>
                {item.name}
              </span>
              {isStarred && <Star size={14} className="fill-amber-400 text-amber-400 shrink-0" />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="hidden w-24 text-right sm:block font-medium">
            {isFolder ? 'Folder' : formatFileSize(item.size)}
          </span>
          <span className="hidden w-28 text-right md:block">{formatDate(item.updatedAt)}</span>
          
          <div className="flex items-center gap-1">
            {!isFolder && (
              <button
                type="button"
                onClick={() => onPreview?.(item)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 dark:text-slate-400 cursor-pointer"
                title="Preview"
              >
                <Eye size={16} />
              </button>
            )}
            {!isFolder && (
              <button
                type="button"
                onClick={() => onAi?.(item)}
                className="rounded-lg p-1.5 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60 font-bold flex items-center gap-1 cursor-pointer"
                title="AI Assistant"
              >
                <Sparkles size={15} />
              </button>
            )}
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
            {!isFolder && (
              <button
                type="button"
                onClick={() => onDownload?.(item)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                title="Download"
              >
                <Download size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onStar?.(item, type)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-500 cursor-pointer"
              title="Star"
            >
              <Star size={16} className={isStarred ? 'fill-amber-400 text-amber-400' : ''} />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenu((v) => !v);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <MoreVertical size={16} />
              </button>
              <ContextMenu open={menu} onClose={() => setMenu(false)} actions={actions} />
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Layout
  return (
    <div
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md cursor-pointer"
      onDoubleClick={() => onOpen?.(item, type)}
    >
      {/* Top bar on card */}
      <div className="mb-3 flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} border shadow-inner transition group-hover:scale-105`}>
          <Icon size={24} />
        </div>
        
        <div className="flex items-center gap-1">
          {isStarred && (
            <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 p-1 text-amber-500">
              <Star size={14} className="fill-amber-400" />
            </span>
          )}
          {!isFolder && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.(item);
              }}
              className="rounded-xl p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
              title="Preview"
            >
              <Eye size={16} />
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenu((v) => !v);
              }}
              className="rounded-xl p-1.5 text-slate-400 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 opacity-80 group-hover:opacity-100 cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>
            <ContextMenu open={menu} onClose={() => setMenu(false)} actions={actions} />
          </div>
        </div>
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
          {item.name}
        </h4>
        <div className="mt-1 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>{isFolder ? 'Folder' : formatFileSize(item.size)}</span>
          <span>{formatDate(item.updatedAt)}</span>
        </div>
      </div>

      {/* Action footer for files */}
      {!isFolder && (
        <div className="mt-3 flex items-center border-t border-slate-100 dark:border-slate-800/80 pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAi?.(item);
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 cursor-pointer"
          >
            <Sparkles size={13} /> AI Assistant
          </button>
        </div>
      )}
    </div>
  );
}

export function FileExplorer({
  folders = [],
  files = [],
  view = 'grid',
  onOpen,
  onDownload,
  onRename,
  onDelete,
  onShare,
  onStar,
  onPreview,
}) {
  const [aiFile, setAiFile] = useState(null);
  const hasFolders = folders.length > 0;
  const hasFiles = files.length > 0;

  return (
    <>
      {view === 'list' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-xs backdrop-blur-xs">
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className="flex-1">Name</span>
            <span className="hidden w-24 text-right sm:block">Size</span>
            <span className="hidden w-28 text-right md:block">Modified</span>
            <span className="w-28 text-right">Actions</span>
          </div>

          {/* Folders */}
          {hasFolders && (
            <div>
              {folders.map((folder) => (
                <FileCard
                  key={folder._id}
                  item={folder}
                  type="folder"
                  view="list"
                  onOpen={onOpen}
                  onRename={onRename}
                  onDelete={onDelete}
                  onShare={onShare}
                  onStar={onStar}
                />
              ))}
            </div>
          )}

          {/* Files */}
          {hasFiles && (
            <div>
              {files.map((file) => (
                <FileCard
                  key={file._id}
                  item={file}
                  type="file"
                  view="list"
                  onOpen={onOpen}
                  onDownload={onDownload}
                  onRename={onRename}
                  onDelete={onDelete}
                  onShare={onShare}
                  onStar={onStar}
                  onPreview={onPreview}
                  onAi={(fileItem) => setAiFile(fileItem)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Folders Section */}
          {hasFolders && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <FolderOpen size={16} className="text-amber-500" />
                  Folders ({folders.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {folders.map((folder) => (
                  <FileCard
                    key={folder._id}
                    item={folder}
                    type="folder"
                    onOpen={onOpen}
                    onRename={onRename}
                    onDelete={onDelete}
                    onShare={onShare}
                    onStar={onStar}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {hasFiles && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <File size={16} className="text-teal-600 dark:text-teal-400" />
                  Files ({files.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {files.map((file) => (
                  <FileCard
                    key={file._id}
                    item={file}
                    type="file"
                    onOpen={onOpen}
                    onDownload={onDownload}
                    onRename={onRename}
                    onDelete={onDelete}
                    onShare={onShare}
                    onStar={onStar}
                    onPreview={onPreview}
                    onAi={(fileItem) => setAiFile(fileItem)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Assistant Drawer */}
      <AIFileAssistantDrawer open={Boolean(aiFile)} onClose={() => setAiFile(null)} file={aiFile} />
    </>
  );
}

export default FileExplorer;
