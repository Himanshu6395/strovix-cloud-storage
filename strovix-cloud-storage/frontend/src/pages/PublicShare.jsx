import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { publicLinkApi } from '../services/publicLink.api.js';
import { LoadingSpinner } from '../components/common/ui.jsx';
import { formatFileSize } from '../utils/formatFileSize.js';
import { resolveApiUrl } from '../utils/apiUrl.js';

export default function PublicShare() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (pwd) => {
    setLoading(true);
    try {
      const res = await publicLinkApi.getByToken(token, pwd);
      setData(res.data);
      setNeedsPassword(false);
    } catch (err) {
      if (err.message?.toLowerCase().includes('password')) {
        setNeedsPassword(true);
        if (pwd) toast.error(err.message);
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  if (loading) return <LoadingSpinner label="Loading shared content..." />;

  if (needsPassword && !data) {
    return (
      <div className="flex h-full items-center justify-center overflow-y-auto px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(password);
          }}
          className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-xl"
        >
          <h1 className="mb-2 text-xl font-bold">Password required</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-3 w-full rounded-xl border px-3 py-2.5"
            placeholder="Enter password"
          />
          <button type="submit" className="w-full rounded-xl bg-teal-600 py-2.5 text-white">
            Unlock
          </button>
        </form>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center overflow-y-auto">
        <p>Public link unavailable</p>
      </div>
    );
  }

  const resource = data.resource;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col justify-center overflow-y-auto px-4 py-10">
      <div className="rounded-3xl border border-[var(--color-line)] bg-white/90 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-wide text-teal-700">Shared via Strovix</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">{resource.name}</h1>
        {resource.type === 'file' ? (
          <div className="mt-4 space-y-3">
            <p className="text-slate-600">
              {resource.mimeType} · {formatFileSize(resource.size)}
            </p>
            {data.downloadUrl && (
              <a
                href={data.downloadUrl.startsWith('/') ? resolveApiUrl(data.downloadUrl) : data.downloadUrl}
                className="inline-flex rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white"
              >
                Download
              </a>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-500">Folder contents</p>
            {(resource.folders || []).map((f) => (
              <div key={f._id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                📁 {f.name}
              </div>
            ))}
            {(resource.files || []).map((f) => (
              <div key={f._id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                📄 {f.name} · {formatFileSize(f.size)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
