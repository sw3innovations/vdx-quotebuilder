import React, { useState } from "react";
import { entities, integrations } from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Palette,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Grip,
  Wrench,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";

// Tipos de Vidro Técnicos (características técnicas + configuração de preço)
// O preco_m2 é uma configuração de preço para este tipo técnico, não um produto vendável
const TIPO_VIDRO_TECNICO_INICIAL = {
  codigo: '',
  nome: '',
  espessura: '',
  tipo: 'comum',
  cor: '#e2e8f0',
  descricao: '',
  caracteristicas: [],
  preco_m2: 0, // Configuração de preço para cálculo do orçamento
  ativo: true,
  ordem: 0
};

// Puxadores Técnicos (sem preço, apenas tipo de furação)
const PUXADOR_TECNICO_INICIAL = {
  nome: '',
  codigo: '',
  tipo_furacao: '',
  descricao: '',
  imagem_url: '',
  especificacoes: {
    diametro_furo: '',
    distancia_centros: '',
    profundidade: ''
  },
  ativo: true
};

// Ferragens Técnicas
const FERRAGEM_TECNICA_INICIAL = {
  nome: '',
  codigo: '',
  tipo: '',
  descricao: '',
  compatibilidade_tipologias: [],
  especificacoes: {},
  ativo: true
};

