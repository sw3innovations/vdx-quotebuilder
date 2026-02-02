import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG = {
  // Status finais (histórico)
  approved: { 
    label: 'Aprovado', 
    color: 'bg-green-100 text-green-700', 
    icon: CheckCircle2 
  },
  rejected: { 
    label: 'Rejeitado', 
    color: 'bg-red-100 text-red-700', 
    icon: XCircle 
  },
  expired: { 
    label: 'Expirado', 
    color: 'bg-slate-100 text-slate-700', 
    icon: Clock 
  },
  // Status em aberto
  pending: {
    label: 'Aguardando Aprovação',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock
  },
  sent: {
    label: 'Em Andamento',
    color: 'bg-blue-100 text-blue-700',
    icon: Clock
  },
  draft: {
    label: 'Rascunho',
    color: 'bg-slate-100 text-slate-700',
    icon: FileText
  }
};

export default function QuoteCard({ quote, primaryColor }) {
  const navigate = useNavigate();
  const statusConfig = STATUS_CONFIG[quote.status] || STATUS_CONFIG.expired;
  const StatusIcon = statusConfig.icon;

  const handleClick = () => {
    // Navegar para detalhes do orçamento
    navigate(`/orcamento/${quote.id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98] border-slate-200"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-slate-700 truncate">
                {quote.quote_number || quote.quote_type_name || 'Orçamento'}
              </span>
            </div>
            
            {quote.quote_type_name && (
              <p className="text-xs text-slate-500 mb-2 truncate">
                {quote.quote_type_name}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={statusConfig.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              
              {quote.total_value && (
                <span className="text-sm font-bold" style={{ color: primaryColor }}>
                  R$ {quote.total_value.toLocaleString('pt-BR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              )}
            </div>

            {quote.created_date && (
              <p className="text-xs text-slate-400 mt-2">
                {format(new Date(quote.created_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
          </div>

          <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
