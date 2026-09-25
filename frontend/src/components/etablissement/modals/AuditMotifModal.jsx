import { FileText, X } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function AuditMotifModal({ setViewMotifModal, viewMotifModal }) {
  return (
    <div className="modal-overlay" onClick={() => setViewMotifModal(null)}>
      <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: viewMotifModal.titre.includes('Admin') ? '#dcfce7' : '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText
                size={18}
                style={{ color: viewMotifModal.titre.includes('Admin') ? '#15803d' : 'var(--primary-color)' }}
              />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--slate-800)' }}>
              {viewMotifModal.titre}
            </h3>
          </div>
          <button
            onClick={() => setViewMotifModal(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--slate-400)',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Student info */}
        <div
          style={{
            background: 'var(--bg-subtle, #f8fafc)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            border: '1px solid var(--border-color, #e2e8f0)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '4px' }}>Élève</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate-800)' }}>
            {viewMotifModal.entry.eleve_prenom} {viewMotifModal.entry.eleve_nom}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--slate-500)', marginTop: '2px' }}>
            {viewMotifModal.entry.classe_nom} ·{' '}
            {new Date(viewMotifModal.entry.date_absence).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Full motif text */}
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '10px',
            padding: '16px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--slate-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '10px',
            }}
          >
            Motif complet
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '13.5px',
              lineHeight: '1.7',
              color: 'var(--slate-700)',
              fontStyle: 'italic',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            "{viewMotifModal.texte}"
          </p>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setViewMotifModal(null)}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 18px' }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
