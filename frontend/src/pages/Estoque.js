import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Warehouse, Search, Filter, Download, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Estoque = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch estoque
  const { data: estoque, isLoading } = useQuery(
    ['estoque', searchTerm, filterStatus],
    async () => {
      const response = await axios.get('/api/estoque', {
        params: { 
          search: searchTerm,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }
      });
      return response.data;
    }
  );

  const getStatusBadge = (quantidade, estoqueMinimo = 10) => {
    if (quantidade === 0) {
      return <span className="badge badge-destructive">Sem Estoque</span>;
    } else if (quantidade < estoqueMinimo) {
      return <span className="badge badge-warning">Estoque Baixo</span>;
    } else {
      return <span className="badge badge-success">Em Estoque</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estoque</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Controle completo do estoque de produtos
          </p>
        </div>
        <button className="btn-primary btn-md flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-500">
                  <Warehouse className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total em Estoque
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {estoque?.totais?.totalQuantidade?.toLocaleString('pt-BR') || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-yellow-500">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Estoque Baixo
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {estoque?.totais?.estoqueBaixo || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-red-500">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Sem Estoque
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {estoque?.totais?.semEstoque || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar no estoque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-full sm:w-48"
            >
              <option value="all">Todos</option>
              <option value="baixo">Estoque Baixo</option>
              <option value="zero">Sem Estoque</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estoque Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-head">Produto</th>
                <th className="table-head">Código</th>
                <th className="table-head">Cor</th>
                <th className="table-head">Tamanho</th>
                <th className="table-head text-right">Quantidade</th>
                <th className="table-head text-right">Reservado</th>
                <th className="table-head text-right">Disponível</th>
                <th className="table-head">Status</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {estoque?.data?.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-cell text-center py-12">
                    <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Nenhum item no estoque</p>
                  </td>
                </tr>
              ) : (
                estoque?.data?.map((item) => (
                  <tr key={item._id} className="table-row">
                    <td className="table-cell font-medium">
                      {item.produto?.nome || 'Produto não encontrado'}
                    </td>
                    <td className="table-cell text-gray-500 dark:text-gray-400">
                      {item.produto?.codigo || '-'}
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-secondary">{item.cor}</span>
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-outline">{item.tamanho}</span>
                    </td>
                    <td className="table-cell text-right font-semibold">
                      {item.quantidade}
                    </td>
                    <td className="table-cell text-right text-gray-500 dark:text-gray-400">
                      {item.quantidadeReservada || 0}
                    </td>
                    <td className="table-cell text-right font-semibold text-green-600">
                      {item.quantidadeDisponivel}
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(item.quantidade, item.estoqueMinimo)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Estoque;

