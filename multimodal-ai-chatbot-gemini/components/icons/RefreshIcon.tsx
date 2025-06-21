
import React from 'react';

interface IconProps {
  className?: string;
}

const RefreshIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-6 h-6"}
  >
    <path
      fillRule="evenodd"
      d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.318a.75.75 0 10-1.5 0v3.183l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.25a.75.75 0 00-.75.75v4.992a.75.75 0 101.5 0v-3.182l1.9 1.9a9 9 0 0015.059-3.595.75.75 0 00-.53-.918z"
      clipRule="evenodd"
    />
  </svg>
);

export default RefreshIcon;