
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  label: string; // For accessibility
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const IconButton: React.FC<IconButtonProps> = ({
  children,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}) => {
  const baseStyle = "p-2 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-primary text-white hover:bg-primary-dark focus:ring-primary";
      break;
    case 'secondary':
      variantStyle = "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary";
      break;
    case 'ghost':
    default:
      variantStyle = "text-textSecondary hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-accent";
      break;
  }

  let sizeStyle = "";
  switch(size) {
    case 'sm': sizeStyle = "w-8 h-8"; break;
    case 'lg': sizeStyle = "w-12 h-12"; break;
    case 'md': 
    default: sizeStyle = "w-10 h-10"; break;
  }


  return (
    <button
      aria-label={label}
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
