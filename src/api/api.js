// API client - conecta ao backend VDX (Spring Boot)
import { configuracaoApi, orcamentoApi, calculoApi, vidroApi, adminApi, vidaceiroApi } from './apiBackend';

// ==================== HELPERS ====================

// Transforma categoria do backend para formato do frontend
function transformCategoria(cat) {
  return {
    id: cat.id,
    nome: cat.nome,
    descricao: cat.descricao,
    icone: cat.icone || '📦',
    imagem_url: cat.imagem_url,
    ordem: cat.ordem,
    ativo: cat.ativo,
    // Tipologias já vêm embutidas do backend
    tipologias: (cat.tipologias || []).map(t => ({
      id: t.id,
      nome: t.nome,
      descricao: t.descricao,
      imagem_url: t.imagem_url,
      ordem: t.ordem,
    })),
  };
}

// Transforma tipologia completa do backend para formato do frontend
function transformTipologiaCompleta(tip) {
  return {
    id: tip.id,
    nome: tip.nome,
    descricao: tip.descricao,
    categoria_id: tip.categoria_id,
    imagem_url: tip.imagem_url,
    desenho_esquematico_url: tip.desenho_esquematico_url,
    ordem: tip.ordem,
    ativo: tip.ativo,
    // Variáveis adaptadas para o formato do frontend
    variaveis: (tip.variaveis || []).map(v => ({
      id: v.id,
      nome: v.simbolo,           // backend usa 'simbolo', frontend usa 'nome'
      label: v.nome,              // backend usa 'nome' como label
      descricao: v.descricao,
      tipo: 'numerico',
      unidade_padrao: v.unidade_padrao || 'cm',
      permite_alterar_unidade: true,
      valor_minimo: v.valor_minimo,
      valor_maximo: v.valor_maximo,
      valor_default: v.valor_default,
      obrigatoria: v.obrigatoria,
      opcoes: [],
      ordem: v.ordem,
    })),
    // Fórmulas
    formulas: (tip.formulas || []).map(f => ({
      id: f.id,
      variavel_destino: f.variavel_destino,
      expressao: f.expressao,
      descricao: f.descricao,
      ordem: f.ordem,
    })),
    // Peças (templates)
    pecas: (tip.pecas || []).map(p => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      formula_largura: p.formula_largura,
      formula_altura: p.formula_altura,
      quantidade: p.quantidade,
      tem_puxador: false,
      ordem: p.ordem,
    })),
  };
}

// Transforma cor do backend para formato de "tipo vidro" do frontend
function transformCorParaTipoVidro(cor) {
  return {
    id: cor.id,
    codigo: cor.codigo,
    nome: cor.nome_comercial || cor.nome,
    nome_comercial: cor.nome_comercial,
    codigo_externo: cor.codigo_externo,
    cor: cor.cor_hex,
    cor_hex: cor.cor_hex,
    preco_m2: 0,   // Preço vem do sistema externo via codigo_externo
    ativo: cor.ativo,
    ordem: cor.ordem,
  };
}

// Transforma resposta de cálculo do backend para formato do frontend
function transformCalculoPecas(resultado) {
  return {
    pecas: (resultado.pecas || []).map(p => ({
      nome: p.nome,
      descricao: p.descricao,
      quantidade: p.quantidade,
      largura_real_mm: p.larguraMm,
      altura_real_mm: p.alturaMm,
      area_real_m2: p.areaM2,
      largura_arredondada_mm: p.larguraArredondadaMm,
      altura_arredondada_mm: p.alturaArredondadaMm,
      area_cobranca_m2: p.areaArredondadaM2,
      formula_largura: p.formulaLargura,
      formula_altura: p.formulaAltura,
      tem_puxador: false,
      puxador: null,
      configuracoes_tecnicas: [],
      conferido: false,
    })),
    areaTotalRealM2: resultado.areaTotalM2,
    areaTotalCobrancaM2: resultado.areaTotalArredondadaM2,
    variaveisEntrada: resultado.variaveisEntrada,
    variaveisCalculadas: resultado.variaveisCalculadas,
  };
}

// ==================== CACHE ====================

// Cache simples para evitar chamadas repetidas
const cache = {
  _data: {},
  _ttl: 60000, // 1 minuto
  
  get(key) {
    const entry = this._data[key];
    if (entry && Date.now() - entry.time < this._ttl) {
      return entry.value;
    }
    return null;
  },
  
  set(key, value) {
    this._data[key] = { value, time: Date.now() };
  },
  
  clear() {
    this._data = {};
  }
};

// ==================== ENTITIES (compatível com frontend existente) ====================

