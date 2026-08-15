import React, { useState } from 'react';
import { Loader2, Users, User, QrCode, ExternalLink } from 'lucide-react';

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
  const [subTab, setSubTab] = useState('eleves');

  const demoProfsEmargements = [
    { id: 1, prof: 'Prof. Rassoul NDOYE', matiere: 'Mathématiques', classe: 'Terminale S2', heure: '08h03', mode: 'QR_SCAN_20S', statut: 'VALIDE_COMPLET', cahier: 'Chapitre 4: Intégration' },
    { id: 2, prof: 'Prof. Moussa DIOP', matiere: 'EPS', classe: '3ème A', heure: '08h05', mode: 'EPS_GPS_TERRAIN', statut: 'PRESENCE_SCANNEE', cahier: 'En attente' },
    { id: 3, prof: 'Prof. Awa SARR', matiere: 'Physique-Chimie', classe: '1ère S1', heure: '09h00', mode: 'RATTRAPAGE', statut: 'RATTRAPAGE_APPROUVE', cahier: 'Rattrapage mécanique' },
    { id: 4, prof: 'Prof. Cheikh BA', matiere: 'Philosophie', classe: 'Terminale L2', heure: '—', mode: 'AUCUN', statut: 'ABSENT_NON_EMARGE', cahier: '—' },
  ];

  return (
    <div className="attendance-view">
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Suivi de l'Assiduité</h1>
          <p className="page-subtitle">Gestion des absences des élèves & émargement en temps réel des professeurs</p>
        </div>

        {/* Toggle Élèves vs Enseignants */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.04)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setSubTab('eleves')}
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: subTab === 'eleves' ? '#131e6c' : 'transparent',
              color: subTab === 'eleves' ? '#ffffff' : '#64748b'
            }}
          >
            Assiduité Élèves
          </button>
          <button
            onClick={() => setSubTab('professeurs')}
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: subTab === 'professeurs' ? '#131e6c' : 'transparent',
              color: subTab === 'professeurs' ? '#ffffff' : '#64748b'
            }}
          >
            Émargement Professeurs (QR 20s & GPS)
          </button>
        </div>
      </div>

      {subTab === 'eleves' && (
        <>
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
        </>
      )}

      {/* VUE 2 : ÉMARGEMENT ET ASSIDUITÉ DES PROFESSEURS */}
      {subTab === 'professeurs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Bannière de lancement Borne QR Code Externe */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            border: '1px solid #312e81',
            borderRadius: '16px',
            padding: '24px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '14px', borderRadius: '14px' }}>
                <QrCode size={32} color="#818cf8" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#ffffff' }}>Borne d'Émargement Sécurisée TOTP 20s</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Affichez le QR Code dynamique 20s en plein écran sur la télé de la salle des profs ou un second écran sans bloquer votre travail.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const popWindow = window.open('/emargement/live-qr/default', 'QREmargementLiveKiosque', 'width=1024,height=768,menubar=no,toolbar=no,location=no,status=no,resizable=yes');
                window.addEventListener('beforeunload', () => { if (popWindow && !popWindow.closed) popWindow.close(); });
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 20px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff', fontSize: '13px', fontWeight: 800, borderRadius: '12px',
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(79,70,229,0.4)'
              }}
            >
              <ExternalLink size={16} /> Afficher le QR Code en Externe
            </button>
          </div>

          {/* Tableau de suivi du jour */}
          <div className="table-block">
            <div className="table-block-header">
              <div className="table-block-title">
                <h3>Suivi des Émargements Enseignants du Jour ({new Date().toLocaleDateString('fr-FR')})</h3>
              </div>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '4px 10px', borderRadius: '20px' }}>
                7 / 8 Professeurs Émargés (87.5%)
              </span>
            </div>

            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Professeur</th>
                    <th>Matière & Classe</th>
                    <th>Heure Scan</th>
                    <th>Mode Émargement</th>
                    <th>Cahier de Texte</th>
                    <th>Statut Séance</th>
                    <th style={{ textAlign: 'center' }}>Action Surveillant</th>
                  </tr>
                </thead>
                <tbody>
                  {demoProfsEmargements.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{item.prof}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{item.matiere} • <span style={{ color: 'var(--slate-500)' }}>{item.classe}</span></div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700 }}>{item.heure}</div>
                      </td>
                      <td>
                        {item.mode === 'QR_SCAN_20S' && <span style={{ fontSize: '10.5px', fontWeight: 700, background: '#e0e7ff', color: '#3730a3', padding: '3px 8px', borderRadius: '6px' }}>QR Code 20s</span>}
                        {item.mode === 'EPS_GPS_TERRAIN' && <span style={{ fontSize: '10.5px', fontWeight: 700, background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px' }}>GPS Terrain EPS</span>}
                        {item.mode === 'RATTRAPAGE' && <span style={{ fontSize: '10.5px', fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px' }}>Rattrapage</span>}
                        {item.mode === 'AUCUN' && <span style={{ fontSize: '10.5px', fontWeight: 700, background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '6px' }}>Aucun</span>}
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', color: item.cahier.includes('En attente') ? '#d97706' : '#166534', fontWeight: 600 }}>
                          {item.cahier}
                        </span>
                      </td>
                      <td>
                        {item.statut === 'VALIDE_COMPLET' && <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>Validé complet</span>}
                        {item.statut === 'PRESENCE_SCANNEE' && <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706' }}>Présence scannée</span>}
                        {item.statut === 'RATTRAPAGE_APPROUVE' && <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>Rattrapage approuvé</span>}
                        {item.statut === 'ABSENT_NON_EMARGE' && <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626' }}>Non émargé</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {item.statut === 'ABSENT_NON_EMARGE' ? (
                          <button style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: '1px solid #dc2626', color: '#dc2626', background: 'transparent', cursor: 'pointer' }}>
                            Signaler Absence
                          </button>
                        ) : (
                          <button style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', border: '1px solid #64748b', color: '#64748b', background: 'transparent', cursor: 'pointer' }}>
                            Détails
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendanceTab;
