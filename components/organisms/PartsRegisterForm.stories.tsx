import type { Meta, StoryObj } from '@storybook/react';
import PartsRegisterForm from './PartsRegisterForm';
import { Plant } from '@/lib/types';

const meta = {
  title: 'Components/Organisms/PartsRegisterForm',
  component: PartsRegisterForm,
} satisfies Meta<typeof PartsRegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const plants: Plant[] = [
  {
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809ec',
    plantName:
      '事業所AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    openPlantId: 'openid46',
  },
  {
    plantId: '5c85796c-6f1e-43b0-9190-abbd4be809ec',
    plantName:
      '事業所bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    openPlantId:
      'openbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  },
];
export const Primary: Story = {
  args: {
    plants: plants,
    isConfirmModalOpen: false,
    isCsvUpload: false,
    setIsRegisterButtonActive: () => { },
    isConfirm: false,
  },
};
