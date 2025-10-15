const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'Código do produto é obrigatório'],
    unique: true,
    trim: true,
    uppercase: true
  },
  codigoTotvs: {
    type: String,
    required: [true, 'Código TOTVS é obrigatório'],
    trim: true
  },
  nome: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true,
    maxlength: [200, 'Nome não pode ter mais de 200 caracteres']
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  categoria: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: [
      'camiseta', 'calca', 'short', 'vestido', 'blusa', 'jaqueta',
      'casaco', 'saia', 'bermuda', 'macacao', 'conjunto', 'acessorios'
    ]
  },
  marca: {
    type: String,
    default: 'CROSBY',
    trim: true
  },
  colecao: {
    type: String,
    trim: true
  },
  temporada: {
    type: String,
    enum: ['verao', 'inverno', 'outono', 'primavera', 'ano-todo'],
    default: 'ano-todo'
  },
  genero: {
    type: String,
    enum: ['masculino', 'feminino', 'infantil', 'unissex'],
    required: [true, 'Gênero é obrigatório']
  },
  faixaEtaria: {
    type: String,
    enum: ['bebe', 'infantil', 'juvenil', 'adulto'],
    default: 'adulto'
  },
  cores: [{
    nome: {
      type: String,
      required: true,
      trim: true
    },
    codigo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    hex: {
      type: String,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Código de cor inválido']
    }
  }],
  tamanhos: [{
    nome: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    ordem: {
      type: Number,
      required: true
    }
  }],
  preco: {
    custo: {
      type: Number,
      required: [true, 'Preço de custo é obrigatório'],
      min: [0, 'Preço de custo não pode ser negativo']
    },
    venda: {
      type: Number,
      required: [true, 'Preço de venda é obrigatório'],
      min: [0, 'Preço de venda não pode ser negativo']
    },
    promocional: {
      type: Number,
      min: [0, 'Preço promocional não pode ser negativo']
    }
  },
  dimensoes: {
    peso: {
      type: Number,
      min: [0, 'Peso não pode ser negativo']
    },
    comprimento: {
      type: Number,
      min: [0, 'Comprimento não pode ser negativo']
    },
    largura: {
      type: Number,
      min: [0, 'Largura não pode ser negativo']
    },
    altura: {
      type: Number,
      min: [0, 'Altura não pode ser negativo']
    }
  },
  materiais: [{
    nome: {
      type: String,
      required: true,
      trim: true
    },
    percentual: {
      type: Number,
      min: [0, 'Percentual não pode ser negativo'],
      max: [100, 'Percentual não pode ser maior que 100']
    }
  }],
  cuidados: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  imagens: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    },
    ordem: {
      type: Number,
      default: 0
    }
  }],
  ativo: {
    type: Boolean,
    default: true
  },
  dataLancamento: {
    type: Date
  },
  dataDescontinuacao: {
    type: Date
  },
  // Metadados de sincronização com TOTVS
  totvsSync: {
    ultimaSincronizacao: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sincronizado', 'pendente', 'erro'],
      default: 'pendente'
    },
    erro: {
      type: String
    }
  }
}, {
  timestamps: true
});

// Índices para melhor performance
produtoSchema.index({ codigo: 1 });
produtoSchema.index({ codigoTotvs: 1 });
produtoSchema.index({ nome: 'text', descricao: 'text' });
produtoSchema.index({ categoria: 1 });
produtoSchema.index({ genero: 1 });
produtoSchema.index({ ativo: 1 });
produtoSchema.index({ 'totvsSync.status': 1 });

// Virtual para calcular margem de lucro
produtoSchema.virtual('margemLucro').get(function() {
  if (this.preco.custo && this.preco.venda) {
    return ((this.preco.venda - this.preco.custo) / this.preco.custo * 100).toFixed(2);
  }
  return 0;
});

// Virtual para verificar se está em promoção
produtoSchema.virtual('emPromocao').get(function() {
  return this.preco.promocional && this.preco.promocional < this.preco.venda;
});

// Método para obter preço atual (promocional ou normal)
produtoSchema.methods.getPrecoAtual = function() {
  return this.emPromocao ? this.preco.promocional : this.preco.venda;
};

// Método para verificar se produto está disponível
produtoSchema.methods.isDisponivel = function() {
  return this.ativo && 
         (!this.dataDescontinuacao || this.dataDescontinuacao > new Date());
};

// Middleware para atualizar status de sincronização
produtoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.totvsSync.status = 'pendente';
    this.totvsSync.ultimaSincronizacao = new Date();
  }
  next();
});

module.exports = mongoose.model('Produto', produtoSchema);
