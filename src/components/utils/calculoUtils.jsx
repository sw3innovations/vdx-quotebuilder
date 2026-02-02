// Fatores de conversão para milímetros
const FATORES = {
  mm: 1,
  cm: 10,
  m: 1000
};

// Converte qualquer unidade para milímetros
export function converterParaMM(valor, unidade) {
  return valor * (FATORES[unidade] || 1);
}

// Converte milímetros para qualquer unidade
export function converterDeMM(valorMM, unidade) {
  return valorMM / (FATORES[unidade] || 1);
}

// Formata uma medida em mm para a unidade desejada
export function formatarMedida(valorMM, unidade) {
  const valor = converterDeMM(valorMM, unidade);
  if (unidade === 'mm') {
    return `${Math.round(valor)} mm`;
  } else if (unidade === 'cm') {
    return `${valor.toFixed(1)} cm`;
  } else {
    return `${valor.toFixed(3)} m`;
  }
}

// Arredonda para cima para o próximo múltiplo de 50mm
export function arredondarMultiplo50(valorMM) {
  return Math.ceil(valorMM / 50) * 50;
}

// Avalia uma fórmula simples substituindo variáveis
export function avaliarFormula(formula, variaveis) {
  if (!formula) return 0;
  
  let expressao = formula;
  
  // Substitui cada variável pelo seu valor em mm
  for (const [nome, valor] of Object.entries(variaveis)) {
    const regex = new RegExp(`\\b${nome}\\b`, 'g');
    expressao = expressao.replace(regex, valor.toString());
  }
  
  // Remove espaços e avalia a expressão
  expressao = expressao.replace(/\s/g, '');
  
  // Avaliação segura da expressão matemática
  try {
    // Permite apenas números, operadores básicos e parênteses
    if (!/^[\d+\-*/().]+$/.test(expressao)) {
      console.error('Expressão inválida:', expressao);
      return 0;
    }
    return Function('"use strict"; return (' + expressao + ')')();
  } catch (e) {
    console.error('Erro ao avaliar fórmula:', formula, expressao, e);
    return 0;
  }
}

// Calcula as peças de uma tipologia com base nas variáveis de entrada
export function calcularPecas(tipologia, variaveisEntrada) {
  // Converte todas as variáveis para mm
  const variaveisMM = {};
  for (const v of variaveisEntrada) {
    variaveisMM[v.nome] = converterParaMM(v.valor, v.unidade);
  }
  
  // Calcula cada peça
  const pecasCalculadas = tipologia.pecas?.map(peca => {
    const larguraMM = avaliarFormula(peca.formula_largura, variaveisMM);
    const alturaMM = avaliarFormula(peca.formula_altura, variaveisMM);
    
    const larguraArredondadaMM = arredondarMultiplo50(larguraMM);
    const alturaArredondadaMM = arredondarMultiplo50(alturaMM);
    
    const areaRealM2 = (larguraMM * alturaMM) / 1000000; // mm² para m²
    const areaCobrancaM2 = (larguraArredondadaMM * alturaArredondadaMM) / 1000000;
    
    return {
      nome: peca.nome,
      imagem_url: peca.imagem_url || '', // URL da imagem ilustrativa da peça
      largura_real_mm: larguraMM,
      altura_real_mm: alturaMM,
      largura_arredondada_mm: larguraArredondadaMM,
      altura_arredondada_mm: alturaArredondadaMM,
      area_real_m2: areaRealM2,
      area_cobranca_m2: areaCobrancaM2,
      tem_puxador: peca.tem_puxador, // Compatibilidade
      puxador: null, // Compatibilidade
      configuracoes_tecnicas: [], // Array para armazenar valores selecionados
      conferido: false
    };
  }) || [];
  
  // Calcula totais
  const areaTotalRealM2 = pecasCalculadas.reduce((sum, p) => sum + p.area_real_m2, 0);
  const areaTotalCobrancaM2 = pecasCalculadas.reduce((sum, p) => sum + p.area_cobranca_m2, 0);
  
  return {
    pecas: pecasCalculadas,
    areaTotalRealM2,
    areaTotalCobrancaM2
  };
}

// Calcula o preço total
export function calcularPreco(areaM2, precoM2) {
  return areaM2 * precoM2;
}