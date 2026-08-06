import React from 'react';
import { Edit, Check } from 'lucide-react';

const TeacherGradesTab = ({
  selectedClasse,
  setSelectedClasse,
  selectedMatiere,
  setSelectedMatiere,
  selectedPeriode,
  setSelectedPeriode,
  selectedTypeNote,
  setSelectedTypeNote,
  activeClasses,
  setBaremes,
  gradesData,
  draftGrades,
  setDraftGrades,
  getAppreciationFromBaremes,
  auditLog,
  setActiveMotifText,
  handleTriggerModifyGrade,
  handleSaveGrade
}) => {
  return (
    <div className="tab-pane">
      <div className="filter-bar">
        <div>
          <label>Classe</label>
          <select value={selectedClasse} onChange={e => {
            setSelectedClasse(e.target.value);
            setSelectedMatiere('');
            setBaremes([]);
          }}>
            <option value="">Sélectionner</option>
            {Array.from(new Set(activeClasses.map(c => c.classe_id))).map(cId => {
              const c = activeClasses.find(cl => cl.classe_id === cId);
              return <option key={cId} value={cId}>{c.classe_nom} ({c.etablissement_nom})</option>;
            })}
          </select>
        </div>

        {selectedClasse && (
          <div>
            <label>Matière</label>
            <select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)}>
              <option value="">Sélectionner</option>
              {activeClasses.filter(c => c.classe_id === selectedClasse).map(c => (
                <option key={c.matiere_id} value={c.matiere_id}>{c.matiere_nom}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label>Période</label>
          <select value={selectedPeriode} onChange={e => setSelectedPeriode(e.target.value)}>
            <option value="Semestre 1">Semestre 1</option>
            <option value="Semestre 2">Semestre 2</option>
          </select>
        </div>

        <div>
          <label>Évaluation</label>
          <select value={selectedTypeNote} onChange={e => setSelectedTypeNote(e.target.value)}>
            <option value="DEVOIR">Devoir</option>
            <option value="EXAMEN">Composition</option>
          </select>
        </div>
      </div>

      {selectedClasse && selectedMatiere && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <h3>Saisie des notes — {selectedTypeNote}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-slate-500)', marginBottom: '20px' }}>
            Saisissez ou modifiez les notes. Toute modification sur une note déjà enregistrée déclenchera une justification obligatoire.
          </p>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></span>
              Note déjà saisie (établissement)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }}></span>
              Aucune note — à saisir
            </span>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '8px' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: 'var(--text-slate-500)', fontWeight: 700 }}>
                  <th style={{ padding: '10px 18px' }}>Élève</th>
                  <th style={{ padding: '10px 18px' }}>Note / 20</th>
                  <th style={{ padding: '10px 18px' }}>Appréciation</th>
                  <th style={{ padding: '10px 18px' }}>Suivi modification</th>
                  <th style={{ padding: '10px 18px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gradesData.students.map(stud => {
                  const existingGrade = gradesData.grades.find(g => g.eleve_id === stud.id && g.type_note === selectedTypeNote);
                  const draft = draftGrades[stud.id] || { note: '', appreciation: '' };
                  const hasNote = draft.note !== '' && draft.note !== null;
                  const activeModif = auditLog.find(entry => entry.note_id === existingGrade?.id && entry.statut !== 'CONFIRME');

                  return (
                    <tr key={stud.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '10px 18px', fontWeight: 'bold', color: 'var(--slate-800)' }}>
                        {stud.prenom} {stud.nom}
                      </td>
                      <td style={{ padding: '10px 18px' }}>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="20"
                          placeholder="—"
                          value={draft.note}
                          onChange={e => {
                            const newNote = e.target.value;
                            const autoApprec = getAppreciationFromBaremes(newNote);
                            setDraftGrades({
                              ...draftGrades,
                              [stud.id]: { ...draft, note: newNote, appreciation: autoApprec }
                            });
                          }}
                          style={{ width: '70px', padding: '6px', borderRadius: '6px', border: `1px solid ${existingGrade ? '#86efac' : '#CBD5E1'}`, textAlign: 'center', fontWeight: 'bold', background: existingGrade ? '#f0fdf4' : 'white' }}
                        />
                      </td>
                      <td style={{ padding: '10px 18px' }}>
                        <div style={{ position: 'relative', width: '180px' }}>
                          <input
                            type="text"
                            placeholder="Auto-rempli par le barème"
                            value={draft.appreciation}
                            readOnly
                            style={{ width: '180px', padding: '6px', paddingRight: draft.appreciation ? '46px' : '6px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#f1f5f9', color: '#475569', cursor: 'default', fontStyle: draft.appreciation ? 'normal' : 'italic' }}
                            title="Appréciation définie automatiquement selon le barème de l'établissement"
                          />
                          {draft.appreciation && (
                            <span style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: '#ede9fe', color: '#6366f1', fontWeight: '700' }}>AUTO</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 18px' }}>
                        {activeModif ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            {activeModif.statut === 'EN_ATTENTE' ? (
                              <span style={{
                                display: 'inline-block', padding: '2px 8px',
                                background: 'rgba(245,158,11,0.08)', color: '#d97706',
                                borderRadius: '4px', fontSize: '11px', fontWeight: 700
                              }}>
                                En attente (Nouvelle: {Number(activeModif.nouvelle_valeur).toFixed(2)})
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-block', padding: '2px 8px',
                                background: 'rgba(239,68,68,0.08)', color: '#dc2626',
                                borderRadius: '4px', fontSize: '11px', fontWeight: 700
                              }}>
                                Rejetée (Demandé: {Number(activeModif.nouvelle_valeur).toFixed(2)})
                              </span>
                            )}
                            {activeModif.motif && (
                              <button
                                type="button"
                                onClick={() => setActiveMotifText(activeModif.motif)}
                                style={{
                                  fontSize: '10px', color: '#6366f1', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer', fontWeight: 600
                                }}
                              >
                                Voir le motif
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--slate-400)', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 18px' }}>
                        {existingGrade ? (
                          <button
                            type="button"
                            className="btn-sm"
                            style={{ background: '#3b82f6', color: 'white' }}
                            onClick={() => handleTriggerModifyGrade(existingGrade.id, draft.note, draft.appreciation)}
                          >
                            <Edit size={12} /> Modifier
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-sm"
                            style={{ background: hasNote ? 'var(--primary-blue)' : '#94a3b8', color: 'white', cursor: hasNote ? 'pointer' : 'not-allowed' }}
                            disabled={!hasNote}
                            onClick={() => handleSaveGrade(stud.id)}
                          >
                            <Check size={12} /> Valider
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherGradesTab;
