import React from 'react';
import {
  GraduationCap, Users, School, UserCheck, CheckCircle, Clock,
  BarChart3, Medal, Send, Inbox, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const OfficeOverviewTab = ({
  stats,
  etablissements = [],
  professeursList = [],
  palmares = [],
  navigate,
  setShowPublierModal,
  getMentionColor,
  demandesList = []
}) => {
  const pendingDemandes = demandesList.filter(d => d.statut === 'EN_ATTENTE');

  return (
    <div className="ob-tab-pane">
      {/* ALERTE NOUVELLES PRÉ-INSCRIPTIONS EN ATTENTE */}
      {pendingDemandes.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          border: '1.5px solid #93c5fd',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dbeafe', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Inbox size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e3a8a' }}>
                {pendingDemandes.length} Demande(s) de pré-inscription en attente de traitement
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: 13, color: '#475569' }}>
                Des dossiers officiels d'établissements et/ou de professeurs ont été déposés avec pièces justificatives.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ob-btn ob-btn-primary"
            onClick={() => navigate('/office/dashboard/demandes')}
            style={{ padding: '10px 18px', fontWeight: 700, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            Examiner &amp; Valider les demandes <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="ob-hero">
        <div className="ob-hero-left">
          <div className="ob-hero-icon"><GraduationCap size={32} /></div>
          <div>
            <h1>Tableau de Bord — Office du Baccalauréat</h1>
            <p>République du Sénégal · Direction des Examens et Concours · Session {new Date().getFullYear()}</p>
          </div>
        </div>
        <div className="ob-sn-badge">SN</div>
      </div>

      {/* Stat cards */}
      <div className="ob-stats-grid">
        <div className="ob-stat-card ob-stat-total">
          <div className="ob-stat-icon"><Users size={22} /></div>
          <div>
            <div className="ob-stat-num">{stats?.total ?? '—'}</div>
            <div className="ob-stat-label">Candidats inscrits</div>
          </div>
        </div>
        <div className="ob-stat-card ob-stat-publie">
          <div className="ob-stat-icon"><School size={22} /></div>
          <div>
            <div className="ob-stat-num">{stats?.total_etablissements ?? etablissements.length ?? '—'}</div>
            <div className="ob-stat-label">Établissements Sénégal</div>
          </div>
        </div>
        <div className="ob-stat-card ob-stat-taux">
          <div className="ob-stat-icon"><UserCheck size={22} /></div>
          <div>
            <div className="ob-stat-num">{stats?.total_professeurs ?? professeursList.length ?? '—'}</div>
            <div className="ob-stat-label">Professeurs / Correcteurs</div>
          </div>
        </div>
        <div className="ob-stat-card ob-stat-admis">
          <div className="ob-stat-icon"><CheckCircle size={22} /></div>
          <div>
            <div className="ob-stat-num">{stats?.admis ?? '—'}</div>
            <div className="ob-stat-label">Admis 1er Tour</div>
          </div>
        </div>
        <div className="ob-stat-card ob-stat-ajournes">
          <div className="ob-stat-icon"><Clock size={22} /></div>
          <div>
            <div className="ob-stat-num">{stats?.rattrapage ?? '—'}</div>
            <div className="ob-stat-label">Admissibles 2nd Tour</div>
          </div>
        </div>
      </div>

      {/* Section Diagrammes Graphiques */}
      {stats && (
        <div className="ob-mid-row mt-6">
          <div className="ob-card">
            <h3 className="ob-card-title"><BarChart3 size={18} /> Répartition des Inscrits & Admis par Série</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.par_serie || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="serie" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                    formatter={(value, name) => [value, name === 'admis' ? 'Admis' : 'Total Candidats']}
                  />
                  <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="total" />
                  <Bar dataKey="admis" fill="#131e6c" radius={[4, 4, 0, 0]} name="admis" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ob-card">
            <h3 className="ob-card-title"><BarChart3 size={18} /> Distribution Globale des Résultats</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Admis 1er Tour', value: stats.admis || 0 },
                      { name: 'Admissibles 2nd Tour', value: stats.rattrapage || 0 },
                      { name: 'Ajournés / Exclus', value: Math.max(0, (stats.publies || 0) - (stats.admis || 0) - (stats.rattrapage || 0)) }
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value"
                  >
                    {['#16a34a', '#d97706', '#dc2626'].map((col, i) => (
                      <Cell key={i} fill={col} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="ob-mid-row mt-6">
        <div className="ob-card">
          <h3 className="ob-card-title"><Medal size={18} style={{ color: '#eab308' }} /> Palmarès de la Session</h3>
          {palmares.length > 0 ? (
            <div className="ob-table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="ob-table ob-table-sm">
                <thead>
                  <tr>
                    <th>Rang</th>
                    <th>Candidat</th>
                    <th>Série</th>
                    <th>Moyenne</th>
                    <th>Mention</th>
                  </tr>
                </thead>
                <tbody>
                  {palmares.map((p, idx) => (
                    <tr key={p.id}>
                      <td><strong>#{idx + 1}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{p.prenom} {p.nom}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{p.etablissement_nom || 'Candidat Libre'}</div>
                      </td>
                      <td><span className="ob-badge-type">{p.serie}</span></td>
                      <td><strong style={{ fontSize: 14, color: '#15803d' }}>{parseFloat(p.moyenne).toFixed(2)}/20</strong></td>
                      <td><span style={{ fontSize: 11, fontWeight: 700, color: getMentionColor(p.mention) }}>{p.mention}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="ob-empty" style={{ padding: 30 }}><p>Aucun lauréat publié pour le moment.</p></div>
          )}
        </div>

        <div className="ob-card">
          <h3 className="ob-card-title"><BarChart3 size={18} /> Résultats par Série</h3>
          {stats?.par_serie?.length > 0 ? (
            <div className="ob-series-grid" style={{ gridTemplateColumns: '1fr' }}>
              {stats.par_serie.map(s => {
                const taux = s.total > 0 ? Math.round((s.admis / s.total) * 100) : 0;
                return (
                  <div key={s.serie} className="ob-serie-item" style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                    <div className="ob-serie-header">
                      <span className="ob-serie-name">Série {s.serie || 'N/A'}</span>
                      <span className="ob-serie-taux" style={{ color: taux >= 50 ? '#15803d' : '#b91c1c' }}>{taux}%</span>
                    </div>
                    <div className="ob-serie-bar-track">
                      <div className="ob-serie-bar-fill" style={{ width: `${taux}%`, background: taux >= 50 ? 'linear-gradient(90deg,#16a34a,#22c55e)' : 'linear-gradient(90deg,#b91c1c,#ef4444)' }} />
                    </div>
                    <div className="ob-serie-sub">{s.admis} admis / {s.total} candidats</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ob-empty" style={{ padding: 30 }}><p>Données par série non disponibles.</p></div>
          )}
        </div>
      </div>

      <div className="ob-shortcuts mt-6">
        <button className="ob-shortcut-btn" onClick={() => navigate('/office/dashboard/etablissements')}>
          <School size={20} /> Établissements
        </button>
        <button className="ob-shortcut-btn" onClick={() => navigate('/office/dashboard/professeurs')}>
          <UserCheck size={20} /> Professeurs / Correcteurs
        </button>
        <button className="ob-shortcut-btn" onClick={() => navigate('/office/dashboard/candidats')}>
          <Users size={20} /> Candidats & Jurys
        </button>
        <button className="ob-shortcut-btn ob-shortcut-publish" onClick={() => setShowPublierModal(true)}>
          <Send size={20} /> Publier les résultats
        </button>
      </div>
    </div>
  );
};

export default OfficeOverviewTab;
