import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminMatieresTab = ({
  matieres,
  setEditingMatiere,
  setShowMatiereModal,
  handleDeleteMatiere
}) => {
  return (
    <div className="matieres-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Matières</h1>
          <p className="page-subtitle">{matieres.length} matières configurées</p>
        </div>
        <button className="btn btn-primary" onClick={() => {setEditingMatiere(null); setShowMatiereModal(true);}} style={{ background: 'var(--accent-color)', borderColor: 'var(--accent-color)', fontSize: '11px', padding: '6px 14px' }}>
          <Plus size={16} /> Nouvelle Matière
        </button>
      </div>

      <div className="table-block">
        <div className="table-block-header">
          <div className="table-block-title">
            <h3>Catalogue des matières</h3>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom de la matière</th>
                <th>Code unique</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matieres.map(m => (
                <tr key={m.id}>
                  <td className="font-bold">{m.nom}</td>
                  <td><code className="text-orange" style={{fontSize: '11px'}}>{m.code_matiere}</code></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-action-text modifier" onClick={() => {setEditingMatiere(m); setShowMatiereModal(true);}} title="Modifier">
                        <Edit size={12} /> <span>Modifier</span>
                      </button>
                      <button className="btn-action-text delete-btn" onClick={() => handleDeleteMatiere(m.id)} title="Supprimer" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                        <Trash2 size={12} /> <span>Supprimer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {matieres.length === 0 && <tr><td colSpan="3" className="text-center py-8 text-slate-400">Aucune matière définie.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMatieresTab;
