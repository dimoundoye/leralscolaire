import React from 'react';
import { Check, X } from 'lucide-react';

const TeacherInvitationsTab = ({
  invitations,
  handleRespondInvitation
}) => {
  return (
    <div className="tab-pane">
      <div className="card-box">
        <h3>Invitations reçues</h3>
        <p className="subtitle" style={{ fontSize: '12px', color: 'var(--text-slate-500)', marginBottom: '20px' }}>
          Les invitations envoyées par les directeurs d'écoles s'affichent ici. Acceptez-les pour intégrer leurs équipes et consolider vos créneaux de cours.
        </p>

        {invitations.length > 0 ? (
          <div>
            {invitations.map(inv => (
              <div key={inv.etablissement_id} className="list-item-invite">
                <div className="invite-details">
                  <h4>{inv.etablissement_nom}</h4>
                  <p> Ville : {inv.ville} | Région : {inv.region}</p>
                  <p style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-slate-500)' }}>Reçue le : {new Date(inv.date_invitation).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="invite-actions">
                  <button className="btn-sm accept" onClick={() => handleRespondInvitation(inv.etablissement_id, true)}>
                    <Check size={12} /> Accepter
                  </button>
                  <button className="btn-sm refuse" onClick={() => handleRespondInvitation(inv.etablissement_id, false)}>
                    <X size={12} /> Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-slate-500)', fontSize: '13px' }}>
            Aucune invitation en attente.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherInvitationsTab;
