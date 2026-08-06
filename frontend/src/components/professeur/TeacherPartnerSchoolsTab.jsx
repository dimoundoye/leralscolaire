import React from 'react';
import { Building, Search } from 'lucide-react';

const TeacherPartnerSchoolsTab = ({
  dashboardDetails,
  searchTermSchools,
  setSearchTermSchools
}) => {
  const filtered = (dashboardDetails?.affiliations || []).filter(aff => {
    const search = searchTermSchools.toLowerCase();
    return (
      aff.etablissement_nom?.toLowerCase().includes(search) ||
      aff.ville?.toLowerCase().includes(search) ||
      aff.region?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="tab-pane">
      <div className="card-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800, color: 'var(--primary-blue)' }}>
              <Building size={22} style={{ color: 'var(--accent-red)' }} /> Établissements Partenaires
            </h3>
            <p className="subtitle" style={{ fontSize: '12.5px', color: 'var(--text-slate-500)', margin: '4px 0 0' }}>
              Liste complète et recherche de vos établissements partenaires affiliés.
            </p>
          </div>
        </div>

        <div className="search-bar-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <div className="search-input-wrapper" style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-slate-400)' }} />
            <input 
              type="text" 
              placeholder="Rechercher un établissement par nom, ville ou région..." 
              value={searchTermSchools}
              onChange={(e) => setSearchTermSchools(e.target.value)}
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
          {searchTermSchools && (
            <button 
              className="btn btn-outline" 
              onClick={() => setSearchTermSchools('')}
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
                <th style={{ padding: '12px' }}>Localisation</th>
                <th style={{ padding: '12px' }}>Statut de l'affectation</th>
                <th style={{ padding: '12px' }}>Date d'affiliation</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(aff => (
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
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-slate-400)' }}>
                    Aucun établissement trouvé.
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

export default TeacherPartnerSchoolsTab;
