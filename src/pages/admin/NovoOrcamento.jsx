import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { entities } from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2,
  Calculator,
  Layers,
  ClipboardList,
  CreditCard,
  Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoriaCard from "@/components/orcamento/CategoriaCard";
import TipologiaCard from "@/components/orcamento/TipologiaCard";
import InputComUnidade from "@/components/orcamento/InputComUnidade";
import PecaConferencia from "@/components/orcamento/PecaConferencia";
import { calcularPecas, calcularPreco, formatarMedida } from "@/components/utils/calculoUtils";

const ETAPAS = [
  { id: 1, nome: "Categoria", icone: Layers },
  { id: 2, nome: "Tipologia + Variáveis", icone: Calculator },
  { id: 3, nome: "Conferência", icone: Check },
  { id: 4, nome: "Resumo/Preço", icone: CreditCard },
  { id: 5, nome: "Pagamento", icone: CreditCard }
];

export default function NovoOrcamento() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [tipologiaSelecionada, setTipologiaSelecionada] = useState(null);
  const [variaveisPreenchidas, setVariaveisPreenchidas] = useState([]);
  const [pecasCalculadas, setPecasCalculadas] = useState([]);
  const [pecaConferenciaAtual, setPecaConferenciaAtual] = useState(0);
  const [tipoVidroSelecionado, setTipoVidroSelecionado] = useState(null);
  const [puxadorSelecionado, setPuxadorSelecionado] = useState(null);
  const [clienteInfo, setClienteInfo] = useState({ nome: '', telefone: '', email: '' });
  const [unidadeOriginal, setUnidadeOriginal] = useState('cm');
  const [totais, setTotais] = useState({ areaTotalRealM2: 0, areaTotalCobrancaM2: 0 });

  // Queries
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => entities.Categoria.filter({ ativo: true }, 'ordem')
  });

  const { data: tipologias = [] } = useQuery({
    queryKey: ['tipologias'],
    queryFn: () => entities.Tipologia.filter({ ativo: true }, 'ordem')
  });

  // Configurações Técnicas
  const { data: tiposVidroTecnicos = [] } = useQuery({
    queryKey: ['tiposVidroTecnicos'],
    queryFn: () => entities.TipoVidroTecnico.filter({ ativo: true }, 'ordem')
  });

  const { data: puxadoresTecnicos = [] } = useQuery({
    queryKey: ['puxadoresTecnicos'],
    queryFn: () => entities.PuxadorTecnico.filter({ ativo: true }, 'nome')
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
    onSuccess: (result) => {
      queryClient.invalidateQueries(['orcamentos']);
      navigate(`/admin/dashboard`);
    }
  });

  // Inicializar variáveis quando tipologia é selecionada
  const selecionarTipologia = (tipologia) => {
    setTipologiaSelecionada(tipologia);
    const vars = tipologia.variaveis?.map(v => ({
      ...v,
      valor: '',
      unidade: v.unidade_padrao || 'cm'
    })) || [];
    setVariaveisPreenchidas(vars);
    // Não avança mais para etapa 3, permanece na etapa 2
  };

  // Atualizar variável
  const atualizarVariavel = (index, { valor, unidade }) => {
    const novasVars = [...variaveisPreenchidas];
    novasVars[index] = { ...novasVars[index], valor, unidade };
    setVariaveisPreenchidas(novasVars);
    // Guardar unidade para exibição
    if (valor !== '') {
      setUnidadeOriginal(unidade);
    }
  };

  // Calcular peças
  const executarCalculo = () => {
    if (!tipologiaSelecionada) return;
    
    const resultado = calcularPecas(tipologiaSelecionada, variaveisPreenchidas);
    setPecasCalculadas(resultado.pecas);
    setTotais({
      areaTotalRealM2: resultado.areaTotalRealM2,
      areaTotalCobrancaM2: resultado.areaTotalCobrancaM2
    });
    setPecaConferenciaAtual(0);
    setEtapaAtual(3); // Nova etapa 3 (antiga etapa 4)
  };

  // Confirmar peça
  const confirmarPeca = (index) => {
    const novasPecas = [...pecasCalculadas];
    novasPecas[index] = { ...novasPecas[index], conferido: true };
    setPecasCalculadas(novasPecas);
    
    if (index < pecasCalculadas.length - 1) {
      setPecaConferenciaAtual(index + 1);
    } else {
      setEtapaAtual(4); // Nova etapa 4 (antiga etapa 5)
    }
  };

  // Atualizar puxador da peça
  const atualizarPuxadorPeca = (index, puxador) => {
    const novasPecas = [...pecasCalculadas];
    novasPecas[index] = { ...novasPecas[index], puxador };
    setPecasCalculadas(novasPecas);
  };

  // Calcular preço final
  const precoFinal = useMemo(() => {
    if (!tipoVidroSelecionado) return 0;
    return calcularPreco(totais.areaTotalCobrancaM2, tipoVidroSelecionado.preco_m2);
  }, [totais.areaTotalCobrancaM2, tipoVidroSelecionado]);

  // Salvar orçamento
  const salvarOrcamento = () => {
    const dadosOrcamento = {
      numero: `ORC-${Date.now().toString().slice(-8)}`,
      cliente_nome: clienteInfo.nome,
      cliente_telefone: clienteInfo.telefone,
      cliente_email: clienteInfo.email,
      tipologia_id: tipologiaSelecionada.id,
      tipologia_nome: tipologiaSelecionada.nome,
      tipo_vidro_id: tipoVidroSelecionado?.id,
      tipo_vidro_nome: tipoVidroSelecionado?.nome,
      variaveis_entrada: variaveisPreenchidas.map(v => ({
        nome: v.nome,
        label: v.label,
        valor: v.valor,
        unidade: v.unidade
      })),
      pecas_calculadas: pecasCalculadas,
      area_total_real_m2: totais.areaTotalRealM2,
      area_total_cobranca_m2: totais.areaTotalCobrancaM2,
      preco_m2: tipoVidroSelecionado?.preco_m2,
      preco_total: precoFinal,
      status: 'aguardando_aprovacao'
    };
    
    salvarMutation.mutate(dadosOrcamento);
  };

  // Validações
  const podeAvancar = () => {
    switch (etapaAtual) {
      case 1: return !!categoriaSelecionada;
      case 2: return tipologiaSelecionada && variaveisPreenchidas.every(v => v.valor !== '' && v.valor !== null) && !!tipoVidroSelecionado;
      case 3: return pecasCalculadas.every(p => p.conferido);
      case 4: return !!tipoVidroSelecionado;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header com Progress */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => etapaAtual > 1 ? setEtapaAtual(etapaAtual - 1) : navigate("/admin/dashboard")}
              className="text-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-lg font-semibold text-slate-900">Novo Orçamento</h1>
            <div className="w-20" />
          </div>
          
          {/* Progress Steps */}
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
                        ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {etapaAtual > etapa.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      etapa.id
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{etapa.nome}</span>
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
      <div className="w-full px-4 py-8">
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
                    <p className="text-slate-500">Nenhuma categoria cadastrada</p>
                    <p className="text-sm text-slate-400 mt-1">Configure categorias no menu Configurações</p>
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

          {/* Etapa 2: Tipologia + Variáveis + Seleção de Cor */}
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
                  {/* Seção Superior: Card da Tipologia */}
                  <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-row items-start gap-4">
                        <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-200">
                          {tipologiaSelecionada.imagens?.[0] ? (
                            <img 
                              src={tipologiaSelecionada.imagens[0]} 
                              alt={tipologiaSelecionada.nome}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Layers className="w-12 h-12 text-blue-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-1">
                            {tipologiaSelecionada.nome}
                          </h3>
                          <p className="text-slate-600 text-sm mb-3">
                            {tipologiaSelecionada.descricao}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1 text-blue-700">
                              <Square className="w-4 h-4" />
                              <span className="font-medium">
                                {tipologiaSelecionada.pecas?.length || 0} peças
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-700">
                              <Calculator className="w-4 h-4" />
                              <span className="font-medium">
                                {tipologiaSelecionada.variaveis?.length || 0} variáveis
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTipologiaSelecionada(null);
                            setVariaveisPreenchidas([]);
                            setTipoVidroSelecionado(null);
                          }}
                          className="text-slate-500"
                        >
                          Alterar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Medidas e Tipo de Vidro</h2>
                    <p className="text-slate-500 mt-1">Preencha as variáveis e selecione o vidro</p>
                  </div>
              
                  <div className="space-y-6">
                    {/* Seção Central: Variáveis com Conversão em Tempo Real */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Variáveis de Entrada</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
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

                    {/* Seção Inferior: Seleção de Cor com Preço Final */}
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
                            // Calcula preço estimado baseado nas variáveis atuais
                            const resultadoTemp = calcularPecas(tipologiaSelecionada, variaveisPreenchidas);
                            const precoEstimado = calcularPreco(resultadoTemp.areaTotalCobrancaM2, tipo.preco_m2 || 0);
                            
                            return (
                              <div
                                key={tipo.id}
                                onClick={() => setTipoVidroSelecionado(tipo)}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  tipoVidroSelecionado?.id === tipo.id
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-10 h-10 rounded-lg border-2 border-white shadow-sm"
                                    style={{ backgroundColor: tipo.cor || '#e2e8f0' }}
                                  />
                                  <div>
                                    <p className="font-medium text-slate-900">{tipo.nome}</p>
                                    <p className="text-xs text-slate-500">{tipo.codigo}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-slate-900">
                                    R$ {precoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {resultadoTemp.areaTotalCobrancaM2.toFixed(2)} m²
                                  </p>
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
          {etapaAtual === 3 && (
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
              
              <div className="w-full max-w-2xl mx-auto">
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

          {/* Etapa 4: Resumo/Preço */}
          {etapaAtual === 4 && (
            <motion.div
              key="resumo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Resumo do Orçamento</h2>
                <p className="text-slate-500 mt-1">Selecione o tipo de vidro e finalize</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Resumo das peças */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Peças Calculadas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pecasCalculadas.map((peca, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{peca.nome}</p>
                          <p className="text-sm text-slate-500">
                            {formatarMedida(peca.largura_real_mm, unidadeOriginal)} × {formatarMedida(peca.altura_real_mm, unidadeOriginal)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">{peca.area_cobranca_m2?.toFixed(3)} m²</p>
                          <p className="text-xs text-slate-500">p/ cobrança</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-slate-200 pt-3 mt-4">
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Área Total</span>
                        <span className="text-blue-600">{totais.areaTotalCobrancaM2?.toFixed(3)} m²</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preço final */}
                <div className="space-y-6">
                  {tipoVidroSelecionado && (
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                      <CardContent className="p-6">
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="w-6 h-6 rounded border-2 border-white"
                              style={{ backgroundColor: tipoVidroSelecionado.cor || '#e2e8f0' }}
                            />
                            <span className="text-white font-medium">{tipoVidroSelecionado.nome}</span>
                          </div>
                          <p className="text-blue-100 text-sm">
                            {totais.areaTotalCobrancaM2?.toFixed(2)} m² × R$ {tipoVidroSelecionado.preco_m2?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m²
                          </p>
                        </div>
                        <div className="border-t border-blue-400 pt-3 mt-3">
                          <p className="text-blue-100 text-sm mb-1">Preço Final</p>
                          <p className="text-4xl font-bold">
                            R$ {precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Dados do cliente */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dados do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={clienteInfo.nome}
                          onChange={(e) => setClienteInfo({...clienteInfo, nome: e.target.value})}
                          placeholder="Nome do cliente"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={clienteInfo.telefone}
                          onChange={(e) => setClienteInfo({...clienteInfo, telefone: e.target.value})}
                          placeholder="(00) 00000-0000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>E-mail</Label>
                        <Input
                          value={clienteInfo.email}
                          onChange={(e) => setClienteInfo({...clienteInfo, email: e.target.value})}
                          placeholder="email@exemplo.com"
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
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Finalizar Orçamento
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