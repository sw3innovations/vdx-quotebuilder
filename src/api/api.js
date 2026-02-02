// API client com dados mockados para desenvolvimento
import {
  mockCategorias,
  mockTipologias,
  mockTiposVidro,
  mockPuxadores,
  mockAcessorios,
  mockOrcamentos,
  mockTiposVidroTecnicos,
  mockPuxadoresTecnicos,
  mockFerragensTecnicas,
  mockProdutos,
  mockCategoriasProduto,
  mockTiposConfiguracaoTecnica,
  mockItensConfiguracaoTecnica
} from './mockData';

// Armazenamento em memória (simula banco de dados)
let storage = {
  categorias: [...mockCategorias],
  tipologias: [...mockTipologias],
  // Configurações Técnicas (não são produtos comercializáveis)
  tiposVidroTecnicos: [...mockTiposVidroTecnicos], // Características técnicas do vidro
  puxadoresTecnicos: [...mockPuxadoresTecnicos], // Tipos de furação/configuração
  ferragensTecnicas: [...mockFerragensTecnicas], // Compatibilidades e regras construtivas
  tiposConfiguracaoTecnica: [...mockTiposConfiguracaoTecnica], // Tipos/categorias de configurações técnicas
  itensConfiguracaoTecnica: [...mockItensConfiguracaoTecnica], // Itens/elementos dentro de cada categoria
  // Produtos Comerciais (itens vendáveis)
  categoriasProduto: [...mockCategoriasProduto], // Categorias de produtos
  produtos: [...mockProdutos], // Produtos comercializáveis (puxadores, ferragens, acessórios)
  orcamentos: [...mockOrcamentos],
  // Mantido para compatibilidade durante migração
  tiposVidro: [...mockTiposVidro],
  puxadores: [...mockPuxadores],
  acessorios: [...mockAcessorios]
};

// Função auxiliar para ordenar
const sortData = (data, orderBy) => {
  if (!orderBy) return data;
  
  const [field, direction] = orderBy.startsWith('-') 
    ? [orderBy.slice(1), 'desc'] 
    : [orderBy, 'asc'];
  
  return [...data].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    // Tratamento especial para datas
    if (field.includes('date')) {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Função auxiliar para filtrar
const filterData = (data, filters) => {
  if (!filters || Object.keys(filters).length === 0) return data;
  
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.includes(item[key]);
      }
      return item[key] === value;
    });
  });
};

