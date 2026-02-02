import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { converterParaMM } from "../utils/calculoUtils";
import ConversaoTempoReal from "./ConversaoTempoReal";

export default function InputComUnidade({ 
  label, 
  nome,
  valor, 
  unidade, 
  unidadePadrao = "cm",
  permiteAlterarUnidade = true,
  onChange,
  placeholder
}) {
  const handleValorChange = (e) => {
    const novoValor = e.target.value === '' ? '' : parseFloat(e.target.value);
    onChange({ valor: novoValor, unidade });
  };

  // Calcula o valor em mm para mostrar conversões
  const valorMM = valor !== '' && valor !== null ? converterParaMM(valor, unidade) : 0;

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <Label className="text-xs sm:text-sm font-medium text-slate-700">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={valor === '' ? '' : valor}
          onChange={handleValorChange}
          placeholder={placeholder || "Digite o valor"}
          className="h-11 sm:h-12 text-base sm:text-lg font-medium border-slate-200 focus:border-blue-500 focus:ring-blue-500 pr-12 sm:pr-14"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium text-slate-500 pointer-events-none">
          {unidade}
        </div>
      </div>
      {unidade !== 'unidade' && <ConversaoTempoReal valorMM={valorMM} />}
    </div>
  );
}