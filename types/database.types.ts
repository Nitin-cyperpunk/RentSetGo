export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Aligns with your Supabase tables: profiles, properties + property_images */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          role: string;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          role?: string;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          role?: string;
          phone?: string | null;
          created_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          price: number;
          property_type: string;
          deal_type: string;
          category: string;
          location: string | null;
          address: string | null;
          area_sqft: number | null;
          map_link: string | null;
          bedrooms: number | null;
          bathrooms: number | null;
          furnishing: string | null;
          available_status: string | null;
          contact_phone: string | null;
          contact_email?: string | null;
          amenities?: string[] | null;
          created_at: string;
          updated_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          price: number;
          property_type: string;
          deal_type?: string;
          category?: string;
          location?: string | null;
          address?: string | null;
          area_sqft?: number | null;
          map_link?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          furnishing?: string | null;
          available_status?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          amenities?: string[] | null;
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          property_type?: string;
          deal_type?: string;
          category?: string;
          location?: string | null;
          address?: string | null;
          area_sqft?: number | null;
          map_link?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          furnishing?: string | null;
          available_status?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          amenities?: string[] | null;
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
        };
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          image_url: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          image_url: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          image_url?: string;
        };
      };
    };
  };
};
