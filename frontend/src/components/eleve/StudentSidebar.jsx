import React from 'react';
import ReactDOM from 'react-dom';
import {
  ChevronLeft, ChevronRight, LayoutDashboard, User, Award, BookOpen, Percent,
  Activity, Calendar, BookMarked, GraduationCap, MessageSquare, Sparkles, Scale, X
} from 'lucide-react';

export const StudentSidebar = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  tab,
  navigate
}) => {
  return (
    <aside className={`sd-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle-row">
        <button 
          className="sb-toggle-btn" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          title={isSidebarCollapsed ? "Agrandir le menu" : "Réduire le menu"}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sd-nav">
        <button className={`nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/overview')}>
          <LayoutDashboard size={18} /> <span>Aperçu</span>
        </button>
        <button className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/profile')}>
          <User size={18} /> <span>Mon Profil Académique</span>
        </button>
        <button className={`nav-item ${tab === 'portfolio' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/portfolio')}>
          <Award size={18} /> <span>Mon Portfolio & CV</span>
        </button>
        <button className={`nav-item ${tab === 'grades' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/grades')}>
          <BookOpen size={18} /> <span>Notes & Bulletins</span>
        </button>
        <button className={`nav-item ${tab === 'simulator' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/simulator')}>
          <Percent size={18} /> <span>Simulateur de moyenne</span>
        </button>
        <button className={`nav-item ${tab === 'evolution' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/evolution')}>
          <Activity size={18} /> <span>Courbe d'Évolution</span>
        </button>
        <button className={`nav-item ${tab === 'schedule' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/schedule')}>
          <Calendar size={18} /> <span>Emploi du Temps</span>
        </button>
        <button className={`nav-item ${tab === 'cahier-texte' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/cahier-texte')}>
          <BookMarked size={18} /> <span>Cahier de Texte</span>
        </button>
        <button className={`nav-item ${tab === 'exams' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/exams')}>
          <GraduationCap size={18} /> <span>Résultats BAC / BFEM</span>
        </button>
        <button className={`nav-item ${tab === 'messages' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/messages')}>
          <MessageSquare size={18} /> <span>Messagerie & Alertes</span>
        </button>
        <button className={`nav-item ${tab === 'ai-assistant' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/ai-assistant')}>
          <Sparkles size={18} /> <span>Assistant IA Pédagogique</span>
        </button>
        <button className={`nav-item ${tab === 'discipline' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/discipline')}>
          <Scale size={18} /> <span>Vie Scolaire & Remarques</span>
        </button>
        <button className={`nav-item ${tab === 'attestation' ? 'active' : ''}`} onClick={() => navigate('/student/dashboard/attestation')}>
          <Award size={18} /> <span>Attestation d'Inscription</span>
        </button>
      </nav>
    </aside>
  );
};

export const StudentMobileDrawer = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  profile,
  tab,
  navigate
}) => {
  if (!isMobileMenuOpen) return null;

  return ReactDOM.createPortal(
    <div className={`mobile-drawer-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
      <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>Menu élève</h3>
          <button className="drawer-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-student-card">
          <div className="drawer-avatar-wrap">
            {profile?.photo_url ? (
              <img src={`http://localhost:5002${profile.photo_url}`} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {profile ? `${profile.prenom[0]}${profile.nom[0]}` : 'EL'}
              </div>
            )}
          </div>
          <div className="drawer-student-info">
            <h4>{profile ? `${profile.prenom} ${profile.nom}` : 'Chargement...'}</h4>
            <span className="drawer-id">{profile?.identifiant_national}</span>
            <span className="drawer-class">{profile?.classe_nom || 'Non affectée'}</span>
          </div>
        </div>

        <nav className="drawer-nav">
          <button className={`drawer-nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => { navigate('/student/dashboard/overview'); setIsMobileMenuOpen(false); }}>
            <LayoutDashboard size={18} /> <span>Aperçu</span>
          </button>
          <button className={`drawer-nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => { navigate('/student/dashboard/profile'); setIsMobileMenuOpen(false); }}>
            <User size={18} /> <span>Mon Profil Académique</span>
          </button>
          <button className={`drawer-nav-item ${tab === 'portfolio' ? 'active' : ''}`} onClick={() => { navigate('/student/dashboard/portfolio'); setIsMobileMenuOpen(false); }}>
            <Award size={18} /> <span>Mon Portfolio & CV</span>
          </button>
          <button className={`drawer-nav-item ${tab === 'grades' ? 'active' : ''}`} onClick={() => { navigate('/student/dashboard/grades'); setIsMobileMenuOpen(false); }}>
            <BookOpen size={18} /> <span>Notes & Bulletins</span>
          </button>
          <button className={`drawer-nav-item ${tab === 'simulator' ? 'active' : ''}`} onClick={() => { navigate('/student/dashboard/simulator'); setIsMobileMenuOpen(false); }}>
            <Percent size={18} /> <span>Simulateur de moyenne</span>
          </button>
          <button className={`drawer-nav-item ${tab === 'evolution' ? 'active' : ''}`} onClick={() => { navigate('/student/dashboard/evolution'); setIsMobileMenuOpen(false); }}>
            <Activity size={18} /> <span>Courbe d'Évolution</span>
          </button>
          <button className={`drawer-nav-item ${tab === 'schedule' ? 'active' : ''}`} onClick={() => { navigate('/student/dashboard/schedule'); setIsMobileMenuOpen(false); }}>
            <Calendar size={18} /> <span>Emploi du Temps</span>
          </button>
          <button className={`drawer-nav-item ${tab === 'exams' ? 'active' : ''}`} onClick={() => { navigate('/student/dashboard/exams'); setIsMobileMenuOpen(false); }}>
            <GraduationCap size={18} /> <span>Examens Nationaux</span>
          </button>
          <button className={`drawer-nav-item ${tab === 'messages' ? 'active' : ''}`} onClick={() => { navigate('/student/dashboard/messages'); setIsMobileMenuOpen(false); }}>
            <MessageSquare size={18} /> <span>Messagerie & Alertes</span>
          </button>
          <button className={`drawer-nav-item ${tab === 'ai-assistant' ? 'active' : ''}`} onClick={() => { navigate('/student/dashboard/ai-assistant'); setIsMobileMenuOpen(false); }}>
            <Sparkles size={18} /> <span>Assistant IA Pédagogique</span>
          </button>
          <button className={`drawer-nav-item ${tab === 'attestation' ? 'active' : ''}`} onClick={() => { navigate('/student/dashboard/attestation'); setIsMobileMenuOpen(false); }}>
            <Award size={18} /> <span>Attestation d'Inscription</span>
          </button>
        </nav>
      </div>
    </div>,
    document.body
  );
};
