import { X, Search, CheckCircle, Plus } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function AddJuryModal({
  ALL_SERIES_OPTIONS,
  SENEGAL_REGIONS_ZONES,
  centresList,
  handleAddJury,
  jurysList,
  newJury,
  profSearchQuery,
  professeursList,
  selectedJurySeries,
  selectedProf,
  setNewJury,
  setProfSearchQuery,
  setSelectedJurySeries,
  setSelectedProf,
  setShowAddJuryModal,
}) {
  return (
    <div className="ob-modal-overlay" onClick={() => setShowAddJuryModal(false)}>
      <div className="ob-modal ob-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header">
          <div>
            <h3>Créer un nouveau Jury & Centre d'Examen</h3>
            <p>Enregistrement dans le registre national des jurys et convocation du Président</p>
          </div>
          <button onClick={() => setShowAddJuryModal(false)}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleAddJury} className="ob-modal-body">
          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Numéro de Jury (ex: 1002) *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    padding: '8px 12px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#475569',
                  }}
                >
                  Jury N°
                </span>
                <input
                  type="number"
                  min="100"
                  max="9999"
                  placeholder="ex: 1002"
                  value={newJury.numero_jury_num || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewJury((f) => ({ ...f, numero_jury_num: val, numero_jury: val ? `Jury ${val}` : '' }));
                  }}
                  required
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="ob-form-group">
              <label>Région *</label>
              <select
                value={newJury.region}
                onChange={(e) => {
                  const reg = e.target.value;
                  const defaultZone = (SENEGAL_REGIONS_ZONES[reg] && SENEGAL_REGIONS_ZONES[reg][0]) || 'Centre';
                  setNewJury((f) => ({
                    ...f,
                    region: reg,
                    zone_commune: defaultZone,
                    centre_examen: '',
                    centre_examen_id: '',
                    centre_secondaire: '',
                  }));
                }}
              >
                {Object.keys(SENEGAL_REGIONS_ZONES).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>
                Centre Principal (Hôte — {newJury.region}) *
              </label>
              <select
                value={newJury.centre_examen}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const foundCentre = centresList.find((c) => c.nom_centre === selectedName);
                  if (foundCentre) {
                    setSelectedJurySeries(foundCentre.series_disponibles || ['S1', 'S2', 'L1', 'L2']);
                    setNewJury((f) => ({
                      ...f,
                      centre_examen_id: foundCentre.id,
                      centre_examen: foundCentre.nom_centre,
                      region: foundCentre.region,
                      zone_commune: foundCentre.zone_commune,
                      series_autorisees: (foundCentre.series_disponibles || ['S1', 'S2', 'L1', 'L2']).join(', '),
                    }));
                  } else {
                    setNewJury((f) => ({ ...f, centre_examen: selectedName }));
                  }
                }}
                required
              >
                <option value="">-- Sélectionnez un Centre Principal ({newJury.region}) --</option>
                {centresList
                  .filter(
                    (c) =>
                      (c.type_centre || 'PRINCIPAL') === 'PRINCIPAL' && (!newJury.region || c.region === newJury.region)
                  )
                  .map((c) => (
                    <option key={c.id} value={c.nom_centre}>
                      {c.nom_centre} ({c.zone_commune})
                    </option>
                  ))}
              </select>
              {newJury.centre_examen &&
                (() => {
                  const existingInSameCentre = jurysList.filter((j) => j.centre_examen === newJury.centre_examen);
                  if (existingInSameCentre.length > 0) {
                    return (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: '#0369a1',
                          background: '#e0f2fe',
                          padding: '6px 10px',
                          borderRadius: 6,
                          marginTop: 6,
                          fontWeight: 600,
                        }}
                      >
                        Ce centre hôte héberge déjà <strong>{existingInSameCentre.length} jury(s)</strong> :{' '}
                        {existingInSameCentre.map((j) => j.numero_jury).join(', ')}
                      </div>
                    );
                  }
                  return null;
                })()}
            </div>

            <div className="ob-form-group">
              <label style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>
                Centre Secondaire Rattaché ({newJury.region})
              </label>
              <select
                value={newJury.centre_secondaire || ''}
                onChange={(e) => setNewJury((f) => ({ ...f, centre_secondaire: e.target.value }))}
              >
                <option value="">-- Aucun (Tous composent au Centre Principal) --</option>
                {centresList
                  .filter((c) => c.type_centre === 'SECONDAIRE' && (!newJury.region || c.region === newJury.region))
                  .map((cs) => (
                    <option key={cs.id} value={cs.nom_centre}>
                      {cs.nom_centre} ({cs.zone_commune})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="ob-form-group">
            <label>Séries prises en charge par ce jury (Cochez les séries concernées) *</label>
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
                const isChecked = selectedJurySeries.includes(s);
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
                        let updated = [...selectedJurySeries];
                        if (e.target.checked) {
                          if (!updated.includes(s)) updated.push(s);
                        } else {
                          updated = updated.filter((item) => item !== s);
                        }
                        setSelectedJurySeries(updated);
                        setNewJury((f) => ({ ...f, series_autorisees: updated.join(', ') }));
                      }}
                    />
                    {s}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="ob-form-group">
            <label>Désigner le Président de Jury (Recherche en temps réel par Nom, Prénom ou Matricule) *</label>
            {!selectedProf ? (
              <div style={{ position: 'relative' }}>
                <div className="ob-eleve-search-wrap">
                  <Search size={15} />
                  <input
                    placeholder="Tapez le nom, prénom, discipline ou matricule (ex: Diallo, PROF-SN-…)"
                    value={profSearchQuery}
                    onChange={(e) => setProfSearchQuery(e.target.value)}
                  />
                </div>
                {(() => {
                  const q = profSearchQuery.toLowerCase().trim();
                  const cleanQ = q.replace(/[\s-]/g, '');
                  const filtered = professeursList.filter((p) => {
                    const nom = (p.nom || '').toLowerCase();
                    const prenom = (p.prenom || '').toLowerCase();
                    const ine = (p.identifiant_national || '').toLowerCase();
                    const ineClean = ine.replace(/[\s-]/g, '');
                    const matiere = (p.matiere_principale || '').toLowerCase();
                    const email = (p.email || '').toLowerCase();

                    return (
                      nom.includes(q) ||
                      prenom.includes(q) ||
                      ine.includes(q) ||
                      (cleanQ.length > 0 && ineClean.includes(cleanQ)) ||
                      matiere.includes(q) ||
                      email.includes(q)
                    );
                  });

                  return (
                    <div className="ob-eleve-dropdown" style={{ maxHeight: 220, overflowY: 'auto' }}>
                      {filtered.length > 0 ? (
                        filtered.slice(0, 10).map((p) => (
                          <div
                            key={p.id}
                            className="ob-eleve-option"
                            onClick={() => {
                              setSelectedProf(p);
                              setProfSearchQuery('');
                              setNewJury((f) => ({
                                ...f,
                                president_prof_id: p.id,
                                president_jury: `Pr. ${p.prenom || ''} ${p.nom || ''}`.trim(),
                              }));
                            }}
                          >
                            <strong>
                              Pr. {p.prenom || ''} {p.nom || ''}
                            </strong>
                            <span>
                              <code>{p.identifiant_national || 'PROF'}</code> · {p.matiere_principale || 'Enseignant'} (
                              {p.region || 'Sénégal'})
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                          Aucun enseignant trouvé pour "{profSearchQuery}"
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="ob-selected-eleve">
                <CheckCircle size={15} style={{ color: '#15803d' }} />
                <span>
                  <strong>
                    {selectedProf.sexe === 'F' ? 'Mme.' : 'Mr.'} {selectedProf.prenom} {selectedProf.nom}
                  </strong>{' '}
                  — <code>{selectedProf.identifiant_national || 'PROF-SN'}</code> (
                  {selectedProf.matiere_principale || 'Général'} · {selectedProf.region || 'Sénégal'})
                </span>
                <button type="button" onClick={() => setSelectedProf(null)}>
                  <X size={14} />
                </button>
              </div>
            )}
            <span style={{ fontSize: 11, color: '#0284c7', marginTop: 6, display: 'block' }}>
              Une convocation officielle pré-rédigée sera automatiquement transmise dans la messagerie et l'email du
              professeur désigné.
            </span>
          </div>

          <div className="ob-modal-footer">
            <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddJuryModal(false)}>
              Annuler
            </button>
            <button type="submit" className="ob-btn ob-btn-primary">
              <Plus size={16} /> Enregistrer le Jury
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
