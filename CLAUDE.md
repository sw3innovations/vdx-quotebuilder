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
│   ├── apiBackend.js          ← cliente HTTP (axios/fetch) com injeção de token
│   └── api.js                 ← facade com transformações de dados
├── lib/
│   ├── AuthContext.jsx        ← auth do VIDRACEIRO (magic link, sessionStorage)
│   ├── AdminAuthContext.jsx   ← auth do VENDEDOR/ADMIN (Supabase, localStorage) [NOVO]
│   ├── app-params.js          ← leitura de ?token= da URL
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
│       ├── Dashboard.jsx            ← stats reais via /api/orcamentos/stats
│       ├── NovoOrcamento.jsx        ← wizard interno (vendedor)
│       ├── Categorias.jsx
│       ├── Tipologias.jsx           ← inclui seção "Preços por Cor"
│       ├── ConfiguracoesTecnicas.jsx
│       ├── Produtos.jsx
│       ├── Vidraceiros.jsx          ← [NOVO] listagem e edição de vidraceiros
│       └── OrcamentoDetalhe.jsx     ← [NOVO] ações de pipeline (aprovar, cancelar)
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx       ← usa AdminAuthContext
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

## Autenticação — Duas Sessões Separadas

O sistema tem dois tipos de usuário com fluxos de auth completamente independentes:

### Vidraceiro (rotas públicas `/`)
- Token chega via `?token={magic_link_jwt}` na URL
- `app-params.js` lê o token, salva em **`sessionStorage`** (`vidraceiro_token`), remove da URL
- `AuthContext.jsx` verifica sessão chamando `GET /api/vidraceiro/me`
- `apiBackend.js` injeta `Authorization: Bearer {token}` automaticamente nas chamadas para `/api/vidraceiro/*`
- Sessão encerra ao fechar a aba (sessionStorage ≠ localStorage)

```js
// app-params.js — leitura do token (executar no load da app)
const token = new URLSearchParams(window.location.search).get('token');
if (token) {
  sessionStorage.setItem('vidraceiro_token', token);
  window.history.replaceState({}, '', window.location.pathname); // remove da URL
}
```

### Vendedor/Admin (rotas `/admin/*`)
- Auth via Supabase (email + senha)
- Token salvo em **`localStorage`**
- `AdminAuthContext.jsx` gerencia a sessão do vendedor
- `ProtectedRoute.jsx` usa `AdminAuthContext`

**As duas sessões não interferem.** Um vidraceiro autenticado não acessa rotas `/admin/*`; um vendedor autenticado não acessa endpoints `/api/vidraceiro/*` (o backend rejeitará com 401 — token errado).

---

## Wizard de Orçamento (5 Etapas) — Fluxo de Dados

Todos os cálculos são feitos **exclusivamente no backend**. `calculoUtils.jsx` não deve ser chamado para valores enviados ao servidor.

