import React from 'react';
import { Send } from 'lucide-react';

export const OfficePublicationTab = ({ stats, setShowPublierModal }) => {
  return (
    <div className="ob-tab-pane">
      <div className="ob-page-header">
        <div>
          <h2>Publication des Résultats Officiels</h2>
          <p>Publiez les résultats certifiés avec diffusion aux élèves et notification instantanée</p>
        </div>
      </div>

      <div className="ob-publi-grid">
        <div className="ob-card ob-publi-card">
          <div className="ob-publi-icon"><Send size={32} /></div>
          <h3>Publier les résultats officiels</h3>
          <p>Une fois publiés, les résultats seront immédiatement accessibles dans l'espace candidat élève avec le relevé officiel et le système de vérification d'authenticité par QR Code.</p>
          <button className="ob-btn ob-btn-publish" onClick={() => setShowPublierModal(true)}>
            <Send size={16} /> Lancer la publication
          </button>
        </div>

        <div className="ob-card">
          <h3 className="ob-card-title">Aperçu des sessions publiées</h3>
          {stats?.par_annee?.length > 0 ? (
            <table className="ob-table ob-table-sm">
              <thead><tr><th>Année</th><th>Candidats</th><th>Admis</th><th>Moy. Générale</th></tr></thead>
              <tbody>
                {stats.par_annee.map(a => (
                  <tr key={a.annee}>
                    <td><strong>{a.annee}</strong></td>
                    <td>{a.total}</td>
                    <td style={{ color: '#15803d', fontWeight: 700 }}>{a.admis}</td>
                    <td>{a.moyenne_generale ? parseFloat(a.moyenne_generale).toFixed(2) + '/20' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="ob-empty" style={{ padding: '24px' }}><p>Aucune donnée publiée</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficePublicationTab;
