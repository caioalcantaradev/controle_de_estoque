const express = require('express');
const { body, query, validationResult } = require('express-validator');
const totvsService = require('../services/totvsService');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// @route   POST /api/totvs/test-connection
// @desc    Testar conexão com TOTVS
// @access  Private (Admin)
router.post('/test-connection', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info('Testando conexão com TOTVS MODA...');
    
    await totvsService.authenticate();
    
    res.json({
      success: true,
      message: 'Conexão com TOTVS MODA estabelecida com sucesso',
      data: {
        timestamp: new Date().toISOString(),
        status: 'conectado'
      }
    });
  } catch (error) {
    logger.error('Erro ao testar conexão com TOTVS:', error.message);
    res.status(500).json({
      success: false,
      error: 'Falha na conexão com TOTVS MODA',
      details: error.message
    });
  }
});

// @route   GET /api/totvs/produtos
// @desc    Buscar produtos no TOTVS
// @access  Private
router.get('/produtos', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('categoria').optional().isString().withMessage('Categoria deve ser uma string'),
  query('ativo').optional().isBoolean().withMessage('Ativo deve ser boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const filtros = {
      page: req.query.page,
      limit: req.query.limit,
      categoria: req.query.categoria,
      ativo: req.query.ativo
    };

    // Remover valores undefined
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined) {
        delete filtros[key];
      }
    });

    const resultado = await totvsService.buscarProdutos(filtros);
    
    res.json({
      success: true,
      message: 'Produtos buscados com sucesso no TOTVS',
      data: resultado.data,
      pagination: resultado.pagination
    });
  } catch (error) {
    logger.error('Erro ao buscar produtos no TOTVS:', error.message);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar produtos no TOTVS',
      details: error.message
    });
  }
});

// @route   GET /api/totvs/estoque
// @desc    Buscar estoque no TOTVS
// @access  Private
router.get('/estoque', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('deposito').optional().isString().withMessage('Depósito deve ser uma string'),
  query('status').optional().isString().withMessage('Status deve ser uma string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const filtros = {
      page: req.query.page,
      limit: req.query.limit,
      deposito: req.query.deposito,
      status: req.query.status
    };

    // Remover valores undefined
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined) {
        delete filtros[key];
      }
    });

    const resultado = await totvsService.buscarEstoque(filtros);
    
    res.json({
      success: true,
      message: 'Estoque buscado com sucesso no TOTVS',
      data: resultado.data,
      pagination: resultado.pagination
    });
  } catch (error) {
    logger.error('Erro ao buscar estoque no TOTVS:', error.message);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar estoque no TOTVS',
      details: error.message
    });
  }
});

// @route   POST /api/totvs/sincronizar/produtos
// @desc    Sincronizar produtos do TOTVS
// @access  Private (Admin/Gerente)
router.post('/sincronizar/produtos', [
  auth,
  authorize('admin', 'gerente')
], async (req, res) => {
  try {
    logger.info(`Iniciando sincronização de produtos por ${req.user.email}`);
    
    const resultado = await totvsService.sincronizarProdutos();
    
    logger.info(`Sincronização de produtos concluída: ${resultado.totalSincronizados} produtos processados`);
    
    res.json({
      success: true,
      message: 'Sincronização de produtos concluída com sucesso',
      data: resultado
    });
  } catch (error) {
    logger.error('Erro na sincronização de produtos:', error.message);
    res.status(500).json({
      success: false,
      error: 'Falha na sincronização de produtos',
      details: error.message
    });
  }
});

// @route   POST /api/totvs/sincronizar/estoque
// @desc    Sincronizar estoque do TOTVS
// @access  Private (Admin/Gerente)
router.post('/sincronizar/estoque', [
  auth,
  authorize('admin', 'gerente')
], async (req, res) => {
  try {
    logger.info(`Iniciando sincronização de estoque por ${req.user.email}`);
    
    const resultado = await totvsService.sincronizarEstoque();
    
    logger.info(`Sincronização de estoque concluída: ${resultado.totalSincronizados} itens processados`);
    
    res.json({
      success: true,
      message: 'Sincronização de estoque concluída com sucesso',
      data: resultado
    });
  } catch (error) {
    logger.error('Erro na sincronização de estoque:', error.message);
    res.status(500).json({
      success: false,
      error: 'Falha na sincronização de estoque',
      details: error.message
    });
  }
});

