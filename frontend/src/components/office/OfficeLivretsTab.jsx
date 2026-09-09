import React from 'react';
import {
  Plus, Send, RefreshCw, BookOpen, CheckCircle, Clock
} from 'lucide-react';

export const OfficeLivretsTab = ({
  filters,
  setFilters,
  livretsList = [],
  setShowAddLivretModal,
  handleRestituerLivrets,
  fetchLivrets,
  handleValiderLivret
}) => {
  return (
    <div className="ob-tab-pane">
      <div className="ob-page-header">
        <div>
          <h2>Livrets Scolaires du BAC (Transmis par les Établissements)</h2>
          <p>Consultation, suivi du dossier scolaire (Seconde, Première, Terminale) et certification pour le Jury de délibération</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="ob-btn ob-btn-primary" onClick={() => setShowAddLivretModal(true)}>
            <Plus size={16} /> Transmettre un Livret Scolaire
          </button>
          <button className="ob-btn" onClick={handleRestituerLivrets} style={{ background: '#7c3aed', color: '#ffffff', border: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Send size={15} /> ↩ Restituer tous les Livrets aux Établissements
          </button>
          <button className="ob-btn ob-btn-ghost" onClick={fetchLivrets}><RefreshCw size={15} /> Actualiser</button>
        </div>
      </div>

      <div className="ob-stats-grid mb-6">
        <div className="ob-stat-card ob-stat-total">
          <div className="ob-stat-icon"><BookOpen size={22} /></div>
          <div>
            <div className="ob-stat-num">{livretsList.length}</div>
            <div className="ob-stat-label">Livrets Scolaires Transmis</div>
          </div>
        </div>

        <div className="ob-stat-card ob-stat-admis">
          <div className="ob-stat-icon"><CheckCircle size={22} /></div>
          <div>
            <div className="ob-stat-num">{livretsList.filter(l => l.statut_validation === 'CONFORME').length}</div>
            <div className="ob-stat-label">Livrets Certifiés Conformes</div>
          </div>
        </div>

        <div className="ob-stat-card ob-stat-ajournes">
          <div className="ob-stat-icon"><Clock size={22} /></div>
          <div>
            <div className="ob-stat-num">{livretsList.filter(l => l.statut_validation === 'RÉCEPTIONNÉ').length}</div>
            <div className="ob-stat-label">En Attente de Vérification</div>
          </div>
        </div>
      </div>

      <div className="ob-filters-bar mb-4">
        <select value={filters.annee} onChange={e => setFilters(f => ({ ...f, annee: e.target.value }))}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>Session {y}</option>)}
        </select>
        <select value={filters.serie} onChange={e => setFilters(f => ({ ...f, serie: e.target.value }))}>
          <option value="">Toutes les séries</option>
          {['S1', 'S2', 'S3', 'L1', 'L2', 'G', 'STEG', 'T'].map(s => <option key={s} value={s}>Série {s}</option>)}
        </select>
      </div>

      <div className="ob-table-wrap">
        {livretsList.length === 0 ? (
          <div className="ob-empty"><BookOpen size={48} /><p>Aucun livret scolaire transmis pour cette session.</p></div>
        ) : (
          <table className="ob-table">
            <thead>
              <tr>
                <th>Candidat &amp; IUP</th>
                <th>Établissement &amp; Région</th>
                <th>Série</th>
                <th>Moy. 2nde</th>
                <th>Moy. 1ère</th>
                <th>Moy. Tle</th>
                <th>Appréciation Conseil</th>
                <th>Statut Livret</th>
                <th>Action Jury</th>
              </tr>
            </thead>
            <tbody>
              {livretsList.map(l => (
                <tr key={l.id}>
                  <td>
                    <strong style={{ color: 'var(--primary-color)' }}>{l.eleve_prenom} {l.eleve_nom}</strong>
                    <div style={{ fontSize: 11, color: '#64748b' }}><code>{l.identifiant_national}</code></div>
                  </td>
                  <td>
                    <div><strong>{l.etablissement_nom || 'Lycée'}</strong></div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{l.region || 'Sénégal'}</div>
                  </td>
                  <td><span className="ob-badge-type">{l.serie}</span></td>
                  <td><strong>{l.moyenne_seconde ? parseFloat(l.moyenne_seconde).toFixed(2) + '/20' : '—'}</strong></td>
                  <td><strong>{l.moyenne_premiere ? parseFloat(l.moyenne_premiere).toFixed(2) + '/20' : '—'}</strong></td>
                  <td><strong style={{ color: '#15803d' }}>{l.moyenne_terminale ? parseFloat(l.moyenne_terminale).toFixed(2) + '/20' : '—'}</strong></td>
                  <td>
                    <div style={{ fontSize: 11, maxWidth: 200, fontStyle: 'italic' }}>
                      {l.appreciation_conseil || 'Bon élève, assidu et sérieux.'}
                    </div>
                  </td>
                  <td>
                    <span className="ob-statut-pill" style={{
                      background: l.statut_validation === 'CONFORME' ? '#dcfce7' : l.statut_validation === 'REJETÉ' ? '#fee2e2' : '#fef9c3',
                      color: l.statut_validation === 'CONFORME' ? '#15803d' : l.statut_validation === 'REJETÉ' ? '#b91c1c' : '#b45309'
                    }}>
                      {l.statut_validation}
                    </span>
                  </td>
                  <td>
                    <div className="ob-actions-row">
                      {l.statut_validation !== 'CONFORME' && (
                        <button className="ob-btn ob-btn-primary ob-btn-sm" onClick={() => handleValiderLivret(l.id, 'CONFORME')}>
                          ✓ Certifier
                        </button>
                      )}
                      {l.statut_validation !== 'REJETÉ' && (
                        <button className="ob-btn ob-btn-danger ob-btn-sm" onClick={() => handleValiderLivret(l.id, 'REJETÉ')}>
                          ✕ Rejeter
                        </button>
                      )}
                    </div>
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

export default OfficeLivretsTab;
