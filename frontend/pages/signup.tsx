import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import api from '../services/api';

export default function Signup() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/auth/register', form);
      localStorage.setItem('sg_token', data.access_token);
      router.push('/setup');
    } catch (error: any) {
      setErr(error?.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <Layout>
      <form onSubmit={submit} className="glass mx-auto mt-10 max-w-md rounded-2xl p-6">
        <h2 className="mb-4 text-2xl font-semibold">Create ShadowGraph Account</h2>
        <input className="mb-3 w-full rounded bg-black/30 p-3" placeholder="Full Name" onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        <input className="mb-3 w-full rounded bg-black/30 p-3" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="mb-3 w-full rounded bg-black/30 p-3" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {err ? <p className="mb-3 text-sm text-danger">{err}</p> : null}
        <button className="w-full rounded bg-neon p-3 font-semibold text-black">Sign Up</button>
      </form>
    </Layout>
  );
}