// @route   POST /api/totvs/sincronizar/completa
// @desc    Sincronização completa (produtos + estoque)
// @access  Private (Admin)
router.post('/sincronizar/completa', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info(`Iniciando sincronização completa por ${req.user.email}`);
    
    const inicio = Date.now();
    
    // Sincronizar produtos primeiro
    const resultadoProdutos = await totvsService.sincronizarProdutos();
    
    // Aguardar um pouco antes de sincronizar estoque
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Sincronizar estoque
    const resultadoEstoque = await totvsService.sincronizarEstoque();
    
    const duracao = Date.now() - inicio;
    
    const resultado = {
      produtos: resultadoProdutos,
      estoque: resultadoEstoque,
      duracao: duracao,
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Sincronização completa concluída em ${duracao}ms por ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Sincronização completa concluída com sucesso',
      data: resultado
    });
  } catch (error) {
    logger.error('Erro na sincronização completa:', error.message);
    res.status(500).json({
      success: false,
      error: 'Falha na sincronização completa',
      details: error.message
    });
  }
});

// @route   GET /api/totvs/status-sincronizacao
// @desc    Verificar status da sincronização
// @access  Private
router.get('/status-sincronizacao', auth, async (req, res) => {
  try {
    const Produto = require('../models/Produto');
    const Estoque = require('../models/Estoque');
    
    // Estatísticas de produtos
    const statsProdutos = await Produto.aggregate([
      {
        $group: {
          _id: '$totvsSync.status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Estatísticas de estoque
    const statsEstoque = await Estoque.aggregate([
      {
        $group: {
          _id: '$totvsSync.status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Última sincronização
    const ultimaSincronizacaoProdutos = await Produto.findOne()
      .sort({ 'totvsSync.ultimaSincronizacao': -1 })
      .select('totvsSync.ultimaSincronizacao');
    
    const ultimaSincronizacaoEstoque = await Estoque.findOne()
      .sort({ 'totvsSync.ultimaSincronizacao': -1 })
      .select('totvsSync.ultimaSincronizacao');
    
    res.json({
      success: true,
      data: {
        produtos: {
          estatisticas: statsProdutos,
          ultimaSincronizacao: ultimaSincronizacaoProdutos?.totvsSync?.ultimaSincronizacao
        },
        estoque: {
          estatisticas: statsEstoque,
          ultimaSincronizacao: ultimaSincronizacaoEstoque?.totvsSync?.ultimaSincronizacao
        }
      }
    });
  } catch (error) {
    logger.error('Erro ao verificar status da sincronização:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar status da sincronização',
      details: error.message
    });
  }
});

// @route   POST /api/totvs/enviar-dados
// @desc    Enviar dados para o TOTVS
// @access  Private (Admin)
router.post('/enviar-dados', [
  auth,
  authorize('admin'),
  body('endpoint').notEmpty().withMessage('Endpoint é obrigatório'),
  body('dados').isObject().withMessage('Dados devem ser um objeto')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { endpoint, dados } = req.body;
    
    logger.info(`Enviando dados para TOTVS: ${endpoint} por ${req.user.email}`);
    
    const resultado = await totvsService.enviarDados(endpoint, dados);
    
    res.json({
      success: true,
      message: 'Dados enviados com sucesso para o TOTVS',
      data: resultado
    });
  } catch (error) {
    logger.error('Erro ao enviar dados para TOTVS:', error.message);
    res.status(500).json({
      success: false,
      error: 'Falha ao enviar dados para o TOTVS',
      details: error.message
    });
  }
});

// @route   GET /api/totvs/configuracoes
// @desc    Obter configurações de conexão (sem dados sensíveis)
// @access  Private (Admin)
router.get('/configuracoes', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        baseURL: process.env.TOTVS_BASE_URL,
        companyId: process.env.TOTVS_COMPANY_ID,
        hasApiKey: !!process.env.TOTVS_API_KEY,
        hasUsername: !!process.env.TOTVS_USERNAME,
        hasPassword: !!process.env.TOTVS_PASSWORD,
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    logger.error('Erro ao obter configurações:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter configurações'
    });
  }
});

module.exports = router;
