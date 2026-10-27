import { AuthProvider } from '../../context/AuthContext.jsx';
import ClienteBriefing from './ClienteBriefing.jsx';

// La sesión de Supabase solo se carga en el área de cliente, no en la web pública.
export default function ClienteBriefingPage() {
  return <AuthProvider><ClienteBriefing /></AuthProvider>;
}
