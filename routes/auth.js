const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Registrar novo usuário
// @access  Private (Admin)
router.post('/register', [
  auth,
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role').isIn(['admin', 'gerente', 'operador', 'visualizador']).withMessage('Role inválida'),
  body('departamento').isIn(['administracao', 'estoque', 'vendas', 'compras', 'financeiro']).withMessage('Departamento inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Verificar se usuário tem permissão para criar usuários
    if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores e gerentes podem criar usuários.'
      });
    }

    const { nome, email, password, role, departamento } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Usuário já existe com este email'
      });
    }

    // Criar usuário
    const user = new User({
      nome,
      email,
      password,
      role,
      departamento
    });

    await user.save();

    logger.info(`Novo usuário criado: ${email} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        departamento: user.departamento,
        ativo: user.ativo
      }
    });
  } catch (error) {
    logger.error('Erro ao criar usuário:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Fazer login
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuário com senha
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo'
      });
    }

    // Verificar se usuário está bloqueado
    if (user.isBlocked()) {
      return res.status(401).json({
        success: false,
        error: 'Usuário temporariamente bloqueado. Tente novamente mais tarde.'
      });
    }

    // Verificar senha
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Incrementar tentativas de login
      await user.incrementLoginAttempts();
      
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Resetar tentativas de login
    await user.resetLoginAttempts();

    // Gerar token
    const token = user.getSignedJwtToken();

    logger.info(`Login realizado com sucesso: ${email}`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          departamento: user.departamento,
          ultimoLogin: user.ultimoLogin
        }
      }
    });
  } catch (error) {
    logger.error('Erro no login:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Obter dados do usuário logado
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user._id,
        nome: req.user.nome,
        email: req.user.email,
        role: req.user.role,
        departamento: req.user.departamento,
        ativo: req.user.ativo,
        ultimoLogin: req.user.ultimoLogin
      }
    });
  } catch (error) {
    logger.error('Erro ao obter dados do usuário:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Atualizar perfil do usuário
// @access  Private
router.put('/profile', [
  auth,
  body('nome').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('email').optional().isEmail().withMessage('Email inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nome, email } = req.body;
    const updateData = {};

    if (nome) updateData.nome = nome;
    if (email) {
      // Verificar se email já existe
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email já está em uso por outro usuário'
        });
      }
      updateData.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info(`Perfil atualizado: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        departamento: user.departamento
      }
    });
  } catch (error) {
    logger.error('Erro ao atualizar perfil:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Alterar senha
// @access  Private
router.put('/change-password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Buscar usuário com senha
    const user = await User.findById(req.user._id).select('+password');
    
    // Verificar senha atual
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    logger.info(`Senha alterada: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao alterar senha:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/auth/users
// @desc    Listar usuários
// @access  Private (Admin/Gerente)
router.get('/users', auth, async (req, res) => {
  try {
    // Verificar permissão
    if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const { page = 1, limit = 10, role, departamento, ativo } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (departamento) filter.departamento = departamento;
    if (ativo !== undefined) filter.ativo = ativo === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Erro ao listar usuários:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/auth/users/:id/status
// @desc    Ativar/Desativar usuário
// @access  Private (Admin)
router.put('/users/:id/status', auth, async (req, res) => {
  try {
    // Verificar permissão
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem alterar status de usuários.'
      });
    }

    const { ativo } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ativo },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    logger.info(`Status do usuário ${user.email} alterado para ${ativo ? 'ativo' : 'inativo'} por ${req.user.email}`);

    res.json({
      success: true,
      message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso`,
      data: user
    });
  } catch (error) {
    logger.error('Erro ao alterar status do usuário:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
