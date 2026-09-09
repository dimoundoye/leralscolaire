import React from 'react';
import ReactDOM from 'react-dom';
import {
  LayoutDashboard, Building, Users, Mail, Calendar, BookOpenCheck,
  BookOpen, FileText, Clock, MessageSquare, Settings, LogOut, X,
  ShieldCheck, BookMarked, Scale, Award, ClipboardList, ChevronLeft, ChevronRight
} from 'lucide-react';

const TeacherSidebar = ({
  profile,
  invitations,
  activeTab,
  navigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleLogout,
  isCollapsed,        // reçu du parent TeacherDashboard
}) => {
  return (
    <>
      {/* MOBILE SIDEBAR DRAWER — rendered via Portal directly to document.body */}
      {ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9000,
              display: isMobileMenuOpen ? 'block' : 'none',
            }}
          />
          {/* Drawer panel */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '280px',
              height: '100vh',
              background: 'white',
              zIndex: 9001,
              boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 16px',
              gap: '20px',
              overflowY: 'auto',
              transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.25s ease',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {/* Header drawer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div
                onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                title="Retour à l'accueil"
              >
                <img src="/logo_leralscolaire.png" alt="LeralScolaire" style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px' }} />
                <span style={{ fontWeight: 800, fontSize: '16px', color: '#131e6c' }}>LéralScolaire</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b', lineHeight: 1 }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Profile mini card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(19,30,108,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary-blue)', fontSize: '16px', flexShrink: 0, overflow: 'hidden' }}>
                {profile?.photo_url
                  ? <img src={`${profile.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span>{profile?.prenom ? `${profile.prenom[0]}${profile.nom[0]}`.toUpperCase() : 'ENS'}</span>
                }
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                  {profile?.sexe === 'F' ? 'Mme.' : 'Mr.'} {profile?.prenom} {profile?.nom}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace' }}>{profile?.identifiant_national}</div>
                <div style={{ fontSize: '11px', color: 'var(--primary-blue)', fontWeight: 600 }}>{profile?.matiere_principale || 'Matière non définie'}</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="td-nav" style={{ flex: 1 }}>
              {[
                { tab: 'overview', path: 'overview', icon: <LayoutDashboard size={18} />, label: 'Aperçu' },
                { tab: 'partner-schools', path: 'partner-schools', icon: <Building size={18} />, label: 'Établissements Partenaires' },
                { tab: 'attached-classes', path: 'attached-classes', icon: <Users size={18} />, label: 'Classes Rattachées' },
                { tab: 'invitations', path: 'invitations', icon: <Mail size={18} />, label: `Invitations${invitations?.length > 0 ? ` (${invitations.length})` : ''}` },
                { tab: 'schedule', path: 'schedule', icon: <Calendar size={18} />, label: 'Emploi du Temps' },
                { tab: 'grades', path: 'grades', icon: <BookOpenCheck size={18} />, label: 'Saisie des Notes' },
                { tab: 'pedagogy', path: 'pedagogy', icon: <BookOpen size={18} />, label: 'Suivi Pédagogique' },
                { tab: 'planning', path: 'planning', icon: <FileText size={18} />, label: 'Planification & Devoirs' },
                { tab: 'attendance', path: 'attendance', icon: <Clock size={18} />, label: "Faire l'Appel" },
                { tab: 'messages', path: 'messages', icon: <MessageSquare size={18} />, label: 'Messagerie & Alertes' },
                { tab: 'profile', path: 'profile', icon: <Settings size={18} />, label: 'Mon Profil Enseignant' },
              ].map(({ tab, path, icon, label }) => (
                <button
                  key={tab}
                  type="button"
                  className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => { navigate(`/professeur/dashboard/${path}`); setIsMobileMenuOpen(false); }}
                >
                  {icon} <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#b91c1c', fontWeight: 700, fontSize: '13px' }}
            >
              <LogOut size={18} /> Déconnexion
            </button>
          </div>
        </>,
        document.body
      )}

      {/* SIDEBAR DESKTOP — style identique à DashboardLocataire samalocation */}
      {/* NOTE: l'aside n'a PAS d'overflow pour permettre au bouton toggle de déborder */}
      <aside
        className={`td-sidebar ${isCollapsed ? 'collapsed' : ''}`}
        style={{
          width: isCollapsed ? '72px' : '256px',
          background: 'var(--bg-white)',
          borderRight: '1px solid var(--border-slate-200)',
          boxShadow: 'var(--shadow-sm)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          transition: 'width 0.3s ease-in-out',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'visible',   /* PAS overflow:hidden ni auto — le scroll est sur le div enfant */
        }}
      >
        {/* Zone de contenu scrollable — c'est ici que le scroll est appliqué, pas sur l'aside */}
        <div style={{
          padding: isCollapsed ? '16px 8px' : '16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCollapsed ? 'center' : 'stretch',
          overflow: 'hidden',    /* Clip seulement le contenu, pas l'aside entier */
        }}>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', width: '100%' }}>

            {/* Logo + Nom cliquable vers la page d'accueil */}
            <div
              onClick={() => navigate('/')}
              title="Retour à l'accueil"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '8px',
                marginBottom: '28px',
                width: '100%',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <img
                src="/logo_leralscolaire.png"
                alt="LeralScolaire"
                style={{ height: isCollapsed ? '32px' : '40px', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
              />
              {!isCollapsed && (
                <div>
                  <div style={{
                    fontWeight: 800,
                    fontSize: '16px',
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}>
                    LeralScolaire
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-slate-500)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                    Espace Enseignant
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', alignItems: isCollapsed ? 'center' : 'stretch' }}>
              {[
                { tab: 'overview',        path: 'overview',        icon: <LayoutDashboard size={20} />, label: 'Aperçu' },
                { tab: 'partner-schools', path: 'partner-schools', icon: <Building size={20} />,        label: 'Établissements' },
                { tab: 'attached-classes',path: 'attached-classes',icon: <Users size={20} />,           label: 'Classes Rattachées' },
                { tab: 'invitations',     path: 'invitations',     icon: <Mail size={20} />,            label: 'Invitations', badge: invitations?.length },
                { tab: 'schedule',        path: 'schedule',        icon: <Calendar size={20} />,        label: 'Emploi du Temps' },
                { tab: 'grades',          path: 'grades',          icon: <BookOpenCheck size={20} />,   label: 'Saisie des Notes' },
                { tab: 'pedagogy',        path: 'pedagogy',        icon: <BookOpen size={20} />,        label: 'Suivi Pédagogique' },
                { tab: 'planning',        path: 'planning',        icon: <ClipboardList size={20} />,   label: 'Planification & Devoirs' },
                { tab: 'attendance',      path: 'attendance',      icon: <Clock size={20} />,           label: "Faire l'Appel" },
                { tab: 'discipline',      path: 'discipline',      icon: <Scale size={20} />,           label: 'Remarques Élève' },
                { tab: 'messages',        path: 'messages',        icon: <MessageSquare size={20} />,   label: 'Messagerie & Alertes' },
                { tab: 'profile',         path: 'profile',         icon: <Settings size={20} />,        label: 'Mon Profil' },
              ].map(({ tab, path, icon, label, badge }) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => navigate(`/professeur/dashboard/${path}`)}
                    title={isCollapsed ? label : ''}
                    style={{
                      width: isCollapsed ? '44px' : '100%',
                      height: isCollapsed ? '44px' : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isCollapsed ? 'center' : 'space-between',
                      gap: isCollapsed ? 0 : '12px',
                      padding: isCollapsed ? 0 : '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 600 : 500,
                      transition: 'all 0.15s ease',
                      background: isActive ? 'var(--primary-blue)' : 'transparent',
                      color: isActive ? 'white' : 'var(--text-slate-500)',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(28,38,128,0.06)'; e.currentTarget.style.color = 'var(--text-slate-900)'; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-slate-500)'; } }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      gap: '12px',
                      minWidth: 0,
                      width: isCollapsed ? '100%' : 'auto'
                    }}>
                      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
                      {!isCollapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>}
                    </div>
                    {!isCollapsed && badge > 0 && (
                      <span style={{
                        background: 'var(--accent-red)',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '1px 7px',
                        fontSize: '10px',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {badge}
                      </span>
                    )}
                    {isCollapsed && badge > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'var(--accent-red)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 700,
                      }}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Item spécial Président du Jury */}
              {profile?.is_president_jury && (
                <button
                  type="button"
                  onClick={() => navigate('/jury/dashboard')}
                  title={isCollapsed ? 'Président du Jury' : ''}
                  style={{
                    width: isCollapsed ? '44px' : '100%',
                    height: isCollapsed ? '44px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isCollapsed ? 0 : '12px',
                    padding: isCollapsed ? 0 : '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #f59e0b',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #131e6c 0%, #1e293b 100%)',
                    color: '#f59e0b',
                    marginTop: '4px',
                    flexShrink: 0,
                  }}
                >
                  <Award size={20} />
                  {!isCollapsed && <span>🎖️ Président du Jury</span>}
                </button>
              )}
            </nav>

            {/* Déconnexion */}
            <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'stretch', width: '100%', marginTop: '32px' }}>
              <button
                type="button"
                onClick={handleLogout}
                title={isCollapsed ? 'Déconnexion' : ''}
                style={{
                  width: isCollapsed ? '44px' : '100%',
                  height: isCollapsed ? '44px' : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: isCollapsed ? 0 : '12px',
                  padding: isCollapsed ? 0 : '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  background: 'transparent',
                  color: 'var(--text-slate-500)',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,46,0.07)'; e.currentTarget.style.color = 'var(--accent-red)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-slate-500)'; }}
              >
                <LogOut size={20} />
                {!isCollapsed && <span>Déconnexion</span>}
              </button>
            </div>

          </div>
        </div>

      </aside>
    </>
  );
};

export default TeacherSidebar;
