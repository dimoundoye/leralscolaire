import { X, QrCode, Printer } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function ReleveNotesModal({ releveData, setShowReleveModal }) {
  return (
    <div className="ob-modal-overlay" onClick={() => setShowReleveModal(false)}>
      <div className="ob-modal ob-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header">
          <h3> Relevé Officiel de Notes & Attestation Certifiée</h3>
          <button onClick={() => setShowReleveModal(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="ob-modal-body">
          <div style={{ border: '2px solid #131e6c', borderRadius: 14, padding: 24, background: '#fff' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '2px solid #131e6c',
                paddingBottom: 16,
                marginBottom: 16,
              }}
            >
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 900, color: '#131e6c', margin: 0 }}>RÉPUBLIQUE DU SÉNÉGAL</h2>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>
                  Ministère de l'Éducation Nationale · Office du BAC
                </p>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginTop: 8, color: '#0f172a' }}>
                  RELEVÉ DE NOTES OFFICIEL
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24 }}>🇸🇳</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#131e6c' }}>Session {releveData.annee}</div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                fontSize: 12,
                marginBottom: 16,
                background: '#f8fafc',
                padding: 12,
                borderRadius: 8,
              }}
            >
              <div>
                <strong>Candidat :</strong> {releveData.prenom} {releveData.nom}
              </div>
              <div>
                <strong>N° de Table :</strong>{' '}
                <code style={{ color: '#131e6c', fontWeight: 700 }}>{releveData.numero_table}</code>
              </div>
              <div>
                <strong>Série :</strong> {releveData.serie}
              </div>
              <div>
                <strong>Jury :</strong> {releveData.jury}
              </div>
              <div>
                <strong>Centre :</strong> {releveData.centre_examen}
              </div>
              <div>
                <strong>Établissement :</strong> {releveData.etablissement_nom || 'Candidat Libre'}
              </div>
            </div>

            {releveData.details_epreuves && Object.keys(releveData.details_epreuves).length > 0 && (
              <table className="ob-table ob-table-sm" style={{ marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Coeff</th>
                    <th>Note/20</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(releveData.details_epreuves).map(([mat, d]) => {
                    const note = parseFloat(d.note || 0);
                    const coeff = parseFloat(d.coefficient || 1);
                    return (
                      <tr key={mat}>
                        <td>{mat}</td>
                        <td>{coeff}</td>
                        <td>
                          <strong>{note.toFixed(2)}</strong>
                        </td>
                        <td>{(note * coeff).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #e2e8f0',
                paddingTop: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: releveData.statut_resultat === 'Admis' ? '#15803d' : '#b45309',
                  }}
                >
                  RÉSULTAT : {releveData.statut_resultat?.toUpperCase()}{' '}
                  {releveData.mention && `(${releveData.mention})`}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  Moyenne Générale : {parseFloat(releveData.moyenne).toFixed(2)} / 20
                </div>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  background: '#f1f5f9',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                }}
              >
                <QrCode size={40} style={{ color: '#131e6c' }} />
                <div style={{ fontSize: 9, fontFamily: 'monospace', marginTop: 4, color: '#64748b' }}>
                  Token: {releveData.qr_code_hash?.substring(0, 10)}…
                </div>
              </div>
            </div>
          </div>

          <div className="ob-modal-footer">
            <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowReleveModal(false)}>
              Fermer
            </button>
            <button type="button" className="ob-btn ob-btn-primary" onClick={() => window.print()}>
              <Printer size={16} /> Imprimer Relevé Certifié
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
