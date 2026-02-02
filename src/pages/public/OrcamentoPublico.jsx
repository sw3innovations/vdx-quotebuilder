import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { entities } from "@/api/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Loader2,
  Calculator,
  Layers,
  ClipboardList,
  CheckCircle2,
  Square,
  ShoppingCart,
  Trash2,
  Plus,
  Package,
  Ruler,
  Bell,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoriaCard from "@/components/orcamento/CategoriaCard";
import TipologiaCard from "@/components/orcamento/TipologiaCard";
import InputComUnidade from "@/components/orcamento/InputComUnidade";
import PecaConferencia from "@/components/orcamento/PecaConferencia";
import { calcularPecas, calcularPreco } from "@/components/utils/calculoUtils";

const ETAPAS = [
  { id: 1, nome: "Categoria", icone: Layers },
  { id: 2, nome: "Tipologia + Medidas", icone: Calculator },
  { id: 3, nome: "Conferência", icone: Check },
  { id: 4, nome: "Acessórios", icone: Plus },
  { id: 5, nome: "Finalizar", icone: CheckCircle2 }
];

// Mock data para Company
const mockCompany = {
  id: 'comp-1',
  name: 'Vidraçaria Digital Express',
  logo_url: null,
  primary_color: '#1e88e5'
};

