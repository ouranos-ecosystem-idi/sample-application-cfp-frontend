import { ReactNode } from 'react';

type SkeletonProps = {
  isLoading: boolean;
  height: string;
};

type Props = {
  className?: string;
  children: ReactNode;
  skeletonProperty?: SkeletonProps;
};

export default function Card({ children, className, skeletonProperty }: Props) {
  return skeletonProperty?.isLoading ? (
    // ローディング中に表示するskeletonプレースホルダ
    <div
      className={`bg-light-gray skeleton w-full ${skeletonProperty.height} relative z-20 rounded`}
    ></div>
  ) : (
    <div
      className={`bg-white shadow rounded w-full relative z-20 ${className || ''
        }`}
    >
      {children}
    </div>
  );
}
