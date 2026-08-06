import React from 'react';
import { Check, X, Download } from 'lucide-react';

const AdminAttestationsTab = ({
  attestationFilter,
  setAttestationFilter,
  attestations,
  handleAcceptAttestation,
  setRefusingAttestation
}) => {
  return (
    <div className="attestations-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attestations d'Inscription</h1>
          <p className="page-subtitle">Gérez et traitez les demandes d'attestations d'inscription des élèves</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'EN_ATTENTE', label: 'En attente' },
          { id: 'ACCEPTE', label: 'Acceptées' },
          { id: 'REFUSE', label: 'Refusées' }
        ].map(pill => (
          <button
            key={pill.id}
            onClick={() => setAttestationFilter(pill.id)}
            className={`sm-btn ${attestationFilter === pill.id ? 'active' : ''}`}
            style={{
              height: '32px',
              padding: '0 16px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              background: attestationFilter === pill.id ? 'var(--primary-color)' : 'white',
              color: attestationFilter === pill.id ? 'white' : 'var(--slate-600)'
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      <div className="table-block">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Classe</th>
                <th>Date de Demande</th>
                <th>Motif de Demande</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attestations
                .filter(item => attestationFilter === 'all' || item.statut === attestationFilter)
                .map(item => {
                  const dateDemande = new Date(item.date_demande).toLocaleDateString('fr-SN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{item.eleve_prenom} {item.eleve_nom}</div>
                        <div style={{ fontSize: '10px', color: 'var(--slate-400)', fontFamily: 'monospace' }}>ID: {item.identifiant_national}</div>
                      </td>
                      <td>{item.classe_nom || 'Non affecté'}</td>
                      <td>{dateDemande}</td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.motif_demande}>
                        {item.motif_demande || <span style={{ color: 'var(--slate-300)', fontStyle: 'italic' }}>Aucun</span>}
                      </td>
                      <td>
                        <span className={`badge ${
                          item.statut === 'ACCEPTE' ? 'badge-success' : 
                          item.statut === 'REFUSE' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {item.statut === 'ACCEPTE' ? 'Acceptée' : 
                           item.statut === 'REFUSE' ? 'Refusée' : 'En attente'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {item.statut === 'EN_ATTENTE' && (
                            <>
                              <button 
                                onClick={() => handleAcceptAttestation(item.id)} 
                                className="btn-text" 
                                style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                              >
                                <Check size={14} /> Accepter
                              </button>
                              <button 
                                onClick={() => setRefusingAttestation(item)} 
                                className="btn-text" 
                                style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                              >
                                <X size={14} /> Refuser
                              </button>
                            </>
                          )}
                          {item.statut === 'ACCEPTE' && (
                            <a 
                              href={`http://localhost:5002/api/documents/attestation/${item.eleve_id}?token=${localStorage.getItem('token')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn-text" 
                              style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '11px', fontWeight: 700 }}
                            >
                              <Download size={14} /> Télécharger
                            </a>
                          )}
                          {item.statut === 'REFUSE' && (
                            <span 
                              style={{ fontSize: '11px', color: 'var(--slate-400)', cursor: 'help' }} 
                              title={`Motif du refus: ${item.motif_refus}`}
                            >
                              Refusé (survoler pour le motif)
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {attestations.filter(item => attestationFilter === 'all' || item.statut === attestationFilter).length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    Aucune demande d'attestation trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAttestationsTab;
