import React from "react";
import { Link } from "react-router-dom";
import { entities } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Calculator,
  Package,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  rascunho: { label: "Rascunho", color: "bg-slate-100 text-slate-700" },
  aguardando_aprovacao: { label: "Aguardando Aprovação", color: "bg-amber-100 text-amber-700" },
  aguardando_pagamento: { label: "Aguardando Pagamento", color: "bg-orange-100 text-orange-700" },
  em_producao: { label: "Em Produção", color: "bg-blue-100 text-blue-700" },
  aguardando_retirada: { label: "Pronto", color: "bg-green-100 text-green-700" },
  concluido: { label: "Concluído", color: "bg-emerald-100 text-emerald-700" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700" }
};

export default function Dashboard() {
  const { data: orcamentos, isLoading: loadingOrcamentos } = useQuery({
    queryKey: ['orcamentos'],
    queryFn: () => entities.Orcamento.list('-created_date', 10),
    initialData: []
  });

  const { data: tipologias, isLoading: loadingTipologias } = useQuery({
    queryKey: ['tipologias'],
    queryFn: () => entities.Tipologia.filter({ ativo: true }),
    initialData: []
  });

  const stats = React.useMemo(() => {
    const total = orcamentos.length;
    const emAndamento = orcamentos.filter(o => 
      ['aguardando_aprovacao', 'aguardando_pagamento', 'em_producao'].includes(o.status)
    ).length;
    const concluidos = orcamentos.filter(o => o.status === 'concluido').length;
    const valorTotal = orcamentos
      .filter(o => o.status !== 'cancelado')
      .reduce((sum, o) => sum + (o.preco_total || 0), 0);
    
    return { total, emAndamento, concluidos, valorTotal };
  }, [orcamentos]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl lg:text-3xl font-bold text-slate-900"
        >
          Dashboard
        </motion.h1>
        <p className="text-slate-500 mt-1">Visão geral do seu sistema de orçamentos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="border-slate-200/80 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Orçamentos</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-slate-200/80 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Em Andamento</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.emAndamento}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-200/80 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Concluídos</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.concluidos}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-slate-200/80 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Valor Total</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-slate-200/80 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/orcamentos/novo">
                <Button className="w-full justify-start h-14 bg-blue-600 hover:bg-blue-700">
                  <Calculator className="w-5 h-5 mr-3" />
                  Novo Orçamento
                </Button>
              </Link>
              <Link to="/admin/tipologias">
                <Button variant="outline" className="w-full justify-start h-14 border-slate-200">
                  <Package className="w-5 h-5 mr-3" />
                  Gerenciar Tipologias
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="border-slate-200/80 h-full">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Orçamentos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrcamentos ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : orcamentos.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>Nenhum orçamento ainda</p>
                  <Link to="/admin/orcamentos/novo">
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                      Criar primeiro orçamento
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orcamentos.slice(0, 5).map((orcamento, i) => (
                    <div 
                      key={orcamento.id} 
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/80 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {orcamento.numero || `#${orcamento.id?.slice(-6)}`}
                            </p>
                            <p className="text-sm text-slate-500">
                              {orcamento.tipologia_nome || 'Tipologia'} • {orcamento.cliente_nome || 'Cliente'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={STATUS_CONFIG[orcamento.status]?.color || STATUS_CONFIG.rascunho.color}>
                            {STATUS_CONFIG[orcamento.status]?.label || 'Rascunho'}
                          </Badge>
                          {orcamento.preco_total && (
                            <p className="text-sm font-medium text-slate-900 mt-1">
                              R$ {orcamento.preco_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}