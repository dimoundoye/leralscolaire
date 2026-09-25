// Fenêtre modale extraite de Dashboard.jsx
export default function RefuseAttestationModal({
  handleRefuseAttestation,
  motifRefusAttestation,
  refusingAttestation,
  setMotifRefusAttestation,
  setRefusingAttestation,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 450 }}>
        <h3>Refuser la Demande d'Attestation</h3>
        <p style={{ color: 'var(--slate-500)', fontSize: '12px', marginBottom: '15px' }}>
          Veuillez indiquer le motif du refus pour l'élève{' '}
          <strong>
            {refusingAttestation.eleve_prenom} {refusingAttestation.eleve_nom}
          </strong>
          .
        </p>
        <form onSubmit={handleRefuseAttestation}>
          <div className="input-group">
            <label>Motif du Refus</label>
            <textarea
              rows="4"
              value={motifRefusAttestation}
              onChange={(e) => setMotifRefusAttestation(e.target.value)}
              required
              placeholder="Ex: Dossier incomplet, non inscrit pour cette année scolaire..."
              style={{
                width: '100%',
                borderRadius: '8px',
                border: '1.5px solid var(--border-color)',
                padding: '10px',
                fontSize: '12px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
          <div className="form-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setRefusingAttestation(null);
                setMotifRefusAttestation('');
              }}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" style={{ background: '#ef4444' }}>
              Confirmer le Refus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
