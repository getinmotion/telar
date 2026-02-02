import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { logger } from '@/utils/logger';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  userEmail?: string;
  details?: any;
  level: 'info' | 'warn' | 'error';
}

export const AdminAuditLog: React.FC = () => {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  // Simulate audit log entries (in a real app, this would come from a backend service)
  useEffect(() => {
    // Log the admin accessing the audit log
    logger.security.adminAction('view_audit_log', undefined, { 
      component: 'AdminAuditLog',
      timestamp: new Date().toISOString() 
    });

    // In a real implementation, you would fetch audit entries from your backend
    const mockEntries: AuditEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        action: 'Admin logged in',
        userEmail: 'admin@example.com',
        level: 'info'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        action: 'Suspicious activity detected',
        userEmail: 'user@example.com',
        details: { reason: 'Multiple failed login attempts' },
        level: 'warn'
      }
    ];

    setAuditEntries(mockEntries);
  }, []);

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Security Audit Log</CardTitle>
        <CardDescription>
          Recent security-related events and administrative actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {auditEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getBadgeVariant(entry.level)}>
                      {entry.level.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium">{entry.action}</span>
                  </div>
                  {entry.userEmail && (
                    <p className="text-sm text-muted-foreground mb-1">
                      User: {entry.userEmail}
                    </p>
                  )}
                  {entry.details && (
                    <p className="text-sm text-muted-foreground">
                      Details: {JSON.stringify(entry.details)}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
            {auditEntries.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No audit entries found
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};