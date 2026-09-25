import { X } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function HistoriqueCandidatModal({ historiqueData, setShowHistoriqueModal }) {
  return (
    <div className="ob-modal-overlay" onClick={() => setShowHistoriqueModal(false)}>
      <div className="ob-modal ob-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header">
          <h3> Historique des Participations du Candidat</h3>
          <button onClick={() => setShowHistoriqueModal(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="ob-modal-body">
          {historiqueData.length === 0 ? (
            <p>Aucun historique antérieur trouvé.</p>
          ) : (
            <div className="ob-table-wrap">
              <table className="ob-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>N° Table</th>
                    <th>Examen & Série</th>
                    <th>Moyenne</th>
                    <th>Mention</th>
                    <th>Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  {historiqueData.map((h) => (
                    <tr key={h.id}>
                      <td>
                        <strong>Session {h.annee}</strong>
                      </td>
                      <td>
                        <code>{h.numero_table || '—'}</code>
                      </td>
                      <td>
                        {h.type_examen} Série {h.serie}
                      </td>
                      <td>
                        <strong>{h.moyenne ? parseFloat(h.moyenne).toFixed(2) + '/20' : '—'}</strong>
                      </td>
                      <td>{h.mention || '—'}</td>
                      <td>
                        <span
                          className="ob-statut-pill"
                          style={{
                            background: h.statut_resultat === 'Admis' ? '#dcfce7' : '#fee2e2',
                            color: h.statut_resultat === 'Admis' ? '#15803d' : '#b91c1c',
                          }}
                        >
                          {h.statut_resultat || h.statut_candidat}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="ob-modal-footer">
            <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowHistoriqueModal(false)}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
