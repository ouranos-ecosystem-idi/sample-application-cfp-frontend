'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { onAbort } from '@/components/template/AbortHandler';

const TransitionMonitoring = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      // F5更新などでアンロード時にAPI呼び出し処理を中止する
      onAbort();
    });
  }, []);

  useEffect(() => {
    // ページ移動時にAPI呼び出し処理を中止する
    onAbort();
  }, [pathname, searchParams]);

  return null; // このコンポーネントはUIを描画しない
};

export default TransitionMonitoring;
