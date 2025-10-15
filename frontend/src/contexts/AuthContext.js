import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Configure axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
    }
  }, []);

  // Load user function (MOCK - funciona sem backend)
  const loadUser = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Usuário mock padrão (admin)
      const mockUser = {
        id: 1,
        nome: 'Administrador',
        email: 'admin@crosby.com.br',
        role: 'admin',
        departamento: 'TI',
        avatar: null,
        ativo: true,
        createdAt: new Date().toISOString(),
      };
      
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: mockUser,
      });
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
    }
  };

  // Login function (MOCK - funciona sem backend)
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mock para login
      const mockUsers = {
        'admin@crosby.com.br': {
          user: {
            id: 1,
            nome: 'Administrador',
            email: 'admin@crosby.com.br',
            role: 'admin',
            departamento: 'TI',
            avatar: null,
            ativo: true,
            createdAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token-' + Date.now(),
        },
        'gerente@crosby.com.br': {
          user: {
            id: 2,
            nome: 'Gerente',
            email: 'gerente@crosby.com.br',
            role: 'gerente',
            departamento: 'Vendas',
            avatar: null,
            ativo: true,
            createdAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token-' + Date.now(),
        }
      };
      
      // Verificar credenciais
      if (mockUsers[email] && password === 'admin123') {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: mockUsers[email],
        });
        
        toast.success('Login realizado com sucesso!');
        return { success: true };
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
        toast.error('Email ou senha incorretos');
        return { success: false, error: 'Credenciais inválidas' };
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      toast.error('Erro interno do sistema');
      return { success: false, error: 'Erro interno' };
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logout realizado com sucesso!');
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Check if user has permission
  const hasPermission = (requiredRoles = [], requiredDepartments = []) => {
    if (!state.user) return false;
    
    const hasRole = requiredRoles.length === 0 || requiredRoles.includes(state.user.role);
    const hasDepartment = requiredDepartments.length === 0 || requiredDepartments.includes(state.user.departamento);
    
    return hasRole && hasDepartment;
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  // Check if user is manager
  const isManager = () => {
    return ['admin', 'gerente'].includes(state.user?.role);
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    loadUser,
    hasPermission,
    isAdmin,
    isManager,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default AuthContext;
