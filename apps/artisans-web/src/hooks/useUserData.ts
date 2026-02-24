
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserAgent {
  id: string;
  user_id: string;
  agent_id: string;
  is_enabled: boolean;
  last_used_at: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface AgentMetrics {
  total_sessions: number;
  total_messages: number;
  avg_session_duration: number;
}

export const useUserData = () => {
  const { user } = useAuth();
  const { profile: unifiedProfile, loading: unifiedLoading } = useUnifiedUserData();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [agents, setAgents] = useState<UserAgent[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Convert unified profile to legacy format
  useEffect(() => {
    if (unifiedProfile) {
      setProfile({
        id: unifiedProfile.userId,
        user_id: unifiedProfile.userId,
        full_name: unifiedProfile.fullName || null,
        avatar_url: unifiedProfile.avatarUrl || null,
        created_at: unifiedProfile.createdAt || new Date().toISOString(),
        updated_at: unifiedProfile.updatedAt || new Date().toISOString()
      });
    }
  }, [unifiedProfile]);

  const fetchUserProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching user projects:', err);
      setError('Error al cargar los proyectos');
    }
  };

  const fetchUserAgents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_agents')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      console.log('Fetched user agents:', data);
      setAgents(data || []);
    } catch (err) {
      console.error('Error fetching user agents:', err);
      setError('Error al cargar los agentes');
    }
  };

  const fetchAgentMetrics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agent_usage_metrics')
        .select('session_duration, messages_count')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalSessions = data?.length || 0;
      const totalMessages = data?.reduce((sum, metric) => sum + metric.messages_count, 0) || 0;
      const avgSessionDuration = totalSessions > 0 
        ? data?.reduce((sum, metric) => sum + (metric.session_duration || 0), 0) / totalSessions 
        : 0;

      setMetrics({
        total_sessions: totalSessions,
        total_messages: totalMessages,
        avg_session_duration: avgSessionDuration
      });
    } catch (err) {
      console.error('Error fetching agent metrics:', err);
    }
  };

  const createProject = async (title: string, description?: string) => {
    if (!user) return null;

    try {
      // Input validation
      if (!title || title.trim().length === 0) {
        throw new Error('Title is required');
      }
      
      if (title.length > 255) {
        throw new Error('Title too long');
      }

      const sanitizedTitle = title.trim().substring(0, 255);
      const sanitizedDescription = description?.trim().substring(0, 1000);

      const { data, error } = await supabase
        .from('user_projects')
        .insert({
          user_id: user.id,
          title: sanitizedTitle,
          description: sanitizedDescription
        })
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<UserProject>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Input validation and sanitization
      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.title) {
        sanitizedUpdates.title = sanitizedUpdates.title.trim().substring(0, 255);
      }
      if (sanitizedUpdates.description) {
        sanitizedUpdates.description = sanitizedUpdates.description.trim().substring(0, 1000);
      }

      const { data, error } = await supabase
        .from('user_projects')
        .update(sanitizedUpdates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own projects
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own projects

      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  const enableAgent = async (agentId: string) => {
    if (!user) return;

    try {
      // Input validation
      if (!agentId || agentId.trim().length === 0) {
        throw new Error('Agent ID is required');
      }

      console.log('Enabling agent:', agentId, 'for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_agents')
        .upsert({
          user_id: user.id,
          agent_id: agentId.trim(),
          is_enabled: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,agent_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error enabling agent:', error);
        throw error;
      }
      
      console.log('Agent enabled successfully:', data);
      
      // Update local state immediately
      setAgents(prev => {
        const existing = prev.find(a => a.agent_id === agentId);
        if (existing) {
          return prev.map(a => a.agent_id === agentId ? { ...a, is_enabled: true, updated_at: new Date().toISOString() } : a);
        } else {
          return [...prev, data];
        }
      });
      
      return data;
    } catch (err) {
      console.error('Error enabling agent:', err);
      throw err;
    }
  };

  const disableAgent = async (agentId: string) => {
    if (!user) return;

    try {
      // Input validation
      if (!agentId || agentId.trim().length === 0) {
        throw new Error('Agent ID is required');
      }

      console.log('Disabling agent:', agentId, 'for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_agents')
        .update({
          is_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('agent_id', agentId.trim())
        .select()
        .single();

      if (error) {
        console.error('Supabase error disabling agent:', error);
        throw error;
      }
      
      console.log('Agent disabled successfully:', data);
      
      // Update local state immediately
      setAgents(prev => prev.map(a => 
        a.agent_id === agentId 
          ? { ...a, is_enabled: false, updated_at: new Date().toISOString() }
          : a
      ));
      
      return data;
    } catch (err) {
      console.error('Error disabling agent:', err);
      throw err;
    }
  };

  const trackAgentUsage = async (agentId: string, sessionDuration?: number, messagesCount: number = 1) => {
    if (!user) return;

    try {
      // Input validation
      if (!agentId || agentId.trim().length === 0) {
        throw new Error('Agent ID is required');
      }

      if (messagesCount < 0 || messagesCount > 1000) {
        throw new Error('Invalid messages count');
      }

      if (sessionDuration && (sessionDuration < 0 || sessionDuration > 86400)) {
        throw new Error('Invalid session duration');
      }

      // Record usage metrics
      await supabase
        .from('agent_usage_metrics')
        .insert({
          user_id: user.id,
          agent_id: agentId.trim(),
          session_duration: sessionDuration,
          messages_count: Math.max(1, Math.min(1000, messagesCount))
        });

      // Update agent last used time - the trigger will handle usage_count increment
      const { error: updateError } = await supabase
        .from('user_agents')
        .update({
          last_used_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('agent_id', agentId.trim());

      if (updateError) throw updateError;

      // Refresh data
      await fetchUserAgents();
      await fetchAgentMetrics();
    } catch (err) {
      console.error('Error tracking agent usage:', err);
    }
  };

  useEffect(() => {
    if (user && !unifiedLoading) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        
        // ✅ Skip fetchUserProfile, use unified data instead
        await Promise.all([
          fetchUserProjects(),
          fetchUserAgents(),
          fetchAgentMetrics()
        ]);
        
        setLoading(false);
      };
      
      loadData();
    } else if (!user) {
      setLoading(false);
    }
  }, [user, unifiedLoading]);

  return {
    profile,
    projects,
    agents,
    metrics,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    enableAgent,
    disableAgent,
    trackAgentUsage,
    refetch: () => {
      if (user) {
        // ✅ Profile is auto-refreshed via useUnifiedUserData
        fetchUserProjects();
        fetchUserAgents();
        fetchAgentMetrics();
      }
    }
  };
};
