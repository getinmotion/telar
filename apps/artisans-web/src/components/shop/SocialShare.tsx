import React from 'react';
import { Share2, Facebook, Twitter, Linkedin, Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ 
  url, 
  title, 
  description = '',
  className = '' 
}) => {
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const shareText = `${title}${description ? ` - ${description}` : ''}`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + fullUrl)}`
  };

  const handleShare = (platform: string) => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(fullUrl);
      toast.success('Enlace copiado al portapapeles');
      return;
    }

    const link = shareLinks[platform as keyof typeof shareLinks];
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`bg-background/50 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 ${className}`}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-gradient-card backdrop-blur-sm border-primary/20">
        {navigator.share && (
          <DropdownMenuItem 
            onClick={handleNativeShare}
            className="hover:bg-primary/10 transition-colors duration-200"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir nativo
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => handleShare('facebook')}
          className="hover:bg-primary/10 transition-colors duration-200"
        >
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare('twitter')}
          className="hover:bg-primary/10 transition-colors duration-200"
        >
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare('whatsapp')}
          className="hover:bg-success/10 transition-colors duration-200"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare('copy')}
          className="hover:bg-primary/10 transition-colors duration-200"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar enlace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};