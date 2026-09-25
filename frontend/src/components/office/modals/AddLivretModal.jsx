import { BookOpen, X, Search, CheckCircle, Send } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function AddLivretModal({
  eleveResults,
  eleveSearch,
  handleAddLivret,
  newLivret,
  searchEleves,
  selectedEleve,
  setEleveResults,
  setEleveSearch,
  setNewLivret,
  setSelectedEleve,
  setShowAddLivretModal,
}) {
  return (
    <div className="ob-modal-overlay" onClick={() => setShowAddLivretModal(false)}>
      <div className="ob-modal ob-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} /> Transmettre un Livret Scolaire du BAC
          </h3>
          <button onClick={() => setShowAddLivretModal(false)}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleAddLivret} className="ob-modal-body">
          <div className="ob-form-group">
            <label>Rechercher le candidat élève *</label>
            <div className="ob-eleve-search-wrap">
              <Search size={15} />
              <input
                placeholder="Nom, prénom ou identifiant unique (IUP)…"
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
                  — {selectedEleve.identifiant_national} ({selectedEleve.etablissement_nom})
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
              <label>Série BAC *</label>
              <select value={newLivret.serie} onChange={(e) => setNewLivret((f) => ({ ...f, serie: e.target.value }))}>
                {['S1', 'S2', 'S3', 'L1', 'L2', 'G', 'STEG', 'T'].map((s) => (
                  <option key={s} value={s}>
                    Série {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="ob-form-group">
              <label>Session *</label>
              <input
                type="number"
                value={newLivret.annee}
                onChange={(e) => setNewLivret((f) => ({ ...f, annee: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Moyenne Classe de Seconde (/20)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="20"
                placeholder="ex: 13.50"
                value={newLivret.moyenne_seconde}
                onChange={(e) => setNewLivret((f) => ({ ...f, moyenne_seconde: e.target.value }))}
              />
            </div>
            <div className="ob-form-group">
              <label>Moyenne Classe de Première (/20)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="20"
                placeholder="ex: 14.25"
                value={newLivret.moyenne_premiere}
                onChange={(e) => setNewLivret((f) => ({ ...f, moyenne_premiere: e.target.value }))}
              />
            </div>
            <div className="ob-form-group">
              <label>Moyenne Classe de Terminale (/20) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="20"
                placeholder="ex: 15.00"
                value={newLivret.moyenne_terminale}
                onChange={(e) => setNewLivret((f) => ({ ...f, moyenne_terminale: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="ob-form-group">
            <label>Appréciation Générale du Conseil de Classe</label>
            <textarea
              rows={3}
              placeholder="Appréciation synthétique sur l'assiduité, le comportement et le travail du candidat pendant son cursus secondaire…"
              value={newLivret.appreciation_conseil}
              onChange={(e) => setNewLivret((f) => ({ ...f, appreciation_conseil: e.target.value }))}
            />
          </div>

          <div className="ob-modal-footer">
            <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddLivretModal(false)}>
              Annuler
            </button>
            <button type="submit" className="ob-btn ob-btn-primary">
              <Send size={16} /> Transmettre au Jury du BAC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
