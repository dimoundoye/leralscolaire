// Fenêtre modale extraite de Dashboard.jsx
export default function MotifTextModal({ activeMotifText, setActiveMotifText }) {
  return (
    <div className="modal-overlay" onClick={() => setActiveMotifText('')}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-lg)' }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: 'var(--slate-800)' }}>
          Motif de la modification
        </h3>
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '13px',
            color: 'var(--slate-700)',
            fontStyle: 'italic',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          "{activeMotifText}"
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setActiveMotifText('')}
            style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600 }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
