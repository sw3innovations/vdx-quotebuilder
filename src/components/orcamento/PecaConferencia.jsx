import React from "react";
import { motion } from "framer-motion";
import { Check, Ruler, Square, ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatarMedida } from "../utils/calculoUtils";

// Componente de desenho geométrico padrão
const DesenhoGeometrico = ({ largura, altura, larguraFormatada, alturaFormatada }) => {
  // Proporção ajustada para visualização (escala máxima de 250px)
  const escalaMax = 250;
  
  const proporcao = Math.min(
    escalaMax / (largura || 1),
    escalaMax / (altura || 1),
    1
  );
  
  const larguraVisual = (largura || 100) * proporcao;
  const alturaVisual = (altura || 100) * proporcao;
  
  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 overflow-visible">
      <div className="relative w-full flex items-center justify-center" style={{ minHeight: '240px', paddingTop: '45px', paddingBottom: '20px', paddingLeft: '70px', paddingRight: '20px' }}>
        {/* Retângulo representando a peça */}
        <div
          className="border-4 border-blue-500 bg-blue-50/30 shadow-lg relative"
          style={{
            width: `${larguraVisual}px`,
            height: `${alturaVisual}px`,
            minWidth: '120px',
            minHeight: '120px',
            maxWidth: '100%'
          }}
        >
          {/* Medida da largura (superior) */}
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-slate-200 whitespace-nowrap">
              <ArrowRight className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-blue-700">{larguraFormatada}</span>
            </div>
          </div>
          
          {/* Medida da altura (lateral esquerda) */}
          <div className="absolute -left-16 sm:-left-18 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
              <ArrowDown className="w-3 h-3 text-indigo-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-indigo-700 whitespace-nowrap">{alturaFormatada}</span>
            </div>
          </div>
          
          {/* Indicador de canto */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default function PecaConferencia({ 
  peca, 
  unidadeOriginal,
  onConfirmar, 
  confirmada,
  index,
  total,
  puxadores = [],
  onPuxadorChange,
  configuracoesTecnicas = [], // Array de configurações técnicas da peça
  itensConfiguracao = {}, // Objeto com itens por categoria: { puxador_tecnico: [...], ferragem_tecnica: [...] }
  onConfiguracaoChange // Função para atualizar configurações: (categoria, valor) => void
}) {
  const largura = formatarMedida(peca.largura_real_mm, unidadeOriginal);
  const altura = formatarMedida(peca.altura_real_mm, unidadeOriginal);
  const area = peca.area_real_m2?.toFixed(4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-lg">{index + 1}</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">{peca.nome}</h3>
              <p className="text-xs sm:text-sm text-blue-100">Peça {index + 1} de {total}</p>
            </div>
          </div>
          {confirmada && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
              <Check className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Conferido</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        {/* Imagem Ilustrativa ou Desenho Geométrico */}
        <div className="mb-4">
          {peca.imagem_url ? (
            <div className="w-full rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm bg-white">
              <img 
                src={peca.imagem_url} 
                alt={`Ilustração da peça ${peca.nome}`}
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          ) : (
            <DesenhoGeometrico 
              largura={peca.largura_real_mm}
              altura={peca.altura_real_mm}
              larguraFormatada={largura}
              alturaFormatada={altura}
            />
          )}
        </div>

        {/* Cards de medidas modernos */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Largura</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-700">
              {largura}
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <ArrowDown className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Altura</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-indigo-700">
              {altura}
            </p>
          </div>
        </div>
        
        {/* Área destacada */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-4 border-2 border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md">
                <Square className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Área Total</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-700">
                  {area} m²
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Configurações Técnicas */}
        {configuracoesTecnicas && configuracoesTecnicas.length > 0 && (
          <div className="space-y-4 mb-4">
            {configuracoesTecnicas.map((config, configIndex) => {
              const itensDisponiveis = config.itens_ids && config.itens_ids.length > 0
                ? (itensConfiguracao[config.categoria] || []).filter(item => 
                    config.itens_ids.includes(item.id)
                  )
                : (itensConfiguracao[config.categoria] || []);
              
              const valorAtual = peca.configuracoes_tecnicas?.[configIndex]?.valor || '';
              const categoriaNome = config.categoria === 'puxador_tecnico' 
                ? 'Puxador Técnico'
                : config.categoria === 'ferragem_tecnica'
                ? 'Ferragem Técnica'
                : config.categoria;
              
              return (
                <div key={config.id || configIndex} className="mb-4">
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    {categoriaNome}
                    {config.obrigatorio && !confirmada && <span className="text-red-500">*</span>}
                  </Label>
                  {itensDisponiveis.length > 0 ? (
                    <>
                      <Select 
                        value={valorAtual} 
                        onValueChange={(value) => onConfiguracaoChange && onConfiguracaoChange(configIndex, value)}
                        disabled={confirmada}
                      >
                        <SelectTrigger className="h-12 border-2">
                          <SelectValue placeholder={`Selecione ${categoriaNome.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {itensDisponiveis.map(item => (
                            <SelectItem key={item.id} value={item.nome || item.id}>
                              {item.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {config.obrigatorio && !valorAtual && !confirmada && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                          <span>⚠️</span> Obrigatório selecionar {categoriaNome.toLowerCase()}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 py-2">
                      Nenhum item disponível para esta configuração
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Compatibilidade: manter puxador antigo se não houver configurações técnicas */}
        {(!configuracoesTecnicas || configuracoesTecnicas.length === 0) && peca.tem_puxador && puxadores.length > 0 && (
          <div className="mb-4">
            <Label className="text-sm font-semibold text-slate-700 mb-2 block">
              Puxador {!confirmada && <span className="text-red-500">*</span>}
            </Label>
            <Select 
              value={peca.puxador || ''} 
              onValueChange={onPuxadorChange}
              disabled={confirmada}
            >
              <SelectTrigger className="h-12 border-2">
                <SelectValue placeholder="Selecione o puxador" />
              </SelectTrigger>
              <SelectContent>
                {puxadores.map(pux => (
                  <SelectItem key={pux.id} value={pux.nome}>{pux.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!peca.puxador && !confirmada && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <span>⚠️</span> Obrigatório selecionar um puxador
              </p>
            )}
          </div>
        )}
        
        {/* Botão de confirmação */}
        {!confirmada && (
          <Button 
            onClick={onConfirmar}
            disabled={
              // Validar configurações obrigatórias
              (configuracoesTecnicas || []).some((config, idx) => {
                if (!config.obrigatorio) return false;
                const valor = peca.configuracoes_tecnicas?.[idx]?.valor;
                return !valor || valor === '';
              }) ||
              // Compatibilidade: validar puxador antigo se não houver configurações
              ((!configuracoesTecnicas || configuracoesTecnicas.length === 0) && peca.tem_puxador && !peca.puxador)
            }
            className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Check className="w-5 h-5 mr-2" />
            Confirmar Medidas
          </Button>
        )}
      </div>
    </motion.div>
  );
}