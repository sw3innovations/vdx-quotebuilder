import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/api';
import { ArrowLeft, Bell, History, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data para Company
const mockCompany = {
  id: 'comp-1',
  name: 'Vidraçaria Digital Express',
  logo_url: null,
  primary_color: '#1e88e5'
};

const STATUS_CONFIG = {
  approved: { 
    label: 'Aprovado', 
    color: 'bg-green-100 text-green-700'
  },
  rejected: { 
    label: 'Rejeitado', 
    color: 'bg-red-100 text-red-700'
  },
  expired: { 
    label: 'Expirado', 
    color: 'bg-slate-100 text-slate-700'
  },
  pending: {
    label: 'Pendente',
    color: 'bg-amber-100 text-amber-700'
  },
  sent: {
    label: 'Enviado',
    color: 'bg-blue-100 text-blue-700'
  }
};

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer] = useState(() => {
    const saved = localStorage.getItem('customer');
    return saved ? JSON.parse(saved) : null;
  });

  // Buscar orçamento - por enquanto usando mock, depois usar entities.Quote
  const { data: orcamentos = [] } = useQuery({
    queryKey: ['orcamentos'],
    queryFn: () => entities.Orcamento.list()
  });

  const quote = orcamentos.find(o => o.id === id);

  const company = mockCompany;
  const primaryColor = company?.primary_color || localStorage.getItem('company_primary_color') || '#1e88e5';
  const statusConfig = STATUS_CONFIG[quote?.status] || STATUS_CONFIG.pending;

  if (!quote) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-semibold mb-2">Orçamento não encontrado</h2>
          <p className="text-slate-600 mb-6">Este orçamento não existe ou não está disponível.</p>
          <button
            onClick={() => navigate('/historico')}
            className="text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            Voltar ao Histórico
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      {/* Header */}
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
            Detalhes do Orçamento
          </h1>
        </div>
        <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Main Content */}
      <div className="px-4 py-5 max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/historico')}
          className="flex items-center gap-2 mb-5 text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: primaryColor }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {/* Quote Info Card */}
        <Card className="mb-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <span>{quote.numero || 'Orçamento'}</span>
                <Badge className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quote.tipologia_nome && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Produto</p>
                  <p className="font-medium text-slate-900">{quote.tipologia_nome}</p>
                </div>
              )}
              
              {quote.tipo_vidro_nome && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Tipo de Vidro</p>
                  <p className="font-medium text-slate-900">{quote.tipo_vidro_nome}</p>
                </div>
              )}

              {quote.preco_total && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-500 mb-1">Valor Total</p>
                  <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                    R$ {quote.preco_total.toLocaleString('pt-BR', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </p>
                </div>
              )}

              {quote.created_date && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Data de Criação</p>
                  <p className="font-medium text-slate-900">
                    {format(new Date(quote.created_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Histórico */}
        {quote.history && quote.history.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" />
                <CardTitle>Histórico</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 border-l-2 border-slate-200 pl-4">
                {quote.history
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((entry, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-6 top-2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-slate-900 mb-1">{entry.action}</p>
                        <div className="flex items-center gap-2">
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
