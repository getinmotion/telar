import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ModeratorProtectedRoute } from '@/components/auth/ModeratorProtectedRoute';
import ModerationLogin from './pages/moderation/ModerationLogin';
import ModerationPage from './pages/ModerationPage';

/**
 * ModerationApp - Aplicación simplificada para el subdominio de moderación
 * Solo contiene rutas de login y moderación, sin acceso al resto de la app
 */
export const ModerationApp: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Redirect root to moderation panel */}
        <Route path="/" element={
          <ModeratorProtectedRoute>
            <ModerationPage />
          </ModeratorProtectedRoute>
        } />
        
        {/* Login page for moderators */}
        <Route path="/login" element={<ModerationLogin />} />
        
        {/* Moderation panel */}
        <Route path="/moderacion" element={
          <ModeratorProtectedRoute>
            <ModerationPage />
          </ModeratorProtectedRoute>
        } />
        
        {/* Queue views */}
        <Route path="/queue/:status" element={
          <ModeratorProtectedRoute>
            <ModerationPage />
          </ModeratorProtectedRoute>
        } />
        
        {/* Redirect any other path to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
};
