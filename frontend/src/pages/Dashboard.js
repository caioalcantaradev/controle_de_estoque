import React from "react";
import { useQuery } from "react-query";
import {
  Package,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  Users,
  Database,
  BarChart3,
} from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    "dashboard",
    async () => {
      const [produtosRes, estoqueRes, usuariosRes] = await Promise.all([
        axios.get("/api/produtos?limit=1"),
        axios.get("/api/estoque?limit=1"),
        axios.get("/api/auth/users?limit=1"),
      ]);

      return {
        totalProdutos: produtosRes.data.pagination?.total || 0,
        totalEstoque: estoqueRes.data.pagination?.total || 0,
        totalUsuarios: usuariosRes.data.pagination?.total || 0,
        totaisEstoque: estoqueRes.data.totais || {},
      };
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const stats = [
    {
      name: "Total de Produtos",
      value: dashboardData?.totalProdutos || 0,
      icon: Package,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Itens em Estoque",
      value: dashboardData?.totalEstoque || 0,
      icon: Warehouse,
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      name: "Valor Total",
      value: `R$ ${(
        (dashboardData?.totaisEstoque?.totalQuantidade || 0) * 50
      ).toLocaleString("pt-BR")}`,
      icon: TrendingUp,
      color: "bg-purple-500",
      change: "+15%",
      changeType: "positive",
    },
    {
      name: "Usuários Ativos",
      value: dashboardData?.totalUsuarios || 0,
      icon: Users,
      color: "bg-orange-500",
      change: "+2%",
      changeType: "positive",
    },
  ];

  const quickActions = [
    {
      name: "Sincronizar TOTVS",
      description: "Sincronizar dados com TOTVS MODA",
      icon: Database,
      href: "/totvs",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "Ver Relatórios",
      description: "Acessar relatórios de estoque",
      icon: BarChart3,
      href: "/relatorios",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Gerenciar Produtos",
      description: "Adicionar ou editar produtos",
      icon: Package,
      href: "/produtos",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      name: "Controle de Estoque",
      description: "Visualizar e gerenciar estoque",
      icon: Warehouse,
      href: "/estoque",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Visão geral do sistema de controle de estoque CROSBY
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="relative rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-600 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div
                className={`flex-shrink-0 p-2 rounded-md ${action.color} text-white`}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Alertas</h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Sincronização Pendente
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  Há dados pendentes de sincronização com o TOTVS MODA.
                  <a
                    href="/totvs"
                    className="font-medium underline text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100"
                  >
                    Clique aqui para sincronizar
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Atividade Recente
        </h2>
        <div className="card">
          <div className="card-content">
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                <li>
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <Package className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Novo produto adicionado:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              Camiseta CROSBY Básica
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <time dateTime="2024-01-15">2 horas atrás</time>
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
                          <Database className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sincronização com TOTVS concluída:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              150 produtos atualizados
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <time dateTime="2024-01-15">4 horas atrás</time>
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
                          <Warehouse className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Estoque baixo detectado:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              5 produtos
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <time dateTime="2024-01-15">6 horas atrás</time>
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
  );
};

export default Dashboard;
