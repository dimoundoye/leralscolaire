import { AlertTriangle } from 'lucide-react';

// Fenêtre modale extraite de TeacherDashboard.jsx
export default function ModifyGradeModal({
  auditMotif,
  handleUpdateGradeWithAudit,
  modifyingGradeAppreciation,
  modifyingGradeValue,
  setAuditMotif,
  setModifyingGradeAppreciation,
  setModifyingGradeId,
  setModifyingGradeValue,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '450px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#b45309' }}>
          <AlertTriangle size={24} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Justification de Modification</h3>
        </div>

        <form onSubmit={handleUpdateGradeWithAudit}>
          <p style={{ fontSize: '12.5px', color: 'var(--text-slate-700)', lineHeight: 1.5, marginBottom: '16px' }}>
            Toute modification de note sur le livret scolaire numérique est enregistrée de manière permanente dans le{' '}
            <strong>journal d'audit</strong> de l'etablissement concerné. Veuillez justifier cette modification.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Nouvelle note</label>
              <input
                type="number"
                step="0.25"
                min="0"
                max="20"
                required
                value={modifyingGradeValue}
                onChange={(e) => setModifyingGradeValue(e.target.value)}
                style={{ fontWeight: 'bold', fontSize: '16px', textAlign: 'center' }}
              />
            </div>
            <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
              <label>Nouvel appréciation</label>
              <input
                type="text"
                value={modifyingGradeAppreciation}
                onChange={(e) => setModifyingGradeAppreciation(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Motif de la modification (Obligatoire)</label>
            <textarea
              required
              rows="3"
              placeholder="ex: Erreur de report lors de la saisie initiale"
              value={auditMotif}
              onChange={(e) => setAuditMotif(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border-slate-200)',
                fontSize: '13px',
              }}
            />
          </div>

          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModifyingGradeId(null)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" style={{ background: '#b45309', borderColor: '#b45309' }}>
              Valider et enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
