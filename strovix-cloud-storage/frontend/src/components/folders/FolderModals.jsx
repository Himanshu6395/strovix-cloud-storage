import { useEffect, useState } from 'react';
import { Modal } from '../common/ui.jsx';

export function CreateFolderModal({ open, onClose, onCreate, loading }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Folder name is required');
      return;
    }
    setError('');
    await onCreate(name.trim());
    setName('');
  };

  return (
    <Modal open={open} onClose={onClose} title="Create new folder">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Folder name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/30 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Documents"
          />
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-[var(--color-line)] px-4 py-2 text-sm text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function RenameModal({ open, onClose, onRename, loading, initialName = '' }) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  return (
    <Modal open={open} onClose={onClose} title="Rename">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          await onRename(name.trim());
        }}
        className="space-y-4"
      >
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/30 dark:bg-slate-800 dark:text-slate-100"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-[var(--color-line)] px-4 py-2 text-sm text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default { CreateFolderModal, RenameModal };
