import React, { useState } from "react";
import { entities, integrations } from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Image,
  X,
  Save,
  Variable,
  Calculator,
  Info,
  Settings,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Checkbox
} from "@/components/ui/checkbox";

const FORM_INICIAL = {
  nome: '',
  descricao: '',
  categoria_id: '',
  imagens: [],
  variaveis: [],
  pecas: [],
  acessorio_ids: [],
  tipos_vidro_ids: [], // IDs dos tipos de vidro técnicos disponíveis para esta tipologia
  ordem: 0,
  ativo: true
};

const VARIAVEL_INICIAL = {
  id: '',
  nome: '',
  label: '',
  tipo: 'numerico',
  unidade_padrao: 'cm',
  permite_alterar_unidade: true,
  opcoes: [],
  ordem: 0
};

const PECA_INICIAL = {
  id: '',
  nome: '',
  formula_largura: '',
  formula_altura: '',
  imagem_url: '', // URL da imagem ilustrativa da peça
  configuracoes_tecnicas: [], // Array de configurações técnicas
  ordem: 0
};

// Estrutura de uma configuração técnica
const CONFIGURACAO_TECNICA_INICIAL = {
  categoria: '', // 'puxador_tecnico', 'ferragem_tecnica', etc.
  itens_ids: [], // IDs dos itens específicos disponíveis
  obrigatorio: false
};

