import { Loader2 } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function MatiereFormModal({
  editingMatiere,
  handleAddMatiere,
  loading,
  newMatiere,
  setEditingMatiere,
  setNewMatiere,
  setShowMatiereModal,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{editingMatiere ? 'Modifier la Matière' : 'Nouvelle Matière'}</h3>
        <form onSubmit={handleAddMatiere}>
          <div className="input-group">
            <label>Nom de la matière</label>
            <input
              type="text"
              required
              value={editingMatiere ? editingMatiere.nom : newMatiere.nom}
              onChange={(e) =>
                editingMatiere
                  ? setEditingMatiere({ ...editingMatiere, nom: e.target.value })
                  : setNewMatiere({ ...newMatiere, nom: e.target.value })
              }
              placeholder="ex: Physique-Chimie"
            />
          </div>
          <div className="input-group">
            <label>Code (Optionnel)</label>
            <input
              type="text"
              value={editingMatiere ? editingMatiere.code_matiere : newMatiere.code}
              onChange={(e) =>
                editingMatiere
                  ? setEditingMatiere({ ...editingMatiere, code_matiere: e.target.value })
                  : setNewMatiere({ ...newMatiere, code: e.target.value })
              }
              placeholder="ex: PC"
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowMatiereModal(false);
                setEditingMatiere(null);
              }}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