// Entity operations
export const entities = {
  TipoVidro: {
    list: async (orderBy = 'ordem') => {
      return sortData(storage.tiposVidro, orderBy);
    },
    filter: async (filters = {}, orderBy = 'ordem') => {
      const filtered = filterData(storage.tiposVidro, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `vid-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.tiposVidro.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.tiposVidro.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Tipo de vidro não encontrado');
      storage.tiposVidro[index] = {
        ...storage.tiposVidro[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.tiposVidro[index];
    },
    delete: async (id) => {
      const index = storage.tiposVidro.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Tipo de vidro não encontrado');
      storage.tiposVidro.splice(index, 1);
      return { id };
    }
  },
  Puxador: {
    list: async () => {
      return storage.puxadores;
    },
    filter: async (filters = {}) => {
      return filterData(storage.puxadores, filters);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `pux-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.puxadores.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.puxadores.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Puxador não encontrado');
      storage.puxadores[index] = {
        ...storage.puxadores[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.puxadores[index];
    },
    delete: async (id) => {
      const index = storage.puxadores.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Puxador não encontrado');
      storage.puxadores.splice(index, 1);
      return { id };
    }
  },
  Acessorio: {
    list: async (orderBy = 'ordem') => {
      return sortData(storage.acessorios, orderBy);
    },
    filter: async (filters = {}, orderBy = 'ordem') => {
      const filtered = filterData(storage.acessorios, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `acc-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.acessorios.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.acessorios.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Acessório não encontrado');
      storage.acessorios[index] = {
        ...storage.acessorios[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.acessorios[index];
    },
    delete: async (id) => {
      const index = storage.acessorios.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Acessório não encontrado');
      storage.acessorios.splice(index, 1);
      return { id };
    }
  },
  Categoria: {
    list: async (orderBy = 'ordem') => {
      return sortData(storage.categorias, orderBy);
    },
    filter: async (filters = {}, orderBy = 'ordem') => {
      const filtered = filterData(storage.categorias, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `cat-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.categorias.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.categorias.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Categoria não encontrada');
      storage.categorias[index] = {
        ...storage.categorias[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.categorias[index];
    },
    delete: async (id) => {
      const index = storage.categorias.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Categoria não encontrada');
      storage.categorias.splice(index, 1);
      return { id };
    }
  },
  Tipologia: {
    list: async (orderBy = 'ordem') => {
      return sortData(storage.tipologias, orderBy);
    },
    filter: async (filters = {}, orderBy = 'ordem') => {
      const filtered = filterData(storage.tipologias, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `tip-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.tipologias.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.tipologias.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Tipologia não encontrada');
      storage.tipologias[index] = {
        ...storage.tipologias[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.tipologias[index];
    },
    delete: async (id) => {
      const index = storage.tipologias.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Tipologia não encontrada');
      storage.tipologias.splice(index, 1);
      return { id };
    }
  },
  Orcamento: {
    list: async (orderBy = '-created_date', limit = 100) => {
      const sorted = sortData(storage.orcamentos, orderBy);
      return limit ? sorted.slice(0, limit) : sorted;
    },
    filter: async (filters = {}, orderBy = 'ordem') => {
      const filtered = filterData(storage.orcamentos, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      // Gerar número de orçamento sequencial
      const lastNumber = storage.orcamentos.length > 0
        ? parseInt(storage.orcamentos[storage.orcamentos.length - 1].numero.split('-')[2]) || 0
        : 0;
      const newNumber = `ORC-2024-${String(lastNumber + 1).padStart(3, '0')}`;
      
      const now = new Date().toISOString();
      const newItem = {
        ...data,
        id: `orc-${Date.now()}`,
        numero: newNumber,
        created_date: now,
        updated_date: now,
        history: data.history || [
          { 
            date: now, 
            action: 'Orçamento criado', 
            user: data.cliente_nome || 'Cliente' 
          }
        ]
      };
      storage.orcamentos.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.orcamentos.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Orçamento não encontrado');
      
      const now = new Date().toISOString();
      const existing = storage.orcamentos[index];
      
      // Adicionar entrada no histórico se o status mudou
      let newHistory = existing.history || [];
      if (data.status && data.status !== existing.status) {
        const statusLabels = {
          rascunho: 'Rascunho',
          aguardando_aprovacao: 'Aguardando Aprovação',
          aguardando_pagamento: 'Aguardando Pagamento',
          em_producao: 'Em Produção',
          aguardando_retirada: 'Pronto para Retirada',
          concluido: 'Concluído',
          cancelado: 'Cancelado'
        };
        newHistory = [
          ...newHistory,
          {
            date: now,
            action: `Status alterado para: ${statusLabels[data.status] || data.status}`,
            user: 'Sistema'
          }
        ];
      }
      
      // Adicionar histórico customizado se fornecido
      if (data.history && Array.isArray(data.history)) {
        newHistory = [...newHistory, ...data.history];
      }
      
      storage.orcamentos[index] = {
        ...existing,
        ...data,
        id,
        updated_date: now,
        history: newHistory
      };
      return storage.orcamentos[index];
    },
    delete: async (id) => {
      const index = storage.orcamentos.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Orçamento não encontrado');
      storage.orcamentos.splice(index, 1);
      return { id };
    }
  },
  // ===== CONFIGURAÇÕES TÉCNICAS =====
  // Configurações técnicas não são produtos comercializáveis
  // São usadas apenas para definir características técnicas das tipologias
  
  TipoVidroTecnico: {
    list: async (orderBy = 'ordem') => {
      return sortData(storage.tiposVidroTecnicos, orderBy);
    },
    filter: async (filters = {}, orderBy = 'ordem') => {
      const filtered = filterData(storage.tiposVidroTecnicos, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `vidtec-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.tiposVidroTecnicos.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.tiposVidroTecnicos.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Tipo de vidro técnico não encontrado');
      storage.tiposVidroTecnicos[index] = {
        ...storage.tiposVidroTecnicos[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.tiposVidroTecnicos[index];
    },
    delete: async (id) => {
      const index = storage.tiposVidroTecnicos.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Tipo de vidro técnico não encontrado');
      storage.tiposVidroTecnicos.splice(index, 1);
      return { id };
    }
  },
  
  PuxadorTecnico: {
    list: async (orderBy = 'nome') => {
      return sortData(storage.puxadoresTecnicos, orderBy);
    },
    filter: async (filters = {}, orderBy = 'nome') => {
      const filtered = filterData(storage.puxadoresTecnicos, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `puxtec-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.puxadoresTecnicos.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.puxadoresTecnicos.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Puxador técnico não encontrado');
      storage.puxadoresTecnicos[index] = {
        ...storage.puxadoresTecnicos[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.puxadoresTecnicos[index];
    },
    delete: async (id) => {
      const index = storage.puxadoresTecnicos.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Puxador técnico não encontrado');
      storage.puxadoresTecnicos.splice(index, 1);
      return { id };
    }
  },
  
  FerragemTecnica: {
    list: async (orderBy = 'nome') => {
      return sortData(storage.ferragensTecnicas, orderBy);
    },
    filter: async (filters = {}, orderBy = 'nome') => {
      const filtered = filterData(storage.ferragensTecnicas, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `ferrtec-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.ferragensTecnicas.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.ferragensTecnicas.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Ferragem técnica não encontrada');
      storage.ferragensTecnicas[index] = {
        ...storage.ferragensTecnicas[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.ferragensTecnicas[index];
    },
    delete: async (id) => {
      const index = storage.ferragensTecnicas.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Ferragem técnica não encontrada');
      storage.ferragensTecnicas.splice(index, 1);
      return { id };
    }
  },
  
  // ===== TIPOS DE CONFIGURAÇÕES TÉCNICAS =====
  // Define os tipos/categorias de configurações técnicas disponíveis
  TipoConfiguracaoTecnica: {
    list: async (orderBy = 'ordem') => {
      return sortData(storage.tiposConfiguracaoTecnica, orderBy);
    },
    filter: async (filters = {}, orderBy = 'ordem') => {
      const filtered = filterData(storage.tiposConfiguracaoTecnica, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `tct-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.tiposConfiguracaoTecnica.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.tiposConfiguracaoTecnica.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Tipo de configuração técnica não encontrado');
      storage.tiposConfiguracaoTecnica[index] = {
        ...storage.tiposConfiguracaoTecnica[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.tiposConfiguracaoTecnica[index];
    },
    delete: async (id) => {
      const index = storage.tiposConfiguracaoTecnica.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Tipo de configuração técnica não encontrado');
      // Também remove os itens relacionados
      storage.itensConfiguracaoTecnica = storage.itensConfiguracaoTecnica.filter(
        item => item.tipo_configuracao_id !== id
      );
      storage.tiposConfiguracaoTecnica.splice(index, 1);
      return { id };
    }
  },
  
  // ===== ITENS DE CONFIGURAÇÕES TÉCNICAS =====
  // Itens/elementos que pertencem a uma categoria de configuração técnica
  ItemConfiguracaoTecnica: {
    list: async (orderBy = 'nome') => {
      return sortData(storage.itensConfiguracaoTecnica, orderBy);
    },
    filter: async (filters = {}, orderBy = 'nome') => {
      const filtered = filterData(storage.itensConfiguracaoTecnica, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `ict-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.itensConfiguracaoTecnica.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.itensConfiguracaoTecnica.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Item de configuração técnica não encontrado');
      storage.itensConfiguracaoTecnica[index] = {
        ...storage.itensConfiguracaoTecnica[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.itensConfiguracaoTecnica[index];
    },
    delete: async (id) => {
      const index = storage.itensConfiguracaoTecnica.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Item de configuração técnica não encontrado');
      storage.itensConfiguracaoTecnica.splice(index, 1);
      return { id };
    }
  },
  
  // ===== PRODUTOS COMERCIAIS =====
  // Categorias de Produtos
  CategoriaProduto: {
    list: async (orderBy = 'ordem') => {
      return sortData(storage.categoriasProduto, orderBy);
    },
    filter: async (filters = {}, orderBy = 'ordem') => {
      const filtered = filterData(storage.categoriasProduto, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `cat-prod-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.categoriasProduto.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.categoriasProduto.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Categoria de produto não encontrada');
      storage.categoriasProduto[index] = {
        ...storage.categoriasProduto[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.categoriasProduto[index];
    },
    delete: async (id) => {
      const index = storage.categoriasProduto.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Categoria de produto não encontrada');
      // Verificar se há produtos usando esta categoria
      const produtosComCategoria = storage.produtos.filter(p => p.categoria_id === id);
      if (produtosComCategoria.length > 0) {
        throw new Error(`Não é possível excluir: existem ${produtosComCategoria.length} produto(s) usando esta categoria`);
      }
      storage.categoriasProduto.splice(index, 1);
      return { id };
    }
  },
  
  // Produtos são itens comercializáveis que podem ser adicionados ao orçamento
  Produto: {
    list: async (orderBy = 'ordem') => {
      return sortData(storage.produtos, orderBy);
    },
    filter: async (filters = {}, orderBy = 'ordem') => {
      const filtered = filterData(storage.produtos, filters);
      return sortData(filtered, orderBy);
    },
    create: async (data) => {
      const newItem = {
        ...data,
        id: `prod-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      storage.produtos.push(newItem);
      return newItem;
    },
    update: async (id, data) => {
      const index = storage.produtos.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Produto não encontrado');
      storage.produtos[index] = {
        ...storage.produtos[index],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      return storage.produtos[index];
    },
    delete: async (id) => {
      const index = storage.produtos.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Produto não encontrado');
      storage.produtos.splice(index, 1);
      return { id };
    }
  }
};

// Integration operations
export const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      // Simula upload de arquivo - retorna URL temporária
      return { file_url: URL.createObjectURL(file) };
    }
  }
};
