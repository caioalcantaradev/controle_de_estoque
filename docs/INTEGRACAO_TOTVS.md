# Guia de Integração com TOTVS MODA

Este documento detalha como configurar e utilizar a integração entre o Sistema de Controle de Estoque CROSBY e o TOTVS MODA.

## 📋 Pré-requisitos

### 1. Acesso ao TOTVS MODA

- Credenciais de acesso ao sistema TOTVS
- Permissões para consulta de dados de produtos e estoque
- Informações de conexão (URL, porta, banco de dados)

### 2. Configurações de Rede

- Acesso de rede entre o servidor do sistema e o TOTVS
- Portas necessárias liberadas no firewall
- Certificados SSL/TLS se necessário

## 🔧 Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```env
# Configurações TOTVS MODA
TOTVS_BASE_URL=https://seu-totvs-moda.com/api
TOTVS_API_KEY=sua_api_key_totvs
TOTVS_USERNAME=seu_usuario_totvs
TOTVS_PASSWORD=sua_senha_totvs
TOTVS_COMPANY_ID=id_da_empresa_totvs
```

### 2. Teste de Conexão

Após configurar as credenciais, teste a conexão:

```bash
# Via API
curl -X POST http://localhost:3000/api/totvs/test-connection \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json"
```

Ou através da interface web em `/totvs/test-connection`.

## 📊 Mapeamento de Dados

### Produtos

| Campo Sistema | Campo TOTVS    | Descrição                |
| ------------- | -------------- | ------------------------ |
| `codigo`      | `codigo`       | Código único do produto  |
| `codigoTotvs` | `codigo_totvs` | Código original do TOTVS |
| `nome`        | `nome`         | Nome do produto          |
| `categoria`   | `categoria`    | Categoria do produto     |
| `preco.custo` | `preco_custo`  | Preço de custo           |
| `preco.venda` | `preco_venda`  | Preço de venda           |

### Estoque

| Campo Sistema          | Campo TOTVS         | Descrição               |
| ---------------------- | ------------------- | ----------------------- |
| `produto`              | `codigo_produto`    | Referência ao produto   |
| `cor.codigo`           | `cor`               | Código da cor           |
| `tamanho`              | `tamanho`           | Tamanho do produto      |
| `quantidade.fisica`    | `quantidade_fisica` | Quantidade em estoque   |
| `localizacao.deposito` | `deposito`          | Localização no depósito |

## 🔄 Processo de Sincronização

### 1. Sincronização de Produtos

```javascript
// Endpoint para sincronizar produtos
POST /api/totvs/sincronizar/produtos

// Resposta
{
  "success": true,
  "message": "Sincronização de produtos concluída com sucesso",
  "data": {
    "totalSincronizados": 150,
    "totalErros": 2,
    "mensagem": "Sincronização concluída: 150 produtos processados"
  }
}
```

### 2. Sincronização de Estoque

```javascript
// Endpoint para sincronizar estoque
POST /api/totvs/sincronizar/estoque

// Resposta
{
  "success": true,
  "message": "Sincronização de estoque concluída com sucesso",
  "data": {
    "totalSincronizados": 450,
    "totalErros": 5,
    "mensagem": "Sincronização de estoque concluída: 450 itens processados"
  }
}
```

### 3. Sincronização Completa

```javascript
// Endpoint para sincronização completa
POST /api/totvs/sincronizar/completa

