import type { Meta, StoryObj } from '@storybook/react';
import CertificationPartsSheet from './CertificationPartsSheet';
import { Parts } from '@/lib/types';

const meta = {
  title: 'Components/Organisms/CertificationPartsSheet',
  component: CertificationPartsSheet,
} satisfies Meta<typeof CertificationPartsSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const dummyParts: Parts = {
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

export const Primary: Story = {
  args: {
    parts: dummyParts,
  },
};
