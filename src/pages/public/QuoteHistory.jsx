import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/api';
import { ArrowLeft, Bell, FileText, Clock } from 'lucide-react';
import QuoteCard from '@/components/quotes/QuoteCard';

// Mock data para Company
const mockCompany = {
  id: 'comp-1',
  name: 'Vidraçaria Digital Express',
  logo_url: null,
  primary_color: '#1e88e5'
};

export default function QuoteHistory() {
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
  
  // Filtrar orçamentos do cliente e converter para formato de Quote
  // Por enquanto, mostrar todos os orçamentos finalizados como exemplo
  const completedQuotes = allOrcamentos
    .filter(q => ['concluido', 'cancelado'].includes(q.status))
    .map(orc => ({
      id: orc.id,
      quote_number: orc.numero,
      quote_type_name: orc.tipologia_nome,
      status: orc.status === 'concluido' ? 'approved' : 'rejected',
      total_value: orc.preco_total,
      created_date: orc.created_date,
      customer_id: orc.cliente_email // Usar email como identificador temporário
    }));

  React.useEffect(() => {
    if (company?.primary_color) {
      localStorage.setItem('company_primary_color', company.primary_color);
    }
  }, [company?.primary_color]);

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
        <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Main Content */}
      <div className="px-4 py-5 max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-5 text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: primaryColor }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {/* Title Card */}
        <div className="mb-5 p-4 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Clock className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Histórico</h2>
              <p className="text-sm text-slate-500">
                {completedQuotes.length === 0 
                  ? 'Nenhum orçamento finalizado'
                  : `${completedQuotes.length} orçamento${completedQuotes.length > 1 ? 's' : ''} finalizado${completedQuotes.length > 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Quotes List */}
        <div className="space-y-3">
          {completedQuotes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">Nenhum histórico</h3>
              <p className="text-sm text-slate-500 mb-5">Seus orçamentos finalizados aparecerão aqui</p>
              <button
                onClick={() => navigate('/orcamento')}
                className="text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition-all active:scale-[0.98]"
                style={{ backgroundColor: primaryColor }}
              >
                Novo Orçamento
              </button>
            </div>
          ) : (
            completedQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} primaryColor={primaryColor} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
