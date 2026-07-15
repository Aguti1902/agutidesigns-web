import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap } from 'lucide-react';
import './Admin.css';

const ADMIN_EMAIL    = 'agutierrezgomez00@gmail.com';
const ADMIN_PASSWORD = 'Aguti2024!';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 400));
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('adminSession', JSON.stringify({ email, ts: Date.now() }));
      navigate('/admin/dashboard');
    } else {
      setError('Email o contraseña incorrectos');
    }
    setLoading(false);
  };

  return (
    <div className="adm-login">
      <div className="adm-login__card">
        <div className="adm-login__logo">
          <img src="/images/logoazul.png" alt="Agutidesigns" className="adm-login__logo-img" />
        </div>

        <h1 className="adm-login__title">Panel de administración</h1>
        <p className="adm-login__sub">Accede con tu email y contraseña.</p>

        <form className="adm-login__form" onSubmit={handleSubmit}>
          <div className="adm-login__field">
            <Mail size={16} className="adm-login__field-icon" />
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="adm-login__input"
            />
          </div>
          <div className="adm-login__field">
            <Lock size={16} className="adm-login__field-icon" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="adm-login__input"
            />
          </div>
          {error && <p className="adm-login__error">{error}</p>}
          <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
            <Zap size={16} />
            {loading ? 'Accediendo...' : 'Entrar al panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
