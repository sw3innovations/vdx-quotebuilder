import React from 'react';

/**
 * Layout para rotas públicas (clientes)
 * Layout minimalista sem sidebar ou menu de admin
 */
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
