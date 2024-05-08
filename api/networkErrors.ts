import { ModalError } from '@/api/modalError';

export class NetworkError extends Error implements ModalError {
  needLogin: boolean = false;
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
  toTitleStringArray = () => [
    'ネットワークを確認し再度お試しください。',
    '問題が解消しない場合、管理者へお問い合わせください。',
  ];

  toBodyStringArray = () => [''];
}
