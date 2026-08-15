import React from 'react';
import { LogOut, Bell, Shield, Calendar, Monitor } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EtabTopbar = ({ profile, notificationsCount, onShowMessages, selectedYear, onYearChange, availableYears }) => {
  const { logout } = useAuth();
  const firstLetter = (profile?.nom || 'A')[0].toUpperCase();

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">
          <Shield size={16} className="text-primary" />
          <span>Espace Administratif</span>
        </div>
      </div>
      
      <div className="topbar-right">
        {/* Academic Year Selector */}
        {availableYears && availableYears.length > 0 && (
          <div className="year-selector-container" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}>
            <Calendar size={14} className="text-slate-500" style={{ color: 'var(--primary-color)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Année :</span>
            <select 
              value={selectedYear} 
              onChange={(e) => onYearChange(e.target.value)}
              style={{
                padding: '4px 24px 4px 8px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--primary-color)',
                background: 'rgba(19, 30, 108, 0.04)',
                border: '1px solid rgba(19, 30, 108, 0.1)',
                borderRadius: '6px',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23131e6c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '12px',
                minWidth: '100px'
              }}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}

        {/* School Name Badge */}
        <span className="school-badge">
          {profile?.nom || 'LeralScolaire'}
        </span>

        {/* Bouton Borne Émargement QR Code Externe */}
        <button
          onClick={() => {
            const popWindow = window.open(
              '/emargement/live-qr/default',
              'QREmargementLiveKiosque',
              'width=1024,height=768,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
            );
            window.addEventListener('beforeunload', () => {
              if (popWindow && !popWindow.closed) popWindow.close();
            });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
            marginRight: '8px'
          }}
          title="Ouvrir la borne d'émargement QR Code dynamique 20s en plein écran pour le second écran / vidéo-projecteur"
        >
          <Monitor size={15} />
          <span>Afficher le QR Code en Externe</span>
        </button>

        {/* Notifications Icon */}
        <button 
          className="topbar-action-btn relative"
          onClick={onShowMessages}
          title="Messagerie"
        >
          <Bell size={18} />
          {notificationsCount > 0 && (
            <span className="topbar-badge-dot" />
          )}
        </button>

        {/* User avatar and logout */}
        <div className="topbar-user-menu">
          <div className="avatar av-pink" style={{ width: 32, height: 32, fontSize: 11 }}>
            {firstLetter}
          </div>
          <button 
            className="logout-btn" 
            onClick={logout}
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EtabTopbar;
