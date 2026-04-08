import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DisenoWebLanding from './pages/DisenoWebLanding.jsx';
import CalculadoraLanding from './pages/CalculadoraLanding.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DisenoWebLanding />} />
        <Route path="/calculadora" element={<CalculadoraLanding />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