export default function OrcamentoPublico() {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [tipologiaSelecionada, setTipologiaSelecionada] = useState(null);
  const [variaveisPreenchidas, setVariaveisPreenchidas] = useState([]);
  const [pecasCalculadas, setPecasCalculadas] = useState([]);
  const [pecaConferenciaAtual, setPecaConferenciaAtual] = useState(0);
  const [tipoVidroSelecionado, setTipoVidroSelecionado] = useState(null);
  const [clienteInfo, setClienteInfo] = useState({ nome: '', telefone: '', email: '' });
  const [unidadeOriginal, setUnidadeOriginal] = useState('cm');
  const [totais, setTotais] = useState({ areaTotalRealM2: 0, areaTotalCobrancaM2: 0 });
  const [orcamentoSalvo, setOrcamentoSalvo] = useState(false);
  const [carrinho, setCarrinho] = useState([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [acessoriosSelecionados, setAcessoriosSelecionados] = useState([]);

  // Queries
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => entities.Categoria.filter({ ativo: true }, 'ordem')
  });

  const { data: tipologias = [] } = useQuery({
    queryKey: ['tipologias'],
    queryFn: () => entities.Tipologia.filter({ ativo: true }, 'ordem')
  });

  // Configurações Técnicas (não são produtos comercializáveis)
  const { data: tiposVidroTecnicos = [] } = useQuery({
    queryKey: ['tiposVidroTecnicos'],
    queryFn: () => entities.TipoVidroTecnico.filter({ ativo: true }, 'ordem')
  });

  const { data: puxadoresTecnicos = [] } = useQuery({
    queryKey: ['puxadoresTecnicos'],
    queryFn: () => entities.PuxadorTecnico.filter({ ativo: true }, 'nome')
  });

  // Produtos Comerciais (itens vendáveis)
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => entities.Produto.filter({ ativo: true }, 'ordem')
  });

  // Compatibilidade: manter queries antigas durante migração
  const { data: tiposVidro = [] } = useQuery({
    queryKey: ['tiposVidro'],
    queryFn: () => entities.TipoVidro.filter({ ativo: true }, 'ordem')
  });

  const { data: puxadores = [] } = useQuery({
    queryKey: ['puxadores'],
    queryFn: () => entities.Puxador.filter({ ativo: true })
  });

  const { data: acessorios = [] } = useQuery({
    queryKey: ['acessorios'],
    queryFn: () => entities.Acessorio.filter({ ativo: true }, 'ordem')
  });

  // Filtrar tipos de vidro baseado na tipologia selecionada
  const tiposVidroDisponiveis = useMemo(() => {
    const todosTipos = tiposVidroTecnicos.length > 0 ? tiposVidroTecnicos : tiposVidro;
    
    // Se a tipologia tem tipos_vidro_ids definidos, filtrar por eles
    if (tipologiaSelecionada?.tipos_vidro_ids && tipologiaSelecionada.tipos_vidro_ids.length > 0) {
      return todosTipos.filter(tipo => tipologiaSelecionada.tipos_vidro_ids.includes(tipo.id));
    }
    
    // Caso contrário, mostrar todos
    return todosTipos;
  }, [tipologiaSelecionada, tiposVidroTecnicos, tiposVidro]);
  const puxadoresDisponiveis = puxadoresTecnicos.length > 0 ? puxadoresTecnicos : puxadores;
  // Acessórios: usar produtos comerciais da categoria 'acessorio' se disponíveis, senão usar os antigos
  const acessoriosDisponiveis = produtos.filter(p => p.categoria === 'acessorio').length > 0 
    ? produtos.filter(p => p.categoria === 'acessorio')
    : acessorios;

  // Buscar ferragens técnicas para configurações
  const { data: ferragensTecnicas = [] } = useQuery({
    queryKey: ['ferragensTecnicas'],
    queryFn: () => entities.FerragemTecnica.filter({ ativo: true }, 'nome')
  });

  // Organizar itens de configuração por categoria
  const itensConfiguracao = useMemo(() => {
    return {
      puxador_tecnico: puxadoresDisponiveis,
      ferragem_tecnica: ferragensTecnicas
    };
  }, [puxadoresDisponiveis, ferragensTecnicas]);

  // Company data
  const company = mockCompany;
  const primaryColor = company?.primary_color || localStorage.getItem('company_primary_color') || '#1e88e5';

  // Cache company colors
  React.useEffect(() => {
    if (company?.primary_color) {
      localStorage.setItem('company_primary_color', company.primary_color);
    }
  }, [company?.primary_color]);

  // Tipologias filtradas por categoria
  const tipologiasFiltradas = useMemo(() => {
    if (!categoriaSelecionada) return tipologias;
    return tipologias.filter(t => 
      t.categoria_id === categoriaSelecionada.id
    );
  }, [tipologias, categoriaSelecionada]);

  // Mutation para salvar orçamento
  const salvarMutation = useMutation({
    mutationFn: (data) => entities.Orcamento.create(data),
    onSuccess: () => {
      setOrcamentoSalvo(true);
    }
  });

  const selecionarTipologia = (tipologia) => {
    setTipologiaSelecionada(tipologia);
    const vars = tipologia.variaveis?.map(v => ({
      ...v,
      valor: '',
      unidade: v.unidade_padrao || 'cm'
    })) || [];
    setVariaveisPreenchidas(vars);
    setAcessoriosSelecionados([]);
  };

  // Acessórios disponíveis para a tipologia (usando produtos comerciais)
  const acessoriosDisponiveisTipologia = useMemo(() => {
    if (!tipologiaSelecionada?.acessorio_ids) return [];
    // Se estiver usando produtos, filtrar por IDs de produtos
    // Caso contrário, usar os IDs antigos de acessórios
    return acessoriosDisponiveis.filter(a => tipologiaSelecionada.acessorio_ids.includes(a.id));
  }, [tipologiaSelecionada, acessoriosDisponiveis]);

  const toggleAcessorio = (acessorio) => {
    const existe = acessoriosSelecionados.find(a => a.acessorio_id === acessorio.id);
    if (existe) {
      setAcessoriosSelecionados(acessoriosSelecionados.filter(a => a.acessorio_id !== acessorio.id));
    } else {
      setAcessoriosSelecionados([...acessoriosSelecionados, {
        acessorio_id: acessorio.id,
        acessorio_nome: acessorio.nome,
        quantidade: 1,
        preco_unitario: acessorio.preco || 0,
        preco_total: acessorio.preco || 0
      }]);
    }
  };

  const atualizarQuantidadeAcessorio = (acessorioId, quantidade) => {
    setAcessoriosSelecionados(acessoriosSelecionados.map(a => 
      a.acessorio_id === acessorioId 
        ? { ...a, quantidade, preco_total: a.preco_unitario * quantidade }
        : a
    ));
  };

  const precoAcessorios = useMemo(() => {
    return acessoriosSelecionados.reduce((sum, a) => sum + a.preco_total, 0);
  }, [acessoriosSelecionados]);

  const atualizarVariavel = (index, { valor, unidade }) => {
    const novasVars = [...variaveisPreenchidas];
    novasVars[index] = { ...novasVars[index], valor, unidade };
    setVariaveisPreenchidas(novasVars);
    if (valor !== '') {
      setUnidadeOriginal(unidade);
    }
  };

  const executarCalculo = () => {
    if (!tipologiaSelecionada) return;
    
    const resultado = calcularPecas(tipologiaSelecionada, variaveisPreenchidas);
    setPecasCalculadas(resultado.pecas);
    setTotais({
      areaTotalRealM2: resultado.areaTotalRealM2,
      areaTotalCobrancaM2: resultado.areaTotalCobrancaM2
    });
    setPecaConferenciaAtual(0);
    setEtapaAtual(3);
  };

  const confirmarPeca = (index) => {
    const novasPecas = [...pecasCalculadas];
    novasPecas[index] = { ...novasPecas[index], conferido: true };
    setPecasCalculadas(novasPecas);
    
    if (index < pecasCalculadas.length - 1) {
      setPecaConferenciaAtual(index + 1);
    } else {
      // Só vai para etapa de acessórios se houver pelo menos 1 acessório disponível
      if (acessoriosDisponiveisTipologia.length > 0) {
        setEtapaAtual(4);
      } else {
        // Pula direto para finalização se não houver acessórios
        setEtapaAtual(5);
      }
    }
  };

  const adicionarAoCarrinho = () => {
    // Validar se todos os dados necessários estão presentes
    if (!tipologiaSelecionada || !tipoVidroSelecionado || pecasCalculadas.length === 0) {
      console.error('Dados incompletos para adicionar ao carrinho');
      return;
    }

    const precoVidro = calcularPreco(totais.areaTotalCobrancaM2, tipoVidroSelecionado.preco_m2);
    const itemCarrinho = {
      id: Date.now(),
      tipologia_id: tipologiaSelecionada.id,
      tipologia_nome: tipologiaSelecionada.nome,
      tipo_vidro_id: tipoVidroSelecionado.id,
      tipo_vidro_nome: tipoVidroSelecionado.nome,
      tipo_vidro_cor: tipoVidroSelecionado.cor,
      variaveis_entrada: variaveisPreenchidas.map(v => ({
        nome: v.nome,
        label: v.label,
        valor: v.valor,
        unidade: v.unidade
      })),
      pecas_calculadas: pecasCalculadas.map(p => ({ ...p })),
      acessorios_selecionados: acessoriosSelecionados.map(a => ({ ...a })),
      area_total_real_m2: totais.areaTotalRealM2,
      area_total_cobranca_m2: totais.areaTotalCobrancaM2,
      preco_m2: tipoVidroSelecionado.preco_m2,
      preco_vidro: precoVidro,
      preco_acessorios: precoAcessorios,
      preco_total_item: precoVidro + precoAcessorios
    };
    
    setCarrinho([...carrinho, itemCarrinho]);
    
    // Resetar para adicionar novo item
    setCategoriaSelecionada(null);
    setTipologiaSelecionada(null);
    setVariaveisPreenchidas([]);
    setPecasCalculadas([]);
    setTipoVidroSelecionado(null);
    setAcessoriosSelecionados([]);
    setMostrarCarrinho(false);
    setEtapaAtual(1);
  };

  const removerDoCarrinho = (itemId) => {
    setCarrinho(carrinho.filter(item => item.id !== itemId));
  };

  const irParaFinalizacao = () => {
    // Validar se todos os dados necessários estão presentes
    if (!tipologiaSelecionada || !tipoVidroSelecionado || pecasCalculadas.length === 0) {
      console.error('Dados incompletos para adicionar ao carrinho');
      return;
    }

    // Verificar se o item já está no carrinho (evitar duplicatas)
    const itemJaExiste = carrinho.some(item => 
      item.tipologia_id === tipologiaSelecionada.id &&
      item.tipo_vidro_id === tipoVidroSelecionado.id &&
      JSON.stringify(item.variaveis_entrada) === JSON.stringify(variaveisPreenchidas.map(v => ({
        nome: v.nome,
        label: v.label,
        valor: v.valor,
        unidade: v.unidade
      })))
    );

    // Se o item já existe, apenas ir para finalização
    if (itemJaExiste) {
      setEtapaAtual(5);
      return;
    }

    // Adicionar item atual ao carrinho antes de ir para finalização
    const precoVidro = calcularPreco(totais.areaTotalCobrancaM2, tipoVidroSelecionado.preco_m2);
    const itemCarrinho = {
      id: Date.now(),
      tipologia_id: tipologiaSelecionada.id,
      tipologia_nome: tipologiaSelecionada.nome,
      tipo_vidro_id: tipoVidroSelecionado.id,
      tipo_vidro_nome: tipoVidroSelecionado.nome,
      tipo_vidro_cor: tipoVidroSelecionado.cor,
      variaveis_entrada: variaveisPreenchidas.map(v => ({
        nome: v.nome,
        label: v.label,
        valor: v.valor,
        unidade: v.unidade
      })),
      pecas_calculadas: pecasCalculadas.map(p => ({ ...p })),
      acessorios_selecionados: acessoriosSelecionados.map(a => ({ ...a })),
      area_total_real_m2: totais.areaTotalRealM2,
      area_total_cobranca_m2: totais.areaTotalCobrancaM2,
      preco_m2: tipoVidroSelecionado.preco_m2,
      preco_vidro: precoVidro,
      preco_acessorios: precoAcessorios,
      preco_total_item: precoVidro + precoAcessorios
    };
    
    setCarrinho([...carrinho, itemCarrinho]);
    setMostrarCarrinho(false);
    setEtapaAtual(5);
  };

  const atualizarPuxadorPeca = (index, puxador) => {
    const novasPecas = [...pecasCalculadas];
    novasPecas[index] = { ...novasPecas[index], puxador };
    setPecasCalculadas(novasPecas);
  };

  // Atualizar configuração técnica de uma peça
  const atualizarConfiguracaoTecnicaPeca = (pecaIndex, configIndex, valor) => {
    const novasPecas = [...pecasCalculadas];
    const peca = novasPecas[pecaIndex];
    
    if (!peca.configuracoes_tecnicas) {
      peca.configuracoes_tecnicas = [];
    }
    
    if (!peca.configuracoes_tecnicas[configIndex]) {
      peca.configuracoes_tecnicas[configIndex] = { valor: '' };
    }
    
    peca.configuracoes_tecnicas[configIndex] = {
      ...peca.configuracoes_tecnicas[configIndex],
      valor
    };
    
    setPecasCalculadas(novasPecas);
  };

  // Obter configurações técnicas da peça da tipologia
  const obterConfiguracoesTecnicasPeca = (pecaCalculada) => {
    if (!tipologiaSelecionada) return [];
    
    // Encontrar a peça correspondente na tipologia
    const pecaTipologia = tipologiaSelecionada.pecas?.find(
      p => p.nome === pecaCalculada.nome
    );
    
    return pecaTipologia?.configuracoes_tecnicas || [];
  };

  const precoFinal = useMemo(() => {
    if (!tipoVidroSelecionado) return 0;
    const precoVidro = calcularPreco(totais.areaTotalCobrancaM2, tipoVidroSelecionado.preco_m2);
    return precoVidro + precoAcessorios;
  }, [totais.areaTotalCobrancaM2, tipoVidroSelecionado, precoAcessorios]);

  const salvarOrcamento = () => {
    const precoTotal = carrinho.reduce((sum, item) => sum + item.preco_total_item, 0);
    
    const dadosOrcamento = {
      numero: `ORC-${Date.now().toString().slice(-8)}`,
      cliente_nome: clienteInfo.nome,
      cliente_telefone: clienteInfo.telefone,
      cliente_email: clienteInfo.email,
      itens: carrinho,
      preco_total: precoTotal,
      status: 'aguardando_aprovacao'
    };
    
    salvarMutation.mutate(dadosOrcamento);
  };

  const podeAvancar = () => {
    switch (etapaAtual) {
      case 1: return !!categoriaSelecionada;
      case 2: return tipologiaSelecionada && variaveisPreenchidas.every(v => v.valor !== '' && v.valor !== null) && !!tipoVidroSelecionado;
      case 3: return pecasCalculadas.every(p => p.conferido);
      case 4: return true; // Acessórios são opcionais
      case 5: return carrinho.length > 0 && clienteInfo.nome && clienteInfo.telefone;
      default: return false;
    }
  };

  const precoTotalCarrinho = useMemo(() => {
    return carrinho.reduce((sum, item) => sum + item.preco_total_item, 0);
  }, [carrinho]);

  const reiniciar = () => {
    setEtapaAtual(1);
    setCategoriaSelecionada(null);
    setTipologiaSelecionada(null);
    setVariaveisPreenchidas([]);
    setPecasCalculadas([]);
    setTipoVidroSelecionado(null);
    setAcessoriosSelecionados([]);
    setClienteInfo({ nome: '', telefone: '', email: '' });
    setCarrinho([]);
    setMostrarCarrinho(false);
    setOrcamentoSalvo(false);
  };

  if (orcamentoSalvo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
        {/* Header - Mesmo padrão da Home */}
        <header 
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-2.5">
            {company?.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-9 h-9 rounded-lg bg-white p-1 object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                <span className="font-bold text-lg" style={{ color: primaryColor }}>
                  {company?.name?.charAt(0) || 'V'}
                </span>
              </div>
            )}
            <h1 className="text-white font-semibold">
              {company?.name || 'Orçamentos'}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button 
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </header>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-57px)] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Orçamento Enviado!</h2>
                <p className="text-slate-600 mb-6">
                  Recebemos seu orçamento com sucesso. Entraremos em contato em breve através do telefone informado.
                </p>
                <Button onClick={reiniciar} className="w-full" style={{ backgroundColor: primaryColor }}>
                  Fazer Novo Orçamento
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      {/* Header - Mesmo padrão da Home */}
      <header 
        className="px-5 py-3.5 flex items-center justify-between sticky top-0 z-30"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2.5">
          {company?.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="w-9 h-9 rounded-lg bg-white p-1 object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
              <span className="font-bold text-lg" style={{ color: primaryColor }}>
                {company?.name?.charAt(0) || 'V'}
              </span>
            </div>
          )}
          <h1 className="text-white font-semibold">
            {company?.name || 'Orçamentos'}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button 
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => carrinho.length > 0 && setEtapaAtual(5)}
            disabled={carrinho.length === 0}
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {carrinho.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white/20"></span>
            )}
          </button>
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Progress Steps - Abaixo do header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[57px] z-20">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {ETAPAS.map((etapa, i) => (
              <React.Fragment key={etapa.id}>
                <div 
                  className={`flex items-center gap-2 ${
                    etapaAtual >= etapa.id ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    etapaAtual > etapa.id 
                      ? 'bg-blue-600 text-white' 
                      : etapaAtual === etapa.id
                      ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {etapaAtual > etapa.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <etapa.icone className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{etapa.nome}</span>
                </div>
                {i < ETAPAS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    etapaAtual > etapa.id ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* Botão Voltar */}
        {etapaAtual === 1 ? (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-5 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Home</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (mostrarCarrinho) {
                setMostrarCarrinho(false);
              } else {
                setEtapaAtual(etapaAtual - 1);
              }
            }}
            className="flex items-center gap-2 mb-5 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        )}
        
        <AnimatePresence mode="wait">
          {/* Etapa 1: Categorias */}
          {etapaAtual === 1 && (
            <motion.div
              key="categorias"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Selecione a Categoria</h2>
                <p className="text-slate-500 mt-1">Escolha o tipo de produto para seu orçamento</p>
              </div>
              
              {categorias.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">Nenhuma categoria disponível</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {categorias.map((cat, i) => (
                    <CategoriaCard
                      key={cat.id}
                      categoria={cat}
                      onClick={() => {
                        setCategoriaSelecionada(cat);
                        setEtapaAtual(2);
                      }}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Etapa 2: Tipologia + Variáveis */}
          {etapaAtual === 2 && (
            <motion.div
              key="tipologia-variaveis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {!tipologiaSelecionada ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {categoriaSelecionada?.nome || 'Tipologias'}
                    </h2>
                    <p className="text-slate-500 mt-1">Escolha o modelo específico</p>
                  </div>
                  
                  {tipologiasFiltradas.length === 0 ? (
                    <Card className="text-center py-12">
                      <CardContent>
                        <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500">Nenhuma tipologia disponível</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                      {tipologiasFiltradas.map((tip, i) => (
                        <TipologiaCard
                          key={tip.id}
                          tipologia={tip}
                          onClick={() => selecionarTipologia(tip)}
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Card className="mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm">
                          {tipologiaSelecionada.imagens?.[0] ? (
                            <img 
                              src={tipologiaSelecionada.imagens[0]} 
                              alt={tipologiaSelecionada.nome}
                              className="max-w-full max-h-full object-contain rounded"
                            />
                          ) : (
                            <Layers className="w-7 h-7 text-blue-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="text-base font-bold text-slate-900 truncate">
                              {tipologiaSelecionada.nome}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTipologiaSelecionada(null);
                                setVariaveisPreenchidas([]);
                                setTipoVidroSelecionado(null);
                              }}
                              className="text-slate-500 h-7 px-2 text-xs flex-shrink-0"
                            >
                              Alterar
                            </Button>
                          </div>
                          <p className="text-xs text-slate-600 mb-1.5 line-clamp-1">
                            {tipologiaSelecionada.descricao}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Square className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700">
                              {tipologiaSelecionada.pecas?.length || 0} peça{tipologiaSelecionada.pecas?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Medidas e Tipo de Vidro</h2>
                    <p className="text-slate-500 mt-1">Preencha as variáveis e selecione o vidro</p>
                  </div>
              
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg">Variáveis de Entrada</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4">
                        {variaveisPreenchidas.map((variavel, index) => (
                          <InputComUnidade
                            key={variavel.id || index}
                            label={variavel.label || variavel.nome}
                            nome={variavel.nome}
                            valor={variavel.valor}
                            unidade={variavel.unidade}
                            unidadePadrao={variavel.unidade_padrao}
                            permiteAlterarUnidade={variavel.permite_alterar_unidade !== false}
                            onChange={(data) => atualizarVariavel(index, data)}
                          />
                        ))}
                      </CardContent>
                    </Card>

                    {variaveisPreenchidas.every(v => v.valor !== '' && v.valor !== null) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Tipo de Vidro</CardTitle>
                          <p className="text-sm text-slate-500 mt-1">
                            Selecione a cor e veja o preço final estimado
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {tiposVidroDisponiveis.map((tipo) => {
                            const resultadoTemp = calcularPecas(tipologiaSelecionada, variaveisPreenchidas);
                            const precoEstimado = calcularPreco(resultadoTemp.areaTotalCobrancaM2, tipo.preco_m2 || 0);
                            
                            return (
                              <div
                                key={tipo.id}
                                onClick={() => setTipoVidroSelecionado(tipo)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  tipoVidroSelecionado?.id === tipo.id
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div 
                                      className="w-12 h-12 sm:w-10 sm:h-10 rounded-lg border-2 border-white shadow-sm flex-shrink-0"
                                      style={{ backgroundColor: tipo.cor || '#e2e8f0' }}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-slate-900 text-sm sm:text-base truncate">{tipo.nome}</p>
                                      <p className="text-xs text-slate-500 mt-0.5">{tipo.codigo}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-col sm:items-end sm:gap-1 flex-shrink-0">
                                    <div className="text-left sm:text-right">
                                      <p className="text-base sm:text-lg font-bold text-slate-900">
                                        R$ {precoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </p>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {resultadoTemp.areaTotalCobrancaM2.toFixed(2)} m²
                                      </p>
                                    </div>
                                    {tipoVidroSelecionado?.id === tipo.id && (
                                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 sm:hidden">
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      onClick={executarCalculo}
                      disabled={!podeAvancar()}
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-medium"
                    >
                      Calcular Peças e Continuar
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Etapa 3: Conferência */}
          {etapaAtual === 3 && !mostrarCarrinho && (
            <motion.div
              key="conferencia"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Conferência das Peças</h2>
                <p className="text-slate-500 mt-1">Verifique as medidas de cada peça</p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                {pecasCalculadas.length > 0 && (
                  <PecaConferencia
                    peca={pecasCalculadas[pecaConferenciaAtual]}
                    unidadeOriginal={unidadeOriginal}
                    onConfirmar={() => confirmarPeca(pecaConferenciaAtual)}
                    confirmada={pecasCalculadas[pecaConferenciaAtual]?.conferido}
                    index={pecaConferenciaAtual}
                    total={pecasCalculadas.length}
                    puxadores={puxadoresDisponiveis}
                    onPuxadorChange={(puxador) => atualizarPuxadorPeca(pecaConferenciaAtual, puxador)}
                    configuracoesTecnicas={obterConfiguracoesTecnicasPeca(pecasCalculadas[pecaConferenciaAtual])}
                    itensConfiguracao={itensConfiguracao}
                    onConfiguracaoChange={(configIndex, valor) => 
                      atualizarConfiguracaoTecnicaPeca(pecaConferenciaAtual, configIndex, valor)
                    }
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Etapa 4: Acessórios - Só mostra se houver acessórios disponíveis */}
          {etapaAtual === 4 && acessoriosDisponiveisTipologia.length > 0 && (
            <motion.div
              key="acessorios"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              {/* Header - Mobile Optimized */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl mb-2 sm:mb-3 shadow-lg">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Adicionar Acessórios?</h2>
                <p className="text-slate-600 text-sm sm:text-base px-4">
                  Complemente seu pedido com acessórios (opcional)
                </p>
              </div>

              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Coluna Esquerda: Resumo do Item - Mobile First */}
                <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
                  <Card className="lg:sticky lg:top-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4 opacity-90">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm font-medium">Seu Pedido</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="font-bold text-lg sm:text-xl mb-1">{tipologiaSelecionada?.nome}</p>
                          <p className="text-blue-100 text-xs sm:text-sm">{tipoVidroSelecionado?.nome}</p>
                        </div>
                        
                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm opacity-90 pt-3 border-t border-white/20">
                          <div className="flex items-center gap-1">
                            <Ruler className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{totais.areaTotalCobrancaM2?.toFixed(2)} m²</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{pecasCalculadas.length} peças</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-blue-100 text-xs sm:text-sm">Vidro</span>
                            <span className="font-semibold text-sm sm:text-base">
                              R$ {calcularPreco(totais.areaTotalCobrancaM2, tipoVidroSelecionado?.preco_m2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          
                          {acessoriosSelecionados.length > 0 && (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-blue-100 text-xs sm:text-sm">
                                  Acessórios ({acessoriosSelecionados.length})
                                </span>
                                <span className="font-semibold text-sm sm:text-base">
                                  R$ {precoAcessorios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="h-px bg-white/30 my-3" />
                            </>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-base sm:text-lg">Total</span>
                            <span className="font-bold text-xl sm:text-2xl">
                              R$ {precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Botões de Ação - Mobile Optimized */}
                  <div className="space-y-3">
                    <Button
                      onClick={irParaFinalizacao}
                      disabled={!podeAvancar()}
                      className="w-full h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                      size="lg"
                    >
                      Continuar para Finalização
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </Button>
                    <Button
                      onClick={adicionarAoCarrinho}
                      disabled={!podeAvancar()}
                      variant="outline"
                      className="w-full h-11 sm:h-12 text-sm sm:text-base border-2"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Adicionar Mais Itens
                    </Button>
                  </div>
                </div>

                {/* Coluna Direita: Lista de Acessórios - Mobile First */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                  {acessoriosDisponiveisTipologia.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                          Acessórios Disponíveis
                        </h3>
                        {acessoriosSelecionados.length > 0 && (
                          <span className="text-xs sm:text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium self-start sm:self-auto">
                            {acessoriosSelecionados.length} selecionado(s)
                          </span>
                        )}
                      </div>

                      <div className="grid gap-3 sm:gap-4">
                        {acessoriosDisponiveisTipologia.map((acessorio) => {
                          const selecionado = acessoriosSelecionados.find(a => a.acessorio_id === acessorio.id);
                          
                          return (
                            <motion.div
                              key={acessorio.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Card
                                className={`cursor-pointer transition-all ${
                                  selecionado
                                    ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-50/50'
                                    : 'border-2 border-slate-200 hover:border-blue-300 hover:shadow-md'
                                }`}
                                onClick={() => !selecionado && toggleAcessorio(acessorio)}
                              >
                                <CardContent className="p-4 sm:p-5">
                                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                    {/* Checkbox e Info - Mobile Stacked */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start gap-3 mb-2">
                                        <div className="pt-0.5 flex-shrink-0">
                                          <input
                                            type="checkbox"
                                            checked={!!selecionado}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              toggleAcessorio(acessorio);
                                            }}
                                            className="w-5 h-5 sm:w-5 sm:h-5 rounded-md border-slate-300 text-blue-600 cursor-pointer focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-slate-900 text-base sm:text-lg mb-1">
                                            {acessorio.nome}
                                          </p>
                                          {acessorio.descricao && (
                                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                              {acessorio.descricao}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Controle de Quantidade - Mobile Optimized */}
                                      {selecionado && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          className="ml-8 sm:ml-8 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200"
                                        >
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                            <Label className="text-xs sm:text-sm font-medium text-slate-700">
                                              Quantidade:
                                            </Label>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (selecionado.quantidade > 1) {
                                                    atualizarQuantidadeAcessorio(acessorio.id, selecionado.quantidade - 1);
                                                  }
                                                }}
                                              >
                                                -
                                              </Button>
                                              <Input
                                                type="number"
                                                min="1"
                                                value={selecionado.quantidade}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  atualizarQuantidadeAcessorio(acessorio.id, parseInt(e.target.value) || 1);
                                                }}
                                                className="w-20 sm:w-20 h-10 sm:h-9 text-center font-semibold"
                                                onClick={(e) => e.stopPropagation()}
                                              />
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  atualizarQuantidadeAcessorio(acessorio.id, selecionado.quantidade + 1);
                                                }}
                                              >
                                                +
                                              </Button>
                                            </div>
                                            <span className="text-xs sm:text-sm text-slate-600 font-medium">
                                              = <span className="text-green-600 font-bold">
                                                R$ {selecionado.preco_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                              </span>
                                            </span>
                                          </div>
                                        </motion.div>
                                      )}
                                    </div>

                                    {/* Preço - Mobile Optimized */}
                                    <div className="text-left sm:text-right flex-shrink-0 sm:self-start">
                                      <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5 sm:mb-1">
                                        R$ {(acessorio.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </p>
                                      <p className="text-xs text-slate-500 font-medium">
                                        por {acessorio.unidade || 'unidade'}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <Card className="text-center py-12 sm:py-16 border-2 border-dashed border-slate-300">
                      <CardContent className="p-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                        </div>
                        <p className="text-slate-600 text-base sm:text-lg font-medium mb-1">
                          Nenhum acessório disponível
                        </p>
                        <p className="text-slate-500 text-xs sm:text-sm px-4">
                          Esta tipologia não possui acessórios configurados
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Etapa 5: Finalizar - Carrinho e Dados */}
          {etapaAtual === 5 && (
            <motion.div
              key="finalizar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Finalizar Orçamento</h2>
                <p className="text-slate-500 mt-1">Revise os itens e informe seus dados</p>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Coluna Esquerda: Carrinho */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Itens do Orçamento ({carrinho.length})
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEtapaAtual(1);
                          setMostrarCarrinho(false);
                        }}
                        className="text-blue-600"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {carrinho.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                          <p>Nenhum item no carrinho</p>
                        </div>
                      ) : (
                        carrinho.map((item, idx) => (
                          <div key={item.id} className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                                    #{idx + 1}
                                  </span>
                                  <h4 className="font-semibold text-slate-900">{item.tipologia_nome}</h4>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div 
                                    className="w-4 h-4 rounded border"
                                    style={{ backgroundColor: item.tipo_vidro_cor || '#e2e8f0' }}
                                  />
                                  <p className="text-sm text-slate-600">{item.tipo_vidro_nome}</p>
                                </div>
                                <p className="text-xs text-slate-500">
                                  {item.pecas_calculadas.length} peças • {item.area_total_cobranca_m2?.toFixed(2)} m²
                                  {item.acessorios_selecionados?.length > 0 && (
                                    <> • {item.acessorios_selecionados.length} acessórios</>
                                  )}
                                </p>
                                </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-slate-900">
                                  R$ {item.preco_total_item.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removerDoCarrinho(item.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 mt-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Coluna Direita: Total e Dados */}
                <div className="space-y-4">
                  {/* Total */}
                  <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                    <CardContent className="p-6">
                      <p className="text-blue-100 text-sm mb-1">Total do Orçamento</p>
                      <p className="text-4xl font-bold mb-2">
                        R$ {precoTotalCarrinho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-blue-100">
                        {carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Dados do Cliente */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Seus Dados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Nome *</Label>
                        <Input
                          value={clienteInfo.nome}
                          onChange={(e) => setClienteInfo({...clienteInfo, nome: e.target.value})}
                          placeholder="Seu nome completo"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Telefone *</Label>
                        <Input
                          value={clienteInfo.telefone}
                          onChange={(e) => setClienteInfo({...clienteInfo, telefone: e.target.value})}
                          placeholder="(00) 00000-0000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>E-mail (opcional)</Label>
                        <Input
                          value={clienteInfo.email}
                          onChange={(e) => setClienteInfo({...clienteInfo, email: e.target.value})}
                          placeholder="email@exemplo.com"
                          type="email"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={salvarOrcamento}
                    disabled={!podeAvancar() || salvarMutation.isPending}
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-medium"
                  >
                    {salvarMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Enviar Orçamento
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}