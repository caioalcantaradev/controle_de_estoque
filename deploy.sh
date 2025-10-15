#!/bin/bash

echo "🚀 Deploy do Sistema CROSBY para GitHub Pages"
echo "=============================================="

# Verificar se estamos na pasta correta
if [ ! -f "README.md" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto"
    exit 1
fi

echo "📋 Fazendo backup dos arquivos..."
git add .

echo "💾 Fazendo commit..."
git commit -m "feat: Sistema de controle de estoque CROSBY - versão limpa para GitHub Pages"

echo "📤 Enviando para GitHub..."
git push origin main

echo "🏗️ Fazendo build do frontend..."
cd frontend
npm install
npm run build

echo "🌐 Deploy para GitHub Pages..."
npx gh-pages -d build

echo "✅ Deploy concluído!"
echo "🌐 Acesse: https://caioalcantaradev.github.io/controle_de_estoque/"
echo "🔐 Login: admin@crosby.com.br"
echo "🔑 Senha: admin123"