export default function Tipologias() {
  const queryClient = useQueryClient();
  const [modalAberto, setModalAberto] = useState(false);
  const [tipologiaEditando, setTipologiaEditando] = useState(null);
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [tipologiaExcluir, setTipologiaExcluir] = useState(null);

  const { data: tipologias = [], isLoading } = useQuery({
    queryKey: ['tipologias'],
    queryFn: () => entities.Tipologia.list('ordem')
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => entities.Categoria.list('ordem')
  });

  // Usar produtos comerciais ao invés de acessórios
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => entities.Produto.filter({ ativo: true }, 'ordem')
  });

  // Compatibilidade: manter query antiga durante migração
  const { data: acessorios = [] } = useQuery({
    queryKey: ['acessorios'],
    queryFn: () => entities.Acessorio.filter({ ativo: true }, 'ordem')
  });

  // Usar produtos se disponíveis, senão usar acessórios antigos
  const produtosDisponiveis = produtos.length > 0 ? produtos : acessorios;

  // Queries para configurações técnicas
  const { data: tiposVidroTecnicos = [] } = useQuery({
    queryKey: ['tiposVidroTecnicos'],
    queryFn: () => entities.TipoVidroTecnico.filter({ ativo: true }, 'ordem')
  });

  const { data: puxadoresTecnicos = [] } = useQuery({
    queryKey: ['puxadoresTecnicos'],
    queryFn: () => entities.PuxadorTecnico.filter({ ativo: true }, 'nome')
  });

  const { data: ferragensTecnicas = [] } = useQuery({
    queryKey: ['ferragensTecnicas'],
    queryFn: () => entities.FerragemTecnica.filter({ ativo: true }, 'nome')
  });

  const { data: tiposConfiguracaoTecnica = [] } = useQuery({
    queryKey: ['tiposConfiguracaoTecnica'],
    queryFn: () => entities.TipoConfiguracaoTecnica.filter({ ativo: true }, 'ordem')
  });

  const { data: itensConfiguracaoTecnica = [] } = useQuery({
    queryKey: ['itensConfiguracaoTecnica'],
    queryFn: () => entities.ItemConfiguracaoTecnica.filter({ ativo: true }, 'nome')
  });

  // Categorias de configuração técnica disponíveis (busca dinamicamente dos tipos cadastrados)
  const categoriasConfiguracao = tiposConfiguracaoTecnica.map(tipoConfig => {
    // Busca os itens que pertencem a esta categoria
    const itens = itensConfiguracaoTecnica.filter(
      item => item.tipo_configuracao_id === tipoConfig.id
    );
    
    return {
      id: tipoConfig.id,
      nome: tipoConfig.nome,
      itens: itens
    };
  });

  const createMutation = useMutation({
    mutationFn: (data) => entities.Tipologia.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tipologias']);
      fecharModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => entities.Tipologia.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tipologias']);
      fecharModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.Tipologia.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tipologias']);
      setTipologiaExcluir(null);
    }
  });

  const abrirNovaTipologia = () => {
    setTipologiaEditando(null);
    setFormData({ ...FORM_INICIAL, ordem: tipologias.length });
    setModalAberto(true);
  };

  const abrirEdicao = (tipologia) => {
    setTipologiaEditando(tipologia);
    setFormData({
      nome: tipologia.nome || '',
      descricao: tipologia.descricao || '',
      categoria_id: tipologia.categoria_id || (tipologia.categoria_ids && tipologia.categoria_ids.length > 0 ? tipologia.categoria_ids[0] : ''),
      imagens: tipologia.imagens || [],
      variaveis: tipologia.variaveis || [],
      pecas: (tipologia.pecas || []).map(peca => ({
        ...peca,
        // Migrar tem_puxador antigo para configuracoes_tecnicas
        configuracoes_tecnicas: peca.configuracoes_tecnicas || (
          peca.tem_puxador ? [{
            categoria: 'puxador_tecnico',
            itens_ids: [], // Todos os puxadores disponíveis
            obrigatorio: true
          }] : []
        )
      })),
      acessorio_ids: tipologia.acessorio_ids || [],
      tipos_vidro_ids: tipologia.tipos_vidro_ids || [],
      ordem: tipologia.ordem || 0,
      ativo: tipologia.ativo !== false
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTipologiaEditando(null);
    setFormData(FORM_INICIAL);
  };

  const salvar = () => {
    if (tipologiaEditando) {
      updateMutation.mutate({ id: tipologiaEditando.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { file_url } = await integrations.Core.UploadFile({ file });
    setFormData({ ...formData, imagens: [...formData.imagens, file_url] });
  };

  const removerImagem = (index) => {
    setFormData({
      ...formData,
      imagens: formData.imagens.filter((_, i) => i !== index)
    });
  };

  const handlePecaImagemUpload = async (e, pecaIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { file_url } = await integrations.Core.UploadFile({ file });
    const novasPecas = [...formData.pecas];
    novasPecas[pecaIndex] = { ...novasPecas[pecaIndex], imagem_url: file_url };
    setFormData({ ...formData, pecas: novasPecas });
  };

  const removerPecaImagem = (pecaIndex) => {
    const novasPecas = [...formData.pecas];
    novasPecas[pecaIndex] = { ...novasPecas[pecaIndex], imagem_url: '' };
    setFormData({ ...formData, pecas: novasPecas });
  };

  // Variáveis
  const adicionarVariavel = () => {
    const novaVariavel = {
      ...VARIAVEL_INICIAL,
      id: `var_${Date.now()}`,
      ordem: formData.variaveis.length
    };
    setFormData({
      ...formData,
      variaveis: [...formData.variaveis, novaVariavel]
    });
  };

  const atualizarVariavel = (index, campo, valor) => {
    const novasVars = [...formData.variaveis];
    novasVars[index] = { ...novasVars[index], [campo]: valor };
    setFormData({ ...formData, variaveis: novasVars });
  };

  const removerVariavel = (index) => {
    setFormData({
      ...formData,
      variaveis: formData.variaveis.filter((_, i) => i !== index)
    });
  };

  // Peças
  const adicionarPeca = () => {
    const novaPeca = {
      ...PECA_INICIAL,
      id: `peca_${Date.now()}`,
      ordem: formData.pecas.length
    };
    setFormData({
      ...formData,
      pecas: [...formData.pecas, novaPeca]
    });
  };

  const atualizarPeca = (index, campo, valor) => {
    const novasPecas = [...formData.pecas];
    novasPecas[index] = { ...novasPecas[index], [campo]: valor };
    setFormData({ ...formData, pecas: novasPecas });
  };

  const removerPeca = (index) => {
    setFormData({
      ...formData,
      pecas: formData.pecas.filter((_, i) => i !== index)
    });
  };

  // Configurações técnicas das peças
  const adicionarConfiguracaoTecnica = (pecaIndex) => {
    const novasPecas = [...formData.pecas];
    const configuracao = {
      ...CONFIGURACAO_TECNICA_INICIAL,
      id: `config_${Date.now()}`
    };
    novasPecas[pecaIndex].configuracoes_tecnicas = [
      ...(novasPecas[pecaIndex].configuracoes_tecnicas || []),
      configuracao
    ];
    setFormData({ ...formData, pecas: novasPecas });
  };

  const removerConfiguracaoTecnica = (pecaIndex, configIndex) => {
    const novasPecas = [...formData.pecas];
    novasPecas[pecaIndex].configuracoes_tecnicas = 
      novasPecas[pecaIndex].configuracoes_tecnicas.filter((_, i) => i !== configIndex);
    setFormData({ ...formData, pecas: novasPecas });
  };

  const atualizarConfiguracaoTecnica = (pecaIndex, configIndex, campo, valor) => {
    const novasPecas = [...formData.pecas];
    novasPecas[pecaIndex].configuracoes_tecnicas[configIndex] = {
      ...novasPecas[pecaIndex].configuracoes_tecnicas[configIndex],
      [campo]: valor
    };
    setFormData({ ...formData, pecas: novasPecas });
  };

  const toggleItemConfiguracao = (pecaIndex, configIndex, itemId) => {
    const novasPecas = [...formData.pecas];
    const config = novasPecas[pecaIndex].configuracoes_tecnicas[configIndex];
    const itensAtuais = config.itens_ids || [];
    
    if (itensAtuais.includes(itemId)) {
      config.itens_ids = itensAtuais.filter(id => id !== itemId);
    } else {
      config.itens_ids = [...itensAtuais, itemId];
    }
    
    setFormData({ ...formData, pecas: novasPecas });
  };

  const selecionarCategoria = (catId) => {
    setFormData({
      ...formData,
      categoria_id: catId || ''
    });
  };

  const toggleAcessorio = (acessId) => {
    const atual = formData.acessorio_ids || [];
    if (atual.includes(acessId)) {
      setFormData({
        ...formData,
        acessorio_ids: atual.filter(id => id !== acessId)
      });
    } else {
      setFormData({
        ...formData,
        acessorio_ids: [...atual, acessId]
      });
    }
  };

  const toggleTipoVidro = (vidroId) => {
    const atual = formData.tipos_vidro_ids || [];
    if (atual.includes(vidroId)) {
      setFormData({
        ...formData,
        tipos_vidro_ids: atual.filter(id => id !== vidroId)
      });
    } else {
      setFormData({
        ...formData,
        tipos_vidro_ids: [...atual, vidroId]
      });
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Tipologias</h1>
          <p className="text-slate-500 mt-1">Configure os modelos de produtos com fórmulas de cálculo</p>
        </div>
        <Button onClick={abrirNovaTipologia} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tipologia
        </Button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : tipologias.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Nenhuma tipologia cadastrada</p>
          <Button onClick={abrirNovaTipologia} className="mt-4 bg-blue-600 hover:bg-blue-700">
            Criar primeira tipologia
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {tipologias.map((tipologia, i) => (
            <motion.div
              key={tipologia.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`group flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer ${!tipologia.ativo ? 'opacity-60' : ''}`}
              onClick={() => abrirEdicao(tipologia)}
            >
              {/* Imagem */}
              <div className="flex-shrink-0">
                {tipologia.imagens?.[0] ? (
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden">
                    <img 
                      src={tipologia.imagens[0]} 
                      alt={tipologia.nome}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{tipologia.nome}</h3>
                      {!tipologia.ativo && (
                        <Badge variant="secondary" className="text-xs">Inativa</Badge>
                      )}
                    </div>
                    {tipologia.descricao && (
                      <p className="text-sm text-slate-500 truncate">{tipologia.descricao}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                    {tipologia.variaveis?.length || 0} variáveis
                  </Badge>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                    {tipologia.pecas?.length || 0} peças
                  </Badge>
                  {tipologia.acessorio_ids?.length > 0 && (
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 text-xs">
                      {tipologia.acessorio_ids.length} acessórios
                    </Badge>
                  )}
                  {tipologia.tipos_vidro_ids?.length > 0 && (
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-xs">
                      {tipologia.tipos_vidro_ids.length} tipos de vidro
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Ações */}
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => abrirEdicao(tipologia)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setTipologiaExcluir(tipologia)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white">
            <DialogTitle className="text-2xl font-bold">
              {tipologiaEditando ? 'Editar Tipologia' : 'Nova Tipologia'}
            </DialogTitle>
            <p className="text-sm text-slate-500 mt-1">
              Configure todas as informações da tipologia de forma organizada
            </p>
          </DialogHeader>
          
          <Tabs defaultValue="basicas" className="flex-1 flex flex-col min-h-0">
            <div className="px-6 pt-5 pb-4 border-b bg-gradient-to-b from-slate-50 to-white">
              <TabsList className="inline-flex h-auto p-1 bg-slate-100 rounded-lg gap-1">
                <TabsTrigger 
                  value="basicas" 
                  className="flex items-center gap-1.5 py-2 px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 data-[state=active]:font-medium rounded-md transition-all text-xs"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Básicas</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="variaveis" 
                  className="flex items-center gap-1.5 py-2 px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 data-[state=active]:font-medium rounded-md transition-all text-xs relative"
                >
                  <Variable className="w-3.5 h-3.5" />
                  <span>Variáveis</span>
                  {formData.variaveis.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px] font-semibold absolute -top-1 -right-1 bg-blue-600 text-white">
                      {formData.variaveis.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="pecas" 
                  className="flex items-center gap-1.5 py-2 px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 data-[state=active]:font-medium rounded-md transition-all text-xs relative"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Peças</span>
                  {formData.pecas.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px] font-semibold absolute -top-1 -right-1 bg-green-600 text-white">
                      {formData.pecas.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="vidros" 
                  className="flex items-center gap-1.5 py-2 px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 data-[state=active]:font-medium rounded-md transition-all text-xs relative"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Vidros</span>
                  {formData.tipos_vidro_ids?.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px] font-semibold absolute -top-1 -right-1 bg-indigo-600 text-white">
                      {formData.tipos_vidro_ids.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="acessorios" 
                  className="flex items-center gap-1.5 py-2 px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 data-[state=active]:font-medium rounded-md transition-all text-xs relative"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Acessórios</span>
                  {formData.acessorio_ids?.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px] font-semibold absolute -top-1 -right-1 bg-purple-600 text-white">
                      {formData.acessorio_ids.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Tab: Informações Básicas */}
              <TabsContent value="basicas" className="space-y-6 mt-0">
                <div className="mb-6 pb-4 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Info className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Informações Básicas</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Configure as informações principais da tipologia
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-semibold mb-2 block">Nome da Tipologia *</Label>
                      <Input
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        placeholder="Ex: Porta Pivotante Dupla c/ Bandeira"
                        className="h-11"
                      />
                      <p className="text-xs text-slate-500 mt-1.5">Nome que aparecerá na lista de tipologias</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Status</Label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Switch
                          checked={formData.ativo}
                          onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {formData.ativo ? 'Ativa' : 'Inativa'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formData.ativo ? 'Tipologia visível para usuários' : 'Tipologia oculta'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Descrição</Label>
                    <Textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      placeholder="Descreva esta tipologia e suas características principais..."
                      className="min-h-[100px]"
                      rows={4}
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Descrição opcional que aparecerá na lista</p>
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <div className="mb-4">
                    <Label className="text-sm font-semibold mb-2 block">Categoria</Label>
                    <p className="text-xs text-slate-500">Selecione a categoria em que esta tipologia aparecerá</p>
                  </div>
                  {categorias.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-400">Nenhuma categoria cadastrada</p>
                    </div>
                  ) : (
                    <Select
                      value={formData.categoria_id || undefined}
                      onValueChange={selecionarCategoria}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                {/* Imagens */}
                <div>
                  <div className="mb-4">
                    <Label className="text-sm font-semibold mb-2 block">Imagens / Desenhos</Label>
                    <p className="text-xs text-slate-500">Adicione imagens de referência para esta tipologia</p>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                    {formData.imagens.map((url, i) => (
                      <div key={i} className="relative group">
                        <img 
                          src={url} 
                          alt={`Imagem ${i + 1}`} 
                          className="w-full aspect-square rounded-lg object-cover border border-slate-200"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removerImagem(i)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex items-center justify-center aspect-square border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all group">
                      <div className="text-center">
                        <Image className="w-8 h-8 text-slate-400 mx-auto mb-1 group-hover:text-blue-500" />
                        <p className="text-xs text-slate-500 group-hover:text-blue-600">Adicionar</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Variáveis */}
              <TabsContent value="variaveis" className="space-y-4 mt-0">
                <div className="mb-6 pb-4 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Variable className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Variáveis de Entrada</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Defina as variáveis que o usuário precisará preencher para calcular as peças
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {formData.variaveis.map((variavel, index) => (
                    <div key={variavel.id} className="p-5 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Variable className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-slate-700">Variável {index + 1}</span>
                              {variavel.nome && (
                                <p className="text-xs text-slate-500">Nome técnico: {variavel.nome}</p>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-red-600 hover:bg-red-50"
                            onClick={() => removerVariavel(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Nome técnico *</Label>
                            <Input
                              value={variavel.nome}
                              onChange={(e) => atualizarVariavel(index, 'nome', e.target.value)}
                              placeholder="Ex: Lv, Av, Ap"
                              className="h-10"
                            />
                            <p className="text-xs text-slate-500 mt-1.5">Usado nas fórmulas das peças (ex: Lv - 15)</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Label para exibição *</Label>
                            <Input
                              value={variavel.label}
                              onChange={(e) => atualizarVariavel(index, 'label', e.target.value)}
                              placeholder="Ex: Largura do Vão"
                              className="h-10"
                            />
                            <p className="text-xs text-slate-500 mt-1.5">Texto mostrado ao usuário no formulário</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Unidade padrão</Label>
                            <Select 
                              value={variavel.unidade_padrao} 
                              onValueChange={(v) => atualizarVariavel(index, 'unidade_padrao', v)}
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mm">Milímetros (mm)</SelectItem>
                                <SelectItem value="cm">Centímetros (cm)</SelectItem>
                                <SelectItem value="m">Metros (m)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-3 pt-8">
                            <Switch
                              checked={variavel.permite_alterar_unidade}
                              onCheckedChange={(v) => atualizarVariavel(index, 'permite_alterar_unidade', v)}
                            />
                            <div>
                              <Label className="text-sm font-medium">Permitir alterar unidade</Label>
                              <p className="text-xs text-slate-500">Usuário poderá escolher outra unidade no formulário</p>
                            </div>
                          </div>
                        </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={adicionarVariavel} 
                    className="w-full h-14 border border-dashed hover:bg-blue-50 hover:border-blue-300 transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span className="font-medium">Adicionar Variável</span>
                  </Button>
                </div>
              </TabsContent>

              {/* Tab: Peças */}
              <TabsContent value="pecas" className="space-y-4 mt-0">
                <div className="mb-6 pb-4 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Peças e Configurações Técnicas</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Defina as peças que compõem esta tipologia e suas fórmulas de cálculo
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {formData.pecas.map((peca, index) => (
                    <div key={peca.id} className="p-6 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <Calculator className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <span className="text-base font-semibold text-slate-700">Peça {index + 1}</span>
                              {peca.nome && (
                                <p className="text-sm text-slate-500 mt-0.5">{peca.nome}</p>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-red-600 hover:bg-red-50"
                            onClick={() => removerPeca(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      
                        <div className="space-y-5">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Nome da peça *</Label>
                            <Input
                              value={peca.nome}
                              onChange={(e) => atualizarPeca(index, 'nome', e.target.value)}
                              placeholder="Ex: Bandeira, Folha Principal, Lateral"
                              className="h-10"
                            />
                            <p className="text-xs text-slate-500 mt-1.5">Nome que aparecerá na conferência</p>
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Fórmula da Largura (mm) *</Label>
                              <Input
                                value={peca.formula_largura}
                                onChange={(e) => atualizarPeca(index, 'formula_largura', e.target.value)}
                                placeholder="Ex: Lv - 15"
                                className="h-10 font-mono text-sm"
                              />
                              <p className="text-xs text-slate-500 mt-1.5">Use variáveis definidas (ex: Lv, Av, Ap)</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Fórmula da Altura (mm) *</Label>
                              <Input
                                value={peca.formula_altura}
                                onChange={(e) => atualizarPeca(index, 'formula_altura', e.target.value)}
                                placeholder="Ex: Av - Ap - 13"
                                className="h-10 font-mono text-sm"
                              />
                              <p className="text-xs text-slate-500 mt-1.5">Use variáveis definidas (ex: Lv, Av, Ap)</p>
                            </div>
                          </div>

                          {/* Imagem Ilustrativa */}
                          <div className="pt-5 border-t border-slate-200">
                            <div className="mb-3">
                              <Label className="text-sm font-semibold text-slate-700 mb-1 block">
                                Imagem Ilustrativa
                              </Label>
                              <p className="text-xs text-slate-500">
                                Adicione uma imagem que será exibida durante a conferência da peça. Se não houver imagem, será exibido o desenho geométrico padrão.
                              </p>
                            </div>
                            {peca.imagem_url ? (
                              <div className="relative inline-block">
                                <img 
                                  src={peca.imagem_url} 
                                  alt={`Imagem ${peca.nome || 'da peça'}`} 
                                  className="w-full max-w-md h-48 object-contain rounded-lg border border-slate-200"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 w-7 h-7"
                                  onClick={() => removerPecaImagem(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full max-w-md h-48 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all">
                                <Image className="w-10 h-10 text-slate-400 mb-2" />
                                <p className="text-sm font-medium text-slate-600 mb-1">Adicionar Imagem</p>
                                <p className="text-xs text-slate-500">Clique para fazer upload</p>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*" 
                                  onChange={(e) => handlePecaImagemUpload(e, index)} 
                                />
                              </label>
                            )}
                          </div>
                        
                          {/* Configurações Técnicas */}
                          <div className="pt-5 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <Label className="text-sm font-semibold text-slate-700 mb-1 block">
                                  Configurações Técnicas
                                </Label>
                                <p className="text-xs text-slate-500">
                                  Defina quais configurações técnicas estarão disponíveis para esta peça na conferência
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => adicionarConfiguracaoTecnica(index)}
                                className="h-9"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                              </Button>
                            </div>
                            
                            {peca.configuracoes_tecnicas?.length > 0 ? (
                              <div className="space-y-3">
                                {peca.configuracoes_tecnicas.map((config, configIndex) => {
                                  const categoriaInfo = categoriasConfiguracao.find(
                                    cat => cat.id === config.categoria
                                  );
                                  const itensDisponiveis = categoriaInfo?.itens || [];
                                  
                                  return (
                                    <div 
                                      key={config.id || configIndex} 
                                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1">
                                          <Select
                                            value={config.categoria}
                                            onValueChange={(value) => {
                                              atualizarConfiguracaoTecnica(index, configIndex, 'categoria', value);
                                              atualizarConfiguracaoTecnica(index, configIndex, 'itens_ids', []);
                                            }}
                                          >
                                            <SelectTrigger className="h-10 flex-1">
                                              <SelectValue placeholder="Selecione a categoria" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {categoriasConfiguracao.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                  {cat.nome}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-9 w-9 text-red-600 hover:bg-red-50"
                                          onClick={() => removerConfiguracaoTecnica(index, configIndex)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                      
                                      {config.categoria && (
                                        <>
                                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                            <Switch
                                              checked={config.obrigatorio}
                                              onCheckedChange={(checked) => 
                                                atualizarConfiguracaoTecnica(index, configIndex, 'obrigatorio', checked)
                                              }
                                            />
                                            <div>
                                              <Label className="text-sm font-medium">Obrigatório</Label>
                                              <p className="text-xs text-slate-500">Usuário deve selecionar um valor antes de confirmar</p>
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                              Itens disponíveis ({config.itens_ids?.length || 0} selecionado(s))
                                            </Label>
                                            {itensDisponiveis.length === 0 ? (
                                              <div className="p-4 bg-slate-50 rounded-lg border border-dashed text-center">
                                                <p className="text-sm text-slate-400">Nenhum item cadastrado nesta categoria</p>
                                              </div>
                                            ) : (
                                              <div className="max-h-48 overflow-y-auto border rounded-lg bg-white p-3 space-y-2">
                                                {itensDisponiveis.map(item => (
                                                  <label
                                                    key={item.id}
                                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                                                  >
                                                    <Checkbox
                                                      checked={config.itens_ids?.includes(item.id)}
                                                      onCheckedChange={() => 
                                                        toggleItemConfiguracao(index, configIndex, item.id)
                                                      }
                                                    />
                                                    <span className="text-sm flex-1 font-medium">{item.nome}</span>
                                                  </label>
                                                ))}
                                              </div>
                                            )}
                                            {config.itens_ids?.length === 0 && itensDisponiveis.length > 0 && (
                                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-xs text-blue-700 flex items-center gap-1.5">
                                                  <Info className="w-3.5 h-3.5" />
                                                  Se nenhum item for selecionado, todos estarão disponíveis na conferência
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                <Settings className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-slate-500">Nenhuma configuração técnica adicionada</p>
                                <p className="text-xs text-slate-400 mt-1">Adicione configurações para esta peça</p>
                              </div>
                            )}
                          </div>
                        </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={adicionarPeca} 
                    className="w-full h-14 border border-dashed hover:bg-green-50 hover:border-green-300 transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span className="font-medium">Adicionar Peça</span>
                  </Button>
                </div>
              </TabsContent>

              {/* Tab: Tipos de Vidro */}
              <TabsContent value="vidros" className="space-y-4 mt-0">
                <div className="mb-6 pb-4 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Tipos de Vidro Disponíveis</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Selecione quais tipos de vidro estarão disponíveis para esta tipologia
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formData.tipos_vidro_ids?.length > 0 
                          ? `${formData.tipos_vidro_ids.length} tipo(s) selecionado(s)`
                          : 'Nenhum tipo selecionado'}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {formData.tipos_vidro_ids?.length === 0 
                          ? 'Todos os tipos de vidro estarão disponíveis no orçamento'
                          : 'Apenas os tipos selecionados aparecerão na seleção de vidro'}
                      </p>
                    </div>
                    {formData.tipos_vidro_ids?.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFormData({...formData, tipos_vidro_ids: []})}
                        className="bg-white hover:bg-slate-50 h-8"
                      >
                        Limpar seleção
                      </Button>
                    )}
                  </div>
                  
                  {tiposVidroTecnicos.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50 rounded-lg border border-dashed">
                      <Palette className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-base font-medium text-slate-500 mb-1">Nenhum tipo de vidro técnico cadastrado</p>
                      <p className="text-sm text-slate-400">Cadastre tipos de vidro em Configurações Técnicas</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg bg-white overflow-hidden">
                      <div className="max-h-[600px] overflow-y-auto">
                        {tiposVidroTecnicos.map((vidro, idx) => {
                          const selecionado = formData.tipos_vidro_ids?.includes(vidro.id);
                          return (
                            <label
                              key={vidro.id}
                              className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0 ${
                                selecionado
                                  ? 'bg-indigo-50 hover:bg-indigo-100'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <Checkbox
                                checked={selecionado}
                                onCheckedChange={() => toggleTipoVidro(vidro.id)}
                              />
                              <div 
                                className="w-12 h-12 rounded-lg border-2 border-white shadow-sm flex-shrink-0"
                                style={{ backgroundColor: vidro.cor || '#e2e8f0' }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <p className="font-semibold text-slate-900">{vidro.nome}</p>
                                  {selecionado && (
                                    <Badge variant="secondary" className="bg-indigo-600 text-white text-xs">
                                      Selecionado
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>{vidro.codigo}</span>
                                  <span>•</span>
                                  <span>{vidro.espessura}</span>
                                  <span>•</span>
                                  <span>{vidro.tipo}</span>
                                  {vidro.preco_m2 > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-green-600 font-semibold">R$ {vidro.preco_m2.toFixed(2)}/m²</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab: Acessórios */}
              <TabsContent value="acessorios" className="space-y-4 mt-0">
                <div className="mb-6 pb-4 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Acessórios Disponíveis</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Selecione quais acessórios estarão disponíveis para esta tipologia
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formData.acessorio_ids?.length > 0 
                          ? `${formData.acessorio_ids.length} acessório(s) selecionado(s)`
                          : 'Nenhum acessório selecionado'}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Os acessórios selecionados aparecerão na etapa de adicionar acessórios do orçamento
                      </p>
                    </div>
                    {formData.acessorio_ids?.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFormData({...formData, acessorio_ids: []})}
                        className="bg-white hover:bg-slate-50 h-8"
                      >
                        Limpar seleção
                      </Button>
                    )}
                  </div>
                  
                  {produtosDisponiveis.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50 rounded-lg border border-dashed">
                      <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-base font-medium text-slate-500 mb-1">Nenhum produto cadastrado</p>
                      <p className="text-sm text-slate-400">Cadastre produtos em Produtos</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg bg-white overflow-hidden">
                      <div className="max-h-[600px] overflow-y-auto">
                        {produtosDisponiveis.map((acess, idx) => {
                          const selecionado = formData.acessorio_ids?.includes(acess.id);
                          return (
                            <label
                              key={acess.id}
                              className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0 ${
                                selecionado
                                  ? 'bg-purple-50 hover:bg-purple-100'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <Checkbox
                                checked={selecionado}
                                onCheckedChange={() => toggleAcessorio(acess.id)}
                              />
                              {acess.imagem_url ? (
                                <img 
                                  src={acess.imagem_url} 
                                  alt={acess.nome}
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                                  <Package className="w-6 h-6 text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <p className="font-semibold text-slate-900">{acess.nome}</p>
                                  {selecionado && (
                                    <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                                      Selecionado
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  {acess.codigo && (
                                    <>
                                      <span>{acess.codigo}</span>
                                      <span>•</span>
                                    </>
                                  )}
                                  <span className="text-green-600 font-semibold">R$ {acess.preco?.toFixed(2)}</span>
                                  {acess.unidade && (
                                    <>
                                      <span>•</span>
                                      <span>por {acess.unidade}</span>
                                    </>
                                  )}
                                  {acess.categoria && (
                                    <>
                                      <span>•</span>
                                      <span className="capitalize">{acess.categoria}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <DialogFooter className="px-6 py-5 border-t bg-white">
            <Button 
              variant="outline" 
              onClick={fecharModal}
              className="h-11 px-6"
            >
              Cancelar
            </Button>
            <Button 
              onClick={salvar} 
              disabled={!formData.nome || createMutation.isPending || updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 h-11 px-6 font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Tipologia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={!!tipologiaExcluir} onOpenChange={() => setTipologiaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tipologia?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tipologia "{tipologiaExcluir?.nome}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(tipologiaExcluir?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}