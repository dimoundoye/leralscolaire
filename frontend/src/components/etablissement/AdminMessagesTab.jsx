import React from 'react';
import { Loader2, Paperclip, Download, Mail, Send } from 'lucide-react';

const AdminMessagesTab = ({
  contactSearchQuery,
  setContactSearchQuery,
  classes,
  messagesAnneeFilter,
  chatChannels,
  activeChatContact,
  handleChatContactClick,
  chatLoading,
  chatHistory,
  user,
  chatEndRef,
  attachedFile,
  setAttachedFile,
  fileInputRef,
  chatFileInputRef,
  handleFileUpload,
  uploadingFile,
  chatInput,
  setChatInput,
  sendChatMessage
}) => {
  return (
    <div className="messages-view" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', height: 'calc(100vh - 120px)', minHeight: '600px' }}>
      {/* Left Panel - Channels / Contacts */}
      <div className="card-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Messagerie Directe</h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <input 
            type="text"
            placeholder="Rechercher classe, enseignant, élève..."
            value={contactSearchQuery}
            onChange={e => setContactSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1.5px solid var(--border)',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filter and render sections */}
        {(() => {
          const q = contactSearchQuery.toLowerCase().trim();
          
          const filteredClasses = classes.filter(c => 
            c.annee_scolaire === messagesAnneeFilter &&
            (!q || c.nom.toLowerCase().includes(q))
          );
          
          const filteredTeachers = (chatChannels.teachers || []).filter(t => {
            if (!q) return true;
            const fullName = `${t.prenom} ${t.nom}`.toLowerCase();
            const email = (t.email || '').toLowerCase();
            return fullName.includes(q) || email.includes(q);
          });
          
          const filteredStudents = (chatChannels.students || []).filter(s => {
            if (!q) return true;
            const fullName = `${s.prenom} ${s.nom}`.toLowerCase();
            const email = (s.email || '').toLowerCase();
            const nationalId = (s.identifiant_national || '').toLowerCase();
            return fullName.includes(q) || email.includes(q) || nationalId.includes(q);
          });

          const hasNoResults = filteredClasses.length === 0 && filteredTeachers.length === 0 && filteredStudents.length === 0;

          if (hasNoResults) {
            return (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--slate-400)', fontSize: '12px' }}>
                Aucun contact trouvé pour "{contactSearchQuery}".
              </div>
            );
          }

          return (
            <>
              {/* Classes Section */}
              {filteredClasses.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--slate-500)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Classes ({filteredClasses.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {filteredClasses.map(c => {
                      const isActive = activeChatContact?.id === c.id && activeChatContact?.type === 'CLASSE';
                      return (
                        <div 
                          key={c.id} 
                          onClick={() => handleChatContactClick({ id: c.id, name: c.nom, type: 'CLASSE' })}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: isActive ? '#f0fdf4' : 'transparent',
                            border: isActive ? '1px solid #bbf7d0' : '1px solid transparent',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          className="chat-contact-item"
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)' }}></div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: isActive ? '#15803d' : 'var(--text-slate-800)' }}>{c.nom}</div>
                            <div style={{ fontSize: '10px', color: 'var(--slate-500)' }}>Diffusion de classe</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Teachers Section */}
              {filteredTeachers.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--slate-500)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Enseignants ({filteredTeachers.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {filteredTeachers.map(t => {
                      const name = t.prenom && t.nom ? `${t.prenom} ${t.nom}` : t.email;
                      const isActive = activeChatContact?.id === t.id && activeChatContact?.type === 'PROFESSEUR';
                      return (
                        <div 
                          key={t.id} 
                          onClick={() => handleChatContactClick({ id: t.id, name, type: 'PROFESSEUR' })}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: isActive ? '#eff6ff' : 'transparent',
                            border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          className="chat-contact-item"
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: isActive ? 'var(--primary-color)' : 'var(--text-slate-800)' }}>{name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--slate-500)' }}>{t.email}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Students Section */}
              {filteredStudents.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--slate-500)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Élèves ({filteredStudents.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {filteredStudents.map(s => {
                      const name = s.prenom && s.nom ? `${s.prenom} ${s.nom}` : s.email;
                      const isActive = activeChatContact?.id === s.id && activeChatContact?.type === 'ELEVE';
                      return (
                        <div 
                          key={s.id} 
                          onClick={() => handleChatContactClick({ id: s.id, name, type: 'ELEVE' })}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: isActive ? '#f8fafc' : 'transparent',
                            border: isActive ? '1px solid #e2e8f0' : '1px solid transparent',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          className="chat-contact-item"
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }}></div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: isActive ? '#334155' : 'var(--text-slate-800)' }}>{name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--slate-500)' }}>{s.email}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Right Panel - Chat window */}
      <div className="card-box" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {activeChatContact ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>{activeChatContact.name}</h4>
                <span style={{ fontSize: '11px', color: 'var(--slate-500)' }}>
                  Canal: {activeChatContact.type === 'PROFESSEUR' ? 'ENSEIGNANT(E)' : activeChatContact.type === 'ELEVE' ? 'ÉLÈVE' : activeChatContact.type}
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fafafa' }}>
              {chatLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Loader2 className="animate-spin text-slate-400" size={24} />
                </div>
              ) : chatHistory.length > 0 ? (
                chatHistory.map(msg => {
                  const isMe = msg.expediteur_id === user?.id;
                  return (
                    <div 
                      key={msg.id} 
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%'
                      }}
                    >
                      <div 
                        style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: isMe ? 'var(--primary-color)' : '#ffffff',
                          color: isMe ? '#ffffff' : 'var(--text-slate-800)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          border: isMe ? 'none' : '1px solid #e2e8f0',
                          fontSize: '13px',
                          lineHeight: 1.4
                        }}
                      >
                        {msg.contenu && <div>{msg.contenu}</div>}
                        {msg.fichier_url && (
                          <div style={{ marginTop: msg.contenu ? '8px' : '0' }}>
                            {/\.(jpg|jpeg|png|gif|webp)$/i.test(msg.fichier_url) ? (
                              <a href={`http://localhost:5002${msg.fichier_url}`} target="_blank" rel="noopener noreferrer">
                                <img 
                                  src={`http://localhost:5002${msg.fichier_url}`} 
                                  alt={msg.fichier_nom || 'Image'} 
                                  style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', objectFit: 'cover', display: 'block', marginTop: '4px' }} 
                                />
                              </a>
                            ) : (
                              <a 
                                href={`http://localhost:5002${msg.fichier_url}`} 
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
                                  color: isMe ? '#fff' : 'var(--primary-color)',
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
                      <span style={{ fontSize: '10px', color: 'var(--slate-400)', marginTop: '4px', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                        {!isMe && <span style={{ fontWeight: 600, marginRight: '4px' }}>{msg.expediteur_role === 'PROFESSEUR' ? 'ENSEIGNANT(E)' : msg.expediteur_nom_complet}</span>}
                        {new Date(msg.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--slate-400)' }}>
                  <Mail size={40} style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px' }}>Aucun message dans cette conversation. Commencez la discussion !</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={sendChatMessage} style={{ padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', background: '#ffffff' }}>
              {attachedFile && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', color: 'var(--primary-color)', fontWeight: 600, alignSelf: 'flex-start' }}>
                  <Paperclip size={12} />
                  <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachedFile.name}</span>
                  <span style={{ cursor: 'pointer', marginLeft: '4px', fontWeight: 'bold' }} onClick={() => setAttachedFile(null)}>✕</span>
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
                  onClick={() => chatFileInputRef.current?.click()}
                  disabled={uploadingFile}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 11px', cursor: 'pointer', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Joindre un fichier"
                >
                  {uploadingFile ? <Loader2 className="animate-spin" size={16} /> : <Paperclip size={18} />}
                </button>
                <input 
                  type="text" 
                  placeholder="Écrivez votre message..." 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-color)', padding: '10px 16px' }}>
                  <Send size={14} /> <span>Envoyer</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--slate-400)' }}>
            <Mail size={48} style={{ marginBottom: '12px' }} />
            <h4 style={{ margin: 0, color: 'var(--text-slate-800)', fontSize: '15px', fontWeight: 800 }}>Aucune conversation sélectionnée</h4>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Choisissez un enseignant ou un élève dans la liste de gauche pour commencer à chatter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessagesTab;
