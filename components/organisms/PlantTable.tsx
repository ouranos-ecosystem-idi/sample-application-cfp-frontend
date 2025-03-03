import { useMemo, useState } from 'react';
import { FormikProvider, useFormik } from 'formik';
import InputTextBox from '@/components/atoms/InputTextBox';
import { Button } from '@/components/atoms/Button';
import { Column, DataTable } from '@/components/molecules/DataTable';
import AddRowButton from '@/components/atoms/AddRowButton';
import { MinusCircle } from '@phosphor-icons/react';
import PopupModal from '@/components/molecules/PopupModal';
import { Plant } from '@/lib/types';
import SectionHeader from '@/components/molecules/SectionHeader';
import * as Yup from 'yup';
import '@/lib/yup.locale';
import { getFormikErrorMessage } from '@/lib/utils';

export type PlantRowType = Plant & {
  tmpRowID: string;
  isNew: boolean;
  isDeleted: boolean;
};

type FormType = {
  data: PlantRowType[];
} & {
  isSet?: boolean;
};

const openPlantIdValidation = Yup.string()
  .required()
  .min(6, '6文字以上26文字以内')
  .max(26, '6文字以上26文字以内')
  .test('is-valid-openplantid', '下6桁半角数字', (value) => {
    const pattern = /\d{6}$/; // 下6桁が数字かどうかをチェックする正規表現
    return pattern.test(value || '');
  });

const validationSchema = Yup.object({
  data: Yup.array().of(
    Yup.object({
      plantName: Yup.string().required().max(256),
      plantAddress: Yup.string().required().max(256),
      openPlantId: openPlantIdValidation,
      globalPlantId: Yup.string().max(256),
    })
  ),
});

