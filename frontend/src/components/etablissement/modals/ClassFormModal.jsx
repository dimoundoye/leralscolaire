import { Loader2 } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function ClassFormModal({
  editingClass,
  handleAddClass,
  loading,
  newClass,
  setEditingClass,
  setNewClass,
  setShowClassModal,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{editingClass ? 'Modifier la Classe' : 'Nouvelle Classe'}</h3>
        <form onSubmit={handleAddClass}>
          <div className="input-group">
            <label>Nom de la classe</label>
            <input
              type="text"
              required
              value={editingClass ? editingClass.nom : newClass.nom}
              onChange={(e) =>
                editingClass
                  ? setEditingClass({ ...editingClass, nom: e.target.value })
                  : setNewClass({ ...newClass, nom: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <label>Niveau</label>
            <select
              value={editingClass ? editingClass.niveau : newClass.niveau}
              onChange={(e) =>
                editingClass
                  ? setEditingClass({ ...editingClass, niveau: e.target.value })
                  : setNewClass({ ...newClass, niveau: e.target.value })
              }
            >
              <option value="6ème">6ème</option>
              <option value="5ème">5ème</option>
              <option value="4ème">4ème</option>
              <option value="3ème">3ème</option>
              <option value="Seconde">Seconde</option>
              <option value="Première">Première</option>
              <option value="Terminale">Terminale</option>
            </select>
          </div>
          <div className="input-group">
            <label>Année Scolaire</label>
            <select
              value={editingClass ? editingClass.annee_scolaire : newClass.annee_scolaire}
              onChange={(e) =>
                editingClass
                  ? setEditingClass({ ...editingClass, annee_scolaire: e.target.value })
                  : setNewClass({ ...newClass, annee_scolaire: e.target.value })
              }
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowClassModal(false);
                setEditingClass(null);
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
