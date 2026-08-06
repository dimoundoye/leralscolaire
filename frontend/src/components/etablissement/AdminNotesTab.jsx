import React from 'react';
import {
  BookOpenCheck, GraduationCap, History, Activity, Settings, Loader2,
  User, RefreshCw, Unlock, Lock
} from 'lucide-react';

const AdminNotesTab = ({
  notesSubTab,
  setNotesSubTab,
  selectedSemestre,
  setSelectedSemestre,
  selectedClasse,
  setSelectedClasse,
  selectedMatiere,
  setSelectedMatiere,
  classes,
  matieres,
  notesAnneeScolaire,
  handleSaveNotes,
  loading,
  notesGrid,
  setNotesGrid,
  getAutomaticAppreciation,
  decisionsClasseId,
  setDecisionsClasseId,
  fetchDecisions,
  setShowReglesModal,
  handleSaveDecisions,
  decisions,
  updateDecision,
  auditClasseFilter,
  setAuditClasseFilter,
  auditTrimestreFilter,
  setAuditTrimestreFilter,
  fetchAuditLog,
  auditLoading,
  auditLog,
  setActiveMotifText,
  openAuditConfirmModal,
  suiviSemestre,
  setSuiviSemestre,
  fetchSuiviRemplissage,
  suiviLoading,
  suiviRemplissage,
  handleToggleBulletinPublication
}) => {
  return (
    <div className="notes-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes & Bulletins</h1>
          <p className="page-subtitle">Saisie des notes scolaires et décisions de passage annuel</p>
        </div>
      </div>

      {/* Modern Rounded Sub-Tab Switcher */}
      <div style={{ marginBottom: '20px' }}>
        <div className="status-toggle-pill" style={{ display: 'inline-flex' }}>
          <button className={`status-toggle-btn ${notesSubTab === 'saisie' ? 'active' : ''}`} onClick={() => setNotesSubTab('saisie')}>
            <BookOpenCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Saisie des Notes
          </button>
          <button className={`status-toggle-btn ${notesSubTab === 'decisions' ? 'active' : ''}`} onClick={() => setNotesSubTab('decisions')}>
            <GraduationCap size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Décisions de Passage
          </button>
          <button
            className={`status-toggle-btn ${notesSubTab === 'audit' ? 'active' : ''}`}
            onClick={() => { setNotesSubTab('audit'); fetchAuditLog(auditClasseFilter, auditTrimestreFilter); }}
          >
            <History size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Journal d'Audit
          </button>
          <button
            className={`status-toggle-btn ${notesSubTab === 'suivi' ? 'active' : ''}`}
            onClick={() => { setNotesSubTab('suivi'); fetchSuiviRemplissage(suiviSemestre); }}
          >
            <Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Suivi du Remplissage
          </button>
        </div>
      </div>

      {notesSubTab === 'saisie' && (
        <>
          {/* Criteria Filter Card */}
          <div className="filter-card" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Période (Semestre)</label>
                <select value={selectedSemestre} onChange={e => setSelectedSemestre(parseInt(e.target.value))} className="pill-select" style={{ width: '100%', borderRadius: '8px', padding: '8px 12px', height: '38px', fontSize: '12px' }}>
                  <option value={1}>1er Semestre</option>
                  <option value={2}>2ème Semestre</option>
                </select>
              </div>
              <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Classe</label>
                <select value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)} className="pill-select" style={{ width: '100%', borderRadius: '8px', padding: '8px 12px', height: '38px', fontSize: '12px' }}>
                  <option value="">Sélectionner une classe</option>
                  {classes.filter(c => c.annee_scolaire === notesAnneeScolaire).map(c => <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>)}
                </select>
              </div>
              <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Matière</label>
                <select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)} className="pill-select" style={{ width: '100%', borderRadius: '8px', padding: '8px 12px', height: '38px', fontSize: '12px' }}>
                  <option value="">Sélectionner une matière</option>
                  {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
              </div>
              <div style={{ margin: 0 }}>
                <button className="btn btn-primary" onClick={handleSaveNotes} disabled={loading || notesGrid.length === 0} style={{ background: 'var(--primary-color)', height: '38px', padding: '0 24px', fontSize: '12px', fontWeight: 700 }}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Enregistrer les notes'}
                </button>
              </div>
            </div>
          </div>

          {selectedClasse && selectedMatiere && notesGrid.length > 0 && (() => {
            const totalStudents = notesGrid.length;
            const devoirCount = notesGrid.filter(n => n.note_devoir !== '' && n.note_devoir !== null).length;
            const examenCount = notesGrid.filter(n => n.note_examen !== '' && n.note_examen !== null).length;
            const devoirPct = totalStudents > 0 ? Math.round((devoirCount / totalStudents) * 100) : 0;
            const examenPct = totalStudents > 0 ? Math.round((examenCount / totalStudents) * 100) : 0;

            return (
              <>
                <div className="progress-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div className="progress-card animate-fade-in" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Remplissage Devoir</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-color)' }}>
                        {devoirCount} / {totalStudents} élèves ({devoirPct}%)
                      </span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--primary-color)', width: `${devoirPct}%`, height: '100%', borderRadius: '10px', transition: 'width 0.3s ease' }} />
                    </div>
                    {devoirCount < totalStudents ? (
                      <p style={{ margin: '8px 0 0 0', fontSize: '10.5px', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>⚠️</span> Il reste <strong>{totalStudents - devoirCount}</strong> élève(s) sans note de devoir.
                      </p>
                    ) : (
                      <p style={{ margin: '8px 0 0 0', fontSize: '10.5px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>✅</span> Tous les élèves ont une note de devoir.
                      </p>
                    )}
                  </div>

                  <div className="progress-card animate-fade-in" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Remplissage Examen</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>
                        {examenCount} / {totalStudents} élèves ({examenPct}%)
                      </span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ background: '#10b981', width: `${examenPct}%`, height: '100%', borderRadius: '10px', transition: 'width 0.3s ease' }} />
                    </div>
                    {examenCount < totalStudents ? (
                      <p style={{ margin: '8px 0 0 0', fontSize: '10.5px', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>⚠️</span> Il reste <strong>{totalStudents - examenCount}</strong> élève(s) sans note d'examen.
                      </p>
                    ) : (
                      <p style={{ margin: '8px 0 0 0', fontSize: '10.5px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>✅</span> Tous les élèves ont une note d'examen.
                      </p>
                    )}
                  </div>
                </div>

                <div className="table-block animate-fade-in">
                  <div className="table-block-header">
                    <div className="table-block-title">
                      <h3>Grille de saisie des notes</h3>
                    </div>
                  </div>

                  <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Élève</th>
                          <th style={{width: '140px'}}>Devoir (0-20)</th>
                          <th style={{width: '140px'}}>Examen (0-20)</th>
                          <th style={{width: '150px'}}>Moyenne Calculée</th>
                          <th>Appréciation / Observation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notesGrid.map((n, idx) => {
                          const moy = (parseFloat(n.note_devoir || 0) + parseFloat(n.note_examen || 0)) / 2;
                          return (
                            <tr key={n.eleve_id}>
                              <td>
                                <div className="user-cell">
                                  <div className="user-avatar-small"><User size={14}/></div>
                                  <span className="font-bold">{n.nom} {n.prenom}</span>
                                </div>
                              </td>
                              <td>
                                <input 
                                  type="number" min="0" max="20" step="0.25"
                                  value={n.note_devoir} 
                                  disabled={n.readonly}
                                  onChange={e => {
                                    const newGrid = [...notesGrid];
                                    newGrid[idx].note_devoir = e.target.value;
                                    const dev = parseFloat(e.target.value || 0);
                                    const exam = parseFloat(newGrid[idx].note_examen || 0);
                                    const moy = (dev + exam) / 2;
                                    newGrid[idx].appreciation = getAutomaticAppreciation(moy);
                                    setNotesGrid(newGrid);
                                  }}
                                  className={'note-input' + (n.readonly ? ' note-readonly' : '')} placeholder="Saisir note..."
                                  style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1.5px solid var(--border-color)', padding: '0 10px', fontSize: '12px', outline: 'none' }}
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" min="0" max="20" step="0.25"
                                  value={n.note_examen} 
                                  disabled={n.readonly}
                                  onChange={e => {
                                    const newGrid = [...notesGrid];
                                    newGrid[idx].note_examen = e.target.value;
                                    const dev = parseFloat(newGrid[idx].note_devoir || 0);
                                    const exam = parseFloat(e.target.value || 0);
                                    const moy = (dev + exam) / 2;
                                    newGrid[idx].appreciation = getAutomaticAppreciation(moy);
                                    setNotesGrid(newGrid);
                                  }}
                                  className={'note-input' + (n.readonly ? ' note-readonly' : '')} placeholder="Saisir note..."
                                  style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1.5px solid var(--border-color)', padding: '0 10px', fontSize: '12px', outline: 'none' }}
                                />
                              </td>
                              <td>
                                {n.note_devoir !== '' && n.note_examen !== '' ? (
                                  <span className={`status-pill ${moy >= 10 ? 'status-pass' : 'status-fail'}`} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}>
                                    {moy.toFixed(2)} / 20
                                  </span>
                                ) : (
                                  <span className="text-slate-400" style={{ fontSize: '11px', fontWeight: 600 }}>Saisie incomplète</span>
                                )}
                              </td>
                              <td>
                                <input 
                                  type="text"
                                  value={n.appreciation}
                                  disabled={n.readonly}
                                  onChange={e => {
                                    const newGrid = [...notesGrid];
                                    newGrid[idx].appreciation = e.target.value;
                                    setNotesGrid(newGrid);
                                  }}
                                  className={'appreciation-input' + (n.readonly ? ' note-readonly' : '')}
                                  placeholder={n.readonly ? 'Note d\'un autre établissement' : 'Saisir appréciation...'}
                                  style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1.5px solid var(--border-color)', padding: '0 12px', fontSize: '12px', outline: 'none' }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}
          {(!selectedClasse || !selectedMatiere) && (
            <div className="table-block" style={{ padding: '30px 20px' }}>
              <div style={{ textAlign: 'center', color: 'var(--slate-400)', fontSize: '13px', fontWeight: 500 }}>
                Veuillez sélectionner une classe et une matière pour charger la grille de saisie des notes.
              </div>
            </div>
          )}
        </>
      )}

      {notesSubTab === 'decisions' && (
        <div className="decisions-view">
          <div className="filter-card" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Classe</label>
                <select value={decisionsClasseId} onChange={e => { setDecisionsClasseId(e.target.value); if (e.target.value) fetchDecisions(e.target.value); }} className="pill-select" style={{ width: '100%', borderRadius: '8px', padding: '8px 12px', height: '38px', fontSize: '12px' }}>
                  <option value="">Sélectionner une classe</option>
                  {classes.filter(c => c.annee_scolaire === notesAnneeScolaire).map(c => <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>)}
                </select>
              </div>

              <div style={{ margin: 0, display: 'flex', gap: 8 }}>
                <button className="btn btn-outline" onClick={() => setShowReglesModal(true)} style={{ height: '38px', fontSize: '12px', fontWeight: 700 }}>
                  <Settings size={14} style={{ marginRight: 6 }} /> Règles
                </button>
                <button className="btn btn-primary" onClick={handleSaveDecisions} disabled={loading || decisions.length === 0} style={{ background: 'var(--primary-color)', height: '38px', padding: '0 24px', fontSize: '12px', fontWeight: 700 }}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>

          {decisions.length > 0 ? (
            <div className="table-block">
              <div className="table-block-header">
                <div className="table-block-title">
                  <h3>Décisions de fin d'année</h3>
                </div>
              </div>

              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Élève</th>
                      <th>Moyenne Annuelle</th>
                      <th>Décision d'orientation</th>
                      <th>Classe Cible / Niveau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decisions.map(d => {
                      const moy = d.moyenne_annuelle;
                      return (
                        <tr key={d.eleve_id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-small"><User size={14}/></div>
                              <span className="font-bold">{d.nom} {d.prenom}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill ${moy >= 12 ? 'status-pass' : moy >= 10 ? 'status-warning' : 'status-fail'}`} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}>
                              {moy.toFixed(2)} / 20
                            </span>
                          </td>
                          <td>
                            <select value={d.decision === 'PASSAGE_DIRECT' ? 'PASSAGE' : d.decision} onChange={e => updateDecision(d.eleve_id, 'decision', e.target.value)}
                              style={{width: '100%', padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border-color)', fontSize: '12px', fontWeight: 600, color: 'var(--slate-800)', outline: 'none'}}>
                              <option value="PASSAGE">Passage</option>
                              <option value="COURS_VACANCES">Cours de vacances</option>
                              <option value="REDOUBLEMENT">Redoublement</option>
                            </select>
                          </td>
                          <td>
                            {(() => {
                              const isCVOrPassage = d.decision === 'PASSAGE' || d.decision === 'PASSAGE_DIRECT' || d.decision === 'COURS_VACANCES';
                              const isRed = d.decision === 'REDOUBLEMENT';
                              
                              let targetClasses = [];
                              if (isRed) {
                                targetClasses = classes.filter(c => c.niveau === d.niveau);
                              } else if (isCVOrPassage) {
                                const niveaux = ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'];
                                const currentIdx = niveaux.indexOf(d.niveau);
                                targetClasses = classes.filter(c => {
                                  const cIdx = niveaux.indexOf(c.niveau);
                                  return cIdx > currentIdx;
                                });
                                targetClasses.sort((a, b) => niveaux.indexOf(a.niveau) - niveaux.indexOf(b.niveau));
                              }

                              const currentClassObj = classes.find(c => c.id === decisionsClasseId);
                              const currentSuffix = currentClassObj ? currentClassObj.nom.slice(-1) : '';
                              
                              let nextLevel = d.niveau;
                              if (isCVOrPassage) {
                                const niveaux = ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'];
                                const idx = niveaux.indexOf(d.niveau);
                                if (idx !== -1 && idx < niveaux.length - 1) {
                                  nextLevel = niveaux[idx + 1];
                                }
                              }
                              
                              const validValue = targetClasses.some(tc => tc.nom === d.decision_detail)
                                ? d.decision_detail
                                : (targetClasses.filter(c => c.niveau === nextLevel).find(tc => tc.nom.endsWith(currentSuffix))?.nom 
                                   || targetClasses.filter(c => c.niveau === nextLevel)[0]?.nom 
                                   || targetClasses[0]?.nom 
                                   || '');

                              if (targetClasses.length > 0) {
                                return (
                                  <select 
                                    value={validValue} 
                                    onChange={e => updateDecision(d.eleve_id, 'decision_detail', e.target.value)}
                                    style={{
                                      padding: '6px 12px', 
                                      borderRadius: 8, 
                                      border: '1.5px solid', 
                                      fontSize: '11px', 
                                      fontWeight: 700, 
                                      color: isRed ? '#ea580c' : '#16a34a',
                                      background: isRed ? 'rgba(234,88,12,0.05)' : 'rgba(22,163,74,0.05)',
                                      borderColor: isRed ? 'rgba(234,88,12,0.2)' : 'rgba(22,163,74,0.2)',
                                      outline: 'none',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {targetClasses.map(tc => (
                                      <option key={tc.id} value={tc.nom}>{tc.nom}</option>
                                    ))}
                                  </select>
                                );
                              } else {
                                return (
                                  <span className={`status-pill ${isRed ? 'status-fail' : 'status-pass'}`} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}>
                                    {nextLevel}
                                  </span>
                                );
                              }
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="table-block" style={{ padding: '30px 20px' }}>
              <div style={{ textAlign: 'center', color: 'var(--slate-400)', fontSize: '13px', fontWeight: 500 }}>
                Sélectionnez une classe pour charger les décisions de passage annuel.
              </div>
            </div>
          )}
        </div>
      )}

      {notesSubTab === 'audit' && (
        <div className="audit-view">
          <div className="filter-card" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Classe</label>
                <select
                  value={auditClasseFilter}
                  onChange={e => setAuditClasseFilter(e.target.value)}
                  className="pill-select"
                  style={{ width: '100%', borderRadius: '8px', padding: '8px 12px', height: '38px', fontSize: '12px' }}
                >
                  <option value="">Toutes les classes</option>
                  {classes.filter(c => c.annee_scolaire === notesAnneeScolaire).map(c => <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>)}
                </select>
              </div>
              <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Semestre</label>
                <select
                  value={auditTrimestreFilter}
                  onChange={e => setAuditTrimestreFilter(e.target.value)}
                  className="pill-select"
                  style={{ width: '100%', borderRadius: '8px', padding: '8px 12px', height: '38px', fontSize: '12px' }}
                >
                  <option value="">Tous les semestres</option>
                  <option value="1">1er Semestre</option>
                  <option value="2">2ème Semestre</option>
                </select>
              </div>
              <div style={{ margin: 0 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => fetchAuditLog(auditClasseFilter, auditTrimestreFilter, notesAnneeScolaire)}
                  disabled={auditLoading}
                  style={{ background: 'var(--primary-color)', height: '38px', padding: '0 24px', fontSize: '12px', fontWeight: 700 }}
                >
                  {auditLoading ? <Loader2 className="animate-spin" size={16} /> : <><RefreshCw size={14} style={{ marginRight: 6 }} />Actualiser</>}
                </button>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #f59e0b', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={16} style={{ color: '#b45309', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#92400e' }}>
              Journal d'audit — Toutes les modifications de notes effectuées par les professeurs sont tracées de façon permanente et non modifiable.
            </p>
          </div>

          <div className="table-block">
            <div className="table-block-header">
              <div className="table-block-title">
                <h3>Historique des modifications</h3>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--slate-400)', fontWeight: 600 }}>
                {auditLog.length} entrée{auditLog.length !== 1 ? 's' : ''}
              </span>
            </div>

            {auditLoading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={28} style={{ color: 'var(--primary-color)' }} />
                <p style={{ marginTop: 12, color: 'var(--slate-400)', fontSize: '13px' }}>Chargement du journal…</p>
              </div>
            ) : auditLog.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <History size={36} style={{ color: 'var(--slate-200)', marginBottom: 12 }} />
                <p style={{ color: 'var(--slate-400)', fontSize: '13px', fontWeight: 500 }}>Aucune modification de note enregistrée.</p>
                <p style={{ color: 'var(--slate-300)', fontSize: '12px', marginTop: 4 }}>Les modifications faites par les professeurs apparaîtront ici.</p>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', boxShadow: 'none', overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: '1050px' }}>
                  <thead>
                    <tr>
                      <th>Date & Heure</th>
                      <th>Élève</th>
                      <th>Classe</th>
                      <th>Matière</th>
                      <th>Type</th>
                      <th>Période</th>
                      <th style={{ textAlign: 'center' }}>Ancienne Note</th>
                      <th style={{ textAlign: 'center' }}>Nouvelle Note</th>
                      <th>Professeur</th>
                      <th>Motif</th>
                      <th>Validation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map(entry => {
                      const diff = parseFloat(entry.nouvelle_valeur) - parseFloat(entry.ancienne_valeur);
                      const diffColor = diff > 0 ? '#16a34a' : diff < 0 ? '#dc2626' : '#64748b';
                      const diffSign = diff > 0 ? '+' : '';
                      return (
                        <tr key={entry.id}>
                          <td>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--slate-700)' }}>
                              {new Date(entry.date_modification).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--slate-400)', marginTop: 2 }}>
                              {new Date(entry.date_modification).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-small"><User size={12} /></div>
                              <span style={{ fontWeight: 600, fontSize: '12px' }}>{entry.eleve_nom} {entry.eleve_prenom}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--slate-600)' }}>{entry.classe_nom}</span>
                            <div style={{ fontSize: '10px', color: 'var(--slate-400)' }}>{entry.classe_niveau}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>{entry.matiere_nom}</span>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '3px 8px',
                              borderRadius: '20px', textTransform: 'uppercase',
                              background: entry.type_note === 'DEVOIR' ? 'rgba(99,102,241,0.1)' : 'rgba(234,88,12,0.1)',
                              color: entry.type_note === 'DEVOIR' ? '#4f46e5' : '#c2410c'
                            }}>{entry.type_note === 'DEVOIR' ? 'Devoir' : 'Examen'}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-600)' }}>S{entry.semestre || entry.trimestre || '1'}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(239,68,68,0.08)', color: '#b91c1c', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
                              {entry.ancienne_valeur !== null ? Number(entry.ancienne_valeur).toFixed(2) : '—'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(22,163,74,0.08)', color: '#15803d', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
                                {entry.nouvelle_valeur !== null ? Number(entry.nouvelle_valeur).toFixed(2) : '—'}
                              </span>
                              {diff !== 0 && (
                                <span style={{ fontSize: '10px', fontWeight: 700, color: diffColor }}>
                                  {diffSign}{diff.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>
                              {entry.prof_nom ? `${entry.prof_nom} ${entry.prof_prenom}` : '—'}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--slate-400)' }}>{entry.prof_email || ''}</div>
                          </td>
                          <td>
                            {entry.motif ? (
                              <button 
                                type="button"
                                onClick={() => setActiveMotifText(entry.motif)} 
                                style={{ fontSize: '11px', color: '#6366f1', background: 'rgba(99,102,241,0.06)', border: '1.5px solid rgba(99,102,241,0.2)', borderRadius: '6px', padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer', outline: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '26px' }}
                              >
                                Voir le motif
                              </button>
                            ) : (
                              <span style={{ color: 'var(--slate-400)', fontSize: '12px' }}>—</span>
                            )}
                          </td>
                          <td>
                            {entry.statut === 'EN_ATTENTE' ? (
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button className="btn btn-outline" style={{ color: '#059669', borderColor: 'rgba(5,150,105,0.2)', background: 'rgba(5,150,105,0.05)', padding: '5px 10px', fontSize: '11px', fontWeight: 'bold', height: 'auto', borderRadius: '6px', cursor: 'pointer' }} onClick={() => openAuditConfirmModal(entry, 'confirm')}>Confirmer</button>
                                <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: 'rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', padding: '5px 10px', fontSize: '11px', fontWeight: 'bold', height: 'auto', borderRadius: '6px', cursor: 'pointer' }} onClick={() => openAuditConfirmModal(entry, 'reject')}>Rejeter</button>
                              </div>
                            ) : entry.statut === 'CONFIRME' ? (
                              <span className="status-pill status-pass" style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px' }}>Confirmée</span>
                            ) : (
                              <span className="status-pill status-fail" style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px' }}>Rejetée</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {notesSubTab === 'suivi' && (
        <div className="suivi-remplissage-view animate-fade-in">
          <div className="filter-card" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Semestre</label>
                <select
                  value={suiviSemestre}
                  onChange={e => {
                    const newSem = parseInt(e.target.value);
                    setSuiviSemestre(newSem);
                    fetchSuiviRemplissage(newSem, notesAnneeScolaire);
                  }}
                  className="pill-select"
                  style={{ width: '100%', borderRadius: '8px', padding: '8px 12px', height: '38px', fontSize: '12px' }}
                >
                  <option value={1}>1er Semestre</option>
                  <option value={2}>2ème Semestre</option>
                </select>
              </div>
              <div style={{ margin: 0 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => fetchSuiviRemplissage(suiviSemestre, notesAnneeScolaire)}
                  disabled={suiviLoading}
                  style={{ background: 'var(--primary-color)', height: '38px', padding: '0 24px', fontSize: '12px', fontWeight: 700 }}
                >
                  {suiviLoading ? <Loader2 className="animate-spin" size={16} /> : <><RefreshCw size={14} style={{ marginRight: 6 }} />Actualiser</>}
                </button>
              </div>
            </div>
          </div>

          <div className="table-block">
            <div className="table-block-header">
              <div className="table-block-title">
                <h3>Progression du Remplissage par Classe</h3>
              </div>
            </div>

            {suiviLoading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={28} style={{ color: 'var(--primary-color)' }} />
                <p style={{ marginTop: 12, color: 'var(--slate-400)', fontSize: '13px' }}>Calcul de l'avancement…</p>
              </div>
            ) : suiviRemplissage.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--slate-400)', fontSize: '13px', fontWeight: 500 }}>Aucune classe trouvée dans l'établissement.</p>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Classe</th>
                      <th>Niveau</th>
                      <th style={{ textAlign: 'center' }}>Élèves</th>
                      <th style={{ textAlign: 'center' }}>Matières</th>
                      <th style={{ textAlign: 'center', width: '220px' }}>Devoirs Saisis</th>
                      <th style={{ textAlign: 'center', width: '220px' }}>Examens Saisis</th>
                      <th>Statut Global</th>
                      <th style={{ textAlign: 'center', width: '130px' }}>Bulletin S{suiviSemestre}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suiviRemplissage.map(item => {
                      const devPct = item.expected_slots > 0 ? Math.round((item.filled_devoirs / item.expected_slots) * 100) : 0;
                      const examPct = item.expected_slots > 0 ? Math.round((item.filled_examens / item.expected_slots) * 100) : 0;
                      const isComplete = devPct === 100 && examPct === 100;
                      return (
                        <tr key={item.classe_id}>
                          <td className="font-bold">{item.classe_nom}</td>
                          <td>{item.niveau}</td>
                          <td style={{ textAlign: 'center' }}>{item.student_count}</td>
                          <td style={{ textAlign: 'center' }}>{item.subject_count}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                                <span>{item.filled_devoirs} / {item.expected_slots}</span>
                                <span>{devPct}%</span>
                              </div>
                              <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
                                <div style={{ background: 'var(--primary-color)', width: `${devPct}%`, height: '100%' }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                                <span>{item.filled_examens} / {item.expected_slots}</span>
                                <span>{examPct}%</span>
                              </div>
                              <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
                                <div style={{ background: '#10b981', width: `${examPct}%`, height: '100%' }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            {isComplete ? (
                              <span className="status-pill status-pass" style={{ fontSize: '11px', fontWeight: 700 }}>Complété</span>
                            ) : (
                              <span className="status-pill status-fail" style={{ fontSize: '11px', fontWeight: 700 }}>Incomplet</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleToggleBulletinPublication(item.classe_id, item.annee_scolaire, item.bulletin_autorise)}
                              style={{
                                fontSize: '10px',
                                padding: '4px 8px',
                                height: '28px',
                                fontWeight: 700,
                                borderRadius: '6px',
                                background: item.bulletin_autorise ? '#ecfdf5' : '#f8fafc',
                                color: item.bulletin_autorise ? '#047857' : 'var(--slate-600)',
                                border: item.bulletin_autorise ? '1px solid #a7f3d0' : '1px solid var(--slate-300)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s'
                              }}
                              title={item.bulletin_autorise ? "Cliquer pour désactiver le téléchargement pour les élèves" : "Cliquer pour autoriser le téléchargement pour les élèves"}
                            >
                              {item.bulletin_autorise ? (
                                <>
                                  <Unlock size={12} />
                                  <span>Publié</span>
                                </>
                              ) : (
                                <>
                                  <Lock size={12} />
                                  <span>Publier</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotesTab;
