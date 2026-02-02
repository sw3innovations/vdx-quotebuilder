# Estrutura de Rotas

## Arquitetura Separada: Públicas vs Privadas

O projeto agora possui uma arquitetura completamente separada entre rotas públicas (clientes) e rotas privadas (admin/backoffice).

### 📁 Estrutura de Pastas

```
src/
├── pages/
│   ├── public/          # Páginas públicas (clientes)
│   │   ├── Home.jsx
│   │   └── OrcamentoPublico.jsx
│   └── admin/          # Páginas privadas (admin)
│       ├── Dashboard.jsx
│       ├── Orcamentos.jsx
│       ├── NovoOrcamento.jsx
│       ├── Categorias.jsx
│       ├── Tipologias.jsx
│       └── Configuracoes.jsx
├── layouts/
│   ├── PublicLayout.jsx    # Layout minimalista para clientes
│   └── AdminLayout.jsx     # Layout com sidebar para admin
├── routes/
│   ├── PublicRoutes.jsx    # Configuração de rotas públicas
│   └── AdminRoutes.jsx     # Configuração de rotas admin
└── components/
    └── auth/
        └── ProtectedRoute.jsx  # Componente de proteção de rotas
```

### 🔐 Rotas Públicas

**Acessíveis sem autenticação:**
- `/` - Home (página inicial para clientes)
- `/orcamento` - Formulário de orçamento público

**Layout:** `PublicLayout` - Layout minimalista sem sidebar

### 🔒 Rotas Privadas (Admin)

**Requerem autenticação:**
- `/admin/dashboard` - Dashboard principal
- `/admin/orcamentos` - Lista de orçamentos
- `/admin/orcamentos/novo` - Criar novo orçamento
- `/admin/categorias` - Gerenciar categorias
- `/admin/tipologias` - Gerenciar tipologias
- `/admin/configuracoes` - Configurações do sistema

**Layout:** `AdminLayout` - Layout com sidebar e menu de navegação

**Proteção:** Todas as rotas admin são protegidas pelo componente `ProtectedRoute`, que redireciona para `/` se o usuário não estiver autenticado.

### 🎯 Benefícios da Nova Arquitetura

1. **Separação clara** entre funcionalidades públicas e privadas
2. **Segurança** - Rotas admin protegidas automaticamente
3. **Manutenibilidade** - Código organizado e fácil de navegar
4. **Escalabilidade** - Fácil adicionar novas rotas em cada categoria
5. **Layouts diferentes** - Cada tipo de rota tem seu próprio layout otimizado

### 📝 Como Adicionar Novas Rotas

**Rota Pública:**
1. Criar componente em `src/pages/public/`
2. Adicionar rota em `src/routes/PublicRoutes.jsx`

**Rota Admin:**
1. Criar componente em `src/pages/admin/`
2. Adicionar rota em `src/routes/AdminRoutes.jsx`
3. Adicionar item no menu em `src/layouts/AdminLayout.jsx`
