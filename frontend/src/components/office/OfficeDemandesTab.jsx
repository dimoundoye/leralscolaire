import React from 'react';
import {
  Copy, RefreshCw, Inbox, Clock, CheckCircle, XCircle, School, UserCheck,
  FileText, Eye
} from 'lucide-react';

export const OfficeDemandesTab = ({
  demandesList = [],
  demandeFilterType,
  setDemandeFilterType,
  demandeFilterStatut,
  setDemandeFilterStatut,
  copyPublicLink,
  fetchDemandes,
  handleValiderDemande,
  handleRejeterDemande,
  selectedDemandeForDocs,
  setSelectedDemandeForDocs
}) => {
  const totalDemandes = demandesList.length;
  const totalValidees = demandesList.filter(d => d.statut === 'VALIDÉ').length;
  const totalEnAttente = demandesList.filter(d => d.statut === 'EN_ATTENTE').length;
  const totalRejetees = demandesList.filter(d => d.statut === 'REJETÉ').length;

  const countEtablissements = demandesList.filter(d => d.type_demande === 'ETABLISSEMENT').length;
  const countProfesseurs = demandesList.filter(d => d.type_demande === 'PROFESSEUR').length;

  const filteredDemandes = demandesList.filter(d => {
    const matchType = demandeFilterType === 'ALL' || d.type_demande === demandeFilterType;
    const matchStatut = demandeFilterStatut === 'ALL' || d.statut === demandeFilterStatut;
    return matchType && matchStatut;
  });

  return (
    <div className="ob-tab-pane">
      <div className="ob-page-header">
        <div>
          <h2>Traitement &amp; Validation des Demandes d'Inscription</h2>
          <p>Gestion séparée des demandes d'établissements et de professeurs reçues en ligne</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="ob-btn ob-btn-ghost" onClick={copyPublicLink}><Copy size={15} /> Copier le Lien d'Inscription Publique</button>
          <button className="ob-btn ob-btn-ghost" onClick={fetchDemandes}><RefreshCw size={15} /> Actualiser</button>
        </div>
      </div>

      {/* CARTES STATISTIQUES DES DEMANDES */}
      <div className="ob-stats-grid mb-6">
        <div className="ob-stat-card ob-stat-total">
          <div className="ob-stat-icon"><Inbox size={22} /></div>
          <div>
            <div className="ob-stat-num">{totalDemandes}</div>
            <div className="ob-stat-label">Total Demandes Reçues</div>
          </div>
        </div>

        <div className="ob-stat-card ob-stat-ajournes" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <div className="ob-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}><Clock size={22} /></div>
          <div>
            <div className="ob-stat-num" style={{ color: '#b45309' }}>{totalEnAttente}</div>
            <div className="ob-stat-label">En Attente (Reste à traiter)</div>
          </div>
        </div>

        <div className="ob-stat-card ob-stat-admis">
          <div className="ob-stat-icon"><CheckCircle size={22} /></div>
          <div>
            <div className="ob-stat-num">{totalValidees}</div>
            <div className="ob-stat-label">Demandes Validées (Accès envoyés)</div>
          </div>
        </div>

        <div className="ob-stat-card" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
          <div className="ob-stat-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}><XCircle size={22} /></div>
          <div>
            <div className="ob-stat-num" style={{ color: '#b91c1c' }}>{totalRejetees}</div>
            <div className="ob-stat-label">Demandes Rejetées</div>
          </div>
        </div>
      </div>

      {/* BARRE DE SÉPARATION DES DEMANDES & FILTRES */}
      <div className="ob-filters-bar" style={{ background: '#fff', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`ob-btn ${demandeFilterType === 'ETABLISSEMENT' ? 'ob-btn-primary' : 'ob-btn-ghost'}`}
            onClick={() => setDemandeFilterType('ETABLISSEMENT')}
          >
            <School size={16} /> Demandes Établissements ({countEtablissements})
          </button>
          <button
            className={`ob-btn ${demandeFilterType === 'PROFESSEUR' ? 'ob-btn-primary' : 'ob-btn-ghost'}`}
            onClick={() => setDemandeFilterType('PROFESSEUR')}
          >
            <UserCheck size={16} /> Demandes Professeurs ({countProfesseurs})
          </button>
          <button
            className={`ob-btn ${demandeFilterType === 'ALL' ? 'ob-btn-primary' : 'ob-btn-ghost'}`}
            onClick={() => setDemandeFilterType('ALL')}
          >
            Toutes les demandes ({totalDemandes})
          </button>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Statut :</span>
          <select value={demandeFilterStatut} onChange={e => setDemandeFilterStatut(e.target.value)}>
            <option value="ALL">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente ({totalEnAttente})</option>
            <option value="VALIDÉ">Validées ({totalValidees})</option>
            <option value="REJETÉ">Rejetées ({totalRejetees})</option>
          </select>
        </div>
      </div>

      {/* TABLEAU DES DEMANDES FILTRÉES */}
      <div className="ob-table-wrap mt-4" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch', borderRadius: 12, border: '1px solid #cbd5e1' }}>
        {filteredDemandes.length === 0 ? (
          <div className="ob-empty"><Inbox size={48} /><p>Aucune demande trouvée pour cette catégorie.</p></div>
        ) : (
          <table className="ob-table" style={{ width: '100%', minWidth: '1150px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                <th style={{ whiteSpace: 'nowrap' }}>Type</th>
                <th style={{ whiteSpace: 'nowrap' }}>Nom &amp; Prénom</th>
                <th style={{ whiteSpace: 'nowrap' }}>Email &amp; Téléphone</th>
                <th style={{ whiteSpace: 'nowrap' }}>Région / Ville</th>
                <th style={{ whiteSpace: 'nowrap' }}>Réf. CNI / Arrêté / Solde</th>
                <th style={{ whiteSpace: 'nowrap' }}>Pièces &amp; Justificatifs</th>
                <th style={{ whiteSpace: 'nowrap' }}>Statut</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: 200 }}>Actions Agent</th>
              </tr>
            </thead>
            <tbody>
              {filteredDemandes.map(d => {
                let docsObj = {};
                try {
                  docsObj = typeof d.documents_fournis === 'string' ? JSON.parse(d.documents_fournis || '{}') : (d.documents_fournis || {});
                } catch (e) { docsObj = {}; }
                const docKeys = Object.keys(docsObj).filter(k => docsObj[k]);

                return (
                  <tr key={d.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="ob-badge-type" style={{ background: d.type_demande === 'ETABLISSEMENT' ? '#131e6c' : '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {d.type_demande === 'ETABLISSEMENT' ? <School size={12} /> : <UserCheck size={12} />}
                        {d.type_demande === 'ETABLISSEMENT' ? 'ÉTABLISSEMENT' : 'PROFESSEUR'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary-color)' }}>{d.prenom ? `${d.prenom} ${d.nom}` : d.nom}</strong>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{d.specialite_ou_code || '—'}</div>
                    </td>
                    <td>
                      <code>{d.email}</code>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{d.telephone || '—'}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{d.region} ({d.ville || 'Dakar'})</td>
                    <td>
                      <div style={{ fontSize: 11 }}>
                        {d.cni_numero && <div><strong>CNI:</strong> {d.cni_numero}</div>}
                        {d.autorisation_numero && <div><strong>Arrêté:</strong> {d.autorisation_numero}</div>}
                        {d.matricule_solde && <div><strong>Solde:</strong> {d.matricule_solde}</div>}
                        {!d.cni_numero && !d.autorisation_numero && !d.matricule_solde && <span style={{ color: '#94a3b8' }}>Non renseigné</span>}
                      </div>
                    </td>
                    <td>
                      <div>
                        <button
                          type="button"
                          className="ob-btn ob-btn-ghost ob-btn-sm"
                          style={{
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 800,
                            background: docKeys.length > 0 ? '#e0f2fe' : '#f1f5f9',
                            color: docKeys.length > 0 ? '#0369a1' : '#64748b',
                            border: docKeys.length > 0 ? '1px solid #bae6fd' : '1px solid #cbd5e1',
                            borderRadius: 8,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                          onClick={() => setSelectedDemandeForDocs(d)}
                        >
                          <FileText size={13} />
                          {docKeys.length > 0 ? `${docKeys.length} Pièce(s) Transmise(s)` : 'Voir Dossier'}
                        </button>

                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                          {docsObj.doc_autorisation && <span style={{ fontSize: 9, background: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>Arrêté MEN</span>}
                          {docsObj.doc_cni && <span style={{ fontSize: 9, background: '#dbeafe', color: '#1e40af', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>CNI</span>}
                          {docsObj.doc_ninea_ou_diplome && <span style={{ fontSize: 9, background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>NINEA / Diplôme</span>}
                          {docsObj.doc_rib_ou_pv && <span style={{ fontSize: 9, background: '#f3e8ff', color: '#6b21a8', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>RIB / PV</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="ob-statut-pill" style={{
                        background: d.statut === 'VALIDÉ' ? '#dcfce7' : d.statut === 'REJETÉ' ? '#fee2e2' : '#fef9c3',
                        color: d.statut === 'VALIDÉ' ? '#15803d' : d.statut === 'REJETÉ' ? '#b91c1c' : '#b45309',
                        border: `1px solid ${d.statut === 'VALIDÉ' ? '#bbf7d0' : d.statut === 'REJETÉ' ? '#fecaca' : '#fde68a'}`
                      }}>
                        {d.statut === 'EN_ATTENTE' ? '⏳ EN ATTENTE' : d.statut}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', minWidth: 200 }}>
                      {d.statut === 'EN_ATTENTE' ? (
                        <div className="ob-actions-row" style={{ display: 'flex', gap: 6 }}>
                          <button className="ob-btn ob-btn-primary ob-btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={() => handleValiderDemande(d.id)}>
                            <CheckCircle size={13} /> Valider &amp; Envoyer Accès par Email
                          </button>
                          <button className="ob-btn ob-btn-danger ob-btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={() => handleRejeterDemande(d.id)}>
                            ✕ Rejeter
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#64748b' }}>Traité ({d.statut})</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL D'INSPECTION DU DOSSIER */}
      {selectedDemandeForDocs && (() => {
        let docsObj = {};
        try {
          docsObj = typeof selectedDemandeForDocs.documents_fournis === 'string' 
            ? JSON.parse(selectedDemandeForDocs.documents_fournis || '{}') 
            : (selectedDemandeForDocs.documents_fournis || {});
        } catch (e) { docsObj = {}; }

        const docLabels = {
          doc_autorisation: "Arrêté Ministériel / Autorisation d'Enseigner (MEN)",
          doc_cni: "Carte Nationale d'Identité (CNI) du Responsable / Professeur",
          doc_ninea_ou_diplome: "NINEA / Décret de Création / Diplôme d'Enseignement",
          doc_rib_ou_pv: "RIB Bancaire / Certificat de Prise de Service (PV)"
        };

        const getDocUrl = (fName) => {
          if (!fName) return '#';
          if (typeof fName === 'object') {
            if (fName.data) return fName.data;
            fName = fName.name || '';
          }
          if (fName.startsWith('data:') || fName.startsWith('http://') || fName.startsWith('https://')) return fName;
          return `http://localhost:5002/uploads/${fName}`;
        };

        return (
          <div className="ob-modal-backdrop" onClick={() => setSelectedDemandeForDocs(null)}>
            <div className="ob-modal-box" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
              <div className="ob-modal-header" style={{ background: '#131e6c', color: '#fff', borderRadius: '12px 12px 0 0', padding: '16px 20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} /> Dossier Administratif &amp; Pièces Justificatives
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.85 }}>
                    {selectedDemandeForDocs.type_demande === 'ETABLISSEMENT' ? 'Établissement Demandeur' : 'Enseignant Demandeur'} : {selectedDemandeForDocs.prenom ? `${selectedDemandeForDocs.prenom} ${selectedDemandeForDocs.nom}` : selectedDemandeForDocs.nom}
                  </p>
                </div>
                <button className="ob-modal-close" onClick={() => setSelectedDemandeForDocs(null)} style={{ color: '#fff' }}>✕</button>
              </div>

              <div className="ob-modal-body" style={{ padding: '20px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                    <div><strong>Demandeur :</strong> {selectedDemandeForDocs.nom} {selectedDemandeForDocs.prenom}</div>
                    <div><strong>Email :</strong> {selectedDemandeForDocs.email}</div>
                    <div><strong>Téléphone :</strong> {selectedDemandeForDocs.telephone || '—'}</div>
                    <div><strong>Région / Ville :</strong> {selectedDemandeForDocs.region} ({selectedDemandeForDocs.ville})</div>
                    {selectedDemandeForDocs.cni_numero && <div><strong>N° CNI :</strong> {selectedDemandeForDocs.cni_numero}</div>}
                    {selectedDemandeForDocs.autorisation_numero && <div><strong>N° Arrêté :</strong> {selectedDemandeForDocs.autorisation_numero}</div>}
                    {selectedDemandeForDocs.matricule_solde && <div><strong>Matricule Solde :</strong> {selectedDemandeForDocs.matricule_solde}</div>}
                  </div>
                </div>

                <h4 style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>
                  Fichiers &amp; Documents Reçus en Ligne :
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.keys(docLabels).map(key => {
                    const fileName = docsObj[key];
                    const fileUrl = getDocUrl(fileName);
                    const isImage = typeof fileName === 'string' && (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.startsWith('data:image'));

                    return (
                      <div key={key} style={{ background: fileName ? '#f0fdf4' : '#f8fafc', border: `1px solid ${fileName ? '#bbf7d0' : '#cbd5e1'}`, borderRadius: 10, padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{docLabels[key]}</div>
                            <div style={{ fontSize: 11, color: fileName ? '#166534' : '#94a3b8', marginTop: 2 }}>
                              {fileName ? `📄 Fichier : ${typeof fileName === 'object' ? fileName.name : fileName}` : '❌ Document non transmis'}
                            </div>
                          </div>

                          {fileName ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ob-btn ob-btn-primary ob-btn-sm"
                              style={{ fontSize: 11, padding: '6px 14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800 }}
                            >
                              <Eye size={13} /> Ouvrir / Télécharger le Fichier
                            </a>
                          ) : (
                            <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Manquant</span>
                          )}
                        </div>

                        {fileName && isImage && (
                          <div style={{ marginTop: 10, textAlign: 'center', background: '#ffffff', borderRadius: 8, padding: 8, border: '1px solid #e2e8f0' }}>
                            <img
                              src={fileUrl}
                              alt={docLabels[key]}
                              style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 6 }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ob-modal-footer" style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderRadius: '0 0 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="ob-btn ob-btn-ghost" onClick={() => setSelectedDemandeForDocs(null)}>Fermer</button>
                
                {selectedDemandeForDocs.statut === 'EN_ATTENTE' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="ob-btn ob-btn-danger ob-btn-sm" onClick={() => { handleRejeterDemande(selectedDemandeForDocs.id); setSelectedDemandeForDocs(null); }}>
                      ✕ Rejeter la demande
                    </button>
                    <button className="ob-btn ob-btn-primary ob-btn-sm" onClick={() => { handleValiderDemande(selectedDemandeForDocs.id); setSelectedDemandeForDocs(null); }}>
                      <CheckCircle size={14} /> Valider le dossier
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default OfficeDemandesTab;
