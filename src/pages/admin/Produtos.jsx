import React, { useState } from "react";
import { entities, integrations } from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  DollarSign,
  ShoppingCart,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRODUTO_INICIAL = {
  nome: '',
  codigo: '',
  categoria_id: '',
  descricao: '',
  preco: 0,
  imagem_url: '',
  unidade: 'unidade',
  estoque: true,
  estoque_quantidade: 0,
  ativo: true,
  ordem: 0
};

const CATEGORIA_PRODUTO_INICIAL = {
  nome: '',
  descricao: '',
  ordem: 0,
  ativo: true
};

export default function Produtos() {
  const queryClient = useQueryClient();
  
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formProduto, setFormProduto] = useState(PRODUTO_INICIAL);
  const [produtoExcluir, setProdutoExcluir] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  
  // Estados para Categorias de Produtos
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [formCategoria, setFormCategoria] = useState(CATEGORIA_PRODUTO_INICIAL);
  const [categoriaExcluir, setCategoriaExcluir] = useState(null);

  const { data: produtos = [], isLoading: loadingProdutos } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => entities.Produto.list('ordem')
  });

  const { data: categoriasProduto = [], isLoading: loadingCategorias } = useQuery({
    queryKey: ['categoriasProduto'],
    queryFn: () => entities.CategoriaProduto.list('ordem')
  });

  const produtosFiltrados = React.useMemo(() => {
    if (filtroCategoria === 'todos') return produtos;
    return produtos.filter(p => p.categoria_id === filtroCategoria || (p.categoria && p.categoria === filtroCategoria));
  }, [produtos, filtroCategoria]);

  const createProdutoMutation = useMutation({
    mutationFn: (data) => entities.Produto.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['produtos']);
      setModalProdutoAberto(false);
      setFormProduto(PRODUTO_INICIAL);
    }
  });

  const updateProdutoMutation = useMutation({
    mutationFn: ({ id, data }) => entities.Produto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['produtos']);
      setModalProdutoAberto(false);
      setProdutoEditando(null);
      setFormProduto(PRODUTO_INICIAL);
    }
  });

  const deleteProdutoMutation = useMutation({
    mutationFn: (id) => entities.Produto.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['produtos']);
      setProdutoExcluir(null);
    }
  });

  const abrirNovoProduto = () => {
    setProdutoEditando(null);
    setFormProduto({ ...PRODUTO_INICIAL, ordem: produtos.length });
    setModalProdutoAberto(true);
  };

  const abrirEdicaoProduto = (produto) => {
    setProdutoEditando(produto);
    setFormProduto({
      nome: produto.nome || '',
      codigo: produto.codigo || '',
      categoria_id: produto.categoria_id || (produto.categoria ? '' : ''),
      descricao: produto.descricao || '',
      preco: produto.preco || 0,
      imagem_url: produto.imagem_url || '',
      unidade: produto.unidade || 'unidade',
      estoque: produto.estoque !== false,
      estoque_quantidade: produto.estoque_quantidade || 0,
      ativo: produto.ativo !== false,
      ordem: produto.ordem || 0
    });
    setModalProdutoAberto(true);
  };

  // Funções para Categorias de Produtos
  const createCategoriaMutation = useMutation({
    mutationFn: (data) => entities.CategoriaProduto.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categoriasProduto']);
      setModalCategoriaAberto(false);
      setFormCategoria(CATEGORIA_PRODUTO_INICIAL);
    }
  });

  const updateCategoriaMutation = useMutation({
    mutationFn: ({ id, data }) => entities.CategoriaProduto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categoriasProduto']);
      setModalCategoriaAberto(false);
      setCategoriaEditando(null);
      setFormCategoria(CATEGORIA_PRODUTO_INICIAL);
    }
  });

  const deleteCategoriaMutation = useMutation({
    mutationFn: (id) => entities.CategoriaProduto.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categoriasProduto']);
      setCategoriaExcluir(null);
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const abrirNovaCategoria = () => {
    setCategoriaEditando(null);
    setFormCategoria({ ...CATEGORIA_PRODUTO_INICIAL, ordem: categoriasProduto.length });
    setModalCategoriaAberto(true);
  };

  const abrirEdicaoCategoria = (categoria) => {
    setCategoriaEditando(categoria);
    setFormCategoria({
      nome: categoria.nome || '',
      descricao: categoria.descricao || '',
      ordem: categoria.ordem || 0,
      ativo: categoria.ativo !== false
    });
    setModalCategoriaAberto(true);
  };

  const salvarCategoria = () => {
    if (categoriaEditando) {
      updateCategoriaMutation.mutate({ id: categoriaEditando.id, data: formCategoria });
    } else {
      createCategoriaMutation.mutate(formCategoria);
    }
  };

  const salvarProduto = () => {
    if (produtoEditando) {
      updateProdutoMutation.mutate({ id: produtoEditando.id, data: formProduto });
    } else {
      createProdutoMutation.mutate(formProduto);
    }
  };

  const handleProdutoImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await integrations.Core.UploadFile({ file });
    setFormProduto({ ...formProduto, imagem_url: file_url });
  };


  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Produtos Comerciais</h1>
        <p className="text-slate-500 mt-1">Gerencie produtos comercializáveis (puxadores, ferragens, acessórios)</p>
      </div>

      <Tabs defaultValue="produtos" className="w-full">
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>Itens que podem ser adicionados ao orçamento e carrinho</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {categoriasProduto.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={abrirNovoProduto} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingProdutos ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>Nenhum produto cadastrado</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtosFiltrados.map((produto, i) => (
                <motion.div
                  key={produto.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`h-full ${!produto.ativo ? 'opacity-60' : ''}`}>
                    {produto.imagem_url ? (
                      <div className="aspect-video bg-slate-100 overflow-hidden rounded-t-xl">
                        <img 
                          src={produto.imagem_url} 
                          alt={produto.nome}
                          className="w-full h-full object-contain p-4"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center rounded-t-xl">
                        <Package className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {(() => {
                              const categoria = categoriasProduto.find(c => c.id === produto.categoria_id) || 
                                (produto.categoria ? { nome: produto.categoria } : null);
                              return categoria ? (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                                  {categoria.nome}
                                </span>
                              ) : null;
                            })()}
                            {produto.estoque && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                                Estoque: {produto.estoque_quantidade}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900 truncate">{produto.nome}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{produto.codigo}</p>
                        </div>
                      </div>
                      
                      {produto.descricao && (
                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">{produto.descricao}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                        <div>
                          <p className="text-lg font-bold text-slate-900">
                            R$ {produto.preco.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">por {produto.unidade}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => abrirEdicaoProduto(produto)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setProdutoExcluir(produto)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Produto */}
      <Dialog open={modalProdutoAberto} onOpenChange={setModalProdutoAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={formProduto.nome}
                  onChange={(e) => setFormProduto({...formProduto, nome: e.target.value})}
                  placeholder="Nome do produto"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Código</Label>
                <Input
                  value={formProduto.codigo}
                  onChange={(e) => setFormProduto({...formProduto, codigo: e.target.value})}
                  placeholder="Código do produto"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria *</Label>
                <Select
                  value={formProduto.categoria_id || undefined}
                  onValueChange={(value) => setFormProduto({...formProduto, categoria_id: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasProduto.filter(c => c.ativo).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unidade</Label>
                <Select
                  value={formProduto.unidade}
                  onValueChange={(value) => setFormProduto({...formProduto, unidade: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="metro">Metro</SelectItem>
                    <SelectItem value="kit">Kit</SelectItem>
                    <SelectItem value="par">Par</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formProduto.descricao}
                onChange={(e) => setFormProduto({...formProduto, descricao: e.target.value})}
                placeholder="Descrição do produto"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formProduto.preco}
                  onChange={(e) => setFormProduto({...formProduto, preco: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={formProduto.ordem}
                  onChange={(e) => setFormProduto({...formProduto, ordem: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Imagem</Label>
              <div className="mt-1 flex items-center gap-4">
                {formProduto.imagem_url ? (
                  <div className="relative">
                    <img 
                      src={formProduto.imagem_url} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => setFormProduto({...formProduto, imagem_url: ''})}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Package className="w-6 h-6 text-slate-400" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleProdutoImageUpload} />
                  </label>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Controle de Estoque</Label>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-slate-600">Ativar estoque</span>
                  <Switch
                    checked={formProduto.estoque}
                    onCheckedChange={(checked) => setFormProduto({...formProduto, estoque: checked})}
                  />
                </div>
              </div>
              {formProduto.estoque && (
                <div>
                  <Label>Quantidade em Estoque</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formProduto.estoque_quantidade}
                    onChange={(e) => setFormProduto({...formProduto, estoque_quantidade: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch
                checked={formProduto.ativo}
                onCheckedChange={(checked) => setFormProduto({...formProduto, ativo: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalProdutoAberto(false)}>Cancelar</Button>
            <Button 
              onClick={salvarProduto} 
              disabled={!formProduto.nome || !formProduto.preco || !formProduto.categoria_id || createProdutoMutation.isPending || updateProdutoMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerta de Exclusão de Produto */}
      <AlertDialog open={!!produtoExcluir} onOpenChange={() => setProdutoExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{produtoExcluir?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProdutoMutation.mutate(produtoExcluir?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </TabsContent>

        <TabsContent value="categorias">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categorias de Produtos</CardTitle>
                <CardDescription>Gerencie as categorias dos produtos comercializáveis</CardDescription>
              </div>
              <Button onClick={abrirNovaCategoria} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </CardHeader>
            <CardContent>
              {loadingCategorias ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : categoriasProduto.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Tag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>Nenhuma categoria cadastrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {categoriasProduto.map((categoria, i) => (
                    <motion.div
                      key={categoria.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all ${!categoria.ativo ? 'opacity-60' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{categoria.nome}</h3>
                          {!categoria.ativo && (
                            <Badge variant="secondary" className="text-xs">Inativa</Badge>
                          )}
                        </div>
                        {categoria.descricao && (
                          <p className="text-sm text-slate-500">{categoria.descricao}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => abrirEdicaoCategoria(categoria)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setCategoriaExcluir(categoria)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal Categoria */}
          <Dialog open={modalCategoriaAberto} onOpenChange={setModalCategoriaAberto}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={formCategoria.nome}
                    onChange={(e) => setFormCategoria({...formCategoria, nome: e.target.value})}
                    placeholder="Nome da categoria"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={formCategoria.descricao}
                    onChange={(e) => setFormCategoria({...formCategoria, descricao: e.target.value})}
                    placeholder="Descrição da categoria"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ordem</Label>
                    <Input
                      type="number"
                      value={formCategoria.ordem}
                      onChange={(e) => setFormCategoria({...formCategoria, ordem: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Ativo</Label>
                    <Switch
                      checked={formCategoria.ativo}
                      onCheckedChange={(checked) => setFormCategoria({...formCategoria, ativo: checked})}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalCategoriaAberto(false)}>Cancelar</Button>
                <Button 
                  onClick={salvarCategoria} 
                  disabled={!formCategoria.nome || createCategoriaMutation.isPending || updateCategoriaMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Alerta de Exclusão de Categoria */}
          <AlertDialog open={!!categoriaExcluir} onOpenChange={() => setCategoriaExcluir(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir "{categoriaExcluir?.nome}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteCategoriaMutation.mutate(categoriaExcluir?.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
