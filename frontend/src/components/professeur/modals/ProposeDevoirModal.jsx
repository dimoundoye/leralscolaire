// Fenêtre modale extraite de TeacherDashboard.jsx
export default function ProposeDevoirModal({
  classes,
  handleProposeDevoir,
  propClasse,
  propDate,
  propMatiere,
  propSalle,
  propType,
  setPropClasse,
  setPropDate,
  setPropEtab,
  setPropMatiere,
  setPropSalle,
  setPropType,
  setShowProposeModal,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '480px' }}>
        <h3 style={{ marginBottom: '6px' }}>Proposer un Devoir</h3>
        <p className="subtitle" style={{ fontSize: '12px', color: 'var(--text-slate-500)', marginBottom: '20px' }}>
          Soumettez une proposition de date de devoir à l'administrateur de l'établissement concerné.
        </p>

        <form onSubmit={handleProposeDevoir} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-group">
            <label>Établissement & Classe</label>
            <select
              required
              value={propClasse}
              onChange={(e) => {
                const cId = e.target.value;
                setPropClasse(cId);
                const matchingClass = classes.find((c) => c.classe_id === cId);
                if (matchingClass) {
                  setPropEtab(matchingClass.etablissement_id);
                } else {
                  setPropEtab('');
                }
                setPropMatiere('');
              }}
            >
              <option value="">Sélectionner</option>
              {Array.from(new Set(classes.map((c) => c.classe_id))).map((cId) => {
                const c = classes.find((cl) => cl.classe_id === cId);
                return (
                  <option key={cId} value={cId}>
                    {c.classe_nom} ({c.etablissement_nom})
                  </option>
                );
              })}
            </select>
          </div>

          {propClasse && (
            <div className="input-group">
              <label>Matière</label>
              <select required value={propMatiere} onChange={(e) => setPropMatiere(e.target.value)}>
                <option value="">Sélectionner</option>
                {classes
                  .filter((c) => c.classe_id === propClasse)
                  .map((c) => (
                    <option key={c.matiere_id} value={c.matiere_id}>
                      {c.matiere_nom}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="input-group">
            <label>Type d'Évaluation</label>
            <select required value={propType} onChange={(e) => setPropType(e.target.value)}>
              <option value="DEVOIR">Devoir</option>
              <option value="COMPOSITION">Composition</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Date & Heure</label>
              <input type="datetime-local" required value={propDate} onChange={(e) => setPropDate(e.target.value)} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Salle (Optionnel)</label>
              <input
                type="text"
                placeholder="ex: Salle B1"
                value={propSalle}
                onChange={(e) => setPropSalle(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '16px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowProposeModal(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Soumettre la date
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
