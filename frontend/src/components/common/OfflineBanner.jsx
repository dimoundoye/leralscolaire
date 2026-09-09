import React from 'react';
import { useOffline } from '../../contexts/OfflineContext';
import { WifiOff, RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function OfflineBanner() {
  const { isOnline, pendingCount, isSyncing, showSuccessToast, lastSyncResult, syncNow } = useOffline();

  // Si tout est en ligne, rien à synchroniser et pas de toast récent, on n'affiche rien pour ne pas encombrer l'écran
  if (isOnline && pendingCount === 0 && !isSyncing && !showSuccessToast) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 99999,
      maxWidth: '420px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Toast de succès temporaire */}
      {showSuccessToast && lastSyncResult && (
        <div style={{
          backgroundColor: '#059669',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: '500',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <CheckCircle2 size={20} color="#ffffff" />
          <span>
            {lastSyncResult.count} action{lastSyncResult.count > 1 ? 's' : ''} synchronisée{lastSyncResult.count > 1 ? 's' : ''} avec succès sur le serveur !
          </span>
        </div>
      )}

      {/* Bannière Hors-Ligne (Offline) */}
      {!isOnline && (
        <div style={{
          backgroundColor: '#1e293b',
          borderLeft: '4px solid #ef4444',
          color: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex'
            }}>
              <WifiOff size={18} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#f8fafc' }}>Mode Hors-Ligne Actif</div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                Vos saisies sont stockées localement.
              </div>
            </div>
          </div>

          {pendingCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              <Clock size={14} />
              <span>{pendingCount} ⏳</span>
            </div>
          )}
        </div>
      )}

      {/* Bannière de Synchronisation en cours */}
      {isSyncing && (
        <div style={{
          backgroundColor: '#1e293b',
          borderLeft: '4px solid #3b82f6',
          color: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px'
        }}>
          <RefreshCw
            size={18}
            color="#3b82f6"
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <div>
            <div style={{ fontWeight: '600' }}>Synchronisation en cours...</div>
            <div style={{ color: '#94a3b8', fontSize: '12px' }}>
              Envoi automatique des données au serveur...
            </div>
          </div>
        </div>
      )}

      {/* En ligne avec des éléments en attente (ex: tentative manuelle si besoin) */}
      {isOnline && pendingCount > 0 && !isSyncing && (
        <div style={{
          backgroundColor: '#1e293b',
          borderLeft: '4px solid #f59e0b',
          color: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#f59e0b" />
            <span>{pendingCount} action{pendingCount > 1 ? 's' : ''} en attente</span>
          </div>
          <button
            onClick={syncNow}
            style={{
              backgroundColor: '#f59e0b',
              color: '#1e293b',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} />
            Synchroniser
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
