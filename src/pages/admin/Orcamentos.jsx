import React, { useState } from "react";
import { Link } from "react-router-dom";
import { entities } from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  Plus,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatarMedida } from "@/components/utils/calculoUtils";

const STATUS_CONFIG = {
  rascunho: { label: "Rascunho", color: "bg-slate-100 text-slate-700", icon: FileText },
  aguardando_aprovacao: { label: "Aguardando Aprovação", color: "bg-amber-100 text-amber-700", icon: Clock },
  aguardando_pagamento: { label: "Aguardando Pagamento", color: "bg-orange-100 text-orange-700", icon: CreditCard },
  em_producao: { label: "Em Produção", color: "bg-blue-100 text-blue-700", icon: Truck },
  aguardando_retirada: { label: "Pronto para Retirada", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  concluido: { label: "Concluído", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: XCircle }
};

export default function Orcamentos() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);

  const { data: orcamentos = [], isLoading } = useQuery({
    queryKey: ['orcamentos'],
    queryFn: () => entities.Orcamento.list('-created_date', 100)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.Orcamento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['orcamentos']);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => entities.Orcamento.update(id, { status }),
    onSuccess: (updatedOrcamento) => {
      queryClient.invalidateQueries(['orcamentos']);
      // Atualizar o orçamento selecionado com o histórico atualizado
      if (orcamentoSelecionado?.id === updatedOrcamento.id) {
        setOrcamentoSelecionado(updatedOrcamento);
      }
    }
  });

  const orcamentosFiltrados = orcamentos.filter(orc => {
    const matchBusca = !busca || 
      orc.numero?.toLowerCase().includes(busca.toLowerCase()) ||
      orc.cliente_nome?.toLowerCase().includes(busca.toLowerCase()) ||
      orc.tipologia_nome?.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = filtroStatus === "todos" || orc.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Orçamentos</h1>
          <p className="text-slate-500 mt-1">Gerencie todos os orçamentos</p>
        </div>
        <Link to="/admin/orcamentos/novo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por número, cliente ou tipologia..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full sm:w-56">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : orcamentosFiltrados.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">
              {busca || filtroStatus !== "todos" 
                ? "Nenhum orçamento encontrado com os filtros aplicados"
                : "Nenhum orçamento cadastrado"}
            </p>
            {!busca && filtroStatus === "todos" && (
              <Link to="/admin/orcamentos/novo">
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  Criar primeiro orçamento
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orcamentosFiltrados.map((orcamento, i) => {
            const StatusIcon = STATUS_CONFIG[orcamento.status]?.icon || FileText;
            
            return (
              <motion.div
                key={orcamento.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setOrcamentoSelecionado(orcamento)}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <StatusIcon className="w-6 h-6 text-slate-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-900">
                              {orcamento.numero || `#${orcamento.id?.slice(-6)}`}
                            </h3>
                            <Badge className={STATUS_CONFIG[orcamento.status]?.color}>
                              {STATUS_CONFIG[orcamento.status]?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {orcamento.tipologia_nome || 'Tipologia'} 
                            {orcamento.cliente_nome && ` • ${orcamento.cliente_nome}`}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {orcamento.created_date && format(new Date(orcamento.created_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            R$ {(orcamento.preco_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-slate-500">
                            {orcamento.area_total_cobranca_m2?.toFixed(3)} m² • {orcamento.tipo_vidro_nome}
                          </p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setOrcamentoSelecionado(orcamento);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate(orcamento.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={!!orcamentoSelecionado} onOpenChange={() => setOrcamentoSelecionado(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>Orçamento {orcamentoSelecionado?.numero}</span>
              <Badge className={STATUS_CONFIG[orcamentoSelecionado?.status]?.color}>
                {STATUS_CONFIG[orcamentoSelecionado?.status]?.label}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {orcamentoSelecionado && (
            <div className="space-y-6 mt-4">
              {/* Info do Cliente */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Cliente</p>
                  <p className="font-medium text-slate-900">
                    {orcamentoSelecionado.cliente_nome || '—'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Contato</p>
                  <p className="font-medium text-slate-900">
                    {orcamentoSelecionado.cliente_telefone || orcamentoSelecionado.cliente_email || '—'}
                  </p>
                </div>
              </div>

              {/* Tipologia */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Produto</h4>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-medium text-slate-900">{orcamentoSelecionado.tipologia_nome}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Vidro: {orcamentoSelecionado.tipo_vidro_nome}
                  </p>
                </div>
              </div>

              {/* Histórico */}
              {orcamentoSelecionado.history && orcamentoSelecionado.history.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <History className="w-4 h-4 text-slate-500" />
                    <h4 className="font-semibold text-slate-900">Histórico</h4>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto border-l-2 border-slate-200 pl-4">
                    {orcamentoSelecionado.history
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((entry, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-6 top-2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-slate-900">{entry.action}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-slate-500">
                                {format(new Date(entry.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                              {entry.user && (
                                <>
                                  <span className="text-xs text-slate-300">•</span>
                                  <p className="text-xs text-slate-500">por {entry.user}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Variáveis */}
              {orcamentoSelecionado.variaveis_entrada?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Medidas do Vão</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {orcamentoSelecionado.variaveis_entrada.map((v, i) => (
                      <div key={i} className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-500">{v.label || v.nome}</p>
                        <p className="font-bold text-slate-900">{v.valor} {v.unidade}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Peças */}
              {orcamentoSelecionado.pecas_calculadas?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Peças</h4>
                  <div className="space-y-2">
                    {orcamentoSelecionado.pecas_calculadas.map((peca, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{peca.nome}</p>
                          <p className="text-sm text-slate-500">
                            {formatarMedida(peca.largura_real_mm, 'mm')} × {formatarMedida(peca.altura_real_mm, 'mm')}
                          </p>
                        </div>
                        <p className="font-medium text-slate-700">{peca.area_cobranca_m2?.toFixed(3)} m²</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totais */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Área Total (cobrança)</span>
                  <span className="font-medium">{orcamentoSelecionado.area_total_cobranca_m2?.toFixed(3)} m²</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Preço por m²</span>
                  <span className="font-medium">R$ {orcamentoSelecionado.preco_m2?.toFixed(2)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-xl font-bold text-blue-700">
                      R$ {orcamentoSelecionado.preco_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Atualizar Status */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Atualizar Status</h4>
                <Select 
                  value={orcamentoSelecionado.status} 
                  onValueChange={(status) => {
                    updateStatusMutation.mutate({ id: orcamentoSelecionado.id, status });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}