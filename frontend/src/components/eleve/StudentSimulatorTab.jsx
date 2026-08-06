import React from 'react';
import { Percent, Calendar, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

const StudentSimulatorTab = ({
  notes,
  selectedSimPeriod,
  setSelectedSimPeriod,
  simulatedGrades,
  setSimulatedGrades,
  getSimulatedAverage,
  handleSimGradeChange,
  getPassageStatusText
}) => {
  const hasNotes = notes && Object.keys(notes).length > 0;
  const simAverage = parseFloat(getSimulatedAverage());

  const handleResetGrades = () => {
    if (!selectedSimPeriod || !notes) return;
    const [year, period] = selectedSimPeriod.split('::');
    const periodData = notes[year]?.periodes[period];
    if (periodData) {
      const initialSims = {};
      Object.keys(periodData.matieres).forEach(code => {
        initialSims[code] = periodData.matieres[code].moyenne || 10;
      });
      setSimulatedGrades(initialSims);
    }
  };

  const getSimColorClass = (val) => {
    if (val >= 12) return 'sim-good';
    if (val >= 10) return 'sim-warn';
    return 'sim-danger';
  };

  const getSimAdvice = () => {
    if (!selectedSimPeriod || !notes) return null;
    const [year, period] = selectedSimPeriod.split('::');
    const periodData = notes[year]?.periodes[period];
    if (!periodData) return null;

    let topMat = null;
    let maxCoeff = 0;
    let totalCoeff = 0;

    Object.keys(periodData.matieres).forEach(code => {
      const mat = periodData.matieres[code];
      totalCoeff += mat.coefficient;
      if (mat.coefficient > maxCoeff) {
        maxCoeff = mat.coefficient;
        topMat = mat;
      }
    });

    if (topMat && totalCoeff > 0) {
      const boostVal = (2 * topMat.coefficient / totalCoeff).toFixed(2);
      return (
        <span>
          Astuce : Gagner <strong>+2 points</strong> en <strong>{topMat.nom}</strong> (Coeff {topMat.coefficient}) augmentera votre moyenne générale de <strong>+{boostVal} points</strong> !
        </span>
      );
    }
    return "Ajustez vos notes prévisionnelles pour analyser votre classement et vos chances de passage.";
  };

  return (
    <div className="tab-pane">
      
      {/* Top Hero Banner */}
      <div className="simulator-hero-banner card-box">
        <div className="simulator-hero-left">
          <div className="sim-hero-title-row">
            <h2>Simulateur de Moyenne Périodique</h2>
            <span className="sim-badge-tag"><Percent size={14} /> Calcul Prévisionnel</span>
          </div>
          <p className="sim-hero-sub">
            Ajustez vos notes prévisionnelles par matière et visualisez en temps réel leur impact sur votre moyenne générale et votre statut de passage.
          </p>
        </div>

        <div className="simulator-hero-actions">
          {hasNotes && (
            <div className="sim-selector-box">
              <label><Calendar size={13} /> Période :</label>
              <select 
                value={selectedSimPeriod} 
                onChange={e => setSelectedSimPeriod(e.target.value)}
              >
                {Object.keys(notes).map(year => 
                  Object.keys(notes[year].periodes).map(period => (
                    <option key={`${year}::${period}`} value={`${year}::${period}`}>
                      {year} - {period}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <button className="secondary-btn sim-reset-btn" onClick={handleResetGrades} title="Réinitialiser aux notes réelles">
            <RefreshCw size={15} /> Réinitialiser
          </button>
        </div>
      </div>

      {selectedSimPeriod && notes && (
        <div className="simulator-grid">
          
          {/* LEFT COLUMN: Input controls */}
          <div className="simulator-inputs card-box">
            <div className="sim-inputs-header">
              <div>
                <h3>Matières & Notes Simulées</h3>
                <p className="subtitle">Modifiez les notes prévisionnelles ou utilisez les ajustements rapides.</p>
              </div>
              {(() => {
                const [year, period] = selectedSimPeriod.split('::');
                const pData = notes[year]?.periodes[period];
                if (!pData) return null;
                const countMat = Object.keys(pData.matieres).length;
                const totalCoeff = Object.values(pData.matieres).reduce((acc, m) => acc + m.coefficient, 0);
                return (
                  <div className="sim-coeff-total-pill">
                    <span>{countMat} matières</span> • <strong>Coeff Total: {totalCoeff}</strong>
                  </div>
                );
              })()}
            </div>

            <div className="sim-inputs-list mt-4">
              {(() => {
                const [year, period] = selectedSimPeriod.split('::');
                const periodData = notes[year]?.periodes[period];
                if (!periodData) return null;

                return Object.keys(periodData.matieres).map(code => {
                  const mat = periodData.matieres[code];
                  const currentVal = simulatedGrades[code] !== undefined ? simulatedGrades[code] : (mat.moyenne || 10);
                  const isModified = mat.moyenne !== null && Math.abs(currentVal - mat.moyenne) > 0.01;

                  return (
                    <div key={code} className={`sim-subject-card ${getSimColorClass(currentVal)}`}>
                      <div className="sim-subj-meta">
                        <div className="sim-subj-name-row">
                          <h4>{mat.nom}</h4>
                          <span className="coeff-tag">Coeff {mat.coefficient}</span>
                        </div>
                        {mat.moyenne !== null ? (
                          <span className="real-grade-lbl">
                            Note actuelle: <strong>{mat.moyenne}/20</strong>
                            {isModified && <span className="modified-dot" title="Note simulée modifiée">• Modifié</span>}
                          </span>
                        ) : (
                          <span className="real-grade-lbl">Aucune note saisie</span>
                        )}
                      </div>

                      <div className="sim-controls-wrapper">
                        {/* Quick adjust buttons */}
                        <div className="quick-adjust-btns">
                          <button 
                            type="button" 
                            className="adjust-btn" 
                            onClick={() => handleSimGradeChange(code, currentVal - 1)}
                            title="-1 point"
                          >-1</button>
                          <button 
                            type="button" 
                            className="adjust-btn" 
                            onClick={() => handleSimGradeChange(code, currentVal - 0.5)}
                            title="-0.5 point"
                          >-0.5</button>
                          <button 
                            type="button" 
                            className="adjust-btn" 
                            onClick={() => handleSimGradeChange(code, currentVal + 0.5)}
                            title="+0.5 point"
                          >+0.5</button>
                          <button 
                            type="button" 
                            className="adjust-btn" 
                            onClick={() => handleSimGradeChange(code, currentVal + 1)}
                            title="+1 point"
                          >+1</button>
                        </div>

                        <div className="sim-input-box">
                          <input 
                            type="number" 
                            step="0.25"
                            min="0"
                            max="20"
                            value={currentVal}
                            onChange={e => handleSimGradeChange(code, e.target.value)}
                          />
                          <span className="unit-20">/20</span>
                        </div>
                      </div>

                      <div className="sim-score-bar-bg">
                        <div 
                          className="sim-score-bar-fill"
                          style={{ width: `${Math.min(100, (currentVal / 20) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* RIGHT COLUMN: Results & AI Advice */}
          <div className="simulator-results-col">
            
            {/* Score Display Card */}
            <div className="dashboard-card sim-result-card">
              <span className="sim-result-tag">Moyenne Prévisionnelle</span>
              
              <div className={`sim-avg-circle ${getSimColorClass(simAverage)}`}>
                <div className="avg-circle-inner">
                  <span className="avg-score-num">{getSimulatedAverage()}</span>
                  <span className="avg-score-denom">/20</span>
                </div>
              </div>

              {/* Progress bar with threshold markers */}
              <div className="sim-progress-wrapper">
                <div className="progress-thresholds">
                  <span className="thresh-lbl">0</span>
                  <span className="thresh-lbl mid">10 (Passage)</span>
                  <span className="thresh-lbl top">12 (Mention)</span>
                  <span className="thresh-lbl max">20</span>
                </div>
                <div className="sim-progress-track">
                  <div 
                    className={`sim-progress-fill ${getSimColorClass(simAverage)}`}
                    style={{ width: `${Math.min(100, (simAverage / 20) * 100)}%` }}
                  ></div>
                  <div className="marker-10" style={{ left: '50%' }} title="Seuil de passage (10/20)"></div>
                  <div className="marker-12" style={{ left: '60%' }} title="Seuil d'encouragement (12/20)"></div>
                </div>
              </div>

              {/* Decision Box */}
              <div className="sim-decision-box">
                <span className="dec-title"><CheckCircle2 size={14} /> Décision Prévisionnelle</span>
                <div className={`dec-pill ${getSimColorClass(simAverage)}`}>
                  {getPassageStatusText(simAverage).text}
                </div>
              </div>
            </div>

            {/* AI Optimisation Advice Card */}
            <div className="dashboard-card sim-advice-card">
              <div className="sim-advice-header">
                <div className="sparkle-icon-box">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4>Conseil d'Optimisation</h4>
                  <span>Analyse d'impact des coefficients</span>
                </div>
              </div>
              <p className="sim-advice-body">
                {getSimAdvice()}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default StudentSimulatorTab;
