import React from 'react';
import { Plus, School } from 'lucide-react';

export const OfficeEtablissementsTab = ({ etablissements = [], setShowAddEtabModal }) => {
  return (
    <div className="ob-tab-pane">
      <div className="ob-page-header">
        <div>
          <h2>Établissements du Sénégal</h2>
          <p>Gestion des lycées et centres d'examen nationaux avec génération automatique des comptes administrateurs</p>
        </div>
        <button className="ob-btn ob-btn-primary" onClick={() => setShowAddEtabModal(true)}>
          <Plus size={16} /> Nouvel Établissement
        </button>
      </div>

      <div className="ob-stats-grid mb-6" style={{ marginBottom: 20 }}>
        <div className="ob-stat-card ob-stat-total">
          <div className="ob-stat-icon"><School size={22} /></div>
          <div>
            <div className="ob-stat-num">{etablissements.length}</div>
            <div className="ob-stat-label">Établissements Enregistrés au Sénégal</div>
          </div>
        </div>
      </div>

      <div className="ob-table-wrap">
        <table className="ob-table">
          <thead>
            <tr>
              <th>Code Établissement (ID Unique)</th>
              <th>Nom de l'Établissement</th>
              <th>Région / Ville</th>
              <th>Email Administrateur</th>
              <th>Effectif Élèves</th>
              <th>Corps Enseignant</th>
            </tr>
          </thead>
          <tbody>
            {etablissements.map(e => (
              <tr key={e.id}>
                <td><code className="ob-id-code">{e.code_etablissement}</code></td>
                <td>
                  <strong style={{ color: 'var(--primary-color)' }}>{e.nom}</strong>
                  {e.autorisation_numero && <div style={{ fontSize: 11, color: '#64748b' }}>Arrêté: {e.autorisation_numero}</div>}
                </td>
                <td>{e.region} ({e.ville})</td>
                <td>
                  <div>{e.admin_email || '—'}</div>
                  {e.telephone && <div style={{ fontSize: 11, color: '#64748b' }}>Tél: {e.telephone}</div>}
                </td>
                <td><span className="ob-statut-pill" style={{ background: '#eff6ff', color: '#1d4ed8' }}>{e.total_eleves || 0} Élèves</span></td>
                <td><span className="ob-statut-pill" style={{ background: '#f0fdf4', color: '#15803d' }}>{e.total_profs || 0} Enseignants</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfficeEtablissementsTab;
