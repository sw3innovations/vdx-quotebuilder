# VDX Frontend — Development Guidelines

**Stack**: React 18.2 · Vite 6.4.1 · Tailwind · shadcn/ui · TanStack Query v5
**Deploy**: Vercel (`https://vdx-quotebuilder.vercel.app`)
**Backend**: `http://localhost:9090` (dev) · `http://177.73.87.138:9090` (produção)

---

## Comandos

```bash
# Desenvolvimento
npm run dev         # inicia em http://localhost:5173

# Build produção
npm run build

# Preview build local
npm run preview

# Lint
npm run lint
npm run lint:fix
```

---

## Variáveis de Ambiente

```bash
# .env.local (dev — não commitar)
VITE_API_URL=http://localhost:9090

# .env.production (Vercel — commitar)
VITE_API_URL=http://177.73.87.138:9090
```

`.env.local` está no `.gitignore`. Nunca commitar credenciais.

---

## Estrutura do Projeto

```
src/
├── api/
│   ├── apiBackend.js          ← cliente HTTP (fetch) com injeção automática de token
│   └── api.js                 ← facade com transformações de dados e CRUD entities
├── lib/
│   ├── AuthContext.jsx        ← auth do VIDRACEIRO (CPF/CNPJ modal, localStorage)
│   ├── AdminAuthContext.jsx   ← auth do VENDEDOR/ADMIN (email+senha, localStorage) [CRIAR]
│   ├── app-params.js          ← leitura de ?phone=&name= da URL (LangGraph)
│   └── query-client.js        ← instância TanStack Query
├── routes/
│   ├── PublicRoutes.jsx       ← rotas do vidraceiro (/, /orcamento, /historico, etc.)
│   └── AdminRoutes.jsx        ← rotas do vendedor (/admin/*) — usa AdminAuthContext
├── pages/
│   ├── public/
│   │   ├── Home.jsx
│   │   ├── OrcamentoPublico.jsx     ← wizard 5 etapas (vidraceiro)
│   │   ├── QuoteDetail.jsx          ← detalhe do orçamento (vidraceiro)
│   │   ├── QuoteHistory.jsx         ← histórico de orçamentos (vidraceiro)
│   │   └── OpenQuotes.jsx
│   └── admin/
│       ├── Login.jsx                ← [CRIAR] tela de login admin (email+senha)
│       ├── Dashboard.jsx            ← stats reais via /api/admin/orcamentos/stats
│       ├── NovoOrcamento.jsx        ← wizard interno (vendedor)
│       ├── Categorias.jsx
│       ├── Tipologias.jsx           ← inclui seção "Preços por Cor"
│       ├── ConfiguracoesTecnicas.jsx
│       ├── Produtos.jsx
│       └── OrcamentoDetalhe.jsx     ← ações de pipeline (aprovar, cancelar)
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.jsx       ← usa AdminAuthContext [CORRIGIR]
│   │   └── IdentificacaoModal.jsx   ← [CRIAR] modal CPF/CNPJ do vidraceiro
│   └── orcamento/
│       ├── InputComUnidade.jsx      ← campo com debounce 300ms + backend conversion
│       ├── ConversaoTempoReal.jsx   ← 3 quadros mm/cm/m via backend
│       ├── PecaConferencia.jsx
│       ├── RecomendacaoABNT.jsx     ← bloqueia se tipo=BLOQUEIO
│       ├── CategoriaCard.jsx
│       └── TipologiaCard.jsx
└── utils/
    └── calculoUtils.jsx             ← NÃO usar para cálculos reais (só fallback UI)
```

---

## Autenticação — Duas Sessões Independentes

O sistema tem dois tipos de usuário com fluxos de auth completamente independentes.

### Vidraceiro (rotas públicas `/`)
- Identifica-se via **CPF ou CNPJ** no `IdentificacaoModal.jsx`
- `POST /api/vidraceiro/identificar { doc_type, documento, nome? }`
- Token salvo em **`localStorage('vidraceiro_token')`**
- `AuthContext.jsx` verifica sessão chamando `GET /api/vidraceiro/me`
- `apiBackend.js` injeta `Authorization: Bearer {token}` nas chamadas para `/api/vidraceiro/*`
- Se URL contém `?phone=&name=` (vindo do agente LangGraph): `app-params.js` pré-preenche o modal (vidraceiro ainda confirma) e remove os params da URL

### Vendedor/Admin (rotas `/admin/*`)
- Auth via **email + senha** em `pages/admin/Login.jsx`
- `POST /api/admin/auth/login { email, senha }`
- Token salvo em **`localStorage('admin_token')`**
- `AdminAuthContext.jsx` gerencia a sessão do vendedor
- `ProtectedRoute.jsx` usa `AdminAuthContext` e redireciona para `/admin/login`

