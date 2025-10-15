const axios = require('axios');
const logger = require('../config/logger');
const Produto = require('../models/Produto');
const Estoque = require('../models/Estoque');

class TotvsService {
  constructor() {
    this.baseURL = process.env.TOTVS_BASE_URL;
    this.apiKey = process.env.TOTVS_API_KEY;
    this.username = process.env.TOTVS_USERNAME;
    this.password = process.env.TOTVS_PASSWORD;
    this.companyId = process.env.TOTVS_COMPANY_ID;
    this.token = null;
    this.tokenExpiry = null;
  }

  // Configurar cliente HTTP
  getHttpClient() {
    return axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': this.token ? `Bearer ${this.token}` : undefined,
        'X-API-Key': this.apiKey,
        'X-Company-ID': this.companyId
      }
    });
  }

  // Autenticar no TOTVS
  async authenticate() {
    try {
      logger.info('Iniciando autenticação com TOTVS MODA...');
      
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        username: this.username,
        password: this.password,
        companyId: this.companyId
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        this.tokenExpiry = new Date(Date.now() + (response.data.expiresIn * 1000));
        logger.info('Autenticação com TOTVS MODA realizada com sucesso');
        return true;
      }

      throw new Error('Token não recebido na resposta de autenticação');
    } catch (error) {
      logger.error('Erro na autenticação com TOTVS MODA:', error.message);
      throw new Error(`Falha na autenticação: ${error.message}`);
    }
  }

  // Verificar se token está válido
  async ensureAuthenticated() {
    if (!this.token || (this.tokenExpiry && new Date() >= this.tokenExpiry)) {
      await this.authenticate();
    }
  }

  // Buscar produtos do TOTVS
  async buscarProdutos(filtros = {}) {
    try {
      await this.ensureAuthenticated();
      
      const params = {
        page: filtros.page || 1,
        limit: filtros.limit || 100,
        ...filtros
      };

      logger.info('Buscando produtos no TOTVS MODA...', params);
      
      const response = await this.getHttpClient().get('/produtos', { params });
      
      if (response.data && response.data.success) {
        logger.info(`Encontrados ${response.data.data.length} produtos no TOTVS`);
        return response.data;
      }

      throw new Error('Resposta inválida do TOTVS');
    } catch (error) {
      logger.error('Erro ao buscar produtos no TOTVS:', error.message);
      throw new Error(`Falha ao buscar produtos: ${error.message}`);
    }
  }

  // Buscar estoque do TOTVS
  async buscarEstoque(filtros = {}) {
    try {
      await this.ensureAuthenticated();
      
      const params = {
        page: filtros.page || 1,
        limit: filtros.limit || 100,
        ...filtros
      };

      logger.info('Buscando estoque no TOTVS MODA...', params);
      
      const response = await this.getHttpClient().get('/estoque', { params });
      
      if (response.data && response.data.success) {
        logger.info(`Encontrados ${response.data.data.length} itens de estoque no TOTVS`);
        return response.data;
      }

      throw new Error('Resposta inválida do TOTVS');
    } catch (error) {
      logger.error('Erro ao buscar estoque no TOTVS:', error.message);
      throw new Error(`Falha ao buscar estoque: ${error.message}`);
    }
  }

  // Sincronizar produtos do TOTVS para o sistema local
  async sincronizarProdutos() {
    try {
      logger.info('Iniciando sincronização de produtos...');
      
      let page = 1;
      let totalSincronizados = 0;
      let totalErros = 0;

      while (true) {
        const response = await this.buscarProdutos({ page, limit: 50 });
        
        if (!response.data || response.data.length === 0) {
          break;
        }

        for (const produtoTotvs of response.data) {
          try {
            await this.processarProduto(produtoTotvs);
            totalSincronizados++;
          } catch (error) {
            logger.error(`Erro ao processar produto ${produtoTotvs.codigo}:`, error.message);
            totalErros++;
          }
        }

        page++;
        
        // Evitar loop infinito
        if (page > 100) {
          logger.warn('Limite de páginas atingido na sincronização');
          break;
        }
      }

      logger.info(`Sincronização concluída: ${totalSincronizados} produtos sincronizados, ${totalErros} erros`);
      
      return {
        sucesso: true,
        totalSincronizados,
        totalErros,
        mensagem: `Sincronização concluída: ${totalSincronizados} produtos processados`
      };
    } catch (error) {
      logger.error('Erro na sincronização de produtos:', error.message);
      throw error;
    }
  }

  // Processar um produto individual do TOTVS
  async processarProduto(produtoTotvs) {
    try {
      // Buscar produto existente
      let produto = await Produto.findOne({ codigoTotvs: produtoTotvs.codigo });
      
      if (!produto) {
        // Criar novo produto
        produto = new Produto({
          codigo: produtoTotvs.codigo,
          codigoTotvs: produtoTotvs.codigo,
          nome: produtoTotvs.nome,
          descricao: produtoTotvs.descricao,
          categoria: this.mapearCategoria(produtoTotvs.categoria),
          marca: produtoTotvs.marca || 'CROSBY',
          colecao: produtoTotvs.colecao,
          temporada: this.mapearTemporada(produtoTotvs.temporada),
          genero: this.mapearGenero(produtoTotvs.genero),
          faixaEtaria: this.mapearFaixaEtaria(produtoTotvs.faixaEtaria),
          cores: produtoTotvs.cores || [],
          tamanhos: produtoTotvs.tamanhos || [],
          preco: {
            custo: produtoTotvs.precoCusto || 0,
            venda: produtoTotvs.precoVenda || 0,
            promocional: produtoTotvs.precoPromocional
          },
          dimensoes: produtoTotvs.dimensoes || {},
          materiais: produtoTotvs.materiais || [],
          cuidados: produtoTotvs.cuidados || [],
          tags: produtoTotvs.tags || [],
          imagens: produtoTotvs.imagens || [],
          ativo: produtoTotvs.ativo !== false,
          dataLancamento: produtoTotvs.dataLancamento,
          dataDescontinuacao: produtoTotvs.dataDescontinuacao,
          totvsSync: {
            ultimaSincronizacao: new Date(),
            status: 'sincronizado'
          }
        });
      } else {
        // Atualizar produto existente
        produto.nome = produtoTotvs.nome;
        produto.descricao = produtoTotvs.descricao;
        produto.categoria = this.mapearCategoria(produtoTotvs.categoria);
        produto.marca = produtoTotvs.marca || 'CROSBY';
        produto.colecao = produtoTotvs.colecao;
        produto.temporada = this.mapearTemporada(produtoTotvs.temporada);
        produto.genero = this.mapearGenero(produtoTotvs.genero);
        produto.faixaEtaria = this.mapearFaixaEtaria(produtoTotvs.faixaEtaria);
        produto.cores = produtoTotvs.cores || [];
        produto.tamanhos = produtoTotvs.tamanhos || [];
        produto.preco = {
          custo: produtoTotvs.precoCusto || produto.preco.custo,
          venda: produtoTotvs.precoVenda || produto.preco.venda,
          promocional: produtoTotvs.precoPromocional
        };
        produto.dimensoes = produtoTotvs.dimensoes || produto.dimensoes;
        produto.materiais = produtoTotvs.materiais || produto.materiais;
        produto.cuidados = produtoTotvs.cuidados || produto.cuidados;
        produto.tags = produtoTotvs.tags || produto.tags;
        produto.imagens = produtoTotvs.imagens || produto.imagens;
        produto.ativo = produtoTotvs.ativo !== false;
        produto.dataLancamento = produtoTotvs.dataLancamento;
        produto.dataDescontinuacao = produtoTotvs.dataDescontinuacao;
        produto.totvsSync = {
          ultimaSincronizacao: new Date(),
          status: 'sincronizado'
        };
      }

      await produto.save();
      logger.debug(`Produto ${produto.codigo} processado com sucesso`);
      
    } catch (error) {
      logger.error(`Erro ao processar produto ${produtoTotvs.codigo}:`, error.message);
      throw error;
    }
  }

  // Sincronizar estoque do TOTVS para o sistema local
  async sincronizarEstoque() {
    try {
      logger.info('Iniciando sincronização de estoque...');
      
      let page = 1;
      let totalSincronizados = 0;
      let totalErros = 0;

      while (true) {
        const response = await this.buscarEstoque({ page, limit: 50 });
        
        if (!response.data || response.data.length === 0) {
          break;
        }

        for (const estoqueTotvs of response.data) {
          try {
            await this.processarEstoque(estoqueTotvs);
            totalSincronizados++;
          } catch (error) {
            logger.error(`Erro ao processar estoque ${estoqueTotvs.codigo}:`, error.message);
            totalErros++;
          }
        }

        page++;
        
        // Evitar loop infinito
        if (page > 100) {
          logger.warn('Limite de páginas atingido na sincronização de estoque');
          break;
        }
      }

      logger.info(`Sincronização de estoque concluída: ${totalSincronizados} itens sincronizados, ${totalErros} erros`);
      
      return {
        sucesso: true,
        totalSincronizados,
        totalErros,
        mensagem: `Sincronização de estoque concluída: ${totalSincronizados} itens processados`
      };
    } catch (error) {
      logger.error('Erro na sincronização de estoque:', error.message);
      throw error;
    }
  }

  // Processar um item de estoque individual do TOTVS
  async processarEstoque(estoqueTotvs) {
    try {
      // Buscar produto correspondente
      const produto = await Produto.findOne({ codigoTotvs: estoqueTotvs.codigoProduto });
      
      if (!produto) {
        logger.warn(`Produto não encontrado para código TOTVS: ${estoqueTotvs.codigoProduto}`);
        return;
      }

      // Buscar item de estoque existente
      let estoque = await Estoque.findOne({
        produto: produto._id,
        'cor.codigo': estoqueTotvs.cor,
        tamanho: estoqueTotvs.tamanho
      });

      if (!estoque) {
        // Criar novo item de estoque
        estoque = new Estoque({
          produto: produto._id,
          cor: {
            nome: estoqueTotvs.nomeCor,
            codigo: estoqueTotvs.cor
          },
          tamanho: estoqueTotvs.tamanho,
          quantidade: {
            fisica: estoqueTotvs.quantidadeFisica || 0,
            reservada: estoqueTotvs.quantidadeReservada || 0,
            disponivel: estoqueTotvs.quantidadeDisponivel || 0,
            minima: estoqueTotvs.quantidadeMinima || 0,
            maxima: estoqueTotvs.quantidadeMaxima || 1000
          },
          localizacao: {
            deposito: estoqueTotvs.deposito || 'PRINCIPAL',
            corredor: estoqueTotvs.corredor,
            prateleira: estoqueTotvs.prateleira,
            posicao: estoqueTotvs.posicao
          },
          status: this.mapearStatus(estoqueTotvs.status),
          lote: estoqueTotvs.lote ? {
            numero: estoqueTotvs.lote.numero,
            dataFabricacao: estoqueTotvs.lote.dataFabricacao,
            dataVencimento: estoqueTotvs.lote.dataVencimento,
            fornecedor: estoqueTotvs.lote.fornecedor
          } : undefined,
          preco: estoqueTotvs.preco ? {
            custo: estoqueTotvs.preco.custo,
            venda: estoqueTotvs.preco.venda,
            promocional: estoqueTotvs.preco.promocional
          } : undefined,
          totvsSync: {
            ultimaSincronizacao: new Date(),
            status: 'sincronizado',
            codigoTotvs: estoqueTotvs.codigo
          }
        });
      } else {
        // Atualizar item de estoque existente
        estoque.quantidade.fisica = estoqueTotvs.quantidadeFisica || estoque.quantidade.fisica;
        estoque.quantidade.reservada = estoqueTotvs.quantidadeReservada || estoque.quantidade.reservada;
        estoque.quantidade.minima = estoqueTotvs.quantidadeMinima || estoque.quantidade.minima;
        estoque.quantidade.maxima = estoqueTotvs.quantidadeMaxima || estoque.quantidade.maxima;
        estoque.localizacao = {
          deposito: estoqueTotvs.deposito || estoque.localizacao.deposito,
          corredor: estoqueTotvs.corredor || estoque.localizacao.corredor,
          prateleira: estoqueTotvs.prateleira || estoque.localizacao.prateleira,
          posicao: estoqueTotvs.posicao || estoque.localizacao.posicao
        };
        estoque.status = this.mapearStatus(estoqueTotvs.status);
        estoque.totvsSync = {
          ultimaSincronizacao: new Date(),
          status: 'sincronizado',
          codigoTotvs: estoqueTotvs.codigo
        };
      }

      await estoque.save();
      logger.debug(`Estoque ${estoqueTotvs.codigo} processado com sucesso`);
      
    } catch (error) {
      logger.error(`Erro ao processar estoque ${estoqueTotvs.codigo}:`, error.message);
      throw error;
    }
  }

  // Métodos auxiliares para mapeamento de dados
  mapearCategoria(categoriaTotvs) {
    const mapeamento = {
      'CAMISETA': 'camiseta',
      'CALCA': 'calca',
      'SHORT': 'short',
      'VESTIDO': 'vestido',
      'BLUSA': 'blusa',
      'JAQUETA': 'jaqueta',
      'CASACO': 'casaco',
      'SAIA': 'saia',
      'BERMUDA': 'bermuda',
      'MACACAO': 'macacao',
      'CONJUNTO': 'conjunto',
      'ACESSORIOS': 'acessorios'
    };
    return mapeamento[categoriaTotvs?.toUpperCase()] || 'camiseta';
  }

  mapearTemporada(temporadaTotvs) {
    const mapeamento = {
      'VERAO': 'verao',
      'INVERNO': 'inverno',
      'OUTONO': 'outono',
      'PRIMAVERA': 'primavera',
      'ANO_TODO': 'ano-todo'
    };
    return mapeamento[temporadaTotvs?.toUpperCase()] || 'ano-todo';
  }

  mapearGenero(generoTotvs) {
    const mapeamento = {
      'MASCULINO': 'masculino',
      'FEMININO': 'feminino',
      'INFANTIL': 'infantil',
      'UNISSEX': 'unissex'
    };
    return mapeamento[generoTotvs?.toUpperCase()] || 'unissex';
  }

  mapearFaixaEtaria(faixaTotvs) {
    const mapeamento = {
      'BEBE': 'bebe',
      'INFANTIL': 'infantil',
      'JUVENIL': 'juvenil',
      'ADULTO': 'adulto'
    };
    return mapeamento[faixaTotvs?.toUpperCase()] || 'adulto';
  }

  mapearStatus(statusTotvs) {
    const mapeamento = {
      'DISPONIVEL': 'disponivel',
      'RESERVADO': 'reservado',
      'QUARENTENA': 'quarentena',
      'DANIFICADO': 'danificado',
      'EM_TRANSITO': 'em_transito'
    };
    return mapeamento[statusTotvs?.toUpperCase()] || 'disponivel';
  }

  // Enviar dados para o TOTVS (para atualizações)
  async enviarDados(endpoint, dados) {
    try {
      await this.ensureAuthenticated();
      
      logger.info(`Enviando dados para TOTVS: ${endpoint}`);
      
      const response = await this.getHttpClient().post(endpoint, dados);
      
      if (response.data && response.data.success) {
        logger.info(`Dados enviados com sucesso para ${endpoint}`);
        return response.data;
      }

      throw new Error('Resposta inválida do TOTVS');
    } catch (error) {
      logger.error(`Erro ao enviar dados para ${endpoint}:`, error.message);
      throw new Error(`Falha ao enviar dados: ${error.message}`);
    }
  }
}

module.exports = new TotvsService();
