import React from 'react';
import { ArrowRightLeft, User, FileText, CheckCircle, XCircle } from 'lucide-react';

const AdminTransfertsTab = ({
  transferSubTab,
  setTransferSubTab,
  incomingTransfers,
  outgoingTransfers,
  setViewTransferMotifModal,
  handleOpenDossierPreview,
  setConfirmTransferModal,
  handleAcceptTransfer,
  handleRejectTransfer,
  handleCancelTransfer,
  loading
}) => {
  return (
    <div className="transferts-view animate-fade-in">
      <div className="page-header flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowRightLeft size={26} className="text-primary" />
            Gestion des Transferts de Dossiers
          </h1>
          <p className="page-subtitle">
            Traitez les demandes de transfert entrantes et suivez les demandes émises par votre établissement.
          </p>
        </div>
      </div>

      {/* Sub-tabs: Demandes Reçues vs Demandes Envoyées */}
      <div className="sub-tabs-bar mb-4" style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`sub-tab-btn ${transferSubTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setTransferSubTab('incoming')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem 1rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: transferSubTab === 'incoming' ? 'var(--primary-color)' : '#64748b',
            borderBottom: transferSubTab === 'incoming' ? '3px solid var(--primary-color)' : 'none',
            marginBottom: '-0.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Demandes Reçues (Entrantes)
          {incomingTransfers.length > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
              {incomingTransfers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`sub-tab-btn ${transferSubTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setTransferSubTab('outgoing')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem 1rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: transferSubTab === 'outgoing' ? 'var(--primary-color)' : '#64748b',
            borderBottom: transferSubTab === 'outgoing' ? '3px solid var(--primary-color)' : 'none',
            marginBottom: '-0.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Demandes Envoyées (Sortantes)
          <span style={{ background: '#cbd5e1', color: '#334155', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
            {outgoingTransfers.length}
          </span>
        </button>
      </div>

      {transferSubTab === 'incoming' ? (
        <div className="table-block animate-fade-in">
          <div className="table-block-header">
            <div className="table-block-title">
              <h3>Demandes de Transfert Entrantes ({incomingTransfers.length})</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Ces élèves ont demandé un transfert vers votre établissement. Vous pouvez consulter leur livret avant d'accepter.
              </p>
            </div>
          </div>

          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>ID National</th>
                  <th>Établissement d'Origine</th>
                  <th>Motif du Transfert</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomingTransfers.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {t.photo_url ? (
                          <img src={`http://localhost:5002${t.photo_url}`} alt="Photo" className="student-photo-mini" />
                        ) : (
                          <div className="user-avatar-small"><User size={14}/></div>
                        )}
                        <strong style={{ fontSize: '13px' }}>{t.eleve_nom} {t.eleve_prenom}</strong>
                      </div>
                    </td>
                    <td><code className="text-orange" style={{ fontSize: '11px' }}>{t.identifiant_national}</code></td>
                    <td><strong>{t.ancien_etablissement_nom}</strong></td>
                    <td>
                      <button 
                        type="button" 
                        className="btn btn-outline"
                        onClick={() => setViewTransferMotifModal({ eleveNom: `${t.eleve_nom} ${t.eleve_prenom}`, motif: t.motif })}
                        style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 600 }}
                        title="Cliquer pour voir le motif"
                      >
                        <FileText size={12} style={{ color: '#475569' }} /> Voir motif
                      </button>
                    </td>
                    <td style={{ fontSize: '12px' }}>{new Date(t.date_transfert).toLocaleDateString('fr-SN')}</td>
                    <td>
                      <div className="flex gap-2 flex-wrap" style={{ alignItems: 'center' }}>
                        <button 
                          type="button"
                          className="btn-action-text dossier"
                          onClick={() => handleOpenDossierPreview({ id: t.eleve_id, nom: t.eleve_nom, prenom: t.eleve_prenom, identifiant_national: t.identifiant_national })}
                          title="Visualiser le livret complet avant décision"
                          style={{ borderColor: '#3b82f6', color: '#2563eb' }}
                        >
                          <FileText size={13} /> <span> Aperçu du Livret</span>
                        </button>
                        <button 
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setConfirmTransferModal({ 
                            type: 'accept', 
                            transferId: t.id, 
                            eleveNom: `${t.eleve_nom} ${t.eleve_prenom}`, 
                            onConfirm: () => handleAcceptTransfer(t.id) 
                          })}
                          disabled={loading}
                          style={{ background: '#10b981', borderColor: '#059669', fontSize: '11px', padding: '5px 12px', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CheckCircle size={13} /> Accepter
                        </button>
                        <button 
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setConfirmTransferModal({ 
                            type: 'reject', 
                            transferId: t.id, 
                            eleveNom: `${t.eleve_nom} ${t.eleve_prenom}`, 
                            onConfirm: () => handleRejectTransfer(t.id) 
                          })}
                          disabled={loading}
                          style={{ borderColor: '#ef4444', color: '#dc2626', fontSize: '11px', padding: '5px 12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <XCircle size={13} /> Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {incomingTransfers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      Aucune demande de transfert reçue pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="table-block animate-fade-in">
          <div className="table-block-header">
            <div className="table-block-title">
              <h3>Demandes de Transfert Envoyées ({outgoingTransfers.length})</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Vos droits d'édition sont conservés tant que la demande est en attente.
              </p>
            </div>
          </div>

          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>ID National</th>
                  <th>Établissement Destinataire</th>
                  <th>Motif</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {outgoingTransfers.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.eleve_nom} {t.eleve_prenom}</strong></td>
                    <td><code className="text-orange" style={{ fontSize: '11px' }}>{t.identifiant_national}</code></td>
                    <td><strong>{t.nouveau_etablissement_nom}</strong></td>
                    <td style={{ fontSize: '12px' }}>
                      <button 
                        type="button" 
                        className="btn btn-outline"
                        onClick={() => setViewTransferMotifModal({ eleveNom: `${t.eleve_nom} ${t.eleve_prenom}`, motif: t.motif })}
                        style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 600 }}
                        title="Cliquer pour voir le motif"
                      >
                        <FileText size={12} style={{ color: '#475569' }} /> Voir motif
                      </button>
                    </td>
                    <td style={{ fontSize: '12px' }}>{new Date(t.date_transfert).toLocaleDateString('fr-SN')}</td>
                    <td>
                      <span className={`status-pill ${
                        t.statut_transfert === 'VALIDE' ? 'status-pass' : 
                        t.statut_transfert === 'REJETE' ? 'status-fail' : ''
                      }`} style={t.statut_transfert === 'EN_ATTENTE' ? { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' } : {}}>
                        {t.statut_transfert === 'EN_ATTENTE' ? 'EN ATTENTE' : t.statut_transfert}
                      </span>
                    </td>
                    <td>
                      {t.statut_transfert === 'EN_ATTENTE' && (
                        <button 
                          type="button"
                          className="btn-action-text delete-btn"
                          onClick={() => setConfirmTransferModal({ 
                            type: 'cancel', 
                            transferId: t.id, 
                            eleveNom: `${t.eleve_nom} ${t.eleve_prenom}`, 
                            onConfirm: () => handleCancelTransfer(t.id) 
                          })}
                          disabled={loading}
                          style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', padding: '4px 8px', fontSize: '11px' }}
                        >
                          Annuler la demande
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {outgoingTransfers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      Aucune demande de transfert envoyée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransfertsTab;
