import React from 'react';
import { Users, School, User, CheckCircle2, BookOpenCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';

const AdminOverviewTab = ({
  profile,
  navigate,
  setShowEleveModal,
  eleves,
  classes,
  classesAnneeFilter,
  profs,
  chartSemestre,
  setChartSemestre,
  classAverages
}) => {
  return (
    <>
      {/* Page Title & Subtitle with orange action button */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Bienvenue, {profile.nom || 'Administrateur'} — Code Établissement : <code>{profile.code_etablissement || 'LERAL-ETAB'}</code></p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => navigate('/dashboard/settings')} style={{ fontSize: '11px', padding: '6px 12px' }}>
            Paramètres
          </button>
          <button className="btn btn-primary" onClick={() => setShowEleveModal(true)} style={{ background: 'var(--accent-color)', borderColor: 'var(--accent-color)', fontSize: '11px', padding: '6px 14px' }}>
            + Inscrire un élève
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-card-main">
            <span className="lbl">Total Élèves</span>
            <span className="num">{eleves.length}</span>
          </div>
          <div className="stat-card-icon av-blue">
            <Users size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-main">
            <span className="lbl">Classes</span>
            <span className="num">{classes.filter(c => c.annee_scolaire === classesAnneeFilter).length}</span>
          </div>
          <div className="stat-card-icon av-pink">
            <School size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-main">
            <span className="lbl">Professeurs</span>
            <span className="num">{profs.length}</span>
          </div>
          <div className="stat-card-icon av-green">
            <User size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-main">
            <span className="lbl">Élèves Aptes</span>
            <span className="num">{eleves.filter(e => e.statut === 'APTE').length}</span>
          </div>
          <div className="stat-card-icon av-purple">
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      <div className="mid-row">
        <div className="ai-card">
          <div className="ai-header">
            <div className="ai-dot">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            </div>
            <div className="ai-title">Assistant IA</div>
          </div>
          <div className="ai-desc">Analyse des performances, détection de décrochage, suggestions d'orientation.</div>
          <button className="ai-btn">Explorer →</button>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Activités Récentes</div>
              <div className="card-sub">Dernières actions sur la plateforme</div>
            </div>
          </div>
          <div className="task-item">
            <div className="task-icon-box">
              <Users size={16} />
            </div>
            <div className="task-text">
              <div className="tname">{eleves.length} élèves inscrits</div>
              <div className="tcount"><span className="big-num">{classes.filter(c => c.annee_scolaire === classesAnneeFilter).length}</span> classes</div>
            </div>
          </div>
          <div className="task-item">
            <div className="task-icon-box">
              <BookOpenCheck size={16} />
            </div>
            <div className="task-text">
              <div className="tname">{profs.length} professeurs</div>
              <div className="tcount">Corps enseignant</div>
            </div>
          </div>
          <div className="card-actions">
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/eleves')} style={{flex: 1}}>Gérer les élèves</button>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div className="card-title">Moyenne Générale par Classe</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

              <div className="chart-semestre-toggle">
                <button className={`sm-btn ${chartSemestre === 1 ? 'active' : ''}`} onClick={() => setChartSemestre(1)}>Semestre 1</button>
                <button className={`sm-btn ${chartSemestre === 2 ? 'active' : ''}`} onClick={() => setChartSemestre(2)}>Semestre 2</button>
              </div>
            </div>
          </div>
          {classAverages.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={classAverages} margin={{top: 10, right: 10, left: -20, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="classe_nom" tick={{fontSize: 9, fill: '#94a3b8'}} tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={45} />
                <YAxis domain={[0, 20]} tick={{fontSize: 9, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: 'var(--shadow-soft)' }}
                  formatter={(value) => [Number(value).toFixed(2), 'Moyenne']}
                  labelFormatter={(label) => `Classe: ${label}`}
                />
                <Bar dataKey="moyenne_generale" radius={[4, 4, 0, 0]}>
                  {classAverages.map((entry, index) => {
                    const isBest = entry.moyenne_generale === Math.max(...classAverages.map(c => c.moyenne_generale));
                    return <Cell key={index} fill={isBest ? 'var(--success)' : 'var(--primary-color)'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Aucune donnée pour ce semestre</div>
          )}
          {classAverages.length > 0 && (
            <div className="chart-footer">
              {(() => {
                const best = classAverages.reduce((a, b) => a.moyenne_generale > b.moyenne_generale ? a : b);
                return <span className="best-class">🏆 Meilleure classe : <strong>{best.classe_nom}</strong> ({Number(best.moyenne_generale).toFixed(2)}/20)</span>;
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="welcome-section" style={{marginTop: 4}}>
        <h2>Dernières inscriptions</h2>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr><th>Élève</th><th>Classe</th><th>Identifiant</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {eleves.slice(0, 5).map(e => (
              <tr key={e.id}>
                <td><div className="user-cell"><div className="avatar av-blue" style={{width:24,height:24,fontSize:8}}>{e.prenom?.[0]}{e.nom?.[0]}</div><span className="font-bold">{e.prenom} {e.nom}</span></div></td>
                <td>{e.classe_nom || '--'}</td>
                <td style={{fontSize:11, color:'var(--gray-400)'}}>{e.identifiant_national}</td>
                <td><span className={`status-pill ${e.statut === 'APTE' ? 'status-pass' : 'status-fail'}`}>{e.statut}</span></td>
              </tr>
            ))}
            {eleves.length === 0 && <tr><td colSpan="4" className="text-center" style={{padding: 20, color: 'var(--gray-400)'}}>Aucun élève inscrit</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminOverviewTab;
