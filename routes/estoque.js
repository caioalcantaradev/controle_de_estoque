const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Estoque = require('../models/Estoque');
const Produto = require('../models/Produto');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// @route   GET /api/estoque
// @desc    Listar itens de estoque
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('produto').optional().isMongoId().withMessage('ID do produto inválido'),
  query('deposito').optional().isString().withMessage('Depósito deve ser uma string'),
  query('status').optional().isIn(['disponivel', 'reservado', 'quarentena', 'danificado', 'em_transito']).withMessage('Status inválido'),
  query('estoqueBaixo').optional().isBoolean().withMessage('Estoque baixo deve ser boolean'),
  query('busca').optional().isString().withMessage('Busca deve ser uma string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      produto,
      deposito,
      status,
      estoqueBaixo,
      busca
    } = req.query;

    // Construir filtros
    const filter = {};

    if (produto) filter.produto = produto;
    if (deposito) filter['localizacao.deposito'] = new RegExp(deposito, 'i');
    if (status) filter.status = status;
    if (estoqueBaixo === 'true') filter['alertas.estoqueBaixo'] = true;

    // Busca por texto (nome do produto)
    if (busca) {
      const produtos = await Produto.find({
        $or: [
          { nome: new RegExp(busca, 'i') },
          { codigo: new RegExp(busca, 'i') },
          { codigoTotvs: new RegExp(busca, 'i') }
        ]
      }).select('_id');
      
      filter.produto = { $in: produtos.map(p => p._id) };
    }

    const estoque = await Estoque.find(filter)
      .populate('produto', 'codigo nome categoria marca')
      .sort({ 'produto.nome': 1, cor: 1, tamanho: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Estoque.countDocuments(filter);

    // Calcular totais
    const totais = await Estoque.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalItens: { $sum: 1 },
          totalQuantidade: { $sum: '$quantidade.fisica' },
          totalReservada: { $sum: '$quantidade.reservada' },
          totalDisponivel: { $sum: '$quantidade.disponivel' },
          estoqueBaixo: { $sum: { $cond: ['$alertas.estoqueBaixo', 1, 0] } },
          estoqueZero: { $sum: { $cond: ['$alertas.estoqueZero', 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: estoque,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      totais: totais[0] || {
        totalItens: 0,
        totalQuantidade: 0,
        totalReservada: 0,
        totalDisponivel: 0,
        estoqueBaixo: 0,
        estoqueZero: 0
      }
    });
  } catch (error) {
    logger.error('Erro ao listar estoque:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/estoque/:id
// @desc    Obter item de estoque específico
// @access  Private
router.get('/:id', [
  auth,
  query('id').isMongoId().withMessage('ID inválido')
], async (req, res) => {
  try {
    const estoque = await Estoque.findById(req.params.id)
      .populate('produto')
      .populate('movimentacoes.usuario', 'nome email');

    if (!estoque) {
      return res.status(404).json({
        success: false,
        error: 'Item de estoque não encontrado'
      });
    }

    res.json({
      success: true,
      data: estoque
    });
  } catch (error) {
    logger.error('Erro ao obter item de estoque:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/estoque
// @desc    Criar novo item de estoque
// @access  Private (Estoque/Admin)
router.post('/', [
  auth,
  authorize('admin', 'gerente'),
  body('produto').isMongoId().withMessage('ID do produto inválido'),
  body('cor.nome').notEmpty().withMessage('Nome da cor é obrigatório'),
  body('cor.codigo').notEmpty().withMessage('Código da cor é obrigatório'),
  body('tamanho').notEmpty().withMessage('Tamanho é obrigatório'),
  body('quantidade.fisica').isInt({ min: 0 }).withMessage('Quantidade física deve ser um número não negativo'),
  body('localizacao.deposito').notEmpty().withMessage('Depósito é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      produto,
      cor,
      tamanho,
      quantidade,
      localizacao,
      status = 'disponivel',
      lote,
      preco
    } = req.body;

    // Verificar se produto existe
    const produtoExiste = await Produto.findById(produto);
    if (!produtoExiste) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Verificar se já existe item com mesmo produto, cor e tamanho
    const itemExistente = await Estoque.findOne({
      produto,
      'cor.codigo': cor.codigo,
      tamanho
    });

    if (itemExistente) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um item de estoque para este produto, cor e tamanho'
      });
    }

    const estoque = new Estoque({
      produto,
      cor,
      tamanho,
      quantidade,
      localizacao,
      status,
      lote,
      preco
    });

    await estoque.save();

    // Adicionar movimentação inicial
    await estoque.adicionarMovimentacao({
      tipo: 'entrada',
      quantidade: quantidade.fisica,
      motivo: 'Criação inicial do item',
      documento: {
        tipo: 'outros',
        numero: 'INICIAL'
      },
      usuario: req.user._id,
      observacoes: 'Item criado no sistema'
    });

    await estoque.populate('produto', 'codigo nome categoria');

    logger.info(`Novo item de estoque criado: ${estoque._id} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Item de estoque criado com sucesso',
      data: estoque
    });
  } catch (error) {
    logger.error('Erro ao criar item de estoque:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/estoque/:id
// @desc    Atualizar item de estoque
// @access  Private (Estoque/Admin)
router.put('/:id', [
  auth,
  authorize('admin', 'gerente'),
  body('quantidade.fisica').optional().isInt({ min: 0 }).withMessage('Quantidade física deve ser um número não negativo'),
  body('quantidade.minima').optional().isInt({ min: 0 }).withMessage('Quantidade mínima deve ser um número não negativo'),
  body('quantidade.maxima').optional().isInt({ min: 0 }).withMessage('Quantidade máxima deve ser um número não negativo'),
  body('status').optional().isIn(['disponivel', 'reservado', 'quarentena', 'danificado', 'em_transito']).withMessage('Status inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const estoque = await Estoque.findById(req.params.id);
    if (!estoque) {
      return res.status(404).json({
        success: false,
        error: 'Item de estoque não encontrado'
      });
    }

    const {
      quantidade,
      localizacao,
      status,
      lote,
      preco
    } = req.body;

    // Verificar se houve mudança na quantidade física
    const quantidadeAnterior = estoque.quantidade.fisica;
    const novaQuantidade = quantidade?.fisica !== undefined ? quantidade.fisica : quantidadeAnterior;
    const diferencaQuantidade = novaQuantidade - quantidadeAnterior;

    // Atualizar campos
    if (quantidade) {
      if (quantidade.fisica !== undefined) estoque.quantidade.fisica = quantidade.fisica;
      if (quantidade.minima !== undefined) estoque.quantidade.minima = quantidade.minima;
      if (quantidade.maxima !== undefined) estoque.quantidade.maxima = quantidade.maxima;
    }
    if (localizacao) estoque.localizacao = { ...estoque.localizacao, ...localizacao };
    if (status) estoque.status = status;
    if (lote) estoque.lote = { ...estoque.lote, ...lote };
    if (preco) estoque.preco = { ...estoque.preco, ...preco };

    await estoque.save();

    // Adicionar movimentação se houve mudança na quantidade
    if (diferencaQuantidade !== 0) {
      await estoque.adicionarMovimentacao({
        tipo: diferencaQuantidade > 0 ? 'entrada' : 'saida',
        quantidade: Math.abs(diferencaQuantidade),
        motivo: 'Ajuste manual de estoque',
        documento: {
          tipo: 'ajuste_inventario',
          numero: `AJUSTE-${Date.now()}`
        },
        usuario: req.user._id,
        observacoes: `Quantidade ${diferencaQuantidade > 0 ? 'aumentada' : 'diminuída'} manualmente`
      });
    }

    await estoque.populate('produto', 'codigo nome categoria');

    logger.info(`Item de estoque atualizado: ${estoque._id} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Item de estoque atualizado com sucesso',
      data: estoque
    });
  } catch (error) {
    logger.error('Erro ao atualizar item de estoque:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/estoque/:id/movimentacao
// @desc    Adicionar movimentação ao estoque
// @access  Private (Estoque/Admin)
router.post('/:id/movimentacao', [
  auth,
  authorize('admin', 'gerente'),
  body('tipo').isIn(['entrada', 'saida', 'ajuste', 'transferencia']).withMessage('Tipo de movimentação inválido'),
  body('quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser um número positivo'),
  body('motivo').notEmpty().withMessage('Motivo é obrigatório'),
  body('documento.tipo').isIn(['nota_fiscal', 'pedido_venda', 'ajuste_inventario', 'transferencia', 'outros']).withMessage('Tipo de documento inválido'),
  body('documento.numero').notEmpty().withMessage('Número do documento é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const estoque = await Estoque.findById(req.params.id);
    if (!estoque) {
      return res.status(404).json({
        success: false,
        error: 'Item de estoque não encontrado'
      });
    }

    const {
      tipo,
      quantidade,
      motivo,
      documento,
      observacoes
    } = req.body;

    // Verificar se há estoque suficiente para saída
    if ((tipo === 'saida' || tipo === 'transferencia') && estoque.quantidade.fisica < quantidade) {
      return res.status(400).json({
        success: false,
        error: 'Quantidade insuficiente em estoque'
      });
    }

    // Calcular nova quantidade
    const quantidadeAnterior = estoque.quantidade.fisica;
    let novaQuantidade = quantidadeAnterior;
    
    if (tipo === 'entrada' || tipo === 'ajuste') {
      novaQuantidade += quantidade;
    } else if (tipo === 'saida' || tipo === 'transferencia') {
      novaQuantidade -= quantidade;
    }

    // Adicionar movimentação
    await estoque.adicionarMovimentacao({
      tipo,
      quantidade,
      motivo,
      documento,
      usuario: req.user._id,
      observacoes
    });

    await estoque.populate('produto', 'codigo nome categoria');

    logger.info(`Movimentação adicionada ao estoque ${estoque._id}: ${tipo} de ${quantidade} unidades por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Movimentação adicionada com sucesso',
      data: estoque
    });
  } catch (error) {
    logger.error('Erro ao adicionar movimentação:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/estoque/:id/reservar
// @desc    Reservar estoque
// @access  Private
router.post('/:id/reservar', [
  auth,
  body('quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser um número positivo'),
  body('motivo').notEmpty().withMessage('Motivo é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const estoque = await Estoque.findById(req.params.id);
    if (!estoque) {
      return res.status(404).json({
        success: false,
        error: 'Item de estoque não encontrado'
      });
    }

    const { quantidade, motivo } = req.body;

    // Verificar disponibilidade
    const disponibilidade = estoque.verificarDisponibilidade(quantidade);
    if (!disponibilidade.disponivel) {
      return res.status(400).json({
        success: false,
        error: 'Quantidade insuficiente em estoque',
        disponibilidade
      });
    }

    // Reservar estoque
    await estoque.reservar(quantidade, motivo, req.user._id);

    await estoque.populate('produto', 'codigo nome categoria');

    logger.info(`Estoque reservado: ${estoque._id} - ${quantidade} unidades por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Estoque reservado com sucesso',
      data: estoque
    });
  } catch (error) {
    logger.error('Erro ao reservar estoque:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/estoque/:id/liberar-reserva
// @desc    Liberar reserva de estoque
// @access  Private
router.post('/:id/liberar-reserva', [
  auth,
  body('quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser um número positivo'),
  body('motivo').notEmpty().withMessage('Motivo é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const estoque = await Estoque.findById(req.params.id);
    if (!estoque) {
      return res.status(404).json({
        success: false,
        error: 'Item de estoque não encontrado'
      });
    }

    const { quantidade, motivo } = req.body;

    // Liberar reserva
    await estoque.liberarReserva(quantidade, motivo, req.user._id);

    await estoque.populate('produto', 'codigo nome categoria');

    logger.info(`Reserva liberada: ${estoque._id} - ${quantidade} unidades por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Reserva liberada com sucesso',
      data: estoque
    });
  } catch (error) {
    logger.error('Erro ao liberar reserva:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/estoque/relatorios/estoque-baixo
// @desc    Relatório de estoque baixo
// @access  Private
router.get('/relatorios/estoque-baixo', auth, async (req, res) => {
  try {
    const estoqueBaixo = await Estoque.find({
      'alertas.estoqueBaixo': true
    })
      .populate('produto', 'codigo nome categoria marca')
      .sort({ 'quantidade.disponivel': 1 });

    res.json({
      success: true,
      data: estoqueBaixo,
      total: estoqueBaixo.length
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de estoque baixo:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/estoque/relatorios/movimentacoes
// @desc    Relatório de movimentações
// @access  Private
router.get('/relatorios/movimentacoes', [
  auth,
  query('dataInicio').optional().isISO8601().withMessage('Data de início inválida'),
  query('dataFim').optional().isISO8601().withMessage('Data de fim inválida'),
  query('tipo').optional().isIn(['entrada', 'saida', 'ajuste', 'transferencia', 'reserva', 'liberacao']).withMessage('Tipo inválido'),
  query('produto').optional().isMongoId().withMessage('ID do produto inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { dataInicio, dataFim, tipo, produto } = req.query;

    const match = {};
    
    if (dataInicio || dataFim) {
      match['movimentacoes.data'] = {};
      if (dataInicio) match['movimentacoes.data'].$gte = new Date(dataInicio);
      if (dataFim) match['movimentacoes.data'].$lte = new Date(dataFim);
    }

    if (tipo) {
      match['movimentacoes.tipo'] = tipo;
    }

    if (produto) {
      match.produto = produto;
    }

    const estoque = await Estoque.find(match)
      .populate('produto', 'codigo nome categoria')
      .populate('movimentacoes.usuario', 'nome email')
      .select('produto cor tamanho movimentacoes');

    // Filtrar movimentações baseado nos critérios
    const movimentacoes = [];
    estoque.forEach(item => {
      item.movimentacoes.forEach(mov => {
        let incluir = true;
        
        if (dataInicio && mov.data < new Date(dataInicio)) incluir = false;
        if (dataFim && mov.data > new Date(dataFim)) incluir = false;
        if (tipo && mov.tipo !== tipo) incluir = false;
        
        if (incluir) {
          movimentacoes.push({
            ...mov.toObject(),
            produto: item.produto,
            cor: item.cor,
            tamanho: item.tamanho
          });
        }
      });
    });

    // Ordenar por data
    movimentacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

    res.json({
      success: true,
      data: movimentacoes,
      total: movimentacoes.length
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de movimentações:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
