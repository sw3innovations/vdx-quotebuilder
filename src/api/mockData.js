// Dados mockados para desenvolvimento e visualização

// IDs para referência entre entidades
const CATEGORIA_IDS = {
  PORTAS: 'cat-1',
  JANELAS: 'cat-2',
  BOX: 'cat-3',
  ESPELHOS: 'cat-4'
};

const TIPOLOGIA_IDS = {
  PORTA_CORRER: 'tip-1',
  PORTA_BASCULANTE: 'tip-2',
  JANELA_MAX_AR: 'tip-3',
  BOX_BANHEIRO: 'tip-4',
  ESPELHO_SIMPLES: 'tip-5'
};

const TIPO_VIDRO_IDS = {
  VIDRO_COMUM: 'vid-1',
  VIDRO_TEMPERADO: 'vid-2',
  VIDRO_LAMINADO: 'vid-3',
  VIDRO_REFLEXIVO: 'vid-4'
};

const PUXADOR_IDS = {
  PUXADOR_ALUMINIO: 'pux-1',
  PUXADOR_INOX: 'pux-2',
  PUXADOR_CROMADO: 'pux-3'
};

const ACESSORIO_IDS = {
  FECHADURA: 'acc-1',
  TRILHO: 'acc-2',
  BORRACHA: 'acc-3',
  FITA_SILICONE: 'acc-4'
};

// Categorias
export const mockCategorias = [
  {
    id: CATEGORIA_IDS.PORTAS,
    nome: 'Portas',
    descricao: 'Portas de vidro para ambientes internos e externos',
    icone: '🚪',
    imagem_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400',
    ordem: 1,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: CATEGORIA_IDS.JANELAS,
    nome: 'Janelas',
    descricao: 'Janelas de vidro em diversos modelos e tamanhos',
    icone: '🪟',
    imagem_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
    ordem: 2,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: CATEGORIA_IDS.BOX,
    nome: 'Box para Banheiro',
    descricao: 'Box de vidro temperado para banheiros',
    icone: '🚿',
    imagem_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400',
    ordem: 3,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: CATEGORIA_IDS.ESPELHOS,
    nome: 'Espelhos',
    descricao: 'Espelhos decorativos e funcionais',
    icone: '🪞',
    imagem_url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400',
    ordem: 4,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  }
];

// Tipos de Vidro (mantido para compatibilidade - será migrado para TipoVidroTecnico)
export const mockTiposVidro = [
  {
    id: TIPO_VIDRO_IDS.VIDRO_COMUM,
    codigo: 'VC-001',
    nome: 'Vidro Comum 4mm',
    preco_m2: 45.00,
    cor: '#e2e8f0',
    ativo: true,
    ordem: 1,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: TIPO_VIDRO_IDS.VIDRO_TEMPERADO,
    codigo: 'VT-001',
    nome: 'Vidro Temperado 8mm',
    preco_m2: 120.00,
    cor: '#cbd5e1',
    ativo: true,
    ordem: 2,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: TIPO_VIDRO_IDS.VIDRO_LAMINADO,
    codigo: 'VL-001',
    nome: 'Vidro Laminado 10mm',
    preco_m2: 180.00,
    cor: '#94a3b8',
    ativo: true,
    ordem: 3,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: TIPO_VIDRO_IDS.VIDRO_REFLEXIVO,
    codigo: 'VR-001',
    nome: 'Vidro Reflexivo 6mm',
    preco_m2: 150.00,
    cor: '#64748b',
    ativo: true,
    ordem: 4,
    created_date: '2024-01-15T10:00:00Z'
  }
];

// ===== CONFIGURAÇÕES TÉCNICAS =====
// Configurações técnicas não são produtos comercializáveis
// São usadas apenas para definir características técnicas das tipologias

