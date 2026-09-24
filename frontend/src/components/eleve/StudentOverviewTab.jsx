import React from 'react';
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';

const StudentOverviewTab = ({
  profile,
  currentPeriod,
  currentPeriodKey,
  schedule,
  navigate,
  generateCalendarData,
  absences,
  getAbsenceColorClass,
}) => {
  const renderAbsenceCalendar = () => {
    const calendarData = generateCalendarData();
    const weeks = [];
    let currentWeek = [];

    calendarData.forEach((day, index) => {
      const orderedDayIndex = day.dayOfWeek === 0 ? 6 : day.dayOfWeek - 1;
      currentWeek[orderedDayIndex] = day;

      if (orderedDayIndex === 6 || index === calendarData.length - 1) {
        for (let i = 0; i < 7; i++) {
          if (!currentWeek[i]) {
            currentWeek[i] = { date: '', hours: 0, dayOfWeek: i === 6 ? 0 : i + 1 };
          }
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const monthHeaders = [];
    let lastMonth = -1;
    let lastIndex = -1;

    weeks.forEach((week, wIdx) => {
      const validDays = week.filter((d) => d.date);
      if (validDays.length === 0) return;

      // Déterminer le mois dominant dans cette semaine
      const monthCounts = {};
      validDays.forEach((d) => {
        const m = new Date(d.date).getMonth();
        monthCounts[m] = (monthCounts[m] || 0) + 1;
      });

      let dominantMonth = -1;
      let maxCount = 0;
      Object.keys(monthCounts).forEach((mStr) => {
        const m = Number(mStr);
        if (monthCounts[m] > maxCount) {
          maxCount = monthCounts[m];
          dominantMonth = m;
        }
      });

      // Éviter les chevauchements : au moins 3 semaines d'écart entre deux labels de mois
      if (dominantMonth !== lastMonth && (lastIndex === -1 || wIdx - lastIndex >= 3)) {
        monthHeaders.push({ label: monthNames[dominantMonth], index: wIdx });
        lastMonth = dominantMonth;
        lastIndex = wIdx;
      }
    });

    const totalAbsenceHours = absences.reduce(
      (sum, a) =>
        sum + (Number(a.heures_absent) || (a.type_presence === 'ABSENCE' || a.type_presence === 'ABSENT' ? 2 : 0)),
      0
    );

    return (
      <div className="absence-heatmap-card">
        <div className="heatmap-header">
          <h3>Présence & Assiduité</h3>
          <p className="subtitle">{totalAbsenceHours} heures de cours manquées sur les 12 derniers mois</p>
        </div>

        <div className="heatmap-container">
          <div className="heatmap-grid-layout">
            <div className="days-y-labels">
              <span>Lun</span>
              <span>Mer</span>
              <span>Ven</span>
            </div>

            <div className="heatmap-weeks-columns">
              <div className="month-headers">
                {monthHeaders.map((header, idx) => (
                  <span key={idx} className="month-label" style={{ left: `${header.index * 13}px` }}>
                    {header.label}
                  </span>
                ))}
              </div>

              <div className="columns-wrapper">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="week-column">
                    {week.map((day, dIdx) => {
                      const isAbsent = day.type === 'ABSENCE' || day.type === 'ABSENT' || day.hours > 0;
                      const isRetard = day.type === 'RETARD';
                      const isFuture = day.date ? new Date(day.date) > new Date() : false;
                      const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;

                      return (
                        <div
                          key={dIdx}
                          className={`heatmap-cell ${day.date ? getAbsenceColorClass(day.hours, day.type) : 'cell-empty'}`}
                        >
                          {day.date && (
                            <span className="cell-tooltip">
                              <span className="tooltip-date">
                                {new Date(day.date).toLocaleDateString('fr-FR', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="tooltip-status">
                                {isAbsent
                                  ? `❌ Absence${day.hours > 0 ? ` de ${day.hours}h` : ''} en ${day.subject || 'cours'}${day.justified ? ' (Justifiée)' : ' (Non justifiée)'}${day.motif ? ` - ${day.motif}` : ''}`
                                  : isRetard
                                    ? `⏱️ Retard${day.delay > 0 ? ` de ${day.delay} min` : ''} en ${day.subject || 'cours'}${day.motif ? ` (${day.motif})` : ''}`
                                    : isFuture
                                      ? '📅 Date future'
                                      : isWeekend
                                        ? '🏖️ Week-end'
                                        : '✅ Présence complète'}
                              </span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="heatmap-footer">
          <span>Découvrez comment nous comptabilisons les contributions d'assiduité</span>
          <div className="heatmap-legend">
            <span>Moins</span>
            <div className="legend-square cell-empty"></div>
            <div className="legend-square cell-level-1"></div>
            <div className="legend-square cell-level-2"></div>
            <div className="legend-square cell-level-3"></div>
            <div className="legend-square cell-level-4"></div>
            <span>Plus</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tab-pane">
      <div className="overview-container">
        {/* Hero Welcome Banner */}
        <div className="dashboard-card welcome-card">
          <div className="welcome-info">
            <h2>Bienvenue sur ton livret, {profile?.prenom || 'élève'} !</h2>
            <p>Retrouve tes notes, gère ton portfolio d'activités et prépare ton orientation pour le Baccalauréat.</p>
            <div className="welcome-meta-row">
              <span className="meta-tag">
                <ShieldCheck size={14} /> ID unique : <strong>{profile?.identifiant_national || '---'}</strong>
              </span>
              <span className="meta-tag">
                <GraduationCap size={14} /> Établissement : <strong>{profile?.etablissement_nom || '---'}</strong>
              </span>
              <span className="meta-tag">
                <BookOpen size={14} /> Classe : <strong>{profile?.classe_nom || '---'}</strong>
              </span>
              <span className="meta-tag meta-tag-annee">
                <Calendar size={14} /> Année Scolaire :{' '}
                <strong>{profile?.classe_annee_scolaire || profile?.annee_scolaire || '2026-2027'}</strong>
              </span>
            </div>
          </div>
          <div className="welcome-decor-badge">
            <div className="decor-flag">🇸🇳</div>
            <span>LERAL</span>
          </div>
        </div>

        {/* 2-Column Dashboard Grid */}
        <div className="overview-grid">
          {/* Left Column (Heatmap & AI Advisor) */}
          <div className="overview-left-col">
            {renderAbsenceCalendar()}

            <div className="dashboard-card ai-advisor-card">
              <div className="ai-advisor-header">
                <div className="ai-sparkle-icon">
                  <Sparkles size={20} style={{ color: 'var(--accent-orange)' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Conseil IA Académique</h3>
                  <span className="ai-sub-tag">Analyse et recommandations personnalisées</span>
                </div>
              </div>
              <p className="ai-advice">
                {currentPeriod && currentPeriod.moyenne_generale >= 12
                  ? 'Félicitations pour votre moyenne de ' +
                    currentPeriod.moyenne_generale +
                    "/20 ! Continuez ainsi. Votre profil est idéal pour postuler aux filières sélectives d'excellence post-BAC."
                  : "Votre moyenne générale est encourageante. Pour atteindre vos objectifs, concentrez-vous sur les matières à fort coefficient et essayez d'anticiper vos notes de devoirs avec notre simulateur."}
              </p>
              <button className="secondary-btn w-full" onClick={() => navigate('/student/dashboard/ai-assistant')}>
                <BrainCircuit size={16} /> Poser une question à l'IA
              </button>
            </div>
          </div>

          {/* Right Column (Moyenne Récente & Prochaines Évaluations) */}
          <div className="overview-right-col">
            {/* Grade Average Card */}
            <div className="dashboard-card status-card">
              <div className="card-header-sm">
                <h3>Moyenne Récente</h3>
                <span className="period-pill">{currentPeriodKey || 'Période courante'}</span>
              </div>
              <div className="avg-big-circle">
                <div className="avg-content">
                  <span className="avg-num">{currentPeriod ? currentPeriod.moyenne_generale : '--'}</span>
                  <span className="avg-total">/20</span>
                </div>
              </div>
              <div className="avg-status-badge">
                {currentPeriod && parseFloat(currentPeriod.moyenne_generale) >= 12 ? (
                  <span className="badge-success">
                    <CheckCircle2 size={13} /> Satisfaisant
                  </span>
                ) : currentPeriod && parseFloat(currentPeriod.moyenne_generale) >= 10 ? (
                  <span className="badge-warning">
                    <AlertCircle size={13} /> Encouragement
                  </span>
                ) : (
                  <span className="badge-neutral">
                    <Activity size={13} /> À consolider
                  </span>
                )}
              </div>
              <p className="card-sub-text mt-3">
                Calculée sur la base de {currentPeriod ? Object.keys(currentPeriod.matieres).length : 0} matières.
              </p>
              <button className="primary-btn w-full mt-4" onClick={() => navigate('/student/dashboard/grades')}>
                Voir le détail des notes
              </button>
            </div>

            {/* Next Exams & Calendar */}
            <div className="dashboard-card upcoming-exams-card">
              <div className="card-header-sm">
                <h3>Prochaines Évaluations</h3>
                <Calendar size={18} style={{ color: 'var(--text-slate-500)' }} />
              </div>
              {schedule?.exams?.length > 0 ? (
                <div className="mini-list">
                  {schedule.exams.slice(0, 3).map((ex) => (
                    <div key={ex.id} className="mini-list-item">
                      <div className="badge av-red">{ex.type_examen}</div>
                      <div className="item-details">
                        <h4>{ex.matiere_nom}</h4>
                        <p>
                          {new Date(ex.date_examen).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          à{' '}
                          {new Date(ex.date_examen).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="item-meta">Salle {ex.salle || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Calendar size={32} className="text-gray" />
                  <p>Aucun examen de planifié prochainement.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewTab;
