import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-gray-900">404</h1>
        <p className="mt-4 text-3xl font-bold text-gray-900">Página não encontrada</p>
        <p className="mt-2 text-base text-gray-500">
          Desculpe, não conseguimos encontrar a página que você está procurando.
        </p>
        
        <div className="mt-8 flex items-center justify-center space-x-4">
          <Link
            to="/dashboard"
            className="btn-primary btn-md flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Ir para Dashboard</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary btn-md flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>
        </div>
      </div>
      
      <div className="mt-12">
        <div className="mx-auto flex justify-center">
          <Logo size="xl" variant="icon" />
        </div>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Sistema de Controle de Estoque CROSBY
        </p>
      </div>
    </div>
  );
};

export default NotFound;

