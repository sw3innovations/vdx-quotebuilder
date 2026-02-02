import Categorias from './pages/Categorias';
import Configuracoes from './pages/Configuracoes';
import Dashboard from './pages/Dashboard';
import NovoOrcamento from './pages/NovoOrcamento';
import Orcamentos from './pages/Orcamentos';
import Tipologias from './pages/Tipologias';
import Home from './pages/Home';
import OrcamentoPublico from './pages/OrcamentoPublico';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Categorias": Categorias,
    "Configuracoes": Configuracoes,
    "Dashboard": Dashboard,
    "NovoOrcamento": NovoOrcamento,
    "Orcamentos": Orcamentos,
    "Tipologias": Tipologias,
    "Home": Home,
    "OrcamentoPublico": OrcamentoPublico,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};