
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  label: string; // for accessibility and now for tooltip
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'; 
  size?: 'sm' | 'md' | 'lg';
}

const IconButton: React.FC<IconButtonProps> = ({ children, label, variant = 'ghost', size = 'md', className, ...props }) => {
  const baseStyle = "p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-150 flex items-center justify-center";
  
  const variantStyles = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-400",
    secondary: "bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-slate-400 hover:bg-slate-700 hover:text-slate-200 focus:ring-sky-500",
    success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-400",
  };

  const sizeStyles = {
    sm: "w-8 h-8 text-sm", 
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label} // Added title attribute for native tooltip
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;