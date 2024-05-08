import React, { useRef, useCallback } from 'react';
import { Button } from '@/components/atoms/Button';

interface FilePickerProps {
  onFilesAdded: (files: FileList) => void;
}

export default function FilePicker({ onFilesAdded }: FilePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFilesAdded(event.target.files);
    }
  }, [onFilesAdded]);

  const handleButtonClick = () => {
    if (fileInputRef.current !== null) {
      fileInputRef.current.click();
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onFilesAdded(event.dataTransfer.files);
    }
  }, [onFilesAdded]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div
      className='bg-white border-dashed border-2 border-gray rounded p-8 text-center h-[152px] opacity-90'
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className='font-semibold text-sm'>ファイルをここにドロップ</div>
      <div className='text-xs mt-2'>もしくは</div>
      <Button className='mt-2 w-[116px] h-8 text-xs' onClick={handleButtonClick}>
        ファイルを選択
      </Button>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        style={{ display: 'none' }}
      />
    </div>
  );
}
