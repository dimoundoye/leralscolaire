import React from 'react';
import { Loader2, ClipboardList, Lock, Unlock, Edit3 } from 'lucide-react';

export const OfficeSaisieTab = ({
  filters,
  setFilters,
  candidats = [],
  loading,
  getMentionColor,
  handleToggleVerrou,
  openResultModal
}) => {
  return (
    <div className="ob-tab-pane">
      <div className="ob-page-header">
        <div>
          <h2>Saisie des Résultats &amp; Délibérations du Jury</h2>
          <p>Saisie des épreuves, calcul automatique de la moyenne, délibérations (1er et 2nd Tour) et verrouillage par le jury</p>
        </div>
        <div className="ob-filters-bar" style={{ marginTop: 0 }}>
          <select value={filters.annee} onChange={e => setFilters(f => ({ ...f, annee: e.target.value }))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filters.serie} onChange={e => setFilters(f => ({ ...f, serie: e.target.value }))}>
            <option value="">Toutes les séries</option>
            {['S1', 'S2', 'S3', 'L1', 'L2', 'G', 'STEG', 'T'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="ob-saisie-cards">
        {loading ? (
          <div className="ob-loading"><Loader2 size={28} className="ob-spin" /></div>
        ) : candidats.length === 0 ? (
          <div className="ob-empty"><ClipboardList size={48} /><p>Aucun candidat dans cette session</p></div>
        ) : candidats.map(c => (
          <div key={c.id} className={`ob-saisie-card ${c.moyenne !== null ? 'ob-saisie-done' : ''}`}>
            <div className="ob-saisie-card-left">
              <div className="ob-saisie-num">{c.numero_table || '?'}</div>
              <div>
                <div className="ob-saisie-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {c.prenom} {c.nom}
                  {c.verrouille && <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: 4 }}>🔒 Verrouillé Jury</span>}
                </div>
                <div className="ob-saisie-meta">
                  {c.type_examen} {c.annee} · Série {c.serie} · Jury {c.jury || '—'} · {c.etablissement_nom || 'Candidat Libre'}
                </div>
              </div>
            </div>
            <div className="ob-saisie-card-right">
              {c.absent_epreuve ? (
                <span className="ob-statut-pill" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                  {c.absent_epreuve === 'ABI' ? 'Absence Injustifiée (ABI)' : 'Absence Justifiée (ABJ)'}
                </span>
              ) : c.moyenne !== null ? (
                <div className="ob-saisie-moy-wrap">
                  <span className="ob-saisie-moy">{parseFloat(c.moyenne).toFixed(2)}/20</span>
                  <span className="ob-saisie-mention" style={{ color: getMentionColor(c.mention) }}>
                    {c.statut_resultat || c.mention}
                  </span>
                </div>
              ) : (
                <span className="ob-saisie-pending">Notes non saisies</span>
              )}
              
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="ob-btn ob-btn-ghost ob-btn-sm"
                  onClick={() => handleToggleVerrou(c.id, c.verrouille)}
                  title={c.verrouille ? 'Déverrouiller pour modification' : 'Verrouiller la saisie du jury'}
                >
                  {c.verrouille ? <Unlock size={14} /> : <Lock size={14} />}
                </button>

                <button
                  className="ob-btn ob-btn-primary ob-btn-sm"
                  disabled={c.verrouille}
                  onClick={() => openResultModal(c)}
                >
                  <Edit3 size={14} /> {c.moyenne !== null ? 'Modifier' : 'Saisir'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfficeSaisieTab;
