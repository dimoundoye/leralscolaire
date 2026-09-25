import { CheckCircle2, AlertTriangle } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function AuditConfirmModal({ auditConfirmAction, executeAuditAction, setShowAuditConfirmModal }) {
  return (
    <div className="modal-overlay" onClick={() => setShowAuditConfirmModal(false)}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-lg)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: auditConfirmAction.type === 'confirm' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
              color: auditConfirmAction.type === 'confirm' ? '#059669' : '#dc2626',
            }}
          >
            {auditConfirmAction.type === 'confirm' ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
          </div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--slate-800)' }}>
            {auditConfirmAction.type === 'confirm' ? 'Confirmer la modification' : 'Rejeter la modification'}
          </h3>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--slate-600)', lineHeight: '1.5', marginBottom: '20px' }}>
          {auditConfirmAction.type === 'confirm'
            ? 'Êtes-vous sûr de vouloir valider et appliquer cette modification de note dans les bulletins scolaires ?'
            : "Êtes-vous sûr de vouloir rejeter cette proposition de modification de note ? L'ancienne note sera conservée."}
        </p>

        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Élève :</span>
            <span style={{ color: '#1e293b', fontWeight: 600 }}>
              {auditConfirmAction.entry.eleve_prenom} {auditConfirmAction.entry.eleve_nom}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Classe & Matière :</span>
            <span style={{ color: '#1e293b', fontWeight: 600 }}>
              {auditConfirmAction.entry.classe_nom} • {auditConfirmAction.entry.matiere_nom}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Type & Période :</span>
            <span style={{ color: '#1e293b', fontWeight: 600 }}>
              {auditConfirmAction.entry.type_note} (
              {auditConfirmAction.entry.trimestre
                ? `Trimestre ${auditConfirmAction.entry.trimestre}`
                : `Semestre ${auditConfirmAction.entry.semestre}`}
              )
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px dashed #e2e8f0',
            }}
          >
            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Valeur de la note :</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ textDecoration: 'line-through', color: '#dc2626', fontWeight: 700, fontSize: '14px' }}>
                {parseFloat(auditConfirmAction.entry.ancienne_valeur).toFixed(2)}/20
              </span>
              <span style={{ color: '#64748b', fontSize: '12px' }}>➔</span>
              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '15px' }}>
                {parseFloat(auditConfirmAction.entry.nouvelle_valeur).toFixed(2)}/20
              </span>
            </div>
          </div>
          {auditConfirmAction.entry.motif && (
            <div
              style={{
                marginTop: '12px',
                fontSize: '12px',
                color: '#64748b',
                background: '#fff',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontStyle: 'italic',
              }}
            >
              Motif : "{auditConfirmAction.entry.motif}"
            </div>
          )}
        </div>

        <div
          className="modal-actions"
          style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 0 }}
        >
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowAuditConfirmModal(false)}
            style={{ padding: '10px 18px', fontSize: '13px', fontWeight: 600, margin: 0 }}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn"
            onClick={executeAuditAction}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              margin: 0,
              background: auditConfirmAction.type === 'confirm' ? '#059669' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {auditConfirmAction.type === 'confirm' ? 'Valider et appliquer' : 'Rejeter la modification'}
          </button>
        </div>
      </div>
    </div>
  );
}
