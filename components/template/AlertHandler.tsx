'use client';
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
  ComponentProps,
} from 'react';
import BaseAlert from '@/components/atoms/BaseAlert';

type AlertProviderType = {
  info: (message: string) => void;
  error: (message: string) => void;
  success: (message: string) => void;
};

const AlertContext = createContext<AlertProviderType | undefined>(undefined);

type Props = {
  isOpen: boolean;
  message: string;
  type?: ComponentProps<typeof BaseAlert>['type'];
};

export const AlertProvider: React.FC<{ children: ReactNode; }> = ({
  children,
}) => {
  const [state, setState] = useState<Props>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const info = useCallback((message: string) => {
    setState({ isOpen: true, message, type: 'info' });
  }, []);

  const error = useCallback((message: string) => {
    setState({ isOpen: true, message, type: 'error' });
  }, []);

  const success = useCallback((message: string) => {
    setState({ isOpen: true, message, type: 'success' });
  }, []);

  const closeAlert = () => {
    setState({ isOpen: false, message: '', type: 'info' });
  };

  useEffect(() => {
    if (state.isOpen) {
      // 3秒後にアラートを閉じるタイマーを設定
      const timer = setTimeout(() => {
        closeAlert();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.isOpen]);

  return (
    <AlertContext.Provider value={{ info, error, success }}>
      <BaseAlert
        isOpen={state.isOpen}
        message={state.message}
        type={state.type}
      />
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const showAlert = useContext(AlertContext);
  if (!showAlert) {
    throw new Error('useAlert must be used within a AlertProvider.');
  }
  return showAlert;
};
