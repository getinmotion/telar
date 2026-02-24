import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Copy, ChevronDown, ChevronRight } from 'lucide-react';

interface DataRow {
  key: string;
  value: any;
  type: string;
  size: string;
}

interface DebugDataTableProps {
  title: string;
  data: Record<string, any>;
  icon?: React.ReactNode;
}

export const DebugDataTable: React.FC<DebugDataTableProps> = ({ 
  title, 
  data,
  icon = <Database className="w-5 h-5" />
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showRawJson, setShowRawJson] = useState(false);

  const getDataType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const getDataSize = (value: any): string => {
    const str = JSON.stringify(value);
    const bytes = new Blob([str]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const rows: DataRow[] = Object.entries(data).map(([key, value]) => ({
    key,
    value,
    type: getDataType(value),
    size: getDataSize(value)
  }));

  const totalSize = rows.reduce((sum, row) => {
    const bytes = parseInt(row.size);
    return sum + bytes;
  }, 0);

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isExpandable = (value: any) => {
    return typeof value === 'object' && value !== null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRawJson(!showRawJson)}
          >
            {showRawJson ? 'Ver Tabla' : 'Ver JSON Raw'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showRawJson ? (
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 z-10"
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold">Key</th>
                    <th className="text-left p-3 text-sm font-semibold">Status</th>
                    <th className="text-right p-3 text-sm font-semibold">Size</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => (
                    <React.Fragment key={row.key}>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <code className="text-sm font-mono">{row.key}</code>
                        </td>
                        <td className="p-3">
                          <Badge variant={row.value ? 'default' : 'secondary'}>
                            {row.value ? '✅ OK' : '⚠️ Empty'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right text-sm text-muted-foreground">
                          {row.size}
                        </td>
                        <td className="p-3">
                          {isExpandable(row.value) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(row.key)}
                              className="h-6 w-6 p-0"
                            >
                              {expandedRows.has(row.key) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                      {expandedRows.has(row.key) && (
                        <tr>
                          <td colSpan={4} className="p-3 bg-muted/20">
                            <pre className="text-xs overflow-auto max-h-48 p-2 bg-background rounded">
                              {JSON.stringify(row.value, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">Total almacenado</span>
              <span className="text-sm font-bold">{getDataSize(data)} de 5 MB disponibles</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
