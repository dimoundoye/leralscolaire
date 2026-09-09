import React from 'react';
import {
  Plus, RefreshCw, Award, BookOpen, Users, Search, Loader2,
  Edit3, History, CheckCircle, AlertCircle, Trash2, QrCode
} from 'lucide-react';

export const OfficeCandidatsTab = ({
  filters,
  setFilters,
  jurysList = [],
  candidats = [],
  loading,
  fetchProfesseurs,
  setShowAddJuryModal,
  handleGenererNumeros,
  setShowAddModal,
  fetchCandidats,
  handleValiderDossier,
  handleReattribuerJury,
  getStatutColor,
  fetchReleve,
  openResultModal,
  fetchHistorique,
  handleAnnulerSuspension,
  setSuspendTarget,
  setShowSuspendModal,
  handleDeleteCandidat
}) => {
  return (
    <div className="ob-tab-pane">
      <div className="ob-page-header">
        <div>
          <h2>Gestion des Candidats &amp; Numéros de Table</h2>
          <p>Réception dossiers, numérotation automatique, classement par jury/série, statuts et suspensions</p>
        </div>
        <div className="ob-page-header-right" style={{ display: 'flex', gap: 8 }}>
          <button className="ob-btn ob-btn-ghost" onClick={() => { fetchProfesseurs(); setShowAddJuryModal(true); }}>
            <Plus size={14} /> Nouveau Jury
          </button>
          <button className="ob-btn ob-btn-ghost" onClick={handleGenererNumeros} title="Générer automatiquement les numéros de table">
            <RefreshCw size={14} /> Generer N° de Table
          </button>
          <button className="ob-btn ob-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Nouveau candidat
          </button>
        </div>
      </div>

      {/* SÉLECTEUR HIÉRARCHIQUE : JURYS & SÉRIES */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 22px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        
        {/* NIVEAU 1 : SÉLECTION DU JURY & CENTRE D'EXAMEN */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.6px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={16} style={{ color: '#2563eb' }} /> 1. Sélectionner le Jury &amp; Centre d'Examen Hôte ({jurysList.length} Jurys enregistrés) :
            </span>
            {jurysList.length > 6 && (
              <span style={{ fontSize: 11, color: '#0284c7', textTransform: 'none', fontWeight: 600 }}>
                💡 Utilisez le sélecteur déroulant pour chercher rapidement un jury
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 320px', minWidth: 280 }}>
              <select
                value={filters.jury || ''}
                onChange={e => setFilters(f => ({ ...f, jury: e.target.value, serie: '' }))}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: 10,
                  border: '2px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Tous les Jurys du Sénégal ({filters.annee}) — ({jurysList.length} Jurys)</option>
                {jurysList.map(j => (
                  <option key={j.id || j.numero_jury} value={j.numero_jury}>
                    {j.numero_jury} — {j.centre_examen} ({j.region}) {j.president_jury ? `· Pr. ${j.president_jury}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {jurysList.length <= 8 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {jurysList.map(j => {
                  const isSelected = filters.jury === j.numero_jury;
                  return (
                    <button
                      type="button"
                      key={j.id || j.numero_jury}
                      onClick={() => setFilters(f => ({ ...f, jury: isSelected ? '' : j.numero_jury, serie: '' }))}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        background: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#334155',
                        border: isSelected ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                        transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <span style={{ background: isSelected ? '#ffffff' : '#1e1b4b', color: isSelected ? '#2563eb' : '#ffffff', padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 900 }}>
                        {j.numero_jury}
                      </span>
                      <span>{j.centre_examen}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* NIVEAU 2 : SÉLECTION DE LA SÉRIE D'EXAMEN */}
        {(() => {
          const selectedJuryObj = jurysList.find(j => j.numero_jury === filters.jury);
          const availableSeries = selectedJuryObj && selectedJuryObj.series_autorisees && selectedJuryObj.series_autorisees !== 'Toutes séries'
            ? selectedJuryObj.series_autorisees.split(',').map(s => s.trim())
            : ['S1', 'S2', 'S3', 'L1', 'L2', 'G', 'STEG', 'T'];

          return (
            <div style={{ paddingTop: 14, borderTop: '1px dashed #e2e8f0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={16} style={{ color: '#059669' }} /> 2. Filtrer par Série de ce Jury {filters.jury ? `(${filters.jury})` : ''} :
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setFilters(f => ({ ...f, serie: '' }))}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: !filters.serie ? '#059669' : '#f8fafc',
                    color: !filters.serie ? '#ffffff' : '#475569',
                    border: !filters.serie ? 'none' : '1px solid #cbd5e1'
                  }}
                >
                  Toutes les séries
                </button>

                {availableSeries.map(s => {
                  const isSelected = filters.serie === s;
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setFilters(f => ({ ...f, serie: isSelected ? '' : s }))}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        background: isSelected ? '#059669' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#0f172a',
                        border: isSelected ? '1px solid #047857' : '1px solid #cbd5e1',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Série {s}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

      </div>

      {/* BANNIÈRE CONTEXTUELLE DE RÉCAPITULATION */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#ffffff', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center' }}>
            <Users size={22} style={{ color: '#38bdf8' }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>
              {filters.jury ? `${filters.jury} — ${jurysList.find(j => j.numero_jury === filters.jury)?.centre_examen || 'Centre d\'Examen'}` : 'Tous les Jurys du Sénégal'}
              {filters.serie ? ` · Série ${filters.serie}` : ''}
            </div>
            <div style={{ fontSize: 12, color: '#c7d2fe', marginTop: 2 }}>
              {filters.jury && jurysList.find(j => j.numero_jury === filters.jury)?.president_jury
                ? `Président du Jury : ${jurysList.find(j => j.numero_jury === filters.jury).president_jury}`
                : 'Sélectionnez un jury et une série ci-dessus pour restreindre la liste des candidats'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: '#38bdf8', color: '#0f172a', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 900 }}>
            {candidats.length} Candidat{candidats.length > 1 ? 's' : ''} affilié{candidats.length > 1 ? 's' : ''}
          </span>
          {(filters.jury || filters.serie) && (
            <button
              type="button"
              onClick={() => setFilters(f => ({ ...f, jury: '', serie: '' }))}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Barre de filtres complémentaires */}
      <div className="ob-filters-bar">
        <div className="ob-search-wrap">
          <Search size={16} />
          <input placeholder="Rechercher un candidat, N° table, IUP…" value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && fetchCandidats()} />
        </div>
        <select value={filters.annee} onChange={e => setFilters(f => ({ ...f, annee: e.target.value }))}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filters.type_candidat} onChange={e => setFilters(f => ({ ...f, type_candidat: e.target.value }))}>
          <option value="">Tous les types (Scolaire / Libre)</option>
          <option value="Scolaire">Scolaires</option>
          <option value="Candidat Libre">Candidats Libres</option>
        </select>
        <select value={filters.statut} onChange={e => setFilters(f => ({ ...f, statut: e.target.value }))}>
          <option value="">Tous les statuts</option>
          <option value="CONVOQUÉ">Convoqué</option>
          <option value="ADMIS">Admis</option>
          <option value="AJOURNÉ">Ajourné</option>
          <option value="EXCLU">Exclu</option>
          <option value="SUSPENDU">Suspendu</option>
        </select>
        <select value={filters.statut_dossier} onChange={e => setFilters(f => ({ ...f, statut_dossier: e.target.value }))}>
          <option value="">Tous les dossiers</option>
          <option value="VALIDÉ">Dossier Validé</option>
          <option value="EN_ATTENTE">En Attente</option>
          <option value="REJETÉ">Dossier Rejeté</option>
        </select>
        <select value={filters.order_by} onChange={e => setFilters(f => ({ ...f, order_by: e.target.value }))}>
          <option value="numero_table">Trier par N° Table</option>
          <option value="jury">Trier par Jury</option>
          <option value="serie">Trier par Série</option>
          <option value="nom">Trier par Nom</option>
        </select>
        <button className="ob-btn ob-btn-ghost" onClick={fetchCandidats} title="Actualiser"><RefreshCw size={15} /></button>
      </div>

      {/* Table */}
      <div className="ob-table-wrap">
        {loading ? (
          <div className="ob-loading"><Loader2 size={28} className="ob-spin" /> Chargement…</div>
        ) : candidats.length === 0 ? (
          <div className="ob-empty"><Users size={48} /><p>Aucun candidat trouvé pour ces critères</p></div>
        ) : (
          <table className="ob-table">
            <thead>
              <tr>
                <th>N° Table</th>
                <th>Candidat &amp; Profil</th>
                <th>Dossier Étab.</th>
                <th>Examen &amp; Série</th>
                <th>Jury &amp; Centre</th>
                <th>Statut</th>
                <th>Attestation / QR</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidats.map(c => {
                const s = getStatutColor(c.statut_candidat);
                const isDossierOk = c.statut_dossier === 'VALIDÉ';
                const isRejete = c.statut_dossier === 'REJETÉ';
                return (
                  <tr key={c.id}>
                    <td className="ob-td-num">{c.numero_table || '—'}</td>
                    <td className="ob-td-name">
                      <div className="ob-name-cell">
                        <div className="ob-avatar">{c.prenom?.[0]}{c.nom?.[0]}</div>
                        <div>
                          <div className="ob-name">
                            {c.prenom} {c.nom}
                            {c.sexe === 'F'
                              ? <span style={{ marginLeft: 6, fontSize: 10, background: '#fce7f3', color: '#9d174d', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>Mme/Mlle</span>
                              : <span style={{ marginLeft: 6, fontSize: 10, background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>M.</span>
                            }
                            {c.statut_redoublant && <span style={{ marginLeft: 6, fontSize: 10, background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: 4 }}>Redoublant</span>}
                          </div>
                          <div className="ob-etab">
                            {c.etablissement_nom || 'Candidat Libre'} · <code style={{ fontSize: 11 }}>{c.identifiant_national}</code>
                          </div>
                          {c.amenagement_handicap && (
                            <span style={{ fontSize: 10, color: '#7c3aed', fontStyle: 'italic' }}>♿ {c.amenagement_handicap}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                          background: isDossierOk ? '#dcfce7' : isRejete ? '#fee2e2' : '#fef9c3',
                          color: isDossierOk ? '#15803d' : isRejete ? '#b91c1c' : '#b45309',
                          border: 'none', cursor: 'pointer'
                        }}
                        value={c.statut_dossier || 'VALIDÉ'}
                        onChange={(e) => handleValiderDossier(c.id, e.target.value)}
                      >
                        <option value="VALIDÉ">✓ Validé</option>
                        <option value="EN_ATTENTE">⏳ En attente</option>
                        <option value="REJETÉ">✕ Rejeté</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className="ob-badge-type" style={{ width: 'fit-content' }}>{c.type_examen}</span>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>Série {c.serie || '—'}</span>
                        <span style={{ fontSize: 10, color: '#64748b' }}>{c.type_candidat || 'Scolaire'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        <select
                          style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 6, border: '1px solid #cbd5e1', color: '#131e6c', cursor: 'pointer' }}
                          value={c.jury || ''}
                          onChange={e => {
                            const jObj = jurysList.find(j => j.numero_jury === e.target.value);
                            handleReattribuerJury(c.id, e.target.value, jObj ? jObj.centre_examen : c.centre_examen);
                          }}
                          title="Réattribuer / Modifier le Jury (Correction d'erreur Office BAC)"
                        >
                          <option value="">Sélectionner Jury</option>
                          {jurysList
                            .filter(j => !c.region || j.region === c.region)
                            .map(j => (
                              <option key={j.id} value={j.numero_jury}>
                                {j.numero_jury} ({j.centre_examen})
                              </option>
                            ))}
                        </select>
                        <div style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>{c.centre_examen || '—'} ({c.region})</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className="ob-statut-pill" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {c.statut_candidat || 'CONVOQUÉ'}
                        </span>
                        {c.statut_candidat === 'SUSPENDU' && c.motif_suspension && (
                          <span style={{ fontSize: 10, color: '#b91c1c', fontStyle: 'italic', maxWidth: 140 }} title={c.motif_suspension}>
                            Motif: {c.motif_suspension}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {c.publie ? (
                        <button className="ob-btn ob-btn-ghost ob-btn-sm" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => fetchReleve(c.id)}>
                          <QrCode size={12} /> Relevé Certifié
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>En attente publication</span>
                      )}
                    </td>
                    <td>
                      <div className="ob-actions-row">
                        <button className="ob-icon-btn ob-icon-edit" title="Saisir / Modifier résultats" onClick={() => openResultModal(c)}><Edit3 size={14} /></button>
                        
                        <button className="ob-icon-btn" style={{ background: '#f1f5f9', color: '#131e6c' }} title="Historique participations" onClick={() => fetchHistorique(c.eleve_id)}>
                          <History size={14} />
                        </button>

                        {c.statut_candidat === 'SUSPENDU' ? (
                          <button className="ob-icon-btn" style={{ background: '#dcfce7', color: '#15803d' }} title="Lever la suspension" onClick={() => handleAnnulerSuspension(c.id)}>
                            <CheckCircle size={14} />
                          </button>
                        ) : (
                          <button className="ob-icon-btn" style={{ background: '#fff1f2', color: '#be123c' }} title="Suspendre candidature" onClick={() => { setSuspendTarget(c); setShowSuspendModal(true); }}>
                            <AlertCircle size={14} />
                          </button>
                        )}

                        {!c.publie && (
                          <button className="ob-icon-btn ob-icon-del" title="Supprimer" onClick={() => handleDeleteCandidat(c.id)}><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OfficeCandidatsTab;
