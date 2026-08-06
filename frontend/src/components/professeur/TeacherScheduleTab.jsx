import React from 'react';
import { FileText, RefreshCw, AlertTriangle, Building } from 'lucide-react';

const TeacherScheduleTab = ({
  activeSchedule,
  schedule,
  profAnneeFilter,
  scheduleViewMode,
  setScheduleViewMode,
  handleDownloadPDF,
  setShowSyncModal,
  hasConflict,
  getEtabColor
}) => {
  return (
    <div className="tab-pane">
      <div className="card-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Emploi du Temps Consolidé</h3>
            <p className="subtitle" style={{ fontSize: '12px', color: 'var(--text-slate-500)', margin: '4px 0 0' }}>
              Aperçu de tous vos cours sur l'ensemble de vos établissements affiliés.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}>
              <FileText size={14} /> Exporter PDF
            </button>
            <button className="btn btn-primary" onClick={() => setShowSyncModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}>
              <RefreshCw size={14} /> Synchroniser l'Agenda
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', gap: '16px' }}>
          <button 
            onClick={() => setScheduleViewMode('weekly')}
            style={{
              padding: '10px 4px', background: 'none', border: 'none',
              borderBottom: scheduleViewMode === 'weekly' ? '2px solid var(--primary-color)' : 'none',
              color: scheduleViewMode === 'weekly' ? 'var(--primary-color)' : 'var(--text-slate-500)',
              fontWeight: scheduleViewMode === 'weekly' ? 700 : 500, fontSize: '13px', cursor: 'pointer'
            }}
          >
            Vue Hebdomadaire
          </button>
          <button 
            onClick={() => setScheduleViewMode('etablissement')}
            style={{
              padding: '10px 4px', background: 'none', border: 'none',
              borderBottom: scheduleViewMode === 'etablissement' ? '2px solid var(--primary-color)' : 'none',
              color: scheduleViewMode === 'etablissement' ? 'var(--primary-color)' : 'var(--text-slate-500)',
              fontWeight: scheduleViewMode === 'etablissement' ? 700 : 500, fontSize: '13px', cursor: 'pointer'
            }}
          >
            Vue par Établissement
          </button>
        </div>

        {scheduleViewMode === 'weekly' ? (
          <div className="table-block" style={{ marginTop: '12px', overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                    <th key={day} style={{ textAlign: 'center', fontWeight: 700, padding: '12px 8px', background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const slotsMap = {};
                  activeSchedule.forEach(e => {
                    const start = e.heure_debut?.slice(0, 5) || '';
                    const end = e.heure_fin?.slice(0, 5) || '';
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
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-slate-400)', fontSize: '13px' }}>
                          Aucun cours planifié dans votre emploi du temps ({profAnneeFilter}).
                        </td>
                      </tr>
                    );
                  }

                  return sortedSlots.map(slotKey => (
                    <tr key={slotKey}>
                      {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(jour => {
                        const dayEntries = activeSchedule.filter(e => 
                          e.jour_semaine === jour && 
                          `${e.heure_debut?.slice(0, 5)} - ${e.heure_fin?.slice(0, 5)}` === slotKey
                        );

                        return (
                          <td key={jour} style={{ 
                            padding: '8px', 
                            verticalAlign: 'top', 
                            height: '115px', 
                            width: '16.6%',
                            background: dayEntries.length > 0 ? 'transparent' : '#FCFDFE',
                            border: '1px solid #F1F5F9'
                          }}>
                            {dayEntries.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '100%' }}>
                                {dayEntries.map(slot => {
                                  const conflict = hasConflict(slot, schedule.filter(s => s.jour_semaine === jour));
                                  const colors = getEtabColor(slot.etablissement_nom);
                                  return (
                                    <div
                                      key={slot.id}
                                      style={{
                                        margin: 0,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        background: colors.bg || 'var(--bg-card, #ffffff)',
                                        borderLeft: `4px solid ${conflict ? '#ef4444' : (colors.text || 'var(--primary-color)')}`,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                        padding: '8px 10px',
                                        borderRadius: '8px',
                                        borderRight: `1px solid ${colors.border || '#e2e8f0'}`,
                                        borderTop: `1px solid ${colors.border || '#e2e8f0'}`,
                                        borderBottom: `1px solid ${colors.border || '#e2e8f0'}`,
                                        position: 'relative'
                                      }}
                                    >
                                      {conflict && (
                                        <AlertTriangle 
                                          size={13} 
                                          style={{ position: 'absolute', top: '6px', right: '6px', color: '#ef4444' }} 
                                          title="Chevauchement détecté" 
                                        />
                                      )}
                                      <div>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: colors.text || 'var(--slate-500)', marginBottom: '3px' }}>
                                          {slotKey}
                                        </div>
                                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '12px', marginBottom: '2px' }}>
                                          {slot.classe_nom}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 600, marginBottom: '4px' }}>
                                          {slot.matiere_nom}
                                        </div>
                                        <div style={{ fontSize: '10px', color: colors.text || 'var(--slate-600)', fontWeight: 600 }}>
                                          {slot.etablissement_nom}
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                        <span style={{ 
                                          background: 'rgba(0,0,0,0.04)', 
                                          padding: '2px 6px', 
                                          borderRadius: '4px', 
                                          fontSize: '9.5px', 
                                          fontWeight: 600,
                                          color: 'var(--slate-600)'
                                        }}>
                                          {slot.salle ? `Salle: ${slot.salle}` : 'Salle N/A'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div style={{ height: '100%', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', fontSize: '10px', fontWeight: 500 }}>
                                —
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
          <div>
            {Array.from(new Set(schedule.map(s => s.etablissement_nom))).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-slate-400)' }}>
                Aucun créneau planifié.
              </div>
            ) : (
              Array.from(new Set(schedule.map(s => s.etablissement_nom))).map(etabName => {
                const etabSlots = schedule.filter(s => s.etablissement_nom === etabName)
                  .sort((a, b) => {
                    const daysOrder = { 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6, 'Dimanche': 7 };
                    const dayDiff = (daysOrder[a.jour_semaine] || 8) - (daysOrder[b.jour_semaine] || 8);
                    if (dayDiff !== 0) return dayDiff;
                    return a.heure_debut.localeCompare(b.heure_debut);
                  });
                const colors = getEtabColor(etabName);
                return (
                  <div key={etabName} style={{ marginBottom: '24px', border: `1px solid ${colors.border}`, borderRadius: '12px', background: 'white', overflow: 'hidden' }}>
                    <div style={{ background: colors.bg, padding: '12px 18px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building size={16} style={{ color: colors.text }} />
                      <h4 style={{ margin: 0, color: colors.text, fontWeight: 800 }}>{etabName}</h4>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: 'var(--text-slate-500)', fontWeight: 700 }}>
                            <th style={{ padding: '10px 18px' }}>Jour</th>
                            <th style={{ padding: '10px 18px' }}>Horaires</th>
                            <th style={{ padding: '10px 18px' }}>Classe</th>
                            <th style={{ padding: '10px 18px' }}>Matière</th>
                            <th style={{ padding: '10px 18px' }}>Salle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {etabSlots.map(slot => (
                            <tr key={slot.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                              <td style={{ padding: '10px 18px', fontWeight: 700 }}>{slot.jour_semaine}</td>
                              <td style={{ padding: '10px 18px', color: colors.text, fontWeight: 700 }}>{slot.heure_debut.slice(0, 5)} - {slot.heure_fin.slice(0, 5)}</td>
                              <td style={{ padding: '10px 18px', fontWeight: 700 }}>{slot.classe_nom}</td>
                              <td style={{ padding: '10px 18px' }}>{slot.matiere_nom}</td>
                              <td style={{ padding: '10px 18px', color: 'var(--text-slate-500)' }}>{slot.salle || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherScheduleTab;
