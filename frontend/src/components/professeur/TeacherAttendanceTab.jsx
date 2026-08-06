import React from 'react';

const TeacherAttendanceTab = ({
  attClasse,
  setAttClasse,
  attMatiere,
  setAttMatiere,
  attendanceDate,
  setAttendanceDate,
  attCreneau,
  setAttCreneau,
  activeClasses,
  getAvailableSlotOptions,
  attendanceStudents,
  attendanceRoster,
  setAttendanceRoster,
  handleSaveAttendance,
  attLoading
}) => {
  return (
    <div className="tab-pane">
      <div className="filter-bar">
        <div>
          <label>Classe</label>
          <select value={attClasse} onChange={e => { setAttClasse(e.target.value); setAttMatiere(''); }}>
            <option value="">Sélectionner</option>
            {Array.from(new Set(activeClasses.map(c => c.classe_id))).map(cId => {
              const c = activeClasses.find(cl => cl.classe_id === cId);
              return <option key={cId} value={cId}>{c.classe_nom} ({c.etablissement_nom})</option>;
            })}
          </select>
        </div>

        {attClasse && (
          <div>
            <label>Matière</label>
            <select value={attMatiere} onChange={e => setAttMatiere(e.target.value)}>
              <option value="">Sélectionner</option>
              {activeClasses.filter(c => c.classe_id === attClasse).map(c => (
                <option key={c.matiere_id} value={c.matiere_id}>{c.matiere_nom}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label>Date du cours</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={e => setAttendanceDate(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border-slate-200)' }}
          />
        </div>

        {attClasse && attMatiere && (
          <div>
            <label>Horaire / Créneau</label>
            <select value={attCreneau} onChange={e => setAttCreneau(e.target.value)}>
              {getAvailableSlotOptions().length === 0 && <option value="">Tous les créneaux</option>}
              {getAvailableSlotOptions().map(slot => (
                <option key={slot.key} value={slot.key}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {attClasse && attMatiere && (
        <div className="card-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Feuille d'Appel du cours {attCreneau ? `(${attCreneau})` : ''}</h3>
              <p className="subtitle" style={{ fontSize: '11px', color: 'var(--text-slate-500)', margin: 0 }}>
                Sélectionnez le statut de chaque élève. Les élèves marqués absent ou retard recevront une alerte.
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleSaveAttendance} disabled={attLoading} style={{ background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>
              {attLoading ? '⏳ Enregistrement...' : "Enregistrer l'Appel"}
            </button>
          </div>

          <table className="roster-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Statut de présence</th>
                <th>Détails (Durée retard / Motif)</th>
              </tr>
            </thead>
            <tbody>
              {attendanceStudents.map(stud => {
                const eleveId = stud.id;
                const record = attendanceRoster[eleveId] || { type_presence: 'PRESENT', duree_retard: '', motif: '' };

                return (
                  <tr key={eleveId}>
                    <td className="font-bold">{stud.prenom} {stud.nom}</td>
                    <td>
                      <div className="presence-toggle">
                        <button
                          type="button"
                          className={`presence-btn present ${record.type_presence === 'PRESENT' ? 'active' : ''}`}
                          onClick={() => setAttendanceRoster({
                            ...attendanceRoster,
                            [eleveId]: { ...record, type_presence: 'PRESENT' }
                          })}
                        >
                          Présent
                        </button>
                        <button
                          type="button"
                          className={`presence-btn absent ${record.type_presence === 'ABSENCE' ? 'active' : ''}`}
                          onClick={() => setAttendanceRoster({
                            ...attendanceRoster,
                            [eleveId]: { ...record, type_presence: 'ABSENCE' }
                          })}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          className={`presence-btn retard ${record.type_presence === 'RETARD' ? 'active' : ''}`}
                          onClick={() => setAttendanceRoster({
                            ...attendanceRoster,
                            [eleveId]: { ...record, type_presence: 'RETARD' }
                          })}
                        >
                          En Retard
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {record.type_presence === 'RETARD' && (
                          <input
                            type="number"
                            placeholder="min"
                            value={record.duree_retard}
                            onChange={e => setAttendanceRoster({
                              ...attendanceRoster,
                              [eleveId]: { ...record, duree_retard: e.target.value }
                            })}
                            style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', textAlign: 'center' }}
                          />
                        )}
                        <input
                          type="text"
                          placeholder="Motif / Commentaire"
                          value={record.motif}
                          onChange={e => setAttendanceRoster({
                            ...attendanceRoster,
                            [eleveId]: { ...record, motif: e.target.value }
                          })}
                          style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceTab;
