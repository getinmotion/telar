import { useRef, useCallback } from 'react';
import { devLog } from '@/utils/logger';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface PerformanceReport {
  pageName: string;
  metrics: PerformanceMetric[];
  totalDuration: number;
  timestamp: Date;
}

export function usePerformanceMetrics(pageName: string) {
  const metricsRef = useRef<Map<string, PerformanceMetric>>(new Map());
  const pageLoadTimeRef = useRef<number>(performance.now());

  const startMetric = useCallback((name: string) => {
    metricsRef.current.set(name, {
      name,
      startTime: performance.now(),
    });
    devLog(`⏱️ [${pageName}] Started: ${name}`);
  }, [pageName]);

  const endMetric = useCallback((name: string) => {
    const metric = metricsRef.current.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      devLog(`✅ [${pageName}] Completed: ${name} - ${metric.duration.toFixed(2)}ms`);
      return metric.duration;
    }
    return 0;
  }, [pageName]);

  const getReport = useCallback((): PerformanceReport => {
    const metrics = Array.from(metricsRef.current.values()).filter(m => m.duration !== undefined);
    const totalDuration = performance.now() - pageLoadTimeRef.current;
    
    return {
      pageName,
      metrics,
      totalDuration,
      timestamp: new Date(),
    };
  }, [pageName]);

  const logReport = useCallback(() => {
    const report = getReport();
    
    devLog(`📊 Performance Report: ${report.pageName}`);
    devLog(`Total time on page: ${report.totalDuration.toFixed(2)}ms`);
    
    report.metrics.forEach(metric => {
      devLog(`${metric.name}: ${metric.duration?.toFixed(2)}ms`);
    });
    
    return report;
  }, [getReport]);

  const measureAsync = useCallback(async <T>(name: string, asyncFn: () => Promise<T>): Promise<T> => {
    startMetric(name);
    try {
      const result = await asyncFn();
      endMetric(name);
      return result;
    } catch (error) {
      endMetric(name);
      throw error;
    }
  }, [startMetric, endMetric]);

  return {
    startMetric,
    endMetric,
    getReport,
    logReport,
    measureAsync,
    pageLoadTime: pageLoadTimeRef.current,
  };
}

// Utility for measuring page load times
export function measurePageLoad(pageName: string) {
  const loadStart = performance.now();
  
  return {
    markReady: () => {
      const duration = performance.now() - loadStart;
      devLog(`🚀 [${pageName}] Page ready in ${duration.toFixed(2)}ms`);
      return duration;
    },
    markInteractive: () => {
      const duration = performance.now() - loadStart;
      devLog(`👆 [${pageName}] Interactive in ${duration.toFixed(2)}ms`);
      return duration;
    },
  };
}
