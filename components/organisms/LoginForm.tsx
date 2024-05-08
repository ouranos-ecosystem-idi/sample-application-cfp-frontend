import { Button } from '@/components/atoms/Button';
import * as Yup from 'yup';
import '@/lib/yup.locale';
import { Formik, FormikErrors, yupToFormErrors } from 'formik';
import { doTry } from '@/lib/try';
import { APIError } from '@/api/apiErrors';
import { getFormikErrorMessage, isEmpty } from '@/lib/utils';
import useErrorHandler from '@/components/template/ErrorHandler';
import { ComponentProps, useState } from 'react';
import LoadingScreen from '../molecules/LoadingScreen';

const loginFormSchema = Yup.object({
  operatorAccountId: Yup.string().required(),
  accountPassword: Yup.string().required(' '),
});
export type LoginFormData = Yup.InferType<typeof loginFormSchema>;

type LoginInputFieldProps = ComponentProps<'input'> & {
  type: 'text' | 'password';
  error?: string;
};

const initialValues = {
  operatorAccountId: process.env.NEXT_PUBLIC_DEFAULT_ID || '',
  accountPassword: process.env.NEXT_PUBLIC_DEFAULT_PW || '',
};

const initialErrors = doTry(() => {
  loginFormSchema.validateSync(initialValues);
}).fold<FormikErrors<LoginFormData>>(yupToFormErrors, () => ({}));

function LoginInputField({ type, error, ...others }: LoginInputFieldProps) {
  const className = `text-xs bg p-3 font-semibold w-[360px] rounded border border-[#ccc] focus:outline-none focus:border-primary bg-white `;
  const classNameOnError = 'border-error';
  return (
    <>
      <input
        type={type}
        className={className + (!isEmpty(error) ? classNameOnError : '')}
        required
        {...others}
      />
      {!isEmpty(error) && (
        <div className='absolute text-[10px] text-error'>{error}</div>
      )}
    </>
  );
}

type Props = {
  onSubmit: (data: LoginFormData) => Promise<void>;
};

export default function LoginForm({ onSubmit }: Props) {
  const handleError = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      <LoadingScreen isOpen={isLoading} />
      <Formik
        initialValues={initialValues}
        initialErrors={initialErrors}
        validationSchema={loginFormSchema}
        onSubmit={async (values, { setErrors }) => {
          setIsLoading(true);
          try {
            await onSubmit(values);
          } catch (e) {
            if (
              e instanceof APIError &&
              (e.status === 401 || e.status === 400)
            ) {
              values.accountPassword = '';
              setErrors({
                accountPassword:
                  '事業者アカウントまたはパスワードが異なります。',
              });
            } else {
              handleError(e);
            }
          } finally {
            setIsLoading(false);
          }
        }}
      >
        {({ errors, touched, getFieldProps, handleSubmit, isValid }) => (
          <form onSubmit={handleSubmit}>
            <div className='mt-[216px]'>
              <div className='flex justify-center text-2xl font-semibold'>
                蓄電池トレーサビリティ管理システム
              </div>
              <div className='flex justify-center items-center mt-10'>
                <div className='flex-1 text-base font-semibold text-right pr-4'>
                  事業者アカウント
                </div>
                <div>
                  <LoginInputField
                    type='text'
                    {...getFieldProps('operatorAccountId')}
                  />
                </div>
                <div className='flex-1'></div>
              </div>
              <div className='flex justify-center items-center mt-6'>
                <div className='flex-1 text-base font-semibold text-right pr-4'>
                  パスワード
                </div>
                <div>
                  <LoginInputField
                    type='password'
                    {...getFieldProps('accountPassword')}
                    error={getFormikErrorMessage({
                      name: 'accountPassword',
                      formik: { errors, touched },
                    })}
                  />
                </div>
                <div className='flex-1'></div>
              </div>
              <div className='flex justify-center items-center mt-6'>
                <div className='flex-1 pr-4'></div>
                <div>
                  <Button
                    className='w-[360px]'
                    disabled={!isValid}
                    type='submit'
                  >
                    ログイン
                  </Button>
                </div>
                <div className='flex-1'></div>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </>
  );
}
