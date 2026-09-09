import React, { useState, useMemo } from 'react';
import {
  Building, Calendar, Users, Clock, ShieldCheck, BookOpen,
  MessageSquare, Bell, AlertTriangle, ArrowRight, CheckCircle2,
  PlayCircle, Sparkles, BookMarked, UserCheck, QrCode, PenTool
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, Cell
} from 'recharts';

const TeacherOverviewTab = ({
  profile,
  summary,
  activeSchedule = [],
  profAnneeFilter,
  dashboardDetails,
  invitations,
  navigate,
  setActiveTab,
  handleChatContactClick,
  setSelectedClasse,
  setSelectedMatiere,
  setSelectedTypeNote,
  setSelectedPeriode
}) => {
  // --- 1. FILTRER LES CLASSES STRICTEMENT SELON L'ANNÉE SCOLAIRE CHOISIE ---
  const currentPeriodClasses = useMemo(() => {
    const allClasses = dashboardDetails?.classes || [];
    if (!profAnneeFilter) return allClasses;
    return allClasses.filter(c => c.annee_scolaire === profAnneeFilter || !c.annee_scolaire);
  }, [dashboardDetails, profAnneeFilter]);

  // --- 2. STATISTIQUES SELON LA PÉRIODE CHOISIE ---
  const currentSchoolsCount = useMemo(() => {
    const set = new Set();
    currentPeriodClasses.forEach(c => {
      if (c.etablissement_nom) set.add(c.etablissement_nom);
      else if (c.etablissement_id) set.add(c.etablissement_id);
    });
    return set.size || summary?.schoolsCount || 0;
  }, [currentPeriodClasses, summary]);

  const currentClassesCount = currentPeriodClasses.length;
  const currentStudentsCount = useMemo(() => {
    return currentPeriodClasses.reduce((acc, c) => acc + (parseInt(c.total_students, 10) || 0), 0);
  }, [currentPeriodClasses]);

  // --- 3. DÉTECTION DU COURS ACTUEL OU PROCHAIN COURS (sur la période choisie) ---
  const courseStatus = useMemo(() => {
    if (!activeSchedule || activeSchedule.length === 0) {
      return { type: 'NONE' };
    }

    const daysMap = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const now = new Date();
    const currentDayName = daysMap[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const parts = timeStr.split(':');
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
    };

    // Chercher un cours qui a lieu en ce moment
    const current = activeSchedule.find(c => {
      if (c.jour_semaine !== currentDayName) return false;
      const s = parseMinutes(c.heure_debut);
      const e = parseMinutes(c.heure_fin);
      return currentMinutes >= s && currentMinutes < e;
    });

    if (current) {
      return { type: 'CURRENT', course: current };
    }

    // Sinon, chercher le prochain cours plus tard aujourd'hui
    const todayUpcoming = activeSchedule
      .filter(c => c.jour_semaine === currentDayName && parseMinutes(c.heure_debut) > currentMinutes)
      .sort((a, b) => parseMinutes(a.heure_debut) - parseMinutes(b.heure_debut));

    if (todayUpcoming.length > 0) {
      return { type: 'NEXT', course: todayUpcoming[0], isToday: true, isTomorrow: false };
    }

    // Sinon, prochain jour dans la semaine
    const dayOrder = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const currentDayIdx = now.getDay();

    const sortedByNextDay = [...activeSchedule].sort((a, b) => {
      const diffA = (dayOrder.indexOf(a.jour_semaine) - currentDayIdx + 7) % 7 || 7;
      const diffB = (dayOrder.indexOf(b.jour_semaine) - currentDayIdx + 7) % 7 || 7;
      if (diffA !== diffB) return diffA - diffB;
      return parseMinutes(a.heure_debut) - parseMinutes(b.heure_debut);
    });

    if (sortedByNextDay.length > 0) {
      const diffDays = (dayOrder.indexOf(sortedByNextDay[0].jour_semaine) - currentDayIdx + 7) % 7 || 7;
      const isTomorrow = diffDays === 1;
      return { type: 'NEXT', course: sortedByNextDay[0], isToday: false, isTomorrow };
    }

    return { type: 'NONE' };
  }, [activeSchedule]);

  // --- 4. GESTION DES MATIÈRES POUR LE DIAGRAMME DE MOYENNE (sur les classes de la période) ---
  const availableMatieres = useMemo(() => {
    const map = new Map();
    currentPeriodClasses.forEach(c => {
      if (c.matiere_id && c.matiere_nom && !map.has(c.matiere_id)) {
        map.set(c.matiere_id, { id: c.matiere_id, nom: c.matiere_nom });
      }
    });
    return Array.from(map.values());
  }, [currentPeriodClasses]);

  const [selectedMatiereFilter, setSelectedMatiereFilter] = useState(() => {
    return availableMatieres[0]?.id || '';
  });

  React.useEffect(() => {
    if (!availableMatieres.some(m => m.id === selectedMatiereFilter)) {
      setSelectedMatiereFilter(availableMatieres[0]?.id || '');
    }
  }, [availableMatieres, selectedMatiereFilter]);

  // Données du graphique 1 : Suivi de saisie S1 vs S2 par classe (Période choisie uniquement)
  const gradeCompletionData = useMemo(() => {
    return currentPeriodClasses.map(cls => ({
      name: cls.classe_nom,
      shortName: cls.classe_nom,
      fullName: `${cls.classe_nom} (${cls.matiere_nom || ''})`,
      school: cls.etablissement_nom,
      matiere: cls.matiere_nom,
      'Semestre 1': cls.period_stats?.S1?.rate || 0,
      'Semestre 2': cls.period_stats?.S2?.rate || 0,
      s1Entered: cls.period_stats?.S1?.entered || 0,
      s1Expected: cls.period_stats?.S1?.expected || 0,
      s2Entered: cls.period_stats?.S2?.entered || 0,
      s2Expected: cls.period_stats?.S2?.expected || 0,
      classe_id: cls.classe_id,
      matiere_id: cls.matiere_id
    }));
  }, [currentPeriodClasses]);

  // Données du graphique 2 : Moyennes générales par classe pour la matière sélectionnée (Période choisie uniquement)
  const classAveragesData = useMemo(() => {
    const currentMatiereId = selectedMatiereFilter || availableMatieres[0]?.id;
    return currentPeriodClasses
      .filter(c => !currentMatiereId || c.matiere_id === currentMatiereId)
      .map(c => {
        const val = c.moyenne_matiere !== null && c.moyenne_matiere !== undefined
          ? parseFloat(c.moyenne_matiere)
          : null;
        return {
          name: c.classe_nom,
          shortName: c.classe_nom,
          school: c.etablissement_nom,
          niveau: c.niveau,
          moyenne: val !== null ? val : 0,
          hasNotes: val !== null,
          totalStudents: c.total_students,
          totalNotes: c.total_notes || 0,
          classe_id: c.classe_id,
          matiere_id: c.matiere_id
        };
      });
  }, [currentPeriodClasses, selectedMatiereFilter, availableMatieres]);

  return (
    <div className="tab-pane">
      {/* BANNIÈRE PRÉSIDENT DE JURY (SI ÉLIGIBLE) */}
      {profile?.is_president_jury && (
        <div style={{ background: 'linear-gradient(135deg, #131e6c 0%, #1e293b 100%)', color: '#ffffff', borderRadius: 16, padding: '18px 24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b' }}>
              🎖️ Convocations & Accès Officiels — Président de Jury
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.88 }}>
              Vous êtes officiellement désigné(e) par l'Office du BAC. Vos identifiants temporaires et votre convocation sont disponibles dans votre messagerie.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('messages');
                handleChatContactClick({ id: 'OFFICE_BAC', name: 'Office du Baccalauréat du Sénégal', type: 'OFFICE_BAC' });
              }}
              style={{ padding: '8px 16px', borderRadius: 8, background: '#f59e0b', color: '#fff', border: 'none', fontWeight: 900, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <MessageSquare size={14} /> Voir ma Convocation
            </button>
          </div>
        </div>
      )}

      {/* HEADER & STATS */}
      <div className="dashboard-grid">
        <div className="welcome-card card-box">
          <div className="welcome-info">
            <h2>Bienvenue dans votre Espace, M./Mme {profile?.nom} !</h2>
            <p>Gérez vos enseignements, planifiez vos cours et suivez les résultats et assiduités de vos classes sur l'ensemble de vos établissements partenaires.</p>
            <div className="welcome-meta">
              <span className="meta-tag"><ShieldCheck size={14} /> ID Enseignant : {profile?.identifiant_national}</span>
              <span className="meta-tag"><BookOpen size={14} /> Matière : {profile?.matiere_principale || 'Non spécifiée'}</span>
            </div>
          </div>
          <div className="welcome-decor">ENS</div>
        </div>

        {/* 1. ÉTABLISSEMENTS PARTENAIRES */}
        <div
          className="stat-card"
          onClick={() => navigate('/professeur/dashboard/partner-schools')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            minHeight: '112px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Établissements
            </span>
            <div style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center' }}>
              <Building size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-slate-900)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {currentSchoolsCount}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-slate-500)', marginTop: '4px', fontWeight: 500 }}>
              Partenaires actifs
            </div>
          </div>
        </div>

        {/* 2. CLASSES ENSEIGNÉES */}
        <div
          className="stat-card"
          onClick={() => navigate('/professeur/dashboard/attached-classes')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            minHeight: '112px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Classes Enseignées
            </span>
            <div style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-slate-900)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {currentClassesCount}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-slate-500)', marginTop: '4px', fontWeight: 500 }}>
              {profAnneeFilter || 'Période active'}
            </div>
          </div>
        </div>

        {/* 3. NOMBRE TOTAL D'ÉLÈVES */}
        <div
          className="stat-card"
          onClick={() => navigate('/professeur/dashboard/attached-classes')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            minHeight: '112px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Élèves
            </span>
            <div style={{ color: '#2563eb', display: 'flex', alignItems: 'center' }}>
              <Users size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-slate-900)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {currentStudentsCount}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-slate-500)', marginTop: '4px', fontWeight: 500 }}>
              Inscrits dans vos classes
            </div>
          </div>
        </div>

        {/* 4. COURS HEBDOMADAIRES */}
        <div
          className="stat-card"
          onClick={() => navigate('/professeur/dashboard/schedule')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            minHeight: '112px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Cours / Semaine
            </span>
            <div style={{ color: '#16a34a', display: 'flex', alignItems: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-slate-900)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {activeSchedule?.length || 0}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-slate-500)', marginTop: '4px', fontWeight: 500 }}>
              Créneaux d'emploi du temps
            </div>
          </div>
        </div>
      </div>

      {/* SECTION DYNAMIQUE : COURS EN DIRECT OU PROCHAIN COURS */}
      <div className="card-box" style={{
        background: courseStatus.type === 'CURRENT'
          ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.08) 0%, rgba(21, 128, 61, 0.04) 100%)'
          : '#ffffff',
        borderColor: courseStatus.type === 'CURRENT' ? '#86efac' : 'var(--border-slate-200)',
        borderWidth: courseStatus.type === 'CURRENT' ? '1.5px' : '1px'
      }}>
        {courseStatus.type === 'CURRENT' ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: '#16a34a', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
              }}>
                <PlayCircle size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    background: '#16a34a', color: 'white',
                    padding: '2px 8px', borderRadius: 20,
                    fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    🟢 En cours
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-blue)' }}>
                    {courseStatus.course.heure_debut?.substring(0, 5)} - {courseStatus.course.heure_fin?.substring(0, 5)}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                  {courseStatus.course.matiere_nom} — <span style={{ color: 'var(--primary-blue)' }}>{courseStatus.course.classe_nom}</span> ({courseStatus.course.niveau})
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-slate-600)' }}>
                  Salle : <strong>{courseStatus.course.salle || 'Non spécifiée'}</strong> • Établissement : <strong>{courseStatus.course.etablissement_nom}</strong>
                </p>
              </div>
            </div>

            {/* Boutons d'action pour le cours en cours */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/professeur/emargement')}
                style={{ background: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 16px', borderRadius: 8 }}
              >
                <QrCode size={16} /> Émarger ce cours
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/professeur/dashboard/attendance')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 16px', borderRadius: 8 }}
              >
                <UserCheck size={16} /> Faire l'appel
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/professeur/dashboard/cahier-texte')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 16px', borderRadius: 8 }}
              >
                <BookMarked size={16} /> Cahier de texte
              </button>
            </div>
          </div>
        ) : courseStatus.type === 'NEXT' ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(19, 30, 108, 0.08)', color: 'var(--primary-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    background: 'rgba(19, 30, 108, 0.08)', color: 'var(--primary-blue)',
                    padding: '2px 8px', borderRadius: 20,
                    fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    ⏳ Prochain cours
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-blue)' }}>
                    {courseStatus.isToday ? "Aujourd'hui" : courseStatus.isTomorrow ? `Demain (${courseStatus.course.jour_semaine})` : courseStatus.course.jour_semaine} à {courseStatus.course.heure_debut?.substring(0, 5)}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                  {courseStatus.course.matiere_nom} — <span style={{ color: 'var(--primary-blue)' }}>{courseStatus.course.classe_nom}</span> ({courseStatus.course.niveau})
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-slate-600)' }}>
                  Créneau : {courseStatus.course.heure_debut?.substring(0, 5)} - {courseStatus.course.heure_fin?.substring(0, 5)} • Salle : <strong>{courseStatus.course.salle || 'Standard'}</strong> • {courseStatus.course.etablissement_nom}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/professeur/dashboard/schedule')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 16px', borderRadius: 8 }}
              >
                <Calendar size={14} /> Emploi du temps complet
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Calendar size={28} style={{ color: 'var(--text-slate-400)' }} />
            <div>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Aucun cours programmé</h4>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-slate-500)' }}>Votre emploi du temps est libre pour le moment.</p>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/professeur/dashboard/schedule')}
              style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: 11 }}
            >
              Consulter le planning
            </button>
          </div>
        )}
      </div>

      {/* BOUTONS D'ACCÈS RAPIDE */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-blue)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={16} /> Accès Rapide aux Fonctionnalités
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {[
            {
              title: 'Émarger',
              desc: 'Scanner QR',
              icon: <QrCode size={20} />,
              color: '#16a34a',
              bg: 'rgba(22, 163, 74, 0.08)',
              action: () => navigate('/professeur/emargement')
            },
            {
              title: "Faire l'Appel",
              desc: 'Absences & Retards élèves',
              icon: <UserCheck size={20} />,
              color: '#0284c7',
              bg: 'rgba(2, 132, 199, 0.08)',
              action: () => navigate('/professeur/dashboard/attendance')
            },
            {
              title: 'Saisie des Notes',
              desc: 'Devoirs & Compositions',
              icon: <PenTool size={20} />,
              color: 'var(--primary-blue)',
              bg: 'rgba(19, 30, 108, 0.08)',
              action: () => navigate('/professeur/dashboard/grades')
            },
            {
              title: 'Cahier de Texte',
              desc: 'Contenus des séances & devoirs',
              icon: <BookMarked size={20} />,
              color: '#8b5cf6',
              bg: 'rgba(139, 92, 246, 0.08)',
              action: () => navigate('/professeur/dashboard/cahier-texte')
            },
            {
              title: 'Emploi du Temps',
              desc: 'Planning hebdomadaire',
              icon: <Calendar size={20} />,
              color: '#ea580c',
              bg: 'rgba(234, 88, 12, 0.08)',
              action: () => navigate('/professeur/dashboard/schedule')
            }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className="card-box"
              style={{
                cursor: 'pointer',
                margin: 0,
                padding: '16px',
                borderRadius: 12,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = item.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border-slate-200)';
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: item.bg, color: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-slate-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.desc}
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text-slate-400)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION GRAPHIQUES : 2 DIAGRAMMES CLÉS */}
      <div className="charts-grid">
        
        {/* DIAGRAMME 1 : SUIVI DE SAISIE DES NOTES PAR CLASSE (S1 vs S2) */}
        <div className="card-box" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} /> Suivi de saisie des notes (S1 & S2)
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-slate-500)' }}>
                Taux de complétion des notes par classe et par semestre
              </p>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/professeur/dashboard/grades')}
              style={{ fontSize: 11, padding: '4px 10px' }}
            >
              Saisir <ArrowRight size={12} style={{ marginLeft: 4 }} />
            </button>
          </div>

          {gradeCompletionData.length > 0 ? (
            <div style={{ width: '100%', height: 260, minHeight: 260 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={gradeCompletionData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div style={{ background: '#0f172a', color: '#ffffff', padding: '10px 14px', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                          <div style={{ fontWeight: 800, marginBottom: 4 }}>{data.fullName}</div>
                          <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 6 }}>{data.school}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#93c5fd' }}>
                            <span>Semestre 1 :</span>
                            <strong>{data['Semestre 1']}%</strong>
                            <span style={{ fontSize: 10 }}>({data.s1Entered}/{data.s1Expected})</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fca5a5' }}>
                            <span>Semestre 2 :</span>
                            <strong>{data['Semestre 2']}%</strong>
                            <span style={{ fontSize: 10 }}>({data.s2Entered}/{data.s2Expected})</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Semestre 1" fill="#131e6c" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="Semestre 2" fill="#f93f2d" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-slate-400)', fontSize: 13 }}>
              Aucune classe rattachée pour afficher les taux de saisie.
            </div>
          )}
        </div>

        {/* DIAGRAMME 2 : NOTE GÉNÉRALE MOYENNE PAR CLASSE AVEC SÉLECTEUR DE MATIÈRE */}
        <div className="card-box" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} /> Moyennes générales par classe
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-slate-500)' }}>
                Performance globale sur 20 avec seuil de réussite
              </p>
            </div>

            {/* Sélecteur déroulant de matière */}
            {availableMatieres.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-slate-500)' }}>Matière :</label>
                <select
                  value={selectedMatiereFilter}
                  onChange={e => setSelectedMatiereFilter(e.target.value)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: '1px solid var(--border-slate-200)',
                    background: '#f8fafc',
                    color: 'var(--primary-blue)',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {availableMatieres.map(m => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {classAveragesData.length > 0 ? (
            <div style={{ width: '100%', height: 260, minHeight: 260 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={classAveragesData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                  <YAxis domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} unit="/20" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <ReferenceLine y={10} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Seuil 10/20', position: 'insideTopRight', fill: '#dc2626', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div style={{ background: '#0f172a', color: '#ffffff', padding: '10px 14px', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                          <div style={{ fontWeight: 800, marginBottom: 4 }}>{data.name} ({data.school})</div>
                          <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 6 }}>Effectif : {data.totalStudents} élèves</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: data.moyenne >= 10 ? '#86efac' : '#fca5a5' }}>
                            <span>Moyenne générale :</span>
                            <strong>{data.hasNotes ? `${data.moyenne.toFixed(2)} / 20` : 'Pas encore de note'}</strong>
                          </div>
                          {data.totalNotes > 0 && (
                            <div style={{ fontSize: 10, opacity: 0.75, marginTop: 4 }}>
                              Basé sur {data.totalNotes} note(s) enregistrée(s)
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="moyenne" name="Moyenne générale" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {classAveragesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={!entry.hasNotes ? '#cbd5e1' : entry.moyenne >= 10 ? '#16a34a' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-slate-400)', fontSize: 13 }}>
              Aucune classe trouvée pour cette matière.
            </div>
          )}
        </div>

      </div>


      {/* ALERTES & NOTIFICATIONS IMPORTANTES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {dashboardDetails?.alerts?.unreadMessagesCount > 0 && (
          <div className="card-box" style={{ borderLeft: '4px solid var(--accent-blue)', background: '#f0f7ff', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Bell color="var(--primary-blue)" size={20} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--primary-blue)' }}>Nouveaux messages</h3>
            </div>
            <p style={{ fontSize: 13, margin: '0 0 12px', color: 'var(--text-slate-700)' }}>
              Vous avez <strong>{dashboardDetails.alerts.unreadMessagesCount}</strong> message(s) non lu(s) dans votre boîte de réception.
            </p>
            <button className="btn btn-outline" onClick={() => navigate('/professeur/dashboard/messages')} style={{ padding: '6px 12px', fontSize: 11 }}>
              Lire les messages
            </button>
          </div>
        )}

        {dashboardDetails?.alerts?.pendingExams?.length > 0 && (
          <div className="card-box" style={{ borderLeft: '4px solid var(--accent-amber)', background: '#fffbeb', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <AlertTriangle color="#d97706" size={20} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#92400e' }}>Notes en attente de saisie</h3>
            </div>
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dashboardDetails.alerts.pendingExams.map(exam => {
                const daysLeft = Math.round((new Date(exam.date_examen) - new Date()) / (1000 * 60 * 60 * 24));
                const isPast = daysLeft < 0;
                return (
                  <div key={exam.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: 6, border: '1px solid #fef3c7' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-blue)' }}>{exam.classe_nom} | {exam.matiere_nom}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-slate-500)' }}>
                        {exam.type_examen} du {new Date(exam.date_examen).toLocaleDateString('fr-FR')} 
                        <span style={{ marginLeft: 6, fontWeight: 700, color: isPast ? 'var(--accent-red)' : '#d97706' }}>
                          ({isPast ? 'Saisie en retard' : `Dans ${daysLeft} j`})
                        </span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-slate-700)' }}>
                        Saisie : {exam.entered_students} / {exam.total_students} élèves
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setSelectedClasse(exam.classe_id);
                        setSelectedMatiere(exam.matiere_id);
                        setSelectedTypeNote(exam.type_examen);
                        const month = new Date(exam.date_examen).getMonth() + 1;
                        let guessed = 'Semestre 1';
                        if (month >= 3 && month <= 9) guessed = 'Semestre 2';
                        setSelectedPeriode(guessed);
                        navigate('/professeur/dashboard/grades');
                      }}
                      style={{ padding: '4px 10px', fontSize: 10, background: '#d97706', borderColor: '#d97706' }}
                    >
                      Saisir
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {invitations?.length > 0 && (
          <div className="card-box" style={{ borderLeft: '4px solid var(--accent-red)', background: '#fffcfc', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <AlertTriangle color="var(--accent-red)" size={20} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--primary-blue)' }}>Invitations en attente</h3>
            </div>
            <p style={{ fontSize: 13, margin: '0 0 12px', color: 'var(--text-slate-700)' }}>
              Vous avez <strong>{invitations.length}</strong> invitation(s) d'établissement(s) en attente.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/professeur/dashboard/invitations')} style={{ padding: '6px 14px', fontSize: 11, background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>
              Voir les invitations <ArrowRight size={12} style={{ marginLeft: 4 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherOverviewTab;
