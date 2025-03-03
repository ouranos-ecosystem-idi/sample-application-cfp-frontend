import Card from '@/components/atoms/Card';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';
import Divider from '@/components/atoms/Divider';
import DetailInfo from '@/components/molecules/DetailInfo';
import { CfpSheetDataType, DqrSheetDataType, Parts, Plant } from '@/lib/types';
import { formatNumber, isEmpty, sum } from '@/lib/utils';
import { ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const cfpValueGroupStyle = tv({
  base: 'pl-4 w-full flex flex-col gap-1',
});
const emissionAndUnitStyle = tv({
  base: 'flex items-center',
});
const emissionStyle = tv({
  base: 'text-right w-[180px]',
  variants: {
    type: {
      main: 'text-base font-semibold',
      sub: 'text-xs',
    },
  },
});
const unitStyle = tv({
  base: 'w-[180px] text-[10px] ml-1 leading-4 ',
});

const dqrValueGroupStyle = tv({
  base: 'w-full flex flex-col gap-1 items-end',
});

const dqrValueStyle = tv({
  base: 'flex items-end',
  variants: {
    type: {
      main: 'text-base font-semibold',
      sub: 'text-xs',
    },
  },
});

type Props = {
  partsData?: Parts;
  cfpData?: {
    preEmission: {
      parent: number;
      children: number;
    };
    mainEmission: {
      parent: number;
      children: number;
    };
    unit?: string;
  };
  dqrData?: DqrSheetDataType;
  plants: Plant[];
  onDataUpdate?: (cfpData: CfpSheetDataType, dqrData: DqrSheetDataType) => void;
  CsvDownloadButton?: ReactNode;
  isLoading: boolean;
};

export default function PartsWithCfpSheet({
  partsData,
  cfpData,
  dqrData,
  plants,
  CsvDownloadButton,
  isLoading,
}: Props) {
  const cfpSum = cfpData
    ? formatNumber(
      sum(
        cfpData.preEmission.parent,
        cfpData.preEmission.children,
        cfpData.mainEmission.parent,
        cfpData.mainEmission.children
      ),
      5
    )
    : 0;
  const plant = plants.find(({ plantId }) => plantId && plantId === partsData?.plantId);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: '-55px',
          right: '0px',
          zIndex: 30,
        }}
      >
        {CsvDownloadButton}
      </div>
      <Card
        className='px-6 py-2 flex gap-6'
        skeletonProperty={{ isLoading: isLoading, height: 'h-64' }}
      >
        <div className='w-[400px] pt-4 pb-2'>
          <DetailInfo
            header='対象部品情報'
            headerWidth={148}
            gap={12}
            data={[
              {
                header: <div className='leading-6'>部品項目</div>,
                value: (
                  <div className='text-base'>{partsData?.partsName ?? <DisplayHyphen />}</div>
                ),
              },
              {
                header: <div className='leading-6'>補助項目</div>,
                value:
                  isEmpty(partsData?.supportPartsName) ? (
                    <DisplayHyphen />
                  ) : (
                    <div className='text-base'>
                      {partsData?.supportPartsName}
                    </div>
                  ),
              },
              {
                header: <div className='leading-6'>事業所名</div>,
                value: (
                  <div className='text-base'>
                    {plant?.plantName ?? <DisplayHyphen />}
                  </div>
                ),
              },
              {
                header: <div className='leading-6'>事業所識別子</div>,
                value: (
                  <div className='text-base'>
                    {plant?.openPlantId ?? <DisplayHyphen />}
                  </div>
                ),
              },
              {
                header: <div className='leading-6'>トレース識別子</div>,
                value: <div className='text-base'>{partsData?.traceId ?? <DisplayHyphen />}</div>,
                lineBreak: true,
              },
            ]}
          />
        </div>
        <Divider />
        <div className='w-[507px] py-4'>
          <DetailInfo
            header='CFP情報'
            headerWidth={208}
            valueWidth={323}
            data={[
              {
                header: '合計',
                value: (
                  <div className={cfpValueGroupStyle()}>
                    <div className={emissionAndUnitStyle()}>
                      <div className={emissionStyle({ type: 'main' })}>
                        {cfpSum}
                      </div>
                      <div className={unitStyle()}>
                        {cfpData?.unit ? cfpData.unit : <DisplayHyphen />}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                header: (
                  <div className='w-full flex flex-col gap-1'>
                    <div className='text-sm leading-6'>
                      CFP（原材料取得及び前処理）
                    </div>
                    <div className='text-xs text-right'>自社由来排出量</div>
                    <div className='text-xs text-right'>部品由来排出量</div>
                  </div>
                ),
                value: (
                  <div className={cfpValueGroupStyle()}>
                    <div className={emissionAndUnitStyle()}>
                      <div className={emissionStyle({ type: 'main' })}>
                        {cfpData?.preEmission
                          ? formatNumber(
                            sum(
                              cfpData.preEmission.parent,
                              cfpData.preEmission.children
                            ), 5
                          )
                          : 0}
                      </div>
                      <div className={unitStyle()}>
                        {cfpData?.unit ? cfpData.unit : <DisplayHyphen />}
                      </div>
                    </div>
                    <div className={emissionAndUnitStyle()}>
                      <div className={emissionStyle({ type: 'sub' })}>
                        {cfpData?.preEmission
                          ? formatNumber(cfpData.preEmission.parent, 5)
                          : 0}
                      </div>
                      <div className={unitStyle()}>
                        {cfpData?.unit ? cfpData.unit : <DisplayHyphen />}
                      </div>
                    </div>
                    <div className={emissionAndUnitStyle()}>
                      <div className={emissionStyle({ type: 'sub' })}>
                        {cfpData?.preEmission
                          ? formatNumber(cfpData.preEmission.children, 5)
                          : 0}
                      </div>
                      <div className={unitStyle()}>
                        {cfpData?.unit ? cfpData.unit : <DisplayHyphen />}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                header: (
                  <div className='w-full flex flex-col gap-1'>
                    <div className='text-sm leading-6'>CFP（主な製造）</div>
                    <div className='text-xs text-right'>自社由来排出量</div>
                    <div className='text-xs text-right'>部品由来排出量</div>
                  </div>
                ),
                value: (
                  <div className={cfpValueGroupStyle()}>
                    <div className={emissionAndUnitStyle()}>
                      <div className={emissionStyle({ type: 'main' })}>
                        {cfpData?.mainEmission
                          ? formatNumber(
                            sum(
                              cfpData.mainEmission.parent,
                              cfpData.mainEmission.children
                            ), 5
                          )
                          : 0}
                      </div>
                      <div className={unitStyle()}>
                        {cfpData?.unit ? cfpData.unit : <DisplayHyphen />}
                      </div>
                    </div>
                    <div className={emissionAndUnitStyle()}>
                      <div className={emissionStyle({ type: 'sub' })}>
                        {cfpData?.mainEmission
                          ? formatNumber(cfpData.mainEmission.parent, 5)
                          : 0}
                      </div>
                      <div className={unitStyle()}>
                        {cfpData?.unit ? cfpData.unit : <DisplayHyphen />}
                      </div>
                    </div>
                    <div className={emissionAndUnitStyle()}>
                      <div className={emissionStyle({ type: 'sub' })}>
                        {cfpData?.mainEmission
                          ? formatNumber(cfpData.mainEmission.children, 5)
                          : 0}
                      </div>
                      <div className={unitStyle()}>
                        {cfpData?.unit ? cfpData.unit : <DisplayHyphen />}
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <Divider />
        <div className='w-[330px] py-4 pr-4'>
          <DetailInfo
            header='DQR情報'
            headerWidth={211}
            valueWidth={143}
            data={[
              {
                header: (
                  <div className='w-full flex flex-col gap-1'>
                    <div className='text-sm leading-6'>
                      DQR（原材料取得及び前処理）
                    </div>
                    <div className='text-xs text-center'>TeR</div>
                    <div className='text-xs text-center'>TiR</div>
                    <div className='text-xs text-center'>GeR</div>
                  </div>
                ),
                value: (
                  <div className={dqrValueGroupStyle()}>
                    <div className={dqrValueStyle({ type: 'main' })}>
                      {dqrData?.preEmission.dqr ?? 0}
                    </div>
                    <div className={dqrValueStyle({ type: 'sub' })}>
                      {dqrData?.preEmission.TeR ?? 0}
                    </div>
                    <div className={dqrValueStyle({ type: 'sub' })}>
                      {dqrData?.preEmission.TiR ?? 0}
                    </div>
                    <div className={dqrValueStyle({ type: 'sub' })}>
                      {dqrData?.preEmission.GeR ?? 0}
                    </div>
                  </div>
                ),
              },
              {
                header: (
                  <div className='w-full flex flex-col gap-1'>
                    <div className='text-sm leading-6'>DQR（主な製造）</div>
                    <div className='text-xs text-center'>TeR</div>
                    <div className='text-xs text-center'>TiR</div>
                    <div className='text-xs text-center'>GeR</div>
                  </div>
                ),
                value: (
                  <div className={dqrValueGroupStyle()}>
                    <div className={dqrValueStyle({ type: 'main' })}>
                      {dqrData?.mainEmission.dqr ?? 0}
                    </div>
                    <div className={dqrValueStyle({ type: 'sub' })}>
                      {dqrData?.mainEmission.TeR ?? 0}
                    </div>
                    <div className={dqrValueStyle({ type: 'sub' })}>
                      {dqrData?.mainEmission.TiR ?? 0}
                    </div>
                    <div className={dqrValueStyle({ type: 'sub' })}>
                      {dqrData?.mainEmission.GeR ?? 0}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}
