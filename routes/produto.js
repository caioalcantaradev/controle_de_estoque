const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Produto = require('../models/Produto');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// @route   GET /api/produtos
// @desc    Listar produtos
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('categoria').optional().isString().withMessage('Categoria deve ser uma string'),
  query('genero').optional().isString().withMessage('Gênero deve ser uma string'),
  query('ativo').optional().isBoolean().withMessage('Ativo deve ser boolean'),
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
      categoria,
      genero,
      ativo,
      busca
    } = req.query;

    // Construir filtros
    const filter = {};

    if (categoria) filter.categoria = categoria;
    if (genero) filter.genero = genero;
    if (ativo !== undefined) filter.ativo = ativo === 'true';

    // Busca por texto
    if (busca) {
      filter.$or = [
        { nome: new RegExp(busca, 'i') },
        { codigo: new RegExp(busca, 'i') },
        { codigoTotvs: new RegExp(busca, 'i') },
        { descricao: new RegExp(busca, 'i') }
      ];
    }

    const produtos = await Produto.find(filter)
      .sort({ nome: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Produto.countDocuments(filter);

    res.json({
      success: true,
      data: produtos,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Erro ao listar produtos:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/produtos/:id
// @desc    Obter produto específico
// @access  Private
router.get('/:id', [
  auth,
  query('id').isMongoId().withMessage('ID inválido')
], async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      data: produto
    });
  } catch (error) {
    logger.error('Erro ao obter produto:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/produtos
// @desc    Criar novo produto
// @access  Private (Admin/Gerente)
router.post('/', [
  auth,
  authorize('admin', 'gerente'),
  body('codigo').notEmpty().withMessage('Código é obrigatório'),
  body('codigoTotvs').notEmpty().withMessage('Código TOTVS é obrigatório'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('categoria').isIn(['camiseta', 'calca', 'short', 'vestido', 'blusa', 'jaqueta', 'casaco', 'saia', 'bermuda', 'macacao', 'conjunto', 'acessorios']).withMessage('Categoria inválida'),
  body('genero').isIn(['masculino', 'feminino', 'infantil', 'unissex']).withMessage('Gênero inválido'),
  body('preco.custo').isNumeric().withMessage('Preço de custo deve ser numérico'),
  body('preco.venda').isNumeric().withMessage('Preço de venda deve ser numérico')
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
      codigo,
      codigoTotvs,
      nome,
      descricao,
      categoria,
      marca = 'CROSBY',
      colecao,
      temporada = 'ano-todo',
      genero,
      faixaEtaria = 'adulto',
      cores = [],
      tamanhos = [],
      preco,
      dimensoes = {},
      materiais = [],
      cuidados = [],
      tags = [],
      imagens = [],
      ativo = true,
      dataLancamento,
      dataDescontinuacao
    } = req.body;

    // Verificar se código já existe
    const produtoExistente = await Produto.findOne({
      $or: [
        { codigo },
        { codigoTotvs }
      ]
    });

    if (produtoExistente) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um produto com este código ou código TOTVS'
      });
    }

    const produto = new Produto({
      codigo,
      codigoTotvs,
      nome,
      descricao,
      categoria,
      marca,
      colecao,
      temporada,
      genero,
      faixaEtaria,
      cores,
      tamanhos,
      preco,
      dimensoes,
      materiais,
      cuidados,
      tags,
      imagens,
      ativo,
      dataLancamento,
      dataDescontinuacao
    });

    await produto.save();

    logger.info(`Novo produto criado: ${produto.codigo} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: produto
    });
  } catch (error) {
    logger.error('Erro ao criar produto:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/produtos/:id
// @desc    Atualizar produto
// @access  Private (Admin/Gerente)
router.put('/:id', [
  auth,
  authorize('admin', 'gerente'),
  body('nome').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('categoria').optional().isIn(['camiseta', 'calca', 'short', 'vestido', 'blusa', 'jaqueta', 'casaco', 'saia', 'bermuda', 'macacao', 'conjunto', 'acessorios']).withMessage('Categoria inválida'),
  body('genero').optional().isIn(['masculino', 'feminino', 'infantil', 'unissex']).withMessage('Gênero inválido'),
  body('preco.custo').optional().isNumeric().withMessage('Preço de custo deve ser numérico'),
  body('preco.venda').optional().isNumeric().withMessage('Preço de venda deve ser numérico')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const produto = await Produto.findById(req.params.id);
    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    const {
      codigo,
      codigoTotvs,
      nome,
      descricao,
      categoria,
      marca,
      colecao,
      temporada,
      genero,
      faixaEtaria,
      cores,
      tamanhos,
      preco,
      dimensoes,
      materiais,
      cuidados,
      tags,
      imagens,
      ativo,
      dataLancamento,
      dataDescontinuacao
    } = req.body;

    // Verificar se códigos já existem em outros produtos
    if (codigo && codigo !== produto.codigo) {
      const codigoExistente = await Produto.findOne({ codigo, _id: { $ne: produto._id } });
      if (codigoExistente) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um produto com este código'
        });
      }
    }

    if (codigoTotvs && codigoTotvs !== produto.codigoTotvs) {
      const codigoTotvsExistente = await Produto.findOne({ codigoTotvs, _id: { $ne: produto._id } });
      if (codigoTotvsExistente) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um produto com este código TOTVS'
        });
      }
    }

    // Atualizar campos
    if (codigo) produto.codigo = codigo;
    if (codigoTotvs) produto.codigoTotvs = codigoTotvs;
    if (nome) produto.nome = nome;
    if (descricao !== undefined) produto.descricao = descricao;
    if (categoria) produto.categoria = categoria;
    if (marca) produto.marca = marca;
    if (colecao !== undefined) produto.colecao = colecao;
    if (temporada) produto.temporada = temporada;
    if (genero) produto.genero = genero;
    if (faixaEtaria) produto.faixaEtaria = faixaEtaria;
    if (cores) produto.cores = cores;
    if (tamanhos) produto.tamanhos = tamanhos;
    if (preco) produto.preco = { ...produto.preco, ...preco };
    if (dimensoes) produto.dimensoes = { ...produto.dimensoes, ...dimensoes };
    if (materiais) produto.materiais = materiais;
    if (cuidados) produto.cuidados = cuidados;
    if (tags) produto.tags = tags;
    if (imagens) produto.imagens = imagens;
    if (ativo !== undefined) produto.ativo = ativo;
    if (dataLancamento !== undefined) produto.dataLancamento = dataLancamento;
    if (dataDescontinuacao !== undefined) produto.dataDescontinuacao = dataDescontinuacao;

    await produto.save();

    logger.info(`Produto atualizado: ${produto.codigo} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: produto
    });
  } catch (error) {
    logger.error('Erro ao atualizar produto:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/produtos/:id
// @desc    Deletar produto
// @access  Private (Admin)
router.delete('/:id', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Verificar se produto tem estoque associado
    const Estoque = require('../models/Estoque');
    const estoqueAssociado = await Estoque.findOne({ produto: produto._id });
    
    if (estoqueAssociado) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar produto que possui estoque associado'
      });
    }

    await Produto.findByIdAndDelete(req.params.id);

    logger.info(`Produto deletado: ${produto.codigo} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar produto:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/produtos/:id/estoque
// @desc    Obter estoque de um produto
// @access  Private
router.get('/:id/estoque', [
  auth,
  query('id').isMongoId().withMessage('ID inválido')
], async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    const Estoque = require('../models/Estoque');
    const estoque = await Estoque.find({ produto: produto._id })
      .sort({ 'cor.nome': 1, tamanho: 1 });

    // Calcular totais por cor e tamanho
    const totais = await Estoque.aggregate([
      { $match: { produto: produto._id } },
      {
        $group: {
          _id: null,
          totalItens: { $sum: 1 },
          totalQuantidade: { $sum: '$quantidade.fisica' },
          totalReservada: { $sum: '$quantidade.reservada' },
          totalDisponivel: { $sum: '$quantidade.disponivel' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        produto: {
          id: produto._id,
          codigo: produto.codigo,
          nome: produto.nome,
          categoria: produto.categoria
        },
        estoque,
        totais: totais[0] || {
          totalItens: 0,
          totalQuantidade: 0,
          totalReservada: 0,
          totalDisponivel: 0
        }
      }
    });
  } catch (error) {
    logger.error('Erro ao obter estoque do produto:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/produtos/relatorios/categorias
// @desc    Relatório de produtos por categoria
// @access  Private
router.get('/relatorios/categorias', auth, async (req, res) => {
  try {
    const relatorio = await Produto.aggregate([
      {
        $group: {
          _id: '$categoria',
          total: { $sum: 1 },
          ativos: { $sum: { $cond: ['$ativo', 1, 0] } },
          inativos: { $sum: { $cond: ['$ativo', 0, 1] } }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: relatorio
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de categorias:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/produtos/relatorios/generos
// @desc    Relatório de produtos por gênero
// @access  Private
router.get('/relatorios/generos', auth, async (req, res) => {
  try {
    const relatorio = await Produto.aggregate([
      {
        $group: {
          _id: '$genero',
          total: { $sum: 1 },
          ativos: { $sum: { $cond: ['$ativo', 1, 0] } },
          inativos: { $sum: { $cond: ['$ativo', 0, 1] } }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: relatorio
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de gêneros:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/produtos/relatorios/precos
// @desc    Relatório de faixas de preço
// @access  Private
router.get('/relatorios/precos', auth, async (req, res) => {
  try {
    const relatorio = await Produto.aggregate([
      {
        $group: {
          _id: null,
          precoMedioCusto: { $avg: '$preco.custo' },
          precoMedioVenda: { $avg: '$preco.venda' },
          precoMinimoCusto: { $min: '$preco.custo' },
          precoMaximoCusto: { $max: '$preco.custo' },
          precoMinimoVenda: { $min: '$preco.venda' },
          precoMaximoVenda: { $max: '$preco.venda' },
          totalProdutos: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: relatorio[0] || {}
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de preços:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
