import type { Meta, StoryObj } from '@storybook/react';
import FilesList from './FilesList';
import { ComponentProps } from 'react';

const meta = {
  title: 'Components/Molecules/FilesList',
  component: FilesList,
} satisfies Meta<typeof FilesList>;

export default meta;
type Story = StoryObj<typeof meta>;

const propsPrimary: ComponentProps<typeof FilesList> = {
  files: [
    { fileId: '1', fileName: 'fileA.pdf' },
    { fileId: '2', fileName: 'fileA.docx' },
    { fileId: '3', fileName: 'fileA.pptx' },
    { fileId: '4', fileName: 'fileA.xlsx' },
    { fileId: '5', fileName: 'fileA.txt' },
    { fileId: '6', fileName: 'fileA' },
    { fileId: '7', fileName: 'fileA.doc' },
    { fileId: '8', fileName: 'fileA.ppt' },
    { fileId: '9', fileName: 'fileA.xls' },
    { fileId: '10', fileName: 'fileA.xls.docx' },
  ],
  isEditable: false,
  placeHolder: '該当ファイルはありません',
};
const propsSecondary: ComponentProps<typeof FilesList> = {
  files: [
    { fileId: '1', fileName: 'fileA.pdf', size: '10KB' },
    { fileId: '2', fileName: 'fileA.docx', size: '2.3MB' },
    { fileId: '3', fileName: 'fileA.pptx', size: '390B' },
  ],
  isEditable: true,
  placeHolder: 'ファイルを選択してください',
};

export const Primary: Story = {
  args: propsPrimary,
};

export const Secondary: Story = {
  args: propsSecondary,
};
