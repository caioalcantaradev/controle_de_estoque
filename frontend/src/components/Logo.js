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
        {/* Ícone do jogador de hóquei */}
        <div className={`${fallbackSizes[size]} flex items-center justify-center`}>
          <svg 
            viewBox="0 0 24 24" 
            className="w-full h-full text-black dark:text-white"
            fill="currentColor"
          >
            {/* Silhueta do jogador de hóquei */}
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V8.5L21 9ZM3 9L9 8.5V6.5L3 7V9ZM12 7.5C8.5 7.5 5.7 9.5 5.7 12V14.5C5.7 15.3 6.4 16 7.2 16H8.2V18.5C8.2 19.3 8.9 20 9.7 20H14.3C15.1 20 15.8 19.3 15.8 18.5V16H16.8C17.6 16 18.3 15.3 18.3 14.5V12C18.3 9.5 15.5 7.5 12 7.5ZM10 10.5C10.8 10.5 11.5 11.2 11.5 12S10.8 13.5 10 13.5 8.5 12.8 8.5 12 9.2 10.5 10 10.5ZM14 10.5C14.8 10.5 15.5 11.2 15.5 12S14.8 13.5 14 13.5 12.5 12.8 12.5 12 13.2 10.5 14 10.5Z"/>
            {/* Taco de hóquei */}
            <path d="M6 18L8 20L10 18L8 16L6 18Z" fill="currentColor"/>
          </svg>
        </div>
        {variant === 'full' && (
          <div className="flex items-center">
            <span className="text-lg font-bold text-black dark:text-white tracking-wide">
              CROSBY
            </span>
            <div className="w-1 h-1 bg-red-500 rounded-full ml-1"></div>
          </div>
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
      src="/controle_de_estoque/logo.png"
      alt="CROSBY Logo"
      className={`${sizes[size]} ${className}`}
      onError={() => setLogoError(true)}
      onLoad={() => setLogoError(false)}
    />
  );
};

export default Logo;

