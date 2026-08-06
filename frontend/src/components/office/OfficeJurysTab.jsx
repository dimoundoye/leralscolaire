import React from 'react';
import { Plus, RefreshCw, Zap, Clock, CheckCircle, Search, Award } from 'lucide-react';

export const OfficeJurysTab = ({
  examenMode,
  jurysList = [],
  jurySearchQuery,
  setJurySearchQuery,
  juryRegionFilter,
  setJuryRegionFilter,
  sessionExpDateInput,
  setSessionExpDateInput,
  fetchJurys,
  handleDispatchAlphabetique,
  fetchProfesseurs,
  setShowAddJuryModal,
  handleSaveSessionExpiration
}) => {
  const filteredJurys = jurysList.filter(j => {
    const q = jurySearchQuery.toLowerCase().trim();
    const matchQ = !q ||
      (j.numero_jury || '').toLowerCase().includes(q) ||
      (j.centre_examen || '').toLowerCase().includes(q) ||
      (j.region || '').toLowerCase().includes(q) ||
      (j.zone_commune || '').toLowerCase().includes(q) ||
      (j.president_jury || '').toLowerCase().includes(q) ||
      (j.identifiant_temporaire || '').toLowerCase().includes(q);
    const matchRegion = !juryRegionFilter || j.region === juryRegionFilter;
    return matchQ && matchRegion;
  });

  return (
    <div className="ob-tab-pane">
      <div className="ob-page-header">
        <div>
          <h2>Registre National des Jurys &amp; Centres d'Examen</h2>
          <p>Liste des jurys officiels créés, centres d'examen hôtes, présidents désignés et convocations</p>
        </div>
        <div className="ob-page-header-right" style={{ display: 'flex', gap: 8 }}>
          <button className="ob-btn ob-btn-ghost" onClick={fetchJurys}><RefreshCw size={15} /> Actualiser</button>
          <button className="ob-btn" onClick={handleDispatchAlphabetique} style={{ background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Zap size={16} /> Répartir par Ordre Alphabétique
          </button>
          <button className="ob-btn ob-btn-primary" onClick={() => { fetchProfesseurs(); setShowAddJuryModal(true); }}>
            <Plus size={16} /> Créer un nouveau Jury
          </button>
        </div>
      </div>

      {/* BARRE DISCRÈTE ET ÉLÉGANTE DE DATE D'EXPIRATION DES ACCÈS */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7',
            flexShrink: 0
          }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Expiration Globale des Accès Présidents de Jury ({examenMode})
              <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                Verrouillage Auto
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
              S'applique automatiquement à tous les accès temporaires et convocations de la session
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveSessionExpiration} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="datetime-local"
            value={sessionExpDateInput ? sessionExpDateInput.substring(0, 16) : ''}
            onChange={e => setSessionExpDateInput(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              outline: 'none',
              background: '#f8fafc',
              color: '#0f172a',
              fontWeight: 700
            }}
            required
          />
          <button
            type="submit"
            className="ob-btn ob-btn-primary"
            style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle size={14} /> Enregistrer
          </button>
        </form>
      </div>

      {/* BARRE DE RECHERCHE ET DE FILTRES DU REGISTRE DES JURYS */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Rechercher par N° de jury, centre d'examen, président, région..."
              value={jurySearchQuery}
              onChange={e => setJurySearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a'
              }}
            />
            {jurySearchQuery && (
              <button
                type="button"
                onClick={() => setJurySearchQuery('')}
                style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={juryRegionFilter}
            onChange={e => setJuryRegionFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              outline: 'none',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="">Toutes les régions</option>
            {['Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Fatick', 'Kaolack', 'Kolda', 'Louga', 'Matam', 'Sédhiou', 'Tambacounda', 'Kaffrine', 'Kédougou', 'Ziguinchor'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Affichage :</span>
          <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
            {filteredJurys.length} / {jurysList.length} Jurys
          </span>
        </div>
      </div>

      <div className="ob-table-wrap">
        {filteredJurys.length === 0 ? (
          <div className="ob-empty">
            <Award size={48} />
            <p>Aucun jury correspondant aux critères de recherche.</p>
            {(jurySearchQuery || juryRegionFilter) && (
              <button className="ob-btn ob-btn-ghost mt-2" onClick={() => { setJurySearchQuery(''); setJuryRegionFilter(''); }}>
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <table className="ob-table">
            <thead>
              <tr>
                <th>N° de Jury</th>
                <th>Centre d'Examen (Établissement hôte)</th>
                <th>Région &amp; Zone</th>
                <th>Séries Autorisées</th>
                <th>Président du Jury désigné</th>
                <th>Statut / Convocation</th>
              </tr>
            </thead>
            <tbody>
              {filteredJurys.map(j => (
                <tr key={j.id || j.numero_jury}>
                  <td><code className="ob-id-code" style={{ fontSize: 13, fontWeight: 700 }}>{j.numero_jury}</code></td>
                  <td><strong>{j.centre_examen}</strong></td>
                  <td>{j.region} <span style={{ fontSize: 11, color: '#64748b' }}>({j.zone_commune || 'Centre'})</span></td>
                  <td><span className="ob-badge-type">{j.series_autorisees || 'Toutes séries'}</span></td>
                  <td>
                    {j.president_jury ? (
                      <div>
                        <strong style={{ color: '#0f172a' }}>{j.president_jury}</strong>
                        {j.identifiant_temporaire && (
                          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                            <code>🔑 {j.identifiant_temporaire}</code>
                            {j.mot_de_passe_temporaire && <span> (MDP: <strong>{j.mot_de_passe_temporaire}</strong>)</span>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Non attribué</span>
                    )}
                  </td>
                  <td>
                    {(() => {
                      const isExpired = j.date_expiration_acces && new Date() > new Date(j.date_expiration_acces);
                      return (
                        <div>
                          <span className={`ob-badge ${isExpired ? 'ob-badge-ajourne' : 'ob-badge-admis'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={12} /> {isExpired ? 'Mission Expirée' : 'Accès Actif & Convocation'}
                          </span>
                          {j.date_expiration_acces && (
                            <div style={{ fontSize: 10, color: isExpired ? '#b91c1c' : '#64748b', marginTop: 2, fontWeight: 700 }}>
                              Lim: {new Date(j.date_expiration_acces).toLocaleDateString('fr-FR')} {new Date(j.date_expiration_acces).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OfficeJurysTab;
