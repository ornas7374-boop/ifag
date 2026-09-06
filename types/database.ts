/**
 * ★ مولَّد من المخطط الفعلي — لا تعدّله يدويًا ★
 *
 * استُخرج بالاستعلام عن pg_attribute و pg_constraint بعد تطبيق كل ملفات
 * supabase/migrations على PostgreSQL 16، فالأعمدة والعلاقات تطابق
 * قاعدة البيانات حرفيًا بدلًا من أن تكون تخمينًا.
 *
 * حقل Relationships ليس زينة: postgrest-js يستنتج منه أنواع الاستعلامات
 * المضمّنة مثل .select("*, cities(name_ar)"). بدونه تنهار كل الأنواع
 * إلى never.
 *
 * لإعادة التوليد بعد أي migration جديدة: انظر README.
 *
 * المبالغ: كل عمود price/fee/amount هو bigint بوحدة الهللة، ويصل من
 * PostgREST كعدد لا كنص.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      addons: {
        Row: {
          id: string;
          place_id: string;
          name_ar: string;
          description_ar: string | null;
          image_url: string | null;
          price: number;
          pricing_mode: Database["public"]["Enums"]["pricing_mode"];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          name_ar: string;
          description_ar?: string | null;
          image_url?: string | null;
          price: number;
          pricing_mode?: Database["public"]["Enums"]["pricing_mode"];
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          place_id?: string;
          name_ar?: string;
          description_ar?: string | null;
          image_url?: string | null;
          price?: number;
          pricing_mode?: Database["public"]["Enums"]["pricing_mode"];
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "addons_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
        ];
      };
      amenities: {
        Row: {
          id: string;
          slug: string;
          name_ar: string;
          icon: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ar: string;
          icon?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name_ar?: string;
          icon?: string | null;
        };
        Relationships: [];
      };
      booking_addons: {
        Row: {
          id: string;
          booking_id: string;
          addon_id: string;
          name_ar: string;
          unit_price: number;
          pricing_mode: Database["public"]["Enums"]["pricing_mode"];
          quantity: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          booking_id: string;
          addon_id: string;
          name_ar: string;
          unit_price: number;
          pricing_mode: Database["public"]["Enums"]["pricing_mode"];
          quantity?: number;
          line_total: number;
        };
        Update: {
          id?: string;
          booking_id?: string;
          addon_id?: string;
          name_ar?: string;
          unit_price?: number;
          pricing_mode?: Database["public"]["Enums"]["pricing_mode"];
          quantity?: number;
          line_total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "booking_addons_addon_id_fkey";
            columns: ["addon_id"];
            isOneToOne: false;
            referencedRelation: "addons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_addons_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          reference: string;
          place_id: string;
          customer_id: string | null;
          host_id: string;
          source: Database["public"]["Enums"]["booking_source"];
          status: Database["public"]["Enums"]["booking_status"];
          payment_status: Database["public"]["Enums"]["payment_status"];
          booking_start: string;
          booking_end: string;
          preparation_start: string | null;
          actual_check_in: string | null;
          actual_check_out: string | null;
          available_again_at: string | null;
          rate_unit: Database["public"]["Enums"]["rate_unit"];
          units: number;
          guests: number;
          base_amount: number;
          addons_amount: number;
          discount_amount: number;
          commission_rate: number;
          commission_amount: number;
          total_amount: number;
          currency: string;
          quote_snapshot: Json;
          hold_expires_at: string | null;
          created_at: string;
          updated_at: string;
          blocking_period: string | null;
          contracted_period: string | null;
        };
        Insert: {
          id?: string;
          reference: string;
          place_id: string;
          customer_id?: string | null;
          host_id: string;
          source?: Database["public"]["Enums"]["booking_source"];
          status?: Database["public"]["Enums"]["booking_status"];
          payment_status?: Database["public"]["Enums"]["payment_status"];
          booking_start: string;
          booking_end: string;
          preparation_start?: string | null;
          actual_check_in?: string | null;
          actual_check_out?: string | null;
          available_again_at?: string | null;
          rate_unit: Database["public"]["Enums"]["rate_unit"];
          units?: number;
          guests?: number;
          base_amount?: number;
          addons_amount?: number;
          discount_amount?: number;
          commission_rate?: number;
          commission_amount?: number;
          total_amount?: number;
          currency?: string;
          quote_snapshot?: Json;
          hold_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference?: string;
          place_id?: string;
          customer_id?: string | null;
          host_id?: string;
          source?: Database["public"]["Enums"]["booking_source"];
          status?: Database["public"]["Enums"]["booking_status"];
          payment_status?: Database["public"]["Enums"]["payment_status"];
          booking_start?: string;
          booking_end?: string;
          preparation_start?: string | null;
          actual_check_in?: string | null;
          actual_check_out?: string | null;
          available_again_at?: string | null;
          rate_unit?: Database["public"]["Enums"]["rate_unit"];
          units?: number;
          guests?: number;
          base_amount?: number;
          addons_amount?: number;
          discount_amount?: number;
          commission_rate?: number;
          commission_amount?: number;
          total_amount?: number;
          currency?: string;
          quote_snapshot?: Json;
          hold_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name_ar: string;
          icon: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ar: string;
          icon?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          slug?: string;
          name_ar?: string;
          icon?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      cities: {
        Row: {
          id: string;
          slug: string;
          name_ar: string;
          name_en: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ar: string;
          name_en?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_ar?: string;
          name_en?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      commissions: {
        Row: {
          id: string;
          booking_id: string | null;
          order_id: string | null;
          host_id: string;
          gross_amount: number;
          rate: number;
          commission_amount: number;
          host_net_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          order_id?: string | null;
          host_id: string;
          gross_amount: number;
          rate: number;
          commission_amount: number;
          host_net_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          order_id?: string | null;
          host_id?: string;
          gross_amount?: number;
          rate?: number;
          commission_amount?: number;
          host_net_amount?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "commissions_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commissions_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commissions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      delivery_addresses: {
        Row: {
          id: string;
          user_id: string;
          label_ar: string | null;
          city_id: string;
          district_id: string | null;
          address_text: string;
          latitude: number;
          longitude: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label_ar?: string | null;
          city_id: string;
          district_id?: string | null;
          address_text: string;
          latitude: number;
          longitude: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label_ar?: string | null;
          city_id?: string;
          district_id?: string | null;
          address_text?: string;
          latitude?: number;
          longitude?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "delivery_addresses_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "delivery_addresses_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "delivery_addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      delivery_zones: {
        Row: {
          id: string;
          service_id: string;
          city_id: string | null;
          district_id: string | null;
          fee: number;
          min_order: number;
        };
        Insert: {
          id?: string;
          service_id: string;
          city_id?: string | null;
          district_id?: string | null;
          fee?: number;
          min_order?: number;
        };
        Update: {
          id?: string;
          service_id?: string;
          city_id?: string | null;
          district_id?: string | null;
          fee?: number;
          min_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "delivery_zones_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "delivery_zones_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "delivery_zones_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      districts: {
        Row: {
          id: string;
          city_id: string;
          name_ar: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          name_ar: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          name_ar?: string;
        };
        Relationships: [
          {
            foreignKeyName: "districts_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
        ];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          place_id: string | null;
          service_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          place_id?: string | null;
          service_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          place_id?: string | null;
          service_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      listing_images: {
        Row: {
          id: string;
          place_id: string | null;
          service_id: string | null;
          storage_path: string;
          alt_ar: string | null;
          sort_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          place_id?: string | null;
          service_id?: string | null;
          storage_path: string;
          alt_ar?: string | null;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          place_id?: string | null;
          service_id?: string | null;
          storage_path?: string;
          alt_ar?: string | null;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_images_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listing_images_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title_ar: string;
          body_ar: string | null;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title_ar: string;
          body_ar?: string | null;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title_ar?: string;
          body_ar?: string | null;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          service_id: string;
          title_ar: string;
          unit_price: number;
          pricing_mode: Database["public"]["Enums"]["pricing_mode"];
          quantity: number;
          line_total: number;
          options: Json;
          service_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          service_id: string;
          title_ar: string;
          unit_price: number;
          pricing_mode: Database["public"]["Enums"]["pricing_mode"];
          quantity?: number;
          line_total: number;
          options?: Json;
          service_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          service_id?: string;
          title_ar?: string;
          unit_price?: number;
          pricing_mode?: Database["public"]["Enums"]["pricing_mode"];
          quantity?: number;
          line_total?: number;
          options?: Json;
          service_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          reference: string;
          customer_id: string;
          host_id: string;
          status: Database["public"]["Enums"]["order_status"];
          payment_status: Database["public"]["Enums"]["payment_status"];
          delivery_address_id: string | null;
          delivery_address_snapshot: Json | null;
          service_at: string | null;
          services_amount: number;
          delivery_fee: number;
          extra_fees: number;
          discount_amount: number;
          commission_rate: number;
          commission_amount: number;
          total_amount: number;
          currency: string;
          quote_snapshot: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference: string;
          customer_id: string;
          host_id: string;
          status?: Database["public"]["Enums"]["order_status"];
          payment_status?: Database["public"]["Enums"]["payment_status"];
          delivery_address_id?: string | null;
          delivery_address_snapshot?: Json | null;
          service_at?: string | null;
          services_amount?: number;
          delivery_fee?: number;
          extra_fees?: number;
          discount_amount?: number;
          commission_rate?: number;
          commission_amount?: number;
          total_amount?: number;
          currency?: string;
          quote_snapshot?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference?: string;
          customer_id?: string;
          host_id?: string;
          status?: Database["public"]["Enums"]["order_status"];
          payment_status?: Database["public"]["Enums"]["payment_status"];
          delivery_address_id?: string | null;
          delivery_address_snapshot?: Json | null;
          service_at?: string | null;
          services_amount?: number;
          delivery_fee?: number;
          extra_fees?: number;
          discount_amount?: number;
          commission_rate?: number;
          commission_amount?: number;
          total_amount?: number;
          currency?: string;
          quote_snapshot?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey";
            columns: ["delivery_address_id"];
            isOneToOne: false;
            referencedRelation: "delivery_addresses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          booking_id: string | null;
          order_id: string | null;
          amount: number;
          currency: string;
          status: Database["public"]["Enums"]["payment_status"];
          provider: string;
          provider_payment_id: string | null;
          raw_webhook: Json | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          order_id?: string | null;
          amount: number;
          currency?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          provider: string;
          provider_payment_id?: string | null;
          raw_webhook?: Json | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          order_id?: string | null;
          amount?: number;
          currency?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          provider?: string;
          provider_payment_id?: string | null;
          raw_webhook?: Json | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      place_amenities: {
        Row: {
          place_id: string;
          amenity_id: string;
        };
        Insert: {
          place_id: string;
          amenity_id: string;
        };
        Update: {
          place_id?: string;
          amenity_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "place_amenities_amenity_id_fkey";
            columns: ["amenity_id"];
            isOneToOne: false;
            referencedRelation: "amenities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "place_amenities_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
        ];
      };
      place_availability_rules: {
        Row: {
          id: string;
          place_id: string;
          weekday: number | null;
          opens_at: string | null;
          closes_at: string | null;
          is_closed: boolean;
        };
        Insert: {
          id?: string;
          place_id: string;
          weekday?: number | null;
          opens_at?: string | null;
          closes_at?: string | null;
          is_closed?: boolean;
        };
        Update: {
          id?: string;
          place_id?: string;
          weekday?: number | null;
          opens_at?: string | null;
          closes_at?: string | null;
          is_closed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "place_availability_rules_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
        ];
      };
      places: {
        Row: {
          id: string;
          slug: string;
          host_id: string;
          title_ar: string;
          description_ar: string;
          place_kind: Database["public"]["Enums"]["place_kind"];
          status: Database["public"]["Enums"]["listing_status"];
          city_id: string;
          district_id: string | null;
          address_text: string;
          latitude: number;
          longitude: number;
          capacity_min: number;
          capacity_max: number;
          check_in_time: string;
          check_out_time: string;
          turnaround_minutes: number;
          price_per_hour: number | null;
          price_per_day: number | null;
          price_per_night: number | null;
          rating_avg: number;
          rating_count: number;
          cancellation_policy_ar: string;
          rules_ar: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          host_id: string;
          title_ar: string;
          description_ar?: string;
          place_kind: Database["public"]["Enums"]["place_kind"];
          status?: Database["public"]["Enums"]["listing_status"];
          city_id: string;
          district_id?: string | null;
          address_text?: string;
          latitude: number;
          longitude: number;
          capacity_min?: number;
          capacity_max?: number;
          check_in_time?: string;
          check_out_time?: string;
          turnaround_minutes?: number;
          price_per_hour?: number | null;
          price_per_day?: number | null;
          price_per_night?: number | null;
          rating_avg?: number;
          rating_count?: number;
          cancellation_policy_ar?: string;
          rules_ar?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          host_id?: string;
          title_ar?: string;
          description_ar?: string;
          place_kind?: Database["public"]["Enums"]["place_kind"];
          status?: Database["public"]["Enums"]["listing_status"];
          city_id?: string;
          district_id?: string | null;
          address_text?: string;
          latitude?: number;
          longitude?: number;
          capacity_min?: number;
          capacity_max?: number;
          check_in_time?: string;
          check_out_time?: string;
          turnaround_minutes?: number;
          price_per_hour?: number | null;
          price_per_day?: number | null;
          price_per_night?: number | null;
          rating_avg?: number;
          rating_count?: number;
          cancellation_policy_ar?: string;
          rules_ar?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "places_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "places_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "places_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      platform_settings: {
        Row: {
          id: boolean;
          app_name: string | null;
          logo_url: string | null;
          favicon_url: string | null;
          brand_colors: Json | null;
          font_family: string | null;
          border_radius: string | null;
          commission_rate: number;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          app_name?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          brand_colors?: Json | null;
          font_family?: string | null;
          border_radius?: string | null;
          commission_rate?: number;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          app_name?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          brand_colors?: Json | null;
          font_family?: string | null;
          border_radius?: string | null;
          commission_rate?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          author_id: string;
          place_id: string | null;
          service_id: string | null;
          booking_id: string | null;
          order_id: string | null;
          rating: number;
          body_ar: string;
          is_hidden: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          place_id?: string | null;
          service_id?: string | null;
          booking_id?: string | null;
          order_id?: string | null;
          rating: number;
          body_ar?: string;
          is_hidden?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          place_id?: string | null;
          service_id?: string | null;
          booking_id?: string | null;
          order_id?: string | null;
          rating?: number;
          body_ar?: string;
          is_hidden?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          id: string;
          slug: string;
          host_id: string;
          title_ar: string;
          description_ar: string;
          service_kind: Database["public"]["Enums"]["service_kind"];
          status: Database["public"]["Enums"]["listing_status"];
          city_id: string;
          price: number;
          pricing_mode: Database["public"]["Enums"]["pricing_mode"];
          min_quantity: number;
          max_quantity: number | null;
          unit_label_ar: string;
          requires_delivery: boolean;
          requires_setup: boolean;
          setup_duration_minutes: number | null;
          delivery_strategy: Database["public"]["Enums"]["delivery_fee_strategy"];
          delivery_fee: number;
          free_delivery_over: number | null;
          max_distance_km: number | null;
          rating_avg: number;
          rating_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          host_id: string;
          title_ar: string;
          description_ar?: string;
          service_kind: Database["public"]["Enums"]["service_kind"];
          status?: Database["public"]["Enums"]["listing_status"];
          city_id: string;
          price: number;
          pricing_mode: Database["public"]["Enums"]["pricing_mode"];
          min_quantity?: number;
          max_quantity?: number | null;
          unit_label_ar?: string;
          requires_delivery?: boolean;
          requires_setup?: boolean;
          setup_duration_minutes?: number | null;
          delivery_strategy?: Database["public"]["Enums"]["delivery_fee_strategy"];
          delivery_fee?: number;
          free_delivery_over?: number | null;
          max_distance_km?: number | null;
          rating_avg?: number;
          rating_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          host_id?: string;
          title_ar?: string;
          description_ar?: string;
          service_kind?: Database["public"]["Enums"]["service_kind"];
          status?: Database["public"]["Enums"]["listing_status"];
          city_id?: string;
          price?: number;
          pricing_mode?: Database["public"]["Enums"]["pricing_mode"];
          min_quantity?: number;
          max_quantity?: number | null;
          unit_label_ar?: string;
          requires_delivery?: boolean;
          requires_setup?: boolean;
          setup_duration_minutes?: number | null;
          delivery_strategy?: Database["public"]["Enums"]["delivery_fee_strategy"];
          delivery_fee?: number;
          free_delivery_over?: number | null;
          max_distance_km?: number | null;
          rating_avg?: number;
          rating_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "services_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_place_availability: {
        Args: { p_place_id: string; p_start: string; p_end: string };
        Returns: boolean;
      };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      auth_role: {
        Args: Record<string, never>;
        Returns: Database["public"]["Enums"]["user_role"];
      };
    };
    Enums: {
      user_role: "customer" | "host" | "admin";
      listing_status: "draft" | "pending" | "published" | "rejected" | "suspended";
      place_kind: "kashta" | "camp" | "chalet" | "wild";
      service_kind: "setup" | "product" | "labor";
      rate_unit: "hour" | "day" | "night";
      pricing_mode: "fixed" | "per_booking" | "per_hour" | "per_day" | "per_night" | "per_person" | "per_unit" | "per_km";
      delivery_fee_strategy: "free" | "flat" | "per_city" | "per_district" | "per_distance";
      booking_status: "pending" | "confirmed" | "checked_in" | "checked_out" | "completed" | "cancelled";
      booking_source: "customer" | "host_block" | "maintenance";
      order_status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "completed" | "cancelled";
      payment_status: "unpaid" | "paid" | "failed" | "refunded";
      charge_line_kind: "base" | "addon" | "delivery" | "discount" | "commission" | "fee";
    };
    CompositeTypes: Record<string, never>;
  };
}

/** اختصارات مريحة. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
