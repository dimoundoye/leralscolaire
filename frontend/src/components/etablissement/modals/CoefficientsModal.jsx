// Fenêtre modale extraite de Dashboard.jsx
export default function CoefficientsModal({
  currentCoefs,
  handleSaveCoefs,
  loading,
  matieres,
  selectedClassCoef,
  setCurrentCoefs,
  setShowCoefModal,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '500px' }}>
        <h3>Coefficients - {selectedClassCoef?.nom}</h3>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          Définissez les coefficients pour chaque matière enseignée dans cette classe.
        </p>
        <div className="coef-list" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem' }}>
          {matieres.map((m) => {
            const isChecked = currentCoefs[m.id] !== undefined;
            return (
              <div
                key={m.id}
                className="coef-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="checkbox"
                    id={`coef-chk-${m.id}`}
                    checked={isChecked}
                    onChange={(e) => {
                      const newCoefs = { ...currentCoefs };
                      if (e.target.checked) newCoefs[m.id] = 1;
                      else delete newCoefs[m.id];
                      setCurrentCoefs(newCoefs);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <label
                    htmlFor={`coef-chk-${m.id}`}
                    style={{
                      fontWeight: 600,
                      color: isChecked ? 'var(--slate-800)' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    {m.nom}
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: isChecked ? 'var(--slate-500)' : '#cbd5e1',
                      fontWeight: 600,
                    }}
                  >
                    Coef :
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={isChecked ? currentCoefs[m.id] : 1}
                    disabled={!isChecked}
                    onChange={(e) => setCurrentCoefs({ ...currentCoefs, [m.id]: parseInt(e.target.value) || 1 })}
                    style={{
                      width: '70px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1.5px solid var(--border-color)',
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: 'center',
                      background: isChecked ? 'white' : '#f8fafc',
                      color: isChecked ? 'var(--slate-800)' : '#cbd5e1',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setShowCoefModal(false)}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={handleSaveCoefs} disabled={loading}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