// Tipos de Vidro Técnicos (características técnicas do vidro)
// O preco_m2 é uma configuração de preço para este tipo técnico, não um produto vendável
export const mockTiposVidroTecnicos = [
  {
    id: TIPO_VIDRO_IDS.VIDRO_COMUM,
    codigo: 'VC-001',
    nome: 'Vidro Comum 4mm',
    espessura: '4mm',
    tipo: 'comum',
    cor: '#e2e8f0',
    descricao: 'Vidro comum de 4mm de espessura',
    caracteristicas: ['Transparente', '4mm', 'Padrão'],
    preco_m2: 45.00, // Configuração de preço para este tipo técnico
    ativo: true,
    ordem: 1,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: TIPO_VIDRO_IDS.VIDRO_TEMPERADO,
    codigo: 'VT-001',
    nome: 'Vidro Temperado 8mm',
    espessura: '8mm',
    tipo: 'temperado',
    cor: '#cbd5e1',
    descricao: 'Vidro temperado de 8mm de espessura',
    caracteristicas: ['Temperado', '8mm', 'Resistente'],
    preco_m2: 120.00, // Configuração de preço para este tipo técnico
    ativo: true,
    ordem: 2,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: TIPO_VIDRO_IDS.VIDRO_LAMINADO,
    codigo: 'VL-001',
    nome: 'Vidro Laminado 10mm',
    espessura: '10mm',
    tipo: 'laminado',
    cor: '#94a3b8',
    descricao: 'Vidro laminado de 10mm de espessura',
    caracteristicas: ['Laminado', '10mm', 'Segurança'],
    preco_m2: 180.00, // Configuração de preço para este tipo técnico
    ativo: true,
    ordem: 3,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: TIPO_VIDRO_IDS.VIDRO_REFLEXIVO,
    codigo: 'VR-001',
    nome: 'Vidro Reflexivo 6mm',
    espessura: '6mm',
    tipo: 'reflexivo',
    cor: '#64748b',
    descricao: 'Vidro reflexivo de 6mm de espessura',
    caracteristicas: ['Reflexivo', '6mm', 'Controle solar'],
    preco_m2: 150.00, // Configuração de preço para este tipo técnico
    ativo: true,
    ordem: 4,
    created_date: '2024-01-15T10:00:00Z'
  }
];

// Puxadores Técnicos (tipos de furação/configuração - não são produtos)
export const mockPuxadoresTecnicos = [
  {
    id: PUXADOR_IDS.PUXADOR_ALUMINIO,
    nome: 'Puxador Alumínio',
    codigo: 'PUX-AL-TEC',
    tipo_furacao: 'furo_8mm',
    descricao: 'Furação para puxador de alumínio (8mm)',
    imagem_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    especificacoes: {
      diametro_furo: '8mm',
      distancia_centros: '96mm',
      profundidade: '20mm'
    },
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: PUXADOR_IDS.PUXADOR_INOX,
    nome: 'Puxador Inox',
    codigo: 'PUX-IN-TEC',
    tipo_furacao: 'furo_8mm',
    descricao: 'Furação para puxador de inox (8mm)',
    imagem_url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400',
    especificacoes: {
      diametro_furo: '8mm',
      distancia_centros: '96mm',
      profundidade: '20mm'
    },
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: PUXADOR_IDS.PUXADOR_CROMADO,
    nome: 'Puxador Cromado',
    codigo: 'PUX-CR-TEC',
    tipo_furacao: 'furo_8mm',
    descricao: 'Furação para puxador cromado (8mm)',
    imagem_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400',
    especificacoes: {
      diametro_furo: '8mm',
      distancia_centros: '96mm',
      profundidade: '20mm'
    },
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  }
];

// Ferragens Técnicas (compatibilidades e regras construtivas)
// Tipos de Configurações Técnicas (categorias de configurações)
export const mockTiposConfiguracaoTecnica = [
  {
    id: 'tct-1',
    nome: 'Puxador Técnico',
    codigo: 'PUX_TEC',
    descricao: 'Configurações técnicas relacionadas a puxadores',
    ordem: 1,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: 'tct-2',
    nome: 'Ferragem Técnica',
    codigo: 'FERR_TEC',
    descricao: 'Configurações técnicas relacionadas a ferragens',
    ordem: 2,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  }
];

