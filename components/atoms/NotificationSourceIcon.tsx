export default function NotificationSourceIcon({
  notificationSource,
  className = '',
  size = 20,
}: {
  notificationSource: 'respondent' | 'requestor';
  className?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      stroke='currentColor'
      strokeLinecap='round'
      viewBox={`0 0 20 20`}
      className={className}
    >
      {notificationSource === 'respondent' ? (
        <path d='M8.25 9.75h8.5M7.5 9.939l2.475-2.475M7.561 10l2.475 2.475M3.25 16.75h8.5M3.25 3.25h8.5M11.75 4.75v-1.5M11.75 16.75v-1.5M3.25 16.75V3.25' />
      ) : (
        <path d='M4.25 9.75h8.5M3.5 9.939l2.475-2.475M3.561 10l2.475 2.475M8.25 16.75h8.5M8.25 3.25h8.5M8.25 4.75v-1.5M8.25 16.75v-1.5M16.75 16.75V3.25' />
      )}
    </svg>
  );
}
