import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminCalendarTab = ({
  calendarDate,
  setCalendarDate,
  calendarExams,
  setSelectedExam
}) => {
  return (
    <div className="calendar-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendrier</h1>
          <p className="page-subtitle">Vue mensuelle globale des épreuves programmées</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="cal-legend" style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', marginRight: '16px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--slate-600)' }}>
              <span className="cal-legend-dot devoir" /> Devoir
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--slate-600)' }}>
              <span className="cal-legend-dot comp" /> Composition
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--slate-600)' }}>
              <span className="cal-legend-dot exam" /> Examen
            </span>
          </div>
          <div className="cal-nav" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <button className="btn-icon-small" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} style={{ border: 'none', background: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
              <ChevronLeft size={14} />
            </button>
            <span className="cal-nav-title" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'capitalize', minWidth: '120px', textAlign: 'center', color: 'var(--slate-800)' }}>
              {calendarDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button className="btn-icon-small" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} style={{ border: 'none', background: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="table-block" style={{ padding: '20px', overflow: 'visible' }}>
        <div className="exam-calendar">
          <div className="cal-grid">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="cal-header-cell" style={{ fontWeight: 700, color: 'var(--slate-500)', fontSize: '11px', textTransform: 'uppercase', paddingBottom: '10px' }}>{d}</div>
            ))}
            {(() => {
              const year = calendarDate.getFullYear();
              const month = calendarDate.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const today = new Date();
              const cells = [];
              const startOffset = firstDay === 0 ? 6 : firstDay - 1;
              for (let i = 0; i < startOffset; i++) cells.push(<div key={`empty-${i}`} className="cal-cell cal-empty" />);
              for (let d = 1; d <= daysInMonth; d++) {
                const dayExams = calendarExams.filter(ex => {
                  const exDate = new Date(ex.date_examen);
                  return exDate.getFullYear() === year && exDate.getMonth() === month && exDate.getDate() === d;
                });
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
                const grouped = dayExams.reduce((acc, ex) => {
                  const key = ex.classe_nom;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(ex);
                  return acc;
                }, {});
                const groupKeys = Object.keys(grouped);
                cells.push(
                  <div key={d} className={`cal-cell ${isToday ? 'cal-today' : ''} ${dayExams.length > 0 ? 'cal-has-event' : ''}`}>
                    <span className="cal-day-num" style={{ fontWeight: 700 }}>{d}</span>
                    <div className="cal-events">
                      {groupKeys.slice(0, 2).map(classe => {
                        const exams = grouped[classe];
                        const types = [...new Set(exams.map(e => e.type_examen))];
                        const colors = types.map(t => t === 'EXAMEN' ? 'exam' : t === 'COMPOSITION' ? 'comp' : 'devoir').join(' ');
                        return (
                          <div key={classe} className={`cal-event cal-event-group ${colors}`} onClick={() => setSelectedExam({ classe, exams, date: `${d}/${month + 1}/${year}` })}>
                            <span className="cal-event-classe">{classe}</span>
                            <div>
                              {exams.slice(0, 1).map(ex => {
                                const hasTime = ex.date_examen && ex.date_examen.includes('T');
                                const timeStr = hasTime ? new Date(ex.date_examen).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null;
                                return timeStr ? <span key={ex.id} className="cal-event-time">{timeStr}</span> : null;
                              })}
                              <span className="cal-event-count">{exams.length} épreuve{exams.length > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        );
                      })}
                      {groupKeys.length > 2 && <span className="cal-more">+{groupKeys.length - 2} classes</span>}
                    </div>
                  </div>
                );
              }
              return cells;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendarTab;
