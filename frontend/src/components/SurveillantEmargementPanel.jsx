import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function SurveillantEmargementPanel({ etablissementId }) {
  const handleOpenLiveKiosk = () => {
    const targetId = etablissementId || 'default';
    const popWindow = window.open(
      `/emargement/live-qr/${targetId}`,
      'QREmargementLiveKiosque',
      'width=1024,height=768,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
    );

    window.addEventListener('beforeunload', () => {
      if (popWindow && !popWindow.closed) {
        popWindow.close();
      }
    });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #131e6c 0%, #1e1b4b 100%)',
      borderRadius: '16px',
      padding: '20px 24px',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      boxShadow: '0 4px 15px rgba(19, 30, 108, 0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '12px' }}>
          <ShieldCheck size={28} color="#818cf8" />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
            Borne QR Code d'Émargement 20s (Pop-up Second Écran)
          </h4>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
            Ouvrez la borne QR Code en fenêtre externe sans interrompre votre travail de surveillant.
          </p>
        </div>
      </div>

      <button
        onClick={handleOpenLiveKiosk}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#ffffff',
          fontSize: '12.5px',
          fontWeight: 800,
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
        }}
      >
        <ExternalLink size={16} /> Afficher le QR Code en Externe
      </button>
    </div>
  );
}
