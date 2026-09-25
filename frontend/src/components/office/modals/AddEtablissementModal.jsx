import { X, Plus } from 'lucide-react';
import { REFERENTIEL_IA_IEF, getIasByRegion, getIefsByIa } from '../../../utils/referentielIaIef';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function AddEtablissementModal({
  handleAddEtablissement,
  handleEtabIaChange,
  handleEtabRegionChange,
  newEtab,
  setNewEtab,
  setShowAddEtabModal,
}) {
  return (
    <div className="ob-modal-overlay" onClick={() => setShowAddEtabModal(false)}>
      <div className="ob-modal ob-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header">
          <div>
            <h3>Nouvel Établissement (Lycée / Centre d'Examen)</h3>
            <p>Enregistrement d'un établissement scolaire et création de l'accès administrateur</p>
          </div>
          <button onClick={() => setShowAddEtabModal(false)}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleAddEtablissement} className="ob-modal-body">
          <div className="ob-form-group">
            <label>Nom Officiel de l'Établissement *</label>
            <input
              placeholder="ex: Lycée Lamine Guèye"
              value={newEtab.nom}
              onChange={(e) => setNewEtab((f) => ({ ...f, nom: e.target.value }))}
              required
            />
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Adresse Email de Contact *</label>
              <input
                type="email"
                placeholder="ex: contact@education.sn"
                value={newEtab.admin_email}
                onChange={(e) => setNewEtab((f) => ({ ...f, admin_email: e.target.value }))}
                required
              />
            </div>
            <div className="ob-form-group">
              <label>Numéro de Téléphone *</label>
              <input
                placeholder="ex: +221 33 800 00 00"
                value={newEtab.telephone || ''}
                onChange={(e) => setNewEtab((f) => ({ ...f, telephone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Région du Sénégal *</label>
              <select value={newEtab.region} onChange={(e) => handleEtabRegionChange(e.target.value)}>
                {REFERENTIEL_IA_IEF.map((r) => (
                  <option key={r.region} value={r.region}>
                    {r.region}
                  </option>
                ))}
              </select>
            </div>
            <div className="ob-form-group">
              <label>Inspection d'Académie (IA) *</label>
              <select value={newEtab.ia_nom || ''} onChange={(e) => handleEtabIaChange(e.target.value)} required>
                {getIasByRegion(newEtab.region).map((ia) => (
                  <option key={ia} value={ia}>
                    {ia}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Inspection de l'Éducation et de la Formation (IEF) *</label>
              <select
                value={newEtab.ief_nom || ''}
                onChange={(e) => setNewEtab((f) => ({ ...f, ief_nom: e.target.value }))}
                required
              >
                {getIefsByIa(newEtab.ia_nom).map((ief) => (
                  <option key={ief} value={ief}>
                    {ief}
                  </option>
                ))}
              </select>
            </div>
            <div className="ob-form-group">
              <label>Ville / Commune *</label>
              <input
                placeholder="ex: Dakar"
                value={newEtab.ville}
                onChange={(e) => setNewEtab((f) => ({ ...f, ville: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="ob-form-group">
            <label>Code Établissement (Si déjà attribué - optionnel)</label>
            <input
              placeholder="Optionnel — Laisser vide pour auto-génération (ex: ETAB-DKR-4892)"
              value={newEtab.code_etablissement}
              onChange={(e) => setNewEtab((f) => ({ ...f, code_etablissement: e.target.value }))}
            />
          </div>

          <div className="ob-form-group">
            <label>N° Arrêté / Autorisation d'Ouverture MEN *</label>
            <input
              placeholder="ex: Arrêté ministériel N° 004892/MEN/SG"
              value={newEtab.autorisation_numero || ''}
              onChange={(e) => setNewEtab((f) => ({ ...f, autorisation_numero: e.target.value }))}
              required
            />
          </div>

          <div className="ob-modal-footer">
            <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddEtabModal(false)}>
              Annuler
            </button>
            <button type="submit" className="ob-btn ob-btn-primary">
              <Plus size={16} /> Générer les Accès Établissement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
