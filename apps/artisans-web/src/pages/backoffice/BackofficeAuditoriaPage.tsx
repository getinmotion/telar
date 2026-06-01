/**
 * BackofficeAuditoriaPage
 * Wrapper del log de auditoría para el backoffice unificado.
 */
import React from 'react';
import { AdminAuditLogViewer } from '@/components/admin/AdminAuditLogViewer';

const BackofficeAuditoriaPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Log de Auditoría</h1>
      <AdminAuditLogViewer />
    </div>
  );
};

export default BackofficeAuditoriaPage;
