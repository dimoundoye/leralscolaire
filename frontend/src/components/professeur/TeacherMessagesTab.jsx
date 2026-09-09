import React from 'react';
import {
  MessageSquare, GraduationCap, ChevronLeft, Loader2, Paperclip, Download, X, Mail, Send
} from 'lucide-react';

const TeacherMessagesTab = ({
  activeChatContact,
  setActiveChatContact,
  handleChatContactClick,
  chatChannels,
  profAnneeFilter,
  profile,
  chatLoading,
  chatHistory,
  sendChatMessage,
  attachedFile,
  setAttachedFile,
  fileInputRef,
  handleFileUpload,
  uploadingFile,
  chatInput,
  setChatInput,
  chatEndRef
}) => {
  return (
    <div className="messages-tab-container">
      {/* Left Panel – Channels / Contacts */}
      <div className={`card-box messages-contacts-panel ${activeChatContact ? 'mobile-hide' : ''}`}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} /> Messagerie
        </h3>

        {/* Canal Officiel Office du BAC */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#131e6c', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GraduationCap size={14} /> Examens Nationaux
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              onClick={() => handleChatContactClick({ id: 'OFFICE_BAC', name: 'Office du Baccalauréat du Sénégal', type: 'OFFICE_BAC' })}
              style={{
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                background: activeChatContact?.type === 'OFFICE_BAC' ? '#131e6c15' : '#f8fafc',
                border: activeChatContact?.type === 'OFFICE_BAC' ? '1.5px solid #131e6c' : '1px solid #cbd5e1',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#131e6c', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#131e6c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Office du BAC
                  {profile?.is_president_jury && (
                    <span style={{ fontSize: '9px', background: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontWeight: 900 }}>
                      🎖️ Président
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Convocations & Accès temporaires</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admins by school */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.06em', marginBottom: '8px' }}>Administrateurs</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {chatChannels.etablissements?.map(etab => {
              const isActive = activeChatContact?.id === etab.admin_id && activeChatContact?.type === 'ADMIN';
              return (
                <div
                  key={etab.etablissement_id}
                  onClick={() => handleChatContactClick({ id: etab.admin_id, name: `Admin – ${etab.etablissement_nom}`, type: 'ADMIN', etablissement_id: etab.etablissement_id })}
                  style={{
                    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                    background: isActive ? '#eff6ff' : 'transparent',
                    border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-blue)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: isActive ? 'var(--primary-blue)' : 'var(--text-slate-800)' }}>
                      {etab.etablissement_nom}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-slate-500)' }}>Admin de l'établissement</div>
                  </div>
                </div>
              );
            })}
            {(!chatChannels.etablissements || chatChannels.etablissements.length === 0) && (
              <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', fontStyle: 'italic' }}>Aucun établissement associé.</p>
            )}
          </div>
        </div>

        {/* Classes */}
        <div>
          <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Classes ({profAnneeFilter})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {(() => {
              const yearClasses = (chatChannels.classes || []).filter(cl => 
                !profAnneeFilter || !cl.annee_scolaire || cl.annee_scolaire === profAnneeFilter
              );
              const displayClasses = yearClasses.length > 0 ? yearClasses : (chatChannels.classes || []);

              return displayClasses.length > 0 ? displayClasses.map(cl => {
                const isActive = activeChatContact?.id === cl.classe_id && activeChatContact?.type === 'CLASSE';
                return (
                  <div
                    key={cl.classe_id}
                    onClick={() => handleChatContactClick({ 
                      id: cl.classe_id, 
                      name: `${cl.classe_nom} (${cl.annee_scolaire || ''}) – ${cl.etablissement_nom}`, 
                      type: 'CLASSE', 
                      etablissement_id: cl.etablissement_id 
                    })}
                    style={{
                      padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                      background: isActive ? '#f0fdf4' : 'transparent',
                      border: isActive ? '1px solid #bbf7d0' : '1px solid transparent',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: '10px'
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: isActive ? '#15803d' : 'var(--text-slate-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{cl.classe_nom}</span>
                        {cl.annee_scolaire && (
                          <span style={{ fontSize: '10px', background: 'rgba(21, 128, 61, 0.1)', color: '#15803d', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                            {cl.annee_scolaire}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-slate-500)' }}>{cl.etablissement_nom}</div>
                    </div>
                  </div>
                );
              }) : (
                <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', fontStyle: 'italic' }}>Aucune classe disponible pour {profAnneeFilter}.</p>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Right Panel – Chat window */}
      <div className={`card-box messages-chat-panel ${!activeChatContact ? 'mobile-hide' : ''}`}>
        {activeChatContact ? (
          <>
            {/* Header with back button on mobile */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveChatContact(null)}
                className="mobile-back-btn"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 6px', borderRadius: '6px',
                  color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', fontWeight: 700, flexShrink: 0,
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 800, flexShrink: 0 }}>
                {activeChatContact.name[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeChatContact.name}</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-slate-500)' }}>
                  {activeChatContact.type === 'ADMIN' ? 'Canal Administrateur' : 'Canal de Classe'}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fafafa' }}>
              {chatLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
                  <Loader2 className="animate-spin" size={24} color="var(--primary-blue)" />
                </div>
              ) : chatHistory.length > 0 ? chatHistory.map(msg => {
                const isMe = String(msg.expediteur_id) === String(profile?.id);
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: '12px',
                      background: isMe ? 'var(--primary-blue)' : '#ffffff',
                      color: isMe ? '#fff' : 'var(--text-slate-800)',
                      border: isMe ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      fontSize: '13px', lineHeight: 1.4
                    }}>
                      {msg.contenu && <div>{msg.contenu}</div>}
                      {msg.fichier_url && (
                        <div style={{ marginTop: msg.contenu ? '8px' : '0' }}>
                          {/\.(jpg|jpeg|png|gif|webp)$/i.test(msg.fichier_url) ? (
                            <a href={`${msg.fichier_url}`} target="_blank" rel="noopener noreferrer">
                              <img 
                                src={`${msg.fichier_url}`} 
                                alt={msg.fichier_nom || 'Image'} 
                                style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', objectFit: 'cover', display: 'block', marginTop: '4px' }} 
                              />
                            </a>
                          ) : (
                            <a 
                              href={`${msg.fichier_url}`} 
                              target="_blank" 
                              download={msg.fichier_nom}
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: isMe ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                                color: isMe ? '#fff' : 'var(--primary-blue)',
                                textDecoration: 'none',
                                fontSize: '12px',
                                fontWeight: 600,
                                marginTop: '4px'
                              }}
                            >
                              <Paperclip size={14} />
                              <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {msg.fichier_nom || 'Fichier joint'}
                              </span>
                              <Download size={13} style={{ marginLeft: '4px' }} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', marginTop: '4px', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                      {!isMe && <span style={{ fontWeight: 600, marginRight: '4px' }}>{msg.expediteur_role === 'PROFESSEUR' ? 'ENSEIGNANT(E)' : msg.expediteur_nom_complet}</span>}
                      {new Date(msg.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              }) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-slate-400)' }}>
                  <Mail size={40} style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px' }}>Commencez la discussion !</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendChatMessage} style={{ padding: '12px 14px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', background: '#ffffff' }}>
              {attachedFile && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', color: 'var(--primary-blue)', fontWeight: 600, alignSelf: 'flex-start' }}>
                  <Paperclip size={12} />
                  <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachedFile.name}</span>
                  <X size={14} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => setAttachedFile(null)} />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 11px', cursor: 'pointer', color: 'var(--text-slate-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Joindre un fichier"
                >
                  {uploadingFile ? <Loader2 className="animate-spin" size={16} /> : <Paperclip size={18} />}
                </button>
                <input
                  type="text"
                  placeholder="Votre message..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', minWidth: 0 }}
                />
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 14px', flexShrink: 0 }}>
                  <Send size={14} /> <span className="hide-on-mobile">Envoyer</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-slate-400)' }}>
            <MessageSquare size={48} style={{ marginBottom: '12px' }} />
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-slate-700)' }}>Choisissez un canal</h4>
            <p style={{ fontSize: '12px', marginTop: '4px', textAlign: 'center', maxWidth: '260px' }}>
              Sélectionnez un administrateur d'établissement ou une classe dans la liste de gauche pour commencer à communiquer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMessagesTab;
