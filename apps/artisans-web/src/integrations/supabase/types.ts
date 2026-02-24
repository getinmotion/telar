export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      achievements_catalog: {
        Row: {
          category: string
          created_at: string
          description: string
          display_order: number | null
          icon: string
          id: string
          title: string
          unlock_criteria: Json
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          display_order?: number | null
          icon?: string
          id: string
          title: string
          unlock_criteria: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          display_order?: number | null
          icon?: string
          id?: string
          title?: string
          unlock_criteria?: Json
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      agent_chat_conversations: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_archived: boolean
          task_id: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_archived?: boolean
          task_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          task_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_chat_conversations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_conversations: {
        Row: {
          agent_output: Json
          agent_type: string
          context: Json | null
          created_at: string
          execution_time_ms: number | null
          id: string
          metadata: Json | null
          routing_confidence: number | null
          routing_reasoning: string | null
          selected_agent: string | null
          session_id: string
          updated_at: string
          user_id: string | null
          user_input: string
        }
        Insert: {
          agent_output: Json
          agent_type: string
          context?: Json | null
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          routing_confidence?: number | null
          routing_reasoning?: string | null
          selected_agent?: string | null
          session_id: string
          updated_at?: string
          user_id?: string | null
          user_input: string
        }
        Update: {
          agent_output?: Json
          agent_type?: string
          context?: Json | null
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          routing_confidence?: number | null
          routing_reasoning?: string | null
          selected_agent?: string | null
          session_id?: string
          updated_at?: string
          user_id?: string | null
          user_input?: string
        }
        Relationships: []
      }
      agent_deliverables: {
        Row: {
          agent_id: string
          content: string | null
          conversation_id: string | null
          created_at: string
          description: string | null
          file_type: string
          file_url: string | null
          id: string
          metadata: Json | null
          task_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          content?: string | null
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          file_type?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          task_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          content?: string | null
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          file_type?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          task_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_deliverables_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_knowledge_documents: {
        Row: {
          chunk_count: number | null
          content: string
          created_at: string
          file_size: number
          file_type: string
          filename: string
          id: string
          knowledge_category: string
          metadata: Json | null
          processing_status: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          chunk_count?: number | null
          content: string
          created_at?: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          knowledge_category: string
          metadata?: Json | null
          processing_status?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          chunk_count?: number | null
          content?: string
          created_at?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          knowledge_category?: string
          metadata?: Json | null
          processing_status?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      agent_knowledge_embeddings: {
        Row: {
          agent_type: string | null
          artisan_id: string | null
          chunk_index: number
          chunk_text: string
          created_at: string
          document_id: string | null
          embedding: string
          id: string
          importance_score: number | null
          interaction_count: number | null
          knowledge_category: string
          memory_type: string
          metadata: Json | null
          session_id: string | null
          summary: string | null
        }
        Insert: {
          agent_type?: string | null
          artisan_id?: string | null
          chunk_index: number
          chunk_text: string
          created_at?: string
          document_id?: string | null
          embedding: string
          id?: string
          importance_score?: number | null
          interaction_count?: number | null
          knowledge_category: string
          memory_type?: string
          metadata?: Json | null
          session_id?: string | null
          summary?: string | null
        }
        Update: {
          agent_type?: string | null
          artisan_id?: string | null
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          document_id?: string | null
          embedding?: string
          id?: string
          importance_score?: number | null
          interaction_count?: number | null
          knowledge_category?: string
          memory_type?: string
          metadata?: Json | null
          session_id?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_knowledge_embeddings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "agent_knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type: string
          metadata?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tasks: {
        Row: {
          agent_id: string
          completed_at: string | null
          conversation_id: string | null
          created_at: string
          deliverable_type: string | null
          description: string | null
          due_date: string | null
          environment: string
          id: string
          is_archived: boolean
          milestone_category: string | null
          notes: string | null
          priority: number
          progress_percentage: number
          relevance: string
          resources: Json | null
          status: string
          steps_completed: Json | null
          subtasks: Json | null
          time_spent: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          deliverable_type?: string | null
          description?: string | null
          due_date?: string | null
          environment?: string
          id?: string
          is_archived?: boolean
          milestone_category?: string | null
          notes?: string | null
          priority?: number
          progress_percentage?: number
          relevance?: string
          resources?: Json | null
          status?: string
          steps_completed?: Json | null
          subtasks?: Json | null
          time_spent?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          deliverable_type?: string | null
          description?: string | null
          due_date?: string | null
          environment?: string
          id?: string
          is_archived?: boolean
          milestone_category?: string | null
          notes?: string | null
          priority?: number
          progress_percentage?: number
          relevance?: string
          resources?: Json | null
          status?: string
          steps_completed?: Json | null
          subtasks?: Json | null
          time_spent?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_usage_metrics: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          messages_count: number
          session_duration: number | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          messages_count?: number
          session_duration?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          messages_count?: number
          session_duration?: number | null
          user_id?: string
        }
        Relationships: []
      }
      aggregated_insights: {
        Row: {
          category: string | null
          confidence_score: number | null
          created_at: string | null
          generated_at: string | null
          id: string
          impact_level: string | null
          insight_type: string
          is_active: boolean | null
          pattern_data: Json
          recommendation: string | null
          sample_size: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          impact_level?: string | null
          insight_type: string
          is_active?: boolean | null
          pattern_data?: Json
          recommendation?: string | null
          sample_size?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          impact_level?: string | null
          insight_type?: string
          is_active?: boolean | null
          pattern_data?: Json
          recommendation?: string | null
          sample_size?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          event_data: Json | null
          event_type: string
          id: string
          session_id: string | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          event_data?: Json | null
          event_type: string
          id?: string
          session_id?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          event_data?: Json | null
          event_type?: string
          id?: string
          session_id?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      artisan_analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          orders: number | null
          products_added: number | null
          revenue: number | null
          shop_id: string
          views: number | null
          visitors: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          orders?: number | null
          products_added?: number | null
          revenue?: number | null
          shop_id: string
          views?: number | null
          visitors?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          orders?: number | null
          products_added?: number | null
          revenue?: number | null
          shop_id?: string
          views?: number | null
          visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artisan_analytics_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "artisan_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artisan_analytics_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["shop_id"]
          },
        ]
      }
      artisan_bank_data: {
        Row: {
          account_number: string
          account_type: string
          bank_name: string
          country: string | null
          created_at: string | null
          currency: string | null
          document_number: string
          document_type: string
          holder_name: string
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number: string
          account_type: string
          bank_name: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          document_number: string
          document_type: string
          holder_name: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string
          account_type?: string
          bank_name?: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          document_number?: string
          document_type?: string
          holder_name?: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      artisan_global_profiles: {
        Row: {
          artisan_id: string
          created_at: string
          embedding: string
          id: string
          interaction_count: number | null
          key_insights: Json | null
          last_interaction_at: string | null
          maturity_snapshot: Json | null
          profile_summary: string
          updated_at: string
        }
        Insert: {
          artisan_id: string
          created_at?: string
          embedding: string
          id?: string
          interaction_count?: number | null
          key_insights?: Json | null
          last_interaction_at?: string | null
          maturity_snapshot?: Json | null
          profile_summary: string
          updated_at?: string
        }
        Update: {
          artisan_id?: string
          created_at?: string
          embedding?: string
          id?: string
          interaction_count?: number | null
          key_insights?: Json | null
          last_interaction_at?: string | null
          maturity_snapshot?: Json | null
          profile_summary?: string
          updated_at?: string
        }
        Relationships: []
      }
      artisan_official_classifications: {
        Row: {
          clasificado_automaticamente: boolean | null
          clasificado_por_usuario: boolean | null
          codigo_materia_prima_adec: string | null
          codigo_materia_prima_cuoc: string | null
          codigo_oficio_adec: string | null
          codigo_oficio_cuoc: string | null
          confianza: number | null
          created_at: string | null
          id: string
          justificacion: string | null
          materia_prima: string
          oficio: string
          tecnicas: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clasificado_automaticamente?: boolean | null
          clasificado_por_usuario?: boolean | null
          codigo_materia_prima_adec?: string | null
          codigo_materia_prima_cuoc?: string | null
          codigo_oficio_adec?: string | null
          codigo_oficio_cuoc?: string | null
          confianza?: number | null
          created_at?: string | null
          id?: string
          justificacion?: string | null
          materia_prima: string
          oficio: string
          tecnicas?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clasificado_automaticamente?: boolean | null
          clasificado_por_usuario?: boolean | null
          codigo_materia_prima_adec?: string | null
          codigo_materia_prima_cuoc?: string | null
          codigo_oficio_adec?: string | null
          codigo_oficio_cuoc?: string | null
          confianza?: number | null
          created_at?: string | null
          id?: string
          justificacion?: string | null
          materia_prima?: string
          oficio?: string
          tecnicas?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      artisan_shops: {
        Row: {
          about_content: Json | null
          active: boolean
          active_theme_id: string | null
          artisan_profile: Json | null
          artisan_profile_completed: boolean | null
          bank_data_status: string | null
          banner_url: string | null
          brand_claim: string | null
          certifications: Json | null
          contact_config: Json | null
          contact_info: Json | null
          craft_type: string | null
          created_at: string
          creation_status: string | null
          creation_step: number | null
          data_classification: Json | null
          department: string | null
          description: string | null
          featured: boolean
          hero_config: Json | null
          id: string
          id_contraparty: string | null
          logo_url: string | null
          marketplace_approval_status: string | null
          marketplace_approved: boolean | null
          marketplace_approved_at: string | null
          marketplace_approved_by: string | null
          municipality: string | null
          primary_colors: Json | null
          privacy_level: string | null
          public_profile: Json | null
          publish_status: string | null
          region: string | null
          secondary_colors: Json | null
          seo_data: Json | null
          shop_name: string
          shop_slug: string
          social_links: Json | null
          story: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about_content?: Json | null
          active?: boolean
          active_theme_id?: string | null
          artisan_profile?: Json | null
          artisan_profile_completed?: boolean | null
          bank_data_status?: string | null
          banner_url?: string | null
          brand_claim?: string | null
          certifications?: Json | null
          contact_config?: Json | null
          contact_info?: Json | null
          craft_type?: string | null
          created_at?: string
          creation_status?: string | null
          creation_step?: number | null
          data_classification?: Json | null
          department?: string | null
          description?: string | null
          featured?: boolean
          hero_config?: Json | null
          id?: string
          id_contraparty?: string | null
          logo_url?: string | null
          marketplace_approval_status?: string | null
          marketplace_approved?: boolean | null
          marketplace_approved_at?: string | null
          marketplace_approved_by?: string | null
          municipality?: string | null
          primary_colors?: Json | null
          privacy_level?: string | null
          public_profile?: Json | null
          publish_status?: string | null
          region?: string | null
          secondary_colors?: Json | null
          seo_data?: Json | null
          shop_name: string
          shop_slug: string
          social_links?: Json | null
          story?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about_content?: Json | null
          active?: boolean
          active_theme_id?: string | null
          artisan_profile?: Json | null
          artisan_profile_completed?: boolean | null
          bank_data_status?: string | null
          banner_url?: string | null
          brand_claim?: string | null
          certifications?: Json | null
          contact_config?: Json | null
          contact_info?: Json | null
          craft_type?: string | null
          created_at?: string
          creation_status?: string | null
          creation_step?: number | null
          data_classification?: Json | null
          department?: string | null
          description?: string | null
          featured?: boolean
          hero_config?: Json | null
          id?: string
          id_contraparty?: string | null
          logo_url?: string | null
          marketplace_approval_status?: string | null
          marketplace_approved?: boolean | null
          marketplace_approved_at?: string | null
          marketplace_approved_by?: string | null
          municipality?: string | null
          primary_colors?: Json | null
          privacy_level?: string | null
          public_profile?: Json | null
          publish_status?: string | null
          region?: string | null
          secondary_colors?: Json | null
          seo_data?: Json | null
          shop_name?: string
          shop_slug?: string
          social_links?: Json | null
          story?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artisan_shops_active_theme_id_fkey"
            columns: ["active_theme_id"]
            isOneToOne: false
            referencedRelation: "brand_themes"
            referencedColumns: ["theme_id"]
          },
        ]
      }
      auth_rate_limits: {
        Row: {
          attempt_count: number
          blocked_until: string | null
          created_at: string | null
          first_attempt: string
          identifier: string
          last_ip: string | null
          updated_at: string | null
        }
        Insert: {
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string | null
          first_attempt?: string
          identifier: string
          last_ip?: string | null
          updated_at?: string | null
        }
        Update: {
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string | null
          first_attempt?: string
          identifier?: string
          last_ip?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bom: {
        Row: {
          created_at: string
          id: string
          material_id: string
          product_id: string | null
          qty_per_unit: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          product_id?: string | null
          qty_per_unit?: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          product_id?: string | null
          qty_per_unit?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bom_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_diagnosis_history: {
        Row: {
          average_score: number | null
          changed_element: string | null
          created_at: string
          diagnosis_data: Json
          id: string
          score_after: number | null
          score_before: number | null
          user_id: string
        }
        Insert: {
          average_score?: number | null
          changed_element?: string | null
          created_at?: string
          diagnosis_data: Json
          id?: string
          score_after?: number | null
          score_before?: number | null
          user_id: string
        }
        Update: {
          average_score?: number | null
          changed_element?: string | null
          created_at?: string
          diagnosis_data?: Json
          id?: string
          score_after?: number | null
          score_before?: number | null
          user_id?: string
        }
        Relationships: []
      }
      brand_themes: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          palette: Json
          preview_description: string | null
          style_context: Json | null
          theme_id: string
          updated_at: string | null
          usage_rules: Json | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          palette: Json
          preview_description?: string | null
          style_context?: Json | null
          theme_id: string
          updated_at?: string | null
          usage_rules?: Json | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          palette?: Json
          preview_description?: string | null
          style_context?: Json | null
          theme_id?: string
          updated_at?: string | null
          usage_rules?: Json | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: []
      }
      calculator_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          step_name: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          step_name: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          step_name?: string
        }
        Relationships: []
      }
      cart: {
        Row: {
          created_at: string
          id: string
          is_active_cart: boolean
          money_movement_id: string | null
          payment_status: string | null
          price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active_cart?: boolean
          money_movement_id?: string | null
          payment_status?: string | null
          price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active_cart?: boolean
          money_movement_id?: string | null
          payment_status?: string | null
          price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          price: number
          product_id: string
          quantity: number
          session_id: string | null
          updated_at: string
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          price: number
          product_id: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      checkpoint_writes: {
        Row: {
          channel: string
          checkpoint_id: string
          checkpoint_ns: string
          idx: number
          task_id: string
          thread_id: string
          type: string | null
          value: Json | null
        }
        Insert: {
          channel: string
          checkpoint_id: string
          checkpoint_ns?: string
          idx: number
          task_id: string
          thread_id: string
          type?: string | null
          value?: Json | null
        }
        Update: {
          channel?: string
          checkpoint_id?: string
          checkpoint_ns?: string
          idx?: number
          task_id?: string
          thread_id?: string
          type?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "checkpoint_writes_thread_id_checkpoint_ns_checkpoint_id_fkey"
            columns: ["thread_id", "checkpoint_ns", "checkpoint_id"]
            isOneToOne: false
            referencedRelation: "checkpoints"
            referencedColumns: ["thread_id", "checkpoint_ns", "checkpoint_id"]
          },
        ]
      }
      checkpoints: {
        Row: {
          checkpoint: Json
          checkpoint_id: string
          checkpoint_ns: string
          metadata: Json
          parent_checkpoint_id: string | null
          thread_id: string
          type: string | null
        }
        Insert: {
          checkpoint: Json
          checkpoint_id: string
          checkpoint_ns?: string
          metadata?: Json
          parent_checkpoint_id?: string | null
          thread_id: string
          type?: string | null
        }
        Update: {
          checkpoint?: Json
          checkpoint_id?: string
          checkpoint_ns?: string
          metadata?: Json
          parent_checkpoint_id?: string | null
          thread_id?: string
          type?: string | null
        }
        Relationships: []
      }
      conversation_insights: {
        Row: {
          created_at: string
          id: string
          insight_data: Json
          insight_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          insight_data?: Json
          insight_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          insight_data?: Json
          insight_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          amount_discounted: number
          coupon_id: string
          created_at: string | null
          id: string
          order_id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          amount_discounted: number
          coupon_id: string
          created_at?: string | null
          id?: string
          order_id: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          amount_discounted?: number
          coupon_id?: string
          created_at?: string | null
          id?: string
          order_id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          conditions_json: Json | null
          created_at: string | null
          created_by_admin_id: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          start_date: string | null
          times_used: number | null
          type: string
          updated_at: string | null
          usage_limit_per_user: number | null
          usage_limit_total: number | null
          value: number
        }
        Insert: {
          code: string
          conditions_json?: Json | null
          created_at?: string | null
          created_by_admin_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          start_date?: string | null
          times_used?: number | null
          type: string
          updated_at?: string | null
          usage_limit_per_user?: number | null
          usage_limit_total?: number | null
          value: number
        }
        Update: {
          code?: string
          conditions_json?: Json | null
          created_at?: string | null
          created_by_admin_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          start_date?: string | null
          times_used?: number | null
          type?: string
          updated_at?: string | null
          usage_limit_per_user?: number | null
          usage_limit_total?: number | null
          value?: number
        }
        Relationships: []
      }
      data_access_audit: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      design_system_config: {
        Row: {
          color_variables: Json
          created_at: string
          id: string
          is_active: boolean
          theme_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color_variables?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          theme_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color_variables?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          theme_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      design_system_history: {
        Row: {
          changed_element: string | null
          changes_made: Json
          config_id: string | null
          created_at: string
          id: string
          score_after: number | null
          score_before: number | null
          user_id: string | null
        }
        Insert: {
          changed_element?: string | null
          changes_made: Json
          config_id?: string | null
          created_at?: string
          id?: string
          score_after?: number | null
          score_before?: number | null
          user_id?: string | null
        }
        Update: {
          changed_element?: string | null
          changes_made?: Json
          config_id?: string | null
          created_at?: string
          id?: string
          score_after?: number | null
          score_before?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_system_history_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "design_system_config"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verifications: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gift_card_transactions: {
        Row: {
          amount_used: number
          created_at: string | null
          gift_card_id: string
          id: string
          order_id: string
        }
        Insert: {
          amount_used: number
          created_at?: string | null
          gift_card_id: string
          id?: string
          order_id: string
        }
        Update: {
          amount_used?: number
          created_at?: string | null
          gift_card_id?: string
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_card_transactions_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          code: string
          created_at: string | null
          currency: string | null
          expiration_date: string | null
          expires_at: string | null
          id: string
          initial_amount: number
          is_active: boolean | null
          marketplace_order_id: string | null
          message: string | null
          order_id: string | null
          original_amount: number | null
          purchaser_email: string
          recipient_email: string | null
          remaining_amount: number
          status: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          currency?: string | null
          expiration_date?: string | null
          expires_at?: string | null
          id?: string
          initial_amount: number
          is_active?: boolean | null
          marketplace_order_id?: string | null
          message?: string | null
          order_id?: string | null
          original_amount?: number | null
          purchaser_email: string
          recipient_email?: string | null
          remaining_amount: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          currency?: string | null
          expiration_date?: string | null
          expires_at?: string | null
          id?: string
          initial_amount?: number
          is_active?: boolean | null
          marketplace_order_id?: string | null
          message?: string | null
          order_id?: string | null
          original_amount?: number | null
          purchaser_email?: string
          recipient_email?: string | null
          remaining_amount?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      image_optimization_log: {
        Row: {
          bucket_id: string
          created_at: string
          error_message: string | null
          id: string
          optimized_path: string | null
          optimized_size_bytes: number | null
          original_path: string
          original_size_bytes: number
          processed_at: string | null
          savings_percent: number | null
          status: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          optimized_path?: string | null
          optimized_size_bytes?: number | null
          original_path: string
          original_size_bytes: number
          processed_at?: string | null
          savings_percent?: number | null
          status?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          optimized_path?: string | null
          optimized_size_bytes?: number | null
          original_path?: string
          original_size_bytes?: number
          processed_at?: string | null
          savings_percent?: number | null
          status?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          product_variant_id: string
          qty: number
          reason: string | null
          ref_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          product_variant_id: string
          qty: number
          reason?: string | null
          ref_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          product_variant_id?: string
          qty?: number
          reason?: string | null
          ref_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      master_coordinator_context: {
        Row: {
          ai_memory: Json | null
          context_snapshot: Json
          context_version: number | null
          created_at: string | null
          id: string
          last_interaction: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_memory?: Json | null
          context_snapshot?: Json
          context_version?: number | null
          created_at?: string | null
          id?: string
          last_interaction?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_memory?: Json | null
          context_snapshot?: Json
          context_version?: number | null
          created_at?: string | null
          id?: string
          last_interaction?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          cost_per_unit: number | null
          created_at: string
          current_stock: number | null
          id: string
          min_stock: number | null
          name: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number | null
          id?: string
          min_stock?: number | null
          name: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number | null
          id?: string
          min_stock?: number | null
          name?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      milestone_progress_history: {
        Row: {
          id: string
          milestone_id: string
          progress: number
          recorded_at: string
          tasks_completed: number
          total_tasks: number
          user_id: string
        }
        Insert: {
          id?: string
          milestone_id: string
          progress: number
          recorded_at?: string
          tasks_completed?: number
          total_tasks?: number
          user_id: string
        }
        Update: {
          id?: string
          milestone_id?: string
          progress?: number
          recorded_at?: string
          tasks_completed?: number
          total_tasks?: number
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          fulfillment_status: string | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json
          shipping_cost: number | null
          shop_id: string
          status: string
          subtotal: number
          tax: number | null
          total: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          fulfillment_status?: string | null
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address: Json
          shipping_cost?: number | null
          shop_id: string
          status?: string
          subtotal: number
          tax?: number | null
          total: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          fulfillment_status?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json
          shipping_cost?: number | null
          shop_id?: string
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "artisan_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["shop_id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          channel: string
          code: string
          created_at: string | null
          expires_at: string
          id: string
          identifier: string
          verified: boolean | null
        }
        Insert: {
          channel?: string
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          identifier: string
          verified?: boolean | null
        }
        Update: {
          channel?: string
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          identifier?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_moderation_history: {
        Row: {
          artisan_id: string | null
          comment: string | null
          created_at: string | null
          edits_made: Json | null
          id: string
          moderator_id: string | null
          new_status: string
          previous_status: string | null
          product_id: string
        }
        Insert: {
          artisan_id?: string | null
          comment?: string | null
          created_at?: string | null
          edits_made?: Json | null
          id?: string
          moderator_id?: string | null
          new_status: string
          previous_status?: string | null
          product_id: string
        }
        Update: {
          artisan_id?: string | null
          comment?: string | null
          created_at?: string | null
          edits_made?: Json | null
          id?: string
          moderator_id?: string | null
          new_status?: string
          previous_status?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_moderation_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_moderation_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          images: Json | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: Json | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: Json | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          compare_at_price: number | null
          cost: number | null
          created_at: string
          dimensions: Json | null
          id: string
          min_stock: number | null
          option_values: Json | null
          price: number | null
          product_id: string
          sku: string
          status: string | null
          stock: number | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          dimensions?: Json | null
          id?: string
          min_stock?: number | null
          option_values?: Json | null
          price?: number | null
          product_id: string
          sku: string
          status?: string | null
          stock?: number | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          dimensions?: Json | null
          id?: string
          min_stock?: number | null
          option_values?: Json | null
          price?: number | null
          product_id?: string
          sku?: string
          status?: string | null
          stock?: number | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          allows_local_pickup: boolean | null
          category: string | null
          category_id: string | null
          compare_price: number | null
          created_at: string
          customizable: boolean | null
          description: string | null
          dimensions: Json | null
          embedding: string | null
          featured: boolean
          id: string
          images: Json | null
          inventory: number | null
          lead_time_days: number | null
          made_to_order: boolean | null
          marketplace_links: Json | null
          materials: Json | null
          moderation_status: string | null
          name: string
          price: number
          production_time: string | null
          production_time_hours: number | null
          ready_for_checkout: boolean | null
          requires_customization: boolean | null
          seo_data: Json | null
          shipping_data_complete: boolean | null
          shop_id: string
          short_description: string | null
          sku: string | null
          subcategory: string | null
          tags: Json | null
          techniques: Json | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          active?: boolean
          allows_local_pickup?: boolean | null
          category?: string | null
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          customizable?: boolean | null
          description?: string | null
          dimensions?: Json | null
          embedding?: string | null
          featured?: boolean
          id?: string
          images?: Json | null
          inventory?: number | null
          lead_time_days?: number | null
          made_to_order?: boolean | null
          marketplace_links?: Json | null
          materials?: Json | null
          moderation_status?: string | null
          name: string
          price: number
          production_time?: string | null
          production_time_hours?: number | null
          ready_for_checkout?: boolean | null
          requires_customization?: boolean | null
          seo_data?: Json | null
          shipping_data_complete?: boolean | null
          shop_id: string
          short_description?: string | null
          sku?: string | null
          subcategory?: string | null
          tags?: Json | null
          techniques?: Json | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          active?: boolean
          allows_local_pickup?: boolean | null
          category?: string | null
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          customizable?: boolean | null
          description?: string | null
          dimensions?: Json | null
          embedding?: string | null
          featured?: boolean
          id?: string
          images?: Json | null
          inventory?: number | null
          lead_time_days?: number | null
          made_to_order?: boolean | null
          marketplace_links?: Json | null
          materials?: Json | null
          moderation_status?: string | null
          name?: string
          price?: number
          production_time?: string | null
          production_time_hours?: number | null
          ready_for_checkout?: boolean | null
          requires_customization?: boolean | null
          seo_data?: Json | null
          shipping_data_complete?: boolean | null
          shop_id?: string
          short_description?: string | null
          sku?: string | null
          subcategory?: string | null
          tags?: Json | null
          techniques?: Json | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "artisan_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["shop_id"]
          },
        ]
      }
      shipping_data: {
        Row: {
          address: string
          cart_id: string
          created_at: string
          dane_ciudad: number
          desc_ciudad: string
          desc_depart: string
          desc_envio: string
          email: string
          full_name: string
          id: string
          phone: string
          postal_code: string
          updated_at: string
        }
        Insert: {
          address: string
          cart_id: string
          created_at?: string
          dane_ciudad: number
          desc_ciudad: string
          desc_depart: string
          desc_envio: string
          email: string
          full_name: string
          id?: string
          phone: string
          postal_code: string
          updated_at?: string
        }
        Update: {
          address?: string
          cart_id?: string
          created_at?: string
          dane_ciudad?: number
          desc_ciudad?: string
          desc_depart?: string
          desc_envio?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          postal_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_data_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart"
            referencedColumns: ["id"]
          },
        ]
      }
      site_images: {
        Row: {
          alt_text: string | null
          context: string
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          key: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          context: string
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          key: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          context?: string
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      step_validations: {
        Row: {
          ai_feedback: string | null
          created_at: string
          id: string
          step_id: string
          user_confirmation: string | null
          user_id: string
          validation_data: Json | null
          validation_result: string
          validation_type: string
        }
        Insert: {
          ai_feedback?: string | null
          created_at?: string
          id?: string
          step_id: string
          user_confirmation?: string | null
          user_id: string
          validation_data?: Json | null
          validation_result: string
          validation_type: string
        }
        Update: {
          ai_feedback?: string | null
          created_at?: string
          id?: string
          step_id?: string
          user_confirmation?: string | null
          user_id?: string
          validation_data?: Json | null
          validation_result?: string
          validation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_validations_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "task_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      store_embeddings: {
        Row: {
          category: string | null
          combined_text: string
          craft_type: string | null
          created_at: string
          embedding: string
          id: string
          price: number | null
          product_description: string | null
          product_id: string | null
          product_name: string | null
          region: string | null
          shop_description: string | null
          shop_id: string
          shop_name: string | null
          shop_story: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          combined_text: string
          craft_type?: string | null
          created_at?: string
          embedding: string
          id?: string
          price?: number | null
          product_description?: string | null
          product_id?: string | null
          product_name?: string | null
          region?: string | null
          shop_description?: string | null
          shop_id: string
          shop_name?: string | null
          shop_story?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          combined_text?: string
          craft_type?: string | null
          created_at?: string
          embedding?: string
          id?: string
          price?: number | null
          product_description?: string | null
          product_id?: string | null
          product_name?: string | null
          region?: string | null
          shop_description?: string | null
          shop_id?: string
          shop_name?: string | null
          shop_story?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_embeddings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_embeddings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_embeddings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "artisan_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_embeddings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["shop_id"]
          },
        ]
      }
      task_generation_history: {
        Row: {
          created_at: string
          generation_context: Json | null
          generation_source: string
          id: string
          tasks_created: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          generation_context?: Json | null
          generation_source: string
          id?: string
          tasks_created?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          generation_context?: Json | null
          generation_source?: string
          id?: string
          tasks_created?: number | null
          user_id?: string
        }
        Relationships: []
      }
      task_routing_analytics: {
        Row: {
          completed_at: string | null
          completion_method: string | null
          created_at: string
          destination: string | null
          error_message: string | null
          id: string
          matched_by: string
          matched_value: string | null
          route_type: string
          routed_at: string
          session_id: string | null
          task_agent_id: string
          task_deliverable_type: string | null
          task_id: string
          task_title: string
          time_to_complete_seconds: number | null
          user_agent: string | null
          user_id: string
          was_successful: boolean | null
          wizard_name: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_method?: string | null
          created_at?: string
          destination?: string | null
          error_message?: string | null
          id?: string
          matched_by: string
          matched_value?: string | null
          route_type: string
          routed_at?: string
          session_id?: string | null
          task_agent_id: string
          task_deliverable_type?: string | null
          task_id: string
          task_title: string
          time_to_complete_seconds?: number | null
          user_agent?: string | null
          user_id: string
          was_successful?: boolean | null
          wizard_name?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_method?: string | null
          created_at?: string
          destination?: string | null
          error_message?: string | null
          id?: string
          matched_by?: string
          matched_value?: string | null
          route_type?: string
          routed_at?: string
          session_id?: string | null
          task_agent_id?: string
          task_deliverable_type?: string | null
          task_id?: string
          task_title?: string
          time_to_complete_seconds?: number | null
          user_agent?: string | null
          user_id?: string
          was_successful?: boolean | null
          wizard_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_routing_analytics_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_steps: {
        Row: {
          ai_assistance_log: Json | null
          ai_context_prompt: string | null
          completion_status: string
          created_at: string
          description: string
          id: string
          input_type: string
          step_number: number
          task_id: string
          title: string
          updated_at: string
          user_input_data: Json | null
          validation_criteria: Json | null
        }
        Insert: {
          ai_assistance_log?: Json | null
          ai_context_prompt?: string | null
          completion_status?: string
          created_at?: string
          description: string
          id?: string
          input_type?: string
          step_number: number
          task_id: string
          title: string
          updated_at?: string
          user_input_data?: Json | null
          validation_criteria?: Json | null
        }
        Update: {
          ai_assistance_log?: Json | null
          ai_context_prompt?: string | null
          completion_status?: string
          created_at?: string
          description?: string
          id?: string
          input_type?: string
          step_number?: number
          task_id?: string
          title?: string
          updated_at?: string
          user_input_data?: Json | null
          validation_criteria?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "task_steps_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_badges: {
        Row: {
          badge_type: string
          created_at: string
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          badge_type: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          badge_type?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          description: string
          icon: string
          id: string
          title: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          title: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          title?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_agents: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_enabled: boolean
          last_used_at: string | null
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      user_behavior_analytics: {
        Row: {
          agent_id: string | null
          created_at: string | null
          duration_seconds: number | null
          event_data: Json
          event_type: string
          id: string
          maturity_level: string | null
          session_id: string | null
          success: boolean | null
          task_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          event_data?: Json
          event_type: string
          id?: string
          maturity_level?: string | null
          session_id?: string | null
          success?: boolean | null
          task_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          event_data?: Json
          event_type?: string
          id?: string
          maturity_level?: string | null
          session_id?: string | null
          success?: boolean | null
          task_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_chat_context: {
        Row: {
          created_at: string
          id: string
          message: string
          question_id: string | null
          role: string
          session_id: string
          step_context: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          question_id?: string | null
          role: string
          session_id: string
          step_context?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          question_id?: string | null
          role?: string
          session_id?: string
          step_context?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_learning_patterns: {
        Row: {
          active_hours: Json | null
          avg_task_completion_time_seconds: number | null
          completion_rate: number | null
          created_at: string | null
          id: string
          interactions_count: number | null
          last_maturity_check: string | null
          maturity_trend: Json | null
          preferred_task_types: Json | null
          recommended_adjustments: Json | null
          strength_areas: Json | null
          struggling_areas: Json | null
          tasks_abandoned_count: number | null
          tasks_completed_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_hours?: Json | null
          avg_task_completion_time_seconds?: number | null
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          interactions_count?: number | null
          last_maturity_check?: string | null
          maturity_trend?: Json | null
          preferred_task_types?: Json | null
          recommended_adjustments?: Json | null
          strength_areas?: Json | null
          struggling_areas?: Json | null
          tasks_abandoned_count?: number | null
          tasks_completed_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_hours?: Json | null
          avg_task_completion_time_seconds?: number | null
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          interactions_count?: number | null
          last_maturity_check?: string | null
          maturity_trend?: Json | null
          preferred_task_types?: Json | null
          recommended_adjustments?: Json | null
          strength_areas?: Json | null
          struggling_areas?: Json | null
          tasks_abandoned_count?: number | null
          tasks_completed_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_master_context: {
        Row: {
          business_context: Json | null
          business_profile: Json | null
          context_version: number | null
          conversation_insights: Json | null
          created_at: string | null
          goals_and_objectives: Json | null
          id: string
          language_preference: string | null
          last_assessment_date: string | null
          last_updated: string | null
          preferences: Json | null
          task_generation_context: Json | null
          technical_details: Json | null
          user_id: string
        }
        Insert: {
          business_context?: Json | null
          business_profile?: Json | null
          context_version?: number | null
          conversation_insights?: Json | null
          created_at?: string | null
          goals_and_objectives?: Json | null
          id?: string
          language_preference?: string | null
          last_assessment_date?: string | null
          last_updated?: string | null
          preferences?: Json | null
          task_generation_context?: Json | null
          technical_details?: Json | null
          user_id: string
        }
        Update: {
          business_context?: Json | null
          business_profile?: Json | null
          context_version?: number | null
          conversation_insights?: Json | null
          created_at?: string | null
          goals_and_objectives?: Json | null
          id?: string
          language_preference?: string | null
          last_assessment_date?: string | null
          last_updated?: string | null
          preferences?: Json | null
          task_generation_context?: Json | null
          technical_details?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_maturity_actions: {
        Row: {
          action_type: string
          category: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          points: number
          user_id: string
        }
        Insert: {
          action_type: string
          category: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          points: number
          user_id: string
        }
        Update: {
          action_type?: string
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      user_maturity_scores: {
        Row: {
          created_at: string
          id: string
          idea_validation: number
          market_fit: number
          monetization: number
          profile_data: Json | null
          user_experience: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_validation: number
          market_fit: number
          monetization: number
          profile_data?: Json | null
          user_experience: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_validation?: number
          market_fit?: number
          monetization?: number
          profile_data?: Json | null
          user_experience?: number
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding_profiles: {
        Row: {
          created_at: string
          id: string
          madurez_clientes_y_mercado: string
          madurez_clientes_y_mercado_razon: string | null
          madurez_clientes_y_mercado_tareas: string[] | null
          madurez_general: string
          madurez_identidad_artesanal: string
          madurez_identidad_artesanal_razon: string | null
          madurez_identidad_artesanal_tareas: string[] | null
          madurez_operacion_y_crecimiento: string
          madurez_operacion_y_crecimiento_razon: string | null
          madurez_operacion_y_crecimiento_tareas: string[] | null
          madurez_realidad_comercial: string
          madurez_realidad_comercial_razon: string | null
          madurez_realidad_comercial_tareas: string[] | null
          metadata: Json | null
          nombre: string | null
          raw_responses: Json
          resumen: string
          session_id: string
          tipo_artesania: string | null
          ubicacion: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          madurez_clientes_y_mercado: string
          madurez_clientes_y_mercado_razon?: string | null
          madurez_clientes_y_mercado_tareas?: string[] | null
          madurez_general: string
          madurez_identidad_artesanal: string
          madurez_identidad_artesanal_razon?: string | null
          madurez_identidad_artesanal_tareas?: string[] | null
          madurez_operacion_y_crecimiento: string
          madurez_operacion_y_crecimiento_razon?: string | null
          madurez_operacion_y_crecimiento_tareas?: string[] | null
          madurez_realidad_comercial: string
          madurez_realidad_comercial_razon?: string | null
          madurez_realidad_comercial_tareas?: string[] | null
          metadata?: Json | null
          nombre?: string | null
          raw_responses: Json
          resumen: string
          session_id: string
          tipo_artesania?: string | null
          ubicacion?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          madurez_clientes_y_mercado?: string
          madurez_clientes_y_mercado_razon?: string | null
          madurez_clientes_y_mercado_tareas?: string[] | null
          madurez_general?: string
          madurez_identidad_artesanal?: string
          madurez_identidad_artesanal_razon?: string | null
          madurez_identidad_artesanal_tareas?: string[] | null
          madurez_operacion_y_crecimiento?: string
          madurez_operacion_y_crecimiento_razon?: string | null
          madurez_operacion_y_crecimiento_tareas?: string[] | null
          madurez_realidad_comercial?: string
          madurez_realidad_comercial_razon?: string | null
          madurez_realidad_comercial_tareas?: string[] | null
          metadata?: Json | null
          nombre?: string | null
          raw_responses?: Json
          resumen?: string
          session_id?: string
          tipo_artesania?: string | null
          ubicacion?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          advanced_mode_unlocked: boolean | null
          created_at: string | null
          email_notification_preferences: Json | null
          id: string
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          advanced_mode_unlocked?: boolean | null
          created_at?: string | null
          email_notification_preferences?: Json | null
          id?: string
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          advanced_mode_unlocked?: boolean | null
          created_at?: string | null
          email_notification_preferences?: Json | null
          id?: string
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"] | null
          avatar_url: string | null
          brand_name: string | null
          business_description: string | null
          business_goals: string[] | null
          business_location: string | null
          business_type: string | null
          city: string | null
          created_at: string
          current_challenges: string[] | null
          current_stage: string | null
          dane_city: number | null
          department: string | null
          first_name: string | null
          full_name: string | null
          id: string
          initial_investment_range: string | null
          language_preference: string | null
          last_name: string | null
          monthly_revenue_goal: number | null
          newsletter_opt_in: boolean | null
          primary_skills: string[] | null
          rut: string | null
          rut_pendiente: boolean | null
          sales_channels: string[] | null
          social_media_presence: Json | null
          target_market: string | null
          team_size: string | null
          time_availability: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          whatsapp_e164: string | null
          years_in_business: number | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          brand_name?: string | null
          business_description?: string | null
          business_goals?: string[] | null
          business_location?: string | null
          business_type?: string | null
          city?: string | null
          created_at?: string
          current_challenges?: string[] | null
          current_stage?: string | null
          dane_city?: number | null
          department?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          initial_investment_range?: string | null
          language_preference?: string | null
          last_name?: string | null
          monthly_revenue_goal?: number | null
          newsletter_opt_in?: boolean | null
          primary_skills?: string[] | null
          rut?: string | null
          rut_pendiente?: boolean | null
          sales_channels?: string[] | null
          social_media_presence?: Json | null
          target_market?: string | null
          team_size?: string | null
          time_availability?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          whatsapp_e164?: string | null
          years_in_business?: number | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          brand_name?: string | null
          business_description?: string | null
          business_goals?: string[] | null
          business_location?: string | null
          business_type?: string | null
          city?: string | null
          created_at?: string
          current_challenges?: string[] | null
          current_stage?: string | null
          dane_city?: number | null
          department?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          initial_investment_range?: string | null
          language_preference?: string | null
          last_name?: string | null
          monthly_revenue_goal?: number | null
          newsletter_opt_in?: boolean | null
          primary_skills?: string[] | null
          rut?: string | null
          rut_pendiente?: boolean | null
          sales_channels?: string[] | null
          social_media_presence?: Json | null
          target_market?: string | null
          team_size?: string | null
          time_availability?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          whatsapp_e164?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_missions: number
          created_at: string
          current_streak: number
          experience_points: number
          id: string
          last_activity_date: string | null
          level: number
          longest_streak: number
          next_level_xp: number
          total_time_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_missions?: number
          created_at?: string
          current_streak?: number
          experience_points?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          next_level_xp?: number
          total_time_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_missions?: number
          created_at?: string
          current_streak?: number
          experience_points?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          next_level_xp?: number
          total_time_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          access_code: string | null
          city: string | null
          copilots_interest: string[] | null
          country: string | null
          created_at: string
          description: string | null
          email: string
          full_name: string
          id: string
          language: string | null
          phone: string | null
          problem_to_solve: string | null
          role: string | null
          sector: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          access_code?: string | null
          city?: string | null
          copilots_interest?: string[] | null
          country?: string | null
          created_at?: string
          description?: string | null
          email: string
          full_name: string
          id?: string
          language?: string | null
          phone?: string | null
          problem_to_solve?: string | null
          role?: string | null
          sector?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          access_code?: string | null
          city?: string | null
          copilots_interest?: string[] | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string
          full_name?: string
          id?: string
          language?: string | null
          phone?: string | null
          problem_to_solve?: string | null
          role?: string | null
          sector?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          metadata: Json | null
          phone_number: string
          session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          phone_number: string
          session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          phone_number?: string
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      image_optimization_stats: {
        Row: {
          avg_savings_percent: number | null
          bucket_id: string | null
          completed_count: number | null
          failed_count: number | null
          pending_count: number | null
          skipped_count: number | null
          total_optimized_bytes: number | null
          total_original_bytes: number | null
        }
        Relationships: []
      }
      marketplace_products: {
        Row: {
          active: boolean | null
          allows_local_pickup: boolean | null
          bank_data_status: string | null
          banner_url: string | null
          can_purchase: boolean | null
          category: string | null
          city: string | null
          craft: Json | null
          craft_type: string | null
          created_at: string | null
          customizable: boolean | null
          department: string | null
          description: string | null
          featured: boolean | null
          free_shipping: boolean | null
          id: string | null
          image_url: string | null
          images: Json | null
          is_new: boolean | null
          lead_time_days: number | null
          logo_url: string | null
          made_to_order: boolean | null
          material: Json | null
          materials: Json | null
          moderation_status: string | null
          name: string | null
          original_category: string | null
          price: number | null
          rating: number | null
          region: string | null
          reviews_count: number | null
          shipping_data_complete: boolean | null
          shop_id: string | null
          short_description: string | null
          sku: string | null
          stock: number | null
          store_description: string | null
          store_name: string | null
          store_slug: string | null
          subcategory: string | null
          tags: Json | null
          techniques: Json | null
          updated_at: string | null
        }
        Relationships: []
      }
      task_routing_summary: {
        Row: {
          abandoned_routes: number | null
          avg_completion_time_seconds: number | null
          failed_routes: number | null
          first_route: string | null
          last_route: string | null
          matched_by: string | null
          route_type: string | null
          successful_routes: number | null
          total_routes: number | null
          wizard_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_promo_code_to_order: {
        Args: {
          p_cart_total?: number
          p_code: string
          p_order_id?: string
          p_user_email?: string
          p_user_id?: string
        }
        Returns: Json
      }
      audit_data_inconsistencies: {
        Args: never
        Returns: {
          affected_count: number
          issue_description: string
          issue_type: string
          severity: string
          table_name: string
        }[]
      }
      calculate_next_level_xp: {
        Args: { current_level: number }
        Returns: number
      }
      check_admin_access: { Args: never; Returns: boolean }
      check_orphaned_data: {
        Args: never
        Returns: {
          orphaned_count: number
          severity: string
          table_name: string
        }[]
      }
      check_user_exists_and_type: {
        Args: { p_email: string }
        Returns: {
          has_shop: boolean
          user_exists: boolean
          user_id: string
          user_type: string
        }[]
      }
      cleanup_expired_password_reset_tokens: { Args: never; Returns: undefined }
      cleanup_expired_verification_tokens: { Args: never; Returns: undefined }
      cleanup_obsolete_tasks: { Args: never; Returns: undefined }
      cleanup_old_analytics: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      cleanup_orphaned_shops: {
        Args: never
        Returns: {
          action: string
          shop_id: string
          shop_name: string
          shop_slug: string
        }[]
      }
      create_secure_admin_user: {
        Args: { invited_by_admin_email: string; user_email: string }
        Returns: Json
      }
      create_user_by_type: {
        Args: {
          additional_data?: Json
          full_name: string
          selected_user_type: Database["public"]["Enums"]["user_type"]
          user_email: string
          user_password: string
        }
        Returns: Json
      }
      decrement_product_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: boolean
      }
      disable_agent: {
        Args: { p_agent_id: string; p_user_id: string }
        Returns: undefined
      }
      generate_gift_card_code: { Args: never; Returns: string }
      generate_gift_cards_from_order: {
        Args: { p_items: Json; p_order_id: string; p_purchaser_email: string }
        Returns: Json
      }
      generate_order_number: { Args: never; Returns: string }
      generate_public_profile: {
        Args: {
          shop_record: Database["public"]["Tables"]["artisan_shops"]["Row"]
        }
        Returns: Json
      }
      get_all_users_combined: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          shop_name: string
          user_type: string
        }[]
      }
      get_current_user_email: { Args: never; Returns: string }
      get_latest_maturity_scores: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          idea_validation: number
          market_fit: number
          monetization: number
          user_experience: number
        }[]
      }
      get_personalized_recommendations: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_validation_stats: { Args: never; Returns: Json }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_maturity_score: {
        Args: {
          action_description: string
          action_metadata?: Json
          increment_points: number
          score_category: string
          user_uuid: string
        }
        Returns: {
          idea_validation: number
          market_fit: number
          monetization: number
          user_experience: number
        }[]
      }
      initialize_admin_user: { Args: never; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_authorized_user: { Args: { user_email: string }; Returns: boolean }
      is_moderator: { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          action_type: string
          details?: Json
          resource_id?: string
          resource_type: string
        }
        Returns: undefined
      }
      map_artisan_category: {
        Args: { artisan_category: string }
        Returns: string
      }
      match_shop_embeddings: {
        Args: {
          craft_filter?: string
          featured_only?: boolean
          match_count?: number
          query_embedding: string
          region_filter?: string
          similarity_threshold?: number
        }
        Returns: {
          banner_url: string
          craft_type: string
          description: string
          featured: boolean
          id: string
          logo_url: string
          region: string
          shop_name: string
          shop_slug: string
          similarity: number
        }[]
      }
      normalize_text: { Args: { input_text: string }; Returns: string }
      repair_data_inconsistencies: {
        Args: never
        Returns: {
          action_taken: string
          details: string
          records_affected: number
        }[]
      }
      reset_user_maturity_progress:
        | { Args: never; Returns: Json }
        | { Args: { p_user_id: string }; Returns: Json }
      sanitize_text_input: {
        Args: { max_length?: number; text_input: string }
        Returns: string
      }
      scheduled_cleanup: { Args: never; Returns: undefined }
      search_agent_knowledge: {
        Args: {
          filter_category?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          chunk_index: number
          chunk_text: string
          document_filename: string
          document_id: string
          document_metadata: Json
          id: string
          knowledge_category: string
          similarity: number
        }[]
      }
      search_agent_memory: {
        Args: {
          filter_agent_type?: string
          filter_artisan_id?: string
          filter_memory_type?: string
          filter_session_id?: string
          match_count?: number
          min_importance?: number
          query_embedding: string
        }
        Returns: {
          agent_type: string
          artisan_id: string
          chunk_text: string
          created_at: string
          document_filename: string
          id: string
          importance_score: number
          knowledge_category: string
          memory_type: string
          metadata: Json
          session_id: string
          similarity: number
          summary: string
        }[]
      }
      search_store_embeddings: {
        Args: {
          filter_category?: string
          filter_craft_type?: string
          filter_price_max?: number
          filter_price_min?: number
          filter_region?: string
          match_count?: number
          query_embedding: number[]
        }
        Returns: {
          category: string
          combined_text: string
          craft_type: string
          id: string
          price: number
          product_description: string
          product_id: string
          product_name: string
          region: string
          shop_description: string
          shop_id: string
          shop_name: string
          shop_story: string
          similarity: number
        }[]
      }
      sync_active_task_limits: {
        Args: never
        Returns: {
          action_taken: string
          active_count: number
          user_id: string
        }[]
      }
      update_user_streak: { Args: { p_user_id: string }; Returns: Json }
      upsert_artisan_profile: {
        Args: {
          p_artisan_id: string
          p_embedding: string
          p_increment_interaction?: boolean
          p_key_insights: Json
          p_maturity_snapshot: Json
          p_profile_summary: string
        }
        Returns: {
          profile_artisan_id: string
          profile_id: string
          profile_interaction_count: number
          profile_summary: string
          profile_updated_at: string
        }[]
      }
      validate_date_range: {
        Args: { end_date: string; start_date: string }
        Returns: boolean
      }
      validate_email_format: { Args: { email_input: string }; Returns: boolean }
      validate_json_structure: {
        Args: { json_input: Json; required_keys: string[] }
        Returns: boolean
      }
      validate_promo_code: {
        Args: {
          p_cart_total?: number
          p_code: string
          p_user_email?: string
          p_user_id?: string
        }
        Returns: Json
      }
    }
    Enums: {
      account_type: "artisan" | "buyer"
      app_role: "admin" | "moderator" | "shop_owner" | "user"
      user_type: "admin" | "shop_owner" | "regular"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["artisan", "buyer"],
      app_role: ["admin", "moderator", "shop_owner", "user"],
      user_type: ["admin", "shop_owner", "regular"],
    },
  },
} as const
