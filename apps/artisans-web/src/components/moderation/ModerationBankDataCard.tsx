import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  Building2, 
  User, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Save,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BANKS_DATA } from '@/data/cobreBankData';
import { toast } from 'sonner';

interface CounterpartyData {
  id: string;
  alias?: string;
  holder_name?: string;
  bank_name?: string;
  account_number?: string;
  account_type?: string;
  document_type?: string;
  document_number?: string;
  status?: string;
  metadata?: {
    counterparty_fullname?: string;
    beneficiary_institution?: string;
    account_number?: string;
    counterparty_id_type?: string;
    counterparty_id_number?: string;
  };
}

interface ModerationBankDataCardProps {
  shopId: string;
  idContraparty: string | null;
  onBankDataCreated?: () => void;
}

interface BankFormData {
  holder_name: string;
  document_type: string;
  document_number: string;
  bank_code: string;
  account_type: string;
  account_number: string;
}

const initialFormData: BankFormData = {
  holder_name: '',
  document_type: 'cc',
  document_number: '',
  bank_code: '',
  account_type: 'ch',
  account_number: '',
};

export const ModerationBankDataCard: React.FC<ModerationBankDataCardProps> = ({
  shopId,
  idContraparty,
  onBankDataCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bankData, setBankData] = useState<CounterpartyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<BankFormData>(initialFormData);

  useEffect(() => {
    if (idContraparty) {
      fetchCounterpartyData();
    }
  }, [idContraparty]);

  const fetchCounterpartyData = async () => {
    if (!idContraparty) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError('No autorizado');
        return;
      }

      const { data, error: fetchError } = await supabase.functions.invoke(
        'get-counterparty',
        { body: { counterparty_id: idContraparty } }
      );

      if (fetchError) {
        throw new Error('Error al obtener datos bancarios');
      }

      setBankData(data);
    } catch (err) {
      console.error('Error fetching counterparty:', err);
      setError('No se pudieron cargar los datos bancarios');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof BankFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate all fields
    if (!formData.holder_name || !formData.document_number || !formData.bank_code || !formData.account_number) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    setSaving(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'create-counterparty-admin',
        { 
          body: { 
            shopId, 
            bankData: formData 
          } 
        }
      );

      if (invokeError) {
        throw new Error(invokeError.message || 'Error al crear datos bancarios');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success('Datos bancarios creados exitosamente');
      setIsFormOpen(false);
      setFormData(initialFormData);
      onBankDataCreated?.();
    } catch (err: any) {
      console.error('Error creating bank data:', err);
      toast.error(err.message || 'Error al crear datos bancarios');
    } finally {
      setSaving(false);
    }
  };

  const maskAccountNumber = (account: string) => {
    if (!account || account.length < 4) return account;
    return `****${account.slice(-4)}`;
  };

  const maskDocument = (doc: string) => {
    if (!doc || doc.length < 3) return doc;
    return `****${doc.slice(-3)}`;
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      cc: 'Cédula de Ciudadanía',
      pa: 'Pasaporte',
      nit: 'NIT',
      ce: 'Cédula de Extranjería',
    };
    return types[type] || type;
  };

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      ch: 'Ahorros',
      cc: 'Corriente',
      r2p: 'R2P',
      dp: 'Depósito electrónico',
      'breb-key': 'Llave Bre-b',
      r2p_breb: 'Recaudo Bre-b',
    };
    return types[type] || type;
  };

  const getBankName = (code: string) => {
    const bank = BANKS_DATA.find(b => b.code === code);
    return bank?.name || code;
  };

  const getStatusBadge = () => {
    if (!idContraparty) {
      return (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="w-3 h-3" />
          Sin configurar
        </Badge>
      );
    }
    if (loading) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Cargando
        </Badge>
      );
    }
    if (error) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="w-3 h-3" />
          Error
        </Badge>
      );
    }
    return (
      <Badge className="gap-1 bg-success text-success-foreground">
        <CheckCircle className="w-3 h-3" />
        Activo
      </Badge>
    );
  };

  // Render form for creating bank data
  if (isFormOpen) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Agregar Datos Bancarios
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsFormOpen(false);
                setFormData(initialFormData);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holder_name">Nombre del Titular *</Label>
            <Input
              id="holder_name"
              value={formData.holder_name}
              onChange={(e) => handleChange('holder_name', e.target.value)}
              placeholder="Nombre completo como aparece en la cuenta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document_type">Tipo de Documento *</Label>
              <Select
                value={formData.document_type}
                onValueChange={(value) => handleChange('document_type', value)}
              >
                <SelectTrigger id="document_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cc">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="pa">Pasaporte</SelectItem>
                  <SelectItem value="nit">NIT</SelectItem>
                  <SelectItem value="ce">Cédula de Extranjería</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_number">Número de Documento *</Label>
              <Input
                id="document_number"
                value={formData.document_number}
                onChange={(e) => handleChange('document_number', e.target.value)}
                placeholder="Ej: 1234567890"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_type">Tipo de Cuenta *</Label>
              <Select
                value={formData.account_type}
                onValueChange={(value) => handleChange('account_type', value)}
              >
                <SelectTrigger id="account_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ch">Ahorros</SelectItem>
                  <SelectItem value="cc">Corriente</SelectItem>
                  <SelectItem value="r2p">R2P</SelectItem>
                  <SelectItem value="dp">Depósito electrónico</SelectItem>
                  <SelectItem value="breb-key">Llave Bre-b</SelectItem>
                  <SelectItem value="r2p_breb">Recaudo Bre-b</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_code">Banco *</Label>
              <Select
                value={formData.bank_code}
                onValueChange={(value) => handleChange('bank_code', value)}
              >
                <SelectTrigger id="bank_code">
                  <SelectValue placeholder="Selecciona un banco" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS_DATA.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number">
              {formData.account_type === 'breb-key' || formData.account_type === 'r2p_breb'
                ? 'Llave Bre-b *'
                : 'Número de Cuenta *'}
            </Label>
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={(e) => handleChange('account_number', e.target.value)}
              placeholder={
                formData.account_type === 'breb-key' || formData.account_type === 'r2p_breb'
                  ? 'Ej: alias@banco'
                  : 'Ej: 1234567890'
              }
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsFormOpen(false);
                setFormData(initialFormData);
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Datos Bancarios (Cobre)
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {!idContraparty ? (
          <div className="text-center py-6">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-1">
              El artesano no ha configurado sus datos bancarios
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              No puede recibir pagos hasta completar este paso
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFormOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar Datos Bancarios
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-6 text-destructive">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{error}</p>
          </div>
        ) : bankData ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  Titular
                </div>
                <p className="text-sm font-medium">
                  {bankData.metadata?.counterparty_fullname || bankData.alias || 'N/A'}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3" />
                  Banco
                </div>
                <p className="text-sm font-medium">
                  {getBankName(bankData.metadata?.beneficiary_institution || '') || 'N/A'}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CreditCard className="w-3 h-3" />
                  Cuenta
                </div>
                <p className="text-sm font-medium">
                  {maskAccountNumber(bankData.metadata?.account_number || '')}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  Documento
                </div>
                <p className="text-sm font-medium">
                  {bankData.metadata?.counterparty_id_type && (
                    <span className="text-xs text-muted-foreground mr-1">
                      {getDocumentTypeLabel(bankData.metadata.counterparty_id_type)}
                    </span>
                  )}
                  {maskDocument(bankData.metadata?.counterparty_id_number || '')}
                </p>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                ID Contraparty: <code className="bg-muted px-1 rounded">{idContraparty}</code>
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
