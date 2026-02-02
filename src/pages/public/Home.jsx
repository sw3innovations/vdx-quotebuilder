import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/api';
import { 
  Plus, 
  FileText, 
  Clock, 
  Bell,
  MessageCircle,
  ChevronRight,
  LogOut
} from 'lucide-react';

// Mock data para Company
const mockCompany = {
  id: 'comp-1',
  name: 'Vidraçaria Digital Express',
  logo_url: null,
  primary_color: '#1e88e5'
};

// Mock data para QuoteTypes
const mockQuoteTypes = [
  {
    id: 'qt-1',
    name: 'Orçamento de Vidraçaria',
    slug: 'vidracaria',
    status: 'published'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [customer] = useState(() => {
    const saved = localStorage.getItem('customer');
    return saved ? JSON.parse(saved) : null;
  });

  // Buscar orçamentos
  const { data: allOrcamentos = [] } = useQuery({
    queryKey: ['orcamentos'],
    queryFn: () => entities.Orcamento.list()
  });

  // Usar dados mockados
  const company = mockCompany;
  const quoteTypes = mockQuoteTypes.filter(qt => qt.status === 'published');
  
  // Converter orçamentos para formato de Quote
  const customerQuotes = allOrcamentos.map(orc => ({
    id: orc.id,
    status: orc.status === 'concluido' ? 'approved' : 
            orc.status === 'cancelado' ? 'rejected' : 
            orc.status === 'rascunho' ? 'draft' :
            orc.status === 'aguardando_aprovacao' ? 'pending' : 
            orc.status === 'aguardando_pagamento' ? 'sent' : 
            orc.status === 'em_producao' ? 'sent' : 
            orc.status === 'aguardando_retirada' ? 'sent' : 'draft',
    customer_id: orc.cliente_email
  }));

  // Cache company colors
  React.useEffect(() => {
    if (company?.primary_color) {
      localStorage.setItem('company_primary_color', company.primary_color);
    }
  }, [company?.primary_color]);

  // Calculate quote counts
  const openQuotesCount = useMemo(() => {
    return customerQuotes.filter(q => ['draft', 'pending', 'sent'].includes(q.status)).length;
  }, [customerQuotes]);

  const completedQuotesCount = useMemo(() => {
    return customerQuotes.filter(q => ['approved', 'rejected', 'expired'].includes(q.status)).length;
  }, [customerQuotes]);

  // Get greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleLogout = () => {
    localStorage.removeItem('customer');
    navigate('/');
  };

  const primaryColor = company?.primary_color || localStorage.getItem('company_primary_color') || '#1e88e5';

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
            {company?.name || 'Orçamentos'}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button 
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => navigate('/admin/dashboard')}
          >
            <Bell className="w-5 h-5 text-white" />
            {(openQuotesCount > 0) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white/20"></span>
            )}
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-5 max-w-2xl mx-auto">
        {/* Greeting */}
        <div className="mb-5">
          <p className="text-slate-500 text-sm mb-0.5">{getGreeting()}</p>
          <h2 className="text-xl font-bold text-slate-900">
            {customer?.name?.split(' ')[0] || 'Bem-vindo'} 👋
          </h2>
        </div>

        {/* New Quote Button */}
        <button 
          className="w-full mb-5 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          style={{ backgroundColor: primaryColor }}
          onClick={() => {
            if (quoteTypes.length === 0) {
              alert('Nenhum tipo de orçamento disponível no momento.');
            } else {
              // Redirecionar para OrcamentoPublico quando houver tipos de orçamento
              navigate('/orcamento');
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-base">Novo Orçamento</h3>
              <p className="text-white/80 text-sm">Solicitar cotação</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/60" />
          </div>
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Open Quotes */}
          <button 
            className="p-4 rounded-xl bg-white border border-slate-100 text-left transition-all hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/em-aberto')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              {openQuotesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  {openQuotesCount}
                </span>
              )}
            </div>
            <h3 className="text-slate-900 font-semibold text-sm">Em Aberto</h3>
            <p className="text-slate-400 text-xs">Acompanhar</p>
          </button>

          {/* History */}
          <button 
            className="p-4 rounded-xl bg-white border border-slate-100 text-left transition-all hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/historico')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              {completedQuotesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  {completedQuotesCount}
                </span>
              )}
            </div>
            <h3 className="text-slate-900 font-semibold text-sm">Histórico</h3>
            <p className="text-slate-400 text-xs">Finalizados</p>
          </button>
        </div>

        {/* Help Card */}
        <button 
          className="w-full p-4 rounded-xl bg-amber-50 border border-amber-100 text-left transition-all hover:bg-amber-100/50 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-slate-900 font-semibold text-sm">Precisa de ajuda?</h3>
              <p className="text-slate-500 text-xs">Fale conosco no WhatsApp</p>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </div>
        </button>
      </div>
    </div>
  );
}
