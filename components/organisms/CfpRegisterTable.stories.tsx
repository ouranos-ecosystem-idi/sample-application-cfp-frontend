import {
  CertificationDataType,
  Operator,
  Parts,
  PartsWithCfpDataType,
  Plant,
  TradeRequestDataType,
} from '@/lib/types';
import type { Meta, StoryObj } from '@storybook/react';
import CfpRegisterTable from './CfpRegisterTable';

const meta = {
  title: 'Components/Organisms/CfpRegisterTable',
  component: CfpRegisterTable,
} satisfies Meta<typeof CfpRegisterTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const parentData: PartsWithCfpDataType = {
  parts: {
    traceId: '694q9wmf-9485-8839-kemo-83skelnr2e40',
    level: 1,
    partsName: 'A123456789A123456789',
    supportPartsName: '0123456789',
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e0',
    amountRequired: 1,
    amountRequiredUnit: 'kilogram',
    operatorId: 'xxx',
    terminatedFlag: false,
  }
};

const parts: Parts[] = [
  {
    traceId: '694q9wmf-9485-8839-kemo-83skelnr2e41',
    level: 2,
    partsName: 'A123456789A123456789',
    supportPartsName: '0123456789',
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e1',
    amountRequired: 1000,
    amountRequiredUnit: 'kilogram',
    operatorId: 'xxx',
    terminatedFlag: false,
  },
  {
    traceId: '694q9wmf-9485-8839-kemo-83skelnr2e42',
    level: 2,
    partsName: 'A123456789A123456789',
    supportPartsName: '0123456789',
    plantId: '12345678901234567890',
    amountRequired: 100,
    amountRequiredUnit: 'kilogram',
    operatorId: 'xxx',
    terminatedFlag: true,
  },
  {
    traceId: '694q9wmf-9485-8839-kemo-83skelnr2e43',
    level: 2,
    partsName: 'A123456789A123456789',
    supportPartsName: '0123456789',
    plantId: '12345678901234567890123456',
    amountRequired: 100,
    amountRequiredUnit: 'kilogram',
    operatorId: 'xxx',
    terminatedFlag: false,
  },
  {
    traceId: '694q9wmf-9485-8839-kemo-83skelnr2e44',
    level: 2,
    partsName: 'A123456789A123456789',
    supportPartsName: '0123456789',
    plantId: '12345678901234567890123456',
    amountRequired: 100,
    amountRequiredUnit: 'kilogram',
    operatorId: 'xxx',
    terminatedFlag: false,
  },
  {
    traceId: '694q9wmf-9485-8839-kemo-83skelnr2e45',
    level: 2,
    partsName: 'A123456789A123456789',
    supportPartsName: '0123456789',
    plantId: '12345678901234567890123456',
    amountRequired: 100,
    amountRequiredUnit: 'kilogram',
    operatorId: 'xxx',
    terminatedFlag: true,
  },
];

const childrenData: (PartsWithCfpDataType & { tradeRequest?: TradeRequestDataType; })[] = [
  {
    parts: parts[0],
    cfps: {
      preProductionResponse: {
        cfpId: 'aaa',
        traceId: '',
        emission: 10,
        unit: 'kgCO2e/kilogram',
        dqrType: 'preProcessingResponse',
        dqrValue: {
          TeR: 1.2,
          TiR: 3.5,
          GeR: 4.5,
        },
      },
      mainProductionResponse: {
        cfpId: 'bbb',
        traceId: '',
        emission: 10,
        unit: 'kgCO2e/kilogram',

        dqrType: 'mainProcessingResponse',
        dqrValue: {
          TeR: 1.2,
          TiR: 3.5,
          GeR: 4.5,
        },
      },
    },
    tradeRequest: {
      tradeStatus: {
        requestStatus: {
          cfpResponseStatus: 'COMPLETED',
          tradeTreeStatus: 'TERMINATED'
        }
      },
      downStreamPart: parts[0],
      upstreamOperatorId: '123456789abcdefghijklmnopqrstuvwxyz123456789abcde',
      tradeId: '1234-5678'
    },
  },
  {
    parts: parts[1],
    cfps: {
      preComponent: {
        cfpId: 'ccc',
        traceId: '',
        emission: 1.0001,
        unit: 'kgCO2e/kilogram',
        dqrType: 'preProcessing',
        dqrValue: {
          TeR: 1.2,
          TiR: 3.5,
          GeR: 4.5,
        },
      },
      mainComponent: {
        cfpId: 'ddd',
        traceId: '',
        emission: 1,
        unit: 'kgCO2e/kilogram',
        dqrType: 'mainProcessing',
        dqrValue: {
          TeR: 1.2,
          TiR: 3.5,
          GeR: 4.5,
        },
      },
    },
    tradeRequest: {
      tradeStatus: {
        requestStatus: {
          cfpResponseStatus: 'COMPLETED',
          tradeTreeStatus: 'TERMINATED'
        }
      },
      downStreamPart: parts[1],
      tradeId: '1234-5678'
    },
  },
  {
    parts: parts[2],
    tradeRequest: {
      tradeId: '1234-5678',
      downStreamPart: parts[2],
      tradeStatus: {
        requestStatus: {
          cfpResponseStatus: 'NOT_COMPLETED',
          tradeTreeStatus: 'TERMINATED',
        }
      },
      upstreamOperatorId: '1234-5678-9012-3456',
    }
  },
  {
    parts: parts[3],
  },
  {
    parts: parts[4],
  },
];

const operatorsData: Operator[] = [
  {
    operatorId: '1234-5678-9012-3456',
    openOperatorId: '1234567890',
    operatorName: '化学A社',
  },
  {
    operatorId: '123456789abcdefghijklmnopqrstuvwxyz123456789abcde',
    openOperatorId: '9876543210',
    operatorName: '化学B社',
  },
];

const plants: Plant[] = [
  {
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e0',
    plantName: '事業所1',
    openPlantId: 'open-plant-id-1',
  },
  {
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e1',
    plantName: '事業所2-long-long-long-long-long',
    openPlantId: 'open-plant-id-2-long-long-long-long',
  },
];

const parentPartsCertDummy: CertificationDataType = {
  cfpCertificationId: 'certification-dummy-1',
  traceId: '694q9wmf-9485-8839-kemo-83skelnr2e40',
  linkedTraceId: '694q9wmf-9485-8839-kemo-83skelnr2e40',
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

const childrenPartsCertDummy: CertificationDataType = {
  cfpCertificationId: 'certification-dummy-2',
  traceId: '694q9wmf-9485-8839-kemo-83skelnr2e41',
  linkedTraceId: '694q9wmf-9485-8839-kemo-83skelnr2e41',
  cfpCertificationDescription: 'CFP証明書説明。',
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
    parentPartWithCfpData: parentData,
    childrenPartsWithCfpWithRequestData: childrenData,
    certifications: [parentPartsCertDummy, childrenPartsCertDummy],
    operatorsData: operatorsData,
    plants,
    onSubmit: () => {
      return new Promise(() => { });
    },
    onModalRefresh: () => {
      return new Promise(() => { });
    },
    onUploadCert: () => new Promise((resolve) => resolve(true)),
    onDeleteCert: () => new Promise((resolve) => resolve(true)),
    onDownloadCert: () => new Promise((resolve) => resolve()),
    isCertsLoading: false,
    isCfpDataLoading: false,
    isPartsLoading: false,
  },
};
