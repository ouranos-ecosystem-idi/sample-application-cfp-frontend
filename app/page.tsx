'use client';

import { getAccessToken } from '@/api/accessToken';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TopPage() {
  const router = useRouter();
  useEffect(() => {
    const _redirect = async function () {
      let isLoggedIn = false;
      try {
        isLoggedIn = !!(await getAccessToken());
      } catch { }
      router.push(
        isLoggedIn ? '/parts' : '/login'
      );
    };
    _redirect();
  }, [router]);

  return <></>;
}
