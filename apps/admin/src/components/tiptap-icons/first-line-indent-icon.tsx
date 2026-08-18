import { memo } from 'react';

type SvgProps = React.ComponentPropsWithoutRef<'svg'>;

export const FirstLineIndentIcon = memo(({ className, ...props }: SvgProps) => (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M7 5.25a1 1 0 0 1 1-1h13a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" />
    <path d="M3 11.25a1 1 0 0 1 1-1h17a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" />
    <path d="M3 17.25a1 1 0 0 1 1-1h17a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" />
    <path d="m2.3 4.3 2-2a1 1 0 0 1 1.4 1.4L4.41 5 5.7 6.3a1 1 0 0 1-1.4 1.4l-2-2a1 1 0 0 1 0-1.4Z" />
  </svg>
));

FirstLineIndentIcon.displayName = 'FirstLineIndentIcon';
