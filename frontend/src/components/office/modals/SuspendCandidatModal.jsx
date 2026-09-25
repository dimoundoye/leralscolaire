import { X, AlertCircle } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function SuspendCandidatModal({
  handleSuspendre,
  setShowSuspendModal,
  setSuspendMotif,
  suspendMotif,
  suspendTarget,
}) {
  return (
    <div className="ob-modal-overlay" onClick={() => setShowSuspendModal(false)}>
      <div className="ob-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header">
          <h3>🛑 Suspendre la candidature</h3>
          <button onClick={() => setShowSuspendModal(false)}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSuspendre} className="ob-modal-body">
          <div className="ob-publi-warning" style={{ background: '#fff1f2', borderColor: '#fecdd3', color: '#9f1239' }}>
            <AlertCircle size={18} style={{ color: '#be123c' }} />
            <p>
              Vous êtes sur le point de suspendre la candidature de{' '}
              <strong>
                {suspendTarget.prenom} {suspendTarget.nom}
              </strong>{' '}
              (N° Table: {suspendTarget.numero_table || 'Non attribué'}).
            </p>
          </div>

          <div className="ob-form-group">
            <label>Motif obligatoire de suspension *</label>
            <textarea
              rows={3}
              placeholder="Saisissez le motif explicite (ex: Fraude documentaire, Dossier incomplet, Litige d'état civil…)"
              value={suspendMotif}
              onChange={(e) => setSuspendMotif(e.target.value)}
              required
            />
          </div>

          <div className="ob-modal-footer">
            <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowSuspendModal(false)}>
              Annuler
            </button>
            <button type="submit" className="ob-btn ob-btn-danger">
              <AlertCircle size={16} /> Confirmer la suspension
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
