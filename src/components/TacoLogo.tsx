
import React from 'react';

interface TacoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'full' | 'monogram';
}

export const TacoLogo = ({ size = 'md', className = '', variant = 'full' }: TacoLogoProps) => {
  const sizeClasses = {
    sm: variant === 'monogram' ? 'h-5' : 'h-6',
    md: variant === 'monogram' ? 'h-6' : 'h-8', 
    lg: variant === 'monogram' ? 'h-8' : 'h-12'
  };

  // Use the monogram (T) for small contexts, full logo for larger
  const logoSrc = variant === 'monogram' 
    ? '/lovable-uploads/a1d86695-70cc-4e71-a156-2a94444bc071.png'  // Single T logo
    : '/lovable-uploads/94396aa5-c515-4f97-8ee5-1cce284fbda8.png';  // Full TACo logo

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoSrc}
        alt={variant === 'monogram' ? 'TACo T' : 'TACo Logo'} 
        className={`${sizeClasses[size]} w-auto`}
      />
    </div>
  );
};