// Resposta
{
  "success": true,
  "message": "Sincronização completa concluída com sucesso",
  "data": {
    "produtos": { "totalSincronizados": 150, "totalErros": 2 },
    "estoque": { "totalSincronizados": 450, "totalErros": 5 },
    "duracao": 45000,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## ⚙️ Configurações Avançadas

### 1. Frequência de Sincronização

Configure um job/cron para sincronização automática:

```javascript
// Exemplo com node-cron
const cron = require("node-cron");

// Sincronização a cada 30 minutos
cron.schedule("*/30 * * * *", async () => {
  try {
    await totvsService.sincronizarEstoque();
    console.log("Sincronização automática concluída");
  } catch (error) {
    console.error("Erro na sincronização automática:", error);
  }
});
```

### 2. Filtros de Sincronização

```javascript
// Sincronizar apenas produtos ativos
const filtros = {
  ativo: true,
  categoria: "camiseta",
};

const resultado = await totvsService.buscarProdutos(filtros);
```

### 3. Tratamento de Erros

```javascript
// Exemplo de tratamento de erros
try {
  await totvsService.sincronizarProdutos();
} catch (error) {
  if (error.message.includes("autenticação")) {
    // Tentar reautenticar
    await totvsService.authenticate();
    await totvsService.sincronizarProdutos();
  } else {
    // Log do erro e notificar administradores
    logger.error("Erro na sincronização:", error);
    // Enviar notificação
  }
}
```

## 🔍 Monitoramento

### 1. Status da Sincronização

```javascript
// Verificar status da sincronização
GET /api/totvs/status-sincronizacao

// Resposta
{
  "success": true,
  "data": {
    "produtos": {
      "estatisticas": [
        { "_id": "sincronizado", "count": 148 },
        { "_id": "pendente", "count": 2 }
      ],
      "ultimaSincronizacao": "2024-01-15T10:30:00.000Z"
    },
    "estoque": {
      "estatisticas": [
        { "_id": "sincronizado", "count": 445 },
        { "_id": "pendente", "count": 5 }
      ],
      "ultimaSincronizacao": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 2. Logs de Sincronização

Os logs são salvos em `logs/` e incluem:

- Timestamp da sincronização
- Número de registros processados
- Erros encontrados
- Tempo de execução

## 🚨 Solução de Problemas

### Problemas Comuns

#### 1. Erro de Autenticação

```
Erro: Falha na autenticação: Token inválido
```

**Solução:**

- Verificar credenciais no `.env`
- Confirmar se o usuário tem permissões no TOTVS
- Testar conexão manualmente

#### 2. Timeout na Sincronização

```
Erro: Request timeout
```

**Solução:**

- Aumentar timeout no `totvsService.js`
- Reduzir tamanho do lote de sincronização
- Verificar conectividade de rede

#### 3. Dados Inconsistentes

```
Erro: Produto não encontrado para código TOTVS: ABC123
```

**Solução:**

- Verificar mapeamento de códigos
- Confirmar se produto existe no TOTVS
- Revisar lógica de sincronização

### Logs de Debug

```bash
# Habilitar logs detalhados
DEBUG=totvs:* npm run dev

# Logs específicos da sincronização
tail -f logs/combined.log | grep "sincronização"
```

## 📞 Suporte TOTVS

### Contatos Importantes

- **Suporte Técnico TOTVS**: [suporte@totvs.com](mailto:suporte@totvs.com)
- **Documentação API**: [docs.totvs.com](https://docs.totvs.com)
- **Central de Atendimento**: [centraldeatendimento.totvs.com](https://centraldeatendimento.totvs.com)

### Informações Necessárias para Suporte

Ao solicitar suporte, tenha em mãos:

- Versão do TOTVS MODA
- Logs de erro completos
- Configurações de rede
- Exemplo de dados que não sincronizam

## 🔄 Atualizações

### Versionamento da API

O sistema suporta versionamento da API TOTVS:

```javascript
// Configurar versão da API
TOTVS_API_VERSION=v2.1
TOTVS_BASE_URL=https://seu-totvs-moda.com/api/v2.1
```

### Migração de Dados

Para migrações de versão:

1. Backup completo dos dados
2. Teste em ambiente de desenvolvimento
3. Migração gradual por módulos
4. Validação dos dados migrados

---

**Última atualização**: Janeiro 2024  
**Versão**: 1.0.0
