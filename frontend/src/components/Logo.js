import React from 'react';

const Logo = ({ size = 'md', variant = 'full', className = '' }) => {
  // Tamanhos disponíveis
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Se você tiver a logo em arquivo
  const hasLogoImage = true; // Mude para true quando adicionar a logo

  if (hasLogoImage) {
    return (
      <img
        src="/logo.png" // ou /logo.svg
        alt="CROSBY Logo"
        className={`${sizes[size]} ${className}`}
      />
    );
  }

  // Fallback: Quadrado vermelho com C (atual)
  // Você pode manter isso até ter a logo definitiva
  if (variant === 'icon') {
    return (
      <div className={`${sizes[size]} rounded bg-crosby-600 dark:bg-crosby-500 flex items-center justify-center ${className}`}>
        <span className="text-white font-bold text-sm">C</span>
      </div>
    );
  }

  // Versão completa com texto
  return (
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
};

export default Logo;

