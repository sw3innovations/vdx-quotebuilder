import React from "react";
import { converterDeMM } from "../utils/calculoUtils";

export default function ConversaoTempoReal({ valorMM }) {
  if (!valorMM || valorMM === 0) {
    return (
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <div className="bg-slate-50 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center border border-slate-200">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium">mm</p>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">-</p>
        </div>
        <div className="bg-slate-50 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center border border-slate-200">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium">cm</p>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">-</p>
        </div>
        <div className="bg-slate-50 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center border border-slate-200">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium">m</p>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">-</p>
        </div>
      </div>
    );
  }

  const mm = Math.round(valorMM);
  const cm = converterDeMM(valorMM, 'cm').toFixed(1);
  const m = converterDeMM(valorMM, 'm').toFixed(3);

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      <div className="bg-blue-50 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center border border-blue-200">
        <p className="text-[10px] sm:text-xs text-blue-600 font-medium">mm</p>
        <p className="text-xs sm:text-sm font-bold text-blue-700 mt-0.5">{mm}</p>
      </div>
      <div className="bg-blue-50 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center border border-blue-200">
        <p className="text-[10px] sm:text-xs text-blue-600 font-medium">cm</p>
        <p className="text-xs sm:text-sm font-bold text-blue-700 mt-0.5">{cm}</p>
      </div>
      <div className="bg-blue-50 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center border border-blue-200">
        <p className="text-[10px] sm:text-xs text-blue-600 font-medium">m</p>
        <p className="text-xs sm:text-sm font-bold text-blue-700 mt-0.5">{m}</p>
      </div>
    </div>
  );
}