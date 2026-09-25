// Fenêtre modale extraite de Dashboard.jsx
export default function JustifyAbsenceModal({
  absJustificationMotif,
  handleJustifyAbsence,
  selectedAbsenceForJustify,
  setAbsJustificationMotif,
  setSelectedAbsenceForJustify,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '450px' }}>
        <h3 style={{ marginBottom: '12px' }}>Justifier l'Absence / Retard</h3>
        <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', marginBottom: '16px', lineHeight: 1.4 }}>
          Vous justifiez l'incident de présence de{' '}
          <strong>
            {selectedAbsenceForJustify.eleve_prenom} {selectedAbsenceForJustify.eleve_nom}
          </strong>{' '}
          ({selectedAbsenceForJustify.classe_nom}) du{' '}
          {new Date(selectedAbsenceForJustify.date_absence).toLocaleDateString('fr-FR')}.
        </p>
        <form onSubmit={handleJustifyAbsence}>
          <div className="input-group">
            <label>Motif de la justification</label>
            <textarea
              required
              rows="3"
              placeholder="ex: Certificat médical fourni par le parent."
              value={absJustificationMotif}
              onChange={(e) => setAbsJustificationMotif(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
              }}
            />
          </div>
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setSelectedAbsenceForJustify(null);
                setAbsJustificationMotif('');
              }}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Valider la justification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
