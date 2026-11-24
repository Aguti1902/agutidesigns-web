// Cliente de Supabase de la Oficina de IA (proyecto propio, separado del de la web y su panel de presupuestos).
// Variables públicas: VITE_OFICINA_SUPABASE_URL y VITE_OFICINA_SUPABASE_ANON_KEY (si faltan, usa las de la web).
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_OFICINA_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const clave = import.meta.env.VITE_OFICINA_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url || 'https://placeholder.supabase.co', clave || 'placeholder-key', {
  auth: { storageKey: 'oficina-ia-auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
});
