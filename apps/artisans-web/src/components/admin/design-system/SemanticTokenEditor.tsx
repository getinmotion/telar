import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorVariables } from '@/types/designSystem';
import { Badge } from '@/components/ui/badge';
import { getContrastRatio, meetsWCAG_AA } from '@/utils/colorUtils';

interface SemanticTokenEditorProps {
  config: ColorVariables;
  onTokenChange: () => void;
}

export function SemanticTokenEditor({ config, onTokenChange }: SemanticTokenEditorProps) {
  const tokenGroups = [
    {
      title: 'Primary Colors',
      tokens: ['primary', 'primary-foreground', 'primary-glow', 'primary-subtle']
    },
    {
      title: 'Secondary Colors',
      tokens: ['secondary', 'secondary-foreground', 'secondary-glow']
    },
    {
      title: 'Accent Colors',
      tokens: ['accent', 'accent-foreground']
    },
    {
      title: 'Background & Surface',
      tokens: ['background', 'foreground', 'card', 'card-foreground', 'muted', 'muted-foreground']
    },
    {
      title: 'Status Colors',
      tokens: ['success', 'success-foreground', 'warning', 'warning-foreground', 'destructive', 'destructive-foreground']
    },
    {
      title: 'UI Elements',
      tokens: ['border', 'input', 'ring']
    }
  ];

  const checkContrast = (fg: string, bg: string) => {
    try {
      const ratio = getContrastRatio(fg, bg);
      const passes = meetsWCAG_AA(fg, bg);
      return { ratio: ratio.toFixed(2), passes };
    } catch {
      return { ratio: 'N/A', passes: false };
    }
  };

  return (
    <div className="space-y-6">
      {tokenGroups.map(({ title, tokens }) => (
        <Card key={title}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Tokens semánticos para {title.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tokens.map((token) => {
                const value = config.semantic[token as keyof typeof config.semantic];
                const isForeground = token.includes('foreground');
                
                let contrastInfo = null;
                if (isForeground) {
                  const baseToken = token.replace('-foreground', '') as keyof typeof config.semantic;
                  const bgValue = config.semantic[baseToken];
                  if (bgValue) {
                    contrastInfo = checkContrast(value, bgValue);
                  }
                }

                return (
                  <div key={token} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-border"
                        style={{ backgroundColor: `hsl(${value})` }}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">--{token}</p>
                        <p className="text-xs text-muted-foreground font-mono">{value}</p>
                      </div>
                    </div>
                    
                    {contrastInfo && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Contraste: {contrastInfo.ratio}:1
                        </span>
                        <Badge variant={contrastInfo.passes ? "default" : "destructive"}>
                          {contrastInfo.passes ? 'WCAG AA ✓' : 'WCAG AA ✗'}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
