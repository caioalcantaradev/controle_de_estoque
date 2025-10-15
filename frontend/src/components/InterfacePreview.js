import React from "react";

/**
 * Componente para visualizar a estrutura da interface
 * Este arquivo serve como referência visual do design implementado
 */

const InterfacePreview = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo e Título */}
            <div className="flex items-center">
              <div className="h-8 w-8 rounded bg-crosby-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  Sistema de Controle de Estoque
                </h1>
                <span className="text-sm text-gray-500">CROSBY</span>
              </div>
            </div>

            {/* Menu do Usuário */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">João Silva</p>
                <p className="text-xs text-gray-500">Admin • Administração</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 text-sm">JS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md"
            >
              <span className="mr-3">📊</span>
              Dashboard
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <span className="mr-3">📦</span>
              Produtos
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <span className="mr-3">🏪</span>
              Estoque
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <span className="mr-3">🔄</span>
              TOTVS
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <span className="mr-3">📈</span>
              Relatórios
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <span className="mr-3">👥</span>
              Usuários
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <span className="mr-3">⚙️</span>
              Configurações
            </a>
          </nav>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1 p-6">
          {/* Título da Página */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Visão geral do sistema de controle de estoque CROSBY
            </p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Card 1 - Produtos */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-md bg-blue-500">
                      <span className="text-white text-xl">📦</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Produtos
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          1,247
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          +12%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Estoque */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-md bg-green-500">
                      <span className="text-white text-xl">🏪</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Itens em Estoque
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          5,432
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          +8%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Valor Total */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-md bg-purple-500">
                      <span className="text-white text-xl">💰</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Valor Total
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          R$ 271.600
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          +15%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 - Usuários */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-md bg-orange-500">
                      <span className="text-white text-xl">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Usuários Ativos
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          12
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          +2%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="#"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
              >
                <div className="flex-shrink-0 p-2 rounded-md bg-blue-500 text-white">
                  <span className="text-lg">🔄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Sincronizar TOTVS
                  </p>
                  <p className="text-sm text-gray-500">
                    Sincronizar dados com TOTVS MODA
                  </p>
                </div>
              </a>

              <a
                href="#"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
              >
                <div className="flex-shrink-0 p-2 rounded-md bg-green-500 text-white">
                  <span className="text-lg">📈</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Ver Relatórios
                  </p>
                  <p className="text-sm text-gray-500">
                    Acessar relatórios de estoque
                  </p>
                </div>
              </a>

              <a
                href="#"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
              >
                <div className="flex-shrink-0 p-2 rounded-md bg-purple-500 text-white">
                  <span className="text-lg">📦</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Gerenciar Produtos
                  </p>
                  <p className="text-sm text-gray-500">
                    Adicionar ou editar produtos
                  </p>
                </div>
              </a>

              <a
                href="#"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
              >
                <div className="flex-shrink-0 p-2 rounded-md bg-orange-500 text-white">
                  <span className="text-lg">🏪</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Controle de Estoque
                  </p>
                  <p className="text-sm text-gray-500">
                    Visualizar e gerenciar estoque
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Alertas */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Alertas</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Sincronização Pendente
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Há dados pendentes de sincronização com o TOTVS MODA.
                      <a
                        href="#"
                        className="font-medium underline text-yellow-800 hover:text-yellow-900 ml-1"
                      >
                        Clique aqui para sincronizar
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Atividade Recente */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Atividade Recente
            </h2>
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                              <span className="text-white text-sm">📦</span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Novo produto adicionado:{" "}
                                <span className="font-medium text-gray-900">
                                  Camiseta CROSBY Básica
                                </span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time>2 horas atrás</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <span className="text-white text-sm">🔄</span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Sincronização com TOTVS concluída:{" "}
                                <span className="font-medium text-gray-900">
                                  150 produtos atualizados
                                </span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time>4 horas atrás</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="relative">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center ring-8 ring-white">
                              <span className="text-white text-sm">🏪</span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Estoque baixo detectado:{" "}
                                <span className="font-medium text-gray-900">
                                  5 produtos
                                </span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time>6 horas atrás</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterfacePreview;
