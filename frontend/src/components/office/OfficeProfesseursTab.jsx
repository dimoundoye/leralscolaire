import React from 'react';
import { Plus, UserCheck, Users } from 'lucide-react';

export const OfficeProfesseursTab = ({ professeursList = [], setShowAddProfModal }) => {
  const hommes = professeursList.filter(p => (p.sexe || 'M') === 'M').length;
  const femmes = professeursList.filter(p => p.sexe === 'F').length;

  return (
    <div className="ob-tab-pane">
      <div className="ob-page-header">
        <div>
          <h2>Professeurs &amp; Correcteurs Nationaux</h2>
          <p>Gestion du corps enseignant et des examinateurs du BAC/BFEM avec identifiants et mot de passe temporaire unique</p>
        </div>
        <button className="ob-btn ob-btn-primary" onClick={() => setShowAddProfModal(true)}>
          <Plus size={16} /> Nouvel Enseignant / Correcteur
        </button>
      </div>

      <div className="ob-stats-grid mb-6" style={{ marginBottom: 20 }}>
        <div className="ob-stat-card ob-stat-publie">
          <div className="ob-stat-icon"><UserCheck size={22} /></div>
          <div>
            <div className="ob-stat-num">{professeursList.length}</div>
            <div className="ob-stat-label">Professeurs / Correcteurs Enregistrés</div>
          </div>
        </div>
        <div className="ob-stat-card ob-stat-total">
          <div className="ob-stat-icon"><Users size={20} /></div>
          <div>
            <div className="ob-stat-num">{hommes}</div>
            <div className="ob-stat-label">Enseignants (Mr.)</div>
          </div>
        </div>
        <div className="ob-stat-card ob-stat-taux">
          <div className="ob-stat-icon"><Users size={20} /></div>
          <div>
            <div className="ob-stat-num">{femmes}</div>
            <div className="ob-stat-label">Enseignantes (Mme.)</div>
          </div>
        </div>
      </div>

      <div className="ob-table-wrap">
        <table className="ob-table" style={{ fontSize: 12 }}>
          <thead>
            <tr>
              <th>Identifiant National</th>
              <th>Civilité</th>
              <th>Enseignant</th>
              <th>Email de connexion</th>
              <th>Spécialité</th>
              <th>Établissement</th>
              <th>Région</th>
            </tr>
          </thead>
          <tbody>
            {professeursList.map(p => (
              <tr key={p.id}>
                <td><code className="ob-id-code">{p.identifiant_national || 'PROF-SN'}</code></td>
                <td>
                  <span style={{
                    background: p.sexe === 'F' ? '#fce7f3' : '#e0f2fe',
                    color: p.sexe === 'F' ? '#9d174d' : '#0369a1',
                    border: `1px solid ${p.sexe === 'F' ? '#fbcfe8' : '#7dd3fc'}`,
                    padding: '2px 8px', borderRadius: 12, fontSize: 10.5, fontWeight: 700
                  }}>
                    {p.sexe === 'F' ? 'Mme.' : 'Mr.'}
                  </span>
                </td>
                <td>
                  <strong style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{p.prenom} {p.nom}</strong>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {p.telephone || '—'} {p.cni_numero ? `• CNI: ${p.cni_numero}` : ''} {p.matricule_solde ? `• Solde: ${p.matricule_solde}` : ''}
                  </div>
                </td>
                <td>{p.email}</td>
                <td><span className="ob-badge-type">{p.matiere_principale || 'Général'}</span></td>
                <td>{p.etablissement_nom || 'Attribué BAC'}</td>
                <td>{p.region || 'Sénégal'}{p.ville ? ` (${p.ville})` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfficeProfesseursTab;
