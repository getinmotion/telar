import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const meta: Meta = { title: 'UI/Formularios' };
export default meta;

export const Campos: StoryObj = {
  render: () => (
    <div className="glass-card rounded-2xl p-6 space-y-5 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre de la pieza</Label>
        <Input id="nombre" placeholder="Mochila wayuu doble hebra" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="historia">Historia</Label>
        <Textarea id="historia" placeholder="Cuenta el origen de esta pieza..." />
      </div>
      <div className="space-y-2">
        <Label>Oficio</Label>
        <Select>
          <SelectTrigger><SelectValue placeholder="Selecciona un oficio" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tejeduria">Tejeduría</SelectItem>
            <SelectItem value="ceramica">Cerámica</SelectItem>
            <SelectItem value="talla">Talla en madera</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="hecho-a-mano" />
        <Label htmlFor="hecho-a-mano">Hecho 100% a mano</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="publicado" />
        <Label htmlFor="publicado">Visible en marketplace</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="deshabilitado">Campo deshabilitado</Label>
        <Input id="deshabilitado" disabled value="No editable" />
      </div>
    </div>
  ),
};
