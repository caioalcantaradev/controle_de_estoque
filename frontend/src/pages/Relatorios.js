import React, { useState } from 'react';
import { BarChart3, Download, FileText, TrendingUp, Package, Warehouse } from 'lucide-react';

const Relatorios = () => {
  const [dateRange, setDateRange] = useState('30');

  const reports = [
    {
      id: 1,
      name: 'Relatório de Estoque',
      description: 'Situação atual do estoque por produto',
      icon: Warehouse,
      color: 'bg-blue-500',
      type: 'estoque'
    },
    {
      id: 2,
      name: 'Movimentações de Estoque',
      description: 'Histórico de entradas e saídas',
      icon: TrendingUp,
      color: 'bg-green-500',
      type: 'movimentacoes'
    },
    {
      id: 3,
      name: 'Produtos Mais Vendidos',
      description: 'Análise de produtos com maior saída',
      icon: Package,
      color: 'bg-purple-500',
      type: 'vendidos'
    },
    {
      id: 4,
      name: 'Estoque Baixo',
      description: 'Produtos que precisam reposição',
      icon: FileText,
      color: 'bg-orange-500',
      type: 'baixo'
    },
    {
      id: 5,
      name: 'Relatório Financeiro',
      description: 'Valor total do estoque',
      icon: BarChart3,
      color: 'bg-indigo-500',
      type: 'financeiro'
    },
    {
      id: 6,
      name: 'Sincronização TOTVS',
      description: 'Histórico de sincronizações',
      icon: FileText,
      color: 'bg-red-500',
      type: 'totvs'
    },
  ];

  const handleGenerateReport = (reportType) => {
    console.log(`Generating ${reportType} report...`);
    // TODO: Implement report generation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gere relatórios detalhados sobre estoque e movimentações
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input w-full"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="15">Últimos 15 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="60">Últimos 60 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                className="input w-full"
                disabled={dateRange !== 'custom'}
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                className="input w-full"
                disabled={dateRange !== 'custom'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <div key={report.id} className="card hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${report.color}`}>
                  <report.icon className="h-6 w-6 text-white" />
                </div>
                <button
                  onClick={() => handleGenerateReport(report.type)}
                  className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  title="Gerar relatório"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {report.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {report.description}
              </p>

              <button
                onClick={() => handleGenerateReport(report.type)}
                className="w-full btn-primary btn-md"
              >
                Gerar Relatório
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Relatórios Recentes
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Relatório de Estoque - {new Date().toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Gerado há {item} hora(s) atrás
                    </div>
                  </div>
                </div>
                <button
                  className="btn-secondary btn-sm flex items-center space-x-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Baixar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;

