# Documentação da API - Sistema de Controle de Estoque CROSBY

## 📋 Visão Geral

A API REST do Sistema de Controle de Estoque CROSBY fornece endpoints para gerenciar produtos, estoque, usuários e integração com TOTVS MODA.

**Base URL**: `http://localhost:3000/api`  
**Versão**: 1.0.0  
**Formato**: JSON

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer SEU_JWT_TOKEN
```

### Obter Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@crosby.com",
  "password": "senha123"
}
```

**Resposta:**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "nome": "João Silva",
      "email": "joao@crosby.com",
      "role": "admin",
      "departamento": "administracao"
    }
  }
}
```

## 👥 Autenticação e Usuários

### Login

```http
POST /api/auth/login
```

**Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

### Dados do Usuário Logado

```http
GET /api/auth/me
```

### Registrar Usuário (Admin)

```http
POST /api/auth/register
```

**Body:**

```json
{
  "nome": "string (required)",
  "email": "string (required)",
  "password": "string (required, min: 6)",
  "role": "admin|gerente|operador|visualizador (required)",
  "departamento": "administracao|estoque|vendas|compras|financeiro (required)"
}
```

### Listar Usuários

```http
GET /api/auth/users?page=1&limit=10&role=admin&ativo=true
```

### Ativar/Desativar Usuário

```http
PUT /api/auth/users/:id/status
```

**Body:**

```json
{
  "ativo": true
}
```

## 📦 Produtos

### Listar Produtos

```http
GET /api/produtos?page=1&limit=20&categoria=camiseta&genero=masculino&ativo=true&busca=termo
```

**Parâmetros de Query:**

- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 20, máx: 100)
- `categoria`: Filtrar por categoria
- `genero`: Filtrar por gênero
- `ativo`: Filtrar por status ativo (true/false)
- `busca`: Busca por nome, código ou descrição

**Resposta:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "codigo": "CAM001",
      "codigoTotvs": "TOTVS001",
      "nome": "Camiseta CROSBY Básica",
      "descricao": "Camiseta básica de algodão",
      "categoria": "camiseta",
      "marca": "CROSBY",
      "genero": "masculino",
      "preco": {
        "custo": 15.5,
        "venda": 29.9,
        "promocional": 24.9
      },
      "cores": [
        {
          "nome": "Branco",
          "codigo": "BRN",
          "hex": "#FFFFFF"
        }
      ],
      "tamanhos": [
        {
          "nome": "P",
          "ordem": 1
        }
      ],
      "ativo": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 100
  }
}
```

### Obter Produto

```http
GET /api/produtos/:id
```

### Criar Produto

```http
POST /api/produtos
```

**Body:**

```json
{
  "codigo": "string (required)",
  "codigoTotvs": "string (required)",
  "nome": "string (required)",
  "descricao": "string",
  "categoria": "camiseta|calca|short|vestido|blusa|jaqueta|casaco|saia|bermuda|macacao|conjunto|acessorios (required)",
  "marca": "string (default: CROSBY)",
  "colecao": "string",
  "temporada": "verao|inverno|outono|primavera|ano-todo (default: ano-todo)",
  "genero": "masculino|feminino|infantil|unissex (required)",
  "faixaEtaria": "bebe|infantil|juvenil|adulto (default: adulto)",
  "cores": [
    {
      "nome": "string (required)",
      "codigo": "string (required)",
      "hex": "string"
    }
  ],
  "tamanhos": [
    {
      "nome": "string (required)",
      "ordem": "number (required)"
    }
  ],
  "preco": {
    "custo": "number (required)",
    "venda": "number (required)",
    "promocional": "number"
  },
  "dimensoes": {
    "peso": "number",
    "comprimento": "number",
    "largura": "number",
    "altura": "number"
  },
  "materiais": [
    {
      "nome": "string (required)",
      "percentual": "number (0-100)"
    }
  ],
  "cuidados": ["string"],
  "tags": ["string"],
  "imagens": [
    {
      "url": "string (required)",
      "alt": "string",
      "ordem": "number"
    }
  ],
  "ativo": "boolean (default: true)",
  "dataLancamento": "date",
  "dataDescontinuacao": "date"
}
```

### Atualizar Produto

```http
PUT /api/produtos/:id
```

### Deletar Produto

```http
DELETE /api/produtos/:id
```

### Estoque do Produto

```http
GET /api/produtos/:id/estoque
```

## 📦 Estoque

### Listar Estoque

```http
GET /api/estoque?page=1&limit=20&produto=ID&deposito=PRINCIPAL&status=disponivel&estoqueBaixo=true&busca=termo
```

