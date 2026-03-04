import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9090';

async function identificarRequest(payload) {
  const res = await fetch(`${API_BASE}/api/vidraceiro/identificar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Erro ao identificar');
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export default function IdentificacaoModal({ open, phone, name }) {
  const { login } = useAuth();
  const [docType, setDocType]         = useState('CPF');
  const [documento, setDocumento]     = useState('');
  const [nome, setNome]               = useState(name || '');
  const [telefone, setTelefone]       = useState(phone || '');
  const [mostrarNome, setMostrarNome] = useState(!!name);
  const [erro, setErro]               = useState(null);

  const mutation = useMutation({
    mutationFn: identificarRequest,
    onSuccess: (data) => login(data.token),
    onError: (error) => {
      if (error.status === 404) {
        setMostrarNome(true);
        setErro('Cliente não encontrado. Informe seu nome para continuar.');
      } else {
        setErro('Erro ao identificar. Tente novamente.');
      }
    },
  });

  const formatDocumento = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, docType === 'CPF' ? 11 : 14);
    if (docType === 'CPF') {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const handleDocTypeChange = (tipo) => {
    setDocType(tipo);
    setDocumento('');
    setErro(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro(null);
    mutation.mutate({
      doc_type: docType,
      documento: documento.replace(/\D/g, ''),
      nome: nome || undefined,
      telefone: telefone || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Identificação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex rounded-lg border overflow-hidden">
            {['CPF', 'CNPJ'].map((tipo) => (
              <button
                key={tipo}
                type="button"
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  docType === tipo
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => handleDocTypeChange(tipo)}
              >
                {tipo}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="documento">{docType}</Label>
            <Input
              id="documento"
              type="text"
              inputMode="numeric"
              placeholder={docType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
              value={documento}
              onChange={(e) => setDocumento(formatDocumento(e.target.value))}
              required
            />
          </div>

          {mostrarNome && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefone">
                  Telefone{' '}
                  <span className="text-slate-400 text-xs font-normal">(opcional)</span>
                </Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="+55 11 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
            </>
          )}

          {erro && (
            <Alert variant="destructive">
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Entrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
