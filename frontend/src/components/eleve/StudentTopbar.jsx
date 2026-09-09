import React from 'react';
import { Menu, ShieldCheck, Bell, User, LogOut } from 'lucide-react';

const StudentTopbar = ({
  setIsMobileMenuOpen,
  navigate,
  notifications,
  profile,
  logout
}) => {
  return (
    <header className="sd-header">
      <button className="mobile-burger-btn" onClick={() => setIsMobileMenuOpen(true)} title="Ouvrir le menu">
        <Menu size={20} />
      </button>
      <div className="sd-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')} title="Retour à l'accueil">
        <img src="/logo_leralscolaire.png" alt="LeralScolaire" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }} />
        <div>
          <h1 className="brand-name" style={{ fontSize: '18px', fontWeight: 800, color: '#131e6c', display: 'flex', alignItems: 'center' }}>
            LéralScolaire
          </h1>
          <p className="sd-sub" style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-slate-500)', marginTop: '-2px' }}>Portail Élève</p>
        </div>
      </div>
      
      <div className="sd-header-actions">
        <button className="icon-action-btn relative" onClick={() => navigate('/student/dashboard/messages')}>
          <Bell size={20} />
          {notifications.filter(n => !n.lu).length > 0 && (
            <span className="badge-dot"></span>
          )}
        </button>
        <button className="icon-action-btn header-profile-avatar" onClick={() => navigate('/student/dashboard/profile')} title="Mon Profil">
          {profile?.photo_url ? (
            <img src={`${profile.photo_url}`} alt="Avatar" className="header-avatar-img" />
          ) : (
            <User size={18} />
          )}
        </button>
        <button className="logout-btn" onClick={logout} title="Déconnexion">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default StudentTopbar;
