import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, Building, ArrowRight, Shield, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [registerData, setRegisterData] = useState({
    nom: '',
    code_etablissement: '',
    email: '',
    password: '',
    region: 'Dakar',
    ville: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        setMessage({ type: 'success', text: 'Connexion réussie ! Redirection...' });

        const redirectPath = data.user.role === 'PRESIDENT_JURY'
          ? '/jury/dashboard'
          : data.user.role === 'ELEVE' 
            ? '/student/dashboard' 
            : data.user.role === 'PROFESSEUR' 
              ? '/professeur/dashboard' 
              : data.user.role === 'OFFICE_BAC'
                ? '/office/dashboard'
                : '/dashboard';
        setTimeout(() => navigate(redirectPath), 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Identifiants incorrects' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5002/api/auth/register-etablissement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Établissement inscrit ! Vous pouvez vous connecter.' });
        setIsLogin(true);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de l\'inscription.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Info Side */}
        <div className="auth-info">
          <Link to="/" className="auth-logo">
            <div className="logo-icon">SN</div>
            <span>Leral<span className="text-orange">Scolaire</span></span>
          </Link>
          <div className="info-content">
            <h2>{isLogin ? 'Bon retour parmi nous !' : 'Rejoignez le futur de l\'éducation'}</h2>
            <p>
              {isLogin 
                ? 'Connectez-vous pour accéder à votre livret scolaire numérique.' 
                : 'Inscrivez votre établissement pour commencer la digitalisation.'}
            </p>
          </div>
          <div className="info-footer">
            <div className="badge"><Shield size={14} /> Sécurisé par l'État du Sénégal</div>
          </div>
        </div>

        {/* Form Side */}
        <div className="auth-form-card">
          <div className="form-toggle">
            <button className={isLogin ? 'active' : ''} onClick={() => { setIsLogin(true); setMessage({type:'',text:''}); }}>Connexion</button>
            <button className={!isLogin ? 'active' : ''} onClick={() => { setIsLogin(false); setMessage({type:'',text:''}); }}>Inscription</button>
          </div>

          {message.text && (
            <div className={`status-msg ${message.type}`}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {message.text}
            </div>
          )}

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form key="login" onSubmit={handleLogin} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-content">
                <h3>Connexion</h3>
                <p className="subtitle">Accédez à votre espace personnel</p>

                <div className="input-group">
                  <label>Email ou Identifiant National</label>
                  <div className="input-wrapper">
                    <Mail size={18} />
                    <input 
                      type="text" 
                      required 
                      value={loginData.identifier}
                      onChange={(e) => setLoginData({...loginData, identifier: e.target.value})}
                      placeholder="ex: SN-2025-ABC-000001" 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Mot de passe</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input 
                      type="password" 
                      required 
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-full">
                  {loading ? <Loader2 className="animate-spin" /> : <>Se connecter <ArrowRight size={18} /></>}
                </button>
              </motion.form>
            ) : (
              <motion.form key="register" onSubmit={handleRegister} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-content">
                <h3>Inscription</h3>
                <p className="subtitle text-orange">Réservé aux Établissements</p>

                <div className="input-group">
                  <label>Nom de l'établissement</label>
                  <div className="input-wrapper">
                    <Building size={18} />
                    <input 
                      type="text" 
                      required 
                      value={registerData.nom}
                      onChange={(e) => setRegisterData({...registerData, nom: e.target.value})}
                      placeholder="Lycée d'Excellence..." 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Code (ex: DKR-001)</label>
                  <div className="input-wrapper">
                    <Shield size={18} />
                    <input 
                      type="text" 
                      required 
                      value={registerData.code_etablissement}
                      onChange={(e) => setRegisterData({...registerData, code_etablissement: e.target.value})}
                      placeholder="CODE-XYZ" 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Email Administrateur</label>
                  <div className="input-wrapper">
                    <Mail size={18} />
                    <input 
                      type="email" 
                      required 
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      placeholder="admin@ecole.sn" 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Mot de passe</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input 
                      type="password" 
                      required 
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-full">
                  {loading ? <Loader2 className="animate-spin" /> : <>S'inscrire <UserPlus size={18} /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
