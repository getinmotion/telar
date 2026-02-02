/**
 * Data Integrity Check Hook
 * FASE 4: Sistema de validación de integridad de datos
 * 
 * Verifica que todos los datos del usuario estén sincronizados correctamente
 * entre user_profiles, user_master_context, artisan_shops y MasterAgentContext
 */

import { useMemo } from 'react';
import { useUnifiedUserData } from './user/useUnifiedUserData';
import { useMasterAgent } from '@/context/MasterAgentContext';

export interface DataIntegrityIssue {
  severity: 'critical' | 'error' | 'warning' | 'info';
  message: string;
  source: string;
  recommendation?: string;
}

export interface DataIntegrityReport {
  isHealthy: boolean;
  issues: DataIntegrityIssue[];
  lastCheck: Date;
  summary: {
    critical: number;
    errors: number;
    warnings: number;
    info: number;
  };
}

export const useDataIntegrityCheck = (): DataIntegrityReport => {
  const { profile, context, loading } = useUnifiedUserData();
  const { masterState } = useMasterAgent();

  const report = useMemo((): DataIntegrityReport => {
    if (loading) {
      return {
        isHealthy: true,
        issues: [],
        lastCheck: new Date(),
        summary: { critical: 0, errors: 0, warnings: 0, info: 0 }
      };
    }

    const issues: DataIntegrityIssue[] = [];

    // CHECK 1: Brand Name
    const profileBrand = profile?.brandName;
    const contextBrand = context?.businessProfile?.brandName || context?.businessProfile?.brand_name;
    const insightsBrand = context?.conversationInsights?.nombre_marca;
    
    if (!profileBrand && !contextBrand && !insightsBrand) {
      issues.push({
        severity: 'critical',
        message: 'No se encontró nombre de marca en ninguna fuente de datos',
        source: 'brand_name',
        recommendation: 'Solicitar al usuario que complete su información de negocio'
      });
    } else if (profileBrand !== contextBrand && contextBrand) {
      issues.push({
        severity: 'warning',
        message: `Nombre de marca desincronizado: perfil="${profileBrand}" vs context="${contextBrand}"`,
        source: 'brand_name_sync',
        recommendation: 'Actualizar user_profiles.brand_name para sincronizar'
      });
    }

    // CHECK 2: Business Description
    const profileDesc = profile?.businessDescription;
    const contextDesc = context?.businessProfile?.businessDescription || context?.businessProfile?.business_description;
    
    if (!profileDesc && !contextDesc) {
      issues.push({
        severity: 'warning',
        message: 'No se encontró descripción del negocio',
        source: 'business_description',
        recommendation: 'Solicitar descripción del negocio al usuario'
      });
    }

    // CHECK 3: Maturity Scores
    const maturityScores = context?.taskGenerationContext?.maturityScores;
    
    if (!maturityScores) {
      issues.push({
        severity: 'error',
        message: 'No se encontraron maturity scores - usuario no ha completado el test',
        source: 'maturity_scores',
        recommendation: 'Dirigir al usuario a /maturity-calculator'
      });
    }

    // CHECK 4: Master State Sync
    const masterBrandScore = masterState.marca.score;
    const hasBrandData = contextBrand || profileBrand;
    
    if (hasBrandData && masterBrandScore === 0) {
      issues.push({
        severity: 'error',
        message: 'Master state no sincronizado con datos de marca',
        source: 'master_state_sync',
        recommendation: 'Ejecutar syncAll() en MasterAgentContext'
      });
    }

    // CHECK 5: Shop Data
    const hasShop = masterState.tienda.has_shop;
    const shopName = masterState.tienda.shop_name;
    
    if (hasShop && !shopName) {
      issues.push({
        severity: 'warning',
        message: 'Tienda existe pero sin nombre configurado',
        source: 'shop_data',
        recommendation: 'Verificar artisan_shops.shop_name'
      });
    }

    // CHECK 6: Task Generation Context
    const taskGenContext = context?.taskGenerationContext;
    
    if (!taskGenContext?.language) {
      issues.push({
        severity: 'info',
        message: 'No se especificó idioma en task_generation_context',
        source: 'language_preference'
      });
    }

    // Calculate summary
    const summary = {
      critical: issues.filter(i => i.severity === 'critical').length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length
    };

    const isHealthy = summary.critical === 0 && summary.errors === 0;

    console.log('🔍 [DATA INTEGRITY CHECK]', {
      isHealthy,
      issues: issues.length,
      summary,
      profileBrand,
      contextBrand,
      masterBrandScore
    });

    return {
      isHealthy,
      issues,
      lastCheck: new Date(),
      summary
    };
  }, [profile, context, masterState, loading]);

  return report;
};
