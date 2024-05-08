import { Plant } from '@/lib/types';
import { tv } from 'tailwind-variants';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';

const spanStyle = tv({
  variants: {
    clamp: {
      true: 'line-clamp-1',
    },
    size: {
      sm: 'text-sm',
      xs: 'text-xs',
    },
  },
});
export function PlantCell({
  plantId,
  plants,
  size,
}: {
  plantId: string;
  plants: Plant[];
  size: 'sm' | 'xs';
}) {
  const plant = plants.find((p) => p.plantId === plantId);
  return (
    <div className='block w-full'>
      {plant === undefined ? (
        <span className={spanStyle({ size })}>
          <DisplayHyphen />
        </span>
      ) : (
        <>
          <span className={spanStyle({ size, clamp: true })}>
            {plant.plantName ?? <br />}
          </span>
          <span className={spanStyle({ size, clamp: true })}>
            {plant.openPlantId ?? <br />}
          </span>
        </>
      )}
    </div>
  );
}
