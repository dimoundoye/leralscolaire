import { FileText, X } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function TransferMotifModal({ setViewTransferMotifModal, viewTransferMotifModal }) {
  return (
    <div className="modal-overlay" onClick={() => setViewTransferMotifModal(null)}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px', width: '90%', borderRadius: '16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--slate-900)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FileText size={18} className="text-primary" /> Motif du transfert
          </h3>
          <button className="close-btn" onClick={() => setViewTransferMotifModal(null)}>
            <X size={18} />
          </button>
        </div>

        {viewTransferMotifModal.eleveNom && (
          <p className="text-muted" style={{ marginBottom: '14px', fontSize: '13px', fontWeight: 600 }}>
            Élève concerné : <strong style={{ color: 'var(--slate-800)' }}>{viewTransferMotifModal.eleveNom}</strong>
          </p>
        )}

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '14px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            color: '#334155',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            maxHeight: '250px',
            overflowY: 'auto',
          }}
        >
          {viewTransferMotifModal.motif || 'Aucun motif spécifié pour cette demande.'}
        </div>

        <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setViewTransferMotifModal(null)}
            style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '8px' }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
