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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      orders: {
        Row: {
          address_line: string
          city: string
          created_at: string
          customer_name: string
          delivery_charge: number
          email: string | null
          id: string
          items: Json
          landmark: string | null
          notes: string | null
          order_ref: string
          payment_method: string
          payment_status: string
          phone: string
          pincode: string
          state: string
          status: string
          subtotal: number
          total: number
        }
        Insert: {
          address_line: string
          city: string
          created_at?: string
          customer_name: string
          delivery_charge: number
          email?: string | null
          id?: string
          items: Json
          landmark?: string | null
          notes?: string | null
          order_ref: string
          payment_method: string
          payment_status?: string
          phone: string
          pincode: string
          state: string
          status?: string
          subtotal: number
          total: number
        }
        Update: {
          address_line?: string
          city?: string
          created_at?: string
          customer_name?: string
          delivery_charge?: number
          email?: string | null
          id?: string
          items?: Json
          landmark?: string | null
          notes?: string | null
          order_ref?: string
          payment_method?: string
          payment_status?: string
          phone?: string
          pincode?: string
          state?: string
          status?: string
          subtotal?: number
          total?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          best_seller: boolean
          category: string
          colors: string[]
          created_at: string
          description: string
          featured: boolean
          id: string
          images: string[]
          mrp: number | null
          name: string
          new_arrival: boolean
          price: number
          sizes: string[]
          slug: string
          stock: number
        }
        Insert: {
          active?: boolean
          best_seller?: boolean
          category: string
          colors?: string[]
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          images?: string[]
          mrp?: number | null
          name: string
          new_arrival?: boolean
          price: number
          sizes?: string[]
          slug: string
          stock?: number
        }
        Update: {
          active?: boolean
          best_seller?: boolean
          category?: string
          colors?: string[]
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          images?: string[]
          mrp?: number | null
          name?: string
          new_arrival?: boolean
          price?: number
          sizes?: string[]
          slug?: string
          stock?: number
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          address: string
          business_hours: string
          cod_enabled: boolean
          delivery_charge: number
          email: string
          free_delivery_threshold: number
          id: number
          phone: string
          return_policy: string
          shipping_policy: string
          store_name: string
          tagline: string
          updated_at: string
          upi_enabled: boolean
          upi_id: string
          whatsapp: string
        }
        Insert: {
          address?: string
          business_hours?: string
          cod_enabled?: boolean
          delivery_charge?: number
          email?: string
          free_delivery_threshold?: number
          id?: number
          phone?: string
          return_policy?: string
          shipping_policy?: string
          store_name?: string
          tagline?: string
          updated_at?: string
          upi_enabled?: boolean
          upi_id?: string
          whatsapp?: string
        }
        Update: {
          address?: string
          business_hours?: string
          cod_enabled?: boolean
          delivery_charge?: number
          email?: string
          free_delivery_threshold?: number
          id?: number
          phone?: string
          return_policy?: string
          shipping_policy?: string
          store_name?: string
          tagline?: string
          updated_at?: string
          upi_enabled?: boolean
          upi_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_order: {
        Args: { _id: string }
        Returns: {
          address_line: string
          city: string
          created_at: string
          customer_name: string
          delivery_charge: number
          email: string | null
          id: string
          items: Json
          landmark: string | null
          notes: string | null
          order_ref: string
          payment_method: string
          payment_status: string
          phone: string
          pincode: string
          state: string
          status: string
          subtotal: number
          total: number
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      place_order: { Args: { _customer: Json; _items: Json }; Returns: Json }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
