import React from 'react';
import { Share2, FileDown, Download, Trash2 } from 'lucide-react';

const AdminPartagesTab = ({
  setShowPartageModal,
  partageView,
  setPartageView,
  partagesRecus,
  partagesEnvoyes,
  handleDownloadPartage,
  handleDeletePartage
}) => {
  return (
    <div className="partages-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents Partagés</h1>
          <p className="page-subtitle">Partage sécurisé de dossiers d'élèves et fichiers administratifs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowPartageModal(true)} style={{ background: 'var(--primary-color)', fontSize: '11px', padding: '6px 14px' }}>
          <Share2 size={16} /> Partager un Document
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div className="status-toggle-pill" style={{ display: 'inline-flex' }}>
          <button className={`status-toggle-btn ${partageView === 'received' ? 'active' : ''}`} onClick={() => setPartageView('received')}>
            Reçus ({partagesRecus.length})
          </button>
          <button className={`status-toggle-btn ${partageView === 'sent' ? 'active' : ''}`} onClick={() => setPartageView('sent')}>
            Envoyés ({partagesEnvoyes.length})
          </button>
        </div>
      </div>

      <div className="table-block">
        <div className="table-block-header">
          <div className="table-block-title">
            <h3>{partageView === 'received' ? 'Fichiers reçus d\'autres établissements' : 'Fichiers envoyés'}</h3>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          {(partageView === 'received' ? partagesRecus : partagesEnvoyes).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--slate-400)', fontSize: '13px', fontWeight: 500 }}>
              Aucun document partagé.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{partageView === 'received' ? 'Expéditeur' : 'Destinataire'}</th>
                  <th>Fichier</th>
                  <th>Élève concerné</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(partageView === 'received' ? partagesRecus : partagesEnvoyes).map(d => (
                  <tr key={d.id} className={!d.lu ? 'unread-row' : ''}>
                    <td>
                      <strong>{partageView === 'received' ? d.expediteur_nom : d.destinataire_nom}</strong>
                      <br /><small className="text-slate-400" style={{ fontSize: '10px' }}>{partageView === 'received' ? d.expediteur_ville : d.destinataire_ville}</small>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileDown size={14} className="text-slate-500" />
                        <span className="font-mono" style={{ fontSize: '11px' }}>{d.nom_fichier}</span>
                      </div>
                    </td>
                    <td>{d.eleve_nom ? <span className="font-bold">{d.eleve_nom} {d.eleve_prenom}</span> : <span className="text-slate-400">-</span>}</td>
                    <td>{d.description || <span className="text-slate-400">-</span>}</td>
                    <td>{new Date(d.date_envoi).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-action-text bulletin" onClick={() => handleDownloadPartage(d.id)} title="Télécharger">
                          <Download size={12} /> <span>Télécharger</span>
                        </button>
                        <button className="btn-action-text delete-btn" onClick={() => handleDeletePartage(d.id)} title="Supprimer" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                          <Trash2 size={12} /> <span>Supprimer</span>
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

export default AdminPartagesTab;
