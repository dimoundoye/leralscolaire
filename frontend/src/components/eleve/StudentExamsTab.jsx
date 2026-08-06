import React from 'react';
import { GraduationCap, CheckCircle, AlertCircle, XCircle, Clock, Award, Activity } from 'lucide-react';

const StudentExamsTab = ({ examResults, profile }) => {
  const { eleve: eleveBAC, resultats } = examResults || { resultats: [] };

  return (
    <div className="tab-pane">
      {/* En-tête de section */}
      <div className="bac-portal-header">
        <div className="bac-portal-title-row">
          <div className="bac-portal-icon-wrap">
            <GraduationCap size={28} />
          </div>
          <div>
            <h2>Portail Résultats — Office du Baccalauréat</h2>
            <p>République du Sénégal · Direction des Examens et Concours</p>
          </div>
          <div className="sn-flag-badge">🇸🇳</div>
        </div>
      </div>

      {resultats.length === 0 ? (
        <div className="bac-empty-state">
          <GraduationCap size={56} />
          <h3>Aucun enregistrement disponible</h3>
          <p>Votre dossier de candidature n'a pas encore été enregistré dans le système de l'Office du Baccalauréat.</p>
          <span className="bac-empty-sub">Contactez votre établissement pour plus d'informations.</span>
        </div>
      ) : (
        resultats.map((res) => (
          <div key={res.id} className="bac-exam-block">

            {/* === SECTION 1 : CARTE CANDIDAT === */}
            <div className="bac-candidat-card">
              <div className="bac-card-stripe" />
              <div className="bac-candidat-inner">
                <div className="bac-candidat-left">
                  <div className="bac-type-badge">{res.type_examen}</div>
                  <div className="bac-session-label">Session {res.annee}</div>
                  <div className="bac-candidat-name">
                    {eleveBAC ? `${eleveBAC.prenom} ${eleveBAC.nom}` : (profile?.prenom + ' ' + profile?.nom)}
                  </div>
                  <div className="bac-candidat-id">
                    {eleveBAC?.identifiant_national || profile?.identifiant_national || '—'}
                  </div>
                </div>

                <div className="bac-candidat-right">
                  <div className="bac-info-grid">
                    <div className="bac-info-item">
                      <span className="bac-info-label">N° de table</span>
                      <span className="bac-info-val bac-num-table">{res.numero_table || '—'}</span>
                    </div>
                    <div className="bac-info-item">
                      <span className="bac-info-label">Série</span>
                      <span className="bac-info-val">{res.serie || '—'}</span>
                    </div>
                    <div className="bac-info-item">
                      <span className="bac-info-label">Jury</span>
                      <span className="bac-info-val">{res.jury || '—'}</span>
                    </div>
                    <div className="bac-info-item">
                      <span className="bac-info-label">Centre</span>
                      <span className="bac-info-val">{res.centre_examen || '—'}</span>
                    </div>
                    <div className="bac-info-item">
                      <span className="bac-info-label">Région</span>
                      <span className="bac-info-val">{res.region || eleveBAC?.etablissement_region || '—'}</span>
                    </div>
                    <div className="bac-info-item">
                      <span className="bac-info-label">Établissement</span>
                      <span className="bac-info-val">{eleveBAC?.etablissement_nom || profile?.etablissement_nom || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Badge statut candidat */}
                <div className={`bac-statut-badge bac-statut-${(res.statut_candidat || 'CONVOQUÉ').toLowerCase().replace('é', 'e').replace('é', 'e')}`}>
                  {res.statut_candidat === 'ADMIS' && <CheckCircle size={14} />}
                  {res.statut_candidat === 'AJOURNÉ' && <AlertCircle size={14} />}
                  {res.statut_candidat === 'EXCLU' && <XCircle size={14} />}
                  {(res.statut_candidat === 'CONVOQUÉ' || !res.statut_candidat) && <Clock size={14} />}
                  {res.statut_candidat || 'CONVOQUÉ'}
                </div>
              </div>
            </div>

            {/* === SECTION 2 : RÉSULTAT OFFICIEL (si publié) === */}
            {!res.publie ? (
              <div className="bac-pending-banner">
                <Clock size={20} />
                <div>
                  <strong>Résultats en attente de publication</strong>
                  <p>Les résultats de la session {res.annee} n'ont pas encore été publiés par l'Office du Baccalauréat. Vous serez notifié dès la publication officielle.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Résultat officiel */}
                {(() => {
                  const statutFinal = (res.statut_deliberation || res.statut_candidat || res.statut_resultat || '').toUpperCase();
                  const isAdmis = statutFinal === 'ADMIS';
                  const isSecondTour = statutFinal === 'SECOND_TOUR' || statutFinal === 'CONVOQUÉ';
                  const isAjourne = statutFinal === 'AJOURNÉ';

                  return (
                    <div className={`bac-resultat-section bac-res-${isAdmis ? 'admis' : isSecondTour ? 'rattrapage' : 'ajourne'}`}>
                      <div className="bac-resultat-main">
                        <div className="bac-moyenne-circle">
                          <span className="bac-moy-val">{res.moyenne ? parseFloat(res.moyenne).toFixed(2) : '—'}</span>
                          <span className="bac-moy-denom">/20</span>
                        </div>
                        <div className="bac-resultat-meta">
                          <div className={`bac-verdict bac-verdict-${isAdmis ? 'admis' : isSecondTour ? 'rattrapage' : 'ajourne'}`} style={{ fontSize: 16, fontWeight: 900 }}>
                            {isAdmis && <><CheckCircle size={20} /> ADMIS (1ER TOUR)</>}
                            {isSecondTour && <><Clock size={20} /> ADMIS AU 2ND TOUR (RATTRAPAGE)</>}
                            {isAjourne && <><AlertCircle size={20} /> AJOURNÉ</>}
                            {!isAdmis && !isSecondTour && !isAjourne && <><Activity size={20} /> {statutFinal || 'DÉLIBÉRÉ'}</>}
                          </div>
                          {res.mention && (
                            <div className="bac-mention-pill" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 800 }}>
                              <Award size={14} /> Mention {res.mention.replace('_', ' ')}
                            </div>
                          )}
                          {res.date_deliberation && (
                            <div className="bac-delib-date">
                              Délibéré le {new Date(res.date_deliberation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                      </div>
                      {res.appreciation_jury && (
                        <div className="bac-appreciation-box">
                          <span className="bac-appr-label">Appréciation officielle du jury</span>
                          <p className="bac-appr-text">"{res.appreciation_jury}"</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* === SECTION 3 : TABLEAU DES ÉPREUVES SAISIES PAR LE JURY === */}
                {(() => {
                  const hasNotesGrid = Array.isArray(res.notes) && res.notes.length > 0;
                  const epreuvesObj = res.details_epreuves || res.details || {};
                  const legacyEntries = typeof epreuvesObj === 'object' ? Object.entries(epreuvesObj) : [];

                  if (!hasNotesGrid && legacyEntries.length === 0) return null;

                  let totalPoints = 0;
                  let totalCoeff = 0;

                  const listToRender = hasNotesGrid
                    ? res.notes.map(n => {
                        const val = parseFloat(n.note || 0);
                        const coef = parseInt(n.coefficient || 1);
                        if (n.statut_presence === 'PRESENT' && n.note !== '' && n.note !== null) {
                          totalPoints += val * coef;
                          totalCoeff += coef;
                        }
                        return { name: n.matiere_nom, coef, note: val, pres: n.statut_presence };
                      })
                    : legacyEntries.map(([matiere, data]) => {
                        const note = typeof data === 'object' ? parseFloat(data.note || 0) : parseFloat(data || 0);
                        const coeff = typeof data === 'object' ? parseFloat(data.coefficient || 1) : 1;
                        totalPoints += note * coeff;
                        totalCoeff += coeff;
                        return { name: matiere, coef: coeff, note, pres: 'PRESENT' };
                      });

                  return (
                    <div className="bac-epreuves-section">
                      <h4 className="bac-epreuves-title">Détail des Épreuves du Baccalauréat</h4>
                      <div className="bac-epreuves-table-wrap">
                        <table className="bac-epreuves-table">
                          <thead>
                            <tr>
                              <th>Épreuve</th>
                              <th>Coefficient</th>
                              <th>Note /20</th>
                              <th>Points</th>
                              <th>Présence / Barre</th>
                            </tr>
                          </thead>
                          <tbody>
                            {listToRender.map((m, i) => {
                              const pts = m.note * m.coef;
                              const pct = Math.min((m.note / 20) * 100, 100);
                              return (
                                <tr key={i}>
                                  <td className="bac-ep-name"><strong>{m.name}</strong></td>
                                  <td className="bac-ep-coeff">Coef {m.coef}</td>
                                  <td className={`bac-ep-note ${m.pres === 'ABI' ? 'note-ko' : m.note >= 10 ? 'note-ok' : 'note-ko'}`}>
                                    {m.pres === 'ABI' ? 'ABI' : m.note.toFixed(2) + '/20'}
                                  </td>
                                  <td className="bac-ep-pts">{m.pres === 'ABI' ? 0 : pts.toFixed(2)} pts</td>
                                  <td className="bac-ep-bar-cell">
                                    {m.pres === 'ABI' ? (
                                      <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: 11 }}>Absence Injustifiée</span>
                                    ) : (
                                      <div className="bac-ep-bar-track">
                                        <div className={`bac-ep-bar-fill ${m.note >= 10 ? 'bar-ok' : 'bar-ko'}`} style={{ width: `${pct}%` }} />
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bac-ep-total-row">
                              <td colSpan={2}><strong>TOTAL GÉNÉRAL DU BAC</strong></td>
                              <td><strong>{totalCoeff > 0 ? (totalPoints / totalCoeff).toFixed(2) : '—'}/20</strong></td>
                              <td colSpan={2}><strong>{totalPoints.toFixed(2)} Points / {totalCoeff} Coefs</strong></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default StudentExamsTab;
