import { X, Save } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function AddCentreModal({
  ALL_SERIES_OPTIONS,
  SENEGAL_REGIONS_ZONES,
  centresList,
  editingCentre,
  handleSaveCentre,
  newCentre,
  setNewCentre,
  setShowAddCentreModal,
}) {
  return (
    <div className="ob-modal-overlay" onClick={() => setShowAddCentreModal(false)}>
      <div className="ob-modal ob-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header">
          <div>
            <h3>{editingCentre ? "Modifier le Centre d'Examen" : "Pré-configurer un Centre d'Examen"}</h3>
            <p>Définissez les paramètres du Centre Principal (Hôte) ou du Centre Secondaire rattaché</p>
          </div>
          <button onClick={() => setShowAddCentreModal(false)}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSaveCentre} className="ob-modal-body">
          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Type de Centre *</label>
              <select
                value={newCentre.type_centre || 'PRINCIPAL'}
                onChange={(e) => setNewCentre((f) => ({ ...f, type_centre: e.target.value }))}
              >
                <option value="PRINCIPAL">Centre Principal (Établissement Hôte / Siège de Jury)</option>
                <option value="SECONDAIRE">Centre Secondaire (Centre Rattaché d'Épreuves Écrites)</option>
              </select>
            </div>

            {newCentre.type_centre === 'SECONDAIRE' && (
              <div className="ob-form-group">
                <label>Rattacher au Centre Principal *</label>
                <select
                  value={newCentre.centre_principal_id || ''}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const parent = centresList.find((c) => c.id == pid);
                    setNewCentre((f) => ({
                      ...f,
                      centre_principal_id: pid,
                      region: parent ? parent.region : f.region,
                      zone_commune: parent ? parent.zone_commune : f.zone_commune,
                    }));
                  }}
                  required
                >
                  <option value="">-- Sélectionner le Centre Principal Hôte --</option>
                  {centresList
                    .filter((c) => (c.type_centre || 'PRINCIPAL') === 'PRINCIPAL')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom_centre} ({p.region} — {p.zone_commune})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <div className="ob-form-group">
            <label>Nom du Centre d'Examen *</label>
            <input
              placeholder={
                newCentre.type_centre === 'SECONDAIRE'
                  ? 'ex: CEM Ababacar Sy (Centre Secondaire)'
                  : 'ex: Lycée Seydina Limamou Laye'
              }
              value={newCentre.nom_centre}
              onChange={(e) => setNewCentre((f) => ({ ...f, nom_centre: e.target.value }))}
              required
            />
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Région *</label>
              <select
                value={newCentre.region}
                onChange={(e) => {
                  const reg = e.target.value;
                  const defaultZone = (SENEGAL_REGIONS_ZONES[reg] && SENEGAL_REGIONS_ZONES[reg][0]) || 'Centre';
                  setNewCentre((f) => ({ ...f, region: reg, zone_commune: defaultZone }));
                }}
              >
                {Object.keys(SENEGAL_REGIONS_ZONES).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="ob-form-group">
              <label>Zone / Commune *</label>
              <select
                value={newCentre.zone_commune}
                onChange={(e) => setNewCentre((f) => ({ ...f, zone_commune: e.target.value }))}
              >
                {(SENEGAL_REGIONS_ZONES[newCentre.region] || ['Centre']).map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ob-form-group">
            <label>Effectif Prévisionnel de Candidats (Capacité)</label>
            <input
              type="number"
              min="0"
              placeholder="ex: 500"
              value={newCentre.effectif_previsionnel}
              onChange={(e) => setNewCentre((f) => ({ ...f, effectif_previsionnel: e.target.value }))}
            />
          </div>

          <div className="ob-form-group">
            <label>Séries Disponibles / Autorisées dans ce Centre *</label>
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginTop: 6,
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
              }}
            >
              {ALL_SERIES_OPTIONS.map((s) => {
                const isChecked = (newCentre.series_disponibles || []).includes(s);
                return (
                  <label
                    key={s}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: isChecked ? '#e0f2fe' : '#ffffff',
                      color: isChecked ? '#0369a1' : '#475569',
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: isChecked ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        let updated = [...(newCentre.series_disponibles || [])];
                        if (e.target.checked) {
                          if (!updated.includes(s)) updated.push(s);
                        } else {
                          updated = updated.filter((item) => item !== s);
                        }
                        setNewCentre((f) => ({ ...f, series_disponibles: updated }));
                      }}
                    />
                    {s}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="ob-modal-footer">
            <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddCentreModal(false)}>
              Annuler
            </button>
            <button type="submit" className="ob-btn ob-btn-primary">
              <Save size={16} /> {editingCentre ? 'Enregistrer les Modifications' : "Créer le Centre d'Examen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
