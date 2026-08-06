import React from 'react';
import { Plus, Loader2 } from 'lucide-react';

const TeacherPlanningTab = ({
  classes,
  planningFilterEtab,
  setPlanningFilterEtab,
  planningFilterClasse,
  setPlanningFilterClasse,
  planningLoading,
  planning,
  setShowProposeModal
}) => {
  return (
    <div className="tab-pane">
      <div className="card-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Calendrier des Évaluations</h3>
            <p className="subtitle" style={{ fontSize: '12px', color: 'var(--text-slate-500)', margin: '4px 0 0' }}>
              Consultez les devoirs/examens planifiés et proposez de nouvelles dates.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowProposeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <Plus size={16} /> Proposer un Devoir
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '180px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-500)', display: 'block', marginBottom: '4px' }}>Établissement</label>
            <select 
              value={planningFilterEtab} 
              onChange={e => { setPlanningFilterEtab(e.target.value); setPlanningFilterClasse(''); }}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-slate-200)', fontSize: '13px' }}
            >
              <option value="">Tous les établissements</option>
              {Array.from(new Set(classes.map(c => c.etablissement_id))).map(etabId => {
                const etabName = classes.find(c => c.etablissement_id === etabId)?.etablissement_nom;
                return <option key={etabId} value={etabId}>{etabName}</option>;
              })}
            </select>
          </div>
          <div style={{ minWidth: '180px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-500)', display: 'block', marginBottom: '4px' }}>Classe</label>
            <select 
              value={planningFilterClasse} 
              onChange={e => setPlanningFilterClasse(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-slate-200)', fontSize: '13px' }}
            >
              <option value="">Toutes les classes</option>
              {classes
                .filter(c => !planningFilterEtab || c.etablissement_id === planningFilterEtab)
                .map(c => <option key={c.classe_id} value={c.classe_id}>{c.classe_nom}</option>)
              }
            </select>
          </div>
        </div>

        {planningLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader2 className="animate-spin" size={28} style={{ color: 'var(--primary-color)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-slate-500)' }}>Chargement du calendrier...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="roster-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Évaluation</th>
                  <th>Établissement</th>
                  <th>Classe</th>
                  <th>Matière</th>
                  <th>Date / Heure</th>
                  <th>Salle</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {planning
                  .filter(p => !planningFilterEtab || p.etablissement_id === planningFilterEtab)
                  .filter(p => !planningFilterClasse || p.classe_id === planningFilterClasse)
                  .map(evalItem => {
                    const isImminent = new Date(evalItem.date_examen) > new Date() && 
                                       (new Date(evalItem.date_examen) - new Date()) < (2 * 24 * 60 * 60 * 1000);
                    const formattedDate = new Date(evalItem.date_examen).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    return (
                      <tr key={evalItem.id} style={{ background: isImminent ? '#fffbeb' : 'none' }}>
                        <td style={{ fontWeight: 700 }}>{evalItem.type_examen}</td>
                        <td>{evalItem.etablissement_nom}</td>
                        <td style={{ fontWeight: 700 }}>{evalItem.classe_nom}</td>
                        <td>{evalItem.matiere_nom}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 600 }}>{formattedDate}</span>
                            {isImminent && (
                              <span style={{ background: '#f59e0b', color: 'white', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                ⚠️ Imminent
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{evalItem.salle || '—'}</td>
                        <td>
                          {evalItem.statut === 'VALIDE' && (
                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                              Validé
                            </span>
                          )}
                          {evalItem.statut === 'EN_ATTENTE' && (
                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                              En attente
                            </span>
                          )}
                          {evalItem.statut === 'REFUSE' && (
                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
                              Refusé
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {planning.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-slate-400)' }}>
                      Aucune évaluation planifiée ou proposée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPlanningTab;
