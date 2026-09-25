// Fenêtre modale extraite de Dashboard.jsx
export default function ReglesPassageModal({ handleSaveRegles, reglesPassage, setReglesPassage, setShowReglesModal }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '450px' }}>
        <h3>Règles de Passage</h3>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
          Définissez les seuils pour chaque décision. Les moyennes sont sur 20.
        </p>
        <form onSubmit={handleSaveRegles}>
          <div className="input-group">
            <label>Passage (moyenne ≥)</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              required
              value={reglesPassage.seuil_passage}
              onChange={(e) =>
                setReglesPassage({
                  ...reglesPassage,
                  seuil_passage: parseFloat(e.target.value) || 0,
                  seuil_passage_direct: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="input-group">
            <label>Cours de vacances (moyenne ≥)</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              required
              value={reglesPassage.seuil_cours_vacances}
              onChange={(e) =>
                setReglesPassage({ ...reglesPassage, seuil_cours_vacances: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowReglesModal(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
