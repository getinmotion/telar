import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Instagram, Facebook, Twitter, Youtube, MessageCircle, Globe } from 'lucide-react';
import { EventBus } from '@/utils/eventBus';

export const SocialLinksWizard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    whatsapp: '',
    website: ''
  });

  const handleInputChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Get user's shop
      const { data: shop, error: shopError } = await supabase
        .from('artisan_shops')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (shopError) throw shopError;

      // Filter out empty links
      const filteredLinks = Object.fromEntries(
        Object.entries(socialLinks).filter(([_, value]) => value.trim() !== '')
      );

      // Update shop with social links
      const { error: updateError } = await supabase
        .from('artisan_shops')
        .update({
          social_links: filteredLinks,
          updated_at: new Date().toISOString()
        })
        .eq('id', shop.id);

      if (updateError) throw updateError;

      // Publish event for task completion
      EventBus.publish('shop.social_links.added', { shopId: shop.id, links: filteredLinks });

      toast({
        title: '¡Redes sociales agregadas!',
        description: 'Tus clientes ahora pueden encontrarte en tus redes sociales',
        variant: 'default'
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving social links:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las redes sociales. Intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          🌐 Conecta tus Redes Sociales
        </h1>
        <p className="text-muted-foreground">
          Permite que tus clientes te sigan y conozcan más de tu trabajo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Instagram */}
        <div className="space-y-2">
          <Label htmlFor="instagram" className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-pink-500" />
            Instagram
          </Label>
          <Input
            id="instagram"
            type="url"
            placeholder="https://instagram.com/tu_usuario"
            value={socialLinks.instagram}
            onChange={(e) => handleInputChange('instagram', e.target.value)}
          />
        </div>

        {/* Facebook */}
        <div className="space-y-2">
          <Label htmlFor="facebook" className="flex items-center gap-2">
            <Facebook className="w-4 h-4 text-blue-600" />
            Facebook
          </Label>
          <Input
            id="facebook"
            type="url"
            placeholder="https://facebook.com/tu_pagina"
            value={socialLinks.facebook}
            onChange={(e) => handleInputChange('facebook', e.target.value)}
          />
        </div>

        {/* TikTok */}
        <div className="space-y-2">
          <Label htmlFor="tiktok" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-slate-900" />
            TikTok
          </Label>
          <Input
            id="tiktok"
            type="url"
            placeholder="https://tiktok.com/@tu_usuario"
            value={socialLinks.tiktok}
            onChange={(e) => handleInputChange('tiktok', e.target.value)}
          />
        </div>

        {/* YouTube */}
        <div className="space-y-2">
          <Label htmlFor="youtube" className="flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-600" />
            YouTube
          </Label>
          <Input
            id="youtube"
            type="url"
            placeholder="https://youtube.com/@tu_canal"
            value={socialLinks.youtube}
            onChange={(e) => handleInputChange('youtube', e.target.value)}
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-600" />
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="+57 300 1234567"
            value={socialLinks.whatsapp}
            onChange={(e) => handleInputChange('whatsapp', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Incluye el código de país (ej: +57 para Colombia)
          </p>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Sitio Web
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="https://tu-sitio.com"
            value={socialLinks.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar redes sociales'}
          </Button>
        </div>
      </form>
    </div>
  );
};
