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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_access_log: {
        Row: {
          accessed_at: string
          action: string
          admin_user_id: string
          id: string
          metadata: Json
          table_accessed: string
          target_user_id: string | null
        }
        Insert: {
          accessed_at?: string
          action?: string
          admin_user_id: string
          id?: string
          metadata?: Json
          table_accessed: string
          target_user_id?: string | null
        }
        Update: {
          accessed_at?: string
          action?: string
          admin_user_id?: string
          id?: string
          metadata?: Json
          table_accessed?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      ai_diagnostics: {
        Row: {
          attempt_no: number
          created_at: string
          error: string | null
          http_status: number | null
          id: string
          latency_ms: number | null
          model: string
          payload_valid: boolean | null
          request_id: string
          status: string
          task: string
          user_id: string | null
        }
        Insert: {
          attempt_no?: number
          created_at?: string
          error?: string | null
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          model: string
          payload_valid?: boolean | null
          request_id: string
          status: string
          task: string
          user_id?: string | null
        }
        Update: {
          attempt_no?: number
          created_at?: string
          error?: string | null
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          model?: string
          payload_valid?: boolean | null
          request_id?: string
          status?: string
          task?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_memory: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          kind: string
          metadata: Json
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          kind: string
          metadata?: Json
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          kind?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      ai_response_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string | null
          hit_count: number
          id: string
          model: string | null
          payload: Json
          profile_hash: string | null
          task: string
          user_id: string | null
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at?: string | null
          hit_count?: number
          id?: string
          model?: string | null
          payload: Json
          profile_hash?: string | null
          task: string
          user_id?: string | null
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string | null
          hit_count?: number
          id?: string
          model?: string | null
          payload?: Json
          profile_hash?: string | null
          task?: string
          user_id?: string | null
        }
        Relationships: []
      }
      calibration_active: {
        Row: {
          activated_at: string
          activated_by: string | null
          active_version: number | null
          id: boolean
          note: string | null
        }
        Insert: {
          activated_at?: string
          activated_by?: string | null
          active_version?: number | null
          id?: boolean
          note?: string | null
        }
        Update: {
          activated_at?: string
          activated_by?: string | null
          active_version?: number | null
          id?: boolean
          note?: string | null
        }
        Relationships: []
      }
      calibration_runs: {
        Row: {
          avg_shift_pts: number | null
          buckets_applied: number
          buckets_evaluated: number
          capped_count: number
          created_by: string | null
          error: string | null
          finished_at: string | null
          id: string
          max_shift_pts: number | null
          notes: string | null
          started_at: string
          status: string
          total_outcomes: number
          version: number
        }
        Insert: {
          avg_shift_pts?: number | null
          buckets_applied?: number
          buckets_evaluated?: number
          capped_count?: number
          created_by?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          max_shift_pts?: number | null
          notes?: string | null
          started_at?: string
          status?: string
          total_outcomes?: number
          version: number
        }
        Update: {
          avg_shift_pts?: number | null
          buckets_applied?: number
          buckets_evaluated?: number
          capped_count?: number
          created_by?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          max_shift_pts?: number | null
          notes?: string | null
          started_at?: string
          status?: string
          total_outcomes?: number
          version?: number
        }
        Relationships: []
      }
      calibration_weights: {
        Row: {
          applied: boolean
          correction_factor: number
          created_at: string
          expected_admit_rate: number
          id: string
          major: string | null
          observed_admit_rate: number
          region: string | null
          sample_size: number
          tier: string | null
          version: number
        }
        Insert: {
          applied?: boolean
          correction_factor: number
          created_at?: string
          expected_admit_rate: number
          id?: string
          major?: string | null
          observed_admit_rate: number
          region?: string | null
          sample_size: number
          tier?: string | null
          version: number
        }
        Update: {
          applied?: boolean
          correction_factor?: number
          created_at?: string
          expected_admit_rate?: number
          id?: string
          major?: string | null
          observed_admit_rate?: number
          region?: string | null
          sample_size?: number
          tier?: string | null
          version?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      counseling_bookings: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          preferred_date: string
          preferred_time: string
          question: string
          status: string
          timezone: string | null
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          preferred_date: string
          preferred_time: string
          question: string
          status?: string
          timezone?: string | null
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          preferred_date?: string
          preferred_time?: string
          question?: string
          status?: string
          timezone?: string | null
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      document_analyses: {
        Row: {
          created_at: string
          document_type: string
          file_name: string | null
          id: string
          result: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name?: string | null
          id?: string
          result?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string | null
          id?: string
          result?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      factor_scores: {
        Row: {
          category: string | null
          created_at: string
          document_boost: Json | null
          factors: Json
          id: string
          overall_score: number
          university_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          document_boost?: Json | null
          factors?: Json
          id?: string
          overall_score: number
          university_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          document_boost?: Json | null
          factors?: Json
          id?: string
          overall_score?: number
          university_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          responses: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          responses?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          responses?: Json
          user_id?: string
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          created_at: string
          id: string
          persona: string
          questions: Json
          readiness_score: number
          scores: Json
          summary: Json
          target_school: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          persona?: string
          questions?: Json
          readiness_score?: number
          scores?: Json
          summary?: Json
          target_school?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          persona?: string
          questions?: Json
          readiness_score?: number
          scores?: Json
          summary?: Json
          target_school?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      major_admit_rates: {
        Row: {
          admit_rate: number
          confidence: number | null
          created_at: string
          data_source: string
          data_year: number
          id: string
          major_normalized: string
          notes: string | null
          overall_admit_rate: number | null
          source_url: string | null
          university_name: string
          updated_at: string
        }
        Insert: {
          admit_rate: number
          confidence?: number | null
          created_at?: string
          data_source?: string
          data_year: number
          id?: string
          major_normalized: string
          notes?: string | null
          overall_admit_rate?: number | null
          source_url?: string | null
          university_name: string
          updated_at?: string
        }
        Update: {
          admit_rate?: number
          confidence?: number | null
          created_at?: string
          data_source?: string
          data_year?: number
          id?: string
          major_normalized?: string
          notes?: string | null
          overall_admit_rate?: number | null
          source_url?: string | null
          university_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      match_outcomes: {
        Row: {
          alignment_category: string | null
          alignment_score: number | null
          created_at: string
          id: string
          intended_major: string | null
          notes: string
          predicted_category: string | null
          predicted_score: number | null
          status: string
          tags: string[]
          uni_country: string | null
          uni_region: string | null
          uni_tier: string | null
          university_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alignment_category?: string | null
          alignment_score?: number | null
          created_at?: string
          id?: string
          intended_major?: string | null
          notes?: string
          predicted_category?: string | null
          predicted_score?: number | null
          status: string
          tags?: string[]
          uni_country?: string | null
          uni_region?: string | null
          uni_tier?: string | null
          university_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alignment_category?: string | null
          alignment_score?: number | null
          created_at?: string
          id?: string
          intended_major?: string | null
          notes?: string
          predicted_category?: string | null
          predicted_score?: number | null
          status?: string
          tags?: string[]
          uni_country?: string | null
          uni_region?: string | null
          uni_tier?: string | null
          university_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          dedupe_key: string | null
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dedupe_key?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dedupe_key?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      page_visits: {
        Row: {
          route: string
          user_id: string
          visited_at: string
        }
        Insert: {
          route: string
          user_id: string
          visited_at?: string
        }
        Update: {
          route?: string
          user_id?: string
          visited_at?: string
        }
        Relationships: []
      }
      payment_review_requests: {
        Row: {
          admin_notes: string | null
          amount_cad: number
          created_at: string
          id: string
          payer_email: string | null
          payment_reference: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount_cad?: number
          created_at?: string
          id?: string
          payer_email?: string | null
          payment_reference: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount_cad?: number
          created_at?: string
          id?: string
          payer_email?: string | null
          payment_reference?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      premium_passes: {
        Row: {
          active: boolean
          amount_cad: number
          granted_at: string
          id: string
          payment_ref: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          amount_cad?: number
          granted_at?: string
          id?: string
          payment_ref?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          amount_cad?: number
          granted_at?: string
          id?: string
          payment_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profile_versions: {
        Row: {
          created_at: string
          id: string
          label: string | null
          resume_file_name: string | null
          resume_text: string | null
          snapshot: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          resume_file_name?: string | null
          resume_text?: string | null
          snapshot?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          resume_file_name?: string | null
          resume_text?: string | null
          snapshot?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          a_level_grades: string | null
          athletics: string | null
          baccalaureate_score: string | null
          budget: string | null
          class_rank: string | null
          country: string | null
          course_rigor: string | null
          created_at: string
          email: string | null
          extracurriculars: string | null
          first_generation: boolean | null
          gaokao_score: string | null
          gpa: string | null
          honors_awards: string | null
          id: string
          intended_major: string | null
          legacy_status: string | null
          name: string | null
          national_exam_score: string | null
          national_exam_type: string | null
          predicted_grades: string | null
          research_experience: string | null
          special_talents: string | null
          target_countries: string[] | null
          test_scores: string | null
          timeline: string | null
          updated_at: string
          user_id: string
          volunteer_hours: string | null
          work_experience: string | null
        }
        Insert: {
          a_level_grades?: string | null
          athletics?: string | null
          baccalaureate_score?: string | null
          budget?: string | null
          class_rank?: string | null
          country?: string | null
          course_rigor?: string | null
          created_at?: string
          email?: string | null
          extracurriculars?: string | null
          first_generation?: boolean | null
          gaokao_score?: string | null
          gpa?: string | null
          honors_awards?: string | null
          id?: string
          intended_major?: string | null
          legacy_status?: string | null
          name?: string | null
          national_exam_score?: string | null
          national_exam_type?: string | null
          predicted_grades?: string | null
          research_experience?: string | null
          special_talents?: string | null
          target_countries?: string[] | null
          test_scores?: string | null
          timeline?: string | null
          updated_at?: string
          user_id: string
          volunteer_hours?: string | null
          work_experience?: string | null
        }
        Update: {
          a_level_grades?: string | null
          athletics?: string | null
          baccalaureate_score?: string | null
          budget?: string | null
          class_rank?: string | null
          country?: string | null
          course_rigor?: string | null
          created_at?: string
          email?: string | null
          extracurriculars?: string | null
          first_generation?: boolean | null
          gaokao_score?: string | null
          gpa?: string | null
          honors_awards?: string | null
          id?: string
          intended_major?: string | null
          legacy_status?: string | null
          name?: string | null
          national_exam_score?: string | null
          national_exam_type?: string | null
          predicted_grades?: string | null
          research_experience?: string | null
          special_talents?: string | null
          target_countries?: string[] | null
          test_scores?: string | null
          timeline?: string | null
          updated_at?: string
          user_id?: string
          volunteer_hours?: string | null
          work_experience?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      university_matches: {
        Row: {
          ai_explanations: Json
          created_at: string
          engine_result: Json
          id: string
          profile_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_explanations?: Json
          created_at?: string
          engine_result?: Json
          id?: string
          profile_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_explanations?: Json
          created_at?: string
          engine_result?: Json
          id?: string
          profile_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_applications: {
        Row: {
          checklist: Json
          created_at: string
          deadline: string
          id: string
          notes: string
          university_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checklist?: Json
          created_at?: string
          deadline?: string
          id?: string
          notes?: string
          university_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checklist?: Json
          created_at?: string
          deadline?: string
          id?: string
          notes?: string
          university_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_deadlines: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          id: string
          notes: string
          reminder: boolean
          reminder_days: Json
          type: string
          university: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          id?: string
          notes?: string
          reminder?: boolean
          reminder_days?: Json
          type?: string
          university: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          notes?: string
          reminder?: boolean
          reminder_days?: Json
          type?: string
          university?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          deadline_reminders: boolean
          email_notifications: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline_reminders?: boolean
          email_notifications?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline_reminders?: boolean
          email_notifications?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_programs: {
        Row: {
          checklist: Json
          country: string
          created_at: string
          deadline: string
          id: string
          notes: string
          priority: string
          program: string
          status: string
          tuition: string
          university: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checklist?: Json
          country?: string
          created_at?: string
          deadline?: string
          id?: string
          notes?: string
          priority?: string
          program?: string
          status?: string
          tuition?: string
          university: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checklist?: Json
          country?: string
          created_at?: string
          deadline?: string
          id?: string
          notes?: string
          priority?: string
          program?: string
          status?: string
          tuition?: string
          university?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verified_admits: {
        Row: {
          act_composite: number | null
          admit_year: number
          awards: string[] | null
          class_rank_percentile: number | null
          country: string
          course_rigor: string | null
          created_at: string
          decision: string
          embedded_at: string | null
          embedding: string | null
          essay_themes: string[] | null
          extracurricular_tier: string | null
          financial_aid_awarded: number | null
          first_generation: boolean | null
          gpa_unweighted: number | null
          gpa_weighted: number | null
          id: string
          intended_major: string | null
          leadership_summary: string | null
          legacy: boolean | null
          notes: string | null
          recommendations_strength: string | null
          recruited_athlete: boolean | null
          region: string | null
          research_publications: number | null
          round: string | null
          sat_total: number | null
          scholarship_amount: number | null
          source: string
          source_url: string | null
          spike: string | null
          student_country: string | null
          summary_text: string | null
          test_optional: boolean | null
          tier: string | null
          university_name: string
          verified: boolean
        }
        Insert: {
          act_composite?: number | null
          admit_year: number
          awards?: string[] | null
          class_rank_percentile?: number | null
          country: string
          course_rigor?: string | null
          created_at?: string
          decision: string
          embedded_at?: string | null
          embedding?: string | null
          essay_themes?: string[] | null
          extracurricular_tier?: string | null
          financial_aid_awarded?: number | null
          first_generation?: boolean | null
          gpa_unweighted?: number | null
          gpa_weighted?: number | null
          id?: string
          intended_major?: string | null
          leadership_summary?: string | null
          legacy?: boolean | null
          notes?: string | null
          recommendations_strength?: string | null
          recruited_athlete?: boolean | null
          region?: string | null
          research_publications?: number | null
          round?: string | null
          sat_total?: number | null
          scholarship_amount?: number | null
          source?: string
          source_url?: string | null
          spike?: string | null
          student_country?: string | null
          summary_text?: string | null
          test_optional?: boolean | null
          tier?: string | null
          university_name: string
          verified?: boolean
        }
        Update: {
          act_composite?: number | null
          admit_year?: number
          awards?: string[] | null
          class_rank_percentile?: number | null
          country?: string
          course_rigor?: string | null
          created_at?: string
          decision?: string
          embedded_at?: string | null
          embedding?: string | null
          essay_themes?: string[] | null
          extracurricular_tier?: string | null
          financial_aid_awarded?: number | null
          first_generation?: boolean | null
          gpa_unweighted?: number | null
          gpa_weighted?: number | null
          id?: string
          intended_major?: string | null
          leadership_summary?: string | null
          legacy?: boolean | null
          notes?: string | null
          recommendations_strength?: string | null
          recruited_athlete?: boolean | null
          region?: string | null
          research_publications?: number | null
          round?: string | null
          sat_total?: number | null
          scholarship_amount?: number | null
          source?: string
          source_url?: string | null
          spike?: string | null
          student_country?: string | null
          summary_text?: string | null
          test_optional?: boolean | null
          tier?: string | null
          university_name?: string
          verified?: boolean
        }
        Relationships: []
      }
      verified_scholarships: {
        Row: {
          amount_usd: number | null
          award_year: number
          awarding_body: string
          awards: string[] | null
          country: string | null
          created_at: string
          essay_themes: string[] | null
          gpa_unweighted: number | null
          id: string
          intended_major: string | null
          notes: string | null
          recipient_country: string | null
          sat_total: number | null
          scholarship_name: string
          source: string
          source_url: string | null
          spike: string | null
          university_name: string | null
          verified: boolean
        }
        Insert: {
          amount_usd?: number | null
          award_year: number
          awarding_body: string
          awards?: string[] | null
          country?: string | null
          created_at?: string
          essay_themes?: string[] | null
          gpa_unweighted?: number | null
          id?: string
          intended_major?: string | null
          notes?: string | null
          recipient_country?: string | null
          sat_total?: number | null
          scholarship_name: string
          source?: string
          source_url?: string | null
          spike?: string | null
          university_name?: string | null
          verified?: boolean
        }
        Update: {
          amount_usd?: number | null
          award_year?: number
          awarding_body?: string
          awards?: string[] | null
          country?: string | null
          created_at?: string
          essay_themes?: string[] | null
          gpa_unweighted?: number | null
          id?: string
          intended_major?: string | null
          notes?: string | null
          recipient_country?: string | null
          sat_total?: number | null
          scholarship_name?: string
          source?: string
          source_url?: string | null
          spike?: string | null
          university_name?: string | null
          verified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      outcome_insights: {
        Row: {
          acceptance_pct: number | null
          alignment_category: string | null
          outcome_count: number | null
          status: string | null
          top_tags: string[] | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_active_calibration: {
        Args: never
        Returns: {
          correction_factor: number
          major: string
          region: string
          sample_size: number
          tier: string
          version: number
        }[]
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      match_ai_memory:
        | {
            Args: {
              match_count?: number
              match_kinds?: string[]
              query_embedding: string
            }
            Returns: {
              content: string
              id: string
              kind: string
              metadata: Json
              similarity: number
            }[]
          }
        | {
            Args: {
              match_count?: number
              match_kinds?: string[]
              match_user_id: string
              query_embedding: string
            }
            Returns: {
              content: string
              id: string
              kind: string
              metadata: Json
              similarity: number
            }[]
          }
      match_verified_admits: {
        Args: {
          f_country?: string
          f_region?: string
          f_tier?: string
          f_university?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          act_composite: number
          awards: string[]
          country: string
          essay_themes: string[]
          first_generation: boolean
          gpa_unweighted: number
          id: string
          intended_major: string
          leadership_summary: string
          recommendations_strength: string
          sat_total: number
          similarity: number
          source: string
          source_url: string
          spike: string
          student_country: string
          summary_text: string
          university_name: string
          verified: boolean
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      rollback_calibration: {
        Args: { target_version: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
