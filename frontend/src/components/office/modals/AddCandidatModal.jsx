import { X, Search, CheckCircle, Plus } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function AddCandidatModal({
  eleveResults,
  eleveSearch,
  handleAddCandidat,
  jurysList,
  newCandidat,
  searchEleves,
  selectedEleve,
  setEleveResults,
  setEleveSearch,
  setNewCandidat,
  setSelectedEleve,
  setShowAddModal,
}) {
  return (
    <div className="ob-modal-overlay" onClick={() => setShowAddModal(false)}>
      <div className="ob-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header">
          <h3>Nouveau Candidat</h3>
          <button onClick={() => setShowAddModal(false)}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleAddCandidat} className="ob-modal-body">
          <div className="ob-form-group">
            <label>Rechercher l'élève *</label>
            <div className="ob-eleve-search-wrap">
              <Search size={15} />
              <input
                placeholder="Nom, prénom ou identifiant national…"
                value={eleveSearch}
                onChange={(e) => {
                  setEleveSearch(e.target.value);
                  searchEleves(e.target.value);
                }}
              />
            </div>
            {eleveResults.length > 0 && !selectedEleve && (
              <div className="ob-eleve-dropdown">
                {eleveResults.map((el) => (
                  <div
                    key={el.id}
                    className="ob-eleve-option"
                    onClick={() => {
                      setSelectedEleve(el);
                      setEleveSearch(`${el.prenom} ${el.nom}`);
                      setEleveResults([]);
                    }}
                  >
                    <strong>
                      {el.prenom} {el.nom}
                    </strong>
                    <span>
                      {el.identifiant_national} · {el.etablissement_nom}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {selectedEleve && (
              <div className="ob-selected-eleve">
                <CheckCircle size={14} style={{ color: '#15803d' }} />
                <span>
                  <strong>
                    {selectedEleve.prenom} {selectedEleve.nom}
                  </strong>{' '}
                  — {selectedEleve.identifiant_national}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEleve(null);
                    setEleveSearch('');
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Type de candidat *</label>
              <select
                value={newCandidat.type_candidat}
                onChange={(e) => setNewCandidat((f) => ({ ...f, type_candidat: e.target.value }))}
              >
                <option value="Scolaire">Scolaire (Issu d'établissement)</option>
                <option value="Candidat Libre">Candidat Libre</option>
              </select>
            </div>
            <div className="ob-form-group">
              <label>Redoublant ?</label>
              <select
                value={newCandidat.statut_redoublant}
                onChange={(e) => setNewCandidat((f) => ({ ...f, statut_redoublant: e.target.value === 'true' }))}
              >
                <option value="false">Non (Nouveau)</option>
                <option value="true">Oui (Redoublant)</option>
              </select>
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Type d'examen *</label>
              <select
                value={newCandidat.type_examen}
                onChange={(e) => setNewCandidat((f) => ({ ...f, type_examen: e.target.value }))}
              >
                <option value="BAC">BAC</option>
                <option value="BFEM">BFEM</option>
              </select>
            </div>
            <div className="ob-form-group">
              <label>Année *</label>
              <input
                type="number"
                value={newCandidat.annee}
                onChange={(e) => setNewCandidat((f) => ({ ...f, annee: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>N° de table</label>
              <input
                placeholder="Laisser vide pour auto-générer"
                value={newCandidat.numero_table}
                onChange={(e) => setNewCandidat((f) => ({ ...f, numero_table: e.target.value }))}
              />
            </div>
            <div className="ob-form-group">
              <label>Série *</label>
              <select
                value={newCandidat.serie}
                onChange={(e) => setNewCandidat((f) => ({ ...f, serie: e.target.value }))}
              >
                {['S1', 'S2', 'S3', 'L1', 'L2', 'G', 'STEG', 'T'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Jury Officiel (Préréglé par l'Office du BAC) *</label>
              <select
                value={newCandidat.jury}
                onChange={(e) => {
                  const selectedJ = jurysList.find((j) => j.numero_jury === e.target.value);
                  setNewCandidat((f) => ({
                    ...f,
                    jury: e.target.value,
                    centre_examen: selectedJ ? selectedJ.centre_examen : f.centre_examen,
                    region: selectedJ ? selectedJ.region : f.region,
                  }));
                }}
              >
                <option value="">Sélectionnez un Jury édité par l'Office du BAC</option>
                {jurysList
                  .filter((j) => !newCandidat.region || j.region === newCandidat.region)
                  .map((j) => (
                    <option key={j.id} value={j.numero_jury}>
                      {j.numero_jury} — {j.centre_examen} ({j.region} - {j.zone_commune || ''})
                    </option>
                  ))}
              </select>
            </div>
            <div className="ob-form-group">
              <label>Centre d'examen</label>
              <input placeholder="Centre d'examen lié au jury" value={newCandidat.centre_examen} readOnly />
            </div>
          </div>

          <div className="ob-form-group">
            <label>Aménagement Handicap / Tiers-temps</label>
            <input
              placeholder="ex: Tiers-temps (+1/3), Assistance scripteur..."
              value={newCandidat.amenagement_handicap}
              onChange={(e) => setNewCandidat((f) => ({ ...f, amenagement_handicap: e.target.value }))}
            />
          </div>

          <div className="ob-modal-footer">
            <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddModal(false)}>
              Annuler
            </button>
            <button type="submit" className="ob-btn ob-btn-primary">
              <Plus size={16} /> Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
