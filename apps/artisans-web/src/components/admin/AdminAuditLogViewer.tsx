import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Search, FileText, Shield, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AdminSyncIndicator } from './AdminSyncIndicator';

interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  admin_user_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

const PAGE_SIZE = 20;

const fetchAuditLogs = async (page: number, filter: string, search: string): Promise<{ data: AuditLogEntry[], count: number }> => {
  let query = supabase
    .from('admin_audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (filter && filter !== 'all') {
    query = query.eq('resource_type', filter);
  }

  if (search) {
    query = query.or(`action.ilike.%${search}%,resource_type.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { 
    data: (data || []) as AuditLogEntry[], 
    count: count || 0 
  };
};

export const AdminAuditLogViewer: React.FC = () => {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, isError, refetch, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ['admin-audit-log', page, filter, search],
    queryFn: () => fetchAuditLogs(page, filter, search),
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const getActionBadgeVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (action.includes('delete') || action.includes('remove')) return 'destructive';
    if (action.includes('create') || action.includes('add')) return 'default';
    if (action.includes('update') || action.includes('modify')) return 'secondary';
    return 'outline';
  };

  const totalPages = Math.ceil((data?.count || 0) / PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">Registro de Auditoría</CardTitle>
            <Badge variant="outline">{data?.count || 0} registros</Badge>
          </div>
          <AdminSyncIndicator
            lastUpdated={dataUpdatedAt}
            isFetching={isFetching}
            isError={isError}
            onRefresh={() => refetch()}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-4">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar acciones..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="max-w-xs"
            />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <Select value={filter} onValueChange={(value) => { setFilter(value); setPage(0); }}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="user">Usuario</SelectItem>
              <SelectItem value="product">Producto</SelectItem>
              <SelectItem value="order">Orden</SelectItem>
              <SelectItem value="shop">Tienda</SelectItem>
              <SelectItem value="moderation">Moderación</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Cargando registros...
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Error al cargar el registro de auditoría</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Fecha</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Recurso ID</TableHead>
                    <TableHead className="w-[200px]">Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(entry.action)}>
                          {entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.resource_type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {entry.resource_id ? entry.resource_id.slice(0, 8) + '...' : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {entry.details ? JSON.stringify(entry.details).slice(0, 50) + '...' : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {data?.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay registros de auditoría
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
