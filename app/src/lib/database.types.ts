export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          encrypted_key: string
          id: string
          metadata: Json | null
          service: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          encrypted_key: string
          id?: string
          metadata?: Json | null
          service: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          encrypted_key?: string
          id?: string
          metadata?: Json | null
          service?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      campaign_analytics: {
        Row: {
          abuse_reports: number | null
          bounce_rate: number | null
          campaign_id: string | null
          click_rate: number | null
          created_at: string | null
          deliveries: number | null
          emails_clicked: number | null
          emails_opened: number | null
          emails_sent: number | null
          forwards_count: number | null
          id: string
          last_click: string | null
          last_open: string | null
          last_synced_at: string | null
          open_rate: number | null
          total_clicks: number | null
          total_opens: number | null
          unsubscribes: number | null
          updated_at: string | null
        }
        Insert: {
          abuse_reports?: number | null
          bounce_rate?: number | null
          campaign_id?: string | null
          click_rate?: number | null
          created_at?: string | null
          deliveries?: number | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          forwards_count?: number | null
          id?: string
          last_click?: string | null
          last_open?: string | null
          last_synced_at?: string | null
          open_rate?: number | null
          total_clicks?: number | null
          total_opens?: number | null
          unsubscribes?: number | null
          updated_at?: string | null
        }
        Update: {
          abuse_reports?: number | null
          bounce_rate?: number | null
          campaign_id?: string | null
          click_rate?: number | null
          created_at?: string | null
          deliveries?: number | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          forwards_count?: number | null
          id?: string
          last_click?: string | null
          last_open?: string | null
          last_synced_at?: string | null
          open_rate?: number | null
          total_clicks?: number | null
          total_opens?: number | null
          unsubscribes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          canva_design_id: string
          canva_design_url: string | null
          canva_thumbnail_url: string | null
          created_at: string | null
          distributed_channels: string[] | null
          github_page_url: string | null
          id: string
          mailchimp_campaign_id: string | null
          metadata: Json | null
          name: string
          notion_page_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          canva_design_id: string
          canva_design_url?: string | null
          canva_thumbnail_url?: string | null
          created_at?: string | null
          distributed_channels?: string[] | null
          github_page_url?: string | null
          id?: string
          mailchimp_campaign_id?: string | null
          metadata?: Json | null
          name: string
          notion_page_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          canva_design_id?: string
          canva_design_url?: string | null
          canva_thumbnail_url?: string | null
          created_at?: string | null
          distributed_channels?: string[] | null
          github_page_url?: string | null
          id?: string
          mailchimp_campaign_id?: string | null
          metadata?: Json | null
          name?: string
          notion_page_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notion_databases: {
        Row: {
          created_at: string | null
          database_id: string
          database_name: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          database_id: string
          database_name?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          database_id?: string
          database_name?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrypt_api_key: {
        Args: { encrypted_text: string }
        Returns: string
      }
      encrypt_api_key: {
        Args: { key_text: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
