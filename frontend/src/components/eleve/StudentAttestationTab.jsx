import React from 'react';
import { Award, Clock, Lock, CheckCircle, Download, XCircle, Send } from 'lucide-react';

const StudentAttestationTab = ({
  attestationHistory,
  profile,
  token,
  refreshAttestationHistory,
  handleSubmitAttestationRequest,
  attestationMotif,
  setAttestationMotif,
  attestationSubmitting
}) => {
  const currentClassHistory = attestationHistory.filter(dem => !dem.classe_id || dem.classe_id === profile?.classe_id);
  const latest = currentClassHistory[0];

  return (
    <div className="tab-pane">
      <div className="card-box">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #131e6c, #2a3a9e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Attestation d'Inscription Scolaire</h2>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              Soumettez une demande à votre établissement. Le document officiel vous sera remis une fois la demande traitée.
            </p>
          </div>
        </div>

        {/* Status banner for latest request of the current class */}
        {latest && (() => {
          if (latest.statut === 'EN_ATTENTE') return (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 18px', borderRadius: '12px', background: '#fffdf0', border: '1.5px solid #f5c518', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(245,197,24,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={18} color="#b45309" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#78350f', marginBottom: '4px' }}>Demande en cours de traitement</div>
                <div style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>Votre établissement a bien reçu votre demande et la traitera prochainement. Vous serez notifié dès qu'une décision est prise.</div>
              </div>
            </div>
          );
          if (latest.statut === 'ACCEPTE') {
            if (latest.deja_telecharge) {
              const downloadDateStr = latest.date_telechargement 
                ? new Date(latest.date_telechargement).toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                : 'récemment';
              return (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 18px', borderRadius: '12px', background: '#f1f5f9', border: '1.5px solid #cbd5e1', marginBottom: '20px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(71,85,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Lock size={18} color="#475569" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#334155', marginBottom: '4px' }}>Attestation déjà téléchargée</div>
                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                      Votre attestation d'inscription officielle pour la classe <strong>{profile?.classe_nom || 'actuelle'}</strong> a été téléchargée le {downloadDateStr}. 
                      <br />
                      Conformément à la réglementation scolaire, ce document est strictement obligatoire et délivré <strong>une seule fois</strong>. Si vous l'avez égaré, veuillez vous adresser directement à l'administration de votre établissement.
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div style={{ padding: '16px 18px', borderRadius: '12px', background: '#052e16', border: '1.5px solid #166534', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '13px', marginBottom: '12px', color: '#4ade80' }}>
                  <CheckCircle size={18} color="#4ade80" /> Demande acceptée — votre attestation est disponible !
                </div>
                <a
                  href={`/api/documents/attestation/${profile?.id}?token=${token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setTimeout(() => {
                      refreshAttestationHistory();
                    }, 1500);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}
                >
                  <Download size={16} /> Télécharger mon Attestation (PDF)
                </a>
              </div>
            );
          }
          if (latest.statut === 'REFUSE') return (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 18px', borderRadius: '12px', background: '#fff5f5', border: '1.5px solid #f87171', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <XCircle size={18} color="#dc2626" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#991b1b', marginBottom: '4px' }}>Demande refusée</div>
                <div style={{ fontSize: '12px', color: '#b91c1c', lineHeight: 1.5 }}>Motif : {latest.motif_refus || 'Aucun motif fourni'}. Vous pouvez soumettre une nouvelle demande ci-dessous.</div>
              </div>
            </div>
          );
          return null;
        })()}

        {/* Request form — only when no pending or accepted request for current class */}
        {(currentClassHistory.length === 0 || currentClassHistory[0]?.statut === 'REFUSE') && (
          <div style={{ background: 'var(--bg-secondary, #f8fafc)', borderRadius: '10px', padding: '20px', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700 }}>Nouvelle demande</h3>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Indiquez si possible le motif de votre demande pour faciliter le traitement.
            </p>
            <form onSubmit={handleSubmitAttestationRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                value={attestationMotif}
                onChange={e => setAttestationMotif(e.target.value)}
                placeholder="Motif de la demande (optionnel) — ex : besoin pour un visa, demande d'emploi, concours..."
                rows={4}
                style={{ width: '100%', borderRadius: '8px', border: '1.5px solid var(--border)', padding: '12px', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={attestationSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #131e6c, #2a3a9e)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: attestationSubmitting ? 'not-allowed' : 'pointer', opacity: attestationSubmitting ? 0.7 : 1, transition: 'opacity .2s' }}
                >
                  <Send size={15} /> {attestationSubmitting ? 'Envoi en cours...' : 'Soumettre la demande'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* History */}
        {attestationHistory.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Historique des demandes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {attestationHistory.map(dem => {
                const dateStr = new Date(dem.date_demande).toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric' });
                const badge = dem.statut === 'ACCEPTE'
                  ? { label: 'Acceptée',  bg: '#14532d', color: '#4ade80', Icon: CheckCircle }
                  : dem.statut === 'REFUSE'
                  ? { label: 'Refusée',   bg: '#ffffff', color: '#dc2626', border: '1px solid #dc2626', Icon: XCircle }
                  :                        { label: 'En attente', bg: '#fffdf0', color: '#92400e', border: '1px solid #f5c518', Icon: Clock };
                return (
                  <div key={dem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>
                        Demande du {dateStr} {dem.classe_nom && `(${dem.classe_nom})`}
                      </div>
                      {dem.motif_demande && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Motif : {dem.motif_demande}</div>}
                      {dem.statut === 'REFUSE' && dem.motif_refus && <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>Refus : {dem.motif_refus}</div>}
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', background: badge.bg, color: badge.color, border: badge.border || 'none', fontWeight: 700, fontSize: '11px', whiteSpace: 'nowrap' }}>
                      <badge.Icon size={12} /> {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {attestationHistory.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Award size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: '13px' }}>Vous n'avez encore soumis aucune demande d'attestation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttestationTab;
