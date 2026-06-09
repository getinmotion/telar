import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const meta: Meta = { title: 'UI/Data display' };
export default meta;

export const TabsStory: StoryObj = {
  name: 'Tabs',
  render: () => (
    <Tabs defaultValue="piezas" className="max-w-md">
      <TabsList>
        <TabsTrigger value="piezas">Piezas</TabsTrigger>
        <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        <TabsTrigger value="taller">Taller</TabsTrigger>
      </TabsList>
      <TabsContent value="piezas" className="glass-card-sm rounded-xl p-4 mt-2 text-sm">
        Listado de piezas del artesano.
      </TabsContent>
      <TabsContent value="pedidos" className="glass-card-sm rounded-xl p-4 mt-2 text-sm">
        Pedidos en curso.
      </TabsContent>
      <TabsContent value="taller" className="glass-card-sm rounded-xl p-4 mt-2 text-sm">
        Información del taller.
      </TabsContent>
    </Tabs>
  ),
};

export const Tabla: StoryObj = {
  render: () => (
    <div className="glass-card rounded-2xl p-4 max-w-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pieza</TableHead>
            <TableHead>Oficio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Precio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Mochila wayuu</TableCell>
            <TableCell>Tejeduría</TableCell>
            <TableCell><Badge variant="success">Publicada</Badge></TableCell>
            <TableCell className="text-right">$350.000</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Jarrón de barro</TableCell>
            <TableCell>Cerámica</TableCell>
            <TableCell><Badge variant="warning">En revisión</Badge></TableCell>
            <TableCell className="text-right">$180.000</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

export const SkeletonStory: StoryObj = {
  name: 'Skeleton',
  render: () => (
    <div className="glass-card rounded-2xl p-6 max-w-sm space-y-3">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};
