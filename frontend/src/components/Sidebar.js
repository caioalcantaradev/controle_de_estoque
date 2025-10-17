import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, Home, Package, Warehouse, Database, Users, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isAdmin, isManager } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' },
    { name: 'Produtos', href: '/produtos', icon: Package, current: location.pathname.startsWith('/produtos') },
    { name: 'Estoque', href: '/estoque', icon: Warehouse, current: location.pathname.startsWith('/estoque') },
    { name: 'TOTVS', href: '/totvs', icon: Database, current: location.pathname.startsWith('/totvs') },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3, current: location.pathname.startsWith('/relatorios') },
    ...(isManager ? [{ name: 'Usuários', href: '/usuarios', icon: Users, current: location.pathname.startsWith('/usuarios') }] : []),
    { name: 'Configurações', href: '/configuracoes', icon: Settings, current: location.pathname.startsWith('/configuracoes') },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex h-16 items-center justify-between px-4">
                <Logo size="md" variant="full" theme="white" />
                <button
                  type="button"
                  className="rounded-md p-2 text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                    onClick={onClose}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex h-16 items-center px-4">
            <Logo size="md" variant="full" theme="white" />
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-2">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                              : 'text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            item.current ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
