import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export default function RecomendacaoABNT({ recomendacao }) {
  if (!recomendacao) return null;

  const temAlertas = recomendacao.alertas && recomendacao.alertas.length > 0;
  const requerCalculo = recomendacao.requer_calculo_estrutural;

  const iconeAlerta = (tipo) => {
    switch (tipo) {
      case 'BLOQUEIO': return <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />;
      case 'AVISO': return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
      default: return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    }
  };

  const corBorda = (tipo) => {
    switch (tipo) {
      case 'BLOQUEIO': return 'border-red-200 bg-red-50';
      case 'AVISO': return 'border-amber-200 bg-amber-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card className="mb-4 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-emerald-900">Recomendação ABNT</h3>
          {recomendacao.norma_referencia && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {recomendacao.norma_referencia}
            </span>
          )}
        </div>

        {!requerCalculo ? (
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-700">Espessura:</span>
                <span className="font-bold text-emerald-800">{recomendacao.espessura_recomendada_mm}mm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-700">Tipos:</span>
                <span className="font-medium text-emerald-800">
                  {(recomendacao.tipos_permitidos || []).join(', ')}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Área calculada: {recomendacao.area_m2} m²
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-lg border border-amber-200 bg-amber-50">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-800">
              Dimensões acima da tabela padrão. Consulte um engenheiro para cálculo estrutural.
            </span>
          </div>
        )}

        {temAlertas && (
          <div className="mt-3 space-y-1.5">
            {recomendacao.alertas.map((alerta, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border text-xs ${corBorda(alerta.tipo)}`}>
                {iconeAlerta(alerta.tipo)}
                <span>{alerta.mensagem}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
