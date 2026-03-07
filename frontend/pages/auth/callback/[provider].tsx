import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import api from '../../../services/api';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const provider = String(router.query.provider || '');
    const code = String(router.query.code || '');
    const state = String(router.query.state || '');

    if (!provider || !code || !state) {
      setError('Missing OAuth callback data.');
      return;
    }

    const complete = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
        const { data } = await api.post(`/api/auth/oauth/${provider}/callback`, {
          code,
          state,
          redirect_uri: redirectUri
        });
        localStorage.setItem('sg_token', data.access_token);
        router.replace('/setup');
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'OAuth authentication failed');
      }
    };

    complete();
  }, [router]);

  return (
    <Layout>
      <div className="glass mx-auto mt-16 max-w-lg rounded-2xl p-6">
        <h1 className="text-xl font-semibold">Completing authentication</h1>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : <p className="mt-3 text-sm text-slate-300">Please wait while ShadowGraph signs you in.</p>}
      </div>
    </Layout>
  );
}

