import React, { useState } from "react";
import { entities, integrations } from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  GripVertical,
  Save,
  X,
  Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

const FORM_INICIAL = {
  nome: '',
  descricao: '',
  icone: '',
  imagem_url: '',
  ordem: 0,
  ativo: true
};

export default function Categorias() {
  const queryClient = useQueryClient();
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [categoriaExcluir, setCategoriaExcluir] = useState(null);

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => entities.Categoria.list('ordem')
  });

  const createMutation = useMutation({
    mutationFn: (data) => entities.Categoria.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categorias']);
      fecharModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => entities.Categoria.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categorias']);
      fecharModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.Categoria.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categorias']);
      setCategoriaExcluir(null);
    }
  });

  const abrirNovaCategoria = () => {
    setCategoriaEditando(null);
    setFormData({ ...FORM_INICIAL, ordem: categorias.length });
    setModalAberto(true);
  };

  const abrirEdicao = (categoria) => {
    setCategoriaEditando(categoria);
    setFormData({
      nome: categoria.nome || '',
      descricao: categoria.descricao || '',
      icone: categoria.icone || '',
      imagem_url: categoria.imagem_url || '',
      ordem: categoria.ordem || 0,
      ativo: categoria.ativo !== false
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCategoriaEditando(null);
    setFormData(FORM_INICIAL);
  };

  const salvar = () => {
    if (categoriaEditando) {
      updateMutation.mutate({ id: categoriaEditando.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { file_url } = await integrations.Core.UploadFile({ file });
    setFormData({ ...formData, imagem_url: file_url });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Categorias</h1>
          <p className="text-slate-500 mt-1">Organize suas tipologias em categorias</p>
        </div>
        <Button onClick={abrirNovaCategoria} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : categorias.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <LayoutGrid className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Nenhuma categoria cadastrada</p>
            <Button onClick={abrirNovaCategoria} className="mt-4 bg-blue-600 hover:bg-blue-700">
              Criar primeira categoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categorias.map((categoria, i) => (
            <motion.div
              key={categoria.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`${!categoria.ativo ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-300 cursor-move">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    {categoria.imagem_url ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img 
                          src={categoria.imagem_url} 
                          alt={categoria.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-blue-600">
                          {categoria.nome?.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{categoria.nome}</h3>
                        {!categoria.ativo && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Inativa</span>
                        )}
                      </div>
                      {categoria.descricao && (
                        <p className="text-sm text-slate-500 mt-1 truncate">{categoria.descricao}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => abrirEdicao(categoria)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setCategoriaExcluir(categoria)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* Modal de Edição */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Janelas"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descrição da categoria"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Imagem</Label>
              <div className="mt-1 flex items-center gap-4">
                {formData.imagem_url ? (
                  <div className="relative">
                    <img 
                      src={formData.imagem_url} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => setFormData({...formData, imagem_url: ''})}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Image className="w-6 h-6 text-slate-400" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Ativa</Label>
              <Switch
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={fecharModal}>Cancelar</Button>
            <Button 
              onClick={salvar} 
              disabled={!formData.nome || createMutation.isPending || updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={!!categoriaExcluir} onOpenChange={() => setCategoriaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{categoriaExcluir?.nome}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(categoriaExcluir?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}