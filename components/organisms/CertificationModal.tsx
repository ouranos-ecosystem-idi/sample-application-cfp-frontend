import { repository } from '@/api/repository';
import BaseModal from '@/components/atoms/BaseModal';
import { Button } from '@/components/atoms/Button';
import InputTextArea from '@/components/atoms/InputTextArea';
import RefreshButton from '@/components/atoms/RefreshButton';
import FilePicker from '@/components/molecules/FilePicker';
import FilesList from '@/components/molecules/FilesList';
import PopupModal from '@/components/molecules/PopupModal';
import SectionHeader from '@/components/molecules/SectionHeader';
import CertificationPartsSheet from '@/components/organisms/CertificationPartsSheet';
import {
  ACCEPTED_UPLOAD_CERT_FILE_EXT,
  MAX_CERT_COMMENT_NUM,
  UPLOAD_MAX_CERT_FILESIZE,
  UPLOAD_MAX_CERT_FILE_NAME_NUM,
  UPLOAD_MAX_CERT_FILE_NUM,
} from '@/lib/constants';
import { CertificationDataType, Parts, Plant } from '@/lib/types';
import { fileSizeToString, isEmpty, isOwnParts, sum } from '@/lib/utils';
import { X } from '@phosphor-icons/react/dist/ssr/X';
import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  data?: {
    parts: Parts;
    plant?: Plant;
    certification?: CertificationDataType;
  }; // 同時に更新されてほしいためまとめる
  setData: (data?: {
    parts: Parts;
    plant?: Plant;
    certification?: CertificationDataType;
  }) => void;
  onModalRefresh: (
    data: ComponentProps<typeof CertificationModal>['data'],
    setData: ComponentProps<typeof CertificationModal>['setData']
  ) => Promise<void>;
  onUploadCert: (
    data: Parameters<typeof repository.registerCfpCertifications>[0]
  ) => Promise<boolean>;
  onDownloadCert: (
    fileName: string,
    ...params: Parameters<typeof repository.downloadCfpCertificationFile>
  ) => Promise<void>;
  onDeleteCert: (
    ...params: Parameters<typeof repository.deleteCfpCertificationFile>
  ) => Promise<boolean>;
};

