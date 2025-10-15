const mongoose = require('mongoose');

const estoqueSchema = new mongoose.Schema({
  produto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produto',
    required: [true, 'Produto é obrigatório']
  },
  cor: {
    nome: {
      type: String,
      required: [true, 'Nome da cor é obrigatório'],
      trim: true
    },
    codigo: {
      type: String,
      required: [true, 'Código da cor é obrigatório'],
      trim: true,
      uppercase: true
    }
  },
  tamanho: {
    type: String,
    required: [true, 'Tamanho é obrigatório'],
    trim: true,
    uppercase: true
  },
  quantidade: {
    fisica: {
      type: Number,
      required: [true, 'Quantidade física é obrigatória'],
      min: [0, 'Quantidade física não pode ser negativa'],
      default: 0
    },
    reservada: {
      type: Number,
      min: [0, 'Quantidade reservada não pode ser negativa'],
      default: 0
    },
    disponivel: {
      type: Number,
      min: [0, 'Quantidade disponível não pode ser negativa'],
      default: 0
    },
    minima: {
      type: Number,
      min: [0, 'Quantidade mínima não pode ser negativa'],
      default: 0
    },
    maxima: {
      type: Number,
      min: [0, 'Quantidade máxima não pode ser negativa'],
      default: 1000
    }
  },
  localizacao: {
    deposito: {
      type: String,
      required: [true, 'Depósito é obrigatório'],
      trim: true,
      uppercase: true
    },
    corredor: {
      type: String,
      trim: true,
      uppercase: true
    },
    prateleira: {
      type: String,
      trim: true,
      uppercase: true
    },
    posicao: {
      type: String,
      trim: true,
      uppercase: true
    }
  },
  status: {
    type: String,
    enum: ['disponivel', 'reservado', 'quarentena', 'danificado', 'em_transito'],
    default: 'disponivel'
  },
  lote: {
    numero: {
      type: String,
      trim: true,
      uppercase: true
    },
    dataFabricacao: {
      type: Date
    },
    dataVencimento: {
      type: Date
    },
    fornecedor: {
      type: String,
      trim: true
    }
  },
  preco: {
    custo: {
      type: Number,
      min: [0, 'Preço de custo não pode ser negativo']
    },
    venda: {
      type: Number,
      min: [0, 'Preço de venda não pode ser negativo']
    },
    promocional: {
      type: Number,
      min: [0, 'Preço promocional não pode ser negativo']
    }
  },
  // Histórico de movimentações
  movimentacoes: [{
    tipo: {
      type: String,
      enum: ['entrada', 'saida', 'ajuste', 'transferencia', 'reserva', 'liberacao'],
      required: true
    },
    quantidade: {
      type: Number,
      required: true
    },
    quantidadeAnterior: {
      type: Number,
      required: true
    },
    quantidadeNova: {
      type: Number,
      required: true
    },
    motivo: {
      type: String,
      trim: true
    },
    documento: {
      tipo: {
        type: String,
        enum: ['nota_fiscal', 'pedido_venda', 'ajuste_inventario', 'transferencia', 'outros']
      },
      numero: {
        type: String,
        trim: true
      }
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    data: {
      type: Date,
      default: Date.now
    },
    observacoes: {
      type: String,
      trim: true
    }
  }],
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
    },
    codigoTotvs: {
      type: String,
      trim: true
    }
  },
  // Alertas e notificações
  alertas: {
    estoqueBaixo: {
      type: Boolean,
      default: false
    },
    estoqueZero: {
      type: Boolean,
      default: false
    },
    vencimentoProximo: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Índices para melhor performance
estoqueSchema.index({ produto: 1, cor: 1, tamanho: 1 }, { unique: true });
estoqueSchema.index({ 'localizacao.deposito': 1 });
estoqueSchema.index({ status: 1 });
estoqueSchema.index({ 'quantidade.disponivel': 1 });
estoqueSchema.index({ 'alertas.estoqueBaixo': 1 });
estoqueSchema.index({ 'alertas.estoqueZero': 1 });
estoqueSchema.index({ 'totvsSync.status': 1 });

// Virtual para calcular quantidade disponível
estoqueSchema.virtual('quantidadeDisponivelCalculada').get(function() {
  return Math.max(0, this.quantidade.fisica - this.quantidade.reservada);
});

// Virtual para verificar se está em estoque baixo
estoqueSchema.virtual('emEstoqueBaixo').get(function() {
  return this.quantidade.disponivel <= this.quantidade.minima;
});

// Virtual para verificar se está em estoque zero
estoqueSchema.virtual('emEstoqueZero').get(function() {
  return this.quantidade.disponivel <= 0;
});

// Middleware para calcular quantidade disponível antes de salvar
estoqueSchema.pre('save', function(next) {
  this.quantidade.disponivel = this.quantidadeDisponivelCalculada;
  
  // Atualizar alertas
  this.alertas.estoqueBaixo = this.emEstoqueBaixo;
  this.alertas.estoqueZero = this.emEstoqueZero;
  
  // Atualizar status de sincronização se houver mudanças
  if (this.isModified() && !this.isNew) {
    this.totvsSync.status = 'pendente';
    this.totvsSync.ultimaSincronizacao = new Date();
  }
  
  next();
});

// Método para adicionar movimentação
estoqueSchema.methods.adicionarMovimentacao = function(dados) {
  const movimentacao = {
    ...dados,
    quantidadeAnterior: this.quantidade.fisica,
    quantidadeNova: this.quantidade.fisica + dados.quantidade
  };
  
  this.movimentacoes.push(movimentacao);
  this.quantidade.fisica = movimentacao.quantidadeNova;
  
  return this.save();
};

// Método para reservar estoque
estoqueSchema.methods.reservar = function(quantidade, motivo, usuario) {
  if (this.quantidade.disponivel < quantidade) {
    throw new Error('Quantidade insuficiente em estoque');
  }
  
  this.quantidade.reservada += quantidade;
  
  this.movimentacoes.push({
    tipo: 'reserva',
    quantidade: quantidade,
    quantidadeAnterior: this.quantidade.reservada - quantidade,
    quantidadeNova: this.quantidade.reservada,
    motivo: motivo,
    usuario: usuario,
    data: new Date()
  });
  
  return this.save();
};

// Método para liberar reserva
estoqueSchema.methods.liberarReserva = function(quantidade, motivo, usuario) {
  if (this.quantidade.reservada < quantidade) {
    throw new Error('Quantidade reservada insuficiente');
  }
  
  this.quantidade.reservada -= quantidade;
  
  this.movimentacoes.push({
    tipo: 'liberacao',
    quantidade: quantidade,
    quantidadeAnterior: this.quantidade.reservada + quantidade,
    quantidadeNova: this.quantidade.reservada,
    motivo: motivo,
    usuario: usuario,
    data: new Date()
  });
  
  return this.save();
};

// Método para verificar disponibilidade
estoqueSchema.methods.verificarDisponibilidade = function(quantidade) {
  return {
    disponivel: this.quantidade.disponivel >= quantidade,
    quantidadeDisponivel: this.quantidade.disponivel,
    quantidadeSolicitada: quantidade,
    diferenca: this.quantidade.disponivel - quantidade
  };
};

module.exports = mongoose.model('Estoque', estoqueSchema);
