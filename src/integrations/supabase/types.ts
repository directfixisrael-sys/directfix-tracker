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
      admin_reminders: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          due_date: string
          id: string
          is_completed: boolean
          notes: string | null
          subject: string
          task_name: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          due_date: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          subject?: string
          task_name: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          due_date?: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          subject?: string
          task_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          bg_color: string | null
          created_at: string
          id: string
          is_active: boolean
          message: string
          placement: string
          title: string
          updated_at: string
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          placement?: string
          title?: string
          updated_at?: string
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          placement?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blocked_dates: {
        Row: {
          created_at: string
          date: string
          end_time: string | null
          id: string
          reason: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          reason?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          reason?: string | null
          start_time?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_amount: number | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      iphone_models: {
        Row: {
          back_glass_price: number
          battery_price: number
          charging_price: number
          compatible_screen_price: number
          created_at: string
          id: string
          is_active: boolean
          min_lead_hours: number
          name: string
          original_screen_price: number
          series: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          back_glass_price?: number
          battery_price?: number
          charging_price?: number
          compatible_screen_price?: number
          created_at?: string
          id?: string
          is_active?: boolean
          min_lead_hours?: number
          name: string
          original_screen_price?: number
          series?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          back_glass_price?: number
          battery_price?: number
          charging_price?: number
          compatible_screen_price?: number
          created_at?: string
          id?: string
          is_active?: boolean
          min_lead_hours?: number
          name?: string
          original_screen_price?: number
          series?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string
          customer_phone: string
          description: string
          id: string
          order_id: string | null
          points: number
          type: string
        }
        Insert: {
          created_at?: string
          customer_phone: string
          description?: string
          id?: string
          order_id?: string | null
          points: number
          type?: string
        }
        Update: {
          created_at?: string
          customer_phone?: string
          description?: string
          id?: string
          order_id?: string | null
          points?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      model_repair_prices: {
        Row: {
          created_at: string
          id: string
          model_id: string
          price: number
          repair_type_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_id: string
          price?: number
          repair_type_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          model_id?: string
          price?: number
          repair_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_repair_prices_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "iphone_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_repair_prices_repair_type_id_fkey"
            columns: ["repair_type_id"]
            isOneToOne: false
            referencedRelation: "repair_types"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accessories: Json
          bundle_discount: number | null
          bundle_items: Json | null
          completed_at: string | null
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string
          customer_address: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          device_images: string[] | null
          device_type: string
          estimated_arrival: string | null
          feedback: string | null
          id: string
          invoice_link: string | null
          is_viewing: boolean | null
          issue_description: string
          last_viewed_at: string | null
          lead_source: string | null
          notes: string[]
          order_number: number
          payment_link: string | null
          payment_status: string | null
          rating: number | null
          repair_price: number
          status: string
          technician_name: string | null
          updated_at: string
          wants_promotions: boolean
          warranty_expiry: string | null
          waze_link: string | null
        }
        Insert: {
          accessories?: Json
          bundle_discount?: number | null
          bundle_items?: Json | null
          completed_at?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          customer_address?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          device_images?: string[] | null
          device_type?: string
          estimated_arrival?: string | null
          feedback?: string | null
          id?: string
          invoice_link?: string | null
          is_viewing?: boolean | null
          issue_description?: string
          last_viewed_at?: string | null
          lead_source?: string | null
          notes?: string[]
          order_number?: number
          payment_link?: string | null
          payment_status?: string | null
          rating?: number | null
          repair_price?: number
          status?: string
          technician_name?: string | null
          updated_at?: string
          wants_promotions?: boolean
          warranty_expiry?: string | null
          waze_link?: string | null
        }
        Update: {
          accessories?: Json
          bundle_discount?: number | null
          bundle_items?: Json | null
          completed_at?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          customer_address?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          device_images?: string[] | null
          device_type?: string
          estimated_arrival?: string | null
          feedback?: string | null
          id?: string
          invoice_link?: string | null
          is_viewing?: boolean | null
          issue_description?: string
          last_viewed_at?: string | null
          lead_source?: string | null
          notes?: string[]
          order_number?: number
          payment_link?: string | null
          payment_status?: string | null
          rating?: number | null
          repair_price?: number
          status?: string
          technician_name?: string | null
          updated_at?: string
          wants_promotions?: boolean
          warranty_expiry?: string | null
          waze_link?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          badge_text: string | null
          created_at: string
          description: string
          display_mode: string
          end_date: string | null
          icon: string | null
          id: string
          is_active: boolean
          start_date: string | null
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          badge_text?: string | null
          created_at?: string
          description: string
          display_mode?: string
          end_date?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          start_date?: string | null
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          badge_text?: string | null
          created_at?: string
          description?: string
          display_mode?: string
          end_date?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          start_date?: string | null
          title?: string
          updated_at?: string
          value?: number | null
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
      referrals: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          referred_discount: number
          referred_phone: string
          referrer_discount: number
          referrer_phone: string
          status: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          referred_discount?: number
          referred_phone: string
          referrer_discount?: number
          referrer_phone: string
          status?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          referred_discount?: number
          referred_phone?: string
          referrer_discount?: number
          referrer_phone?: string
          status?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_bundles: {
        Row: {
          addon_repair_type: string
          created_at: string
          discount_percent: number
          id: string
          is_active: boolean
          name: string
          primary_repair_type: string
        }
        Insert: {
          addon_repair_type: string
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          name: string
          primary_repair_type: string
        }
        Update: {
          addon_repair_type?: string
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          name?: string
          primary_repair_type?: string
        }
        Relationships: []
      }
      repair_types: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          info_description: string
          info_title: string
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
          info_description?: string
          info_title?: string
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
          info_description?: string
          info_title?: string
          is_active?: boolean
          is_phone_only?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          language: string | null
          lead_source: string | null
          page: string
          referrer: string | null
          step: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          language?: string | null
          lead_source?: string | null
          page: string
          referrer?: string | null
          step?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          language?: string | null
          lead_source?: string | null
          page?: string
          referrer?: string | null
          step?: string | null
          user_agent?: string | null
          visitor_id?: string
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
