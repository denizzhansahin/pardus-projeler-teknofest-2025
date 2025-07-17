import React from 'react';

export const MoveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 9v6" />
    <path d="M9 5h6" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);
