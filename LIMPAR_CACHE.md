# Como Limpar o Cache do Navegador

Se você não está vendo as alterações na tela de login, siga estes passos para limpar o cache:

## Chrome/Edge:
1. Pressione `Ctrl + Shift + R` (hard refresh)
2. Ou pressione `F12` para abrir DevTools
3. Clique com botão direito no botão de refresh
4. Selecione "Esvaziar cache e recarregar forçadamente"

## Firefox:
1. Pressione `Ctrl + Shift + R`
2. Ou pressione `Ctrl + F5`

## Safari:
1. Pressione `Cmd + Shift + R`
2. Ou vá em Desenvolver > Esvaziar Caches

## Alternativa - Modo Incógnito:
Abra uma janela anônima/privada para testar sem cache.

## Verificar se o servidor está rodando:
- Acesse: http://localhost:3000
- Certifique-se de que o servidor React está rodando

## Se ainda não funcionar:
1. Pare o servidor (Ctrl+C no terminal)
2. Execute: `cd frontend && npm start`
3. Aguarde a compilação completa
4. Acesse novamente