```
Etapa 1: Selecionar categoria
  → GET /api/configuracao/categorias (público, sem token)

Etapa 2: Selecionar tipologia + preencher variáveis + selecionar cor
  → Ao digitar variável: POST /api/calculo/converter-unidade
    [debounce 300ms — ver padrão abaixo]
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
// ConversaoTempoReal.jsx — padrão obrigatório
const [debouncedValor, setDebouncedValor] = useState(valor);

useEffect(() => {
  const timer = setTimeout(() => setDebouncedValor(valor), 300);
  return () => clearTimeout(timer); // cancela se usuario continuar digitando
}, [valor]);

const { data, isFetching } = useQuery({
  queryKey: ['conversao', debouncedValor, unidade],
  queryFn: () => apiBackend.post('/api/calculo/converter-unidade',
                                  { valor: debouncedValor, unidade }),
  enabled: debouncedValor > 0 && !!unidade,
  staleTime: 60_000,
});

// Exibir isFetching como skeleton durante o fetch
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

### Injeção automática de token

```js
// apiBackend.js — interceptor de request
const getAuthHeader = (path) => {
  if (path.startsWith('/api/vidraceiro/')) {
    const token = sessionStorage.getItem('vidraceiro_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  if (path.startsWith('/admin') || path.startsWith('/api/orcamentos')) {
    const token = localStorage.getItem('supabase_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {}; // rotas públicas
};
```

### ABNT blocking

```jsx
// RecomendacaoABNT.jsx — regra de bloqueio
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
<span>R$ {formatBRL(cor.preco_final)}</span>

// ERRADO — nunca exibir preço por m² ao vidraceiro
<span>R$ {cor.preco_m2}/m²</span> // ❌
```

---

## Rotas

| Path | Componente | Auth | Quem acessa |
|------|-----------|------|-------------|
| `/` | `Home` | pública | qualquer |
| `/orcamento` | `OrcamentoPublico` | pública* | vidraceiro |
| `/orcamento/:id` | `QuoteDetail` | sessionStorage | vidraceiro |
| `/historico` | `QuoteHistory` | sessionStorage | vidraceiro |
| `/em-aberto` | `OpenQuotes` | pública | qualquer |
| `/admin/dashboard` | `Dashboard` | localStorage (Supabase) | vendedor |
| `/admin/orcamentos/novo` | `NovoOrcamento` | localStorage | vendedor |
| `/admin/categorias` | `Categorias` | localStorage | vendedor |
| `/admin/tipologias` | `Tipologias` | localStorage | vendedor |
| `/admin/configuracoes-tecnicas` | `ConfiguracoesTecnicas` | localStorage | vendedor |
| `/admin/produtos` | `Produtos` | localStorage | vendedor |
| `/admin/vidraceiros` | `Vidraceiros` | localStorage | vendedor |

*`/orcamento` é público para navegação, mas o `POST` final exige token.

---

## Decisões Arquiteturais

| Decisão | O que NÃO fazer |
|---------|-----------------|
| `sessionStorage` para token do vidraceiro | Não usar `localStorage` (token expiraria entre visitas) |
| `localStorage` para token Supabase do admin | Não misturar com sessionStorage do vidraceiro |
| Backend-only para todos os cálculos | Não usar `calculoUtils.jsx` como fonte de verdade |
| Debounce 300ms na conversão | Não disparar request a cada keystroke |
| `preco_final` exibido, não `preco_m2` | Nunca mostrar preço por m² ao vidraceiro |
| Token removido da URL após leitura | Não deixar `?token=` na URL (risco de leak via Referer) |
| Duas sessões paralelas e independentes | Não compartilhar estado entre `AuthContext` e `AdminAuthContext` |
| ABNT `BLOQUEIO` desabilita botão | Não apenas exibir aviso — desabilitar o avanço |
| `POST /api/vidraceiro/orcamentos` para finalizar | Não chamar `POST /api/orcamentos` do wizard público |

---

## O que Estava Mocked (e deve ser substituído)

| Arquivo | O que era mock | Substituição |
|---------|---------------|--------------|
| `AuthContext.jsx` | `'mock_admin_token_12345'` | Leitura real de `sessionStorage` |
| `api.js` | `orcamentosLocal` array em memória | `POST /api/vidraceiro/orcamentos` |
| `Dashboard.jsx` | Números fixos no código | `GET /api/orcamentos/stats` |
| `QuoteHistory.jsx` | Array vazio / stub | `GET /api/vidraceiro/me/orcamentos` |
| `QuoteDetail.jsx` | Dados de exemplo | `GET /api/vidraceiro/me/orcamentos/{id}` |
| `api.js` (Puxadores, Acessórios) | `return []` | Manter stub por ora (P2) |

---

## Convenções UI

- **Toasts para erros de API**: usar `sonner` (já instalado via shadcn). Nunca `alert()` ou `console.error` visível ao usuário.
- **Loading states**: sempre mostrar skeleton ou spinner enquanto `isLoading === true`.
- **Invalidação de cache**: após mutation bem-sucedida, chamar `queryClient.invalidateQueries(['chave'])`.
- **Formatação de preço**: `new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)`.
- **Status badges**:
  - `AGUARDANDO_APROVACAO` → cinza
  - `AGUARDANDO_PAGAMENTO` → amarelo
  - `EM_PRODUCAO` → azul
  - `AGUARDANDO_RETIRADA` → verde
  - `CANCELADO` → vermelho