export default function ConfiguracoesTecnicas() {
  const queryClient = useQueryClient();
  
  // Estados para Tipos de Vidro Técnicos
  const [modalVidroAberto, setModalVidroAberto] = useState(false);
  const [vidroEditando, setVidroEditando] = useState(null);
  const [formVidro, setFormVidro] = useState(TIPO_VIDRO_TECNICO_INICIAL);
  const [vidroExcluir, setVidroExcluir] = useState(null);
  
  // Estados para Puxadores Técnicos
  const [modalPuxadorAberto, setModalPuxadorAberto] = useState(false);
  const [puxadorEditando, setPuxadorEditando] = useState(null);
  const [formPuxador, setFormPuxador] = useState(PUXADOR_TECNICO_INICIAL);
  const [puxadorExcluir, setPuxadorExcluir] = useState(null);
  
  // Estados para Ferragens Técnicas
  const [modalFerragemAberto, setModalFerragemAberto] = useState(false);
  const [ferragemEditando, setFerragemEditando] = useState(null);
  const [formFerragem, setFormFerragem] = useState(FERRAGEM_TECNICA_INICIAL);
  const [ferragemExcluir, setFerragemExcluir] = useState(null);

  // Estados para Tipos de Configurações Técnicas
  const TIPO_CONFIG_TECNICA_INICIAL = {
    nome: '',
    codigo: '',
    descricao: '',
    ordem: 0,
    ativo: true
  };
  const [modalTipoConfigAberto, setModalTipoConfigAberto] = useState(false);
  const [tipoConfigEditando, setTipoConfigEditando] = useState(null);
  const [formTipoConfig, setFormTipoConfig] = useState(TIPO_CONFIG_TECNICA_INICIAL);
  const [tipoConfigExcluir, setTipoConfigExcluir] = useState(null);
  
  // Estados para Itens de Configurações Técnicas
  const ITEM_CONFIG_TECNICA_INICIAL = {
    tipo_configuracao_id: '',
    nome: '',
    codigo: '',
    descricao: '',
    imagem_url: '',
    especificacoes: {},
    ativo: true
  };
  const [modalItemConfigAberto, setModalItemConfigAberto] = useState(false);
  const [itemConfigEditando, setItemConfigEditando] = useState(null);
  const [formItemConfig, setFormItemConfig] = useState(ITEM_CONFIG_TECNICA_INICIAL);
  const [itemConfigExcluir, setItemConfigExcluir] = useState(null);
  const [categoriaSelecionadaItem, setCategoriaSelecionadaItem] = useState(null);
  const [modalElementosAberto, setModalElementosAberto] = useState(false);
  const [categoriaVisualizando, setCategoriaVisualizando] = useState(null);

  // Queries
  const { data: tiposVidroTecnicos = [], isLoading: loadingVidros } = useQuery({
    queryKey: ['tiposVidroTecnicos'],
    queryFn: () => entities.TipoVidroTecnico.list('ordem')
  });

  const { data: puxadoresTecnicos = [], isLoading: loadingPuxadores } = useQuery({
    queryKey: ['puxadoresTecnicos'],
    queryFn: () => entities.PuxadorTecnico.list('nome')
  });

  const { data: ferragensTecnicas = [], isLoading: loadingFerragens } = useQuery({
    queryKey: ['ferragensTecnicas'],
    queryFn: () => entities.FerragemTecnica.list('nome')
  });

  const { data: tipologias = [] } = useQuery({
    queryKey: ['tipologias'],
    queryFn: () => entities.Tipologia.list('ordem')
  });

  const { data: tiposConfiguracaoTecnica = [], isLoading: loadingTiposConfig } = useQuery({
    queryKey: ['tiposConfiguracaoTecnica'],
    queryFn: () => entities.TipoConfiguracaoTecnica.list('ordem')
  });

  const { data: itensConfiguracaoTecnica = [], isLoading: loadingItensConfig } = useQuery({
    queryKey: ['itensConfiguracaoTecnica'],
    queryFn: () => entities.ItemConfiguracaoTecnica.list('nome')
  });

  // Mutations - Tipos de Vidro Técnicos
  const createVidroMutation = useMutation({
    mutationFn: (data) => entities.TipoVidroTecnico.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tiposVidroTecnicos']);
      setModalVidroAberto(false);
      setFormVidro(TIPO_VIDRO_TECNICO_INICIAL);
    }
  });

  const updateVidroMutation = useMutation({
    mutationFn: ({ id, data }) => entities.TipoVidroTecnico.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tiposVidroTecnicos']);
      setModalVidroAberto(false);
      setVidroEditando(null);
      setFormVidro(TIPO_VIDRO_TECNICO_INICIAL);
    }
  });

  const deleteVidroMutation = useMutation({
    mutationFn: (id) => entities.TipoVidroTecnico.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tiposVidroTecnicos']);
      setVidroExcluir(null);
    }
  });

  // Mutations - Puxadores Técnicos
  const createPuxadorMutation = useMutation({
    mutationFn: (data) => entities.PuxadorTecnico.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['puxadoresTecnicos']);
      setModalPuxadorAberto(false);
      setFormPuxador(PUXADOR_TECNICO_INICIAL);
    }
  });

  const updatePuxadorMutation = useMutation({
    mutationFn: ({ id, data }) => entities.PuxadorTecnico.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['puxadoresTecnicos']);
      setModalPuxadorAberto(false);
      setPuxadorEditando(null);
      setFormPuxador(PUXADOR_TECNICO_INICIAL);
    }
  });

  const deletePuxadorMutation = useMutation({
    mutationFn: (id) => entities.PuxadorTecnico.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['puxadoresTecnicos']);
      setPuxadorExcluir(null);
    }
  });

  // Mutations - Ferragens Técnicas
  const createFerragemMutation = useMutation({
    mutationFn: (data) => entities.FerragemTecnica.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ferragensTecnicas']);
      setModalFerragemAberto(false);
      setFormFerragem(FERRAGEM_TECNICA_INICIAL);
    }
  });

  const updateFerragemMutation = useMutation({
    mutationFn: ({ id, data }) => entities.FerragemTecnica.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ferragensTecnicas']);
      setModalFerragemAberto(false);
      setFerragemEditando(null);
      setFormFerragem(FERRAGEM_TECNICA_INICIAL);
    }
  });

  const deleteFerragemMutation = useMutation({
    mutationFn: (id) => entities.FerragemTecnica.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['ferragensTecnicas']);
      setFerragemExcluir(null);
    }
  });

  // Handlers - Tipos de Vidro Técnicos
  const abrirNovoVidro = () => {
    setVidroEditando(null);
    setFormVidro({ ...TIPO_VIDRO_TECNICO_INICIAL, ordem: tiposVidroTecnicos.length });
    setModalVidroAberto(true);
  };

  const abrirEdicaoVidro = (vidro) => {
    setVidroEditando(vidro);
    setFormVidro({
      codigo: vidro.codigo || '',
      nome: vidro.nome || '',
      espessura: vidro.espessura || '',
      tipo: vidro.tipo || 'comum',
      cor: vidro.cor || '#e2e8f0',
      descricao: vidro.descricao || '',
      caracteristicas: vidro.caracteristicas || [],
      preco_m2: vidro.preco_m2 || 0,
      ativo: vidro.ativo !== false,
      ordem: vidro.ordem || 0
    });
    setModalVidroAberto(true);
  };

  const salvarVidro = () => {
    if (vidroEditando) {
      updateVidroMutation.mutate({ id: vidroEditando.id, data: formVidro });
    } else {
      createVidroMutation.mutate(formVidro);
    }
  };

  // Handlers - Puxadores Técnicos
  const abrirNovoPuxador = () => {
    setPuxadorEditando(null);
    setFormPuxador(PUXADOR_TECNICO_INICIAL);
    setModalPuxadorAberto(true);
  };

  const abrirEdicaoPuxador = (puxador) => {
    setPuxadorEditando(puxador);
    setFormPuxador({
      nome: puxador.nome || '',
      codigo: puxador.codigo || '',
      tipo_furacao: puxador.tipo_furacao || '',
      descricao: puxador.descricao || '',
      imagem_url: puxador.imagem_url || '',
      especificacoes: puxador.especificacoes || {
        diametro_furo: '',
        distancia_centros: '',
        profundidade: ''
      },
      ativo: puxador.ativo !== false
    });
    setModalPuxadorAberto(true);
  };

  const salvarPuxador = () => {
    if (puxadorEditando) {
      updatePuxadorMutation.mutate({ id: puxadorEditando.id, data: formPuxador });
    } else {
      createPuxadorMutation.mutate(formPuxador);
    }
  };

  const handlePuxadorImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await integrations.Core.UploadFile({ file });
    setFormPuxador({ ...formPuxador, imagem_url: file_url });
  };

  // Handlers - Ferragens Técnicas
  const abrirNovaFerragem = () => {
    setFerragemEditando(null);
    setFormFerragem(FERRAGEM_TECNICA_INICIAL);
    setModalFerragemAberto(true);
  };

  const abrirEdicaoFerragem = (ferragem) => {
    setFerragemEditando(ferragem);
    setFormFerragem({
      nome: ferragem.nome || '',
      codigo: ferragem.codigo || '',
      tipo: ferragem.tipo || '',
      descricao: ferragem.descricao || '',
      compatibilidade_tipologias: ferragem.compatibilidade_tipologias || [],
      especificacoes: ferragem.especificacoes || {},
      ativo: ferragem.ativo !== false
    });
    setModalFerragemAberto(true);
  };

  const salvarFerragem = () => {
    if (ferragemEditando) {
      updateFerragemMutation.mutate({ id: ferragemEditando.id, data: formFerragem });
    } else {
      createFerragemMutation.mutate(formFerragem);
    }
  };

  // Mutations - Tipos de Configurações Técnicas
  const createTipoConfigMutation = useMutation({
    mutationFn: (data) => entities.TipoConfiguracaoTecnica.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tiposConfiguracaoTecnica']);
      setModalTipoConfigAberto(false);
      setFormTipoConfig(TIPO_CONFIG_TECNICA_INICIAL);
    }
  });

  const updateTipoConfigMutation = useMutation({
    mutationFn: ({ id, data }) => entities.TipoConfiguracaoTecnica.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tiposConfiguracaoTecnica']);
      setModalTipoConfigAberto(false);
      setTipoConfigEditando(null);
      setFormTipoConfig(TIPO_CONFIG_TECNICA_INICIAL);
    }
  });

  const deleteTipoConfigMutation = useMutation({
    mutationFn: (id) => entities.TipoConfiguracaoTecnica.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tiposConfiguracaoTecnica']);
      setTipoConfigExcluir(null);
    }
  });

  const abrirNovoTipoConfig = () => {
    setTipoConfigEditando(null);
    setFormTipoConfig({ ...TIPO_CONFIG_TECNICA_INICIAL, ordem: tiposConfiguracaoTecnica.length });
    setModalTipoConfigAberto(true);
  };

  const abrirEdicaoTipoConfig = (tipoConfig) => {
    setTipoConfigEditando(tipoConfig);
    setFormTipoConfig({
      nome: tipoConfig.nome || '',
      codigo: tipoConfig.codigo || '',
      descricao: tipoConfig.descricao || '',
      ordem: tipoConfig.ordem || 0,
      ativo: tipoConfig.ativo !== false
    });
    setModalTipoConfigAberto(true);
  };

  const salvarTipoConfig = () => {
    if (tipoConfigEditando) {
      updateTipoConfigMutation.mutate({ id: tipoConfigEditando.id, data: formTipoConfig });
    } else {
      createTipoConfigMutation.mutate(formTipoConfig);
    }
  };

  // Mutations - Itens de Configurações Técnicas
  const createItemConfigMutation = useMutation({
    mutationFn: (data) => entities.ItemConfiguracaoTecnica.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['itensConfiguracaoTecnica']);
      setModalItemConfigAberto(false);
      setFormItemConfig(ITEM_CONFIG_TECNICA_INICIAL);
      setCategoriaSelecionadaItem(null);
    }
  });

  const updateItemConfigMutation = useMutation({
    mutationFn: ({ id, data }) => entities.ItemConfiguracaoTecnica.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['itensConfiguracaoTecnica']);
      setModalItemConfigAberto(false);
      setItemConfigEditando(null);
      setFormItemConfig(ITEM_CONFIG_TECNICA_INICIAL);
      setCategoriaSelecionadaItem(null);
    }
  });

  const deleteItemConfigMutation = useMutation({
    mutationFn: (id) => entities.ItemConfiguracaoTecnica.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['itensConfiguracaoTecnica']);
      setItemConfigExcluir(null);
    }
  });

  const abrirNovoItemConfig = (categoriaId) => {
    setItemConfigEditando(null);
    setCategoriaSelecionadaItem(categoriaId);
    setFormItemConfig({ ...ITEM_CONFIG_TECNICA_INICIAL, tipo_configuracao_id: categoriaId });
    setModalItemConfigAberto(true);
  };

  const abrirEdicaoItemConfig = (itemConfig) => {
    setItemConfigEditando(itemConfig);
    setCategoriaSelecionadaItem(itemConfig.tipo_configuracao_id);
    setFormItemConfig({
      tipo_configuracao_id: itemConfig.tipo_configuracao_id || '',
      nome: itemConfig.nome || '',
      codigo: itemConfig.codigo || '',
      descricao: itemConfig.descricao || '',
      imagem_url: itemConfig.imagem_url || '',
      especificacoes: itemConfig.especificacoes || {},
      ativo: itemConfig.ativo !== false
    });
    setModalItemConfigAberto(true);
  };

  const salvarItemConfig = () => {
    if (itemConfigEditando) {
      updateItemConfigMutation.mutate({ id: itemConfigEditando.id, data: formItemConfig });
    } else {
      createItemConfigMutation.mutate(formItemConfig);
    }
  };

  const handleItemConfigImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await integrations.Core.UploadFile({ file });
    setFormItemConfig({ ...formItemConfig, imagem_url: file_url });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Configurações Técnicas</h1>
        <p className="text-slate-500 mt-1">Configure características técnicas das tipologias (não são produtos comercializáveis)</p>
      </div>

      <Tabs defaultValue="vidros" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="vidros" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Tipos de Vidro
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações Personalizadas
          </TabsTrigger>
        </TabsList>

        {/* Tipos de Vidro Técnicos */}
        <TabsContent value="vidros">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tipos de Vidro Técnicos</CardTitle>
                <CardDescription>Características técnicas do vidro (espessura, tipo, cor) - sem preço</CardDescription>
              </div>
              <Button onClick={abrirNovoVidro} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Tipo
              </Button>
            </CardHeader>
            <CardContent>
              {loadingVidros ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : tiposVidroTecnicos.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Palette className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>Nenhum tipo de vidro técnico cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tiposVidroTecnicos.map((vidro, i) => (
                    <motion.div
                      key={vidro.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center justify-between p-4 bg-slate-50 rounded-lg ${!vidro.ativo ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-lg border-2 border-white shadow"
                          style={{ backgroundColor: vidro.cor || '#e2e8f0' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{vidro.nome}</span>
                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{vidro.codigo}</span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {vidro.espessura} • {vidro.tipo}
                            {vidro.preco_m2 > 0 && (
                              <span className="ml-2 text-green-600 font-medium">
                                • R$ {vidro.preco_m2.toFixed(2)}/m²
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => abrirEdicaoVidro(vidro)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setVidroExcluir(vidro)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Personalizadas */}
        <TabsContent value="configuracoes" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Configurações Personalizadas</h2>
              <p className="text-sm text-slate-500 mt-1">Gerencie categorias e seus elementos de configuração técnica</p>
            </div>
            <Button onClick={abrirNovoTipoConfig} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          {/* Lista de Categorias */}
          {loadingTiposConfig ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1,2,3,4].map(i => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tiposConfiguracaoTecnica.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <Settings className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhuma categoria cadastrada</h3>
                  <p className="text-sm text-slate-500 mb-6">Comece criando sua primeira categoria de configuração técnica</p>
                  <Button onClick={abrirNovoTipoConfig} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Categoria
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tiposConfiguracaoTecnica.map((tipoConfig, i) => {
                // Buscar elementos desta categoria
                const elementos = itensConfiguracaoTecnica.filter(
                  item => item.tipo_configuracao_id === tipoConfig.id
                );

                return (
                  <motion.div
                    key={tipoConfig.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card 
                      className={`group h-full flex flex-col transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-blue-300 ${!tipoConfig.ativo ? 'opacity-60 border-slate-200' : 'border-slate-200'}`}
                      onClick={() => {
                        setCategoriaVisualizando(tipoConfig);
                        setModalElementosAberto(true);
                      }}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-1.5">
                                <h3 className="font-bold text-slate-900 text-lg leading-tight">{tipoConfig.nome}</h3>
                                {!tipoConfig.ativo && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 flex-shrink-0 mt-0.5">Inativo</Badge>
                                )}
                              </div>
                              {tipoConfig.codigo && (
                                <p className="text-xs text-slate-500 font-mono mb-1.5 bg-slate-50 px-2 py-0.5 rounded inline-block">{tipoConfig.codigo}</p>
                              )}
                              {tipoConfig.descricao && (
                                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{tipoConfig.descricao}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirEdicaoTipoConfig(tipoConfig);
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTipoConfigExcluir(tipoConfig);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 flex flex-col justify-end pt-0 pb-5">
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div>
                            <p className="text-xs font-medium text-slate-700">
                              {elementos.length} {elementos.length === 1 ? 'elemento' : 'elementos'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Clique para visualizar</p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Tipo de Vidro Técnico */}
      <Dialog open={modalVidroAberto} onOpenChange={setModalVidroAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {vidroEditando ? 'Editar Tipo de Vidro Técnico' : 'Novo Tipo de Vidro Técnico'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código</Label>
                <Input
                  value={formVidro.codigo}
                  onChange={(e) => setFormVidro({...formVidro, codigo: e.target.value})}
                  placeholder="VC-001"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Nome</Label>
                <Input
                  value={formVidro.nome}
                  onChange={(e) => setFormVidro({...formVidro, nome: e.target.value})}
                  placeholder="Vidro Comum 4mm"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Espessura</Label>
                <Input
                  value={formVidro.espessura}
                  onChange={(e) => setFormVidro({...formVidro, espessura: e.target.value})}
                  placeholder="4mm"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Input
                  value={formVidro.tipo}
                  onChange={(e) => setFormVidro({...formVidro, tipo: e.target.value})}
                  placeholder="comum, temperado, laminado"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Cor (para visualização)</Label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  value={formVidro.cor}
                  onChange={(e) => setFormVidro({...formVidro, cor: e.target.value})}
                  className="w-16 h-10 rounded border"
                />
                <Input
                  value={formVidro.cor}
                  onChange={(e) => setFormVidro({...formVidro, cor: e.target.value})}
                  placeholder="#e2e8f0"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formVidro.descricao}
                onChange={(e) => setFormVidro({...formVidro, descricao: e.target.value})}
                placeholder="Descrição das características técnicas"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Preço por m² (configuração de preço)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formVidro.preco_m2}
                onChange={(e) => setFormVidro({...formVidro, preco_m2: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Preço usado para cálculo do orçamento (não é um produto vendável)
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch
                checked={formVidro.ativo}
                onCheckedChange={(checked) => setFormVidro({...formVidro, ativo: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalVidroAberto(false)}>Cancelar</Button>
            <Button 
              onClick={salvarVidro} 
              disabled={!formVidro.nome || createVidroMutation.isPending || updateVidroMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Puxador Técnico */}
      <Dialog open={modalPuxadorAberto} onOpenChange={setModalPuxadorAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {puxadorEditando ? 'Editar Puxador Técnico' : 'Novo Puxador Técnico'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={formPuxador.nome}
                  onChange={(e) => setFormPuxador({...formPuxador, nome: e.target.value})}
                  placeholder="Puxador Alumínio"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Código</Label>
                <Input
                  value={formPuxador.codigo}
                  onChange={(e) => setFormPuxador({...formPuxador, codigo: e.target.value})}
                  placeholder="PUX-AL-TEC"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Tipo de Furação</Label>
              <Input
                value={formPuxador.tipo_furacao}
                onChange={(e) => setFormPuxador({...formPuxador, tipo_furacao: e.target.value})}
                placeholder="furo_8mm"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formPuxador.descricao}
                onChange={(e) => setFormPuxador({...formPuxador, descricao: e.target.value})}
                placeholder="Descrição do tipo de furação"
                className="mt-1"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Diâmetro do Furo</Label>
                <Input
                  value={formPuxador.especificacoes?.diametro_furo || ''}
                  onChange={(e) => setFormPuxador({
                    ...formPuxador,
                    especificacoes: {
                      ...formPuxador.especificacoes,
                      diametro_furo: e.target.value
                    }
                  })}
                  placeholder="8mm"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Distância entre Centros</Label>
                <Input
                  value={formPuxador.especificacoes?.distancia_centros || ''}
                  onChange={(e) => setFormPuxador({
                    ...formPuxador,
                    especificacoes: {
                      ...formPuxador.especificacoes,
                      distancia_centros: e.target.value
                    }
                  })}
                  placeholder="96mm"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Profundidade</Label>
                <Input
                  value={formPuxador.especificacoes?.profundidade || ''}
                  onChange={(e) => setFormPuxador({
                    ...formPuxador,
                    especificacoes: {
                      ...formPuxador.especificacoes,
                      profundidade: e.target.value
                    }
                  })}
                  placeholder="20mm"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Imagem</Label>
              <div className="mt-1 flex items-center gap-4">
                {formPuxador.imagem_url ? (
                  <div className="relative">
                    <img 
                      src={formPuxador.imagem_url} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => setFormPuxador({...formPuxador, imagem_url: ''})}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Grip className="w-6 h-6 text-slate-400" />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePuxadorImageUpload} />
                  </label>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch
                checked={formPuxador.ativo}
                onCheckedChange={(checked) => setFormPuxador({...formPuxador, ativo: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPuxadorAberto(false)}>Cancelar</Button>
            <Button 
              onClick={salvarPuxador} 
              disabled={!formPuxador.nome || createPuxadorMutation.isPending || updatePuxadorMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ferragem Técnica */}
      <Dialog open={modalFerragemAberto} onOpenChange={setModalFerragemAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {ferragemEditando ? 'Editar Ferragem Técnica' : 'Nova Ferragem Técnica'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={formFerragem.nome}
                  onChange={(e) => setFormFerragem({...formFerragem, nome: e.target.value})}
                  placeholder="Trilho Superior Correr"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Código</Label>
                <Input
                  value={formFerragem.codigo}
                  onChange={(e) => setFormFerragem({...formFerragem, codigo: e.target.value})}
                  placeholder="FERR-TRI-SUP"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Tipo</Label>
              <Input
                value={formFerragem.tipo}
                onChange={(e) => setFormFerragem({...formFerragem, tipo: e.target.value})}
                placeholder="trilho, sistema_basculante, etc"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formFerragem.descricao}
                onChange={(e) => setFormFerragem({...formFerragem, descricao: e.target.value})}
                placeholder="Descrição da ferragem e suas compatibilidades"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Tipologias Compatíveis</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {tipologias.map((tip) => (
                  <label key={tip.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFerragem.compatibilidade_tipologias?.includes(tip.id)}
                      onChange={(e) => {
                        const current = formFerragem.compatibilidade_tipologias || [];
                        if (e.target.checked) {
                          setFormFerragem({
                            ...formFerragem,
                            compatibilidade_tipologias: [...current, tip.id]
                          });
                        } else {
                          setFormFerragem({
                            ...formFerragem,
                            compatibilidade_tipologias: current.filter(id => id !== tip.id)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{tip.nome}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch
                checked={formFerragem.ativo}
                onCheckedChange={(checked) => setFormFerragem({...formFerragem, ativo: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalFerragemAberto(false)}>Cancelar</Button>
            <Button 
              onClick={salvarFerragem} 
              disabled={!formFerragem.nome || createFerragemMutation.isPending || updateFerragemMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alertas de Exclusão */}
      <AlertDialog open={!!vidroExcluir} onOpenChange={() => setVidroExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tipo de vidro técnico?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{vidroExcluir?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteVidroMutation.mutate(vidroExcluir?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!puxadorExcluir} onOpenChange={() => setPuxadorExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir puxador técnico?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{puxadorExcluir?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePuxadorMutation.mutate(puxadorExcluir?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!ferragemExcluir} onOpenChange={() => setFerragemExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ferragem técnica?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{ferragemExcluir?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFerragemMutation.mutate(ferragemExcluir?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Tipo de Configuração Técnica */}
      <Dialog open={modalTipoConfigAberto} onOpenChange={setModalTipoConfigAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {tipoConfigEditando ? 'Editar Tipo de Configuração Técnica' : 'Novo Tipo de Configuração Técnica'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código *</Label>
                <Input
                  value={formTipoConfig.codigo}
                  onChange={(e) => setFormTipoConfig({...formTipoConfig, codigo: e.target.value})}
                  placeholder="PUX_TEC"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Nome *</Label>
                <Input
                  value={formTipoConfig.nome}
                  onChange={(e) => setFormTipoConfig({...formTipoConfig, nome: e.target.value})}
                  placeholder="Puxador Técnico"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formTipoConfig.descricao}
                onChange={(e) => setFormTipoConfig({...formTipoConfig, descricao: e.target.value})}
                placeholder="Descrição do tipo de configuração técnica"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch
                checked={formTipoConfig.ativo}
                onCheckedChange={(checked) => setFormTipoConfig({...formTipoConfig, ativo: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalTipoConfigAberto(false)}>Cancelar</Button>
            <Button 
              onClick={salvarTipoConfig} 
              disabled={!formTipoConfig.nome || !formTipoConfig.codigo || createTipoConfigMutation.isPending || updateTipoConfigMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerta de Exclusão - Tipo de Configuração Técnica */}
      <AlertDialog open={!!tipoConfigExcluir} onOpenChange={() => setTipoConfigExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tipo de configuração técnica?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{tipoConfigExcluir?.nome}"? Todos os itens desta categoria também serão excluídos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTipoConfigMutation.mutate(tipoConfigExcluir?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Item de Configuração Técnica */}
      <Dialog open={modalItemConfigAberto} onOpenChange={(open) => {
        setModalItemConfigAberto(open);
        if (!open) {
          setCategoriaSelecionadaItem(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {itemConfigEditando ? 'Editar Item de Configuração Técnica' : 'Novo Item de Configuração Técnica'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {categoriaSelecionadaItem && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Categoria:</span>{' '}
                  {tiposConfiguracaoTecnica.find(t => t.id === categoriaSelecionadaItem)?.nome || 'N/A'}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código *</Label>
                <Input
                  value={formItemConfig.codigo}
                  onChange={(e) => setFormItemConfig({...formItemConfig, codigo: e.target.value})}
                  placeholder="PUX-FC"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Nome *</Label>
                <Input
                  value={formItemConfig.nome}
                  onChange={(e) => setFormItemConfig({...formItemConfig, nome: e.target.value})}
                  placeholder="Furação Central"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formItemConfig.descricao}
                onChange={(e) => setFormItemConfig({...formItemConfig, descricao: e.target.value})}
                placeholder="Descrição do item de configuração técnica"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Imagem</Label>
              <div className="mt-1 flex items-center gap-4">
                {formItemConfig.imagem_url ? (
                  <div className="relative">
                    <img 
                      src={formItemConfig.imagem_url} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => setFormItemConfig({...formItemConfig, imagem_url: ''})}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Settings className="w-6 h-6 text-slate-400" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleItemConfigImageUpload} />
                  </label>
                )}
                <p className="text-xs text-slate-500">Clique para fazer upload de uma imagem</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch
                checked={formItemConfig.ativo}
                onCheckedChange={(checked) => setFormItemConfig({...formItemConfig, ativo: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setModalItemConfigAberto(false);
              setCategoriaSelecionadaItem(null);
            }}>Cancelar</Button>
            <Button 
              onClick={salvarItemConfig} 
              disabled={!formItemConfig.nome || !formItemConfig.codigo || !formItemConfig.tipo_configuracao_id || createItemConfigMutation.isPending || updateItemConfigMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerta de Exclusão - Item de Configuração Técnica */}
      <AlertDialog open={!!itemConfigExcluir} onOpenChange={() => setItemConfigExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item de configuração técnica?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{itemConfigExcluir?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItemConfigMutation.mutate(itemConfigExcluir?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Elementos da Categoria */}
      <Dialog open={modalElementosAberto} onOpenChange={setModalElementosAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {categoriaVisualizando?.nome}
            </DialogTitle>
            {categoriaVisualizando?.descricao && (
              <p className="text-sm text-slate-500 mt-1">{categoriaVisualizando.descricao}</p>
            )}
          </DialogHeader>
          
          <div className="mt-4">
            {categoriaVisualizando && (() => {
              const elementosCategoria = itensConfiguracaoTecnica.filter(
                item => item.tipo_configuracao_id === categoriaVisualizando.id
              );

              return (
                <div className="space-y-4">
                  {/* Header com contador e botão */}
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm font-medium">
                        {elementosCategoria.length} {elementosCategoria.length === 1 ? 'elemento' : 'elementos'}
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => {
                        abrirNovoItemConfig(categoriaVisualizando.id);
                        setModalElementosAberto(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Elemento
                    </Button>
                  </div>

                  {/* Lista de Elementos */}
                  {elementosCategoria.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <Settings className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum elemento cadastrado</h3>
                      <p className="text-sm text-slate-500 mb-6">Comece adicionando o primeiro elemento a esta categoria</p>
                      <Button 
                        onClick={() => {
                          abrirNovoItemConfig(categoriaVisualizando.id);
                          setModalElementosAberto(false);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Elemento
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-2">
                      {elementosCategoria.map((elemento, index) => (
                        <motion.div
                          key={elemento.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="group flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          {elemento.imagem_url ? (
                            <img 
                              src={elemento.imagem_url} 
                              alt={elemento.nome}
                              className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                              <Settings className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 text-sm">{elemento.nome}</span>
                              {elemento.codigo && (
                                <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                  {elemento.codigo}
                                </span>
                              )}
                            </div>
                            {elemento.descricao && (
                              <p className="text-xs text-slate-500 truncate mt-0.5">{elemento.descricao}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => {
                                abrirEdicaoItemConfig(elemento);
                                setModalElementosAberto(false);
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setItemConfigExcluir(elemento);
                                setModalElementosAberto(false);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalElementosAberto(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
