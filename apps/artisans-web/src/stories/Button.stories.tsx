import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Botón' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default', 'destructive', 'outline', 'secondary', 'ghost', 'link',
        'warning', 'success', 'premium', 'artisan', 'earth', 'clay', 'moss',
        'golden', 'neon', 'dark-elevated',
      ],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'xl', 'icon', 'pill'] },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Variantes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center max-w-3xl">
      <Button>default</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="outline">outline</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="link">link</Button>
      <Button variant="destructive">destructive</Button>
      <Button variant="warning">warning</Button>
      <Button variant="success">success</Button>
      <Button variant="premium">premium</Button>
      <Button variant="artisan">artisan</Button>
      <Button variant="dark-elevated">dark-elevated</Button>
    </div>
  ),
};

/**
 * ⚠️ Estas variantes referencian colores que NO existen en tailwind.config.ts
 * (wood-brown, terracotta, moss-green, golden-hour) — renderizan sin fondo.
 * Candidatas a eliminar o re-mapear a tokens TELAR.
 */
export const VariantesRotas: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button variant="earth">earth (rota)</Button>
      <Button variant="clay">clay (rota)</Button>
      <Button variant="moss">moss (rota)</Button>
      <Button variant="golden">golden (rota)</Button>
    </div>
  ),
};

export const Tamaños: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button size="sm">sm</Button>
      <Button size="default">default</Button>
      <Button size="lg">lg</Button>
      <Button size="xl">xl</Button>
      <Button size="pill">pill</Button>
      <Button size="icon"><Mail /></Button>
    </div>
  ),
};

export const ConIcono: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button><Mail /> Enviar</Button>
      <Button variant="destructive"><Trash2 /> Eliminar</Button>
      <Button disabled>Deshabilitado</Button>
    </div>
  ),
};
