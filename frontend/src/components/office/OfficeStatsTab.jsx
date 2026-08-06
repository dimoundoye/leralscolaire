import React from 'react';
import {
  RefreshCw, MapPin, Users, School, UserCheck, Award, GraduationCap, FileText,
  CheckCircle, Clock, Eye, BarChart3, Activity
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const OfficeStatsTab = ({
  stats,
  carteData,
  activeMetric,
  setActiveMetric,
  selectedRegion,
  setSelectedRegion,
  fetchStats,
  fetchCarteRegionale
}) => {
  return (
    <div className="ob-tab-pane">
      <div className="ob-page-header">
        <div>
          <h2>Statistiques &amp; Pilotage National</h2>
          <p>Analyse des performances par région, série, comparaison inter-années et cartographie du Sénégal</p>
        </div>
        <button className="ob-btn ob-btn-ghost" onClick={() => { fetchStats(); fetchCarteRegionale(); }}><RefreshCw size={15} /> Actualiser</button>
      </div>

      {/* CARTOGRAPHIE NATIONALE INTERACTIVE DU SÉNÉGAL (14 RÉGIONS) */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', marginBottom: 28, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <MapPin size={22} style={{ color: '#2563eb' }} /> Cartographie Nationale &amp; Statistiques des 14 Régions du Sénégal
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Cliquez sur une région ou filtrez par métrique pour consulter la vue globale sur le plan national (Établissements, Profs, Jurys, Candidats BAC &amp; BFEM, Moyennes).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
              🇸🇳 14 Régions Administratives
            </span>
          </div>
        </div>

        {/* Barre des Métriques */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.6px', marginBottom: 10 }}>
            Sélectionner l'indicateur national à observer :
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'total_eleves', label: 'Élèves inscrits' },
              { id: 'eleves_femmes', label: 'Effectif Filles (F)' },
              { id: 'taux_feminisation', label: 'Taux Filles (%)' },
              { id: 'total_etablissements', label: 'Établissements' },
              { id: 'total_professeurs', label: 'Enseignants / Profs' },
              { id: 'total_jurys', label: 'Jurys d\'examen' },
              { id: 'total_bac', label: 'Candidats BAC' },
              { id: 'total_bfem', label: 'Candidats BFEM' },
              { id: 'moyenne_bac', label: 'Moyenne BAC /20' },
              { id: 'taux_bac', label: 'Taux Réussite BAC' }
            ].map(m => {
              const isSelected = activeMetric === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setActiveMetric(m.id)}
                  style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                    background: isSelected ? '#1e1b4b' : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#334155',
                    border: isSelected ? 'none' : '1px solid #cbd5e1',
                    boxShadow: isSelected ? '0 4px 10px rgba(30,27,75,0.25)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille Principale : CARTE GRAND FORMAT DU SÉNÉGAL + Fiche Statistique */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24, alignItems: 'start' }}>
          
          {/* CARTE DE LA RÉPUBLIQUE DU SÉNÉGAL GRAND FORMAT */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 16, padding: '18px', textAlign: 'center', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} style={{ color: '#2563eb' }} /> Carte Nationale des 14 Régions du Sénégal
              </span>
              <span style={{ fontSize: 11, color: '#0284c7', background: '#e0f2fe', padding: '3px 10px', borderRadius: 12, fontWeight: 800 }}>
                Cliquez sur un marqueur
              </span>
            </div>

            <div style={{ width: '100%', position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <img 
                src="/senegal_map_official.png" 
                alt="Carte Officielle des 14 Régions du Sénégal" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />

              {[
                { id: 'Dakar', name: 'Dakar', left: '6%', top: '43.5%' },
                { id: 'Thiès', name: 'Thiès', left: '15%', top: '40.5%' },
                { id: 'Saint-Louis', name: 'Saint-Louis', left: '41%', top: '12.5%' },
                { id: 'Louga', name: 'Louga', left: '35%', top: '28%' },
                { id: 'Diourbel', name: 'Diourbel', left: '22.5%', top: '38%' },
                { id: 'Fatick', name: 'Fatick', left: '18.5%', top: '50.5%' },
                { id: 'Kaolack', name: 'Kaolack', left: '29.5%', top: '56.5%' },
                { id: 'Kaffrine', name: 'Kaffrine', left: '42%', top: '52%' },
                { id: 'Matam', name: 'Matam', left: '58.5%', top: '31%' },
                { id: 'Tambacounda', name: 'Tambacounda', left: '69%', top: '57%' },
                { id: 'Kédougou', name: 'Kédougou', left: '81%', top: '80%' },
                { id: 'Ziguinchor', name: 'Ziguinchor', left: '16%', top: '86%' },
                { id: 'Sédhiou', name: 'Sédhiou', left: '28%', top: '86%' },
                { id: 'Kolda', name: 'Kolda', left: '46%', top: '86%' }
              ].map(reg => {
                const isSelected = selectedRegion === reg.id;
                const regData = carteData?.[reg.id] || {};
                const val = regData[activeMetric] ?? '—';
                const formattedVal = typeof val === 'number' 
                  ? (activeMetric.includes('moyenne') ? val.toFixed(2) + '/20' : activeMetric.includes('taux') ? val + '%' : val)
                  : val;

                return (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedRegion(reg.id)}
                    style={{
                      position: 'absolute',
                      left: reg.left,
                      top: reg.top,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: isSelected ? 30 : 10,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div
                      style={{
                        padding: isSelected ? '3px 7px' : '1.5px 5px',
                        borderRadius: 12,
                        fontSize: isSelected ? 9.5 : 8.5,
                        fontWeight: 900,
                        background: isSelected 
                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                          : 'rgba(15, 23, 42, 0.94)',
                        color: '#ffffff',
                        border: isSelected ? '1.5px solid #ffffff' : '1px solid rgba(255,255,255,0.4)',
                        boxShadow: isSelected 
                          ? '0 3px 12px rgba(245, 158, 11, 0.6)' 
                          : '0 2px 5px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <MapPin size={10} style={{ color: isSelected ? '#ffffff' : '#38bdf8' }} />
                      <span>{reg.name}</span>
                      <span
                        style={{
                          background: isSelected ? 'rgba(255,255,255,0.35)' : '#2563eb',
                          color: '#ffffff',
                          padding: '0px 4px',
                          borderRadius: 6,
                          fontSize: 8.5,
                          fontWeight: 900
                        }}
                      >
                        {formattedVal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
              {[
                'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 'Fatick',
                'Kaolack', 'Kaffrine', 'Ziguinchor', 'Sédhiou', 'Kolda',
                'Tambacounda', 'Kédougou', 'Matam'
              ].map(reg => (
                <button
                  type="button"
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  style={{
                    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer',
                    background: selectedRegion === reg ? '#f59e0b' : '#ffffff',
                    color: selectedRegion === reg ? '#ffffff' : '#334155',
                    border: selectedRegion === reg ? 'none' : '1px solid #cbd5e1'
                  }}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Fiche Régionale Détaillée */}
          {(() => {
            const data = carteData?.[selectedRegion] || {
              region: selectedRegion, total_etablissements: 0, total_professeurs: 0, total_jurys: 0,
              total_eleves: 0, total_bac: 0, total_bfem: 0, admis_bac: 0, taux_bac: 0, moyenne_bac: 0,
              admis_bfem: 0, taux_bfem: 0, moyenne_bfem: 0
            };

            return (
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ background: '#2563eb', color: '#ffffff', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                      République du Sénégal
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 900, color: '#0f172a' }}>
                       Région de {selectedRegion}
                    </h3>
                  </div>
                  <span style={{ fontSize: 24 }}>🇸🇳</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <School size={14} style={{ color: '#2563eb' }} /> Établissements
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                      {data.total_etablissements} Lycées / Collèges
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserCheck size={14} style={{ color: '#059669' }} /> Enseignant(e)s
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                      {data.total_professeurs} Professeurs
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Award size={14} style={{ color: '#7c3aed' }} /> Jurys d'Examen
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                      {data.total_jurys} Jurys configurés
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={14} style={{ color: '#0284c7' }} /> Effectif Élèves
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                      {data.total_eleves} Élèves inscrits
                    </div>
                  </div>
                </div>

                {/* Session BAC */}
                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <GraduationCap size={16} /> Session Baccalauréat (BAC)
                    </span>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 12 }}>
                      Taux : {data.taux_bac}%
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 11 }}>Candidats</div>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{data.total_bac}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 11 }}>Admis</div>
                      <div style={{ fontWeight: 800, color: '#15803d' }}>{data.admis_bac}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 11 }}>Moyenne Régionale</div>
                      <div style={{ fontWeight: 800, color: '#2563eb' }}>{(data.moyenne_bac || 0).toFixed(2)}/20</div>
                    </div>
                  </div>
                </div>

                {/* Session BFEM */}
                <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={16} /> Session BFEM
                    </span>
                    <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 12 }}>
                      Taux : {data.taux_bfem}%
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 11 }}>Candidats</div>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{data.total_bfem}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 11 }}>Admis</div>
                      <div style={{ fontWeight: 800, color: '#15803d' }}>{data.admis_bfem}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 11 }}>Moyenne Régionale</div>
                      <div style={{ fontWeight: 800, color: '#2563eb' }}>{(data.moyenne_bfem || 0).toFixed(2)}/20</div>
                    </div>
                  </div>
                </div>

                {/* Répartition Civilité & Genre */}
                <div style={{ background: '#ffffff', border: '1px solid #fbcfe8', borderRadius: 12, padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#9d174d', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={16} /> Parité &amp; Civilité / Genre Élèves
                    </span>
                    <span style={{ background: '#fce7f3', color: '#9d174d', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 12 }}>
                      {data.taux_feminisation || 0}% Filles
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                    <div style={{ background: '#fce7f3', padding: '8px 10px', borderRadius: 8, border: '1px solid #fbcfe8' }}>
                      <div style={{ color: '#9d174d', fontSize: 11, fontWeight: 700 }}>👩‍🎓 Filles / Femmes (F)</div>
                      <div style={{ fontWeight: 900, fontSize: 15, color: '#831843' }}>{data.eleves_femmes || 0} élève(s)</div>
                    </div>
                    <div style={{ background: '#e0f2fe', padding: '8px 10px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                      <div style={{ color: '#0369a1', fontSize: 11, fontWeight: 700 }}>👨‍🎓 Garçons / Hommes (M)</div>
                      <div style={{ fontWeight: 900, fontSize: 15, color: '#075985' }}>{data.eleves_hommes || 0} élève(s)</div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}

        </div>

      </div>

      <div className="ob-stats-grid ob-stats-grid-full">
        <div className="ob-stat-card ob-stat-total"><div className="ob-stat-icon"><Users size={22} /></div><div><div className="ob-stat-num">{stats?.total_eleves ?? stats?.total ?? '—'}</div><div className="ob-stat-label">Total Élèves inscrits</div></div></div>
        <div className="ob-stat-card" style={{ background: '#fdf2f8', borderColor: '#fbcfe8' }}><div className="ob-stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}><Users size={22} /></div><div><div className="ob-stat-num" style={{ color: '#9d174d' }}>{stats?.eleves_femmes ?? '—'}</div><div className="ob-stat-label" style={{ color: '#831843' }}>Filles / Femmes ({stats?.taux_feminisation || 0}%)</div></div></div>
        <div className="ob-stat-card" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}><div className="ob-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><UserCheck size={22} /></div><div><div className="ob-stat-num" style={{ color: '#0369a1' }}>{stats?.eleves_hommes ?? '—'}</div><div className="ob-stat-label" style={{ color: '#075985' }}>Garçons / Hommes</div></div></div>
        <div className="ob-stat-card ob-stat-publie"><div className="ob-stat-icon"><Eye size={22} /></div><div><div className="ob-stat-num">{stats?.publies ?? '—'}</div><div className="ob-stat-label">Résultats publiés</div></div></div>
        <div className="ob-stat-card ob-stat-admis"><div className="ob-stat-icon"><CheckCircle size={22} /></div><div><div className="ob-stat-num">{stats?.admis ?? '—'}</div><div className="ob-stat-label">Admis 1er Tour</div></div></div>
        <div className="ob-stat-card ob-stat-ajournes"><div className="ob-stat-icon"><Clock size={22} /></div><div><div className="ob-stat-num">{stats?.rattrapage ?? '—'}</div><div className="ob-stat-label">Admissibles 2nd Tour</div></div></div>
        {stats?.admis && stats?.publies && (
          <div className="ob-stat-card ob-stat-taux"><div className="ob-stat-icon"><BarChart3 size={22} /></div><div><div className="ob-stat-num">{Math.round((stats.admis / stats.publies) * 100)}%</div><div className="ob-stat-label">Taux global réussite</div></div></div>
        )}
      </div>

      {/* Graphique Inter-années & Régional */}
      {stats && (
        <div className="ob-mid-row mt-6">
          <div className="ob-card">
            <h3 className="ob-card-title"><Activity size={18} /> Évolution du Taux de Réussite Inter-années</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...(stats.par_annee || [])].reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMoy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#131e6c" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#131e6c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="annee" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }} />
                  <Area type="monotone" dataKey="admis" stroke="#131e6c" strokeWidth={3} fillOpacity={1} fill="url(#colorMoy)" name="Admis" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ob-card">
            <h3 className="ob-card-title"><MapPin size={18} /> Répartition des Admis par Région</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={stats.par_region || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis dataKey="region" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
                  <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }} />
                  <Bar dataKey="admis" fill="#15803d" radius={[0, 4, 4, 0]} name="Admis" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {stats?.par_region?.length > 0 && (
        <div className="ob-card mt-6">
          <h3 className="ob-card-title"><MapPin size={18} /> Performance par Région du Sénégal</h3>
          <div className="ob-table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="ob-table ob-table-sm">
              <thead>
                <tr>
                  <th>Région</th>
                  <th>Candidats</th>
                  <th>Admis</th>
                  <th>Taux Réussite</th>
                  <th>Moyenne Régionale</th>
                </tr>
              </thead>
              <tbody>
                {stats.par_region.map(r => {
                  const taux = r.total > 0 ? Math.round((r.admis / r.total) * 100) : 0;
                  return (
                    <tr key={r.region}>
                      <td><strong>{r.region}</strong></td>
                      <td>{r.total}</td>
                      <td style={{ color: '#15803d', fontWeight: 700 }}>{r.admis}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="ob-serie-bar-track" style={{ width: 100 }}>
                            <div className="ob-serie-bar-fill" style={{ width: `${taux}%`, background: taux >= 50 ? 'linear-gradient(90deg,#16a34a,#22c55e)' : 'linear-gradient(90deg,#b91c1c,#ef4444)' }} />
                          </div>
                          <span style={{ fontWeight: 700, color: taux >= 50 ? '#15803d' : '#b91c1c' }}>{taux}%</span>
                        </div>
                      </td>
                      <td><strong>{r.moyenne_region ? parseFloat(r.moyenne_region).toFixed(2) + '/20' : '—'}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeStatsTab;
