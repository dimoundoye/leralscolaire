import React from 'react';
import {
  Building, Calendar, Users, Clock, ShieldCheck, BookOpen,
  MessageSquare, Bell, AlertTriangle, ArrowRight
} from 'lucide-react';

const TeacherOverviewTab = ({
  profile,
  summary,
  activeSchedule,
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
  return (
    <div className="tab-pane">
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

        <div className="stat-card" onClick={() => navigate('/professeur/dashboard/partner-schools')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon blue"><Building size={24} /></div>
          <div className="stat-info">
            <h3>Établissements Actifs</h3>
            <div className="stat-value">{summary?.schoolsCount || 0}</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/professeur/dashboard/attached-classes')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon red"><Calendar size={24} /></div>
          <div className="stat-info">
            <h3>Classes Enseignées</h3>
            <div className="stat-value">{summary?.classesCount || 0}</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/professeur/dashboard/attached-classes')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon amber"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Nombre Total d'Élèves</h3>
            <div className="stat-value">{summary?.studentsCount || 0}</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/professeur/dashboard/schedule')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon green"><Clock size={24} /></div>
          <div className="stat-info">
            <h3>Cours Hebdomadaires</h3>
            <div className="stat-value">{activeSchedule?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* ALERTS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Messages non lus Alert */}
        {dashboardDetails?.alerts?.unreadMessagesCount > 0 && (
          <div className="card-box" style={{ borderLeft: '4px solid var(--accent-blue)', background: '#f0f7ff', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Bell color="var(--primary-blue)" size={20} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--primary-blue)' }}>Nouveaux messages</h3>
            </div>
            <p style={{ fontSize: '13px', margin: '0 0 12px', color: 'var(--text-slate-700)' }}>
              Vous avez <strong>{dashboardDetails.alerts.unreadMessagesCount}</strong> message(s) non lu(s) dans votre boîte de réception.
            </p>
            <button className="btn btn-outline" onClick={() => navigate('/professeur/dashboard/messages')} style={{ padding: '6px 12px', fontSize: '11px' }}>
              Lire les messages
            </button>
          </div>
        )}

        {/* Notes non saisies proches d'une échéance Alert */}
        {dashboardDetails?.alerts?.pendingExams?.length > 0 && (
          <div className="card-box" style={{ borderLeft: '4px solid var(--accent-amber)', background: '#fffbeb', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <AlertTriangle color="#d97706" size={20} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#92400e' }}>Notes en attente de saisie</h3>
            </div>
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dashboardDetails.alerts.pendingExams.map(exam => {
                const daysLeft = Math.round((new Date(exam.date_examen) - new Date()) / (1000 * 60 * 60 * 24));
                const isPast = daysLeft < 0;
                return (
                  <div key={exam.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fef3c7' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-blue)' }}>{exam.classe_nom} | {exam.matiere_nom}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-slate-500)' }}>
                        {exam.type_examen} du {new Date(exam.date_examen).toLocaleDateString('fr-FR')} 
                        <span style={{ marginLeft: 6, fontWeight: 700, color: isPast ? 'var(--accent-red)' : '#d97706' }}>
                          ({isPast ? 'Saisie en retard' : `Dans ${daysLeft} j`})
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-slate-700)' }}>
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
                      style={{ padding: '4px 10px', fontSize: '10px', background: '#d97706', borderColor: '#d97706' }}
                    >
                      Saisir
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* LIST OF PARTNER ESTABLISHMENTS */}
      <div className="card-box" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={18} /> Liste des établissements partenaires
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '12px' }}>Établissement</th>
                <th style={{ padding: '12px' }}>Localisation</th>
                <th style={{ padding: '12px' }}>Statut de l'affectation</th>
                <th style={{ padding: '12px' }}>Date d'affiliation</th>
              </tr>
            </thead>
            <tbody>
              {dashboardDetails?.affiliations?.length > 0 ? (
                dashboardDetails.affiliations.slice(0, 3).map(aff => (
                  <tr key={aff.etablissement_id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{aff.etablissement_nom}</td>
                    <td style={{ padding: '12px', color: 'var(--text-slate-700)' }}> {aff.ville}, {aff.region}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                        background: aff.statut === 'ACCEPTE' ? '#dcfce7' : aff.statut === 'EN_ATTENTE' ? '#fef3c7' : '#fee2e2',
                        color: aff.statut === 'ACCEPTE' ? '#15803d' : aff.statut === 'EN_ATTENTE' ? '#b45309' : '#b91c1c'
                      }}>
                        {aff.statut === 'ACCEPTE' ? 'Active / Rattaché' : aff.statut === 'EN_ATTENTE' ? 'Invitation en attente' : 'Réfusé'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-slate-500)', fontSize: '12px' }}>
                      {aff.date_reponse ? new Date(aff.date_reponse).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-slate-400)' }}>Aucun établissement associé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {dashboardDetails?.affiliations?.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/professeur/dashboard/partner-schools')}
              style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Voir plus <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* SUMMARY OF CLASSES & GRADE ENTRY RATES */}
      <div className="card-box">
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} /> Classes rattachées & Suivi de saisie des notes
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '12px' }}>Établissement</th>
                <th style={{ padding: '12px' }}>Classe</th>
                <th style={{ padding: '12px' }}>Matière</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Élèves</th>
                <th style={{ padding: '12px' }}>Taux de saisie par période (Devoirs + Examens)</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Accès</th>
              </tr>
            </thead>
            <tbody>
              {dashboardDetails?.classes?.length > 0 ? (
                dashboardDetails.classes.slice(0, 3).map(cls => (
                  <tr key={`${cls.classe_id}-${cls.matiere_id}`} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-slate-700)' }}>{cls.etablissement_nom}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{cls.classe_nom} ({cls.niveau})</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{cls.matiere_nom}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: 'var(--primary-blue)' }}>{cls.total_students}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        {['S1', 'S2'].map(term => {
                          const termStat = cls.period_stats?.[term];
                          const rate = termStat?.rate || 0;
                          let badgeBg = '#f1f5f9';
                          let badgeColor = '#64748b';
                          if (rate === 100) { badgeBg = '#dcfce7'; badgeColor = '#15803d'; }
                          else if (rate > 0) { badgeBg = '#fef3c7'; badgeColor = '#b45309'; }
                          return (
                            <div key={term} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-500)' }}>{term}:</span>
                              <span style={{
                                fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                                background: badgeBg, color: badgeColor
                              }}>
                                {rate}%
                              </span>
                              <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>
                                ({termStat?.entered}/{termStat?.expected})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => {
                          setSelectedClasse(cls.classe_id);
                          setSelectedMatiere(cls.matiere_id);
                          navigate('/professeur/dashboard/grades');
                        }}
                        style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Accéder <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-slate-400)' }}>Aucune classe active pour le moment.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {dashboardDetails?.classes?.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/professeur/dashboard/attached-classes')}
              style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Voir plus <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {invitations?.length > 0 && (
        <div className="card-box" style={{ borderLeft: '4px solid var(--accent-red)', background: '#fffcfc', marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <AlertTriangle color="var(--accent-red)" size={20} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--primary-blue)' }}>Invitations en attente</h3>
          </div>
          <p style={{ fontSize: '13px', margin: '0 0 16px', color: 'var(--text-slate-700)' }}>
            Vous avez <strong>{invitations.length}</strong> invitation(s) d'établissement(s) scolaire(s) en attente de réponse. Veuillez les traiter pour pouvoir être associé à leurs classes.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/professeur/dashboard/invitations')} style={{ padding: '8px 16px', fontSize: '12px', background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>
            Voir les invitations <ArrowRight size={14} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherOverviewTab;
