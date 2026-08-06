import React from 'react';
import { GraduationCap, Copy } from 'lucide-react';

export const OfficeTopbar = ({ examenMode, copyPublicLink }) => {
  return (
    <header className="ob-topbar">
      <div className="ob-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="ob-topbar-title">
          <GraduationCap size={20} />
          <span>Direction des Examens — {examenMode === 'BAC' ? 'Session BAC' : 'Session BFEM'}</span>
        </div>
      </div>
      <div className="ob-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="ob-btn ob-btn-primary ob-btn-sm" onClick={copyPublicLink} style={{ background: '#10b981', borderColor: '#059669' }}>
          <Copy size={14} /> Copier le Lien d'Inscription Publique
        </button>
        <div className="ob-topbar-badge">
          🇸🇳 République du Sénégal
        </div>
      </div>
    </header>
  );
};

export default OfficeTopbar;
