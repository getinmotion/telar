import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof Card> = { title: 'UI/Card', component: Card };
export default meta;
type Story = StoryObj<typeof Card>;

export const Basica: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mochila wayuu</CardTitle>
          <Badge variant="success">Publicada</Badge>
        </div>
        <CardDescription>Tejeduría · La Guajira</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Pieza tejida a mano en crochet con hilos acrílicos, diseño tradicional de clan.
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Editar</Button>
        <Button size="sm" variant="ghost">Ver en tienda</Button>
      </CardFooter>
    </Card>
  ),
};
