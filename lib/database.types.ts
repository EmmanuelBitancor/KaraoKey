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