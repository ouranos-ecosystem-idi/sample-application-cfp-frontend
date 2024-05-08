'use client';
import { useSearchParams } from 'next/navigation';
import PartsDetailTemplate from '@/components/template/PartsTemplate';

export default function PartsDetailPage() {
  const statusId = useSearchParams().get('status-id');
  if (typeof statusId === 'undefined') {
    throw new Error('parameter trade-id is required');
  }

  return (
    <PartsDetailTemplate
      returnHref={`/requests/link-parts/?status-id=${statusId}`}
      backButtonText={'部品紐付け'}
    />
  );
}
