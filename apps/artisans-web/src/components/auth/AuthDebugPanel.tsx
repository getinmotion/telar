
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, RefreshCw, User, Shield, Clock } from 'lucide-react';

export const AuthDebugPanel: React.FC = () => {
  const { user, session, loading, isAuthorized, debugInfo, checkAuthorization } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleForceAuthCheck = async () => {
    await checkAuthorization();
  };

  return (
    <Card className="mt-4 border-accent/30 bg-accent/10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/20 transition-colors">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Auth Debug Panel
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isAuthorized ? "default" : "destructive"}>
                  {isAuthorized ? "Authorized" : "Unauthorized"}
                </Badge>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User Status
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-mono">{user?.email || 'Not logged in'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className="font-mono text-xs">{user?.id || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session:</span>
                    <Badge variant={session ? "default" : "secondary"}>
                      {session ? "Active" : "None"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Loading:</span>
                    <Badge variant={loading ? "destructive" : "default"}>
                      {loading ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Debug Info
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Auth State Changes:</span>
                    <span className="font-mono">{debugInfo.authStateChangeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Auth Event:</span>
                    <span className="font-mono text-xs">{debugInfo.lastAuthEvent || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auth Attempts:</span>
                    <span className="font-mono">{debugInfo.authorizationAttempts}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceAuthCheck}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Force Auth Check
              </Button>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
              <strong>Troubleshooting:</strong> Si los usuarios no pueden acceder, verifica:
              <br />• Que su email esté en la tabla admin_users con is_active=true
              <br />• Que las políticas RLS estén configuradas correctamente
              <br />• Que no haya errores de red en la consola
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
