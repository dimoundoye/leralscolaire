// Fenêtre modale extraite de Dashboard.jsx
export default function PreInscriptionModal({
  editingPreInscription,
  handleUpdatePreInscription,
  setEditingPreInscription,
  setShowPreModal,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Modifier la demande d'inscription</h2>
        <form onSubmit={handleUpdatePreInscription}>
          <div className="form-row">
            <div className="input-group">
              <label>Prénom</label>
              <input
                type="text"
                value={editingPreInscription.prenom}
                onChange={(e) => setEditingPreInscription({ ...editingPreInscription, prenom: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Nom</label>
              <input
                type="text"
                value={editingPreInscription.nom}
                onChange={(e) => setEditingPreInscription({ ...editingPreInscription, nom: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Date de naissance</label>
              <input
                type="date"
                value={editingPreInscription.date_naissance ? editingPreInscription.date_naissance.split('T')[0] : ''}
                onChange={(e) => setEditingPreInscription({ ...editingPreInscription, date_naissance: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Lieu de naissance</label>
              <input
                type="text"
                value={editingPreInscription.lieu_naissance || ''}
                onChange={(e) => setEditingPreInscription({ ...editingPreInscription, lieu_naissance: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Civilité / Sexe</label>
              <select
                value={editingPreInscription.sexe || 'M'}
                onChange={(e) => setEditingPreInscription({ ...editingPreInscription, sexe: e.target.value })}
              >
                <option value="M">Masculin (M.)</option>
                <option value="F">Féminin (Mme / Mlle)</option>
              </select>
            </div>
            <div className="input-group">
              <label>Nationalité</label>
              <input
                type="text"
                value={editingPreInscription.nationalite || ''}
                onChange={(e) => setEditingPreInscription({ ...editingPreInscription, nationalite: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Téléphone</label>
              <input
                type="text"
                value={editingPreInscription.telephone || ''}
                onChange={(e) => setEditingPreInscription({ ...editingPreInscription, telephone: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Aptitude Physique</label>
            <select
              value={editingPreInscription.statut || 'APTE'}
              onChange={(e) => setEditingPreInscription({ ...editingPreInscription, statut: e.target.value })}
            >
              <option value="APTE">Apte</option>
              <option value="INAPTE">Inapte</option>
            </select>
          </div>

          {editingPreInscription.identifiant_existant && (
            <div className="input-group">
              <label>Identifiant National Existant (Transfert)</label>
              <input
                type="text"
                value={editingPreInscription.identifiant_existant}
                onChange={(e) =>
                  setEditingPreInscription({ ...editingPreInscription, identifiant_existant: e.target.value })
                }
                required
              />
            </div>
          )}

          <div className="input-group">
            <label>Coordonnées du Parent</label>
            <textarea
              rows="3"
              value={editingPreInscription.coordonnees_parent || ''}
              onChange={(e) =>
                setEditingPreInscription({ ...editingPreInscription, coordonnees_parent: e.target.value })
              }
              required
            />
          </div>

          <div className="form-actions" style={{ marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowPreModal(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
