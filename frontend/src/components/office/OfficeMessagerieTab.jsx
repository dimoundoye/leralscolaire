import React from 'react';
import {
  RefreshCw, UserCheck, School, Users, Check, Send, Inbox
} from 'lucide-react';

export const OfficeMessagerieTab = ({
  messagesList = [],
  selectedChannelCategory,
  setSelectedChannelCategory,
  newMsgForm,
  setNewMsgForm,
  professeursList = [],
  etablissements = [],
  fetchMessagesOffice,
  handleSendOfficeMessage
}) => {
  const filteredMsgs = messagesList.filter(m => {
    if (selectedChannelCategory === 'PROFESSEUR') return m.destinataire_type === 'PROFESSEUR' || m.destinataire_type === 'ALL_PROFESSEURS' || m.expediteur_role === 'PROFESSEUR';
    if (selectedChannelCategory === 'ETABLISSEMENT') return m.destinataire_type === 'ADMIN_ETABLISSEMENT' || m.destinataire_type === 'ALL_ETABLISSEMENTS' || m.expediteur_role === 'ADMIN_ETABLISSEMENT';
    if (selectedChannelCategory === 'ELEVE') return m.destinataire_type === 'ELEVE' || m.expediteur_role === 'ELEVE';
    return true;
  });

  return (
    <div className="ob-tab-pane">
      <div className="ob-page-header">
        <div>
          <h2>Messagerie Officielle &amp; Circulaires Nationales</h2>
          <p>Canal de communication direct de l'Office du BAC avec les Établissements, Enseignants et Élèves</p>
        </div>
        <button className="ob-btn ob-btn-ghost" onClick={fetchMessagesOffice}><RefreshCw size={15} /> Actualiser</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        {/* COLONNE GAUCHE : CANAUX & NOUVEAU MESSAGE */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>Canaux de Messagerie :</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {[
              { id: 'PROFESSEUR', label: ' Enseignants & Présidents', icon: <UserCheck size={16} />, color: '#7c3aed' },
              { id: 'ETABLISSEMENT', label: ' Établissements (Proviseurs)', icon: <School size={16} />, color: '#131e6c' },
              { id: 'ELEVE', label: ' Élèves / Candidats', icon: <Users size={16} />, color: '#0284c7' }
            ].map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => { setSelectedChannelCategory(cat.id); setNewMsgForm(f => ({ ...f, destinataire_type: cat.id })); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 10,
                  border: selectedChannelCategory === cat.id ? `2px solid ${cat.color}` : '1px solid #e2e8f0',
                  background: selectedChannelCategory === cat.id ? `${cat.color}10` : '#f8fafc',
                  color: selectedChannelCategory === cat.id ? cat.color : '#334155',
                  fontWeight: 800, fontSize: 12, cursor: 'pointer'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{cat.icon} {cat.label}</span>
                {selectedChannelCategory === cat.id && <Check size={14} />}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendOfficeMessage} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, padding: '14px' }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Send size={14} /> Envoyer un Message / Circulaire
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Destinataire Spécifique :</label>
              {selectedChannelCategory === 'PROFESSEUR' ? (
                <select
                  value={newMsgForm.destinataire_id}
                  onChange={e => setNewMsgForm(f => ({ ...f, destinataire_id: e.target.value }))}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 11 }}
                >
                  <option value="">Tous les Enseignants ({professeursList.length})</option>
                  {professeursList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.prenom} {p.nom} ({p.discipline || 'Matière'})
                    </option>
                  ))}
                </select>
              ) : selectedChannelCategory === 'ETABLISSEMENT' ? (
                <select
                  value={newMsgForm.destinataire_id}
                  onChange={e => setNewMsgForm(f => ({ ...f, destinataire_id: e.target.value }))}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 11 }}
                >
                  <option value="">Tous les Établissements ({etablissements.length})</option>
                  {etablissements.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nom} ({e.region})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  placeholder="Identifiant Élève (Optionnel)"
                  value={newMsgForm.destinataire_id}
                  onChange={e => setNewMsgForm(f => ({ ...f, destinataire_id: e.target.value }))}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 11 }}
                />
              )}
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Sujet du Message *</label>
              <input
                placeholder="ex: Circulaire officielle relative aux délibérations BAC"
                value={newMsgForm.sujet}
                onChange={e => setNewMsgForm(f => ({ ...f, sujet: e.target.value }))}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 11 }}
                required
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Contenu Officiel *</label>
              <textarea
                rows={4}
                placeholder="Rédigez votre instruction ou convocation..."
                value={newMsgForm.contenu}
                onChange={e => setNewMsgForm(f => ({ ...f, contenu: e.target.value }))}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 11, resize: 'vertical' }}
                required
              />
            </div>

            <button type="submit" className="ob-btn ob-btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
              <Send size={14} /> Expédier le Message
            </button>
          </form>
        </div>

        {/* COLONNE DROITE : LISTE ET HISTORIQUE DES MESSAGES */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span> Historique des Échanges — Canal {selectedChannelCategory}</span>
            <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '2px 10px', borderRadius: 12, fontWeight: 800 }}>
              {filteredMsgs.length} Message(s)
            </span>
          </div>

          {filteredMsgs.length === 0 ? (
            <div className="ob-empty"><Inbox size={48} /><p>Aucun message dans ce canal pour le moment.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredMsgs.map(m => (
                <div key={m.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, padding: '14px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 13, color: '#131e6c' }}>{m.expediteur_nom_complet || m.expediteur_nom}</strong>
                      
                      {m.president_jury_badge && (
                        <span style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 6px rgba(245, 158, 11, 0.4)' }}>
                          {m.president_jury_badge}
                        </span>
                      )}

                      <span style={{ fontSize: 10, background: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: 4 }}>
                        {m.expediteur_role || 'UTILISATEUR'}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      {new Date(m.date_envoi).toLocaleDateString('fr-FR')} {new Date(m.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{m.sujet}</div>
                  <div style={{ fontSize: 12, color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{m.contenu}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficeMessagerieTab;
