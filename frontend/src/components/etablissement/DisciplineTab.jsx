import React, { useEffect, useState } from 'react';
import { Scale, Calendar, AlertTriangle, MessageSquare, Plus, Search, Award, FileText, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import DossierScolaireModal from './DossierScolaireModal';
import CreateDisciplineModal from './CreateDisciplineModal';

const DisciplineTab = ({ elevesList = [] }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(''); // '', 'CONVOCATION', 'SIGNALEMENT', 'REMARQUE'
  const [filterStatut, setFilterStatut] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEleveForDossier, setSelectedEleveForDossier] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompteRenduItem, setEditingCompteRenduItem] = useState(null);
  const [compteRenduText, setCompteRenduText] = useState('');

  useEffect(() => {
    loadDisciplineData();
  }, [filterType, filterStatut]);

  const loadDisciplineData = async () => {
    try {
      setLoading(true);
      const res = await api.getDisciplineEtablissement(filterType, filterStatut);
      if (res.success) {
        setItems(res.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement Vie Scolaire:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatut = async (id, newStatut, compteRendu = '') => {
    try {
      const res = await api.updateDisciplineStatut(id, newStatut, compteRendu);
      if (res.success) {
        loadDisciplineData();
        setEditingCompteRenduItem(null);
        setCompteRenduText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    const eleveName = `${item.eleve_prenom} ${item.eleve_nom}`.toLowerCase();
    const motif = (item.motif || '').toLowerCase();
    const classe = (item.classe_nom || '').toLowerCase();
    return eleveName.includes(search) || motif.includes(search) || classe.includes(search);
  });

  const countConvocations = items.filter(i => i.type_action === 'CONVOCATION').length;
  const countSignalements = items.filter(i => i.type_action === 'SIGNALEMENT').length;
  const countRemarques = items.filter(i => i.type_action === 'REMARQUE').length;

  return (
    <div className="discipline-tab-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header - Native LeralScolaire Style */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(19, 30, 108, 0.04)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#131e6c', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Scale size={28} color="#131e6c" /> Vie Scolaire, Discipline & Convocations
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Registre général des convocations, signalements d'incidents et remarques pédagogiques.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: '#131e6c', color: '#ffffff', border: 'none', borderRadius: '10px',
            padding: '12px 22px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(19, 30, 108, 0.22)'
          }}
        >
          <Plus size={18} /> Émettre Signalement / Convocation
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(19, 30, 108, 0.03)' }}>
          <div style={{ backgroundColor: '#eff6ff', color: '#131e6c', padding: '14px', borderRadius: '12px' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#131e6c' }}>{countConvocations}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Convocations Parents</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(19, 30, 108, 0.03)' }}>
          <div style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '14px', borderRadius: '12px' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#131e6c' }}>{countSignalements}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Incidents Signalés</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(19, 30, 108, 0.03)' }}>
          <div style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '14px', borderRadius: '12px' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#131e6c' }}>{countRemarques}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Remarques & Encouragements</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        boxShadow: '0 2px 8px rgba(19, 30, 108, 0.02)'
      }}>
        {/* Sub-tabs Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterType('')}
            style={{
              padding: '9px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
              backgroundColor: filterType === '' ? '#131e6c' : '#f1f5f9', color: filterType === '' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            Tous ({items.length})
          </button>
          <button
            onClick={() => setFilterType('CONVOCATION')}
            style={{
              padding: '9px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
              backgroundColor: filterType === 'CONVOCATION' ? '#131e6c' : '#f1f5f9', color: filterType === 'CONVOCATION' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
             Convocations
          </button>
          <button
            onClick={() => setFilterType('SIGNALEMENT')}
            style={{
              padding: '9px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
              backgroundColor: filterType === 'SIGNALEMENT' ? '#ea580c' : '#f1f5f9', color: filterType === 'SIGNALEMENT' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
             Signalements
          </button>
          <button
            onClick={() => setFilterType('REMARQUE')}
            style={{
              padding: '9px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
              backgroundColor: filterType === 'REMARQUE' ? '#16a34a' : '#f1f5f9', color: filterType === 'REMARQUE' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
             Remarques
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher élève, motif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '9px 14px 9px 36px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
              fontSize: '0.875rem', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Main List Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(19, 30, 108, 0.04)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>Chargement du registre...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>
            Aucun enregistrement ne correspond aux critères.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#131e6c', fontWeight: 700 }}>
                  <th style={{ padding: '16px 20px' }}>Date</th>
                  <th style={{ padding: '16px 20px' }}>Élève / Classe</th>
                  <th style={{ padding: '16px 20px' }}>Type & Gravité</th>
                  <th style={{ padding: '16px 20px' }}>Motif & Description</th>
                  <th style={{ padding: '16px 20px' }}>Émetteur</th>
                  <th style={{ padding: '16px 20px' }}>Statut / RDV</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  let badgeBg = '#f1f5f9';
                  let badgeColor = '#475569';
                  if (item.gravite === 'ENCOURAGEMENT') { badgeBg = '#dcfce7'; badgeColor = '#166534'; }
                  else if (item.gravite === 'AVERTISSEMENT') { badgeBg = '#ffedd5'; badgeColor = '#9a3412'; }
                  else if (item.gravite === 'GRAVE') { badgeBg = '#fee2e2'; badgeColor = '#991b1b'; }
                  else if (item.type_action === 'CONVOCATION') { badgeBg = '#eff6ff'; badgeColor = '#131e6c'; }

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px', color: '#64748b', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#131e6c' }}>{item.eleve_prenom} {item.eleve_nom}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 600 }}>{item.classe_nom || 'Classe non renseignée'}</div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '5px 12px', borderRadius: '20px', backgroundColor: badgeBg, color: badgeColor,
                          fontWeight: 700, fontSize: '0.75rem', display: 'inline-block'
                        }}>
                          {item.type_action} ({item.gravite})
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', maxWidth: '300px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.motif}</div>
                        {item.description && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2px' }}>
                            "{item.description}"
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#475569', fontWeight: 500 }}>
                        {item.auteur_nom_complet}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                          backgroundColor: item.statut === 'HONORE' || item.statut === 'RESOLU' ? '#dcfce7' : '#f1f5f9',
                          color: item.statut === 'HONORE' || item.statut === 'RESOLU' ? '#15803d' : '#475569'
                        }}>
                          {item.statut}
                        </span>
                        {item.date_rendez_vous && (
                          <div style={{ fontSize: '0.75rem', color: '#131e6c', marginTop: '4px', fontWeight: 600 }}>
                            RDV: {new Date(item.date_rendez_vous).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedEleveForDossier(item.eleve_id)}
                            title="Voir le Dossier Scolaire Complet"
                            style={{
                              backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '7px 12px',
                              fontSize: '0.775rem', fontWeight: 700, color: '#131e6c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <FileText size={14} /> Dossier
                          </button>

                          {item.type_action === 'CONVOCATION' && item.statut !== 'HONORE' && (
                            <button
                              onClick={() => {
                                setEditingCompteRenduItem(item);
                                setCompteRenduText(item.compte_rendu_rdv || '');
                              }}
                              style={{
                                backgroundColor: '#131e6c', border: 'none', borderRadius: '8px', padding: '7px 12px',
                                fontSize: '0.775rem', fontWeight: 700, color: '#ffffff', cursor: 'pointer'
                              }}
                            >
                              Valider RDV
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Compte-Rendu RDV */}
      {editingCompteRenduItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
        }}>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 48px -8px rgba(19, 30, 108, 0.18)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 800, color: '#131e6c' }}>
              Bilan / Compte-rendu du rendez-vous
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Valider la présence des parents et consigner le bilan de l'entretien.
            </p>
            <textarea
              rows={4}
              placeholder="Saisissez les décisions prises lors du RDV..."
              value={compteRenduText}
              onChange={(e) => setCompteRenduText(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', marginBottom: '16px', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setEditingCompteRenduItem(null)} style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                Annuler
              </button>
              <button
                onClick={() => handleUpdateStatut(editingCompteRenduItem.id, 'HONORE', compteRenduText)}
                style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Marquer RDV Honoré & Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dossier Scolaire */}
      {selectedEleveForDossier && (
        <DossierScolaireModal
          eleveId={selectedEleveForDossier}
          onClose={() => setSelectedEleveForDossier(null)}
        />
      )}

      {/* Modal Création Signalement / Convocation */}
      {showCreateModal && (
        <CreateDisciplineModal
          elevesList={elevesList}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => loadDisciplineData()}
        />
      )}
    </div>
  );
};

export default DisciplineTab;
