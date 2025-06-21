
import React from 'react';

interface IconProps {
  className?: string;
}

const CogIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.921 1.566l-.009.009L8.54 7.153A2.25 2.25 0 006.75 8.953l-2.864.167A2.25 2.25 0 001.5 11.25v1.5c0 .987.697 1.833 1.637 2.09l2.863.676c.994.234 1.636 1.16 1.636 2.188l.009.009.608 3.328a2.25 2.25 0 002.17 1.836h1.844a2.25 2.25 0 002.17-1.836l.608-3.328.009-.009c0-1.028.643-1.954 1.637-2.188l2.862-.676A2.25 2.25 0 0022.5 12.75v-1.5a2.25 2.25 0 00-2.383-2.22l-2.863-.167a2.25 2.25 0 00-1.789-1.8l-.009-.009L14.842 3.822A2.25 2.25 0 0012.922 2.25H11.078zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
  </svg>
);

export default CogIcon;
