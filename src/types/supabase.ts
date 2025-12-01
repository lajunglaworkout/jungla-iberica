export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            // Placeholder for tables. 
            // Ideally this should be generated via 'supabase gen types typescript'
            [key: string]: any
        }
        Views: {
            [key: string]: any
        }
        Functions: {
            [key: string]: any
        }
        Enums: {
            [key: string]: any
        }
    }
}