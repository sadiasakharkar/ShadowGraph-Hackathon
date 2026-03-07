import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export function useAuth(redirectTo = '/login'): boolean {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('sg_token');
    if (!token) {
      router.replace(redirectTo);
      return;
    }
    setReady(true);
  }, [redirectTo, router]);

  return ready;
}
