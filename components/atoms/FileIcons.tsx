import { File } from '@phosphor-icons/react/dist/ssr/File';
import { FileDoc } from '@phosphor-icons/react/dist/ssr/FileDoc';
import { FilePdf } from '@phosphor-icons/react/dist/ssr/FilePdf';
import { FilePpt } from '@phosphor-icons/react/dist/ssr/FilePpt';
import { FileXls } from '@phosphor-icons/react/dist/ssr/FileXls';

export default function FileIcons({
  extension,
  size = 28,
}: {
  extension?: string;
  size?: number;
}) {
  switch (extension?.toLowerCase()) {
    case 'pdf':
      return <FilePdf size={size} />;
    case 'xls':
    case 'xlsx':
      return <FileXls size={size} />;
    case 'doc':
    case 'docx':
      return <FileDoc size={size} />;
    case 'ppt':
    case 'pptx':
      return <FilePpt size={size} />;
    default:
      return <File size={size} />;
  }
}
