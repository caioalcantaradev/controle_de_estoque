import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Users, Plus, Search, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Usuarios = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users
  const { data: usuarios, isLoading } = useQuery(
    ['usuarios', searchTerm],
    async () => {
      const response = await axios.get('/api/auth/users', {
        params: { search: searchTerm }
      });
      return response.data.data;
    }
  );

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-destructive',
      gerente: 'badge-warning',
      operador: 'badge-info',
      visualizador: 'badge-secondary',
    };
    return badges[role] || 'badge-secondary';
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
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os usuários do sistema
          </p>
        </div>
        <button className="btn-primary btn-md flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {usuarios?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-500">Ativos</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {usuarios?.filter(u => u.ativo).length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserX className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-500">Inativos</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {usuarios?.filter(u => !u.ativo).length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-500">Admins</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {usuarios?.filter(u => u.role === 'admin').length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-head">Nome</th>
                <th className="table-head">Email</th>
                <th className="table-head">Função</th>
                <th className="table-head">Departamento</th>
                <th className="table-head">Status</th>
                <th className="table-head text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {usuarios?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-cell text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum usuário encontrado</p>
                  </td>
                </tr>
              ) : (
                usuarios?.map((usuario) => (
                  <tr key={usuario._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {usuario.nome.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">
                      {usuario.email}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getRoleBadge(usuario.role)} capitalize`}>
                        {usuario.role}
                      </span>
                    </td>
                    <td className="table-cell capitalize text-gray-500">
                      {usuario.departamento}
                    </td>
                    <td className="table-cell">
                      {usuario.ativo ? (
                        <span className="badge badge-success">Ativo</span>
                      ) : (
                        <span className="badge badge-secondary">Inativo</span>
                      )}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
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

export default Usuarios;

