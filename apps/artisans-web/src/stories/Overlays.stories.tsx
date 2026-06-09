import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const meta: Meta = { title: 'UI/Overlays' };
export default meta;

export const Dialogo: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild><Button>Abrir diálogo</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Publicar esta pieza?</DialogTitle>
          <DialogDescription>
            La pieza será visible en el marketplace después de la revisión.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost">Cancelar</Button>
          <Button>Publicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const MenuDesplegable: StoryObj = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline">Acciones</Button></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Pieza</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Editar</DropdownMenuItem>
        <DropdownMenuItem>Duplicar</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const TooltipStory: StoryObj = {
  name: 'Tooltip',
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="outline">Pasa el mouse</Button></TooltipTrigger>
        <TooltipContent>Información contextual</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Toast: StoryObj = {
  render: () => (
    <>
      <Toaster />
      <div className="flex gap-3">
        <Button onClick={() => toast.success('Pieza guardada')}>Toast éxito</Button>
        <Button variant="destructive" onClick={() => toast.error('No se pudo guardar')}>
          Toast error
        </Button>
      </div>
    </>
  ),
};
