import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: "admin" | "designer" | "engineer" | "inspector";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: "admin" | "designer" | "engineer" | "inspector";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: "admin" | "designer" | "engineer" | "inspector";
          created_at?: string;
        };
      };
      standards: {
        Row: {
          id: string;
          main_title: string;
          sub_title: string;
          details: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          main_title: string;
          sub_title: string;
          details: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          main_title?: string;
          sub_title?: string;
          details?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      materials: {
        Row: {
          id: string;
          name: string;
          specifications: string;
          manufacturer: string;
          quality_grade: string;
          standard_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          specifications: string;
          manufacturer: string;
          quality_grade: string;
          standard_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          specifications?: string;
          manufacturer?: string;
          quality_grade?: string;
          standard_id?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string;
          designer_id: string;
          status: "planning" | "in_progress" | "completed" | "on_hold";
          created_at: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          messages: unknown;
          created_at: string;
        };
      };
    };
  };
};
