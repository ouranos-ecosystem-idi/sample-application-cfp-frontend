import type { Meta, StoryObj } from '@storybook/react';
import { Plant } from '@/lib/types';
import PlantTable from './PlantTable';

const meta = {
  title: 'Components/Organisms/PlantTable',
  component: PlantTable,
} satisfies Meta<typeof PlantTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const PlantsData: Plant[] = [
  {
    plantId: 'a',
    plantName: 'A工場',
    plantAddress: 'xx県xx市xxxx町1-1-1234',
    openPlantId: 'plant123456',
    globalPlantId: 'sampleId1',
  },
  {
    plantId: 'b',
    plantName: 'B工場',
    plantAddress: 'xx県xx市xxxx町2-2-4321',
    openPlantId: 'plant654321',
    globalPlantId: 'sampleId2',
  },
];

export const Primary: Story = {
  args: {
    onSubmit: () => {
      return new Promise(() => { });
    },
    initialData: PlantsData,
    isPlantLoading: false,
  },
};
