import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Setup() {
  const ready = useAuth();
  const [username, setUsername] = useState('demoanalyst');
  const [status, setStatus] = useState('');
  const router = useRouter();

  if (!ready) return null;

  const runScan = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('Building digital identity twin...');
    await api.post('/api/identity/scan', { root_username: username, seed_platforms: ['github', 'x', 'linkedin'] });
    setStatus('Scan complete. Opening dashboard...');
    setTimeout(() => router.push('/dashboard'), 800);
  };

  return (
    <Layout>
      <form onSubmit={runScan} className="glass mx-auto mt-10 max-w-xl rounded-2xl p-6">
        <h2 className="mb-2 text-2xl font-semibold">Digital Identity Twin Setup</h2>
        <p className="mb-5 text-sm text-slate-300">Provide your anchor username to scan public identity signals and build the intelligence graph.</p>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="mb-3 w-full rounded bg-black/30 p-3" placeholder="Primary username" />
        <button className="w-full rounded bg-neon p-3 font-semibold text-black">Run Identity Scan</button>
        {status ? <p className="mt-4 text-sm text-neon">{status}</p> : null}
      </form>
    </Layout>
  );
}
