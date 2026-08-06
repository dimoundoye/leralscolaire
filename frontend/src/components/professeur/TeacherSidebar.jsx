import React from 'react';
import ReactDOM from 'react-dom';
import {
  LayoutDashboard, Building, Users, Mail, Calendar, BookOpenCheck,
  BookOpen, FileText, Clock, MessageSquare, Settings, LogOut, X,
  ShieldCheck, BookMarked, Scale, Award, ClipboardList
} from 'lucide-react';

const TeacherSidebar = ({
  profile,
  invitations,
  activeTab,
  navigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleLogout
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} style={{ color: 'var(--accent-red)' }} />
                <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--primary-blue)' }}>LeralScolaire</span>
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
                  ? <img src={`http://localhost:5002${profile.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

      {/* SIDEBAR DESKTOP */}
      <aside className="td-sidebar">
        <div className="teacher-card">
          <div className="td-avatar">
            {profile?.photo_url ? (
              <img src={`http://localhost:5002${profile.photo_url}`} alt="Identity" />
            ) : (
              <span>{profile?.prenom ? `${profile.prenom[0]}${profile.nom[0]}`.toUpperCase() : 'ENS'}</span>
            )}
          </div>
          <div className="teacher-info">
            <h3>{profile?.sexe === 'F' ? 'Mme.' : 'Mr.'} {profile?.prenom} {profile?.nom}</h3>
            <span className="teacher-id">{profile?.identifiant_national}</span>
            <span className="teacher-subj">{profile?.matiere_principale || 'Matière non définie'}</span>
          </div>
        </div>

        <nav className="td-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/overview')}>
            <LayoutDashboard size={18} /> <span>Aperçu</span>
          </button>
          <button className={`nav-item ${activeTab === 'partner-schools' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/partner-schools')}>
            <Building size={18} /> <span>Établissements Partenaires</span>
          </button>
          <button className={`nav-item ${activeTab === 'attached-classes' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/attached-classes')}>
            <Users size={18} /> <span>Classes Rattachées</span>
          </button>
          <button className={`nav-item ${activeTab === 'invitations' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/invitations')}>
            <Building size={18} /> <span>Invitations & Affiliations</span>
            {invitations?.length > 0 && <span style={{ marginLeft: 'auto', background: 'var(--accent-red)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{invitations.length}</span>}
          </button>
          <button className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/schedule')}>
            <Calendar size={18} /> <span>Emploi du Temps</span>
          </button>
          <button className={`nav-item ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/grades')}>
            <BookOpen size={18} /> <span>Saisie des Notes</span>
          </button>
          <button className={`nav-item ${activeTab === 'pedagogy' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/pedagogy')}>
            <FileText size={18} /> <span>Suivi Pédagogique</span>
          </button>
          <button className={`nav-item ${activeTab === 'cahier-texte' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/cahier-texte')}>
            <BookMarked size={18} /> <span>Cahier de Texte</span>
          </button>
          <button className={`nav-item ${activeTab === 'planning' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/planning')}>
            <ClipboardList size={18} /> <span>Planification & Devoirs</span>
          </button>
          <button className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/attendance')}>
            <Clock size={18} /> <span>Faire l'Appel (Assiduité)</span>
          </button>
          <button className={`nav-item ${activeTab === 'discipline' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/discipline')}>
            <Scale size={18} /> <span>Signaler / Remarques Élève</span>
          </button>
          {profile?.is_president_jury && (
            <button
              type="button"
              className="nav-item"
              onClick={() => navigate('/jury/dashboard')}
              style={{
                background: 'linear-gradient(135deg, #131e6c 0%, #1e293b 100%)',
                color: '#f59e0b',
                border: '1px solid #f59e0b',
                fontWeight: 800,
                marginTop: '4px',
                marginBottom: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
              }}
            >
              <Award size={18} /> <span>🎖️ Président du Jury (BAC)</span>
            </button>
          )}
          <button className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/messages')}>
            <MessageSquare size={18} /> <span>Messagerie & Alertes</span>
          </button>
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => navigate('/professeur/dashboard/profile')}>
            <Settings size={18} /> <span>Mon Profil Enseignant</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default TeacherSidebar;