**Resposta:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "produto": {
        "_id": "507f1f77bcf86cd799439012",
        "codigo": "CAM001",
        "nome": "Camiseta CROSBY Básica",
        "categoria": "camiseta",
        "marca": "CROSBY"
      },
      "cor": {
        "nome": "Branco",
        "codigo": "BRN"
      },
      "tamanho": "M",
      "quantidade": {
        "fisica": 100,
        "reservada": 10,
        "disponivel": 90,
        "minima": 20,
        "maxima": 500
      },
      "localizacao": {
        "deposito": "PRINCIPAL",
        "corredor": "A",
        "prateleira": "1",
        "posicao": "A1"
      },
      "status": "disponivel",
      "alertas": {
        "estoqueBaixo": false,
        "estoqueZero": false,
        "vencimentoProximo": false
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 10,
    "total": 200
  },
  "totais": {
    "totalItens": 200,
    "totalQuantidade": 5000,
    "totalReservada": 500,
    "totalDisponivel": 4500,
    "estoqueBaixo": 15,
    "estoqueZero": 3
  }
}
```

### Obter Item de Estoque

```http
GET /api/estoque/:id
```

### Criar Item de Estoque

```http
POST /api/estoque
```

**Body:**

```json
{
  "produto": "ObjectId (required)",
  "cor": {
    "nome": "string (required)",
    "codigo": "string (required)"
  },
  "tamanho": "string (required)",
  "quantidade": {
    "fisica": "number (required, min: 0)",
    "minima": "number (min: 0)",
    "maxima": "number (min: 0)"
  },
  "localizacao": {
    "deposito": "string (required)",
    "corredor": "string",
    "prateleira": "string",
    "posicao": "string"
  },
  "status": "disponivel|reservado|quarentena|danificado|em_transito (default: disponivel)",
  "lote": {
    "numero": "string",
    "dataFabricacao": "date",
    "dataVencimento": "date",
    "fornecedor": "string"
  },
  "preco": {
    "custo": "number",
    "venda": "number",
    "promocional": "number"
  }
}
```

### Atualizar Item de Estoque

```http
PUT /api/estoque/:id
```

### Adicionar Movimentação

```http
POST /api/estoque/:id/movimentacao
```

**Body:**

```json
{
  "tipo": "entrada|saida|ajuste|transferencia (required)",
  "quantidade": "number (required, min: 1)",
  "motivo": "string (required)",
  "documento": {
    "tipo": "nota_fiscal|pedido_venda|ajuste_inventario|transferencia|outros (required)",
    "numero": "string (required)"
  },
  "observacoes": "string"
}
```

### Reservar Estoque

```http
POST /api/estoque/:id/reservar
```

**Body:**

```json
{
  "quantidade": "number (required, min: 1)",
  "motivo": "string (required)"
}
```

### Liberar Reserva

```http
POST /api/estoque/:id/liberar-reserva
```

**Body:**

```json
{
  "quantidade": "number (required, min: 1)",
  "motivo": "string (required)"
}
```

## 🔄 TOTVS

### Testar Conexão

```http
POST /api/totvs/test-connection
```

### Buscar Produtos no TOTVS

```http
GET /api/totvs/produtos?page=1&limit=100&categoria=camiseta&ativo=true
```

### Buscar Estoque no TOTVS

```http
GET /api/totvs/estoque?page=1&limit=100&deposito=PRINCIPAL&status=disponivel
```

### Sincronizar Produtos

```http
POST /api/totvs/sincronizar/produtos
```

### Sincronizar Estoque

```http
POST /api/totvs/sincronizar/estoque
```

### Sincronização Completa

```http
POST /api/totvs/sincronizar/completa
```

### Status da Sincronização

```http
GET /api/totvs/status-sincronizacao
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "produtos": {
      "estatisticas": [
        { "_id": "sincronizado", "count": 148 },
        { "_id": "pendente", "count": 2 },
        { "_id": "erro", "count": 0 }
      ],
      "ultimaSincronizacao": "2024-01-15T10:30:00.000Z"
    },
    "estoque": {
      "estatisticas": [
        { "_id": "sincronizado", "count": 445 },
        { "_id": "pendente", "count": 5 },
        { "_id": "erro", "count": 0 }
      ],
      "ultimaSincronizacao": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## 📊 Relatórios

### Estoque Baixo

```http
GET /api/estoque/relatorios/estoque-baixo
```

### Movimentações

```http
GET /api/estoque/relatorios/movimentacoes?dataInicio=2024-01-01&dataFim=2024-01-31&tipo=entrada&produto=ID
```

### Produtos por Categoria

```http
GET /api/produtos/relatorios/categorias
```

### Produtos por Gênero

```http
GET /api/produtos/relatorios/generos
```

### Faixas de Preço

```http
GET /api/produtos/relatorios/precos
```

## 🚨 Códigos de Erro

### HTTP Status Codes

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Acesso negado
- `404` - Recurso não encontrado
- `409` - Conflito (recurso já existe)
- `422` - Erro de validação
- `500` - Erro interno do servidor

### Formato de Erro

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": "Detalhes adicionais (opcional)"
}
```

### Exemplos de Erro

#### Erro de Validação

```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    },
    {
      "field": "password",
      "message": "Senha deve ter pelo menos 6 caracteres"
    }
  ]
}
```

#### Erro de Permissão

```json
{
  "success": false,
  "error": "Acesso negado. Apenas administradores podem criar usuários."
}
```

## 🔧 Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Limite**: 100 requests por 15 minutos por IP
- **Header de resposta**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- **Erro**: `429 Too Many Requests` quando limite excedido

## 📝 Exemplos de Uso

### JavaScript (Fetch)

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem("token", data.data.token);
    return data.data.user;
  }

  throw new Error(data.error);
};

// Listar produtos
const listarProdutos = async (page = 1, limit = 20) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`/api/produtos?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};
```

### cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crosby.com","password":"senha123"}'

# Listar produtos
curl -X GET http://localhost:3000/api/produtos \
  -H "Authorization: Bearer SEU_TOKEN"

# Criar produto
curl -X POST http://localhost:3000/api/produtos \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "CAM001",
    "codigoTotvs": "TOTVS001",
    "nome": "Camiseta CROSBY Básica",
    "categoria": "camiseta",
    "genero": "masculino",
    "preco": {
      "custo": 15.50,
      "venda": 29.90
    }
  }'
```

---

**Última atualização**: Janeiro 2024  
**Versão da API**: 1.0.0
