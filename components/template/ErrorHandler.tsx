'use client'
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { APIError } from '@/api/apiErrors';
import ErrorModal from '@/components/organisms/ErrorModal';
import { NetworkError } from '@/api/networkErrors';
import { ModalError } from '@/api/modalError';

const ErrorHandlerContext = createContext<
  (e: unknown, overrideTitle?: string[]) => void
>(() => { });

const defaultError: ModalError = {
  needLogin: false,
  toTitleStringArray: () => ['エラーが発生しました。', '管理者へお問い合わせください。'],
  toBodyStringArray: () => [],
};

export function ErrorHandlerProvider({ children }: { children: ReactNode; }) {
  const [incomingError, setIncomingError] = useState<{
    error: ModalError;
    overrideTitle?: string[];
  }>();
  const [firstError, setFirstError] = useState<{
    error: ModalError;
    overrideTitle?: string[];
  }>();
  const handleError = useCallback((e: unknown, overrideTitle?: string[]) => {
    if (e instanceof APIError) {
      // APIからエラーが返却された場合は詳細を表示
      setIncomingError({ error: e, overrideTitle });
    } else if (e instanceof NetworkError) {
      // ネットワークエラー時は専用のメッセージを表示する
      setIncomingError({ error: e, overrideTitle });
    } else if (e instanceof Error) {
      // それ以外のエラーはデフォルトのメッセージを表示
      setIncomingError({ error: defaultError, overrideTitle });
    }
  }, []);
  useEffect(() => {
    if (incomingError === undefined) {
      setFirstError(undefined);
    } else if (firstError === undefined) {
      setFirstError(incomingError);
    } else {
      // すでにエラーが発生しているため後続のエラーは破棄
    }
  }, [firstError, incomingError]);

  return (
    <ErrorHandlerContext.Provider value={handleError}>
      <ErrorModal
        error={firstError?.error}
        overrideTitle={firstError?.overrideTitle}
        onReset={() => setIncomingError(undefined)}
      />
      {children}
    </ErrorHandlerContext.Provider>
  );
}

/**
 *  戻り値としてErrorHandlerProviderのchildren内で利用可能なエラーハンドラを返す。
 * エラーハンドラは呼び出された際、引数に渡されたエラーに応じたエラーモーダルを表示する。
 * モーダルが閉じられる前に渡された後続エラーは破棄される。
 */
export default function useErrorHandler() {
  return useContext(ErrorHandlerContext);
}
