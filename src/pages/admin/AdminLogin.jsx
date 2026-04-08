import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Zap, CheckCircle } from 'lucide-react';
import './Admin.css';

export default function AdminLogin() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signInWithEmail(email);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  };

  return (
    <div className="adm-login">
      <div className="adm-login__card">
        <div className="adm-login__logo">
          <img src="/images/logoazul.png" alt="Agutidesigns" className="adm-login__logo-img" />
        </div>

        {sent ? (
          <div className="adm-login__sent">
            <CheckCircle size={40} className="adm-login__sent-icon" />
            <h2>Revisa tu email</h2>
            <p>Te hemos enviado un enlace mágico a <strong>{email}</strong>. Haz clic en él para acceder al panel.</p>
          </div>
        ) : (
          <>
            <h1 className="adm-login__title">Panel de administración</h1>
            <p className="adm-login__sub">Introduce tu email para recibir un enlace de acceso seguro.</p>

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
              {error && <p className="adm-login__error">{error}</p>}
              <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
                <Zap size={16} />
                {loading ? 'Enviando...' : 'Enviar enlace de acceso'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
