import { X, Trash2, Plus, Save } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function CandidatResultModal({
  handleSaveResultat,
  resultForm,
  selectedCandidat,
  setResultForm,
  setShowResultModal,
}) {
  return (
    <div className="ob-modal-overlay" onClick={() => setShowResultModal(false)}>
      <div className="ob-modal ob-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header">
          <div>
            <h3>Saisie des résultats & Délibération</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              {selectedCandidat.prenom} {selectedCandidat.nom} · N° {selectedCandidat.numero_table || 'Non attribué'} ·{' '}
              {selectedCandidat.type_examen} {selectedCandidat.annee} · Série {selectedCandidat.serie}
            </p>
          </div>
          <button onClick={() => setShowResultModal(false)}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSaveResultat} className="ob-modal-body">
          <div className="ob-form-group">
            <label>Absence à l'examen (si applicable)</label>
            <select
              value={resultForm.absent_epreuve}
              onChange={(e) => setResultForm((f) => ({ ...f, absent_epreuve: e.target.value }))}
            >
              <option value="">Présent (Aucune absence)</option>
              <option value="ABI">ABI — Absence Injustifiée (Ajournement direct)</option>
              <option value="ABJ">ABJ — Absence Justifiée</option>
            </select>
          </div>

          <div className="ob-form-group">
            <label>Épreuves et Notes / Coefficients (Série {selectedCandidat.serie})</label>
            <div className="ob-epreuves-editor">
              {Object.entries(resultForm.details_epreuves).map(([matiere, data]) => (
                <div key={matiere} className="ob-epreuve-row">
                  <input className="ob-ep-matiere" value={matiere} readOnly />
                  <input
                    className="ob-ep-note"
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    placeholder="Note /20"
                    value={data.note || ''}
                    onChange={(e) =>
                      setResultForm((f) => ({
                        ...f,
                        details_epreuves: { ...f.details_epreuves, [matiere]: { ...data, note: e.target.value } },
                      }))
                    }
                  />
                  <input
                    className="ob-ep-coeff"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Coeff"
                    value={data.coefficient || ''}
                    onChange={(e) =>
                      setResultForm((f) => ({
                        ...f,
                        details_epreuves: {
                          ...f.details_epreuves,
                          [matiere]: { ...data, coefficient: e.target.value },
                        },
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="ob-icon-btn ob-icon-del"
                    onClick={() => {
                      const ep = { ...resultForm.details_epreuves };
                      delete ep[matiere];
                      setResultForm((f) => ({ ...f, details_epreuves: ep }));
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="ob-add-epreuve-btn"
                onClick={() => {
                  const nom = prompt("Nom de l'épreuve (ex: Mathématiques):");
                  if (nom && nom.trim()) {
                    setResultForm((f) => ({
                      ...f,
                      details_epreuves: { ...f.details_epreuves, [nom.trim()]: { note: '', coefficient: 1 } },
                    }));
                  }
                }}
              >
                <Plus size={14} /> Ajouter une épreuve
              </button>
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Appréciation du jury</label>
              <textarea
                rows={3}
                placeholder="Appréciation libre du jury…"
                value={resultForm.appreciation_jury}
                onChange={(e) => setResultForm((f) => ({ ...f, appreciation_jury: e.target.value }))}
              />
            </div>
            <div className="ob-form-group">
              <label>Date de délibération</label>
              <input
                type="date"
                value={resultForm.date_deliberation}
                onChange={(e) => setResultForm((f) => ({ ...f, date_deliberation: e.target.value }))}
              />
            </div>
          </div>

          <div className="ob-calc-preview">
            <span>
              {' '}
              Délibération automatique : Moyenne &ge; 10/20 &rarr; Admis | 8.00 à 9.99/20 &rarr; Admissible 2nd Tour
              (Rattrapage).
            </span>
          </div>

          <div className="ob-modal-footer">
            <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowResultModal(false)}>
              Annuler
            </button>
            <button type="submit" className="ob-btn ob-btn-primary">
              <Save size={16} /> Valider la délibération
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
