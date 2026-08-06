import React from 'react';
import { Plus, RefreshCw, Building, MapPin, Users, Search, Edit3, Trash2 } from 'lucide-react';

export const OfficeCentresTab = ({
  examenMode,
  centresList = [],
  centreSearchQuery,
  setCentreSearchQuery,
  centreTypeFilter,
  setCentreTypeFilter,
  centreRegionFilter,
  setCentreRegionFilter,
  SENEGAL_REGIONS_ZONES = {},
  fetchCentres,
  setEditingCentre,
  setNewCentre,
  setShowAddCentreModal,
  handleDeleteCentre
}) => {
  const filteredCentres = centresList.filter(c => {
    const q = centreSearchQuery.toLowerCase().trim();
    const matchQ = !q ||
      (c.nom_centre || '').toLowerCase().includes(q) ||
      (c.region || '').toLowerCase().includes(q) ||
      (c.zone_commune || '').toLowerCase().includes(q) ||
      (c.centre_principal_nom || '').toLowerCase().includes(q);
    const matchRegion = !centreRegionFilter || c.region === centreRegionFilter;
    const matchType = !centreTypeFilter || (c.type_centre || 'PRINCIPAL') === centreTypeFilter;
    return matchQ && matchRegion && matchType;
  });

  const totalEffectif = centresList.reduce((acc, curr) => acc + (parseInt(curr.effectif_previsionnel) || 0), 0);
  const regionsSet = new Set(centresList.map(c => c.region));
  const principauxCount = centresList.filter(c => (c.type_centre || 'PRINCIPAL') === 'PRINCIPAL').length;
  const secondairesCount = centresList.filter(c => c.type_centre === 'SECONDAIRE').length;

  return (
    <div className="ob-tab-pane">
      <div className="ob-page-header">
        <div>
          <h2>Centres d'Examen Pré-configurés ({examenMode})</h2>
          <p>Définition des Établissements Hôtes (Centres Principaux) et des Centres Secondaires rattachés pour désenclaver les candidats</p>
        </div>
        <div className="ob-page-header-right" style={{ display: 'flex', gap: 8 }}>
          <button className="ob-btn ob-btn-ghost" onClick={fetchCentres}><RefreshCw size={15} /> Actualiser</button>
          <button className="ob-btn ob-btn-primary" onClick={() => {
            setEditingCentre(null);
            setNewCentre({ nom_centre: '', type_centre: 'PRINCIPAL', centre_principal_id: '', region: 'Dakar', zone_commune: 'Dakar Plateau', effectif_previsionnel: 500, series_disponibles: ['S1', 'S2', 'L1', 'L2'] });
            setShowAddCentreModal(true);
          }}>
            <Plus size={16} /> Pré-configurer un Centre
          </button>
        </div>
      </div>

      {/* CARTE STATISTIQUES DES CENTRES */}
      <div className="ob-stats-grid mb-6">
        <div className="ob-stat-card ob-stat-total">
          <div className="ob-stat-icon"><Building size={20} /></div>
          <div>
            <div className="ob-stat-num">{principauxCount}</div>
            <div className="ob-stat-label">Centres Principaux (Hôtes)</div>
          </div>
        </div>

        <div className="ob-stat-card ob-stat-taux">
          <div className="ob-stat-icon"><MapPin size={20} /></div>
          <div>
            <div className="ob-stat-num">{secondairesCount}</div>
            <div className="ob-stat-label">Centres Secondaires Rattachés</div>
          </div>
        </div>

        <div className="ob-stat-card ob-stat-admis">
          <div className="ob-stat-icon"><Users size={20} /></div>
          <div>
            <div className="ob-stat-num">{totalEffectif.toLocaleString('fr-FR')}</div>
            <div className="ob-stat-label">Effectif Cumulé Prévisionnel</div>
          </div>
        </div>
      </div>

      {/* RECHERCHE ET FILTRES */}
      <div className="ob-filters-bar mb-4">
        <div className="ob-search-wrap">
          <Search size={16} />
          <input
            placeholder="Rechercher un centre principal, secondaire, région ou zone…"
            value={centreSearchQuery}
            onChange={e => setCentreSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={centreTypeFilter}
          onChange={e => setCentreTypeFilter(e.target.value)}
        >
          <option value="">Tous les types ({centresList.length})</option>
          <option value="PRINCIPAL">Centres Principaux ({principauxCount})</option>
          <option value="SECONDAIRE">Centres Secondaires ({secondairesCount})</option>
        </select>

        <select
          value={centreRegionFilter}
          onChange={e => setCentreRegionFilter(e.target.value)}
        >
          <option value="">Toutes les régions ({regionsSet.size})</option>
          {Object.keys(SENEGAL_REGIONS_ZONES).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* TABLEAU DES CENTRES */}
      <div className="ob-table-wrap">
        <table className="ob-table" style={{ fontSize: 12 }}>
          <thead>
            <tr>
              <th>Statut du Centre</th>
              <th>Nom du Centre d'Examen</th>
              <th>Centre Principal de Rattachement</th>
              <th>Région &amp; Zone</th>
              <th>Effectif Prévisionnel</th>
              <th>Séries Autorisées</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCentres.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Aucun centre d'examen trouvé.</td></tr>
            ) : (
              filteredCentres.map(c => {
                const isSecondaire = c.type_centre === 'SECONDAIRE';
                return (
                  <tr key={c.id}>
                    <td>
                      {isSecondaire ? (
                        <span style={{ background: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe', padding: '3px 8px', borderRadius: 16, fontSize: 10.5, fontWeight: 700 }}>
                          Centre Secondaire
                        </span>
                      ) : (
                        <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '3px 8px', borderRadius: 16, fontSize: 10.5, fontWeight: 700 }}>
                          Centre Principal
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: 13, fontWeight: 600 }}>{c.nom_centre}</strong>
                    </td>
                    <td>
                      {isSecondaire ? (
                        <span style={{ color: '#0284c7', fontSize: 12, fontWeight: 600 }}>{c.centre_principal_nom || 'Centre Principal'}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 11.5 }}>— (Centre Hôte)</span>
                      )}
                    </td>
                    <td>
                      <div><span className="ob-badge ob-badge-region" style={{ fontSize: 10.5, padding: '2px 6px' }}>{c.region}</span></div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{c.zone_commune}</div>
                    </td>
                    <td>
                      <strong style={{ color: '#334155', fontSize: 12.5 }}>{c.effectif_previsionnel ? c.effectif_previsionnel + ' candidats' : '—'}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(c.series_disponibles || ['S1', 'S2', 'L1', 'L2']).map(s => (
                          <span key={s} style={{ background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="ob-btn ob-btn-ghost ob-btn-sm"
                          style={{ padding: '3px 8px', fontSize: 11 }}
                          onClick={() => {
                            setEditingCentre(c);
                            setNewCentre({
                              nom_centre: c.nom_centre,
                              type_centre: c.type_centre || 'PRINCIPAL',
                              centre_principal_id: c.centre_principal_id || '',
                              region: c.region,
                              zone_commune: c.zone_commune,
                              effectif_previsionnel: c.effectif_previsionnel || 500,
                              series_disponibles: c.series_disponibles || ['S1', 'S2', 'L1', 'L2']
                            });
                            setShowAddCentreModal(true);
                          }}
                        >
                          <Edit3 size={13} /> Modifier
                        </button>
                        <button
                          className="ob-btn ob-btn-ghost ob-btn-sm"
                          style={{ padding: '3px 8px', fontSize: 11, color: '#ef4444' }}
                          onClick={() => handleDeleteCentre(c.id)}
                        >
                          <Trash2 size={13} /> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfficeCentresTab;
