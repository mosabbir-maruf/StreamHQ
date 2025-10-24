export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      histories: {
        Row: {
          adult: boolean
          backdrop_path: string | null
          completed: boolean
          created_at: string
          duration: number
          episode: number
          id: number
          last_position: number
          media_id: number
          poster_path: string | null
          release_date: string
          season: number
          title: string
          type: string
          updated_at: string
          user_id: string
          vote_average: number
        }
        Insert: {
          adult: boolean
          backdrop_path?: string | null
          completed?: boolean
          created_at?: string
          duration?: number
          episode?: number
          id?: number
          last_position?: number
          media_id: number
          poster_path?: string | null
          release_date: string
          season?: number
          title: string
          type: string
          updated_at?: string
          user_id: string
          vote_average: number
        }
        Update: {
          adult?: boolean
          backdrop_path?: string | null
          completed?: boolean
          created_at?: string
          duration?: number
          episode?: number
          id?: number
          last_position?: number
          media_id?: number
          poster_path?: string | null
          release_date?: string
          season?: number
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          vote_average?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          id: string
          username: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          id: string
          username: string
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          id?: string
          username?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          adult: boolean
          backdrop_path: string | null
          created_at: string
          id: number
          poster_path: string | null
          release_date: string
          title: string
          type: string
          user_id: string
          vote_average: number
        }
        Insert: {
          adult: boolean
          backdrop_path?: string | null
          created_at?: string
          id: number
          poster_path?: string | null
          release_date: string
          title: string
          type: string
          user_id: string
          vote_average: number
        }
        Update: {
          adult?: boolean
          backdrop_path?: string | null
          created_at?: string
          id?: number
          poster_path?: string | null
          release_date?: string
          title?: string
          type?: string
          user_id?: string
          vote_average?: number
        }
        Relationships: []
      }
      watchlist_done: {
        Row: {
          user_id: string
          id: number
          type: string
          adult: boolean
          backdrop_path: string | null
          poster_path: string | null
          release_date: string
          title: string
          vote_average: number
          created_at: string
          completed_at: string
        }
        Insert: {
          user_id: string
          id: number
          type: string
          adult: boolean
          backdrop_path?: string | null
          poster_path?: string | null
          release_date: string
          title: string
          vote_average: number
          created_at?: string
          completed_at?: string
        }
        Update: {
          user_id?: string
          id?: number
          type?: string
          adult?: boolean
          backdrop_path?: string | null
          poster_path?: string | null
          release_date?: string
          title?: string
          vote_average?: number
          created_at?: string
          completed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaTableNameOrOptions]
    : never