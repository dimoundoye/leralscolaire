import React from 'react';
import { Users, Search, ArrowRight } from 'lucide-react';

const TeacherAttachedClassesTab = ({
  dashboardDetails,
  profAnneeFilter,
  searchTermClasses,
  setSearchTermClasses,
  setSelectedClasse,
  setSelectedMatiere,
  navigate
}) => {
  const yearDashClasses = (dashboardDetails?.classes || []).filter(cls => !cls.annee_scolaire || cls.annee_scolaire === profAnneeFilter);
  const filtered = yearDashClasses.filter(cls => {
    const search = searchTermClasses.toLowerCase();
    return (
      cls.etablissement_nom?.toLowerCase().includes(search) ||
      cls.classe_nom?.toLowerCase().includes(search) ||
      cls.niveau?.toLowerCase().includes(search) ||
      cls.matiere_nom?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="tab-pane">
      <div className="card-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800, color: 'var(--primary-blue)' }}>
              <Users size={22} style={{ color: 'var(--accent-red)' }} /> Classes Rattachées & Suivi des Notes
            </h3>
            <p className="subtitle" style={{ fontSize: '12.5px', color: 'var(--text-slate-500)', margin: '4px 0 0' }}>
              Liste complète de vos classes actives, vos matières et le suivi de saisie de vos notes par semestre.
            </p>
          </div>
        </div>

        <div className="search-bar-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <div className="search-input-wrapper" style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-slate-400)' }} />
            <input 
              type="text" 
              placeholder="Rechercher par établissement, classe, niveau ou matière..." 
              value={searchTermClasses}
              onChange={(e) => setSearchTermClasses(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>
          {searchTermClasses && (
            <button 
              className="btn btn-outline" 
              onClick={() => setSearchTermClasses('')}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Effacer
            </button>
          )}
        </div>

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
              {filtered.length > 0 ? (
                filtered.map(cls => (
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
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-slate-400)' }}>
                    Aucune classe trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttachedClassesTab;
