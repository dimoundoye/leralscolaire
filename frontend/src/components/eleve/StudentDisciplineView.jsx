import React, { useEffect, useState } from 'react';
import { Scale, Award, Calendar, AlertTriangle, MessageSquare, Download, FileText, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

const StudentDisciplineView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentDiscipline();
  }, []);

  const loadStudentDiscipline = async () => {
    try {
      setLoading(true);
      const res = await api.getDisciplineEleve('me');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Erreur chargement Vie Scolaire élève:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    api.downloadDossierPdf('me');
  };

  const eleve = data?.eleve || {};
  const signalements = data?.signalements || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div style={{
        backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        boxShadow: '0 4px 20px -2px rgba(19, 30, 108, 0.04)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#131e6c', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Scale size={26} color="#131e6c" /> Vie Scolaire & Remarques Pédagogiques
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Consultez votre dossier disciplinaire, vos appréciations d'enseignants et vos convocations.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          style={{
            backgroundColor: '#131e6c', color: '#ffffff', border: 'none', borderRadius: '10px',
            padding: '11px 20px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(19, 30, 108, 0.22)'
          }}
        >
          <Download size={18} /> Télécharger mon Dossier Scolaire PDF
        </button>
      </div>

      {/* Profile Overview */}
      <div style={{
        backgroundColor: '#f8fafc', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Élève</span>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#131e6c' }}>{eleve.prenom} {eleve.nom}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>INE</span>
          <div style={{ fontWeight: 700, color: '#f93f2d' }}>{eleve.identifiant_national || 'N/A'}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Classe</span>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{eleve.classe_nom || 'Non spécifiée'}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Établissement</span>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{eleve.etablissement_nom || 'LeralScolaire'}</div>
        </div>
      </div>

      {/* Main List */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px -2px rgba(19, 30, 108, 0.04)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#131e6c', margin: '0 0 18px 0' }}>
          Historique de vos remarques & convocations ({signalements.length})
        </h3>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>Chargement...</div>
        ) : signalements.length === 0 ? (
          <div style={{
            padding: '30px', textAlign: 'center', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '12px', color: '#15803d', fontWeight: 600
          }}>
            🌟 Bravo ! Votre dossier disciplinaire est exemplaire et totalement vierge de toute sanction.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {signalements.map((item) => {
              let badgeBg = '#f1f5f9';
              let badgeColor = '#475569';
              let icon = <MessageSquare size={16} />;

              if (item.gravite === 'ENCOURAGEMENT') {
                badgeBg = '#dcfce7'; badgeColor = '#166534'; icon = <Award size={16} />;
              } else if (item.gravite === 'AVERTISSEMENT') {
                badgeBg = '#ffedd5'; badgeColor = '#9a3412'; icon = <AlertTriangle size={16} />;
              } else if (item.gravite === 'GRAVE') {
                badgeBg = '#fee2e2'; badgeColor = '#991b1b'; icon = <AlertTriangle size={16} />;
              } else if (item.type_action === 'CONVOCATION') {
                badgeBg = '#eff6ff'; badgeColor = '#131e6c'; icon = <Calendar size={16} />;
              }

              return (
                <div key={item.id} style={{
                  padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff', borderLeft: `5px solid ${badgeColor}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', backgroundColor: badgeBg, color: badgeColor,
                        fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                        {icon} {item.type_action}
                      </span>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{item.motif}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                      {new Date(item.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '6px' }}>
                    <strong>Origine :</strong> {item.auteur_nom_complet}
                  </div>

                  {item.description && (
                    <div style={{
                      fontSize: '0.875rem', fontStyle: 'italic', color: '#334155',
                      backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginTop: '6px',
                      border: '1px solid #e2e8f0'
                    }}>
                      "{item.description}"
                    </div>
                  )}

                  {item.type_action === 'CONVOCATION' && (
                    <div style={{
                      marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0',
                      display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.825rem', color: '#131e6c', fontWeight: 600
                    }}>
                      {item.date_rendez_vous && <span><strong>Rendez-vous le :</strong> {new Date(item.date_rendez_vous).toLocaleString('fr-FR')}</span>}
                      {item.lieu_rendez_vous && <span><strong>Lieu :</strong> {item.lieu_rendez_vous}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDisciplineView;
