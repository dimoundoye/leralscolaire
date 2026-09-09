import React from 'react';
import { Menu, Bell, User, LogOut, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

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
  hasConflict,
  toggleSidebar,
  isSidebarCollapsed,
  availableAcademicYears = [],
}) => {
  const isConflict = schedule.some((slot) =>
    hasConflict(slot, schedule.filter(s => s.jour_semaine === slot.jour_semaine))
  );

  return (
    <>
      <header className="td-header">

        {/* GAUCHE : bouton flèche collapse sidebar (desktop) + burger mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginRight: '16px' }}>
          {/* Bouton flèche toggle sidebar — desktop uniquement */}
          <button
            type="button"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Développer le menu' : 'Réduire le menu'}
            className="sidebar-collapse-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-white)',
              border: '1px solid var(--border-slate-200)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-blue)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              flexShrink: 0,
              padding: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(28,38,128,0.06)';
              e.currentTarget.style.borderColor = 'var(--primary-blue)';
              e.currentTarget.style.transform = 'scale(1.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-white)';
              e.currentTarget.style.borderColor = 'var(--border-slate-200)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isSidebarCollapsed
              ? <ChevronRight size={17} strokeWidth={2.4} />
              : <ChevronLeft size={17} strokeWidth={2.4} />
            }
          </button>

          {/* Burger mobile uniquement */}
          <button
            className="mobile-burger-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            title="Ouvrir le menu"
            type="button"
            style={{ flexShrink: 0 }}
          >
            <Menu size={22} />
          </button>
        </div>

        

        {/* DROITE : Filtres + Actions */}
        <div className="td-header-actions" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-500)', whiteSpace: 'nowrap' }}>Année :</label>
            <select
              value={profAnneeFilter}
              onChange={e => setProfAnneeFilter(e.target.value)}
              className="pill-select"
              style={{ height: '30px', fontSize: '11.5px', padding: '2px 8px', borderRadius: '6px', minWidth: '100px' }}
            >
              {availableAcademicYears && availableAcademicYears.length > 0 ? (
                availableAcademicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))
              ) : (
                <option value={profAnneeFilter}>{profAnneeFilter || 'Année active'}</option>
              )}
            </select>
          </div>

          <button
            className="icon-action-btn relative"
            onClick={() => { setShowNotificationsDrawer(true); fetchNotifications(); }}
            title="Notifications"
          >
            <Bell size={20} />
            {(unreadNotificationsCount > 0 || invitations?.length > 0) && (
              <span className="badge-dot" style={{ background: 'var(--accent-red)' }} />
            )}
          </button>

          <button
            className="icon-action-btn header-profile-avatar"
            onClick={() => navigate('/professeur/dashboard/profile')}
            title="Mon Profil"
          >
            {profile?.photo_url
              ? <img src={`${profile.photo_url}`} alt="Avatar" className="header-avatar-img" />
              : <User size={18} />
            }
          </button>

          <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Alerte conflit d'emploi du temps */}
      {isConflict && (
        <div style={{
          background: '#fef2f2',
          borderBottom: '1px solid #fee2e2',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#991b1b',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          <AlertTriangle size={18} />
          <span>Attention : Conflit de chevauchement détecté dans votre emploi du temps. Veuillez vérifier vos créneaux.</span>
        </div>
      )}
    </>
  );
};

export default TeacherTopbar;
