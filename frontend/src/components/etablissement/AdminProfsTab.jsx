import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminProfsTab = ({
  profs,
  setEditingProf,
  setShowProfModal,
  toggleMessagePermission,
  handleOpenEditProfModal,
  fetchProfs
}) => {
  return (
    <div className="profs-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Corps Enseignant</h1>
          <p className="page-subtitle">{profs.length} enseignants enregistrés</p>
        </div>
        <button className="btn btn-primary" onClick={() => {setEditingProf(null); setShowProfModal(true);}} style={{ background: 'var(--accent-color)', borderColor: 'var(--accent-color)', fontSize: '11px', padding: '6px 14px' }}>
          <Plus size={16} /> Ajouter un Professeur
        </button>
      </div>

      <div className="table-block">
        <div className="table-block-header">
          <div className="table-block-title">
            <h3>Liste des professeurs</h3>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Enseignant</th>
                <th>Identifiant National</th>
                <th>Matière principale</th>
                <th>Permission Messagerie</th>
                <th>Date d'invitation</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profs.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-bold" style={{ color: 'var(--primary-color)' }}>
                        {p.prenom && p.nom ? `${p.prenom} ${p.nom}` : 'Profil non complété'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--slate-500)' }}>{p.email}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.identifiant_national || '-'}</td>
                  <td>{p.matiere_principale || 'Non spécifiée'}</td>
                  <td>
                    {p.statut === 'ACCEPTE' ? (
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={p.droit_envoi_message || false}
                          onChange={() => toggleMessagePermission(p.id, p.droit_envoi_message)}
                          style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: p.droit_envoi_message ? '#166534' : 'var(--slate-500)' }}>
                          {p.droit_envoi_message ? 'Autorisé' : 'Bloqué'}
                        </span>
                      </label>
                    ) : (
                      <span className="text-slate-400" style={{ fontSize: '11px' }}>Non applicable</span>
                    )}
                  </td>
                  <td>{p.date_invitation ? new Date(p.date_invitation).toLocaleDateString('fr-FR') : '-'}</td>
                  <td>
                    {(() => {
                      switch (p.statut) {
                        case 'ACCEPTE':
                          return <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 700 }}>Actif (Accepté)</span>;
                        case 'REFUSE':
                          return <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: 700 }}>Refusé</span>;
                        case 'EN_ATTENTE':
                        default:
                          return <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 700 }}>En attente</span>;
                      }
                    })()}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-action-text modifier" onClick={() => handleOpenEditProfModal(p)} title="Modifier">
                        <Edit size={12} /> <span>Modifier</span>
                      </button>
                      <button className="btn-action-text delete-btn" onClick={async () => {
                        if (!window.confirm('Supprimer ce professeur de votre établissement ?')) return;
                        const token = localStorage.getItem('token');
                        await fetch(`http://localhost:5002/api/professeurs/${p.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
                        fetchProfs();
                      }} title="Supprimer" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                        <Trash2 size={12} /> <span>Supprimer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {profs.length === 0 && <tr><td colSpan="7" className="text-center py-8 text-slate-400">Aucun professeur invité ou enregistré.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProfsTab;
