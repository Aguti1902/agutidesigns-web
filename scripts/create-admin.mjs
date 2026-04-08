import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://uwbbzqjcxtryatxpxmvw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YmJ6cWpjeHRyeWF0eHB4bXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4OTU0NywiZXhwIjoyMDkxMTY1NTQ3fQ.SedGMPa-gf_otjzxFZmhvhcrU6UMtweLyDiwXI3J8u8'
);

const EMAIL    = 'agutierrezgomez00@gmail.com';
const PASSWORD = 'Aguti2024!';

// Buscar el usuario existente y actualizar su contraseña
const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
if (listErr) { console.error('❌', listErr.message); process.exit(1); }

const user = users.find(u => u.email === EMAIL);
if (!user) { console.error('❌ Usuario no encontrado'); process.exit(1); }

const { error } = await supabase.auth.admin.updateUserById(user.id, {
  password: PASSWORD,
  email_confirm: true,
});

if (error) {
  console.error('❌ Error actualizando contraseña:', error.message);
} else {
  console.log('✅ Contraseña actualizada correctamente');
  console.log('   Email:    ', EMAIL);
  console.log('   Password: ', PASSWORD);
  console.log('\n   ➜  Ve a http://localhost:5173/admin y entra con esas credenciales');
}
