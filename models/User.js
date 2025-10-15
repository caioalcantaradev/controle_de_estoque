const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Email inválido'
    ]
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'gerente', 'operador', 'visualizador'],
    default: 'operador'
  },
  departamento: {
    type: String,
    enum: ['administracao', 'estoque', 'vendas', 'compras', 'financeiro'],
    required: [true, 'Departamento é obrigatório']
  },
  ativo: {
    type: Boolean,
    default: true
  },
  ultimoLogin: {
    type: Date
  },
  tentativasLogin: {
    type: Number,
    default: 0
  },
  bloqueadoAte: {
    type: Date
  }
}, {
  timestamps: true
});

// Index para melhor performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ departamento: 1 });

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar senhas
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para gerar JWT
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role, departamento: this.departamento },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

// Método para verificar se usuário está bloqueado
userSchema.methods.isBlocked = function() {
  return this.bloqueadoAte && this.bloqueadoAte > new Date();
};

// Método para incrementar tentativas de login
userSchema.methods.incrementLoginAttempts = function() {
  // Se já passou o tempo de bloqueio, resetar tentativas
  if (this.bloqueadoAte && this.bloqueadoAte < new Date()) {
    return this.updateOne({
      $unset: { bloqueadoAte: 1 },
      $set: { tentativasLogin: 1 }
    });
  }

  const updates = { $inc: { tentativasLogin: 1 } };
  
  // Bloquear após 5 tentativas por 2 horas
  if (this.tentativasLogin + 1 >= 5 && !this.isBlocked()) {
    updates.$set = { 
      bloqueadoAte: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 horas
    };
  }

  return this.updateOne(updates);
};

// Método para resetar tentativas de login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { bloqueadoAte: 1, tentativasLogin: 1 },
    $set: { ultimoLogin: new Date() }
  });
};

module.exports = mongoose.model('User', userSchema);
