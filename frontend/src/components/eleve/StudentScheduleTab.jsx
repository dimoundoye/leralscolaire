import React from 'react';
import { Calendar, BookOpen, Clock, User, GraduationCap, CheckCircle2 } from 'lucide-react';

const StudentScheduleTab = ({ schedule, profile }) => {
  const hasTimetable = schedule.timetable && schedule.timetable.length > 0;
  const hasExams = schedule.exams && schedule.exams.length > 0;

  const activeClassNom = schedule.timetable[0]?.classe_nom || profile?.classe_nom || '';
  const activeAnnee = schedule.timetable[0]?.annee_scolaire || '2025-2026';

  return (
    <div className="tab-pane">
      
      {/* Top Hero Banner */}
      <div className="schedule-hero-banner card-box">
        <div className="sched-hero-left">
          <div className="sched-title-row">
            <h2>Emploi du Temps & Planning des Évaluations</h2>
            <span className="sched-badge-tag"><Calendar size={14} /> Année {activeAnnee}</span>
          </div>
          <p className="sched-hero-sub">
            Consultez le déroulement hebdomadaire de vos cours et soyez informé à l'avance des dates de vos devoirs et examens.
          </p>
        </div>
        {activeClassNom && (
          <div className="sched-class-pill">
            <BookOpen size={15} /> Classe : <strong>{activeClassNom}</strong>
          </div>
        )}
      </div>

      {/* 1. FULL WIDTH TIMETABLE SECTION */}
      <div className="timetable-section card-box mt-5">
        <div className="sim-inputs-header">
          <div>
            <h3>Emploi du Temps Hebdomadaire</h3>
            <p className="subtitle">Organisation des cours du Lundi au Samedi</p>
          </div>
        </div>

        {hasTimetable ? (
          <div className="timetable-grid-full mt-4">
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(jour => {
              const classesForDay = schedule.timetable.filter(t => t.jour_semaine === jour);
              return (
                <div key={jour} className="day-column-full">
                  <div className="day-header-pill">
                    <span>{jour}</span>
                    {classesForDay.length > 0 && <span className="count-dot">{classesForDay.length}</span>}
                  </div>
                  <div className="slots-list">
                    {classesForDay.length > 0 ? (
                      classesForDay.map(slot => {
                        const formatRoom = (roomStr) => {
                          if (!roomStr || roomStr.trim() === '') return 'Salle N/A';
                          const trimmed = roomStr.trim();
                          if (trimmed.toLowerCase().startsWith('salle')) {
                            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                          }
                          return `Salle ${trimmed}`;
                        };

                        return (
                          <div key={slot.id} className="slot-card-full">
                            <div className="slot-time-badge">
                              <Clock size={12} /> {slot.heure_debut.slice(0, 5)} - {slot.heure_fin.slice(0, 5)}
                            </div>
                            <strong className="slot-subject-title">{slot.matiere_nom}</strong>
                            <div className="slot-footer-details">
                              <span className="slot-teacher-lbl" title={slot.professeur_email}>
                                <User size={11} /> {slot.professeur_email ? slot.professeur_email.split('@')[0] : 'Enseignant'}
                              </span>
                              <span className="slot-room-lbl">
                                {formatRoom(slot.salle)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="slot-empty-full">Pas de cours</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state py-8">
            <Calendar size={48} className="text-gray" />
            <p>Aucun emploi du temps n'a été saisi pour votre classe.</p>
          </div>
        )}
      </div>

      {/* 2. FULL WIDTH EXAM CALENDAR SECTION BELOW */}
      <div className="exams-planning-section card-box mt-6">
        <div className="sim-inputs-header">
          <div>
            <h3>Calendrier des Évaluations & Examens</h3>
            <p className="subtitle">Dates de devoirs sur table, compositions et examens programmés</p>
          </div>
          {hasExams && (
            <span className="exams-count-badge">
              <GraduationCap size={14} /> {schedule.exams.length} évaluation(s) planifiée(s)
            </span>
          )}
        </div>

        {hasExams ? (
          <div className="exams-grid-full mt-4">
            {schedule.exams.map(ex => {
              const examDate = new Date(ex.date_examen);
              const dayNum = examDate.getDate();
              const monthStr = examDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
              const fullDateStr = examDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
              const timeStr = examDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={ex.id} className="exam-card-full">
                  <div className="exam-card-date-box">
                    <span className="exam-day-num">{dayNum}</span>
                    <span className="exam-month-name">{monthStr}</span>
                  </div>

                  <div className="exam-card-content">
                    <div className="exam-card-top">
                      <h4>{ex.matiere_nom}</h4>
                      <span className={`exam-type-pill ${ex.type_examen === 'COMPOSITION' ? 'type-comp' : 'type-dev'}`}>
                        {ex.type_examen}
                      </span>
                    </div>
                    <p className="exam-date-detail">
                      <Clock size={13} /> {fullDateStr} à {timeStr}
                    </p>
                    <div className="exam-card-bottom">
                      <span className="exam-room-pill">Salle : <strong>{ex.salle || 'Non définie'}</strong></span>
                      <span className="exam-status-pill"><CheckCircle2 size={12} /> Confirmation {ex.statut || 'VALIDÉ'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state py-8">
            <GraduationCap size={48} className="text-gray" />
            <p>Aucune évaluation n'est actuellement planifiée pour votre classe.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentScheduleTab;