export default function CertificationModal({
  data,
  setData,
  onModalRefresh,
  onUploadCert,
  onDownloadCert,
  onDeleteCert,
}: Props) {
  /* サプライヤ・自社証明書共通 */
  const type =
    data && isOwnParts(data.parts.level, data.parts.terminatedFlag)
      ? 'OWN'
      : 'OTHER';
  const [description, setDescription] = useState('');
  useEffect(() => {
    setDescription(data?.certification?.cfpCertificationDescription ?? '');
  }, [data]);

  const [hasHundredFiles, setHasHundredFiles] = useState(false);
  useEffect(() => {
    setHasHundredFiles((data?.certification?.cfpCertificationFileInfo.length ?? 0) === UPLOAD_MAX_CERT_FILE_NUM);
  }, [data]);

  function onClose() {
    setNewFiles([]);
    setData(undefined);
  }

  async function downloadFile(fileId: string) {
    if (data === undefined || data?.certification === undefined) return;
    const targetFile = data?.certification?.cfpCertificationFileInfo.find(
      (info) => info.fileId === fileId
    );
    if (targetFile === undefined) return;
    onDownloadCert(
      targetFile.fileName,
      fileId,
      targetFile.operatorId,
      data.certification.cfpCertificationId,
      type
    );
  }

  /* 自社証明書 */
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newFiles, setNewFiles] = useState<
    { tmpFileId: string; fileObj: File; }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFileExtensionErrorModalOpen, setIsFileExtensionErrorModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState('');

  function addFiles(fileList: FileList | null) {
    if (fileList === null) return;

    const temporaryFiles = Array.from(fileList).map((file) => ({
      tmpFileId: crypto.randomUUID(),
      fileObj: file,
    }));

    // 拡張子の検証
    const invalidFiles = temporaryFiles.filter((file) => {
      return !ACCEPTED_UPLOAD_CERT_FILE_EXT.some((ext) =>
        file.fileObj.name.toLowerCase().endsWith(ext)
      );
    });

    if (invalidFiles.length > 0) {
      setIsFileExtensionErrorModalOpen(true);
      return; // 追加処理を停止
    } else {
      setIsFileExtensionErrorModalOpen(false); // エラーモーダルの状態をリセット
      setNewFiles((currentFiles) => [...currentFiles, ...temporaryFiles]);
    }
  }

  function deleteFile() {
    setNewFiles([]);

  }

  function deleteRegisteredFile(tmpFileId: string) {
    setIsDeleteModalOpen(true);
    setDeleteFileId(tmpFileId);
  }

  const filesAreValid = useMemo(() => {
    // ファイルサイズチェック
    if (
      sum(...newFiles.map((file) => file.fileObj.size)) >
      UPLOAD_MAX_CERT_FILESIZE
    ) {
      return false;
    }
    // ファイル名文字数チェック
    if (
      sum(...newFiles.map((file) => file.fileObj.name.length)) >
      UPLOAD_MAX_CERT_FILE_NAME_NUM
    ) {
      return false;
    }
    return true;
  }, [newFiles]);

  const descriptionLengthIsValid = useMemo(() => {
    if (description.length > MAX_CERT_COMMENT_NUM) return false;
    return true;
  }, [description]);

  const canSubmit = useMemo(() => {
    return newFiles.length > 0 && filesAreValid && descriptionLengthIsValid;
  }, [newFiles, filesAreValid, descriptionLengthIsValid]);

  const onRefresh = () => {
    onModalRefresh(data, setData);
    setNewFiles([]);
  };
  async function onSubmit() {
    if (!data?.parts.traceId) return;
    setIsConfirmModalOpen(false);
    if (
      await onUploadCert({
        traceId: data?.parts.traceId,
        cfpCertificationId: data?.certification?.cfpCertificationId,
        cfpCertificationDescription: isEmpty(description)
          ? undefined
          : description,
        cfpCertificationFileInfo: newFiles.map((file) => file.fileObj),
      })
    ) {
      setNewFiles([]);
      setData(undefined);
    }
  }

  async function onDelete() {
    if (!data?.parts.traceId) return;
    setIsDeleteModalOpen(false);
    if (
      await onDeleteCert(
        data.parts.traceId,
        deleteFileId
      )
    ) {
      setNewFiles([]);
      setData(undefined);
    }
  }

  function handleFilesAdded(files: FileList) {
    addFiles(files);
  }

  return data ? (
    <>
      <BaseModal isOpen={true}>
        <div style={{ width: '900px' }} className='p-8 relative'>
          <div className='absolute top-8 right-8 cursor-pointer'>
            <X size='24' className='fill-primary' onClick={onClose} />
          </div>
          <div className='flex'>
            <div className='font-semibold text-2xl mb-8'>
              {type === 'OWN' ? '自社証明書登録' : 'サプライヤ証明書参照'}
            </div>
            <RefreshButton
              onClick={() => {
                onRefresh();
              }}
              className='ml-4'
              key={data.parts.traceId}
            />
          </div>
          <CertificationPartsSheet parts={data.parts} plant={data.plant} />
          <div className='flex flex-col gap-8'>
            {type === 'OWN' && (
              <div className='group'>
                <SectionHeader className='mb-2' variant='h3' title='説明' />
                <InputTextArea
                  className='p-3 h-[60px] font-semibold'
                  disabled={!(newFiles.length > 0 && filesAreValid)}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={descriptionLengthIsValid ? undefined : '100文字以内'}
                />
              </div>
            )}
            <div className='group'>
              <SectionHeader
                className='mb-2'
                variant='h3'
                title='登録済ファイル'
              />
              <FilesList
                files={data.certification?.cfpCertificationFileInfo ?? []}
                placeHolder='該当ファイルはありません'
                isEditable={(type === 'OWN' ? true : false)}
                onDelete={deleteRegisteredFile}
                onClickDownload={downloadFile}
                emptyStateCustomPadding='pt-[52px] pb-7'
                className={'overflow-auto ' + (type === 'OWN' ? 'max-h-[150px]' : 'max-h-[350px]')}
              />
            </div>
            {type === 'OWN' && (
              <div className='group'>
                <SectionHeader
                  className='mb-2'
                  variant='h3'
                  align='bottom'
                  title={'ファイルの登録'}
                />
                <FilesList
                  files={newFiles.map((file) => ({
                    fileId: file.tmpFileId,
                    fileName: file.fileObj.name,
                    size: fileSizeToString(file.fileObj.size),
                  }))}
                  isUpload={true}
                  onDelete={deleteFile}
                  className='mb-2'
                />
                <div hidden={newFiles.length > 0 || hasHundredFiles}>
                  <FilePicker onFilesAdded={handleFilesAdded} />
                </div>
                <div key='annotation'
                  className='text-center text-error text-sm'
                  hidden={!hasHundredFiles}>
                  既に100件のファイルが登録されているため、新しいファイルを登録できません。
                </div>
                <div key='annotation'
                  className='text-center text-error text-sm'
                  hidden={filesAreValid}>
                  アップロードできるファイルの最大サイズは100MB、ファイル名は100文字以内です。
                </div>
              </div>
            )}
          </div>
          <div
            className='gap-4 flex justify-center mt-8'
          >
            {type === 'OWN' ? (
              <>
                <Button
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={!canSubmit}
                >
                  登録
                </Button>
                <Button onClick={onClose} variant='outline'>
                  キャンセル
                </Button>
              </>
            ) : (
              <Button onClick={onClose}>閉じる</Button>
            )}
          </div>
        </div>
      </BaseModal >
      <PopupModal
        button={
          <Button
            color='primary'
            variant='solid'
            size='default'
            key='submit'
            type='submit'
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            登録
          </Button>
        }
        isOpen={isConfirmModalOpen}
        setIsOpen={setIsConfirmModalOpen}
        title='選択したファイルを登録しますか？'
      />
      <PopupModal
        type='error'
        isOpen={isFileExtensionErrorModalOpen}
        setIsOpen={setIsFileExtensionErrorModalOpen}
        title='ファイルのアップロードに失敗しました。'
      >
        <p>ファイル形式をご確認ください。</p>
      </PopupModal>
      <PopupModal
        button={
          <Button
            color='primary'
            variant='solid'
            size='default'
            key='submit'
            type='submit'
            onClick={onDelete}
          >
            削除
          </Button>
        }
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        title='選択したファイルを削除しますか？'
      />
    </>
  ) : (
    <></>
  );
}
