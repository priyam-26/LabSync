const SUPABASE_URL = "https://pfuflomcnehwuihyfuzk.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdWZsb21jbmVod3VpaHlmdXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MDgxMTUsImV4cCI6MjEwMzk4NDExNX0.UHP5aMirMIg18IJaWRSlNWMkuXqvxxrd8TqEq28FxF4";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);