export default function PlantDetails({
  initialData,
  onSubmit,
  isPlantLoading,
}: {
  initialData: Plant[];
  onSubmit: (value: Plant[]) => void;
  isPlantLoading: boolean;
}) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const formik = useFormik<FormType>({
    initialStatus: 'initial',
    initialValues: {
      // ここで `initialData` を加工する
      data: initialData.map((data) => ({
        ...data,
        tmpRowID: data.plantId!, // テーブル表示用のID
        isNew: false, // 新規フラグをデフォルトで false に
        isDeleted: false, // 削除フラグをデフォルトで false に
      })),
      isSet: !isPlantLoading,
    },
    validationSchema,
    // onSubmit関数の修正
    onSubmit: (form) => {
      // 変更があったデータのみをフィルタリング
      const modifiedPlants = form.data
        .filter((plant) => {
          // 新規追加されたデータの場合は常にtrue
          if (plant.isNew) return true;
          // 初期データと比較して変更があるかチェック
          const original = initialData.find((p) => p.plantId === plant.plantId);
          return (
            !original ||
            original.plantName !== plant.plantName ||
            original.plantAddress !== plant.plantAddress ||
            original.openPlantId !== plant.openPlantId ||
            original.globalPlantId !== plant.globalPlantId
          );
        })
        .map(({ tmpRowID, isNew, isDeleted, ...plantData }) => plantData);

      // 変更があったデータの配列を一度だけ送信
      if (modifiedPlants.length > 0) {
        onSubmit(modifiedPlants); // 変更または新規データの配列を送信
      }

      setIsConfirmModalOpen(false);
    },

    enableReinitialize: true,
  });

  const columns: Column<Partial<PlantRowType>>[] = useMemo(
    () => [
      {
        id: 'plantName',
        headerElement: '事業所名',
        width: 404,
        renderCell: (value, row, rowIndex) => (
          <InputTextBox
            background='transparent'
            disabled={row?.isDeleted ?? false}
            type='text'
            required
            {...formik.getFieldProps(`data[${rowIndex}].plantName`)}
            value={row?.plantName ?? ''}
            error={getFormikErrorMessage({
              name: `data[${rowIndex}].plantName`,
              formik,
            })}
            placeholder='入力必須'
          />
        ),
      },
      {
        id: 'plantAddress',
        headerElement: '所在地',
        width: 404,
        renderCell: (value, row, rowIndex) => (
          <InputTextBox
            background='transparent'
            disabled={row?.isDeleted ?? false}
            type='text'
            required
            {...formik.getFieldProps(`data[${rowIndex}].plantAddress`)}
            value={row?.plantAddress ?? ''}
            error={getFormikErrorMessage({
              name: `data[${rowIndex}].plantAddress`,
              formik,
            })}
            placeholder='入力必須'
          />
        ),
      },
      {
        id: 'openPlantId',
        headerElement: '事業所識別子（ローカル）',
        width: 212,
        renderCell: (value, row, rowIndex) => (
          <InputTextBox
            background='transparent'
            disabled={row?.isDeleted ?? false}
            type='text'
            required
            {...formik.getFieldProps(`data[${rowIndex}].openPlantId`)}
            value={row?.openPlantId ?? ''}
            error={getFormikErrorMessage({
              name: `data[${rowIndex}].openPlantId`,
              formik,
            })}
            placeholder='入力必須'
          />
        ),
      },
      {
        id: 'globalPlantId',
        headerElement: '事業所識別子（グローバル）',
        width: 212,
        renderCell: (value, row, rowIndex) => (
          <InputTextBox
            background='transparent'
            disabled={row?.isDeleted ?? false}
            type='text'
            {...formik.getFieldProps(`data[${rowIndex}].globalPlantId`)}
            value={row?.globalPlantId ?? ''}
            error={getFormikErrorMessage({
              name: `data[${rowIndex}].globalPlantId`,
              formik,
            })}
          />
        ),
      },
      {
        id: 'isDeleted',
        headerElement: '',
        width: 32,
        renderCell: (_, row, rowIndex) =>
          row?.isNew ? ( // 新規に追加された行のみMinusCircleアイコンを表示
            <MinusCircle
              className='fill-error cursor-pointer'
              size='24'
              onClick={() => {
                // 該当する行をdata配列から削除
                const newData = formik.values.data.filter(
                  (_, index) => index !== rowIndex
                );
                formik.setFieldValue('data', newData);
              }}
            />
          ) : null,
      },
    ],
    [formik]
  );

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className='flex-1 flex flex-col'>
        <SectionHeader
          variant='h1'
          rightChildren={[
            <Button
              key='confirm'
              type='button'
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={!(formik.isValid && formik.dirty)}
            >
              登録
            </Button>,
          ]}
          className='mb-4'
          stickyOptions={{ top: 32 }}
        />
        <DataTable
          columns={columns}
          rows={formik.values.data}
          keyOfRowID='tmpRowID'
          rowHeight={84}
          edgePaddingX={16}
          columnsGapX={16}
          stickyOptions={{ top: 88 }}
          isLoading={isPlantLoading || !formik.values.isSet}
        />

        <AddRowButton
          onClick={() => {
            formik.setValues({
              data: [
                ...formik.values.data,
                {
                  tmpRowID: crypto.randomUUID(),
                  isNew: true,
                  isDeleted: false,
                  plantName: '',
                  plantAddress: '',
                  openPlantId: '',
                  globalPlantId: undefined,
                },
              ],
              isSet: true,
            });
          }}
          hasBorder={false}
          buttonText='事業所を追加'
          disabled={isPlantLoading || !formik.values.isSet}
          className='w-full pr-6 flex-row-reverse '
        />
        <PopupModal
          button={
            <Button
              color='primary'
              variant='solid'
              size='default'
              key='submit'
              type='submit'
              disabled={!(formik.isValid && formik.dirty)}
            >
              登録
            </Button>
          }
          isOpen={isConfirmModalOpen}
          setIsOpen={setIsConfirmModalOpen}
          title='事業所情報を登録しますか？'
        />
      </form>
    </FormikProvider>
  );
}
