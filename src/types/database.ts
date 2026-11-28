/**
 * Generated Supabase database types.
 * Matches the schema in supabase/migrations/0001_initial_schema.sql.
 * Regenerate with `supabase gen types` after applying schema changes.
 * Do not maintain a second, conflicting version of the database schema.
 */

export type Database = {
  public: {
    Tables: {
      zones: {
        Row: {
          id: string;
          name: string;
          slug: string;
          zone_id_code: string | null;
          is_active: boolean;
          is_activated: boolean;
          activation_token: string | null;
          activated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          zone_id_code?: string;
          is_active?: boolean;
          is_activated?: boolean;
          activation_token?: string | null;
          activated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          zone_id_code?: string;
          is_active?: boolean;
          is_activated?: boolean;
          activation_token?: string | null;
          activated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      zone_activation_codes: {
        Row: {
          id: string;
          zone_id: string;
          auth_user_id: string;
          code: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          zone_id: string;
          auth_user_id: string;
          code: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          zone_id?: string;
          auth_user_id?: string;
          code?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          role: string;
          zone_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: string;
          zone_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
          zone_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          first_name: string;
          surname: string;
          kingschat_username: string | null;
          designation: string | null;
          title: string | null;
          age_group: string | null;
          zone_id: string;
          registration_status: string;
          payment_status: string;
          registration_source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          surname: string;
          kingschat_username?: string | null;
          designation?: string | null;
          title?: string | null;
          age_group?: string | null;
          zone_id: string;
          registration_status?: string;
          payment_status?: string;
          registration_source: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          surname?: string;
          kingschat_username?: string | null;
          designation?: string | null;
          title?: string | null;
          age_group?: string | null;
          zone_id?: string;
          registration_status?: string;
          payment_status?: string;
          registration_source?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      import_batches: {
        Row: {
          id: string;
          zone_id: string;
          actor_id: string | null;
          source: string;
          file_name: string;
          status: string;
          total_rows: number;
          valid_rows: number;
          error_rows: number;
          imported_rows: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          zone_id: string;
          actor_id?: string | null;
          source: string;
          file_name: string;
          status?: string;
          total_rows?: number;
          valid_rows?: number;
          error_rows?: number;
          imported_rows?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          zone_id?: string;
          actor_id?: string | null;
          source?: string;
          file_name?: string;
          status?: string;
          total_rows?: number;
          valid_rows?: number;
          error_rows?: number;
          imported_rows?: number;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      import_rows: {
        Row: {
          id: string;
          batch_id: string;
          row_number: number;
          first_name: string | null;
          surname: string | null;
          kingschat_username: string | null;
          designation: string | null;
          title: string | null;
          age_group: string | null;
          zone_id: string | null;
          payment_status: string | null;
          registration_source: string;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          row_number: number;
          first_name?: string | null;
          surname?: string | null;
          kingschat_username?: string | null;
          designation?: string | null;
          title?: string | null;
          age_group?: string | null;
          zone_id?: string | null;
          payment_status?: string | null;
          registration_source?: string;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          row_number?: number;
          first_name?: string | null;
          surname?: string | null;
          kingschat_username?: string | null;
          designation?: string | null;
          title?: string | null;
          age_group?: string | null;
          zone_id?: string | null;
          payment_status?: string | null;
          registration_source?: string;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
      };
      guardians: {
        Row: {
          id: string;
          registration_id: string;
          first_name: string;
          surname: string;
          email: string;
          phone: string | null;
          relationship: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          first_name: string;
          surname: string;
          email: string;
          phone?: string | null;
          relationship: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          registration_id?: string;
          first_name?: string;
          surname?: string;
          email?: string;
          phone?: string | null;
          relationship?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      guardian_consent_templates: {
        Row: {
          id: string;
          zone_id: string | null;
          title: string;
          description: string;
          is_required: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          zone_id?: string | null;
          title: string;
          description: string;
          is_required?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          zone_id?: string | null;
          title?: string;
          description?: string;
          is_required?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      guardian_responses: {
        Row: {
          id: string;
          guardian_id: string;
          consent_template_id: string;
          response: string;
          responded_at: string | null;
          response_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guardian_id: string;
          consent_template_id: string;
          response?: string;
          responded_at?: string | null;
          response_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guardian_id?: string;
          consent_template_id?: string;
          response?: string;
          responded_at?: string | null;
          response_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      import_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          headers: Json;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          headers?: Json;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          headers?: Json;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      export_batches: {
        Row: {
          id: string;
          export_type: string;
          zone_id: string | null;
          actor_id: string | null;
          status: string;
          total_rows: number;
          exported_rows: number;
          file_name: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          export_type: string;
          zone_id?: string | null;
          actor_id?: string | null;
          status?: string;
          total_rows?: number;
          exported_rows?: number;
          file_name?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          export_type?: string;
          zone_id?: string | null;
          actor_id?: string | null;
          status?: string;
          total_rows?: number;
          exported_rows?: number;
          file_name?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      export_rows: {
        Row: {
          id: string;
          batch_id: string;
          row_number: number;
          first_name: string | null;
          surname: string | null;
          kingschat_username: string | null;
          designation: string | null;
          title: string | null;
          age_group: string | null;
          zone_id: string | null;
          payment_status: string | null;
          registration_source: string | null;
          exported_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          row_number: number;
          first_name?: string | null;
          surname?: string | null;
          kingschat_username?: string | null;
          designation?: string | null;
          title?: string | null;
          age_group?: string | null;
          zone_id?: string | null;
          payment_status?: string | null;
          registration_source?: string | null;
          exported_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          row_number?: number;
          first_name?: string | null;
          surname?: string | null;
          kingschat_username?: string | null;
          designation?: string | null;
          title?: string | null;
          age_group?: string | null;
          zone_id?: string | null;
          payment_status?: string | null;
          registration_source?: string | null;
          exported_at?: string;
        };
      };
      notification_templates: {
        Row: {
          id: string;
          name: string;
          channel: string;
          subject: string | null;
          body: string;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          channel: string;
          subject?: string | null;
          body: string;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          channel?: string;
          subject?: string | null;
          body?: string;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          template_id: string | null;
          recipient_type: string;
          recipient_id: string;
          recipient_email: string | null;
          recipient_phone: string | null;
          status: string;
          retry_count: number;
          max_retries: number;
          last_error: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_id?: string | null;
          recipient_type: string;
          recipient_id: string;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          status?: string;
          retry_count?: number;
          max_retries?: number;
          last_error?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string | null;
          recipient_type?: string;
          recipient_id?: string;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          status?: string;
          retry_count?: number;
          max_retries?: number;
          last_error?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notification_logs: {
        Row: {
          id: string;
          notification_id: string;
          attempt_number: number;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          notification_id: string;
          attempt_number: number;
          status: string;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          notification_id?: string;
          attempt_number?: number;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export type Tables<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName];
