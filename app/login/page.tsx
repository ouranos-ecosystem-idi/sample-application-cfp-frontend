'use client';

import { repository } from '@/api/repository';
import LoginForm, { LoginFormData } from '@/components/organisms/LoginForm';
import { setTokens } from '@/api/accessToken';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  async function onLoginSubmit(loginFormData: LoginFormData) {
    // API呼び出し時のエラーハンドリングはLoginForm側で実施
    sessionStorage.clear();
    const { accessToken, refreshToken } = await repository.login(loginFormData);
    if (
      typeof accessToken === 'undefined' ||
      typeof refreshToken === 'undefined'
    ) {
      throw new Error('Invalid response');
    }
    setTokens({ accessToken, refreshToken });
    router.push('/parts/');
  }

  return (
    <LoginForm onSubmit={onLoginSubmit} />
  );
}
