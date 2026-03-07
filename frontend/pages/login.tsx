import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import api from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/auth/login', form);
      localStorage.setItem('sg_token', data.access_token);
      router.push('/setup');
    } catch (error: any) {
      setErr(error?.response?.data?.detail || 'Login failed');
    }
  };

  const startOAuth = async (provider: 'google' | 'github') => {
    setErr('');
    try {
      const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
      const { data } = await api.get(`/api/auth/oauth/${provider}/url`, { params: { redirect_uri: redirectUri } });
      window.location.href = data.authorization_url;
    } catch (error: any) {
      setErr(error?.response?.data?.detail || `${provider} login failed`);
    }
  };

  return (
    <Layout>
      <form onSubmit={submit} className="glass mx-auto mt-10 max-w-md rounded-2xl p-6">
        <h2 className="mb-4 text-2xl font-semibold">Login</h2>
        <input className="mb-3 w-full rounded bg-black/30 p-3" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="mb-3 w-full rounded bg-black/30 p-3" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {err ? <p className="mb-3 text-sm text-danger">{err}</p> : null}
        <button className="w-full rounded bg-neon p-3 font-semibold text-black">Login</button>
        <div className="my-4 h-px bg-slate-700" />
        <button type="button" className="mb-2 w-full rounded border border-slate-500 p-3 text-sm" onClick={() => startOAuth('google')}>
          Continue with Google
        </button>
        <button type="button" className="w-full rounded border border-slate-500 p-3 text-sm" onClick={() => startOAuth('github')}>
          Continue with GitHub
        </button>
      </form>
    </Layout>
  );
}