export const entities = {
  
  // ==================== CATEGORIA ====================
  Categoria: {
    list: async (orderBy = 'ordem') => {
      const cached = cache.get('categorias');
      if (cached) return cached;

      const data = await configuracaoApi.listarCategorias();
      const transformed = data.map(transformCategoria);
      cache.set('categorias', transformed);
      return transformed;
    },

    filter: async (filters = {}, orderBy = 'ordem') => {
      const todas = await entities.Categoria.list(orderBy);
      return todas.filter(cat =>
        Object.entries(filters).every(([key, value]) => cat[key] === value)
      );
    },

    create: async (data) => {
      const result = await configuracaoApi.criarCategoria(data);
      cache.clear();
      return result;
    },

    update: async (id, data) => {
      const result = await configuracaoApi.atualizarCategoria(id, data);
      cache.clear();
      return result;
    },

    delete: async (id) => {
      await configuracaoApi.deletarCategoria(id);
      cache.clear();
      return { id };
    },
  },

  // ==================== TIPOLOGIA ====================
  Tipologia: {
    list: async (orderBy = 'ordem') => {
      // Busca todas as categorias (que trazem tipologias resumidas)
      const categorias = await entities.Categoria.list();
      const todas = [];
      for (const cat of categorias) {
        for (const tip of cat.tipologias || []) {
          todas.push({
            ...tip,
            categoria_id: cat.id,
            ativo: true,
          });
        }
      }
      return todas;
    },
    
    filter: async (filters = {}, orderBy = 'ordem') => {
      const todas = await entities.Tipologia.list(orderBy);
      return todas.filter(tip => {
        return Object.entries(filters).every(([key, value]) => tip[key] === value);
      });
    },
    
    // Busca tipologia completa (com variáveis, fórmulas, peças)
    getCompleta: async (id) => {
      const cacheKey = `tipologia_${id}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;
      
      const data = await configuracaoApi.buscarTipologia(id);
      const transformed = transformTipologiaCompleta(data);
      cache.set(cacheKey, transformed);
      return transformed;
    },
  },

  // ==================== TIPO VIDRO (cores) ====================
  TipoVidro: {
    list: async (orderBy = 'ordem') => {
      const cached = cache.get('cores');
      if (cached) return cached;

      try {
        const data = await configuracaoApi.listarCores();
        const transformed = data.map(transformCorParaTipoVidro);
        cache.set('cores', transformed);
        return transformed;
      } catch {
        return [];
      }
    },
    
    filter: async (filters = {}, orderBy = 'ordem') => {
      const todas = await entities.TipoVidro.list(orderBy);
      return todas.filter(tipo => {
        return Object.entries(filters).every(([key, value]) => tipo[key] === value);
      });
    },
  },

  // Alias para compatibilidade
  TipoVidroTecnico: {
    list: async (orderBy = 'ordem') => entities.TipoVidro.list(orderBy),
    filter: async (filters = {}, orderBy = 'ordem') => entities.TipoVidro.filter(filters, orderBy),
  },

  // ==================== PUXADORES (stub) ====================
  Puxador: {
    list: async () => [],
    filter: async () => [],
  },
  PuxadorTecnico: {
    list: async () => [],
    filter: async () => [],
  },

  // ==================== ACESSÓRIOS (stub) ====================
  Acessorio: {
    list: async () => [],
    filter: async () => [],
  },

  // ==================== ORÇAMENTO ====================
  Orcamento: {
    // Admin: lista todos os orçamentos
    list: async () => adminApi.listarOrcamentos(),

    filter: async (filters = {}) => {
      const todos = await entities.Orcamento.list();
      return todos.filter(orc =>
        Object.entries(filters).every(([key, value]) => orc[key] === value)
      );
    },

    // Vidraceiro: cria orçamento (usado em F9 — OrcamentoPublico etapa 5)
    create: async (data) => vidaceiroApi.criarOrcamento(data),
  },

  // ==================== STUBS para compatibilidade ====================
  TipoConfiguracaoTecnica: {
    list: async () => [],
    filter: async () => [],
  },
  ItemConfiguracaoTecnica: {
    list: async () => [],
    filter: async () => [],
  },
  FerragemTecnica: {
    list: async () => [],
    filter: async () => [],
  },
  CategoriaProduto: {
    list: async () => [],
    filter: async () => [],
  },
  Produto: {
    list: async () => [],
    filter: async () => [],
  },
};

// ==================== FUNÇÕES DE CÁLCULO (via backend) ====================

export async function calcularPecasBackend(tipologiaId, variaveisEntrada, unidade = 'cm') {
  // Monta o map de variáveis: { "Lv": 200, "Av": 280 }
  const variaveis = {};
  for (const v of variaveisEntrada) {
    variaveis[v.nome] = parseFloat(v.valor);
  }
  
  const resultado = await orcamentoApi.calcularPecas(tipologiaId, variaveis, unidade);
  return transformCalculoPecas(resultado);
}

// ==================== INTEGRATIONS (compatibilidade) ====================

export const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      return { file_url: URL.createObjectURL(file) };
    },
  },
};
// ==================== RECOMENDAÇÃO VIDRO ABNT ====================

// Mapa de nomes de categoria do frontend para enum do backend
const CATEGORIA_MAP = {
  'Portas': 'PORTA',
  'Janelas': 'JANELA',
  'Box': 'BOX',
  'Guarda Corpo': 'GUARDA_CORPO',
  'Coberturas': 'COBERTURA',
  'Divisórias': 'DIVISORIA',
  'Vitrines': 'VITRINE',
  'Fachadas': 'FACHADA',
};

export async function recomendarVidroABNT(categoriaNome, larguraMm, alturaMm) {
  const categoriaEnum = CATEGORIA_MAP[categoriaNome];
  if (!categoriaEnum) {
    console.warn('[ABNT] Categoria sem mapeamento:', categoriaNome);
    return null;
  }
  
  try {
    const resultado = await vidroApi.recomendar({
      categoria: categoriaEnum,
      larguraMm: Math.round(larguraMm),
      alturaMm: Math.round(alturaMm),
    });
    return resultado;
  } catch (error) {
    console.error('[ABNT] Erro na recomendação:', error);
    return null;
  }
}
