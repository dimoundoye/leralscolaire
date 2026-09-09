import React from 'react';
import {
  GraduationCap, Users, ClipboardList, Send, BarChart3,
  LogOut, Award, FileText, Bell, ChevronLeft, ChevronRight,
  School, Check, Inbox, X
} from 'lucide-react';

export const OfficeSidebar = ({
  tab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  examenMode,
  setExamenMode,
  setFilters,
  navigate,
  logout,
  pendingDemandesCount = 0
}) => {
  const navItems = [
    { id: 'overview', label: 'Vue d’ensemble', icon: <BarChart3 size={18} /> },
    { 
      id: 'demandes', 
      label: 'Pré-inscriptions', 
      icon: <Inbox size={18} />,
      badge: pendingDemandesCount > 0 ? pendingDemandesCount : null
    },
    { id: 'etablissements', label: 'Établissements Sénégal', icon: <School size={18} /> },
    { id: 'professeurs', label: 'Professeurs & Correcteurs', icon: <Users size={18} /> },
    { id: 'carte-prof', label: 'Fiches & Score Profs (1000 Pts)', icon: <Award size={18} />, route: '/office/professeurs/carte-identite' },
    { id: 'centres', label: 'Centres d’Examen', icon: <School size={18} /> },
    { id: 'jurys', label: 'Jurys d’Examen', icon: <Users size={18} /> },
    { id: 'livrets', label: 'Livrets Scolaires Numériques', icon: <FileText size={18} /> },
    { id: 'candidats', label: 'Candidats Officiels', icon: <Users size={18} /> },
    { id: 'saisie', label: 'Saisie & Anonymats', icon: <ClipboardList size={18} /> },
    { id: 'publication', label: 'Publication & Délibération', icon: <Send size={18} /> },
    { id: 'statistiques', label: 'Analyses & Rapports', icon: <BarChart3 size={18} /> },
    { id: 'messagerie', label: 'Messagerie Officielle', icon: <Bell size={18} /> },
  ];

  return (
    <>
      {/* Header mobile */}
      <header className="ob-mobile-header">
        <button className="ob-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}><X size={22} /></button>
        <div className="ob-mobile-logo"><span style={{ color: '#1e3a8a', fontWeight: 800 }}>LéralScolaire</span> · Office BAC &amp; BFEM</div>
      </header>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="ob-drawer-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="ob-drawer" onClick={e => e.stopPropagation()}>
            <div className="ob-drawer-header">
              <span className="ob-logo-text" style={{ color: '#1e3a8a', fontWeight: 800 }}>LéralScolaire</span>
              <button className="ob-drawer-close" onClick={() => setIsMobileMenuOpen(false)}><X size={18} /></button>
            </div>
            <nav className="ob-drawer-nav">
              {navItems.map(item => (
                <button key={item.id} className={`ob-drawer-item ${tab === item.id ? 'active' : ''}`}
                  onClick={() => { navigate(`/office/dashboard/${item.id}`); setIsMobileMenuOpen(false); }}>
                  {item.icon} <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      flexShrink: 0,
                      marginLeft: '8px',
                      background: tab === item.id ? '#fde047' : '#fef08a',
                      color: tab === item.id ? '#1e1b4b' : '#854d0e',
                      border: tab === item.id ? '1px solid #eab308' : '1px solid #fde047',
                      minWidth: '22px',
                      height: '20px',
                      padding: '0 6px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <button className="ob-drawer-logout" onClick={logout}><LogOut size={16} /> Déconnexion</button>
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className={`ob-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="ob-sidebar-top">
          <div className="ob-sidebar-logo">
            <img src="/logo_leralscolaire.png" alt="LeralScolaire" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }} />
            {!isSidebarCollapsed && (
              <span className="ob-logo-text">LeralScolaire</span>
            )}
          </div>
          <button className="ob-collapse-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User Card */}
        <div className="ob-sidebar-user">
          <div className="ob-user-avatar">OB</div>
          {!isSidebarCollapsed && (
            <div className="ob-user-info">
              <span className="ob-user-name">Office National</span>
              <span className="ob-user-role">Direction des Examens</span>
            </div>
          )}
        </div>

        {/* WIDGET SECTEUR / SESSION EXAMEN EN SIDEBAR */}
        {!isSidebarCollapsed ? (
          <div style={{ margin: '8px 12px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 12px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
              EXAMEN NATIONAL SÉLECTIONNÉ
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                type="button"
                onClick={() => {
                  setExamenMode('BAC');
                  setFilters(f => ({ ...f, type_examen: 'BAC', serie: '' }));
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: '8px', border: examenMode === 'BAC' ? '1.5px solid #131e6c' : '1px solid #cbd5e1',
                  fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  background: examenMode === 'BAC' ? '#131e6c' : '#ffffff',
                  color: examenMode === 'BAC' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GraduationCap size={16} /> Session BAC
                </span>
                {examenMode === 'BAC' && <Check size={14} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setExamenMode('BFEM');
                  setFilters(f => ({ ...f, type_examen: 'BFEM', serie: '' }));
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: '8px', border: examenMode === 'BFEM' ? '1.5px solid #047857' : '1px solid #cbd5e1',
                  fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  background: examenMode === 'BFEM' ? '#047857' : '#ffffff',
                  color: examenMode === 'BFEM' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={16} /> Session BFEM
                </span>
                {examenMode === 'BFEM' && <Check size={14} />}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, margin: '12px 0' }}>
            <button
              type="button"
              onClick={() => { setExamenMode('BAC'); setFilters(f => ({ ...f, type_examen: 'BAC', serie: '' })); }}
              title="Session BAC"
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: examenMode === 'BAC' ? '#131e6c' : '#f1f5f9',
                color: examenMode === 'BAC' ? '#fff' : '#64748b', cursor: 'pointer'
              }}
            >
              <GraduationCap size={18} />
            </button>
            <button
              type="button"
              onClick={() => { setExamenMode('BFEM'); setFilters(f => ({ ...f, type_examen: 'BFEM', serie: '' })); }}
              title="Session BFEM"
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: examenMode === 'BFEM' ? '#047857' : '#f1f5f9',
                color: examenMode === 'BFEM' ? '#fff' : '#64748b', cursor: 'pointer'
              }}
            >
              <Award size={18} />
            </button>
          </div>
        )}

        <nav className="ob-sidebar-nav">
          {!isSidebarCollapsed && <div className="ob-nav-section">Structure & Inscriptions</div>}
          {navItems.slice(0, 5).map(item => (
            <button key={item.id} className={`ob-nav-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => navigate(`/office/dashboard/${item.id}`)}
              title={isSidebarCollapsed ? item.label : ''}>
              {item.icon}
              {!isSidebarCollapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
              {!isSidebarCollapsed && item.badge && (
                <span style={{
                  flexShrink: 0,
                  marginLeft: '8px',
                  background: tab === item.id ? '#fde047' : '#fef08a',
                  color: tab === item.id ? '#1e1b4b' : '#854d0e',
                  border: tab === item.id ? '1px solid #eab308' : '1px solid #fde047',
                  minWidth: '22px',
                  height: '20px',
                  padding: '0 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {!isSidebarCollapsed && <div className="ob-nav-section mt-6">Jurys, Candidats & Examens</div>}
          {isSidebarCollapsed && <div className="ob-nav-divider" />}
          {navItems.slice(5, 8).map(item => (
            <button key={item.id} className={`ob-nav-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => navigate(`/office/dashboard/${item.id}`)}
              title={isSidebarCollapsed ? item.label : ''}>
              {item.icon}
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}

          {!isSidebarCollapsed && <div className="ob-nav-section mt-6">Publication & Analytics</div>}
          {isSidebarCollapsed && <div className="ob-nav-divider" />}
          {navItems.slice(8).map(item => (
            <button key={item.id} className={`ob-nav-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => navigate(`/office/dashboard/${item.id}`)}
              title={isSidebarCollapsed ? item.label : ''}>
              {item.icon}
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="ob-sidebar-bottom">
          <button className="ob-logout-btn" onClick={logout} title="Déconnexion">
            <LogOut size={16} />
            {!isSidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default OfficeSidebar;
