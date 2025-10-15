import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Database, RefreshCw, CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Totvs = () => {
  const queryClient = useQueryClient();
  const [syncType, setSyncType] = useState('completa');

  // Test connection
  const { data: connectionStatus, refetch: testConnection } = useQuery(
    'totvs-connection',
    async () => {
      const response = await axios.post('/api/totvs/test-connection');
      return response.data;
    },
    {
      enabled: false,
      retry: false,
    }
  );

  // Sync mutation
  const syncMutation = useMutation(
    async (type) => {
      const endpoint = type === 'completa' 
        ? '/api/totvs/sincronizar/completa'
        : `/api/totvs/sincronizar/${type}`;
      
      const response = await axios.post(endpoint);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(`Sincronização ${syncType} concluída com sucesso!`);
        queryClient.invalidateQueries('produtos');
        queryClient.invalidateQueries('estoque');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erro ao sincronizar');
      },
    }
  );

  const handleSync = () => {
    if (window.confirm(`Deseja iniciar a sincronização ${syncType}?`)) {
      syncMutation.mutate(syncType);
    }
  };

  const handleTestConnection = () => {
    testConnection();
    toast.loading('Testando conexão...', { id: 'test-connection' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integração TOTVS</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sincronize dados entre o sistema e o TOTVS MODA
        </p>
      </div>

      {/* Connection Status */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Status da Conexão
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {connectionStatus?.success 
                    ? 'Conectado ao TOTVS MODA'
                    : 'Conexão não testada'}
                </p>
              </div>
            </div>
            <button
              onClick={handleTestConnection}
              className="btn-secondary btn-md flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Testar Conexão</span>
            </button>
          </div>

          {connectionStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              connectionStatus.success 
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                {connectionStatus.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="ml-3">
                  <h4 className={`text-sm font-medium ${
                    connectionStatus.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {connectionStatus.message}
                  </h4>
                  {connectionStatus.data && (
                    <pre className="mt-2 text-xs overflow-auto">
                      {JSON.stringify(connectionStatus.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync Options */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Opções de Sincronização
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="syncType"
                value="completa"
                checked={syncType === 'completa'}
                onChange={(e) => setSyncType(e.target.value)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  Sincronização Completa
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Sincroniza produtos e estoque do TOTVS MODA
                </div>
              </div>
            </label>

            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="syncType"
                value="produtos"
                checked={syncType === 'produtos'}
                onChange={(e) => setSyncType(e.target.value)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  Apenas Produtos
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Sincroniza somente o catálogo de produtos
                </div>
              </div>
            </label>

            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="syncType"
                value="estoque"
                checked={syncType === 'estoque'}
                onChange={(e) => setSyncType(e.target.value)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  Apenas Estoque
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Atualiza as quantidades de estoque
                </div>
              </div>
            </label>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSync}
              disabled={syncMutation.isLoading}
              className="btn-primary btn-lg w-full flex items-center justify-center space-x-2"
            >
              {syncMutation.isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  <span>Iniciar Sincronização</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Atenção
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                A sincronização pode levar alguns minutos dependendo da quantidade de dados.
                Certifique-se de que a conexão com o TOTVS MODA está ativa antes de iniciar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Sync Info */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Última Sincronização
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Data/Hora</div>
              <div className="text-base font-medium text-gray-900 mt-1">
                {new Date().toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Produtos Sincronizados</div>
              <div className="text-base font-medium text-gray-900 mt-1">
                150 produtos
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="mt-1">
                <span className="badge badge-success">Sucesso</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totvs;

