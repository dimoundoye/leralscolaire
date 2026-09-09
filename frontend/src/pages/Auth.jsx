import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, Building, ArrowRight, ArrowLeft, Shield, KeyRound, Loader2, AlertCircle, CheckCircle2, GraduationCap, School } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = IUP+Email, 2 = Code+Nouveau mot de passe
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [registerData, setRegisterData] = useState({
    nom: '',
    code_etablissement: '',
    email: '',
    email_professionnel: '',
    password: '',
    region: 'Dakar',
    ville: ''
  });
  const [forgotData, setForgotData] = useState({ iup: '', email: '', code: '', newPassword: '' });

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iup: forgotData.iup, email: forgotData.email }),
      });
      const data = await response.json();
      if (response.ok) {
        setForgotStep(2);
        setMessage({ type: 'success', text: data.message || 'Code envoyé par email !' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de la demande.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmNewPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iup: forgotData.iup,
          email: forgotData.email,
          code: forgotData.code,
          newPassword: forgotData.newPassword
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter.' });
        setShowForgot(false);
        setForgotStep(1);
        setLoginData(prev => ({ ...prev, identifier: forgotData.iup, password: '' }));
      } else {
        setMessage({ type: 'error', text: data.message || 'Code incorrect ou expiré.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/login', {
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
      const response = await fetch('/api/auth/register-etablissement', {
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
            <span style={{ color: '#1e3a8a', fontWeight: 800 }}>LéralScolaire</span>
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
          <div className="auth-header-brand">
            <img 
              src="/logo_leralscolaire.png" 
              alt="Logo LéralScolaire" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h2>LéralScolaire</h2>
            <p>Plateforme Nationale du Livret Scolaire</p>
          </div>

          <div className="form-toggle">
            <button className={isLogin && !showForgot ? 'active' : ''} onClick={() => { setIsLogin(true); setShowForgot(false); setMessage({type:'',text:''}); }}>Connexion</button>
            <button className={!isLogin && !showForgot ? 'active' : ''} onClick={() => { setIsLogin(false); setShowForgot(false); setMessage({type:'',text:''}); }}>Pré-inscription</button>
          </div>

          {message.text && (
            <div className={`status-msg ${message.type}`}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {message.text}
            </div>
          )}

          <AnimatePresence mode="wait">
            {showForgot ? (
              <motion.form key="forgot" onSubmit={forgotStep === 1 ? handleRequestResetCode : handleConfirmNewPassword} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="form-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => { setShowForgot(false); setForgotStep(1); setMessage({type:'', text:''}); }}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center' }}
                    title="Retour"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h3 style={{ margin: 0 }}>Mot de passe oublié</h3>
                </div>
                <p className="subtitle">
                  {forgotStep === 1 
                    ? 'Entrez votre IUP et votre Email pour vérifier votre compte' 
                    : 'Entrez le code reçu par email pour réinitialiser votre mot de passe'}
                </p>

                {forgotStep === 1 ? (
                  <>
                    <div className="input-group">
                      <label>Identifiant Unique (IUP)</label>
                      <div className="input-wrapper">
                        <Shield size={18} />
                        <input 
                          type="text" 
                          required 
                          value={forgotData.iup}
                          onChange={(e) => setForgotData({...forgotData, iup: e.target.value})}
                          placeholder="ETAB-..., ENS-... ou SN-..." 
                        />
                      </div>
                      <small style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Code Établissement, IUP Enseignant ou IUP Élève
                      </small>
                    </div>

                    <div className="input-group">
                      <label>Adresse Email associée</label>
                      <div className="input-wrapper">
                        <Mail size={18} />
                        <input 
                          type="email" 
                          required 
                          value={forgotData.email}
                          onChange={(e) => setForgotData({...forgotData, email: e.target.value})}
                          placeholder="L'adresse email enregistrée lors de l'inscription" 
                        />
                      </div>
                      <small style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Le système vérifie que cet email correspond bien au compte de cet IUP.
                      </small>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: '14px' }}>
                      {loading ? <Loader2 className="animate-spin" /> : <>Recevoir le code par email <ArrowRight size={18} /></>}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="input-group">
                      <label>Code de vérification (6 chiffres)</label>
                      <div className="input-wrapper">
                        <KeyRound size={18} />
                        <input 
                          type="text" 
                          required 
                          maxLength={6}
                          value={forgotData.code}
                          onChange={(e) => setForgotData({...forgotData, code: e.target.value})}
                          placeholder="123456" 
                          style={{ letterSpacing: '4px', fontWeight: 700, fontSize: '18px' }}
                        />
                      </div>
                      <small style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Code envoyé à {forgotData.email} (valable 15 minutes)
                      </small>
                    </div>

                    <div className="input-group">
                      <label>Nouveau mot de passe</label>
                      <div className="input-wrapper">
                        <Lock size={18} />
                        <input 
                          type="password" 
                          required 
                          minLength={6}
                          value={forgotData.newPassword}
                          onChange={(e) => setForgotData({...forgotData, newPassword: e.target.value})}
                          placeholder="Au moins 6 caractères" 
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: '14px' }}>
                      {loading ? <Loader2 className="animate-spin" /> : <>Réinitialiser mon mot de passe <CheckCircle2 size={18} /></>}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                      <button 
                        type="button" 
                        onClick={() => setForgotStep(1)}
                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Modifier l'IUP ou l'adresse email
                      </button>
                    </div>
                  </>
                )}

                <div style={{ textAlign: 'center', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => { setShowForgot(false); setForgotStep(1); setMessage({type:'', text:''}); }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    ← Retour à la connexion
                  </button>
                </div>
              </motion.form>
            ) : isLogin ? (
              <motion.form key="login" onSubmit={handleLogin} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-content">
                <h3>Connexion</h3>
                <p className="subtitle">Accédez à votre espace personnel</p>

                <div className="input-group">
                  <label>Identifiant Unique (IUP)</label>
                  <div className="input-wrapper">
                    <Shield size={18} />
                    <input 
                      type="text" 
                      required 
                      value={loginData.identifier}
                      onChange={(e) => setLoginData({...loginData, identifier: e.target.value})}
                      placeholder="ETAB-..., ENS-... ou SN-..." 
                    />
                  </div>
                  <small style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Connexion par IUP : Établissement (ETAB-...), Enseignant (ENS-...), Élève (SN-...)
                  </small>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px', marginBottom: '14px' }}>
                  <button 
                    type="button" 
                    onClick={() => { setShowForgot(true); setForgotStep(1); setMessage({type:'', text:''}); }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-full">
                  {loading ? <Loader2 className="animate-spin" /> : <>Se connecter <ArrowRight size={18} /></>}
                </button>
              </motion.form>
            ) : (
              <motion.div key="preinscription" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="form-content">
                <h3>Demande de Pré-inscription</h3>
                <p className="subtitle">Portail officiel d'homologation - Office du Baccalauréat</p>

                <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
                  Sélectionnez votre profil pour accéder au formulaire de pré-inscription avec dépôt des pièces justificatives :
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                  {/* Option 1: Etablissement */}
                  <div 
                    onClick={() => navigate('/inscription-nationale?type=ETABLISSEMENT')}
                    style={{
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1e3a8a'; e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#ffffff'; }}
                  >
                    <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#eff6ff', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Établissement Scolaire</h4>
                        <ArrowRight size={16} color="#64748b" />
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                        Affiliation officielle d'une école, collège ou lycée avec arrêté d'ouverture du MEN.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Professeur */}
                  <div 
                    onClick={() => navigate('/inscription-nationale?type=PROFESSEUR')}
                    style={{
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1e3a8a'; e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#ffffff'; }}
                  >
                    <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <GraduationCap size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Professeur / Enseignant</h4>
                        <ArrowRight size={16} color="#64748b" />
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                        Accréditation nationale avec CNI, diplôme et spécialité d'enseignement.
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
                  🛡️ <strong>Instruction par l'Office du Bac :</strong> Un accusé de réception est envoyé immédiatement par email. Après examen de votre dossier, vos identifiants ou les motifs de correction vous seront expédiés.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
