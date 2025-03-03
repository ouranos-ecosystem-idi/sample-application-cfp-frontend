import { CertificationDataType, Parts } from '@/lib/types';
import type { Meta, StoryObj } from '@storybook/react';
import CertificationModal from './CertificationModal';

const meta = {
  title: 'Components/Organisms/CertificationModal',
  component: CertificationModal,
} satisfies Meta<typeof CertificationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const dummyOwnParts: Parts = {
  partsName: 'testParts1',
  supportPartsName: 'sup1',
  level: 1,
  amountRequired: 1,
  amountRequiredUnit: 'kilogram',
  operatorId: 'testOperId1',
  plantId: 'testPlant1',
  terminatedFlag: false,
  traceId: 'testTraceId1',
};
const dummySupplierParts: Parts = {
  partsName: 'testParts1',
  supportPartsName: 'sup1',
  level: 2,
  amountRequired: 1,
  amountRequiredUnit: 'kilogram',
  operatorId: 'testOperId1',
  plantId: 'testPlant1',
  terminatedFlag: false,
  traceId: 'testTraceId1',
};
const dummyCert: CertificationDataType = {
  cfpCertificationId: 'd9a38406-cae2-4679-b052-15a75f5531c5',
  traceId: 'd9a38406-cae2-4679-b052-15a75f5531f6',
  linkedTraceId: 'd9a38406-cae2-4679-b052-15a75f5531f6',
  cfpCertificationDescription: 'B01のCFP証明書説明。',
  cfpCertificationFileInfo: [
    {
      operatorId: 'b1234567-1234-1234-1234-123456789012',
      fileId: '5c07e3e9-c0e5-4a1f-b6a5-78145f7d1850',
      fileName: 'B01_CFP.xlsx',
    },
    {
      operatorId: 'b1234567-1234-1234-1234-123456789012',
      fileId: '5c07e3e9-c0e5-4a1f-b6a5-78145f7d1851',
      fileName: 'B02_CFP.docx',
    },
    {
      operatorId: 'b1234567-1234-1234-1234-123456789012',
      fileId: '5c07e3e9-c0e5-4a1f-b6a5-78145f7d1852',
      fileName: 'B02_CFP.pptx',
    },
    {
      operatorId: 'b1234567-1234-1234-1234-123456789012',
      fileId: '5c07e3e9-c0e5-4a1f-b6a5-78145f7d1853',
      fileName: 'B02_CFP.pdf',
    },
    {
      operatorId: 'b1234567-1234-1234-1234-123456789012',
      fileId: '5c07e3e9-c0e5-4a1f-b6a5-78145f7d1854',
      fileName: 'B02_CFP.txt',
    },
    {
      operatorId: 'b1234567-1234-1234-1234-123456789012',
      fileId: '5c07e3e9-c0e5-4a1f-b6a5-78145f7d1855',
      fileName: 'B02_CFP',
    },
  ],
};

export const Primary: Story = {
  args: {
    data: {
      parts: dummyOwnParts,
      certification: dummyCert,
    },
    onModalRefresh: () => {
      return new Promise(() => { });
    },
    onUploadCert: () => new Promise((resolve) => resolve(true)),
    onDownloadCert: () => new Promise((resolve) => resolve()),
    onDeleteCert: () => new Promise((resolve) => resolve(true)),
  },
};
export const Secondary: Story = {
  args: {
    data: {
      parts: dummySupplierParts,
      certification: dummyCert,
    },
    onModalRefresh: () => {
      return new Promise(() => { });
    },
    onUploadCert: () => new Promise((resolve) => resolve(true)),
    onDownloadCert: () => new Promise((resolve) => resolve()),
    onDeleteCert: () => new Promise((resolve) => resolve(true)),
  },
};
