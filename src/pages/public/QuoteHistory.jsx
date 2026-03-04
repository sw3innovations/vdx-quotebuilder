import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vidaceiroApi } from '@/api/apiBackend';
import { ArrowLeft, Bell, FileText, Clock } from 'lucide-react';
import QuoteCard from '@/components/quotes/QuoteCard';

const mockCompany = {
  id: 'comp-1',
  name: 'Vidraçaria Digital Express',
  logo_url: null,
  primary_color: '#1e88e5'
};

const BACKEND_TO_CARD_STATUS = {
  aguardando_retirada: 'approved',
  cancelado: 'rejected',
};

export default function QuoteHistory() {
  const navigate = useNavigate();

  const { data: allOrcamentos = [] } = useQuery({
    queryKey: ['vidraceiro-orcamentos'],
    queryFn: () => vidaceiroApi.listarOrcamentos(),
  });

  const company = mockCompany;

  const completedQuotes = allOrcamentos
    .filter(q => ['aguardando_retirada', 'cancelado'].includes(q.status))
    .map(orc => ({
      id: orc.id,
      quote_number: orc.numero,
      quote_type_name: orc.tipologia_nome,
      status: BACKEND_TO_CARD_STATUS[orc.status] || 'expired',
      total_value: orc.preco_total,
      created_date: orc.created_date,
    }));

  React.useEffect(() => {
    if (company?.primary_color) {
      localStorage.setItem('company_primary_color', company.primary_color);
    }
  }, [company?.primary_color]);

  const primaryColor = company?.primary_color || localStorage.getItem('company_primary_color') || '#1e88e5';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
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

      <div className="px-4 py-5 max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-5 text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: primaryColor }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

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
