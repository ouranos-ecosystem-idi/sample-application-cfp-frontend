import { ReactNode } from 'react';

type Props = {
  gap?: number;
  data: {
    header: string;
    width?: number;
    value: ReactNode;
  }[];
};

export default function DetailInfoHorizontal({ gap = 0, data }: Props) {
  return (
    <table className='text-left w-full'>
      <thead>
        <tr>
          {data.map(({ header, width }, index) => (
            <th
              key={header}
              className='font-normal text-xs break-all'
              style={{
                width: width
                  ? `${width + (index === 0 ? 0 : gap)}px`
                  : undefined,
                paddingLeft: gap && index !== 0 ? `${gap}px` : undefined,
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className='align-top'>
          {data.map(({ header, value }, index) => (
            <td
              key={header}
              style={{
                paddingLeft: gap && index !== 0 ? `${gap}px` : undefined,
              }}
            >
              <div className='text-base pt-2 break-all line-clamp-3'>
                {value}
              </div>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
