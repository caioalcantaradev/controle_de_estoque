import React, { useState } from 'react';

const Logo = ({ size = 'md', variant = 'full', className = '' }) => {
  // Tamanhos disponíveis
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Estado para controlar se a logo carregou
  const [logoError, setLogoError] = useState(false);

  // Fallback: Quadrado vermelho com C
  const FallbackIcon = () => (
    <div className={`${sizes[size]} rounded bg-crosby-600 dark:bg-crosby-500 flex items-center justify-center ${className}`}>
      <span className="text-white font-bold text-sm">C</span>
    </div>
  );

  const FallbackFull = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizes[size]} rounded bg-crosby-600 dark:bg-crosby-500 flex items-center justify-center`}>
        <span className="text-white font-bold text-sm">C</span>
      </div>
      {variant === 'full' && (
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          CROSBY
        </span>
      )}
    </div>
  );

  // Se houve erro ao carregar a logo, mostrar fallback
  if (logoError) {
    return variant === 'icon' ? <FallbackIcon /> : <FallbackFull />;
  }

  // Tentar carregar a logo
  return (
    <img
      src="./logo.png"
      alt="CROSBY Logo"
      className={`${sizes[size]} ${className}`}
      onError={() => setLogoError(true)}
      onLoad={() => setLogoError(false)}
    />
  );
};

export default Logo;

