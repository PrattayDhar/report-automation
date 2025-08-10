import logoImage from '../assets/logo.png';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin`}>
        <img 
          src={logoImage} 
          alt="Loading..." 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}