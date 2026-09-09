import React, { useEffect, useState } from 'react';
import { X, FileText, User, Calendar, ShieldCheck, Scale, Award, AlertTriangle, MessageSquare, Download } from 'lucide-react';
import { api } from '../../services/api';

const DossierScolaireModal = ({ eleveId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState(null);

  useEffect(() => {
    if (eleveId) {
      loadDossier();
    }
  }, [eleveId]);

  const loadDossier = async () => {
    try {
      setLoading(true);
      const res = await api.getDisciplineEleve(eleveId);
      if (res.success) {
        setDossier(res.data);
      }
    } catch (err) {
      console.error('Erreur chargement dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    api.downloadDossierPdf(eleveId);
  };

  if (!eleveId) return null;

  const eleve = dossier?.eleve || {};
  const signalements = dossier?.signalements || [];

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
      }}
    >
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '850px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 48px -8px rgba(19, 30, 108, 0.18)', border: '1px solid #e2e8f0'
      }}>
        {/* Header - Native LeralScolaire Style */}
        <div style={{
          padding: '20px 28px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', color: '#131e6c' }}>
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#131e6c' }}>Dossier Scolaire Individuel</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Fiche synthétique 360° et registre disciplinaire</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleDownloadPdf}
              style={{
                backgroundColor: '#131e6c', color: '#ffffff', border: 'none',
                borderRadius: '10px', padding: '9px 18px', fontWeight: 700, fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(19, 30, 108, 0.25)'
              }}
            >
              <Download size={16} /> Export PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>Chargement du dossier scolaire...</div>
          ) : (
            <>
              {/* Section 1 : Fiche Élève */}
              <div style={{
                backgroundColor: '#f8fafc', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0',
                marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Nom & Prénom</span>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#131e6c' }}>{eleve.prenom} {eleve.nom}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>IUP / Identifiant Unique</span>
                  <div style={{ fontWeight: 700, color: '#131e6c' }}>{eleve.identifiant_national || eleve.ine || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Classe Actuelle</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{eleve.classe_nom || 'Non inscrit'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Téléphone Parent</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{eleve.telephone_parent || eleve.telephone || 'N/A'}</div>
                </div>
              </div>

              {/* Section 2 : Registre Vie Scolaire & Remarques */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#131e6c', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={20} color="#131e6c" /> Registre Vie Scolaire & Appréciations ({signalements.length})
              </h3>

              {signalements.length === 0 ? (
                <div style={{
                  padding: '32px', textAlign: 'center', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: '12px', color: '#15803d', fontWeight: 600
                }}>
                  ✨ Le dossier disciplinaire de cet élève est entièrement vierge. Aucune sanction ni convocation enregistrée.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {signalements.map((item) => {
                    let badgeColor = '#475569';
                    let badgeBg = '#f1f5f9';
                    let icon = <MessageSquare size={16} />;

                    if (item.gravite === 'ENCOURAGEMENT') {
                      badgeColor = '#166534'; badgeBg = '#dcfce7'; icon = <Award size={16} />;
                    } else if (item.gravite === 'AVERTISSEMENT') {
                      badgeColor = '#9a3412'; badgeBg = '#ffedd5'; icon = <AlertTriangle size={16} />;
                    } else if (item.gravite === 'GRAVE') {
                      badgeColor = '#991b1b'; badgeBg = '#fee2e2'; icon = <AlertTriangle size={16} />;
                    } else if (item.type_action === 'CONVOCATION') {
                      badgeColor = '#131e6c'; badgeBg = '#eff6ff'; icon = <Calendar size={16} />;
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
                          <strong>Émetteur :</strong> {item.auteur_nom_complet}
                        </div>

                        {item.description && (
                          <div style={{
                            fontSize: '0.875rem', fontStyle: 'italic', color: '#334155',
                            backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginTop: '8px',
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
                            {item.date_rendez_vous && <span><strong>RDV le :</strong> {new Date(item.date_rendez_vous).toLocaleString('fr-FR')}</span>}
                            {item.lieu_rendez_vous && <span><strong>Lieu :</strong> {item.lieu_rendez_vous}</span>}
                            <span><strong>Statut :</strong> {item.statut}</span>
                          </div>
                        )}

                        {item.compte_rendu_rdv && (
                          <div style={{ marginTop: '8px', fontSize: '0.825rem', color: '#15803d', backgroundColor: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <strong>Compte-rendu d'entretien :</strong> {item.compte_rendu_rdv}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DossierScolaireModal;
