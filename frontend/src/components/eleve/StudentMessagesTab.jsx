import React from 'react';
import {
  MessageSquare, Users, UserCheck, Building2, Bell, Paperclip, Download, X, Send
} from 'lucide-react';

const StudentMessagesTab = ({
  chatChannelInfo,
  activeChatTarget,
  setActiveChatTarget,
  fetchChatHistory,
  messages,
  chatLoading,
  chatHistory,
  user,
  selectedFile,
  setSelectedFile,
  sendChatMessage,
  handleFileUpload,
  uploadingFile,
  chatInput,
  setChatInput,
  chatEndRef,
  API_BASE_URL
}) => {
  const admin = chatChannelInfo?.admin;
  const classe = chatChannelInfo?.classe;
  const teachers = chatChannelInfo?.teachers || [];

  const handleSelectTarget = (target) => {
    setActiveChatTarget(target);
    fetchChatHistory(target);
  };

  return (
    <div className="tab-pane">
      
      {/* Messages Main Layout */}
      <div className="messages-layout-full card-box">
        
        {/* Left Column: Channels & Contacts List */}
        <div className="msg-channels-sidebar">
          <div className="msg-sidebar-header">
            <h3><MessageSquare size={18} /> Canaux & Messagerie</h3>
            <span>Sélectionnez une discussion</span>
          </div>

          <div className="msg-channels-list">
            
            {/* 1. CANAL DE CLASSE */}
            {classe && (
              <div className="channel-group">
                <span className="group-label">GROUPE DE CLASSE</span>
                <button 
                  type="button"
                  className={`channel-item ${activeChatTarget?.type === 'CLASSE' ? 'active' : ''}`}
                  onClick={() => handleSelectTarget({
                    type: 'CLASSE',
                    target_id: classe.classe_id,
                    title: `Canal de Groupe ${classe.classe_nom}`,
                    sub: `Discussion de la classe • ${classe.annee_scolaire}`,
                    badge: 'Groupe'
                  })}
                >
                  <div className="chan-icon-box chan-classe">
                    <Users size={18} />
                  </div>
                  <div className="chan-meta">
                    <span className="chan-name">Canal {classe.classe_nom}</span>
                    <span className="chan-sub">Élèves & Enseignants</span>
                  </div>
                </button>
              </div>
            )}

            {/* 2. MES ENSEIGNANTS */}
            {teachers.length > 0 && (
              <div className="channel-group">
                <span className="group-label">MES PROFESSEURS</span>
                {teachers.map(t => (
                  <button 
                    key={t.user_id}
                    type="button"
                    className={`channel-item ${activeChatTarget?.type === 'PROFESSEUR' && activeChatTarget?.target_id === t.user_id ? 'active' : ''}`}
                    onClick={() => handleSelectTarget({
                      type: 'PROFESSEUR',
                      target_id: t.user_id,
                      title: `Prof. ${t.prenom || ''} ${t.nom || 'Enseignant'}`,
                      sub: t.matiere_nom ? `Enseignant de ${t.matiere_nom}` : 'Professeur',
                      badge: 'Prof'
                    })}
                  >
                    <div className="chan-icon-box chan-prof">
                      <UserCheck size={18} />
                    </div>
                    <div className="chan-meta">
                      <span className="chan-name">Prof. {t.prenom ? `${t.prenom} ${t.nom}` : (t.nom || 'Enseignant')}</span>
                      <span className="chan-sub">{t.matiere_nom || 'Discipline'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 3. ADMINISTRATION */}
            {admin && (
              <div className="channel-group">
                <span className="group-label">ÉTABLISSEMENT</span>
                <button 
                  type="button"
                  className={`channel-item ${activeChatTarget?.type === 'ADMIN' ? 'active' : ''}`}
                  onClick={() => handleSelectTarget({
                    type: 'ADMIN',
                    target_id: admin.admin_user_id,
                    etablissement_id: admin.etablissement_id,
                    title: admin.etablissement_nom,
                    sub: "Administration de l'établissement",
                    badge: 'Admin'
                  })}
                >
                  <div className="chan-icon-box chan-admin">
                    <Building2 size={18} />
                  </div>
                  <div className="chan-meta">
                    <span className="chan-name">{admin.etablissement_nom}</span>
                    <span className="chan-sub">Administration</span>
                  </div>
                </button>
              </div>
            )}

            {/* 4. ANNONCES & DIFFUSIONS */}
            <div className="channel-group">
              <span className="group-label">DIFFUSIONS & ANNONCES</span>
              <button 
                type="button"
                className={`channel-item ${activeChatTarget?.type === 'BROADCAST' ? 'active' : ''}`}
                onClick={() => handleSelectTarget({
                  type: 'BROADCAST',
                  target_id: 'broadcast',
                  title: 'Diffusions & Annonces Officielles',
                  sub: 'Messages généraux envoyés aux élèves',
                  badge: 'Annonces'
                })}
              >
                <div className="chan-icon-box chan-bell">
                  <Bell size={18} />
                </div>
                <div className="chan-meta">
                  <span className="chan-name">Annonces Officielles</span>
                  <span className="chan-sub">{messages.length} message(s) reçu(s)</span>
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Active Conversation Panel */}
        <div className="msg-chat-panel">
          {activeChatTarget ? (
            <>
              {/* Chat Panel Header */}
              <div className="chat-panel-header">
                <div className="chat-target-info">
                  <div className="target-avatar">
                    {activeChatTarget.type === 'CLASSE' && <Users size={20} />}
                    {activeChatTarget.type === 'PROFESSEUR' && <UserCheck size={20} />}
                    {activeChatTarget.type === 'ADMIN' && <Building2 size={20} />}
                    {activeChatTarget.type === 'BROADCAST' && <Bell size={20} />}
                  </div>
                  <div>
                    <h4>{activeChatTarget.title}</h4>
                    <span>{activeChatTarget.sub}</span>
                  </div>
                </div>
                <span className="target-badge-pill">{activeChatTarget.badge || 'Discussion'}</span>
              </div>

              {/* Chat Messages Body */}
              <div className="chat-messages-body">
                {activeChatTarget.type === 'BROADCAST' ? (
                  /* Broadcast Notifications Feed */
                  <div className="broadcast-feed">
                    {messages.length > 0 ? (
                      messages.map(msg => (
                        <div key={msg.id} className={`broadcast-card ${msg.lu ? 'read' : 'unread'}`}>
                          <div className="broadcast-card-header">
                            <strong>{msg.sujet}</strong>
                            <span className="broadcast-date">
                              {new Date(msg.date_envoi).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="broadcast-sender">De : <strong>{msg.expediteur_nom_complet || msg.expediteur_nom}</strong></p>
                          <p className="broadcast-content">{msg.contenu}</p>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state py-8">
                        <Bell size={40} className="text-gray" />
                        <p>Aucune annonce officielle reçue pour le moment.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Interactive Chat Feed */
                  <>
                    {chatLoading ? (
                      <div className="chat-loading-spinner">
                        <span>Chargement des messages...</span>
                      </div>
                    ) : chatHistory.length > 0 ? (
                      chatHistory.map(msg => {
                        const isMe = String(msg.expediteur_id) === String(user?.id);
                        return (
                          <div key={msg.id} className={`chat-msg-row ${isMe ? 'me' : 'other'}`}>
                            <div className="chat-msg-bubble">
                              {!isMe && (
                                <span className="msg-sender-name">
                                  {msg.expediteur_role === 'PROFESSEUR' ? 'Prof. ' : ''}{msg.expediteur_nom_complet || msg.expediteur_nom}
                                </span>
                              )}
                              <p className="msg-text">{msg.contenu}</p>
                              {msg.fichier_url && (
                                <a 
                                  href={`${API_BASE_URL.replace('/api', '')}${msg.fichier_url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`msg-file-attachment ${isMe ? 'file-me' : 'file-other'}`}
                                >
                                  <Paperclip size={13} />
                                  <span className="file-name">{msg.fichier_nom || 'Fichier joint'}</span>
                                  <Download size={12} />
                                </a>
                              )}
                              <span className="msg-timestamp">
                                {new Date(msg.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-state py-8">
                        <MessageSquare size={40} className="text-gray" />
                        <p>Aucun message échangé dans cette discussion.</p>
                        <span className="sub-empty">Posez une question ou démarrez l'échange !</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Chat Form Footer */}
              {activeChatTarget.type !== 'BROADCAST' && (
                <div className="chat-footer-wrapper">
                  {selectedFile && (
                    <div className="selected-file-pill">
                      <Paperclip size={13} />
                      <span className="file-pill-name">{selectedFile.fichier_nom}</span>
                      <button type="button" onClick={() => setSelectedFile(null)} className="remove-file-btn">
                        <X size={13} />
                      </button>
                    </div>
                  )}
                  <form onSubmit={sendChatMessage} className="chat-input-footer">
                    <label className="file-upload-btn" title="Joindre un fichier (PDF, image, doc...)">
                      <Paperclip size={18} />
                      <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploadingFile} />
                    </label>
                    <input
                      type="text"
                      placeholder={uploadingFile ? "Téléchargement du fichier..." : `Écrire un message dans ${activeChatTarget.title}...`}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      disabled={uploadingFile}
                    />
                    <button type="submit" className="primary-btn chat-send-btn" disabled={uploadingFile}>
                      <Send size={15} /> Envoyer
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state py-12">
              <MessageSquare size={48} className="text-gray" />
              <p>Sélectionnez un canal dans le menu de gauche pour démarrer la discussion.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default StudentMessagesTab;
