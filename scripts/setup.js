#!/usr/bin/env node

/**
 * Script de configuração inicial do Sistema de Controle de Estoque CROSBY
 *
 * Este script ajuda na configuração inicial do sistema, incluindo:
 * - Criação do usuário administrador
 * - Configuração inicial do banco de dados
 * - Teste de conexão com TOTVS
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
require("dotenv").config();

const User = require("../models/User");
const logger = require("../config/logger");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");
  } catch (error) {
    console.error("❌ Erro ao conectar com MongoDB:", error.message);
    process.exit(1);
  }
}

async function createAdminUser() {
  console.log("\n📝 Configuração do usuário administrador");

  const nome = await question("Nome completo: ");
  const email = await question("Email: ");
  const password = await question("Senha (mínimo 6 caracteres): ");

  if (password.length < 6) {
    console.log("❌ Senha deve ter pelo menos 6 caracteres");
    return await createAdminUser();
  }

  try {
    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️  Usuário já existe com este email");
      return;
    }

    // Criar usuário administrador
    const user = new User({
      nome,
      email,
      password,
      role: "admin",
      departamento: "administracao",
      ativo: true,
    });

    await user.save();
    console.log("✅ Usuário administrador criado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error.message);
  }
}

async function testTotvsConnection() {
  console.log("\n🔗 Testando conexão com TOTVS MODA");

  const totvsService = require("../services/totvsService");

  try {
    await totvsService.authenticate();
    console.log("✅ Conexão com TOTVS estabelecida com sucesso");

    // Testar busca de produtos
    const produtos = await totvsService.buscarProdutos({ limit: 1 });
    console.log(
      `✅ Busca de produtos funcionando (${
        produtos.data?.length || 0
      } produtos encontrados)`
    );
  } catch (error) {
    console.log("⚠️  Erro na conexão com TOTVS:", error.message);
    console.log("   Verifique as configurações no arquivo .env");
  }
}

async function checkEnvironment() {
  console.log("\n🔍 Verificando configurações do ambiente");

  const requiredVars = [
    "MONGODB_URI",
    "JWT_SECRET",
    "TOTVS_BASE_URL",
    "TOTVS_USERNAME",
    "TOTVS_PASSWORD",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.log("❌ Variáveis de ambiente faltando:");
    missing.forEach((varName) => console.log(`   - ${varName}`));
    console.log("\n   Configure essas variáveis no arquivo .env");
    return false;
  }

  console.log("✅ Todas as variáveis de ambiente configuradas");
  return true;
}

async function createIndexes() {
  console.log("\n📊 Criando índices do banco de dados");

  try {
    // Índices para User
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ departamento: 1 });

    // Índices para Produto
    const Produto = require("../models/Produto");
    await Produto.collection.createIndex({ codigo: 1 }, { unique: true });
    await Produto.collection.createIndex({ codigoTotvs: 1 });
    await Produto.collection.createIndex({ nome: "text", descricao: "text" });
    await Produto.collection.createIndex({ categoria: 1 });
    await Produto.collection.createIndex({ genero: 1 });
    await Produto.collection.createIndex({ ativo: 1 });

    // Índices para Estoque
    const Estoque = require("../models/Estoque");
    await Estoque.collection.createIndex(
      { produto: 1, "cor.codigo": 1, tamanho: 1 },
      { unique: true }
    );
    await Estoque.collection.createIndex({ "localizacao.deposito": 1 });
    await Estoque.collection.createIndex({ status: 1 });
    await Estoque.collection.createIndex({ "quantidade.disponivel": 1 });
    await Estoque.collection.createIndex({ "alertas.estoqueBaixo": 1 });

    console.log("✅ Índices criados com sucesso");
  } catch (error) {
    console.error("❌ Erro ao criar índices:", error.message);
  }
}

async function main() {
  console.log(
    "🚀 Configuração inicial do Sistema de Controle de Estoque CROSBY"
  );
  console.log(
    "================================================================\n"
  );

  // Verificar configurações
  const envOk = await checkEnvironment();
  if (!envOk) {
    console.log("\n❌ Configure as variáveis de ambiente antes de continuar");
    process.exit(1);
  }

  // Conectar ao banco
  await connectDB();

  // Criar índices
  await createIndexes();

  // Criar usuário administrador
  const createAdmin = await question(
    "\nDeseja criar um usuário administrador? (s/n): "
  );
  if (createAdmin.toLowerCase() === "s") {
    await createAdminUser();
  }

  // Testar conexão TOTVS
  const testTotvs = await question(
    "\nDeseja testar a conexão com TOTVS? (s/n): "
  );
  if (testTotvs.toLowerCase() === "s") {
    await testTotvsConnection();
  }

  console.log("\n🎉 Configuração inicial concluída!");
  console.log("\nPróximos passos:");
  console.log("1. Inicie o servidor: npm run dev");
  console.log("2. Acesse: http://localhost:3000");
  console.log("3. Faça login com o usuário administrador criado");
  console.log("4. Configure a sincronização com TOTVS");

  rl.close();
  process.exit(0);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Erro na configuração:", error);
    process.exit(1);
  });
}

module.exports = { main };
