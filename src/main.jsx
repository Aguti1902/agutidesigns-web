import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
const CalculadoraLanding = lazy(() => import('./pages/CalculadoraLanding.jsx'));
import ClinicasDentales from './pages/ClinicasDentales.jsx';
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
import ScrollManager from './components/ScrollManager.jsx';
const ClinicasConsulta = lazy(() => import('./pages/ClinicasConsulta.jsx'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminPresupuestos = lazy(() => import('./pages/admin/AdminPresupuestos.jsx'));
const AdminQuote = lazy(() => import('./pages/admin/AdminQuote.jsx'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads.jsx'));
const ClienteBriefing = lazy(() => import('./pages/cliente/ClienteBriefingPage.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'));
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'));
const NichoLanding = lazy(() => import('./pages/NichoLanding.jsx'));
const DisenoWebIndex = lazy(() => import('./pages/DisenoWebIndex.jsx'));
const Casos = lazy(() => import('./pages/Casos.jsx'));
import './index.css';
import './styles/site.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <ScrollManager />
        <Suspense fallback={<div className="ag" style={{ minHeight: '100vh' }} />}>
        <Routes>
          {/* Pública */}
          <Route path="/" element={<Home />} />
          <Route path="/calculadora" element={<CalculadoraLanding />} />
          <Route path="/clinicas-dentales" element={<ClinicasDentales />} />
          <Route path="/clinicas-dentales/consulta" element={<ClinicasConsulta />} />
          <Route path="/casos" element={<Casos />} />

          {/* SEO por nicho + ciudad (src/data/landings/*.json) */}
          <Route path="/diseno-web" element={<DisenoWebIndex />} />
          <Route path="/diseno-web/:slug" element={<NichoLanding />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/presupuestos" element={<AdminPresupuestos />} />
          <Route path="/admin/presupuesto/:id" element={<AdminQuote />} />
          <Route path="/admin/leads" element={<AdminLeads />} />

          {/* Blog */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* Cliente */}
          <Route path="/cliente/briefing" element={<ClienteBriefing />} />

          {/* Onboarding SaaS */}
          <Route path="/empezar" element={<Onboarding />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
