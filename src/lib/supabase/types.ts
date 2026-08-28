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
    PostgrestVersion: "14.5"
  }
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
      achievements: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          date: string | null
          event_name: string | null
          featured: boolean
          id: string
          links: Json
          media: Json
          published: boolean
          result: string | null
          role: string | null
          slug: string
          sort_order: number
          summary: string | null
          title: string
          type: Database["public"]["Enums"]["achievement_type"]
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          date?: string | null
          event_name?: string | null
          featured?: boolean
          id?: string
          links?: Json
          media?: Json
          published?: boolean
          result?: string | null
          role?: string | null
          slug: string
          sort_order?: number
          summary?: string | null
          title: string
          type: Database["public"]["Enums"]["achievement_type"]
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          date?: string | null
          event_name?: string | null
          featured?: boolean
          id?: string
          links?: Json
          media?: Json
          published?: boolean
          result?: string | null
          role?: string | null
          slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          type?: Database["public"]["Enums"]["achievement_type"]
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          credential_url: string | null
          id: string
          issued_on: string | null
          issuer: string | null
          logo_path: string | null
          name: string
          published: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_url?: string | null
          id?: string
          issued_on?: string | null
          issuer?: string | null
          logo_path?: string | null
          name: string
          published?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_url?: string | null
          id?: string
          issued_on?: string | null
          issuer?: string | null
          logo_path?: string | null
          name?: string
          published?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          ip_hash: string | null
          message: string
          name: string
          source: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          ip_hash?: string | null
          message: string
          name: string
          source?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          ip_hash?: string | null
          message?: string
          name?: string
          source?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      engineering_projects: {
        Row: {
          body: string | null
          concepts: string[]
          cover_image_path: string | null
          created_at: string
          data: Json
          gallery: Json
          id: string
          interactive_widget: string | null
          published: boolean
          repo_url: string | null
          report_path: string | null
          slug: string
          sort_order: number
          summary: string | null
          title: string
          tools: string[]
          type: Database["public"]["Enums"]["engineering_project_type"]
          updated_at: string
        }
        Insert: {
          body?: string | null
          concepts?: string[]
          cover_image_path?: string | null
          created_at?: string
          data?: Json
          gallery?: Json
          id?: string
          interactive_widget?: string | null
          published?: boolean
          repo_url?: string | null
          report_path?: string | null
          slug: string
          sort_order?: number
          summary?: string | null
          title: string
          tools?: string[]
          type: Database["public"]["Enums"]["engineering_project_type"]
          updated_at?: string
        }
        Update: {
          body?: string | null
          concepts?: string[]
          cover_image_path?: string | null
          created_at?: string
          data?: Json
          gallery?: Json
          id?: string
          interactive_widget?: string | null
          published?: boolean
          repo_url?: string | null
          report_path?: string | null
          slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          tools?: string[]
          type?: Database["public"]["Enums"]["engineering_project_type"]
          updated_at?: string
        }
        Relationships: []
      }
      experience: {
        Row: {
          created_at: string
          end_date: string | null
          highlights: string[]
          id: string
          location: string | null
          org: string
          published: boolean
          role: string | null
          slug: string
          sort_order: number
          start_date: string | null
          summary: string | null
          type: Database["public"]["Enums"]["experience_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          highlights?: string[]
          id?: string
          location?: string | null
          org: string
          published?: boolean
          role?: string | null
          slug: string
          sort_order?: number
          start_date?: string | null
          summary?: string | null
          type: Database["public"]["Enums"]["experience_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          highlights?: string[]
          id?: string
          location?: string | null
          org?: string
          published?: boolean
          role?: string | null
          slug?: string
          sort_order?: number
          start_date?: string | null
          summary?: string | null
          type?: Database["public"]["Enums"]["experience_type"]
          updated_at?: string
        }
        Relationships: []
      }
      featured_in: {
        Row: {
          category: Database["public"]["Enums"]["featured_in_category"]
          created_at: string
          id: string
          logo_path: string | null
          name: string
          published: boolean
          slug: string
          sort_order: number
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["featured_in_category"]
          created_at?: string
          id?: string
          logo_path?: string | null
          name: string
          published?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["featured_in_category"]
          created_at?: string
          id?: string
          logo_path?: string | null
          name?: string
          published?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          body: string | null
          cover_image_path: string | null
          created_at: string
          demo_video_url: string | null
          gallery: Json
          id: string
          live_url: string | null
          metrics: Json
          outcome: string | null
          published: boolean
          repo_url: string | null
          slug: string
          sort_order: number
          stack: string[]
          status_check_url: string | null
          summary: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          cover_image_path?: string | null
          created_at?: string
          demo_video_url?: string | null
          gallery?: Json
          id?: string
          live_url?: string | null
          metrics?: Json
          outcome?: string | null
          published?: boolean
          repo_url?: string | null
          slug: string
          sort_order?: number
          stack?: string[]
          status_check_url?: string | null
          summary?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          cover_image_path?: string | null
          created_at?: string
          demo_video_url?: string | null
          gallery?: Json
          id?: string
          live_url?: string | null
          metrics?: Json
          outcome?: string | null
          published?: boolean
          repo_url?: string | null
          slug?: string
          sort_order?: number
          stack?: string[]
          status_check_url?: string | null
          summary?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          availability: string | null
          created_at: string
          cv_path: string | null
          email: string | null
          eyebrow: string | null
          hero_primary_label: string | null
          hero_secondary_label: string | null
          id: string
          maintenance_message: string | null
          quote: string | null
          quote_author: string | null
          singleton: boolean
          socials: Json
          tagline: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          cv_path?: string | null
          email?: string | null
          eyebrow?: string | null
          hero_primary_label?: string | null
          hero_secondary_label?: string | null
          id?: string
          maintenance_message?: string | null
          quote?: string | null
          quote_author?: string | null
          singleton?: boolean
          socials?: Json
          tagline?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          cv_path?: string | null
          email?: string | null
          eyebrow?: string | null
          hero_primary_label?: string | null
          hero_secondary_label?: string | null
          id?: string
          maintenance_message?: string | null
          quote?: string | null
          quote_author?: string | null
          singleton?: boolean
          socials?: Json
          tagline?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at: string
          id: string
          linked_slugs: string[]
          name: string
          published: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          id?: string
          linked_slugs?: string[]
          name: string
          published?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          id?: string
          linked_slugs?: string[]
          name?: string
          published?: boolean
          slug?: string
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
      achievement_type:
        | "hackathon"
        | "competition"
        | "talk"
        | "award"
        | "program"
      engineering_project_type: "lab" | "capstone" | "course" | "personal"
      experience_type:
        | "internship"
        | "job"
        | "volunteer"
        | "leadership"
        | "education"
      featured_in_category: "press" | "stage" | "program"
      skill_category: "software" | "telecom"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      achievement_type: [
        "hackathon",
        "competition",
        "talk",
        "award",
        "program",
      ],
      engineering_project_type: ["lab", "capstone", "course", "personal"],
      experience_type: [
        "internship",
        "job",
        "volunteer",
        "leadership",
        "education",
      ],
      featured_in_category: ["press", "stage", "program"],
      skill_category: ["software", "telecom"],
    },
  },
} as const
