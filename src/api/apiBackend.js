// Cliente HTTP para o backend VDX
// Conecta ao Spring Boot rodando em localhost:9090

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9090';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[API] ${options.method || 'GET'} ${endpoint} ->`, error.message);
    throw error;
  }
}

// ==================== CONFIGURAÇÃO ====================

export const configuracaoApi = {
  // Categorias (com tipologias embutidas)
  listarCategorias: () => request('/api/configuracao/categorias'),
  
  buscarCategoria: (id) => request(`/api/configuracao/categorias/${id}`),
  
  // Tipologias por categoria
  listarTipologias: (categoriaId) => request(`/api/configuracao/categorias/${categoriaId}/tipologias`),
  
  // Tipologia completa (com variáveis, fórmulas, peças)
  buscarTipologia: (id) => request(`/api/configuracao/tipologias/${id}`),
  
  // Variáveis de uma tipologia
  listarVariaveis: (tipologiaId) => request(`/api/configuracao/tipologias/${tipologiaId}/variaveis`),
  
  // Cores de vidro
  listarCores: () => request('/api/configuracao/cores'),
  
  buscarCor: (codigo) => request(`/api/configuracao/cores/${codigo}`),
};

// ==================== CÁLCULO ====================

export const calculoApi = {
  // Converter unidade para mm
  converterUnidade: (valor, unidade) => request('/api/calculo/converter-unidade', {
    method: 'POST',
    body: JSON.stringify({ valor, unidade }),
  }),
  
  // Arredondar para múltiplo de 50mm
  arredondar: (largura_mm, altura_mm) => request('/api/calculo/arredondar', {
    method: 'POST',
    body: JSON.stringify({ largura_mm, altura_mm }),
  }),
};

// ==================== ORÇAMENTO DINÂMICO ====================

export const orcamentoApi = {
  // Calcular peças de uma tipologia
  calcularPecas: (tipologiaId, variaveis, unidade = 'cm') => request('/api/orcamento-dinamico/calcular-pecas', {
    method: 'POST',
    body: JSON.stringify({
      tipologia_id: tipologiaId,
      variaveis,
      unidade,
    }),
  }),
};

// ==================== VIDRO (ABNT) ====================

export const vidroApi = {
  // Recomendar vidro baseado nas dimensões
  recomendar: (dados) => request('/api/vidro/recomendar', {
    method: 'POST',
    body: JSON.stringify(dados),
  }),
  
  // Validar seleção de vidro
  validar: (dados) => request('/api/vidro/validar', {
    method: 'POST',
    body: JSON.stringify(dados),
  }),
  
  // Listar categorias de aplicação
  categoriasAplicacao: () => request('/api/vidro/categorias-aplicacao'),
};

export default {
  configuracao: configuracaoApi,
  calculo: calculoApi,
  orcamento: orcamentoApi,
  vidro: vidroApi,
};