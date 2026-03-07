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

  return (
    <Layout>
      <form onSubmit={submit} className="glass mx-auto mt-10 max-w-md rounded-2xl p-6">
        <h2 className="mb-4 text-2xl font-semibold">Login</h2>
        <input className="mb-3 w-full rounded bg-black/30 p-3" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="mb-3 w-full rounded bg-black/30 p-3" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {err ? <p className="mb-3 text-sm text-danger">{err}</p> : null}
        <button className="w-full rounded bg-neon p-3 font-semibold text-black">Login</button>
      </form>
    </Layout>
  );
}
