import { XCircle, X } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function RejectDemandeModal({
  handleConfirmReject,
  rejectLoading,
  rejectModalData,
  rejectMotif,
  setRejectModalData,
  setRejectMotif,
}) {
  return (
    <div className="ob-modal-overlay" onClick={() => !rejectLoading && setRejectModalData(null)}>
      <div className="ob-modal" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header" style={{ borderBottom: '1.5px solid #fecaca', background: '#fff5f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <XCircle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#991b1b', fontWeight: 800 }}>
                Rejet de la pré-inscription
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#b91c1c' }}>
                Dossier #{rejectModalData.id} — {rejectModalData.prenom ? `${rejectModalData.prenom} ` : ''}
                {rejectModalData.nom}
              </p>
            </div>
          </div>
          <button onClick={() => !rejectLoading && setRejectModalData(null)} disabled={rejectLoading}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConfirmReject} className="ob-modal-body">
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#92400e',
              lineHeight: 1.5,
            }}
          >
            ⚠️ <strong>Notification automatique par email :</strong> Le motif renseigné ci-dessous sera immédiatement
            expédié à <strong>{rejectModalData.email}</strong> pour l'informer de la décision et lui indiquer les pièces
            à corriger.
          </div>

          <div className="ob-form-group">
            <label
              style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px', display: 'block' }}
            >
              Motifs fréquents (cliquez pour insérer rapidement) :
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {[
                "Arrêté d'ouverture MEN non conforme ou illisible",
                'Carte CNI expirée ou copie recto-verso manquante',
                'Décret de création ou attestation NINEA non joint',
                'Diplôme ou attestation académique non recevable',
                "Coordonnées de l'établissement ou contact erroné",
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRejectMotif(preset)}
                  style={{
                    fontSize: '11px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    color: '#334155',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  + {preset}
                </button>
              ))}
            </div>

            <label
              style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}
            >
              Motif explicite du rejet *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Détaillez le motif du refus et indiquez la liste précise des documents ou informations à compléter ou corriger..."
              value={rejectMotif}
              onChange={(e) => setRejectMotif(e.target.value)}
              style={{
                width: '100%',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                padding: '10px 12px',
                fontSize: '13px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div
            className="ob-modal-footer"
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}
          >
            <button
              type="button"
              className="ob-btn ob-btn-ghost"
              onClick={() => setRejectModalData(null)}
              disabled={rejectLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="ob-btn ob-btn-danger"
              disabled={rejectLoading || !rejectMotif.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dc2626' }}
            >
              <XCircle size={16} />
              {rejectLoading ? 'Envoi de la décision…' : 'Confirmer le Rejet & Notifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
