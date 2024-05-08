import { DataTransportApiErrorModels } from '@/api/models/dataTransport';
import { TraceabilityApiErrorModel } from '@/api/models/traceability';
import { ModalError } from '@/api/modalError';

/**
 * API呼び出し時、エラーレスポンスが返ってきた際のエラー
 * statusにはAPIからエラーが返ってきた際のHTTPエラーコードを格納する。
 *
 * ただし、認証関係のエラーのみ例外的に、レスポンスに関わらずこのクラスでエラーを表す
 * APIエラーコードに拠らない認証関係のエラーは
 * status: 1 未ログイン
 * status: 2 トークンリフレッシュ時の応答が不正
 * で表す
 */
export abstract class APIError extends Error implements ModalError {
  status: number;
  body: any;
  needLogin: boolean = false;
  constructor(status: number) {
    super(status.toString());
    this.name = 'APIError';
    this.status = status;
    if ([1, 2, 401].includes(status)) {
      this.needLogin = true;
    }
  }
  toTitleStringArray() {
    if (this.status === 400) {
      return [
        '処理を完了することができませんでした。',
        '入力内容をご確認ください。',
      ];
    } else if (this.needLogin) {
      return ['エラーが発生しました。', '再度ログインを実施してください。'];
    } else {
      return ['エラーが発生しました。', '管理者へお問い合わせください。'];
    }
  }
  abstract toBodyStringArray(): string[];
}

export class DataTransportAPIError extends APIError {
  body: DataTransportApiErrorModels;
  constructor(status: number, body: DataTransportApiErrorModels) {
    super(status);
    this.body = body;
  }
  toBodyStringArray(): string[] {
    if (this.needLogin) return [];
    return [
      `コード：${this.body.code ?? ''}`,
      `メッセージ：${this.body.message ?? ''}`,
      `詳細：${this.body.detail ?? ''}`,
    ];
  }
}

export class traceabilityAPIError extends APIError {
  body: TraceabilityApiErrorModel;
  constructor(status: number, body: TraceabilityApiErrorModel) {
    super(status);
    this.body = body;
  }
  toBodyStringArray(): string[] {
    if (this.needLogin) return [];
    return [
      `コード：${this.body.errors[0]?.errorCode ?? ''}`,
      `メッセージ：${this.body.errors[0]?.errorDescription ?? ''}`,
    ];
  }
}

export class NotLoggedInError extends APIError {
  constructor() {
    super(1);
  }
  toBodyStringArray(): string[] {
    return [];
  }
}

export class InvalidRefreshTokenResponseError extends APIError {
  constructor() {
    super(2);
  }
  toBodyStringArray(): string[] {
    return [];
  }
}
