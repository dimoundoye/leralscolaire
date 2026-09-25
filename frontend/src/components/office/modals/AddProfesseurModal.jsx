import { X, Plus } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function AddProfesseurModal({
  SENEGAL_REGIONS_ZONES,
  etablissements,
  handleAddProfesseur,
  newProf,
  setNewProf,
  setShowAddProfModal,
}) {
  return (
    <div className="ob-modal-overlay" onClick={() => setShowAddProfModal(false)}>
      <div className="ob-modal ob-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header">
          <div>
            <h3>Nouveau Professeur / Correcteur National</h3>
            <p>Création d'un profil enseignant avec enregistrement des pièces administratives</p>
          </div>
          <button onClick={() => setShowAddProfModal(false)}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleAddProfesseur} className="ob-modal-body">
          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Civilité / Sexe *</label>
              <select value={newProf.sexe || 'M'} onChange={(e) => setNewProf((f) => ({ ...f, sexe: e.target.value }))}>
                <option value="M">Masculin — Mr.</option>
                <option value="F">Féminin — Mme.</option>
              </select>
            </div>
            <div className="ob-form-group">
              <label>Prénom de l'Enseignant *</label>
              <input
                placeholder="ex: Amadou"
                value={newProf.prenom}
                onChange={(e) => setNewProf((f) => ({ ...f, prenom: e.target.value }))}
                required
              />
            </div>
            <div className="ob-form-group">
              <label>Nom de l'Enseignant *</label>
              <input
                placeholder="ex: Diallo"
                value={newProf.nom}
                onChange={(e) => setNewProf((f) => ({ ...f, nom: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Adresse Email de connexion *</label>
              <input
                type="email"
                placeholder="prof.diallo@education.sn"
                value={newProf.email}
                onChange={(e) => setNewProf((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="ob-form-group">
              <label>Numéro de Téléphone *</label>
              <input
                placeholder="ex: +221 77 000 00 00"
                value={newProf.telephone}
                onChange={(e) => setNewProf((f) => ({ ...f, telephone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Région du Sénégal *</label>
              <select
                value={newProf.region || 'Dakar'}
                onChange={(e) => setNewProf((f) => ({ ...f, region: e.target.value }))}
              >
                {Object.keys(SENEGAL_REGIONS_ZONES).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="ob-form-group">
              <label>Ville / Commune *</label>
              <input
                placeholder="ex: Dakar"
                value={newProf.ville || ''}
                onChange={(e) => setNewProf((f) => ({ ...f, ville: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Discipline / Matière Principale d'enseignement *</label>
              <select
                value={newProf.matiere_principale}
                onChange={(e) => setNewProf((f) => ({ ...f, matiere_principale: e.target.value }))}
              >
                {[
                  'Mathématiques',
                  'Sciences Physiques',
                  'SVT',
                  'Français',
                  'Philosophie',
                  'Anglais',
                  'Histoire-Géo',
                  'Comptabilité',
                  'Économie & Droit',
                ].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="ob-form-group">
              <label>Rattacher à un Établissement</label>
              <select
                value={newProf.etablissement_id}
                onChange={(e) => setNewProf((f) => ({ ...f, etablissement_id: e.target.value }))}
              >
                <option value="">Aucun (Examinateur National Indépendant)</option>
                {etablissements.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom} ({e.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>N° Carte Nationale d'Identité (CNI) *</label>
              <input
                placeholder="ex: 1 757 1994 00291"
                value={newProf.cni_numero || ''}
                onChange={(e) => setNewProf((f) => ({ ...f, cni_numero: e.target.value }))}
              />
            </div>
            <div className="ob-form-group">
              <label>Matricule de la Solde / Réf. Admin</label>
              <input
                placeholder="ex: 649 201/F"
                value={newProf.matricule_solde || ''}
                onChange={(e) => setNewProf((f) => ({ ...f, matricule_solde: e.target.value }))}
              />
            </div>
          </div>

          <div className="ob-form-group">
            <label>Identifiant Unique Enseignant (IUP - optionnel)</label>
            <input
              placeholder="Laisser vide pour auto-générer (ex: PROF-SN-940212)"
              value={newProf.identifiant_national}
              onChange={(e) => setNewProf((f) => ({ ...f, identifiant_national: e.target.value }))}
            />
          </div>

          <div className="ob-modal-footer">
            <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddProfModal(false)}>
              Annuler
            </button>
            <button type="submit" className="ob-btn ob-btn-primary">
              <Plus size={16} /> Enregistrer l'Enseignant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
