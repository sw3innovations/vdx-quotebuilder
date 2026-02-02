import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Layers } from "lucide-react";

export default function TipologiaCard({ tipologia, onClick, index }) {
  const pecasCount = tipologia.pecas?.length || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-xl border border-slate-200/80 overflow-hidden hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300"
    >
      {tipologia.imagens?.[0] ? (
        <div className="aspect-[3/2] bg-slate-100 overflow-hidden">
          <img 
            src={tipologia.imagens[0]} 
            alt={tipologia.nome}
            className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[3/2] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <Layers className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto" />
            <span className="text-xs text-slate-400 mt-1 block">Sem imagem</span>
          </div>
        </div>
      )}
      
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {tipologia.nome}
            </h3>
            {tipologia.descricao && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{tipologia.descricao}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {pecasCount} {pecasCount === 1 ? 'peça' : 'peças'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {tipologia.variaveis?.length || 0} var.
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
        </div>
      </div>
    </motion.div>
  );
}