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
      blocked_dates: {
        Row: {
          created_at: string
          date: string
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      iphone_models: {
        Row: {
          battery_price: number
          compatible_screen_price: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          original_screen_price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          battery_price?: number
          compatible_screen_price?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          original_screen_price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          battery_price?: number
          compatible_screen_price?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          original_screen_price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          message: string
          order_id: string
          read: boolean
          sender: string
          sender_name: string
          timestamp: string
        }
        Insert: {
          id?: string
          message: string
          order_id: string
          read?: boolean
          sender: string
          sender_name: string
          timestamp?: string
        }
        Update: {
          id?: string
          message?: string
          order_id?: string
          read?: boolean
          sender?: string
          sender_name?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accessories: Json
          completed_at: string | null
          created_at: string
          customer_address: string
          customer_name: string
          customer_phone: string
          device_type: string
          estimated_arrival: string | null
          feedback: string | null
          id: string
          invoice_link: string | null
          is_viewing: boolean | null
          issue_description: string
          last_viewed_at: string | null
          notes: string[]
          rating: number | null
          repair_price: number
          status: string
          technician_name: string | null
          updated_at: string
          wants_promotions: boolean
          waze_link: string | null
        }
        Insert: {
          accessories?: Json
          completed_at?: string | null
          created_at?: string
          customer_address?: string
          customer_name: string
          customer_phone: string
          device_type?: string
          estimated_arrival?: string | null
          feedback?: string | null
          id?: string
          invoice_link?: string | null
          is_viewing?: boolean | null
          issue_description?: string
          last_viewed_at?: string | null
          notes?: string[]
          rating?: number | null
          repair_price?: number
          status?: string
          technician_name?: string | null
          updated_at?: string
          wants_promotions?: boolean
          waze_link?: string | null
        }
        Update: {
          accessories?: Json
          completed_at?: string | null
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_phone?: string
          device_type?: string
          estimated_arrival?: string | null
          feedback?: string | null
          id?: string
          invoice_link?: string | null
          is_viewing?: boolean | null
          issue_description?: string
          last_viewed_at?: string | null
          notes?: string[]
          rating?: number | null
          repair_price?: number
          status?: string
          technician_name?: string | null
          updated_at?: string
          wants_promotions?: boolean
          waze_link?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          badge_text: string | null
          created_at: string
          description: string
          end_date: string | null
          icon: string | null
          id: string
          is_active: boolean
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
        }
        Relationships: []
      }
      repair_types: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          is_phone_only: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          is_phone_only?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          is_phone_only?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
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
    Enums: {},
  },
} as const