// Itens de Configurações Técnicas (elementos dentro de cada categoria)
export const mockItensConfiguracaoTecnica = [
  // Itens da categoria "Puxador Técnico" (tct-1)
  {
    id: 'ict-1',
    tipo_configuracao_id: 'tct-1',
    nome: 'Furação Central',
    codigo: 'PUX-FC',
    descricao: 'Puxador com furação central',
    imagem_url: '',
    especificacoes: {
      diametro_furo: '32mm',
      distancia_centros: '96mm',
      profundidade: '20mm'
    },
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: 'ict-2',
    tipo_configuracao_id: 'tct-1',
    nome: 'Furação Lateral',
    codigo: 'PUX-FL',
    descricao: 'Puxador com furação lateral',
    imagem_url: '',
    especificacoes: {
      diametro_furo: '25mm',
      distancia_centros: '128mm',
      profundidade: '20mm'
    },
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  // Itens da categoria "Ferragem Técnica" (tct-2)
  {
    id: 'ict-3',
    tipo_configuracao_id: 'tct-2',
    nome: 'Trilho Superior Correr',
    codigo: 'FERR-TRI-SUP',
    descricao: 'Trilho superior para sistema de correr',
    imagem_url: '',
    especificacoes: {
      carga_maxima: '150kg',
      tipo_rolamento: 'rolo_nylon'
    },
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: 'ict-4',
    tipo_configuracao_id: 'tct-2',
    nome: 'Sistema Basculante',
    codigo: 'FERR-BASC',
    descricao: 'Sistema de abertura basculante',
    imagem_url: '',
    especificacoes: {
      carga_maxima: '80kg',
      angulo_abertura: '90°'
    },
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  }
];

export const mockFerragensTecnicas = [
  {
    id: 'ferr-1',
    nome: 'Trilho Superior Correr',
    codigo: 'FERR-TRI-SUP',
    tipo: 'trilho',
    descricao: 'Trilho superior para sistema de correr',
    compatibilidade_tipologias: [TIPOLOGIA_IDS.PORTA_CORRER],
    especificacoes: {
      carga_maxima: '150kg',
      tipo_rolamento: 'rolo_nylon',
      comprimento_padrao: '3000mm'
    },
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: 'ferr-2',
    nome: 'Sistema Basculante',
    codigo: 'FERR-BASC',
    tipo: 'sistema_basculante',
    descricao: 'Sistema de abertura basculante',
    compatibilidade_tipologias: [TIPOLOGIA_IDS.PORTA_BASCULANTE],
    especificacoes: {
      carga_maxima: '80kg',
      angulo_abertura: '90°',
      tipo_fixacao: 'parafuso_6mm'
    },
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  }
];

// Puxadores (mantido para compatibilidade - será migrado)
export const mockPuxadores = [
  {
    id: PUXADOR_IDS.PUXADOR_ALUMINIO,
    nome: 'Puxador Alumínio 1m',
    codigo: 'PUX-AL-001',
    imagem_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    preco_adicional: 25.00,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: PUXADOR_IDS.PUXADOR_INOX,
    nome: 'Puxador Inox 1m',
    codigo: 'PUX-IN-001',
    imagem_url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400',
    preco_adicional: 45.00,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: PUXADOR_IDS.PUXADOR_CROMADO,
    nome: 'Puxador Cromado 1m',
    codigo: 'PUX-CR-001',
    imagem_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400',
    preco_adicional: 35.00,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  }
];

// Acessórios (mantido para compatibilidade - será migrado para Produtos)
export const mockAcessorios = [
  {
    id: ACESSORIO_IDS.FECHADURA,
    nome: 'Fechadura Magnética',
    codigo: 'ACC-FEC-001',
    descricao: 'Fechadura magnética para portas de vidro',
    preco: 85.00,
    imagem_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    unidade: 'unidade',
    ativo: true,
    ordem: 1,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: ACESSORIO_IDS.TRILHO,
    nome: 'Trilho Superior',
    codigo: 'ACC-TRI-001',
    descricao: 'Trilho superior para portas correr',
    preco: 120.00,
    imagem_url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400',
    unidade: 'metro',
    ativo: true,
    ordem: 2,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: ACESSORIO_IDS.BORRACHA,
    nome: 'Borrachas de Vedação',
    codigo: 'ACC-BOR-001',
    descricao: 'Kit de borrachas para vedação',
    preco: 35.00,
    imagem_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400',
    unidade: 'kit',
    ativo: true,
    ordem: 3,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: ACESSORIO_IDS.FITA_SILICONE,
    nome: 'Fita de Silicone',
    codigo: 'ACC-FIT-001',
    descricao: 'Fita de silicone para vedação',
    preco: 15.00,
    imagem_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
    unidade: 'metro',
    ativo: true,
    ordem: 4,
    created_date: '2024-01-15T10:00:00Z'
  }
];

// ===== PRODUTOS COMERCIAIS =====
// Produtos são itens comercializáveis que podem ser adicionados ao orçamento
// Categorias de Produtos
export const mockCategoriasProduto = [
  {
    id: 'cat-prod-1',
    nome: 'Acessórios',
    descricao: 'Acessórios diversos para vidros',
    ordem: 1,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat-prod-2',
    nome: 'Puxadores',
    descricao: 'Puxadores comercializáveis',
    ordem: 2,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat-prod-3',
    nome: 'Ferragens',
    descricao: 'Ferragens comercializáveis',
    ordem: 3,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  }
];

export const mockProdutos = [
  // Produtos: Puxadores Comerciais
  {
    id: 'prod-pux-1',
    nome: 'Puxador Alumínio 1m',
    codigo: 'PROD-PUX-AL-001',
    categoria_id: 'cat-prod-2',
    descricao: 'Puxador de alumínio comercializável - 1 metro',
    preco: 25.00,
    imagem_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    unidade: 'metro',
    estoque: true,
    estoque_quantidade: 50,
    ativo: true,
    ordem: 1,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: 'prod-pux-2',
    nome: 'Puxador Inox 1m',
    codigo: 'PROD-PUX-IN-001',
    categoria_id: 'cat-prod-2',
    descricao: 'Puxador de inox comercializável - 1 metro',
    preco: 45.00,
    imagem_url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400',
    unidade: 'metro',
    estoque: true,
    estoque_quantidade: 30,
    ativo: true,
    ordem: 2,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: 'prod-pux-3',
    nome: 'Puxador Cromado 1m',
    codigo: 'PROD-PUX-CR-001',
    categoria_id: 'cat-prod-2',
    descricao: 'Puxador cromado comercializável - 1 metro',
    preco: 35.00,
    imagem_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400',
    unidade: 'metro',
    estoque: true,
    estoque_quantidade: 40,
    ativo: true,
    ordem: 3,
    created_date: '2024-01-15T10:00:00Z'
  },
  // Produtos: Ferragens Comerciais
  {
    id: 'prod-ferr-1',
    nome: 'Trilho Superior Comercial',
    codigo: 'PROD-FERR-TRI-001',
    categoria_id: 'cat-prod-3',
    descricao: 'Trilho superior para portas correr - produto comercial',
    preco: 120.00,
    imagem_url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400',
    unidade: 'metro',
    estoque: true,
    estoque_quantidade: 20,
    ativo: true,
    ordem: 4,
    created_date: '2024-01-15T10:00:00Z'
  },
  // Produtos: Acessórios (mantém os acessórios existentes como produtos)
  {
    id: ACESSORIO_IDS.FECHADURA,
    nome: 'Fechadura Magnética',
    codigo: 'ACC-FEC-001',
    categoria_id: 'cat-prod-1',
    descricao: 'Fechadura magnética para portas de vidro',
    preco: 85.00,
    imagem_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    unidade: 'unidade',
    estoque: true,
    estoque_quantidade: 15,
    ativo: true,
    ordem: 5,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: ACESSORIO_IDS.TRILHO,
    nome: 'Trilho Superior',
    codigo: 'ACC-TRI-001',
    categoria_id: 'cat-prod-1',
    descricao: 'Trilho superior para portas correr',
    preco: 120.00,
    imagem_url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400',
    unidade: 'metro',
    estoque: true,
    estoque_quantidade: 25,
    ativo: true,
    ordem: 6,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: ACESSORIO_IDS.BORRACHA,
    nome: 'Borrachas de Vedação',
    codigo: 'ACC-BOR-001',
    categoria_id: 'cat-prod-1',
    descricao: 'Kit de borrachas para vedação',
    preco: 35.00,
    imagem_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400',
    unidade: 'kit',
    estoque: true,
    estoque_quantidade: 100,
    ativo: true,
    ordem: 7,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: ACESSORIO_IDS.FITA_SILICONE,
    nome: 'Fita de Silicone',
    codigo: 'ACC-FIT-001',
    categoria_id: 'cat-prod-1',
    descricao: 'Fita de silicone para vedação',
    preco: 15.00,
    imagem_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
    unidade: 'metro',
    estoque: true,
    estoque_quantidade: 200,
    ativo: true,
    ordem: 8,
    created_date: '2024-01-15T10:00:00Z'
  }
];

// Tipologias
export const mockTipologias = [
  {
    id: TIPOLOGIA_IDS.PORTA_CORRER,
    nome: 'Porta Correr',
    descricao: 'Porta de vidro com sistema de correr',
    categoria_id: CATEGORIA_IDS.PORTAS,
    imagens: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400'
    ],
    variaveis: [
      {
        id: 'var-1',
        nome: 'largura',
        label: 'Largura',
        tipo: 'numerico',
        unidade_padrao: 'cm',
        permite_alterar_unidade: true,
        opcoes: [],
        ordem: 1
      },
      {
        id: 'var-2',
        nome: 'altura',
        label: 'Altura',
        tipo: 'numerico',
        unidade_padrao: 'cm',
        permite_alterar_unidade: true,
        opcoes: [],
        ordem: 2
      },
      {
        id: 'var-3',
        nome: 'quantidade_folhas',
        label: 'Quantidade de Folhas',
        tipo: 'numerico',
        unidade_padrao: 'unidade',
        permite_alterar_unidade: false,
        opcoes: [],
        ordem: 3
      }
    ],
    pecas: [
      {
        id: 'pec-1',
        nome: 'Folha Principal',
        formula_largura: 'largura',
        formula_altura: 'altura',
        tem_puxador: true,
        ordem: 1
      }
    ],
    acessorio_ids: [ACESSORIO_IDS.TRILHO, ACESSORIO_IDS.FECHADURA],
    ordem: 1,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: TIPOLOGIA_IDS.PORTA_BASCULANTE,
    nome: 'Porta Basculante',
    descricao: 'Porta de vidro com sistema basculante',
    categoria_id: CATEGORIA_IDS.PORTAS,
    imagens: [
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400'
    ],
    variaveis: [
      {
        id: 'var-4',
        nome: 'largura',
        label: 'Largura',
        tipo: 'numerico',
        unidade_padrao: 'cm',
        permite_alterar_unidade: true,
        opcoes: [],
        ordem: 1
      },
      {
        id: 'var-5',
        nome: 'altura',
        label: 'Altura',
        tipo: 'numerico',
        unidade_padrao: 'cm',
        permite_alterar_unidade: true,
        opcoes: [],
        ordem: 2
      }
    ],
    pecas: [
      {
        id: 'pec-2',
        nome: 'Folha Basculante',
        formula_largura: 'largura',
        formula_altura: 'altura',
        tem_puxador: false,
        ordem: 1
      }
    ],
    acessorio_ids: [ACESSORIO_IDS.FECHADURA],
    ordem: 2,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: TIPOLOGIA_IDS.JANELA_MAX_AR,
    nome: 'Janela Max-Ar',
    descricao: 'Janela de vidro com abertura máxima',
    categoria_id: CATEGORIA_IDS.JANELAS,
    imagens: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400'
    ],
    variaveis: [
      {
        id: 'var-6',
        nome: 'largura',
        label: 'Largura',
        tipo: 'numerico',
        unidade_padrao: 'cm',
        permite_alterar_unidade: true,
        opcoes: [],
        ordem: 1
      },
      {
        id: 'var-7',
        nome: 'altura',
        label: 'Altura',
        tipo: 'numerico',
        unidade_padrao: 'cm',
        permite_alterar_unidade: true,
        opcoes: [],
        ordem: 2
      }
    ],
    pecas: [
      {
        id: 'pec-3',
        nome: 'Folha de Vidro',
        formula_largura: 'largura',
        formula_altura: 'altura',
        tem_puxador: true,
        ordem: 1
      }
    ],
    acessorio_ids: [ACESSORIO_IDS.FECHADURA, ACESSORIO_IDS.BORRACHA],
    ordem: 3,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: TIPOLOGIA_IDS.BOX_BANHEIRO,
    nome: 'Box para Banheiro',
    descricao: 'Box de vidro temperado para banheiros',
    categoria_id: CATEGORIA_IDS.BOX,
    imagens: [
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400'
    ],
    variaveis: [
      {
        id: 'var-8',
        nome: 'largura',
        label: 'Largura',
        tipo: 'numerico',
        unidade_padrao: 'cm',
        permite_alterar_unidade: true,
        opcoes: [],
        ordem: 1
      },
      {
        id: 'var-9',
        nome: 'altura',
        label: 'Altura',
        tipo: 'numerico',
        unidade_padrao: 'cm',
        permite_alterar_unidade: true,
        opcoes: [],
        ordem: 2
      },
      {
        id: 'var-10',
        nome: 'profundidade',
        label: 'Profundidade',
        tipo: 'numerico',
        unidade_padrao: 'cm',
        permite_alterar_unidade: true,
        opcoes: [],
        ordem: 3
      }
    ],
    pecas: [
      {
        id: 'pec-4',
        nome: 'Porta do Box',
        formula_largura: 'largura',
        formula_altura: 'altura',
        tem_puxador: true,
        ordem: 1
      },
      {
        id: 'pec-5',
        nome: 'Lateral Esquerda',
        formula_largura: 'profundidade',
        formula_altura: 'altura',
        tem_puxador: false,
        ordem: 2
      },
      {
        id: 'pec-6',
        nome: 'Lateral Direita',
        formula_largura: 'profundidade',
        formula_altura: 'altura',
        tem_puxador: false,
        ordem: 3
      }
    ],
    acessorio_ids: [ACESSORIO_IDS.FITA_SILICONE, ACESSORIO_IDS.BORRACHA],
    ordem: 4,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: TIPOLOGIA_IDS.ESPELHO_SIMPLES,
    nome: 'Espelho Simples',
    descricao: 'Espelho decorativo simples',
    categoria_id: CATEGORIA_IDS.ESPELHOS,
    imagens: [
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400'
    ],
    variaveis: [
      {
        id: 'var-11',
        nome: 'largura',
        label: 'Largura',
        tipo: 'numerico',
        unidade_padrao: 'cm',
        permite_alterar_unidade: true,
        opcoes: [],
        ordem: 1
      },
      {
        id: 'var-12',
        nome: 'altura',
        label: 'Altura',
        tipo: 'numerico',
        unidade_padrao: 'cm',
        permite_alterar_unidade: true,
        opcoes: [],
        ordem: 2
      }
    ],
    pecas: [
      {
        id: 'pec-7',
        nome: 'Espelho',
        formula_largura: 'largura',
        formula_altura: 'altura',
        tem_puxador: false,
        ordem: 1
      }
    ],
    acessorio_ids: [],
    ordem: 5,
    ativo: true,
    created_date: '2024-01-15T10:00:00Z'
  }
];

