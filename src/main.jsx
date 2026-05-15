import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import DisenoWebLanding from './pages/DisenoWebLanding.jsx';
import CalculadoraLanding from './pages/CalculadoraLanding.jsx';
import ClinicasLanding from './pages/ClinicasLanding.jsx';
import ClinicasConsulta from './pages/ClinicasConsulta.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminQuote from './pages/admin/AdminQuote.jsx';
import AdminCampanas from './pages/admin/AdminCampanas.jsx';
import AdminLeads from './pages/admin/AdminLeads.jsx';
import ClienteBriefing from './pages/cliente/ClienteBriefing.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pública */}
          <Route path="/" element={<DisenoWebLanding />} />
          <Route path="/calculadora" element={<CalculadoraLanding />} />
          <Route path="/clinicas-dentales" element={<ClinicasLanding />} />
          <Route path="/clinicas-dentales/consulta" element={<ClinicasConsulta />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/presupuesto/:id" element={<AdminQuote />} />
          <Route path="/admin/campanas" element={<AdminCampanas />} />
          <Route path="/admin/leads" element={<AdminLeads />} />

          {/* Cliente */}
          <Route path="/cliente/briefing" element={<ClienteBriefing />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
