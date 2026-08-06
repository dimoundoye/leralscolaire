import React from 'react';
import { Edit, Check, X } from 'lucide-react';

const AdminPreInscriptionsTab = ({
  preInscriptions,
  setEditingPreInscription,
  setShowPreModal,
  handleValidatePreInscription,
  handleRejectPreInscription
}) => {
  return (
    <div className="pre-inscriptions-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pré-inscriptions</h1>
          <p className="page-subtitle">{preInscriptions.length} demandes en attente de validation</p>
        </div>
      </div>

      <div className="table-block">
        <div className="table-block-header">
          <div className="table-block-title">
            <h3>Demandes d'inscription en attente</h3>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          {preInscriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--slate-400)', fontSize: '13px', fontWeight: 500 }}>
              Aucune pré-inscription en attente.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Classe Demandée</th>
                  <th>Type</th>
                  <th>Identifiant National</th>
                  <th>Naissance</th>
                  <th>Contact Parent</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {preInscriptions.map(p => (
                  <tr key={p.id}>
                    <td className="font-bold">{p.prenom} {p.nom}</td>
                    <td><span className="badge av-blue" style={{ background: 'rgba(19,30,108,0.06)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>{p.classe_nom}</span></td>
                    <td>
                      {p.identifiant_existant ? (
                        <span className="status-pill status-fail">Transfert</span>
                      ) : (
                        <span className="status-pill status-pass">Nouvel Élève</span>
                      )}
                    </td>
                    <td><code className="text-orange" style={{fontSize: '11px'}}>{p.identifiant_existant || '-'}</code></td>
                    <td>
                      {p.date_naissance ? new Date(p.date_naissance).toLocaleDateString('fr-FR') : 'N/A'} à {p.lieu_naissance || 'N/A'}
                    </td>
                    <td><div className="text-xs" style={{maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={p.coordonnees_parent}>{p.coordonnees_parent}</div></td>
                    <td><span className={`status-pill ${p.statut === 'APTE' ? 'status-pass' : 'status-fail'}`}>{p.statut}</span></td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        <button className="btn-action-text modifier" title="Modifier" onClick={() => { setEditingPreInscription(p); setShowPreModal(true); }}>
                          <Edit size={12} /> <span>Modifier</span>
                        </button>
                        <button className="btn-action-text bulletin" title="Valider & Créer compte" onClick={() => handleValidatePreInscription(p.id)}>
                          <Check size={12} /> <span>Valider</span>
                        </button>
                        <button className="btn-action-text delete-btn" title="Rejeter" onClick={() => handleRejectPreInscription(p.id)} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                          <X size={12} /> <span>Rejeter</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPreInscriptionsTab;
