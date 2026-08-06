import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const AdminScheduleTab = ({
  scheduleClassId,
  setScheduleClassId,
  fetchSchedule,
  fetchScheduleMatieres,
  classes,
  scheduleAnneeFilter,
  setShowScheduleModal,
  scheduleEntries,
  handleDeleteSchedule
}) => {
  return (
    <div className="schedule-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Emploi du Temps</h1>
          <p className="page-subtitle">Grille de cours hebdomadaire de l'établissement</p>
        </div>
        <div className="flex gap-2 items-center">
          <select className="pill-select" value={scheduleClassId || ''} onChange={e => { const v = e.target.value; setScheduleClassId(v); if (v) { fetchSchedule(v); fetchScheduleMatieres(v); } }}>
            <option value="">Choisir une classe</option>
            {classes.filter(c => c.annee_scolaire === scheduleAnneeFilter).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <button className="btn btn-primary" disabled={!scheduleClassId} onClick={() => { fetchScheduleMatieres(scheduleClassId); setShowScheduleModal(true); }} style={{ background: 'var(--accent-color)', borderColor: 'var(--accent-color)', fontSize: '11px', padding: '6px 14px' }}>
            <Plus size={16} /> Ajouter un créneau
          </button>
        </div>
      </div>

      {scheduleClassId ? (
        <div className="table-block" style={{ marginTop: '16px', overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                  <th key={day} style={{ textAlign: 'center', fontWeight: 700 }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const slotsMap = {};
                scheduleEntries.forEach(e => {
                  const start = e.heure_debut?.slice(0,5) || '';
                  const end = e.heure_fin?.slice(0,5) || '';
                  if (start && end) {
                    const key = `${start} - ${end}`;
                    slotsMap[key] = { start, end };
                  }
                });
                const sortedSlots = Object.keys(slotsMap).sort((a, b) => {
                  return slotsMap[a].start.localeCompare(slotsMap[b].start);
                });

                if (sortedSlots.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-400)' }}>
                        Aucun cours planifié pour cette classe.
                      </td>
                    </tr>
                  );
                }

                return sortedSlots.map(slot => (
                  <tr key={slot}>
                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(jour => {
                      const entry = scheduleEntries.find(e => 
                        e.jour_semaine === jour && 
                        `${e.heure_debut?.slice(0,5)} - ${e.heure_fin?.slice(0,5)}` === slot
                      );
                      return (
                        <td key={jour} style={{ 
                          padding: '8px', 
                          verticalAlign: 'top', 
                          height: '110px', 
                          width: '16.6%',
                          background: entry ? 'transparent' : '#FCFDFE'
                        }}>
                          {entry ? (
                            <div 
                              className={`schedule-slot ${entry.matiere_nom?.toLowerCase().replace(/\s/g, '-')}`}
                              style={{ 
                                margin: 0, 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'space-between',
                                background: 'var(--bg-card)',
                                borderLeft: '4px solid var(--primary-color)',
                                boxShadow: 'var(--shadow-sm)',
                                padding: '10px',
                                borderRadius: '8px',
                                borderRight: '1px solid var(--border-color)',
                                borderTop: '1px solid var(--border-color)',
                                borderBottom: '1px solid var(--border-color)',
                                position: 'relative'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--slate-400)', marginBottom: '3px' }}>
                                  {slot}
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '12px', marginBottom: '4px' }}>
                                  {entry.matiere_nom}
                                </div>
                                <div style={{ fontSize: '10.5px', color: 'var(--slate-500)', wordBreak: 'break-all' }}>
                                  {entry.professeur_nom}
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <span style={{ 
                                  background: 'var(--secondary-color)', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px', 
                                  fontSize: '9.5px', 
                                  fontWeight: 600,
                                  color: 'var(--primary-color)'
                                }}>
                                  {entry.salle ? `Salle ${entry.salle}` : 'N/A'}
                                </span>
                                <button 
                                  style={{ 
                                    color: 'var(--error)', 
                                    cursor: 'pointer', 
                                    opacity: 0.6,
                                    transition: 'opacity 0.15s' 
                                  }}
                                  onClick={() => handleDeleteSchedule(entry.id)}
                                  title="Supprimer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ 
                              height: '100%', 
                              border: '1.5px dashed #E2E8F0', 
                              borderRadius: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#cbd5e1',
                              fontSize: '11px',
                              fontWeight: 500,
                              gap: '4px'
                            }}>
                              <span>Pas de cours</span>
                              <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>{slot}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-block" style={{ padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', color: 'var(--slate-400)', fontSize: '13px', fontWeight: 500 }}>
            Veuillez sélectionner une classe pour afficher ou configurer son emploi du temps.
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminScheduleTab;
