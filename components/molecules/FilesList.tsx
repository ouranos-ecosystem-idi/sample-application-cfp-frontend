import Card from '@/components/atoms/Card';
import FileIcons from '@/components/atoms/FileIcons';
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { tv } from 'tailwind-variants';

const fileListOuterStyle = tv({
  base: 'divide-y divide-gray',
});
const fileListStyle = tv({
  base: 'flex items-center w-full bg-white h-11',
});
const fileNameStyle = tv({
  base: 'ml-4 cursor-pointer',
  variants: {
    isLink: {
      true: 'text-link-blue underline',
    },
  },
});

function EmptyStateBox({
  placeHolder,
  className,
}: {
  placeHolder?: string;
  className?: string;
}) {
  const fixedClass =
    'group-last:pb-0 w-full flex items-end justify-center text-lg font-semibold text-gray';

  return (
    <div className={`${className ? className : 'pt-4 pb-2'} ${fixedClass}`}>
      {placeHolder}
    </div>
  );
}

export default function FilesList({
  files,
  isEditable = false,
  isUpload = false,
  onClickDownload: onFileClick = () => { },
  onDelete = () => { },
  placeHolder,
  emptyStateCustomPadding,
  className,
}: {
  files: {
    fileId: string;
    fileName: string;
    size?: string;
  }[];
  isEditable?: boolean;
  isUpload?: boolean;
  onClickDownload?: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
  placeHolder?: string;
  emptyStateCustomPadding?: string;
  className?: string;
}) {
  if (files.length === 0 && placeHolder)
    return (
      <EmptyStateBox
        placeHolder={placeHolder}
        className={emptyStateCustomPadding}
      />
    );
  return (
    <Card className={`px-4 ${className || ''
      }`}>
      <ul className={fileListOuterStyle()}>
        {files.map((file) => {
          return (
            <li key={file.fileId} className={fileListStyle()}>
              <FileIcons extension={file.fileName.split('.').pop()} />
              <div
                className={fileNameStyle({ isLink: !isEditable || isUpload }) + ' truncate max-w-96'}
                onClick={isEditable ? () => { } : () => onFileClick(file.fileId)}
              >
                {file.fileName}
              </div>
              <div className='ml-auto mr-1 flex'>
                {isEditable ? (
                  <>
                    <div className='mr-[60px]'>{file.size}</div>
                    <DownloadSimple
                      size={24}
                      className='fill-primary cursor-pointer'
                      onClick={() => onFileClick(file.fileId)}
                    />
                    <Trash
                      size={24}
                      className='fill-error cursor-pointer ml-1'
                      onClick={() => onDelete(file.fileId)}
                    />
                  </>
                ) : isUpload ? (
                  <Trash
                    size={24}
                    className='fill-error cursor-pointer ml-1'
                    onClick={() => onDelete(file.fileId)}
                  />) : (
                  <DownloadSimple
                    size={24}
                    className='fill-primary cursor-pointer'
                    onClick={() => onFileClick(file.fileId)}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
