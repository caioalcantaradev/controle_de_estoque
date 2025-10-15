import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Package, Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Produtos = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products
  const { data: produtos, isLoading } = useQuery(
    ['produtos', searchTerm],
    async () => {
      const response = await axios.get('/api/produtos', {
        params: { search: searchTerm }
      });
      return response.data.data;
    }
  );

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie o catálogo de produtos da CROSBY
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="btn-primary btn-md flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Produto</span>
        </button>
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
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <button className="btn-secondary btn-md flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {produtos?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum produto encontrado</p>
            <button
              onClick={handleAddProduct}
              className="mt-4 btn-primary btn-md"
            >
              Adicionar Primeiro Produto
            </button>
          </div>
        ) : (
          produtos?.map((produto) => (
            <div key={produto._id} className="card hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditProduct(produto)}
                      className="p-2 text-gray-400 hover:text-primary-600 rounded"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {produto.nome}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Cód: {produto.codigo}
                </p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {produto.categoria || 'Sem categoria'}
                  </span>
                  <span className="badge badge-secondary">
                    {produto.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Produtos;

