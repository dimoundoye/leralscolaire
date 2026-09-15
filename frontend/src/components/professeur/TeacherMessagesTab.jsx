import React, { useState, useEffect } from 'react';
import {
  MessageSquare, GraduationCap, ChevronLeft, ChevronDown, ChevronRight, Loader2, Paperclip, Download, X, Mail, Send, User, Users
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
  const [expandedClasses, setExpandedClasses] = useState({});
  const [classSearch, setClassSearch] = useState({});

  const toggleClassExpand = (classeId, e) => {
    e?.stopPropagation();
    setExpandedClasses(prev => ({
      ...prev,
      [classeId]: !prev[classeId]
    }));
  };

  // Auto-expand class when an active contact belongs to it
  useEffect(() => {
    if (activeChatContact?.type === 'CLASSE' && activeChatContact.id) {
      setExpandedClasses(prev => ({ ...prev, [activeChatContact.id]: true }));
    } else if (activeChatContact?.type === 'ELEVE') {
      const student = (chatChannels.students || []).find(s => s.user_id === activeChatContact.id);
      if (student?.classe_id) {
        setExpandedClasses(prev => ({ ...prev, [student.classe_id]: true }));
      }
    }
  }, [activeChatContact, chatChannels.students]);
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

        {/* Classes & Élèves (Format Accordéon) */}
        <div>
          <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} /> Classes & Élèves ({profAnneeFilter || 'Toutes'})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(() => {
              const yearClasses = (chatChannels.classes || []).filter(cl => 
                !profAnneeFilter || !cl.annee_scolaire || cl.annee_scolaire === profAnneeFilter
              );
              const displayClasses = yearClasses.length > 0 ? yearClasses : (chatChannels.classes || []);

              if (displayClasses.length === 0) {
                return (
                  <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', fontStyle: 'italic' }}>
                    Aucune classe disponible pour {profAnneeFilter}.
                  </p>
                );
              }

              return displayClasses.map(cl => {
                const isExpanded = !!expandedClasses[cl.classe_id];
                const isClassActive = activeChatContact?.id === cl.classe_id && activeChatContact?.type === 'CLASSE';
                
                // Élèves de cette classe
                const classStudents = (chatChannels.students || []).filter(s => s.classe_id === cl.classe_id);
                const q = (classSearch[cl.classe_id] || '').toLowerCase().trim();
                const filteredClassStudents = q
                  ? classStudents.filter(s => (s.prenom?.toLowerCase().includes(q) || s.nom?.toLowerCase().includes(q)))
                  : classStudents;

                return (
                  <div
                    key={cl.classe_id}
                    style={{
                      border: isClassActive ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      background: '#ffffff',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease-in-out',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* En-tête de la classe cliquable pour déplier/replier */}
                    <div
                      onClick={() => toggleClassExpand(cl.classe_id)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        background: isExpanded ? '#f8fafc' : '#ffffff',
                        borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: '#dcfce7',
                          color: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '11px',
                          flexShrink: 0
                        }}>
                          {cl.classe_nom?.slice(0, 3)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cl.classe_nom}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cl.etablissement_nom || 'Établissement'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '10px',
                          background: classStudents.length > 0 ? '#eff6ff' : '#f1f5f9',
                          color: classStudents.length > 0 ? '#2563eb' : '#94a3b8'
                        }}>
                          {classStudents.length} {classStudents.length > 1 ? 'élèves' : 'élève'}
                        </span>
                        <div style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* Contenu déroulant de la classe */}
                    {isExpanded && (
                      <div style={{ padding: '8px 10px', background: '#fafbfc' }}>
                        
                        {/* 1. Bouton Canal Collectif de la classe */}
                        <div
                          onClick={() => handleChatContactClick({
                            id: cl.classe_id,
                            name: `${cl.classe_nom} (${cl.annee_scolaire || ''}) – ${cl.etablissement_nom}`,
                            type: 'CLASSE',
                            etablissement_id: cl.etablissement_id
                          })}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: isClassActive ? '#dcfce7' : '#ffffff',
                            border: isClassActive ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                            marginBottom: '8px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: isClassActive ? '#15803d' : '#1e293b' }}>
                              📢 Canal de Groupe {cl.classe_nom}
                            </div>
                            <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                              Message public à toute la classe
                            </div>
                          </div>
                        </div>

                        {/* 2. Sous-en-tête Élèves */}
                        <div style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: '#94a3b8',
                          letterSpacing: '0.05em',
                          margin: '6px 2px 4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span>Élèves individuels</span>
                          <span>{classStudents.length}</span>
                        </div>

                        {/* Barre de recherche si plus de 4 élèves */}
                        {classStudents.length > 4 && (
                          <input
                            type="text"
                            placeholder="Rechercher dans cette classe..."
                            value={classSearch[cl.classe_id] || ''}
                            onChange={(e) => setClassSearch({ ...classSearch, [cl.classe_id]: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: '100%',
                              padding: '5px 8px',
                              fontSize: '11px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              marginBottom: '6px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        )}

                        {/* Liste des élèves */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '190px', overflowY: 'auto' }}>
                          {filteredClassStudents.length > 0 ? (
                            filteredClassStudents.map(stud => {
                              const isStudentActive = activeChatContact?.id === stud.user_id && activeChatContact?.type === 'ELEVE';
                              return (
                                <div
                                  key={stud.user_id}
                                  onClick={() => handleChatContactClick({
                                    id: stud.user_id,
                                    name: `${stud.prenom} ${stud.nom}`,
                                    classe_nom: cl.classe_nom,
                                    type: 'ELEVE',
                                    etablissement_id: stud.etablissement_id,
                                    photo_url: stud.photo_url
                                  })}
                                  style={{
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: isStudentActive ? '#eff6ff' : 'transparent',
                                    border: isStudentActive ? '1px solid #93c5fd' : '1px solid transparent',
                                    transition: 'all 0.1s'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isStudentActive) e.currentTarget.style.background = '#f1f5f9';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isStudentActive) e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  {stud.photo_url ? (
                                    <img
                                      src={stud.photo_url}
                                      alt=""
                                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                    />
                                  ) : (
                                    <div style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      background: '#059669',
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      flexShrink: 0
                                    }}>
                                      {(stud.prenom?.[0] || '') + (stud.nom?.[0] || '')}
                                    </div>
                                  )}
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{
                                      fontSize: '12px',
                                      fontWeight: isStudentActive ? 700 : 500,
                                      color: isStudentActive ? '#1d4ed8' : '#334155',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}>
                                      {stud.prenom} {stud.nom}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', padding: '4px', margin: 0 }}>
                              {q ? 'Aucun élève trouvé' : 'Aucun élève inscrit dans cette classe'}
                            </p>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                );
              });
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
              {activeChatContact.photo_url ? (
                <img src={activeChatContact.photo_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: activeChatContact.type === 'ELEVE' ? '#059669' : 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 800, flexShrink: 0 }}>
                  {activeChatContact.name[0]}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeChatContact.name}</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-slate-500)' }}>
                  {activeChatContact.type === 'ADMIN' ? 'Canal Administrateur' : activeChatContact.type === 'ELEVE' ? `Discussion Élève • ${activeChatContact.classe_nom || 'Classe'}` : activeChatContact.type === 'OFFICE_BAC' ? 'Office du Baccalauréat' : 'Canal de Classe'}
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
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-slate-700)' }}>Choisissez une discussion</h4>
            <p style={{ fontSize: '12px', marginTop: '4px', textAlign: 'center', maxWidth: '280px' }}>
              Sélectionnez un élève, une classe ou l'administration dans la liste de gauche pour échanger en direct.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMessagesTab;
