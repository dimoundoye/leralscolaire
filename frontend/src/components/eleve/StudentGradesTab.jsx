import React from 'react';
import { Calendar, BookOpen, Award, Lock, CheckCircle, Download, AlertCircle, ShieldCheck } from 'lucide-react';

const StudentGradesTab = ({
  notes,
  selectedGradeYear,
  setSelectedGradeYear,
  selectedGradePeriod,
  setSelectedGradePeriod,
  documents,
  token,
  fetchData
}) => {
  const hasNotes = notes && Object.keys(notes).length > 0;
  const availableYears = hasNotes ? Object.keys(notes) : [];
  const activeYearKey = (selectedGradeYear && notes[selectedGradeYear]) 
    ? selectedGradeYear 
    : (availableYears[0] || '');
  const activeYearData = activeYearKey ? notes[activeYearKey] : null;
  const defaultPeriods = ['Semestre 1', 'Semestre 2'];
  const existingPeriods = activeYearData?.periodes ? Object.keys(activeYearData.periodes) : [];
  const availablePeriods = Array.from(new Set([...defaultPeriods, ...existingPeriods]));
  const activePeriodKey = (selectedGradePeriod && availablePeriods.includes(selectedGradePeriod)) 
    ? selectedGradePeriod 
    : availablePeriods[0];
  const activePeriodData = (activeYearData && activeYearData.periodes && activeYearData.periodes[activePeriodKey]) 
    ? activeYearData.periodes[activePeriodKey] 
    : null;

  return (
    <div className="tab-pane">
      <div className="grades-layout">
        
        {/* Grades explorer with selectors */}
        <div className="grades-explorer card-box">
          <div className="grades-header-toolbar">
            <div>
              <h3>Notes & Bulletins Scolaires</h3>
              <p className="subtitle">Consultez vos relevés de notes et appréciations certifiés par période.</p>
            </div>
            
            {hasNotes && (
              <div className="grades-selectors-row">
                {/* Year Selector */}
                <div className="selector-group">
                  <label><Calendar size={13} /> Année Scolaire</label>
                  <select 
                    value={activeYearKey} 
                    onChange={(e) => {
                      const year = e.target.value;
                      setSelectedGradeYear(year);
                      setSelectedGradePeriod('Semestre 1');
                    }}
                  >
                    {availableYears.map(annee => (
                      <option key={annee} value={annee}>
                        {annee} ({notes[annee].classe})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Period Selector Dropdown */}
                {availablePeriods.length > 0 && (
                  <div className="selector-group">
                    <label><BookOpen size={13} /> Période / Semestre</label>
                    <select 
                      value={activePeriodKey}
                      onChange={(e) => setSelectedGradePeriod(e.target.value)}
                    >
                      {availablePeriods.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Period Pills Switcher for quick clicks */}
          {availablePeriods.length > 1 && (
            <div className="period-pills-switcher">
              {availablePeriods.map(p => (
                <button 
                  key={p} 
                  className={`period-pill-btn ${activePeriodKey === p ? 'active' : ''}`}
                  onClick={() => setSelectedGradePeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Selected Period Summary Card */}
          {activePeriodData ? (
            <div className="period-grades-view">
              <div className="period-summary-card">
                <div className="meta-info">
                  <h4>{activeYearKey} — {activePeriodKey}</h4>
                  <span className="class-badge">Classe : <strong>{activeYearData?.classe}</strong></span>
                </div>
                <div className="avg-highlight-badge">
                  <Award size={16} /> Moyenne Générale : {activePeriodData.moyenne_generale} / 20
                </div>
              </div>

              <table className="sd-table">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Coeff</th>
                    <th>Devoirs</th>
                    <th>Examen / Composition</th>
                    <th>Moyenne Matière</th>
                    <th>Appréciation / Enseignant</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(activePeriodData.matieres).map(codeMat => {
                    const mat = activePeriodData.matieres[codeMat];
                    const devoirs = mat.notes.filter(n => n.type_note === 'DEVOIR');
                    const examen = mat.notes.find(n => n.type_note === 'EXAMEN' || n.type_note === 'COMPOSITION');
                    return (
                      <tr key={codeMat}>
                        <td><strong>{mat.nom}</strong></td>
                        <td><span className="coeff-badge">{mat.coefficient}</span></td>
                        <td>
                          {devoirs.length > 0 
                            ? devoirs.map(d => d.valeur + '/20').join(', ') 
                            : '--'}
                        </td>
                        <td>
                          {examen ? `${examen.valeur}/20` : '--'}
                        </td>
                        <td className="text-emerald font-bold">
                          {mat.moyenne !== null ? `${mat.moyenne}/20` : '--'}
                        </td>
                        <td className="appr-cell">
                          {mat.appreciation || 'Aucune appréciation.'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <BookOpen size={48} className="text-gray" style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700 }}>Aucune note pour le {activePeriodKey}</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-slate-500)' }}>
                Les notes et évaluations de ce semestre n'ont pas encore été renseignées par l'équipe enseignante.
              </p>
            </div>
          )}
        </div>

        {/* Documents Downloads (Secured PDFs) */}
        <div className="documents-panel card-box">
          <h3>Bulletins & Attestations Officiels</h3>
          <p className="subtitle">Tous les documents générés sur la plateforme LeralScolaire comportent un QR code d'authentification unique vérifiable par l'État du Sénégal.</p>
          
          <div className="document-download-list mt-6">
            {documents.bulletins && documents.bulletins.length > 0 ? (
              documents.bulletins.map((bull, idx) => (
                <div key={idx} className="document-card-download" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch', padding: '16px', border: '1.5px solid var(--border-color)', borderRadius: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="doc-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>PDF</div>
                      <div className="doc-info">
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Bulletin - Semestre {bull.semestre}</h4>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--slate-500)' }}>
                          Classe : {bull.classe_nom} | Année : {bull.annee_scolaire}
                        </p>
                      </div>
                    </div>
                    
                    {!bull.autorise ? (
                      <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={11} /> En attente de publication
                      </span>
                    ) : bull.telecharge ? (
                      <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', background: '#d1fae5', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={11} /> Déjà téléchargé
                      </span>
                    ) : (
                      <a 
                        href={`/api/documents/bulletin/${bull.eleve_id}?semestre=${bull.semestre}&token=${token}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="download-action-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '6px 12px', borderRadius: '6px', background: 'var(--primary-color)', color: '#fff', fontWeight: 600, textDecoration: 'none' }}
                        onClick={() => {
                          setTimeout(() => {
                            fetchData();
                          }, 1500);
                        }}
                      >
                        <Download size={14} /> Télécharger
                      </a>
                    )}
                  </div>

                  {!bull.autorise && (
                    <div style={{ fontSize: '11px', color: '#92400e', background: '#fffbeb', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={13} style={{ flexShrink: 0 }} />
                      <span>Les notes de ce semestre sont en cours de saisie. Le téléchargement officiel sera ouvert par l'administration une fois toutes les notes finalisées.</span>
                    </div>
                  )}

                  {bull.telecharge && (
                    <div style={{ fontSize: '11px', color: '#065f46', background: '#ecfdf5', padding: '8px 12px', borderRadius: '6px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={13} style={{ flexShrink: 0 }} />
                      <span>Ce bulletin officiel a été téléchargé le {new Date(bull.date_telechargement).toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Conformément à la réglementation, le téléchargement multiple est désactivé.</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="info-box-alert">
                Aucun bulletin officiel n'a encore été généré par l'administration de votre établissement.
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentGradesTab;
