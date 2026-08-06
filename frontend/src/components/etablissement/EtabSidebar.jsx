import React from 'react';
import { 
  LayoutDashboard, 
  School, 
  Users, 
  UserPlus, 
  Book, 
  User, 
  BookOpenCheck, 
  Clock, 
  CalendarDays, 
  Calendar, 
  Mail, 
  Share2, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  Sliders,
  UserX,
  BookMarked,
  ArrowRightLeft,
  Scale
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EtabSidebar = ({ activeTab, profile, elevesCount, preInscriptionsCount, unreadPartagesCount, transfersCount, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const firstLetter = (profile?.nom || 'A')[0].toUpperCase();

  const menuItems = [
    { section: 'Menu Principal' },
    { id: 'overview', label: 'Tableau de Bord', icon: LayoutDashboard, path: '/dashboard/overview' },
    { id: 'classes', label: 'Mes Classes', icon: School, path: '/dashboard/classes' },
    { id: 'eleves', label: 'Liste des Élèves', icon: Users, path: '/dashboard/eleves', badge: elevesCount },
    { id: 'transferts', label: 'Transferts de Dossiers', icon: ArrowRightLeft, path: '/dashboard/transferts', badge: transfersCount },
    { id: 'pre-inscriptions', label: 'Pré-inscriptions', icon: UserPlus, path: '/dashboard/pre-inscriptions', badge: preInscriptionsCount },
    { id: 'matieres', label: 'Matières', icon: Book, path: '/dashboard/matieres' },
    { id: 'profs', label: 'Corps Enseignant', icon: User, path: '/dashboard/profs' },
    
    { section: 'Pédagogie' },
    { id: 'notes', label: 'Notes & Bulletins', icon: BookOpenCheck, path: '/dashboard/notes' },
    { id: 'baremes', label: "Barèmes d'appréciation", icon: Sliders, path: '/dashboard/baremes' },
    { id: 'discipline', label: 'Vie Scolaire & Discipline', icon: Scale, path: '/dashboard/discipline' },
    { id: 'attendance', label: "Suivi de l'Assiduité", icon: UserX, path: '/dashboard/attendance' },
    { id: 'cahier-texte', label: 'Cahier de Texte', icon: BookMarked, path: '/dashboard/cahier-texte' },
    { id: 'schedule', label: 'Emploi du Temps', icon: Clock, path: '/dashboard/schedule' },
    { id: 'exams', label: 'Examens', icon: CalendarDays, path: '/dashboard/exams' },
    { id: 'calendar', label: 'Calendrier', icon: Calendar, path: '/dashboard/calendar' },
    { id: 'attestations', label: "Attestations d'Inscription", icon: FileText, path: '/dashboard/attestations' },
    
    { section: 'Communication & Outils' },
    { id: 'messages', label: 'Messagerie', icon: Mail, path: '/dashboard/messages' },
    { id: 'partages', label: 'Documents Partagés', icon: Share2, path: '/dashboard/partages', badge: unreadPartagesCount },
    { id: 'settings', label: 'Paramètres', icon: Settings, path: '/dashboard/settings' }
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand logo space at the top */}
      <div className="sidebar-brand">
        <ShieldCheck size={20} className="text-accent" />
        {!isCollapsed && <span className="brand-name">Leral<span>Scolaire</span></span>}
      </div>

      {/* User Info Profile Card */}
      <div className="user-card">
        <div className="avatar av-blue">
          {firstLetter}
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-name">{profile?.nom || 'Admin'}</div>
            <div className="user-role">{profile?.code_etablissement || 'LeralScolaire'}</div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="sidebar-menu">
        {menuItems.map((item, idx) => {
          if (item.section) {
            return !isCollapsed ? (
              <div key={idx} className="sb-section">{item.section}</div>
            ) : (
              <div key={idx} className="sb-section-divider" />
            );
          }

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              className={`sb-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={18} />
              {!isCollapsed && <span className="sb-label">{item.label}</span>}
              {!isCollapsed && item.badge > 0 && (
                <span className="badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Floating Toggle Button from Samalocation */}
      <button 
        className="sidebar-toggle-btn"
        onClick={onToggleCollapse}
        title={isCollapsed ? "Afficher le menu" : "Réduire le menu"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
};

export default EtabSidebar;
