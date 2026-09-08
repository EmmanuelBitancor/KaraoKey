// Generated database types for Supabase
// https://supabase.com/docs/guides/generating-types

export type Database = {
  public: {
    Tables: {
      songs: {
        Row: {
          code: string;
          title: string;
          artist: string;
          youtube_id: string;
          created_at: string;
        };
        Insert: {
          code: string;
          title: string;
          artist: string;
          youtube_id?: string;
          created_at?: string;
        };
        Update: {
          code?: string;
          title?: string;
          artist?: string;
          youtube_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          type: string;
          comment: string | null;
          rating: number | null;
          suggestion: string | null;
          name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          comment?: string | null;
          rating?: number | null;
          suggestion?: string | null;
          name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          comment?: string | null;
          rating?: number | null;
          suggestion?: string | null;
          name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
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

export type Song = Database["public"]["Tables"]["songs"]["Row"];