import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth.js';
import { userApi } from '../services/publicLink.api.js';
import { StorageIndicator } from '../components/common/ui.jsx';
import { formatFileSize } from '../utils/formatFileSize.js';

export default function Profile() {
  const { user, setUser, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userApi.updateProfile({ name });
      setUser(res.data);
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>

      <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-[var(--color-line)] bg-white/80 p-5 dark:bg-slate-800/80">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/30 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
          <input value={user?.email || ''} disabled className="w-full rounded-xl border border-[var(--color-line)] bg-slate-50 px-3 py-2.5 text-slate-600 dark:bg-slate-900/60 dark:text-slate-400" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Role</label>
          <input value={user?.role || 'USER'} disabled className="w-full rounded-xl border border-[var(--color-line)] bg-slate-50 px-3 py-2.5 text-slate-600 dark:bg-slate-900/60 dark:text-slate-400" />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <div className="rounded-2xl border border-[var(--color-line)] bg-white/80 p-5 dark:bg-slate-800/80">
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Storage</h2>
        <StorageIndicator used={user?.storageUsed || 0} quota={user?.storageQuota || 1} />
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {formatFileSize(user?.storageUsed || 0)} of {formatFileSize(user?.storageQuota || 0)} used
        </p>
      </div>
    </div>
  );
}
