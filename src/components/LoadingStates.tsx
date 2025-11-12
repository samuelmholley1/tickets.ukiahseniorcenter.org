'use client';

interface LoadingStatesProps {
  size?: 'sm' | 'md' | 'lg';
}

function LoadingStates({ size = 'md' }: LoadingStatesProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
    </div>
  );
}

export default LoadingStates;
