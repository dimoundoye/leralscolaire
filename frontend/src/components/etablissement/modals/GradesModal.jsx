import { X, Loader2, User, AlertTriangle } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function GradesModal({
  classes,
  gradesModalLoading,
  gradesModalSemestre,
  handleSaveJuryDecision,
  juryAppreciations,
  juryDecision,
  juryObservations,
  juryTargetClass,
  savingJuryDecision,
  selectedGradesData,
  setGradesModalSemestre,
  setJuryDecision,
  setJuryObservations,
  setJuryTargetClass,
  setShowGradesModal,
  toggleAppreciation,
}) {
  return (
    <div className="modal-overlay" onClick={() => setShowGradesModal(false)}>
      <div
        className="modal-card grades-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px', width: '90%' }}
      >
        <div className="grades-modal-header">
          <h3>Détails Scolaires & Notes</h3>
          <button className="close-btn" onClick={() => setShowGradesModal(false)}>
            <X size={20} />
          </button>
        </div>

        {gradesModalLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} style={{ color: 'var(--primary-color)' }} />
            <p className="mt-4 text-slate-500 font-semibold">Chargement des notes de l'élève...</p>
          </div>
        ) : selectedGradesData ? (
          <div className="grades-modal-body">
            <div className="grades-modal-grid">
              {/* Column 1: Identity Card */}
              <div className="grades-student-card">
                <div className="grades-avatar-wrapper">
                  {selectedGradesData.student.photo_url ? (
                    <img
                      src={`${selectedGradesData.student.photo_url}`}
                      alt="Photo de l'élève"
                      className="grades-student-photo"
                    />
                  ) : (
                    <div className="grades-student-avatar-placeholder">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <div className="grades-student-info">
                  <h4>{selectedGradesData.student.nom}</h4>
                  <h3>{selectedGradesData.student.prenom}</h3>
                  <code className="grades-student-id">{selectedGradesData.student.identifiant_national}</code>

                  <div className="grades-student-meta">
                    <div className="meta-item">
                      <span className="label">Classe actuelle</span>
                      <span className="value">{selectedGradesData.student.classe_nom || 'Non affectée'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Statut d'aptitude</span>
                      <span
                        className={`status-pill ${selectedGradesData.student.statut === 'APTE' ? 'status-pass' : 'status-fail'}`}
                      >
                        {selectedGradesData.student.statut}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Grades and Performance */}
              <div className="grades-details-panel">
                {Object.keys(selectedGradesData.notes).length > 0 ? (
                  (() => {
                    const years = Object.keys(selectedGradesData.notes);
                    const activeYear = years[0];
                    const periods = Object.keys(selectedGradesData.notes[activeYear].periodes);

                    return (
                      <>
                        <div className="grades-period-tabs">
                          {periods.map((period) => (
                            <button
                              key={period}
                              type="button"
                              className={`period-tab-btn ${gradesModalSemestre === period ? 'active' : ''}`}
                              onClick={() => setGradesModalSemestre(period)}
                            >
                              {period}
                            </button>
                          ))}
                        </div>

                        {selectedGradesData.notes[activeYear].periodes[gradesModalSemestre] ? (
                          (() => {
                            const periodData = selectedGradesData.notes[activeYear].periodes[gradesModalSemestre];
                            const matieresKeys = Object.keys(periodData.matieres);

                            return (
                              <div className="grades-table-wrapper">
                                <table className="grades-table">
                                  <thead>
                                    <tr>
                                      <th>Matière</th>
                                      <th>Coeff</th>
                                      <th>Devoirs</th>
                                      <th>Examen</th>
                                      <th>Moyenne</th>
                                      <th>Appréciation</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {matieresKeys.map((codeMat) => {
                                      const mat = periodData.matieres[codeMat];
                                      const devoirs = mat.notes.filter((n) => n.type_note === 'DEVOIR');
                                      const examen = mat.notes.find(
                                        (n) => n.type_note === 'EXAMEN' || n.type_note === 'COMPOSITION'
                                      );
                                      return (
                                        <tr key={codeMat}>
                                          <td className="subject-cell">
                                            <strong>{mat.nom}</strong>
                                          </td>
                                          <td className="coeff-cell">{mat.coefficient}</td>
                                          <td className="notes-cell">
                                            {devoirs.length > 0 ? (
                                              devoirs.map((d) => d.valeur).join(', ')
                                            ) : (
                                              <span className="text-slate-400">--</span>
                                            )}
                                          </td>
                                          <td className="notes-cell">
                                            {examen ? examen.valeur : <span className="text-slate-400">--</span>}
                                          </td>
                                          <td className={`average-cell ${mat.moyenne >= 10 ? 'pass' : 'fail'}`}>
                                            {mat.moyenne !== null ? (
                                              `${mat.moyenne}/20`
                                            ) : (
                                              <span className="text-slate-400">--</span>
                                            )}
                                          </td>
                                          <td className="appreciation-cell" title={mat.appreciation}>
                                            {mat.appreciation || <span className="text-slate-400 italic">Aucune</span>}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>

                                <div className="grades-summary-footer">
                                  <div className="summary-card">
                                    <span className="label">Moyenne Générale</span>
                                    <span className={`value ${periodData.moyenne_generale >= 10 ? 'pass' : 'fail'}`}>
                                      {periodData.moyenne_generale !== null
                                        ? `${periodData.moyenne_generale}/20`
                                        : '--'}
                                    </span>
                                  </div>
                                  <div className="summary-card">
                                    <span className="label">Total Coefficients</span>
                                    <span className="value coeff">{periodData.total_coefficients}</span>
                                  </div>
                                </div>

                                {/* Jury decision form - only visible for second semester or third trimester */}
                                {/* Jury decision form */}
                                <form onSubmit={handleSaveJuryDecision} className="grades-jury-form">
                                  <h4>Orientation & Observations du Jury</h4>

                                  {/* Only visible for second semester or third trimester */}
                                  {(gradesModalSemestre === 'Semestre 2' || gradesModalSemestre === 'Trimestre 3') && (
                                    <div
                                      style={{
                                        display: 'flex',
                                        gap: '16px',
                                        flexWrap: 'wrap',
                                        marginBottom: '16px',
                                      }}
                                    >
                                      <div className="input-group" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
                                        <label>Décision du Conseil</label>
                                        <select
                                          value={juryDecision === 'PASSAGE_DIRECT' ? 'PASSAGE' : juryDecision}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setJuryDecision(val);
                                            setJuryTargetClass('');
                                          }}
                                          className="jury-select"
                                        >
                                          <option value="PASSAGE">Passage</option>
                                          <option value="COURS_VACANCES">Cours de vacances</option>
                                          <option value="REDOUBLEMENT">Redoublement</option>
                                        </select>
                                      </div>

                                      {(() => {
                                        const currentClassObj = classes.find(
                                          (c) => c.id === selectedGradesData.student.classe_id
                                        );
                                        const currentLevel = currentClassObj ? currentClassObj.niveau : '';
                                        const currentSuffix = currentClassObj ? currentClassObj.nom.slice(-1) : '';

                                        let targetNiveau = currentLevel;
                                        if (juryDecision !== 'REDOUBLEMENT') {
                                          const niveaux = [
                                            '6ème',
                                            '5ème',
                                            '4ème',
                                            '3ème',
                                            'Seconde',
                                            'Première',
                                            'Terminale',
                                          ];
                                          const idx = niveaux.indexOf(currentLevel);
                                          if (idx !== -1 && idx < niveaux.length - 1) {
                                            targetNiveau = niveaux[idx + 1];
                                          }
                                        }
                                        const targetClasses = classes.filter((c) => c.niveau === targetNiveau);
                                        const validValue = targetClasses.some((tc) => tc.nom === juryTargetClass)
                                          ? juryTargetClass
                                          : targetClasses.find((tc) => tc.nom.endsWith(currentSuffix))?.nom ||
                                            targetClasses[0]?.nom ||
                                            '';

                                        if (targetClasses.length > 0) {
                                          return (
                                            <div
                                              className="input-group"
                                              style={{ flex: 1, minWidth: '200px', margin: 0 }}
                                            >
                                              <label>Classe Suivante</label>
                                              <select
                                                value={validValue}
                                                onChange={(e) => setJuryTargetClass(e.target.value)}
                                                className="jury-select"
                                                style={{ fontWeight: 700 }}
                                              >
                                                {targetClasses.map((tc) => (
                                                  <option key={tc.id} value={tc.nom}>
                                                    {tc.nom}
                                                  </option>
                                                ))}
                                              </select>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  )}

                                  <div className="input-group mb-3">
                                    <label>Appréciations globales du Conseil</label>
                                    <div className="jury-checkboxes-grid">
                                      {[
                                        'Satisfaisant, doit continuer',
                                        'Peut mieux faire',
                                        'Insuffisant',
                                        'Risque de redoubler',
                                        "Risque l'exclusion",
                                        'Félicitations',
                                        'Encouragements',
                                        "Tableau d'honneur",
                                        'Avertissement',
                                        'Blâme',
                                      ].map((appr) => (
                                        <label key={appr} className="jury-checkbox-label">
                                          <input
                                            type="checkbox"
                                            checked={juryAppreciations.includes(appr)}
                                            onChange={() => toggleAppreciation(appr)}
                                            className="jury-checkbox"
                                          />
                                          <span>{appr}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="input-group">
                                    <label>Observations et Décisions rédigées du jury</label>
                                    <textarea
                                      value={juryObservations}
                                      onChange={(e) => setJuryObservations(e.target.value)}
                                      placeholder="Ex: Excellent travail, félicitations du jury. / À encourager. / Doit redoubler d'efforts..."
                                      rows="2"
                                      className="jury-textarea"
                                    ></textarea>
                                  </div>
                                  <div className="jury-form-actions">
                                    <button
                                      type="submit"
                                      className="btn btn-primary btn-save-jury"
                                      disabled={savingJuryDecision}
                                    >
                                      {savingJuryDecision ? (
                                        <Loader2 className="animate-spin" size={14} />
                                      ) : (
                                        'Enregistrer'
                                      )}
                                    </button>
                                  </div>
                                </form>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="empty-grades-view">
                            <p>Aucune note enregistrée pour cette période.</p>
                          </div>
                        )}
                      </>
                    );
                  })()
                ) : (
                  <div className="empty-grades-view">
                    <AlertTriangle size={32} className="text-amber-500 mb-2" style={{ color: '#f59e0b' }} />
                    <p className="font-semibold text-slate-700">Aucune note enregistrée pour cet élève.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Vous pouvez ajouter des notes dans l'onglet "Saisie des Notes".
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="text-red-500" size={40} />
            <p className="mt-4 text-slate-500 font-semibold">Impossible de récupérer les informations de l'élève.</p>
          </div>
        )}
      </div>
    </div>
  );
}