**As duas sessões não interferem.** Um vidraceiro autenticado não acessa rotas `/admin/*`; um vendedor autenticado não acessa endpoints `/api/vidraceiro/*` (o backend rejeitará com 401 — token errado para o filtro).

---

## Injeção Automática de Token (apiBackend.js)

```js
function getAuthHeaders(endpoint) {
  if (endpoint.startsWith('/api/vidraceiro/')) {
    const t = localStorage.getItem('vidraceiro_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
  if (endpoint.startsWith('/api/admin/') || endpoint.startsWith('/api/orcamentos')) {
    const t = localStorage.getItem('admin_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
  return {}; // rotas públicas
}
```

---

## Fluxo LangGraph → Wizard

```
1. Agente LangGraph redireciona vidraceiro para:
   https://vdx-quotebuilder.vercel.app/?phone=+5511999999999&name=João

2. app-params.js lê os params ao carregar a app:
   const phone = new URLSearchParams(window.location.search).get('phone');
   const name  = new URLSearchParams(window.location.search).get('name');
   window.history.replaceState({}, '', window.location.pathname); // remove da URL

3. IdentificacaoModal recebe { phone, name } como props e pré-preenche os campos

4. Vidraceiro confirma CPF/CNPJ e clica em "Entrar"
   → POST /api/vidraceiro/identificar
   → localStorage.setItem('vidraceiro_token', data.token)
```

---

## Wizard de Orçamento (5 Etapas) — Fluxo de Dados

Todos os cálculos são feitos **exclusivamente no backend**. `calculoUtils.jsx` não deve ser chamado para valores enviados ao servidor.

```
Etapa 1: Selecionar categoria
  → GET /api/configuracao/categorias (público, sem token)

Etapa 2: Selecionar tipologia + preencher variáveis + selecionar cor
  → Ao digitar variável: POST /api/calculo/converter-unidade [debounce 300ms]
  → Ao calcular peças: POST /api/orcamento-dinamico/calcular-pecas
  → Para exibir cores com preço: GET /api/configuracao/tipologias/{id}/cores-com-preco
    [exibir SOMENTE preco_final, NUNCA preco_m2]
  → Ao selecionar cor: POST /api/vidro/validar
    [se alerta.tipo === 'BLOQUEIO' → desabilitar cor + bloquear botão "Avançar"]

Etapa 3: Conferir peças (medidas REAIS — sem arredondamento)
  → dados já retornados por calcular-pecas

Etapa 4: Resumo com medidas ARREDONDADAS e preço final

Etapa 5: Confirmar pedido
  → POST /api/vidraceiro/orcamentos (token do vidraceiro)
  → Exibir numero: "VDX-XXXX" da resposta
```

---

## Padrões de Código

### Debounce 300ms para conversão em tempo real

```jsx
const [debouncedValor, setDebouncedValor] = useState(valor);

useEffect(() => {
  const timer = setTimeout(() => setDebouncedValor(valor), 300);
  return () => clearTimeout(timer);
}, [valor]);

const { data, isFetching } = useQuery({
  queryKey: ['conversao', debouncedValor, unidade],
  queryFn: () => apiBackend.post('/api/calculo/converter-unidade',
                                  { valor: debouncedValor, unidade }),
  enabled: debouncedValor > 0 && !!unidade,
  staleTime: 60_000,
});
```

### Chamadas API — sempre via apiBackend.js + TanStack Query

```js
// CORRETO
const { data } = useQuery({
  queryKey: ['categorias'],
  queryFn: () => apiBackend.get('/api/configuracao/categorias'),
});

// ERRADO — não usar fetch() direto em componentes
const res = await fetch('/api/configuracao/categorias'); // ❌
```

### Estados obrigatórios em todo componente com dados remotos

```jsx
const { data, isLoading, isError } = useQuery({ ... });

if (isLoading) return <Skeleton className="h-32 w-full" />;
if (isError)   return <Alert variant="destructive">Erro ao carregar dados.</Alert>;
if (!data?.length) return <p className="text-center text-muted-foreground">Nenhum item encontrado.</p>;

return <div>{/* renderizar data */}</div>;
```

### ABNT blocking

```jsx
const temBloqueio = alertas?.some(a => a.tipo === 'BLOQUEIO');

<Button
  onClick={handleAvancar}
  disabled={!corSelecionada || temBloqueio}
>
  Avançar para Etapa 3
</Button>

{temBloqueio && (
  <Alert variant="destructive">
    <p>{alertas.find(a => a.tipo === 'BLOQUEIO')?.mensagem}</p>
    <small>{alertas.find(a => a.tipo === 'BLOQUEIO')?.normaReferencia}</small>
  </Alert>
)}
```

### Exibição de preço — nunca exibir preco_m2

```jsx
// CORRETO — mostrar apenas o preço final
<span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cor.preco_final)}</span>

// ERRADO — nunca exibir preço por m² ao vidraceiro
<span>R$ {cor.preco_m2}/m²</span> // ❌
```

