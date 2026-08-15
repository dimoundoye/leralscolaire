import React from 'react';
import { Menu, ShieldCheck, Bell, User, LogOut, AlertTriangle } from 'lucide-react';

const TeacherTopbar = ({
  setIsMobileMenuOpen,
  profAnneeFilter,
  setProfAnneeFilter,
  unreadNotificationsCount,
  invitations,
  setShowNotificationsDrawer,
  fetchNotifications,
  profile,
  navigate,
  handleLogout,
  schedule,
  hasConflict
}) => {
  const isConflict = schedule.some((slot, idx) => hasConflict(slot, schedule.filter(s => s.jour_semaine === slot.jour_semaine)));

  return (
    <>
      <header className="td-header">
        <button 
          className="mobile-burger-btn" 
          onClick={() => setIsMobileMenuOpen(true)} 
          title="Ouvrir le menu" 
          type="button"
          style={{ flexShrink: 0, position: 'relative', zIndex: 200 }}
        >
          <Menu size={22} />
        </button>
        <div className="td-brand" style={{ flex: 1, minWidth: 0 }}>
          <ShieldCheck size={24} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <h1 className="brand-name" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-blue)', display: 'flex', alignItems: 'center' }}>
              Leral<span style={{ color: 'var(--accent-red)' }}>Scolaire</span>
            </h1>
            <p className="td-sub">Espace Enseignant</p>
          </div>
        </div>
        
        <div className="td-header-actions" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label className="annee-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)' }}>Année :</label>
            <select
              value={profAnneeFilter}
              onChange={e => setProfAnneeFilter(e.target.value)}
              className="pill-select"
              style={{ height: '30px', fontSize: '11.5px', padding: '2px 8px', borderRadius: '6px', minWidth: '100px' }}
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>
          {/* Bouton Émerger mon Cours */}
          <button
            onClick={() => navigate('/professeur/emargement')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '800',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
              marginRight: '8px'
            }}
            title="Accéder au scanner QR Code 20s et au Mode Terrain EPS"
          >
            <span>Émerger mon Cours</span>
          </button>

          <button className="icon-action-btn relative" onClick={() => { setShowNotificationsDrawer(true); fetchNotifications(); }} title="Notifications">
            <Bell size={20} />
            {(unreadNotificationsCount > 0 || invitations?.length > 0) && <span className="badge-dot" style={{ background: 'var(--accent-red)' }}></span>}
          </button>
          <button className="icon-action-btn header-profile-avatar" onClick={() => navigate('/professeur/dashboard/profile')} title="Mon Profil">
            {profile?.photo_url ? (
              <img src={`http://localhost:5002${profile.photo_url}`} alt="Avatar" className="header-avatar-img" />
            ) : (
              <User size={18} />
            )}
          </button>
          <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* TIMETABLE CONFLICT DETECT WARNING */}
      {isConflict && (
        <div style={{ background: '#fef2f2', borderBottom: '1px solid #fee2e2', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b', fontSize: '13px', fontWeight: 600 }}>
          <AlertTriangle size={18} />
          <span>Attention : Conflit de chevauchement détecté dans votre emploi du temps consolidé. Veuillez vérifier vos créneaux.</span>
        </div>
      )}
    </>
  );
};

export default TeacherTopbar;
