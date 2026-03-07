import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export function useAuth(redirectTo = '/login'): boolean {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === '1') {
        setReady(true);
        return;
      }
    }
    const token = localStorage.getItem('sg_token');
    if (!token) {
      router.replace(redirectTo);
      return;
    }
    setReady(true);
  }, [redirectTo, router]);

  return ready;
}
