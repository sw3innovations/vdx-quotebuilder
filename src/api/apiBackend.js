const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9090';

function getAuthHeaders(endpoint) {
  if (endpoint.startsWith('/api/vidraceiro/')) {
    const t = localStorage.getItem('vidraceiro_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
  if (endpoint.startsWith('/api/admin/') || endpoint.startsWith('/api/orcamentos')) {
    const t = localStorage.getItem('admin_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
  return {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(endpoint),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const error = new Error(err.message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
}

// ==================== CONFIGURAÇÃO ====================

export const configuracaoApi = {
  // Categorias
  listarCategorias:   ()        => request('/api/configuracao/categorias'),
  buscarCategoria:    (id)      => request(`/api/configuracao/categorias/${id}`),
  criarCategoria:     (data)    => request('/api/configuracao/categorias', { method: 'POST', body: JSON.stringify(data) }),
  atualizarCategoria: (id, data) => request(`/api/configuracao/categorias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletarCategoria:   (id)      => request(`/api/configuracao/categorias/${id}`, { method: 'DELETE' }),

  // Tipologias
  listarTipologias:   (categoriaId) => request(`/api/configuracao/categorias/${categoriaId}/tipologias`),
  buscarTipologia:    (id)          => request(`/api/configuracao/tipologias/${id}`),
  criarTipologia:     (data)        => request('/api/configuracao/tipologias', { method: 'POST', body: JSON.stringify(data) }),
  atualizarTipologia: (id, data)    => request(`/api/configuracao/tipologias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletarTipologia:   (id)          => request(`/api/configuracao/tipologias/${id}`, { method: 'DELETE' }),

  // Variáveis de uma tipologia
  listarVariaveis: (tipologiaId) => request(`/api/configuracao/tipologias/${tipologiaId}/variaveis`),

  // Cores de vidro
  listarCores:    () => request('/api/configuracao/cores'),
  buscarCor:      (codigo) => request(`/api/configuracao/cores/${codigo}`),
  coresComPreco:  (tipologiaId, areaTotalM2) => request(`/api/configuracao/tipologias/${tipologiaId}/cores-com-preco?areaTotalM2=${areaTotalM2}`),
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

// ==================== ADMIN ====================

export const adminApi = {
  listarOrcamentos: () => request('/api/orcamentos'),
  buscarOrcamento:  (id) => request(`/api/orcamentos/${id}`),
  buscarStats:      () => request('/api/admin/orcamentos/stats'),
};

// ==================== VIDRACEIRO ====================

export const vidaceiroApi = {
  criarOrcamento:   (data) => request('/api/vidraceiro/orcamentos', { method: 'POST', body: JSON.stringify(data) }),
  listarOrcamentos: ()     => request('/api/vidraceiro/me/orcamentos'),
  buscarOrcamento:  (id)   => request(`/api/vidraceiro/me/orcamentos/${id}`),
};

export default {
  configuracao: configuracaoApi,
  calculo: calculoApi,
  orcamento: orcamentoApi,
  vidro: vidroApi,
  admin: adminApi,
  vidraceiro: vidaceiroApi,
};