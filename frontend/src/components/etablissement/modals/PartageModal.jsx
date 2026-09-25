import { Loader2 } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function PartageModal({
  eleves,
  fetchPartageEtab,
  handleSendPartage,
  loading,
  partageDescription,
  partageEleveId,
  partageFile,
  partageResults,
  partageSearch,
  selectedPartageEtab,
  setPartageDescription,
  setPartageEleveId,
  setPartageFile,
  setPartageResults,
  setPartageSearch,
  setSelectedPartageEtab,
  setShowPartageModal,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '500px' }}>
        <h3>Partager un Document</h3>
        <form onSubmit={handleSendPartage}>
          <div className="input-group">
            <label>Établissement destinataire</label>
            <input
              type="text"
              placeholder="Rechercher un établissement..."
              value={partageSearch}
              onChange={(e) => {
                setPartageSearch(e.target.value);
                setSelectedPartageEtab(null);
                fetchPartageEtab(e.target.value);
              }}
            />
            {partageResults.length > 0 && (
              <div className="autocomplete-list">
                {partageResults.map((etab) => (
                  <div
                    key={etab.id}
                    className={`autocomplete-item ${selectedPartageEtab?.id === etab.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPartageEtab(etab);
                      setPartageSearch(`${etab.nom} - ${etab.ville}`);
                      setPartageResults([]);
                    }}
                  >
                    {etab.nom} <small>({etab.ville})</small>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="input-group">
            <label>Élève (optionnel)</label>
            <select value={partageEleveId} onChange={(e) => setPartageEleveId(e.target.value)}>
              <option value="">Aucun élève spécifique</option>
              {eleves.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom} {e.prenom}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Fichier</label>
            <input type="file" required onChange={(e) => setPartageFile(e.target.files[0])} />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea
              rows="3"
              style={{ width: '100%', borderRadius: '10px', padding: '0.8rem', border: '2px solid #E2E8F0' }}
              value={partageDescription}
              onChange={(e) => setPartageDescription(e.target.value)}
              placeholder="Description optionnelle..."
            ></textarea>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowPartageModal(false);
                setPartageResults([]);
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !selectedPartageEtab || !partageFile}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Partager'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
