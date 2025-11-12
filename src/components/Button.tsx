import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-sm font-semibold text-sm md:text-base uppercase transition-all duration-300 border-2 shadow-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'bg-[#427d78] hover:bg-[#5eb3a1] text-white border-[#427d78] hover:border-[#5eb3a1] font-[\'Montserrat\',sans-serif]',
      secondary: 'bg-white hover:bg-gray-50 text-[#427d78] border-gray-300 hover:border-gray-400 font-[\'Montserrat\',sans-serif]',
    };

    const sizeStyles = 'px-8 py-4 min-h-[52px]';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
