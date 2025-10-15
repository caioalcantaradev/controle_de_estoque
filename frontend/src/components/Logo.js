import React, { useState } from 'react';

const Logo = ({ size = 'md', variant = 'full', className = '' }) => {
  // Tamanhos disponíveis - ajustados para logo retangular
  const sizes = {
    sm: 'h-6 w-auto', // w-auto mantém proporção
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto',
  };

  // Estado para controlar se a logo carregou
  const [logoError, setLogoError] = useState(false);

  // Fallback: Quadrado vermelho com C (mantém proporção quadrada para fallback)
  const FallbackIcon = () => {
    const fallbackSizes = {
      sm: 'h-6 w-6',
      md: 'h-8 w-8', 
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };
    return (
      <div className={`${fallbackSizes[size]} rounded bg-crosby-600 dark:bg-crosby-500 flex items-center justify-center ${className}`}>
        <span className="text-white font-bold text-sm">C</span>
      </div>
    );
  };

  const FallbackFull = () => {
    const fallbackSizes = {
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-12 w-12', 
      xl: 'h-16 w-16',
    };
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`${fallbackSizes[size]} rounded bg-crosby-600 dark:bg-crosby-500 flex items-center justify-center`}>
          <span className="text-white font-bold text-sm">C</span>
        </div>
        {variant === 'full' && (
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            CROSBY
          </span>
        )}
      </div>
    );
  };

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

