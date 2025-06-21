
import React from 'react';

interface IconProps {
  className?: string;
}

const PaperClipIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-6 h-6"}
  >
    <path
      fillRule="evenodd"
      d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.5 10.5a.75.75 0 001.06 1.06l10.5-10.5a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06l-3-3a.75.75 0 00-1.06 0l-10.5 10.5a2.25 2.25 0 003.182 3.182l10.5-10.5a.75.75 0 00-1.06-1.06l-10.5 10.5a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06l3 3z"
      clipRule="evenodd"
    />
  </svg>
);

export default PaperClipIcon;
