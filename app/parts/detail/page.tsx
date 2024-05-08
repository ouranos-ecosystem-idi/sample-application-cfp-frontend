'use client';
import PartsDetailTemplate from '@/components/template/PartsTemplate';

export default function PartsDetailPage() {
  return (
    <PartsDetailTemplate returnHref='/parts/' backButtonText='部品構成一覧' />
  );
}