### Mobile-first obrigatório

```jsx
// CORRETO — base mobile, ampliar para telas maiores
<div className="w-full sm:w-1/2 lg:w-1/3">

// ERRADO — desktop-first
<div className="hidden lg:block">  // ❌
```

---

## Rotas

| Path | Componente | Auth | Quem acessa |
|------|-----------|------|-------------|
| `/` | `Home` | pública | qualquer |
| `/orcamento` | `OrcamentoPublico` | pública* | vidraceiro |
| `/orcamento/:id` | `QuoteDetail` | localStorage vidraceiro | vidraceiro |
| `/historico` | `QuoteHistory` | localStorage vidraceiro | vidraceiro |
| `/em-aberto` | `OpenQuotes` | pública | qualquer |
| `/admin/login` | `Login` | pública | vendedor |
| `/admin/dashboard` | `Dashboard` | localStorage admin | vendedor |
| `/admin/orcamentos/novo` | `NovoOrcamento` | localStorage admin | vendedor |
| `/admin/categorias` | `Categorias` | localStorage admin | vendedor |
| `/admin/tipologias` | `Tipologias` | localStorage admin | vendedor |
| `/admin/configuracoes-tecnicas` | `ConfiguracoesTecnicas` | localStorage admin | vendedor |
| `/admin/produtos` | `Produtos` | localStorage admin | vendedor |

*`/orcamento` é público para navegação, mas o `POST` final exige token.

---

## Erros Conhecidos no Código Atual

| Arquivo | Erro | Correção (task) |
|---------|------|-----------------|
| `AuthContext.jsx:7` | `mock_admin_token_12345` hardcoded | Remover; ler `localStorage('vidraceiro_token')` → F1 |
| `app-params.js:44` | `mock_admin_token_12345` hardcoded | Remover; ler `?phone=&name=` → F1 |
| `ProtectedRoute.jsx` | Usa `useAuth()` (vidraceiro) em vez de `useAdminAuth()` | Corrigir para `AdminAuthContext` → F4 |
| `ProtectedRoute.jsx` | Redireciona para `/` em vez de `/admin/login` | Corrigir redirect → F4 |
| `api.js` | `entities.Categoria.create` undefined → crash ao salvar | Implementar CRUD real → F6 |
| `api.js` | `orcamentosLocal` array in-memory | Substituir por `POST /api/vidraceiro/orcamentos` → F9 |
| `AdminAuthContext.jsx` | Arquivo não existe | Criar → F2 |
| `IdentificacaoModal.jsx` | Arquivo não existe | Criar → F3 |
| `pages/admin/Login.jsx` | Arquivo não existe | Criar → F5 |

---

## Convenções UI

- **Toasts para erros de API**: usar `sonner` (já instalado via shadcn). Nunca `alert()` ou `console.error` visível ao usuário.
- **Loading states**: sempre skeleton ou spinner enquanto `isLoading === true`.
- **Invalidação de cache**: após mutation bem-sucedida, `queryClient.invalidateQueries(['chave'])`.
- **Formatação de preço**: `new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)`.
- **Ícones**: Lucide React exclusivamente. Zero emoji em código.
- **Zero `console.log`** em código commitado.
- **Componentes**: máximo ~150 linhas. Extrair componente filho se crescer.
- **Status badges**:
  - `AGUARDANDO_APROVACAO` → cinza
  - `AGUARDANDO_PAGAMENTO` → amarelo
  - `EM_PRODUCAO` → azul
  - `AGUARDANDO_RETIRADA` → verde
  - `CANCELADO` → vermelho

---

## Decisões Arquiteturais

| Decisão | O que NÃO fazer |
|---------|-----------------|
| `localStorage` para token do vidraceiro | Não usar `sessionStorage` (token não persistiria entre recargas) |
| `localStorage` para token admin | Não misturar com o token do vidraceiro (chaves diferentes) |
| Backend-only para todos os cálculos | Não usar `calculoUtils.jsx` como fonte de verdade |
| Debounce 300ms na conversão | Não disparar request a cada keystroke |
| `preco_final` exibido, não `preco_m2` | Nunca mostrar preço por m² ao vidraceiro |
| Token removido da URL após leitura | Não deixar `?phone=` ou `?name=` na URL (risco de leak via Referer) |
| Duas sessões paralelas e independentes | Não compartilhar estado entre `AuthContext` e `AdminAuthContext` |
| ABNT `BLOQUEIO` desabilita botão | Não apenas exibir aviso — desabilitar o avanço |
| `POST /api/vidraceiro/orcamentos` para finalizar | Não chamar `POST /api/orcamentos` do wizard público |
| `AdminAuthContext` com `useAdminAuth()` | Não usar `useAuth()` (vidraceiro) em rotas admin |
