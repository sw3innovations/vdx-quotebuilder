import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function CategoriaCard({ categoria, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl border border-slate-200/80 p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {categoria.imagem_url ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100">
              <img 
                src={categoria.imagem_url} 
                alt={categoria.nome}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {categoria.nome?.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
              {categoria.nome}
            </h3>
            {categoria.descricao && (
              <p className="text-sm text-slate-500 mt-1">{categoria.descricao}</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
}