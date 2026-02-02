import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  user_id: string;
  event_type: string;
  event_data: any;
  success?: boolean;
  duration_seconds?: number;
  maturity_level?: string;
  agent_id?: string;
  task_id?: string;
}

interface InsightPattern {
  type: string;
  category: string;
  data: any;
  confidence: number;
  sampleSize: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, data } = await req.json();

    console.log('Analytics Engine - Action:', action);

    // Track single event
    if (action === 'track') {
      const event: AnalyticsEvent = data;
      
      const { error } = await supabase
        .from('user_behavior_analytics')
        .insert({
          user_id: event.user_id,
          event_type: event.event_type,
          event_data: event.event_data,
          success: event.success,
          duration_seconds: event.duration_seconds,
          maturity_level: event.maturity_level,
          agent_id: event.agent_id,
          task_id: event.task_id,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking event:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Event tracked' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze patterns and generate insights
    if (action === 'analyze') {
      console.log('Analyzing behavioral patterns...');

      const insights: InsightPattern[] = [];

      // Pattern 1: Task completion rates by maturity level
      const { data: completionData } = await supabase
        .from('user_behavior_analytics')
        .select('event_type, success, maturity_level')
        .in('event_type', ['task_started', 'task_completed', 'task_abandoned'])
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (completionData && completionData.length > 50) {
        const byMaturity: Record<string, { started: number; completed: number; abandoned: number }> = {};
        
        completionData.forEach((event) => {
          const level = event.maturity_level || 'unknown';
          if (!byMaturity[level]) {
            byMaturity[level] = { started: 0, completed: 0, abandoned: 0 };
          }
          
          if (event.event_type === 'task_started') byMaturity[level].started++;
          if (event.event_type === 'task_completed') byMaturity[level].completed++;
          if (event.event_type === 'task_abandoned') byMaturity[level].abandoned++;
        });

        Object.entries(byMaturity).forEach(([level, stats]) => {
          const completionRate = stats.started > 0 ? stats.completed / stats.started : 0;
          
          if (completionRate < 0.3 && stats.started > 10) {
            insights.push({
              type: 'low_completion_rate',
              category: 'engagement',
              data: { maturity_level: level, completion_rate: completionRate, ...stats },
              confidence: 0.85,
              sampleSize: stats.started,
              impact: 'high',
              recommendation: `Los usuarios de nivel ${level} tienen baja tasa de completitud (${(completionRate * 100).toFixed(1)}%). Considerar simplificar misiones o agregar más guía.`
            });
          }
        });
      }

      // Pattern 2: Common bottlenecks (tasks with high abandonment)
      const { data: taskData } = await supabase
        .from('user_behavior_analytics')
        .select('agent_id, task_id, event_type')
        .in('event_type', ['task_started', 'task_abandoned'])
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (taskData && taskData.length > 50) {
        const taskStats: Record<string, { started: number; abandoned: number }> = {};
        
        taskData.forEach((event) => {
          const key = `${event.agent_id}_${event.task_id}`;
          if (!taskStats[key]) taskStats[key] = { started: 0, abandoned: 0 };
          
          if (event.event_type === 'task_started') taskStats[key].started++;
          if (event.event_type === 'task_abandoned') taskStats[key].abandoned++;
        });

        Object.entries(taskStats).forEach(([key, stats]) => {
          const abandonmentRate = stats.started > 0 ? stats.abandoned / stats.started : 0;
          
          if (abandonmentRate > 0.5 && stats.started > 5) {
            const [agentId] = key.split('_');
            insights.push({
              type: 'high_abandonment',
              category: 'bottleneck',
              data: { agent_id: agentId, abandonment_rate: abandonmentRate, ...stats },
              confidence: 0.80,
              sampleSize: stats.started,
              impact: 'critical',
              recommendation: `Misión del agente ${agentId} tiene ${(abandonmentRate * 100).toFixed(1)}% de abandono. Revisar complejidad o claridad.`
            });
          }
        });
      }

      // Pattern 3: Optimal time of day for engagement
      const { data: timeData } = await supabase
        .from('user_behavior_analytics')
        .select('timestamp, success')
        .eq('event_type', 'task_completed')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (timeData && timeData.length > 30) {
        const hourStats: Record<number, number> = {};
        
        timeData.forEach((event) => {
          const hour = new Date(event.timestamp).getHours();
          hourStats[hour] = (hourStats[hour] || 0) + 1;
        });

        const peakHour = Object.entries(hourStats).reduce((a, b) => 
          hourStats[parseInt(a[0])] > hourStats[parseInt(b[0])] ? a : b
        );

        insights.push({
          type: 'peak_engagement_time',
          category: 'optimization',
          data: { peak_hour: parseInt(peakHour[0]), completions: peakHour[1], hour_distribution: hourStats },
          confidence: 0.75,
          sampleSize: timeData.length,
          impact: 'medium',
          recommendation: `Mayor actividad a las ${peakHour[0]}:00. Considerar notificaciones en este horario.`
        });
      }

      // Pattern 4: Average time to complete missions by agent
      const { data: durationData } = await supabase
        .from('user_behavior_analytics')
        .select('agent_id, duration_seconds')
        .eq('event_type', 'task_completed')
        .not('duration_seconds', 'is', null)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (durationData && durationData.length > 20) {
        const agentDurations: Record<string, number[]> = {};
        
        durationData.forEach((event) => {
          if (!agentDurations[event.agent_id]) agentDurations[event.agent_id] = [];
          agentDurations[event.agent_id].push(event.duration_seconds);
        });

        Object.entries(agentDurations).forEach(([agentId, durations]) => {
          const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
          const avgMinutes = Math.round(avg / 60);
          
          insights.push({
            type: 'avg_completion_time',
            category: 'performance',
            data: { agent_id: agentId, avg_seconds: avg, avg_minutes: avgMinutes },
            confidence: 0.90,
            sampleSize: durations.length,
            impact: 'low',
            recommendation: `Misiones de ${agentId} toman en promedio ${avgMinutes} minutos.`
          });
        });
      }

      // Store insights in database
      if (insights.length > 0) {
        const { error: insertError } = await supabase
          .from('aggregated_insights')
          .insert(
            insights.map(insight => ({
              insight_type: insight.type,
              category: insight.category,
              pattern_data: insight.data,
              confidence_score: insight.confidence,
              sample_size: insight.sampleSize,
              impact_level: insight.impact,
              recommendation: insight.recommendation,
              is_active: true
            }))
          );

        if (insertError) {
          console.error('Error storing insights:', insertError);
        }
      }

      console.log(`Generated ${insights.length} insights`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          insights_generated: insights.length,
          insights: insights 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get insights for coordinator
    if (action === 'get_insights') {
      const { category, limit = 10 } = data || {};

      let query = supabase
        .from('aggregated_insights')
        .select('*')
        .eq('is_active', true)
        .order('confidence_score', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data: insights, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, insights }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Analytics Engine Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
