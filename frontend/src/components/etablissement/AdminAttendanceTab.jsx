import React from 'react';
import { Loader2, Users, User } from 'lucide-react';

const AdminAttendanceTab = ({
  selectedYear,
  absSearchQuery,
  setAbsSearchQuery,
  fetchAbsencesLog,
  absClassFilter,
  setAbsClassFilter,
  classes,
  attendanceAnneeFilter,
  absStatusFilter,
  setAbsStatusFilter,
  absDateFilter,
  setAbsDateFilter,
  absencesLog,
  absLoading,
  setViewMotifModal,
  setSelectedAbsenceForJustify,
  setAbsJustificationMotif
}) => {
  return (
    <div className="attendance-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suivi de l'Assiduité</h1>
          <p className="page-subtitle">Gestion et justification des absences & retards de l'établissement</p>
        </div>
        <span className="school-badge" style={{ fontSize: '11.5px', padding: '6px 12px', background: 'rgba(19, 30, 108, 0.05)', color: 'var(--primary-color)', borderRadius: '6px' }}>
          Année : {selectedYear}
        </span>
      </div>

      {/* Filters */}
      <div className="filter-card" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ margin: 0, flex: 2, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Élève</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Rechercher par nom..." 
                value={absSearchQuery} 
                onChange={e => setAbsSearchQuery(e.target.value)} 
                className="form-control"
                style={{ height: '38px', borderRadius: '8px', fontSize: '13px' }}
              />
              <button 
                className="btn btn-primary" 
                onClick={() => fetchAbsencesLog(absClassFilter, absStatusFilter, absDateFilter, absSearchQuery)}
                style={{ background: 'var(--primary-color)', height: '38px', fontSize: '12px' }}
              >
                Rechercher
              </button>
            </div>
          </div>

          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Classe</label>
            <select
              value={absClassFilter}
              onChange={e => setAbsClassFilter(e.target.value)}
              className="pill-select"
              style={{ width: '100%', borderRadius: '8px', padding: '8px 12px', height: '38px', fontSize: '12px' }}
            >
              <option value="">Toutes les classes</option>
              {classes.filter(c => c.annee_scolaire === attendanceAnneeFilter).map(c => <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>)}
            </select>
          </div>

          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>État</label>
            <select
              value={absStatusFilter}
              onChange={e => setAbsStatusFilter(e.target.value)}
              className="pill-select"
              style={{ width: '100%', borderRadius: '8px', padding: '8px 12px', height: '38px', fontSize: '12px' }}
            >
              <option value="">Tous les états</option>
              <option value="false">Non justifiée</option>
              <option value="true">Justifiée</option>
            </select>
          </div>

          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Date</label>
            <input
              type="date"
              value={absDateFilter}
              onChange={e => setAbsDateFilter(e.target.value)}
              style={{ width: '100%', borderRadius: '8px', padding: '8px 12px', height: '38px', fontSize: '12px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ margin: 0 }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                setAbsClassFilter('');
                setAbsStatusFilter('');
                setAbsDateFilter('');
                setAbsSearchQuery('');
                fetchAbsencesLog('', '', '', '');
              }}
              style={{ height: '38px', padding: '0 16px', fontSize: '12px' }}
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-block">
        <div className="table-block-header">
          <div className="table-block-title">
            <h3>Registre des Absences & Retards</h3>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--slate-400)', fontWeight: 600 }}>
            {absencesLog.length} entrée{absencesLog.length !== 1 ? 's' : ''}
          </span>
        </div>

        {absLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={28} style={{ color: 'var(--primary-color)' }} />
            <p style={{ marginTop: 12, color: 'var(--slate-400)', fontSize: '13px' }}>Chargement du registre…</p>
          </div>
        ) : absencesLog.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Users size={36} style={{ color: 'var(--slate-200)', marginBottom: 12 }} />
            <p style={{ color: 'var(--slate-400)', fontSize: '13px', fontWeight: 500 }}>Aucune absence ni retard enregistré.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none', overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '950px' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Type / Détails</th>
                  <th>Matière</th>
                  <th>Professeur</th>
                  <th>Motif initial (Prof)</th>
                  <th>Statut</th>
                  <th>Justification (Admin)</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {absencesLog.map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--slate-700)' }}>
                        {new Date(entry.date_absence).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small"><User size={12} /></div>
                        <span style={{ fontWeight: 600, fontSize: '12px' }}>{entry.eleve_nom} {entry.eleve_prenom}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--slate-600)' }}>{entry.classe_nom}</span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '3px 8px',
                        borderRadius: '20px', textTransform: 'uppercase',
                        background: entry.type_presence === 'ABSENCE' ? 'rgba(239,68,68,0.1)' : 'rgba(234,88,12,0.1)',
                        color: entry.type_presence === 'ABSENCE' ? '#b91c1c' : '#c2410c'
                      }}>
                        {entry.type_presence === 'ABSENCE' ? 'Absence' : `Retard (${entry.duree_retard} min)`}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{entry.matiere_nom}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: 'var(--slate-600)' }}>
                        {entry.prof_nom ? `${entry.prof_nom} ${entry.prof_prenom}` : '—'}
                      </span>
                    </td>
                    <td>
                      {entry.motif ? (
                        <button
                          onClick={() => setViewMotifModal({ titre: 'Motif initial (Prof)', texte: entry.motif, entry })}
                          style={{ padding: '3px 10px', fontSize: '10.5px', fontWeight: 600, borderRadius: '6px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          Voir motif
                        </button>
                      ) : <span style={{ color: 'var(--slate-400)', fontSize: '12px' }}>—</span>}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '10.5px', fontWeight: 700,
                        background: entry.justifiee ? '#dcfce7' : '#fee2e2',
                        color: entry.justifiee ? '#15803d' : '#b91c1c'
                      }}>
                        {entry.justifiee ? 'Justifiée' : 'Non justifiée'}
                      </span>
                    </td>
                    <td>
                      {entry.motif_justification ? (
                        <button
                          onClick={() => setViewMotifModal({ titre: 'Justification (Admin)', texte: entry.motif_justification, entry })}
                          style={{ padding: '3px 10px', fontSize: '10.5px', fontWeight: 600, borderRadius: '6px', border: '1px solid #15803d', color: '#15803d', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          Voir motif
                        </button>
                      ) : <span style={{ color: 'var(--slate-400)', fontSize: '12px' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {!entry.justifiee ? (
                        <button
                          className="btn btn-outline"
                          onClick={() => {
                            setSelectedAbsenceForJustify(entry);
                            setAbsJustificationMotif('');
                          }}
                          style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                        >
                          Justifier
                        </button>
                      ) : (
                        <span style={{ color: 'var(--slate-400)', fontSize: '11px', fontWeight: 600 }}>Traité ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceTab;
