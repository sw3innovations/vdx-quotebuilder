import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/pages/admin/Dashboard';
import NovoOrcamento from '@/pages/admin/NovoOrcamento';
import Categorias from '@/pages/admin/Categorias';
import Tipologias from '@/pages/admin/Tipologias';
import ConfiguracoesTecnicas from '@/pages/admin/ConfiguracoesTecnicas';
import Produtos from '@/pages/admin/Produtos';

/**
 * Rotas privadas (admin/backoffice)
 * Requerem autenticação
 */
export default function AdminRoutes() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orcamentos/novo" element={<NovoOrcamento />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="tipologias" element={<Tipologias />} />
          <Route path="configuracoes-tecnicas" element={<ConfiguracoesTecnicas />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="" element={<Dashboard />} /> {/* Default redirect */}
        </Routes>
      </AdminLayout>
    </ProtectedRoute>
  );
}
