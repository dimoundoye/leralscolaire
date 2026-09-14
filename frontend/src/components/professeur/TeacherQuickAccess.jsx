import React, { useState } from 'react';
import {
  QrCode, UserCheck, BookOpenCheck, BookMarked, Calendar,
  ClipboardList, MessageSquare, ChevronUp, Users, Building,
  BookOpen, Scale, Mail, Settings, Award, Sparkles
} from 'lucide-react';

/**
 * 4-dots grid icon matching the Wave screenshot style
 */
const GridDotsIcon = ({ size = 24, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <circle cx="7" cy="7" r="2.8" />
    <circle cx="17" cy="7" r="2.8" />
    <circle cx="7" cy="17" r="2.8" />
    <circle cx="17" cy="17" r="2.8" />
  </svg>
);

const TeacherQuickAccess = ({
  navigate,
  profile,
  invitations = [],
  setActiveTab
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAction = (path, tabName) => {
    if (path) {
      navigate(path);
    }
    if (tabName && setActiveTab) {
      setActiveTab(tabName);
    }
  };

  // 7 Primary daily actions + 8th is the "Plus / Moins" trigger
  const primaryActions = [
    {
      id: 'emargement',
      title: 'Émarger',
      icon: <QrCode size={26} strokeWidth={2.3} />,
      bg: '#dcfce7',
      color: '#15803d',
      action: () => handleAction('/professeur/dashboard/emargement', 'emargement')
    },
    {
      id: 'attendance',
      title: "Faire l'appel",
      icon: <UserCheck size={26} strokeWidth={2.3} />,
      bg: '#e0f2fe',
      color: '#0284c7',
      action: () => handleAction('/professeur/dashboard/attendance', 'attendance')
    },
    {
      id: 'grades',
      title: 'Notes',
      icon: <BookOpenCheck size={26} strokeWidth={2.3} />,
      bg: '#e0e7ff',
      color: '#4338ca',
      action: () => handleAction('/professeur/dashboard/grades', 'grades')
    },
    {
      id: 'cahier-texte',
      title: 'Cahier texte',
      icon: <BookMarked size={26} strokeWidth={2.3} />,
      bg: '#fce7f3',
      color: '#c026d3',
      action: () => handleAction('/professeur/dashboard/cahier-texte', 'cahier-texte')
    },
    {
      id: 'schedule',
      title: 'Planning',
      icon: <Calendar size={26} strokeWidth={2.3} />,
      bg: '#ffedd5',
      color: '#ea580c',
      action: () => handleAction('/professeur/dashboard/schedule', 'schedule')
    },
    {
      id: 'planning',
      title: 'Devoirs',
      icon: <ClipboardList size={26} strokeWidth={2.3} />,
      bg: '#ccfbf1',
      color: '#0d9488',
      action: () => handleAction('/professeur/dashboard/planning', 'planning')
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: <MessageSquare size={26} strokeWidth={2.3} />,
      bg: '#fef3c7',
      color: '#d97706',
      action: () => handleAction('/professeur/dashboard/messages', 'messages')
    },
    {
      id: 'toggle-more',
      title: isExpanded ? 'Moins' : 'Plus',
      icon: isExpanded
        ? <ChevronUp size={26} strokeWidth={2.6} />
        : <GridDotsIcon size={24} color="#64748b" />,
      bg: isExpanded ? '#fee2e2' : '#f1f5f9',
      color: isExpanded ? '#b91c1c' : '#475569',
      action: () => setIsExpanded(prev => !prev),
      isToggle: true
    }
  ];

  // Secondary actions revealed when "Plus" is clicked
  const secondaryActions = [
    {
      id: 'attached-classes',
      title: 'Mes Classes',
      icon: <Users size={26} strokeWidth={2.3} />,
      bg: '#ede9fe',
      color: '#7c3aed',
      action: () => handleAction('/professeur/dashboard/attached-classes', 'attached-classes')
    },
    {
      id: 'partner-schools',
      title: 'Écoles',
      icon: <Building size={26} strokeWidth={2.3} />,
      bg: '#e0f2fe',
      color: '#0284c7',
      action: () => handleAction('/professeur/dashboard/partner-schools', 'partner-schools')
    },
    {
      id: 'pedagogy',
      title: 'Pédagogie',
      icon: <BookOpen size={26} strokeWidth={2.3} />,
      bg: '#d1fae5',
      color: '#059669',
      action: () => handleAction('/professeur/dashboard/pedagogy', 'pedagogy')
    },
    {
      id: 'discipline',
      title: 'Discipline',
      icon: <Scale size={26} strokeWidth={2.3} />,
      bg: '#ffe4e6',
      color: '#e11d48',
      action: () => handleAction('/professeur/dashboard/discipline', 'discipline')
    },
    {
      id: 'invitations',
      title: 'Invitations',
      icon: <Mail size={26} strokeWidth={2.3} />,
      bg: '#fef9c3',
      color: '#ca8a04',
      badge: invitations?.length > 0 ? invitations.length : null,
      action: () => handleAction('/professeur/dashboard/invitations', 'invitations')
    },
    {
      id: 'profile',
      title: 'Mon Profil',
      icon: <Settings size={26} strokeWidth={2.3} />,
      bg: '#f1f5f9',
      color: '#334155',
      action: () => handleAction('/professeur/dashboard/profile', 'profile')
    }
  ];

  // If teacher is President du Jury, add jury tab shortcut
  if (profile?.is_president_jury) {
    secondaryActions.push({
      id: 'jury',
      title: 'Jury BAC',
      icon: <Award size={26} strokeWidth={2.3} />,
      bg: '#fef08a',
      color: '#854d0e',
      action: () => handleAction('/jury/dashboard')
    });
  }

  const renderButton = (item) => (
    <button
      key={item.id}
      type="button"
      onClick={item.action}
      className={`quick-access-btn ${item.isToggle ? 'quick-access-toggle' : ''}`}
      title={item.title}
    >
      <div
        className="quick-access-icon-circle"
        style={{
          backgroundColor: item.bg,
          color: item.color
        }}
      >
        {item.icon}
        {item.badge && (
          <span className="quick-access-badge">
            {item.badge}
          </span>
        )}
      </div>
      <span className="quick-access-label">
        {item.title}
      </span>
    </button>
  );

  return (
    <div className="teacher-quick-access-card card-box">
      <div className="quick-access-header">
        <h3 className="quick-access-title">
          <Sparkles size={16} /> Accès Rapide
        </h3>
        {isExpanded && (
          <button
            type="button"
            className="quick-access-reduce-btn"
            onClick={() => setIsExpanded(false)}
          >
            Réduire
          </button>
        )}
      </div>

      {/* Primary 4-col grid (2 rows on mobile) */}
      <div className="quick-access-grid">
        {primaryActions.map(renderButton)}
      </div>

      {/* Secondary grid revealed when clicking Plus */}
      {isExpanded && (
        <div className="quick-access-expanded-section">
          <div className="quick-access-divider">
            <span>Autres onglets & fonctionnalités</span>
          </div>
          <div className="quick-access-grid quick-access-secondary-grid">
            {secondaryActions.map(renderButton)}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuickAccess;
