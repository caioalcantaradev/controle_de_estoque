@echo off
chcp 65001 >nul
cls
echo 🚀 Deploy do Sistema CROSBY para GitHub Pages
echo ==============================================

REM Verificar se estamos na pasta correta
if not exist "README.md" (
    echo ❌ Erro: Execute este script na pasta raiz do projeto
    pause
    exit /b 1
)

echo 📋 Fazendo backup dos arquivos...
git add .

echo 💾 Fazendo commit...
git commit -m "feat: Sistema de controle de estoque CROSBY - versão limpa para GitHub Pages"

echo 📤 Enviando para GitHub...
git push origin main

echo 🏗️ Fazendo build do frontend...
cd frontend
call npm install
call npm run build

echo 🌐 Deploy para GitHub Pages...
call npx gh-pages -d build

echo ✅ Deploy concluído!
echo 🌐 Acesse: https://caioalcantaradev.github.io/controle_de_estoque/
echo 🔐 Login: admin@crosby.com.br
echo 🔑 Senha: admin123

pause
