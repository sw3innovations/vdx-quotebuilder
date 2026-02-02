import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Package, 
  LayoutGrid,
  Menu,
  Wrench,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

/**
 * Layout para rotas privadas (admin/backoffice)
 * Inclui sidebar com menu de navegação
 */
export default function AdminLayout({ children }) {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  
  const menuItems = [
    { name: "Dashboard", icon: Home, page: "/admin/dashboard" },
    { name: "Tipologias", icon: Package, page: "/admin/tipologias" },
    { name: "Categorias", icon: LayoutGrid, page: "/admin/categorias" },
    { name: "Config. Técnicas", icon: Wrench, page: "/admin/configuracoes-tecnicas" },
    { name: "Produtos", icon: ShoppingCart, page: "/admin/produtos" },
  ];

  // Normalize pathname for active check
  const currentPath = location.pathname;

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-900 tracking-tight">VDX</h1>
            <p className="text-xs text-slate-500 font-medium">Vidraçaria Digital</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentPath === item.page || 
            (item.page === '/admin/dashboard' && currentPath === '/admin');
          return (
            <Link
              key={item.page}
              to={item.page}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${
                isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
              }`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
          <p className="text-sm text-slate-600 font-medium">Precisa de ajuda?</p>
          <p className="text-xs text-slate-500 mt-1">Entre em contato com suporte</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-white border-r border-slate-200/80">
          <NavContent />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">V</span>
          </div>
          <span className="font-bold text-slate-900">VDX</span>
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="min-h-screen p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
