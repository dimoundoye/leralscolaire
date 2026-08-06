import React, { useEffect, useState } from 'react';
import { Scale, Plus, Calendar, AlertTriangle, Award, FileText, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import CreateDisciplineModal from '../etablissement/CreateDisciplineModal';
import DossierScolaireModal from '../etablissement/DossierScolaireModal';

const TeacherDisciplineView = () => {
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEleveForDossier, setSelectedEleveForDossier] = useState(null);
  const [elevesList, setElevesList] = useState([]);

  useEffect(() => {
    loadData();
    loadEleves();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDisciplineProfesseur();
      if (res.success) {
        setSignalements(res.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement signalements prof:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEleves = async () => {
    try {
      const res = await api.getStudents();
      if (res.success) {
        setElevesList(res.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement liste élèves:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(19, 30, 108, 0.04)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#131e6c', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Scale size={26} color="#131e6c" /> Suivi de la Vie Scolaire & Remarques
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Signalez un incident, demandez une convocation ou attribuez une remarque encourageante à un élève.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: '#131e6c', color: '#ffffff', border: 'none', borderRadius: '10px',
            padding: '11px 20px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(19, 30, 108, 0.22)'
          }}
        >
          <Plus size={18} /> Nouveau Signalement / Remarque
        </button>
      </div>

      {/* List Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(19, 30, 108, 0.04)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#131e6c', fontSize: '1rem' }}>
          Mes Signalements & Remarques Transmis ({signalements.length})
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>Chargement...</div>
        ) : signalements.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>
            Vous n'avez transmis aucun signalement ou remarque pour le moment.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#131e6c', fontWeight: 700 }}>
                  <th style={{ padding: '14px 20px' }}>Date</th>
                  <th style={{ padding: '14px 20px' }}>Élève</th>
                  <th style={{ padding: '14px 20px' }}>Type & Gravité</th>
                  <th style={{ padding: '14px 20px' }}>Motif & Description</th>
                  <th style={{ padding: '14px 20px' }}>Statut</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {signalements.map((item) => {
                  let badgeBg = '#f1f5f9';
                  let badgeColor = '#475569';
                  if (item.gravite === 'ENCOURAGEMENT') { badgeBg = '#dcfce7'; badgeColor = '#166534'; }
                  else if (item.gravite === 'AVERTISSEMENT') { badgeBg = '#ffedd5'; badgeColor = '#9a3412'; }
                  else if (item.gravite === 'GRAVE') { badgeBg = '#fee2e2'; badgeColor = '#991b1b'; }
                  else if (item.type_action === 'CONVOCATION') { badgeBg = '#eff6ff'; badgeColor = '#131e6c'; }

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', color: '#64748b', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#131e6c' }}>{item.eleve_prenom} {item.eleve_nom}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 600 }}>{item.classe_nom}</div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '5px 12px', borderRadius: '20px', backgroundColor: badgeBg, color: badgeColor,
                          fontWeight: 700, fontSize: '0.75rem'
                        }}>
                          {item.type_action} ({item.gravite})
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.motif}</div>
                        {item.description && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>"{item.description}"</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                          backgroundColor: item.statut === 'HONORE' || item.statut === 'RESOLU' ? '#dcfce7' : '#f1f5f9',
                          color: item.statut === 'HONORE' || item.statut === 'RESOLU' ? '#15803d' : '#475569'
                        }}>
                          {item.statut}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedEleveForDossier(item.eleve_id)}
                          style={{
                            backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '7px 12px',
                            fontSize: '0.775rem', fontWeight: 700, color: '#131e6c', cursor: 'pointer'
                          }}
                        >
                          Dossier Élève
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateDisciplineModal
          elevesList={elevesList}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => loadData()}
        />
      )}

      {selectedEleveForDossier && (
        <DossierScolaireModal
          eleveId={selectedEleveForDossier}
          onClose={() => setSelectedEleveForDossier(null)}
        />
      )}
    </div>
  );
};

export default TeacherDisciplineView;
