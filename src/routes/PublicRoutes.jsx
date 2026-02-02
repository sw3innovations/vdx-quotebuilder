import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import Home from '@/pages/public/Home';
import OrcamentoPublico from '@/pages/public/OrcamentoPublico';
import QuoteHistory from '@/pages/public/QuoteHistory';
import QuoteDetail from '@/pages/public/QuoteDetail';
import OpenQuotes from '@/pages/public/OpenQuotes';

/**
 * Rotas públicas (clientes)
 * Acessíveis sem autenticação
 */
export default function PublicRoutes() {
  return (
    <PublicLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orcamento" element={<OrcamentoPublico />} />
        <Route path="/orcamento/:id" element={<QuoteDetail />} />
        <Route path="/em-aberto" element={<OpenQuotes />} />
        <Route path="/historico" element={<QuoteHistory />} />
      </Routes>
    </PublicLayout>
  );
}
