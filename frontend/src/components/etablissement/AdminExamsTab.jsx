import React from 'react';
import { Plus, Send, AlertTriangle, Edit, Trash2 } from 'lucide-react';

const AdminExamsTab = ({
  examClassId,
  setExamClassId,
  fetchExams,
  classes,
  examsAnneeFilter,
  setShowExamModal,
  handleTransmettreLivretsZone,
  proposedDevoirs,
  handleDecideProposal,
  setEditingExam,
  setNewExam,
  examPlans,
  handleDeleteExam
}) => {
  return (
    <div className="exams-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Examens</h1>
          <p className="page-subtitle">Planification des devoirs, compositions et examens</p>
        </div>
        <div className="flex gap-2 items-center">
          <select className="pill-select" value={examClassId || ''} onChange={e => { const v = e.target.value; setExamClassId(v); if (v) fetchExams(v); }}>
            <option value="">Choisir une classe</option>
            {classes.filter(c => c.annee_scolaire === examsAnneeFilter).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <button className="btn btn-primary" disabled={!examClassId} onClick={() => setShowExamModal(true)} style={{ background: 'var(--accent-color)', borderColor: 'var(--accent-color)', fontSize: '11px', padding: '6px 14px' }}>
            <Plus size={16} /> Planifier un examen
          </button>
          <button className="btn" onClick={handleTransmettreLivretsZone} style={{ background: '#059669', borderColor: '#059669', color: '#ffffff', fontSize: '11px', padding: '6px 14px', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <Send size={14} /> Transmettre Livrets (Zone BAC)
          </button>
        </div>
      </div>

      {/* Propositions des enseignants section */}
      {proposedDevoirs.length > 0 && (
        <div className="table-block" style={{ marginBottom: '24px', borderColor: '#fde68a', background: '#fffbeb' }}>
          <div className="table-block-header" style={{ borderBottom: '1px solid #fef3c7' }}>
            <div className="table-block-title">
              <h3 style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> Propositions de devoirs des enseignants ({proposedDevoirs.length})
              </h3>
            </div>
          </div>
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enseignant</th>
                  <th>Classe</th>
                  <th>Matière</th>
                  <th>Type</th>
                  <th>Date & Heure proposées</th>
                  <th>Salle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposedDevoirs.map(prop => (
                  <tr key={prop.id} style={{ background: '#ffffff' }}>
                    <td className="font-bold">{prop.prof_prenom} {prop.prof_nom}</td>
                    <td className="font-bold">{prop.classe_nom}</td>
                    <td>{prop.matiere_nom}</td>
                    <td>
                      <span className="status-pill status-pass" style={{ padding: '2px 8px', fontSize: '9.5px', fontWeight: 700 }}>
                        {prop.type_examen}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>
                        {new Date(prop.date_examen).toLocaleString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td>{prop.salle || '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleDecideProposal(prop.id, 'VALIDER')}
                          style={{ background: '#16a34a', borderColor: '#16a34a', fontSize: '10.5px', padding: '4px 10px', color: '#fff' }}
                        >
                          Accepter & Planifier
                        </button>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => {
                            setEditingExam(prop);
                            setExamClassId(prop.classe_id);
                            const d = new Date(prop.date_examen);
                            setNewExam({
                              matiere_id: prop.matiere_id,
                              type_examen: prop.type_examen,
                              date_examen: d.toISOString().split('T')[0],
                              heure_examen: prop.date_examen ? d.toTimeString().slice(0, 5) : '',
                              salle: prop.salle || ''
                            });
                            setShowExamModal(true);
                          }}
                          style={{ color: 'var(--primary-color)', borderColor: '#cbd5e1', fontSize: '10.5px', padding: '4px 10px' }}
                        >
                          Modifier
                        </button>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleDecideProposal(prop.id, 'REFUSER')}
                          style={{ color: '#dc2626', borderColor: '#fecaca', fontSize: '10.5px', padding: '4px 10px' }}
                        >
                          Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {examClassId ? (
        <div className="table-block">
          <div className="table-block-header">
            <div className="table-block-title">
              <h3>Épreuves planifiées</h3>
            </div>
          </div>

          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            {(() => {
              const upcomingExams = examPlans.filter(ex => {
                const examDate = new Date(ex.date_examen);
                const now = new Date();
                if (!ex.date_examen.includes('T')) {
                  const [year, month, day] = ex.date_examen.split('-').map(Number);
                  const examDateStart = new Date(year, month - 1, day);
                  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  return examDateStart >= nowStart;
                }
                return examDate >= now;
              });

              return upcomingExams.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--slate-400)', fontSize: '13px', fontWeight: 500 }}>
                  Aucun examen planifié pour cette classe.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date & Heure</th>
                      <th>Matière</th>
                      <th>Type d'épreuve</th>
                      <th>Salle</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingExams.map(ex => (
                      <tr key={ex.id}>
                        <td>
                          {(() => {
                            const d = new Date(ex.date_examen);
                            const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                            const timeStr = ex.date_examen.includes('T') ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null;
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 600 }}>{dateStr}</span>
                                {timeStr && <span className="exam-time-badge" style={{ background: 'rgba(19,30,108,0.06)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>{timeStr}</span>}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="font-bold">{ex.matiere_nom}</td>
                        <td>
                          <span className={`status-pill ${ex.type_examen === 'EXAMEN' ? 'status-fail' : ex.type_examen === 'COMPOSITION' ? 'status-warning' : 'status-pass'}`} style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 700 }}>
                            {ex.type_examen}
                          </span>
                        </td>
                        <td>{ex.salle || <span className="text-slate-400">Non spécifiée</span>}</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn-action-text modifier" title="Modifier" onClick={() => {
                              setEditingExam(ex);
                              const d = new Date(ex.date_examen);
                              setNewExam({
                                matiere_id: ex.matiere_id,
                                type_examen: ex.type_examen,
                                date_examen: d.toISOString().split('T')[0],
                                heure_examen: ex.date_examen.includes('T') ? d.toTimeString().slice(0, 5) : '',
                                salle: ex.salle || ''
                              });
                              setShowExamModal(true);
                            }}>
                              <Edit size={12} /> <span>Modifier</span>
                            </button>
                            <button className="btn-action-text delete-btn" title="Supprimer" onClick={() => handleDeleteExam(ex.id)} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                              <Trash2 size={12} /> <span>Supprimer</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="table-block" style={{ padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', color: 'var(--slate-400)', fontSize: '13px', fontWeight: 500 }}>
            Veuillez sélectionner une classe pour afficher ou planifier ses épreuves d'examen.
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExamsTab;
