import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function ConfirmTransferModal({ confirmTransferModal, loading, setConfirmTransferModal }) {
  return (
    <div className="modal-overlay" onClick={() => setConfirmTransferModal(null)}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px', width: '90%', borderRadius: '16px', padding: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              background: confirmTransferModal.type === 'accept' ? '#dcfce7' : '#fee2e2',
              color: confirmTransferModal.type === 'accept' ? '#15803d' : '#dc2626',
              flexShrink: 0,
            }}
          >
            {confirmTransferModal.type === 'accept' ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--slate-900)' }}>
              {confirmTransferModal.type === 'accept' && 'Accepter le transfert'}
              {confirmTransferModal.type === 'reject' && 'Refuser la demande'}
              {confirmTransferModal.type === 'cancel' && 'Annuler la demande'}
            </h3>
            {confirmTransferModal.eleveNom && (
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                Élève : {confirmTransferModal.eleveNom}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            fontSize: '13.5px',
            color: '#334155',
            lineHeight: '1.6',
            marginBottom: '20px',
            background: '#f8fafc',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}
        >
          {confirmTransferModal.type === 'accept' && (
            <>
              Voulez-vous vraiment <strong>accepter</strong> ce transfert ? L'élève sera rattaché à votre établissement
              et les <strong>droits d'édition</strong> vous seront automatiquement transmis.
            </>
          )}
          {confirmTransferModal.type === 'reject' && (
            <>
              Êtes-vous sûr de vouloir <strong>refuser</strong> cette demande de transfert ? L'élève restera sous la
              gestion de son établissement d'origine.
            </>
          )}
          {confirmTransferModal.type === 'cancel' && (
            <>
              Êtes-vous sûr de vouloir <strong>annuler</strong> cette demande de transfert ?
            </>
          )}
        </div>

        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setConfirmTransferModal(null)}
            disabled={loading}
            style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '8px' }}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn"
            onClick={confirmTransferModal.onConfirm}
            disabled={loading}
            style={{
              fontSize: '12px',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              color: '#fff',
              background: confirmTransferModal.type === 'accept' ? '#10b981' : '#ef4444',
              borderColor: confirmTransferModal.type === 'accept' ? '#059669' : '#dc2626',
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={14} />
            ) : confirmTransferModal.type === 'accept' ? (
              "Confirmer l'acceptation"
            ) : confirmTransferModal.type === 'reject' ? (
              'Confirmer le refus'
            ) : (
              "Confirmer l'annulation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
