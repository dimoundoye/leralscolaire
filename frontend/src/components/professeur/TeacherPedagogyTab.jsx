import React from 'react';
import { Loader2, FileText, Sparkles, User } from 'lucide-react';

const TeacherPedagogyTab = ({
  pedClass,
  setPedClass,
  pedMatiere,
  setPedMatiere,
  activeClasses,
  setPedData,
  pedLoading,
  pedData,
  pedSubTab,
  setPedSubTab,
  showNotification
}) => {
  return (
    <div className="tab-pane">
      <div className="filter-bar" style={{ marginBottom: '24px' }}>
        <div>
          <label>Classe</label>
          <select value={pedClass} onChange={e => { setPedClass(e.target.value); setPedMatiere(''); setPedData(null); }}>
            <option value="">Sélectionner</option>
            {Array.from(new Set(activeClasses.map(c => c.classe_id))).map(cId => {
              const c = activeClasses.find(cl => cl.classe_id === cId);
              return <option key={cId} value={cId}>{c.classe_nom} ({c.etablissement_nom})</option>;
            })}
          </select>
        </div>

        {pedClass && (
          <div>
            <label>Matière</label>
            <select value={pedMatiere} onChange={e => setPedMatiere(e.target.value)}>
              <option value="">Sélectionner</option>
              {activeClasses.filter(c => c.classe_id === pedClass).map(c => (
                <option key={c.matiere_id} value={c.matiere_id}>{c.matiere_nom}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {pedLoading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary-color)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-slate-500)', fontSize: '13.5px' }}>Analyse des performances de la classe en cours...</p>
        </div>
      ) : !pedData ? (
        <div className="card-box" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-slate-400)' }}>
          <FileText size={36} style={{ marginBottom: '12px', color: 'var(--text-slate-300)' }} />
          <p style={{ fontSize: '13.5px', fontWeight: 600 }}>Veuillez sélectionner une classe et une matière pour charger le suivi pédagogique.</p>
        </div>
      ) : (
        <div>
          {/* Header Meta */}
          <div className="card-box" style={{ background: '#f8fafc', marginBottom: '24px', padding: '16px 20px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--primary-blue)', fontWeight: 800 }}>
              Analyse Pédagogique : {pedData.meta.classe_nom} — {pedData.meta.matiere_nom}
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-slate-500)' }}>
              Établissement : <strong>{pedData.meta.etablissement_nom}</strong> | Seuil critique de vigilance : <strong style={{ color: 'var(--accent-red)' }}>{pedData.meta.criticalThreshold}/20</strong>
            </p>
          </div>

          {/* Sub Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', gap: '16px' }}>
            <button 
              onClick={() => setPedSubTab('stats')}
              style={{
                padding: '10px 4px', background: 'none', border: 'none',
                borderBottom: pedSubTab === 'stats' ? '2px solid var(--primary-color)' : 'none',
                color: pedSubTab === 'stats' ? 'var(--primary-color)' : 'var(--text-slate-500)',
                fontWeight: pedSubTab === 'stats' ? 700 : 500, fontSize: '13px', cursor: 'pointer'
              }}
            >
              Suivi & Statistiques de classe
            </button>
            <button 
              onClick={() => setPedSubTab('ia')}
              style={{
                padding: '10px 4px', background: 'none', border: 'none',
                borderBottom: pedSubTab === 'ia' ? '2px solid var(--primary-color)' : 'none',
                color: pedSubTab === 'ia' ? 'var(--primary-color)' : 'var(--text-slate-500)',
                fontWeight: pedSubTab === 'ia' ? 700 : 500, fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Sparkles size={14} style={{ color: '#8b5cf6' }} /> Recommandations IA (Beta)
            </button>
          </div>

          {pedSubTab === 'stats' ? (
            <div>
              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div className="card-box" style={{ textAlign: 'center', padding: '16px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Moyenne Générale</span>
                  <h2 style={{ fontSize: '28px', color: 'var(--primary-color)', margin: '8px 0 0', fontWeight: 800 }}>{pedData.stats.classAvg}/20</h2>
                </div>
                <div className="card-box" style={{ textAlign: 'center', padding: '16px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Moyenne Maximale</span>
                  <h2 style={{ fontSize: '28px', color: '#16a34a', margin: '8px 0 0', fontWeight: 800 }}>{pedData.stats.maxGrade}/20</h2>
                </div>
                <div className="card-box" style={{ textAlign: 'center', padding: '16px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Moyenne Minimale</span>
                  <h2 style={{ fontSize: '28px', color: '#dc2626', margin: '8px 0 0', fontWeight: 800 }}>{pedData.stats.minGrade}/20</h2>
                </div>
                <div className="card-box" style={{ textAlign: 'center', padding: '16px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Élèves en difficulté</span>
                  <h2 style={{ fontSize: '28px', color: pedData.stats.criticalCount > 0 ? 'var(--accent-red)' : '#4b5563', margin: '8px 0 0', fontWeight: 800 }}>{pedData.stats.criticalCount}</h2>
                </div>
              </div>

              {/* Distribution chart representation */}
              <div className="card-box" style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 800 }}>Distribution des Moyennes de la Classe</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(pedData.stats.distribution).reverse().map(([range, count]) => {
                    const total = pedData.students.length;
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    let barColor = '#3b82f6';
                    if (range === '16-20' || range === '14-16') barColor = '#16a34a';
                    if (range === '5-10') barColor = '#f59e0b';
                    if (range === '0-5') barColor = '#dc2626';
                    
                    return (
                      <div key={range} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px' }}>
                        <span style={{ width: '64px', flexShrink: 0, fontWeight: 700, color: 'var(--text-slate-500)', whiteSpace: 'nowrap' }}>Moy. {range}</span>
                        <div style={{ flex: 1, minWidth: 0, height: '10px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: barColor, borderRadius: '10px' }}></div>
                        </div>
                        <span style={{ width: '30px', flexShrink: 0, fontWeight: 800, textAlign: 'right', whiteSpace: 'nowrap' }}>{count} él.</span>
                        <span style={{ width: '32px', flexShrink: 0, color: 'var(--text-slate-400)', textAlign: 'right', whiteSpace: 'nowrap' }}>({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Students List */}
              <div className="card-box">
                <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 800 }}>Suivi Individuel des Élèves</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className="roster-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>Élève</th>
                        <th>Moyenne S1</th>
                        <th>Moyenne S2</th>
                        <th>Moyenne Actuelle</th>
                        <th>Tendance</th>
                        <th>Vigilance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedData.students.map(stud => (
                        <tr key={stud.id} style={{ background: stud.isCritical ? '#fef2f2' : 'none' }}>
                          <td style={{ fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {stud.photo_url ? (
                                <img src={`${stud.photo_url}`} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                              ) : (
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}><User size={10} /></div>
                              )}
                              <div>
                                {stud.prenom} {stud.nom}
                                <div style={{ fontSize: '10px', color: 'var(--text-slate-400)', fontWeight: 500 }}>ID: {stud.identifiant_national}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{stud.s1Avg !== null ? `${stud.s1Avg}/20` : '—'}</td>
                          <td style={{ fontWeight: 600 }}>{stud.s2Avg !== null ? `${stud.s2Avg}/20` : '—'}</td>
                          <td style={{ fontWeight: 800, color: stud.isCritical ? 'var(--accent-red)' : 'inherit' }}>
                            {stud.currentAvg !== null ? `${stud.currentAvg}/20` : '—'}
                          </td>
                          <td>
                            {stud.trend === 'UP' && <span style={{ color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '2px' }}>↑ Hausse</span>}
                            {stud.trend === 'DOWN' && <span style={{ color: '#dc2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '2px' }}>↓ Baisse</span>}
                            {stud.trend === 'STABLE' && <span style={{ color: 'var(--text-slate-400)', fontWeight: 600 }}>→ Stable</span>}
                          </td>
                          <td>
                            {stud.isCritical ? (
                              <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 700, background: '#fee2e2', color: 'var(--accent-red)', border: '1px solid #fecaca' }}>
                                Sous le seuil
                              </span>
                            ) : (
                              <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 700, background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                                Favorable
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* AI recommendations Tab */}
              <div className="card-box" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', marginBottom: '16px' }}>
                  <Sparkles size={24} />
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Assistant Pédagogique IA LeralScolaire</h4>
                </div>
                
                <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #ddd6fe', marginBottom: '20px', fontSize: '12.5px', color: 'var(--text-slate-700)' }}>
                  ℹ️ <strong>Recommandation IA (Beta)</strong> : Les suggestions d'actions pédagogiques ci-dessous sont générées à partir des statistiques consolidées de la classe et de la répartition des notes.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h5 style={{ margin: '0 0 6px', color: 'var(--primary-color)', fontWeight: 800 }}>1. Plan d'accompagnement ciblé (Élèves sous le seuil)</h5>
                    <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-slate-600)', lineHeight: 1.5 }}>
                      Il est conseillé de proposer des fiches de révisions complémentaires ou des séances d'exercices à distance pour les <strong>{pedData.stats.criticalCount} élèves</strong> qui se situent sous le seuil critique de vigilance ({pedData.meta.criticalThreshold}/20) sur ce semestre.
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h5 style={{ margin: '0 0 6px', color: 'var(--primary-color)', fontWeight: 800 }}>2. Tutorat solidaire par les pairs</h5>
                    <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-slate-600)', lineHeight: 1.5 }}>
                      La classe présente une bonne répartition avec des élèves ayant d'excellents résultats (moyenne max : {pedData.stats.maxGrade}/20). L'implémentation de groupes d'entraide (binômes associant un élève fort avec un élève sous le seuil) peut grandement remobiliser les élèves en difficulté.
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h5 style={{ margin: '0 0 6px', color: 'var(--primary-color)', fontWeight: 800 }}>3. Consolidation générale des acquis</h5>
                    <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-slate-600)', lineHeight: 1.5 }}>
                      La moyenne générale de la classe étant de {pedData.stats.classAvg}/20, prévoyez un créneau de remédiation rapide lors du prochain cours pour retravailler les thématiques abordées dans les derniers devoirs avant la composition finale.
                    </p>
                  </div>
                </div>

                {/* Ask AI input box */}
                <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-slate-700)', display: 'block', marginBottom: '8px' }}>Poser une question spécifique à l'IA sur la classe :</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <textarea 
                      rows="2" 
                      placeholder="ex: Comment puis-je aider les élèves en baisse ce semestre ?"
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-slate-200)', fontSize: '12.5px' }}
                    />
                    <button 
                      className="btn btn-primary" 
                      onClick={() => showNotification("Intégration du module IA en cours... L'assistant IA sera bientôt connecté.", "info")}
                      style={{ alignSelf: 'flex-end', background: '#7c3aed', borderColor: '#7c3aed', padding: '10px 18px', fontSize: '12.5px' }}
                    >
                      Générer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherPedagogyTab;
