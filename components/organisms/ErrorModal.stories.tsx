import type { Meta, StoryObj } from '@storybook/react';
import ErrorModal from './ErrorModal';
import { DataTransportAPIError } from '@/api/apiErrors';

const meta = {
  title: 'Components/Organisms/ErrorModal',
  component: ErrorModal,
} satisfies Meta<typeof ErrorModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    error: new DataTransportAPIError(404, {
      code: 'NotFound',
      detail:
        'id:d9a38406-cae2-4679-b052-15a75f5531e6 timeStamp:2023-09-25T14:30:00Z dataTarget:operator method:GET',
      message: 'Endpoint not found',
    }),
  },
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};
