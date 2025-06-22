
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  label: string; // for accessibility
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const IconButton: React.FC<IconButtonProps> = ({ children, label, variant = 'ghost', size = 'md', className, ...props }) => {
  const baseStyle = "p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150";
  
  const variantStyles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:ring-indigo-500",
  };

  const sizeStyles = {
    sm: "w-8 h-8 text-sm", // container size for small icons
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