// Orçamentos
export const mockOrcamentos = [
  {
    id: 'orc-1',
    numero: 'ORC-2024-001',
    cliente_nome: 'João Silva',
    cliente_telefone: '(11) 98765-4321',
    cliente_email: 'joao.silva@email.com',
    status: 'aguardando_aprovacao',
    tipologia_nome: 'Porta Correr',
    tipologia_id: TIPOLOGIA_IDS.PORTA_CORRER,
    tipo_vidro_nome: 'Vidro Temperado 8mm',
    tipo_vidro_id: TIPO_VIDRO_IDS.VIDRO_TEMPERADO,
    puxador_nome: 'Puxador Inox 1m',
    puxador_id: PUXADOR_IDS.PUXADOR_INOX,
    pecas: [
      {
        id: 'pec-1',
        nome: 'Folha Principal',
        largura: 200,
        altura: 220,
        area_m2: 4.4,
        preco: 528.00
      }
    ],
    acessorios: [
      {
        acessorio_id: ACESSORIO_IDS.TRILHO,
        acessorio_nome: 'Trilho Superior',
        quantidade: 2,
        preco_unitario: 120.00,
        preco_total: 240.00
      }
    ],
    area_total_real_m2: 4.4,
    area_total_cobranca_m2: 4.4,
    preco_vidro: 528.00,
    preco_puxador: 45.00,
    preco_acessorios: 240.00,
    preco_total: 813.00,
    created_date: '2024-01-20T10:00:00Z',
    updated_date: '2024-01-20T10:00:00Z',
    history: [
      { date: '2024-01-20T10:00:00Z', action: 'Orçamento criado', user: 'João Silva' },
      { date: '2024-01-20T11:30:00Z', action: 'Enviado para aprovação', user: 'João Silva' },
      { date: '2024-01-20T14:15:00Z', action: 'Status alterado para: Aguardando Aprovação', user: 'Sistema' }
    ]
  },
  {
    id: 'orc-2',
    numero: 'ORC-2024-002',
    cliente_nome: 'Maria Santos',
    cliente_telefone: '(11) 97654-3210',
    cliente_email: 'maria.santos@email.com',
    status: 'aguardando_pagamento',
    tipologia_nome: 'Box para Banheiro',
    tipologia_id: TIPOLOGIA_IDS.BOX_BANHEIRO,
    tipo_vidro_nome: 'Vidro Temperado 8mm',
    tipo_vidro_id: TIPO_VIDRO_IDS.VIDRO_TEMPERADO,
    puxador_nome: 'Puxador Alumínio 1m',
    puxador_id: PUXADOR_IDS.PUXADOR_ALUMINIO,
    pecas: [
      {
        id: 'pec-4',
        nome: 'Porta do Box',
        largura: 80,
        altura: 200,
        area_m2: 1.6,
        preco: 192.00
      },
      {
        id: 'pec-5',
        nome: 'Lateral Esquerda',
        largura: 60,
        altura: 200,
        area_m2: 1.2,
        preco: 144.00
      },
      {
        id: 'pec-6',
        nome: 'Lateral Direita',
        largura: 60,
        altura: 200,
        area_m2: 1.2,
        preco: 144.00
      }
    ],
    acessorios: [
      {
        acessorio_id: ACESSORIO_IDS.FITA_SILICONE,
        acessorio_nome: 'Fita de Silicone',
        quantidade: 4,
        preco_unitario: 15.00,
        preco_total: 60.00
      }
    ],
    area_total_real_m2: 4.0,
    area_total_cobranca_m2: 4.0,
    preco_vidro: 480.00,
    preco_puxador: 25.00,
    preco_acessorios: 60.00,
    preco_total: 565.00,
    created_date: '2024-01-21T14:30:00Z',
    updated_date: '2024-01-21T14:30:00Z',
    history: [
      { date: '2024-01-21T14:30:00Z', action: 'Orçamento criado', user: 'Maria Santos' },
      { date: '2024-01-21T15:00:00Z', action: 'Enviado para aprovação', user: 'Maria Santos' },
      { date: '2024-01-21T16:20:00Z', action: 'Aprovado pelo administrador', user: 'Admin' },
      { date: '2024-01-21T16:25:00Z', action: 'Status alterado para: Aguardando Pagamento', user: 'Sistema' }
    ]
  },
  {
    id: 'orc-3',
    numero: 'ORC-2024-003',
    cliente_nome: 'Pedro Oliveira',
    cliente_telefone: '(11) 96543-2109',
    cliente_email: 'pedro.oliveira@email.com',
    status: 'em_producao',
    tipologia_nome: 'Janela Max-Ar',
    tipologia_id: TIPOLOGIA_IDS.JANELA_MAX_AR,
    tipo_vidro_nome: 'Vidro Laminado 10mm',
    tipo_vidro_id: TIPO_VIDRO_IDS.VIDRO_LAMINADO,
    puxador_nome: 'Puxador Cromado 1m',
    puxador_id: PUXADOR_IDS.PUXADOR_CROMADO,
    pecas: [
      {
        id: 'pec-3',
        nome: 'Folha de Vidro',
        largura: 150,
        altura: 120,
        area_m2: 1.8,
        preco: 324.00
      }
    ],
    acessorios: [
      {
        acessorio_id: ACESSORIO_IDS.FECHADURA,
        acessorio_nome: 'Fechadura Magnética',
        quantidade: 1,
        preco_unitario: 85.00,
        preco_total: 85.00
      },
      {
        acessorio_id: ACESSORIO_IDS.BORRACHA,
        acessorio_nome: 'Borrachas de Vedação',
        quantidade: 1,
        preco_unitario: 35.00,
        preco_total: 35.00
      }
    ],
    area_total_real_m2: 1.8,
    area_total_cobranca_m2: 1.8,
    preco_vidro: 324.00,
    preco_puxador: 35.00,
    preco_acessorios: 120.00,
    preco_total: 479.00,
    created_date: '2024-01-22T09:15:00Z',
    updated_date: '2024-01-22T09:15:00Z',
    history: [
      { date: '2024-01-22T09:15:00Z', action: 'Orçamento criado', user: 'Pedro Oliveira' },
      { date: '2024-01-22T10:00:00Z', action: 'Enviado para aprovação', user: 'Pedro Oliveira' },
      { date: '2024-01-22T11:30:00Z', action: 'Aprovado pelo administrador', user: 'Admin' },
      { date: '2024-01-22T12:00:00Z', action: 'Pagamento confirmado', user: 'Sistema' },
      { date: '2024-01-22T13:00:00Z', action: 'Status alterado para: Em Produção', user: 'Sistema' }
    ]
  },
  {
    id: 'orc-4',
    numero: 'ORC-2024-004',
    cliente_nome: 'Ana Costa',
    cliente_telefone: '(11) 95432-1098',
    cliente_email: 'ana.costa@email.com',
    status: 'concluido',
    tipologia_nome: 'Espelho Simples',
    tipologia_id: TIPOLOGIA_IDS.ESPELHO_SIMPLES,
    tipo_vidro_nome: 'Vidro Comum 4mm',
    tipo_vidro_id: TIPO_VIDRO_IDS.VIDRO_COMUM,
    puxador_nome: null,
    puxador_id: null,
    pecas: [
      {
        id: 'pec-7',
        nome: 'Espelho',
        largura: 100,
        altura: 150,
        area_m2: 1.5,
        preco: 67.50
      }
    ],
    acessorios: [],
    area_total_real_m2: 1.5,
    area_total_cobranca_m2: 1.5,
    preco_vidro: 67.50,
    preco_puxador: 0,
    preco_acessorios: 0,
    preco_total: 67.50,
    created_date: '2024-01-18T16:45:00Z',
    updated_date: '2024-01-19T10:00:00Z',
    history: [
      { date: '2024-01-18T16:45:00Z', action: 'Orçamento criado', user: 'Ana Costa' },
      { date: '2024-01-18T17:00:00Z', action: 'Enviado para aprovação', user: 'Ana Costa' },
      { date: '2024-01-19T09:00:00Z', action: 'Aprovado pelo administrador', user: 'Admin' },
      { date: '2024-01-19T09:30:00Z', action: 'Pagamento confirmado', user: 'Sistema' },
      { date: '2024-01-19T10:00:00Z', action: 'Status alterado para: Concluído', user: 'Sistema' }
    ]
  },
  {
    id: 'orc-5',
    numero: 'ORC-2024-005',
    cliente_nome: 'Carlos Mendes',
    cliente_telefone: '(11) 94321-0987',
    cliente_email: 'carlos.mendes@email.com',
    status: 'rascunho',
    tipologia_nome: 'Porta Basculante',
    tipologia_id: TIPOLOGIA_IDS.PORTA_BASCULANTE,
    tipo_vidro_nome: 'Vidro Reflexivo 6mm',
    tipo_vidro_id: TIPO_VIDRO_IDS.VIDRO_REFLEXIVO,
    puxador_nome: null,
    puxador_id: null,
    pecas: [
      {
        id: 'pec-2',
        nome: 'Folha Basculante',
        largura: 90,
        altura: 210,
        area_m2: 1.89,
        preco: 283.50
      }
    ],
    acessorios: [
      {
        acessorio_id: ACESSORIO_IDS.FECHADURA,
        acessorio_nome: 'Fechadura Magnética',
        quantidade: 1,
        preco_unitario: 85.00,
        preco_total: 85.00
      }
    ],
    area_total_real_m2: 1.89,
    area_total_cobranca_m2: 1.89,
    preco_vidro: 283.50,
    preco_puxador: 0,
    preco_acessorios: 85.00,
    preco_total: 368.50,
    created_date: '2024-01-23T11:20:00Z',
    updated_date: '2024-01-23T11:20:00Z',
    history: [
      { date: '2024-01-23T11:20:00Z', action: 'Orçamento criado', user: 'Carlos Mendes' }
    ]
  }
];
