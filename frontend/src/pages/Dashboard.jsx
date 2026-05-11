import React, { useEffect, useState, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpenCheck, 
  Settings, 
  LogOut, 
  Search, 
  Bell,
  GraduationCap,
  TrendingUp,
  School,
  Plus,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  FileDown,
  FileUp,
  Brain,
  Send,
  Mail,
  Printer,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const scanInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [notesGrid, setNotesGrid] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Modal states
  const [showClassModal, setShowClassModal] = useState(false);
  const [showEleveModal, setShowEleveModal] = useState(false);
  const [showProfModal, setShowProfModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({ nom: '', region: '', ville: '', code_etablissement: '' });
  const [profs, setProfs] = useState([]);

  // Form states
  const [newClass, setNewClass] = useState({ nom: '', niveau: '6ème', annee_scolaire: '2025-2026' });
  const [newEleve, setNewEleve] = useState({ nom: '', prenom: '', date_naissance: '', classe_id: '' });
  const [newProf, setNewProf] = useState({ email: '', password: '' });
  const [newMessage, setNewMessage] = useState({ destinataire_type: 'CLASSE', destinataire_id: '', sujet: '', contenu: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      fetchAllData();
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const fetchAllData = () => {
    fetchClasses();
    fetchEleves();
    fetchMatieres();
    fetchProfs();
    fetchProfile();
    fetchMessages();
  };

  const fetchClasses = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setClasses(data);
    } catch (err) { console.error(err); }
  };

  const fetchEleves = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/eleves', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setEleves(data);
    } catch (err) { console.error(err); }
  };

  const fetchMatieres = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/notes/matieres', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMatieres(data);
    } catch (err) { console.error(err); }
  };

  const fetchProfs = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/professeurs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setProfs(data);
    } catch (err) { console.error(err); }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/etablissement/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setProfile(data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/messages/inbox', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (err) { console.error(err); }
  };

  const fetchNotesGrid = async (classeId, matiereId) => {
    if (!classeId || !matiereId) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/notes/classe/${classeId}/matiere/${matiereId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setNotesGrid(data.map(item => ({ ...item, note: item.note || '' })));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedClasse && selectedMatiere) {
      fetchNotesGrid(selectedClasse, selectedMatiere);
    }
  }, [selectedClasse, selectedMatiere]);

  const handleAddClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newClass)
      });
      if (res.ok) {
        setShowClassModal(false);
        setNewClass({ nom: '', niveau: '6ème', annee_scolaire: '2025-2026' });
        fetchClasses();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/notes/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          notes: notesGrid.map(n => ({ eleve_id: n.eleve_id, valeur: n.note })),
          matiere_id: selectedMatiere,
          semestre: 1
        })
      });
      if (res.ok) alert('Notes enregistrées avec succès !');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleExportExcel = async () => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5002/api/eleves/export?token=${token}`, '_blank');
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/eleves/import', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchEleves();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleScanStudents = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/ai/scan-students', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Noms détectés: ${data.names.join(', ')}`);
        // Ici on pourrait ouvrir un modal pour confirmer l'inscription
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleGenerateBulletin = async (eleveId) => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5002/api/documents/bulletin/${eleveId}?token=${token}`, '_blank');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newMessage)
      });
      if (res.ok) {
        alert('Message envoyé !');
        setShowMessageModal(false);
        setNewMessage({ destinataire_type: 'CLASSE', destinataire_id: '', sujet: '', contenu: '' });
        fetchMessages();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAddEleve = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/eleves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newEleve)
      });
      if (res.ok) {
        setShowEleveModal(false);
        setNewEleve({ nom: '', prenom: '', date_naissance: '', classe_id: '' });
        fetchEleves();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAddProf = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/professeurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newProf)
      });
      if (res.ok) {
        setShowProfModal(false);
        setNewProf({ email: '', password: '' });
        fetchProfs();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/etablissement/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      if (res.ok) alert('Profil mis à jour !');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <div className={`dashboard-layout ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">SN</div>
          {!isCollapsed && <span>Leral<span className="text-orange">Scolaire</span></span>}
        </div>

        <button className="collapse-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /> {!isCollapsed && <span>Aperçu</span>}
          </button>
          <button className={`nav-item ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => setActiveTab('classes')}>
            <School size={20} /> {!isCollapsed && <span>Mes Classes</span>}
          </button>
          <button className={`nav-item ${activeTab === 'eleves' ? 'active' : ''}`} onClick={() => setActiveTab('eleves')}>
            <Users size={20} /> {!isCollapsed && <span>Liste des Élèves</span>}
          </button>
          <button className={`nav-item ${activeTab === 'profs' ? 'active' : ''}`} onClick={() => setActiveTab('profs')}>
            <User size={20} /> {!isCollapsed && <span>Corps Enseignant</span>}
          </button>
          <button className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            <BookOpenCheck size={20} /> {!isCollapsed && <span>Notes & Bulletins</span>}
          </button>
          <button className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
            <Mail size={20} /> {!isCollapsed && <span>Messagerie</span>}
          </button>
          <div className="nav-divider"></div>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> {!isCollapsed && <span>Paramètres</span>}
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> {!isCollapsed && <span>Déconnexion</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Rechercher..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Bell size={20} /></button>
            <div className="user-profile">
              <div className="user-avatar">{user.email[0].toUpperCase()}</div>
              <div className="user-info">
                <p className="user-name">{profile.nom || 'Admin Etablissement'}</p>
                <p className="user-role">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="content-inner">
          {activeTab === 'overview' && (
            <>
              <div className="welcome-section">
                <h1>Tableau de Bord</h1>
                <div className="flex gap-2">
                  <button className="btn btn-outline" onClick={() => setShowMessageModal(true)}><Send size={18} /> Envoyer Message</button>
                  <button className="btn btn-primary" onClick={() => setShowEleveModal(true)}><Plus size={18} /> Inscrire un Élève</button>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue"><Users /></div>
                  <div className="stat-details"><p>Total Élèves</p><h3>{eleves.length}</h3></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange"><GraduationCap /></div>
                  <div className="stat-details"><p>Classes</p><h3>{classes.length}</h3></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple"><User /></div>
                  <div className="stat-details"><p>Professeurs</p><h3>{profs.length}</h3></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><TrendingUp /></div>
                  <div className="stat-details"><p>Taux Réussite</p><h3>78%</h3></div>
                </div>
              </div>

              <div className="welcome-section">
                <h2>Activités Récentes</h2>
              </div>
              <div className="table-container">
                 <div className="p-4"><p className="text-muted">Aucune activité récente à afficher.</p></div>
              </div>
            </>
          )}

          {activeTab === 'classes' && (
            <div className="classes-view">
              <div className="welcome-section">
                <h1>Gestion des Classes</h1>
                <button className="btn btn-primary" onClick={() => setShowClassModal(true)}><Plus size={18} /> Nouvelle Classe</button>
              </div>
              <div className="classes-grid">
                {classes.map(c => (
                  <div key={c.id} className="class-card">
                    <div className="class-card-header">
                      <div className="class-icon"><School size={24} /></div>
                      <div className="class-meta"><h4>{c.nom}</h4><p>{c.niveau}</p></div>
                    </div>
                    <div className="class-card-footer">
                        <span>{c.annee_scolaire}</span>
                        <div className="flex gap-1">
                            <button className="btn-icon-small" title="Emploi du temps"><Calendar size={16} /></button>
                            <button className="btn-icon-small" title="Matières"><BookOpenCheck size={16} /></button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'eleves' && (
            <div className="eleves-view">
              <div className="welcome-section">
                <h1>Liste des Élèves</h1>
                <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={handleImportExcel} accept=".xlsx,.xls" />
                  <input type="file" ref={scanInputRef} style={{display: 'none'}} onChange={handleScanStudents} accept="image/*" />
                  
                  <button className="btn btn-outline" onClick={() => scanInputRef.current.click()}><Brain size={18} /> Scan IA</button>
                  <button className="btn btn-outline" onClick={() => fileInputRef.current.click()}><FileUp size={18} /> Importer</button>
                  <button className="btn btn-outline" onClick={handleExportExcel}><FileDown size={18} /> Exporter</button>
                  <button className="btn btn-primary" onClick={() => setShowEleveModal(true)}><Plus size={18} /> Inscrire</button>
                </div>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Identifiant</th>
                      <th>Nom & Prénom</th>
                      <th>Classe</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eleves.map(e => (
                      <tr key={e.id}>
                        <td className="font-mono text-orange">{e.identifiant_national}</td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small"><User size={14}/></div>
                            <span>{e.nom} {e.prenom}</span>
                          </div>
                        </td>
                        <td>{e.classe_nom || 'Non assignée'}</td>
                        <td><span className="status-pill">{e.statut}</span></td>
                        <td>
                            <div className="flex gap-2">
                                <button className="btn-icon-small" onClick={() => handleGenerateBulletin(e.id)} title="Générer Bulletin"><Printer size={18}/></button>
                                <button className="btn-icon-small" title="Historique"><History size={18}/></button>
                            </div>
                        </td>
                      </tr>
                    ))}
                    {eleves.length === 0 && <tr><td colSpan="5" className="text-center">Aucun élève inscrit.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="tab-content">
              <div className="welcome-section">
                <div>
                  <h1>Gestion des Notes</h1>
                  <p>Saisie et calcul automatique des moyennes.</p>
                </div>
                <div className="flex gap-2">
                   <button className="btn btn-outline"><Brain size={18} /> Scan Fiche Notes</button>
                   <button className="btn btn-primary" onClick={handleSaveNotes} disabled={loading || notesGrid.length === 0}>
                     {loading ? <Loader2 className="animate-spin" /> : 'Enregistrer tout'}
                   </button>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card" style={{flex: 1}}>
                  <div className="input-group" style={{margin: 0, width: '100%'}}>
                    <label>Classe</label>
                    <select value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)}>
                      <option value="">Sélectionner une classe</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>)}
                    </select>
                  </div>
                </div>
                <div className="stat-card" style={{flex: 1}}>
                  <div className="input-group" style={{margin: 0, width: '100%'}}>
                    <label>Matière</label>
                    <select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)}>
                      <option value="">Sélectionner une matière</option>
                      {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {selectedClasse && selectedMatiere && (
                <div className="table-container animate-fade-in">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Élève</th>
                        <th style={{width: '200px'}}>Note (0-20)</th>
                        <th>Appréciation</th>
                        <th>Résultat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notesGrid.map((n, idx) => (
                        <tr key={n.eleve_id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-small"><User size={14}/></div>
                              <span>{n.nom} {n.prenom}</span>
                            </div>
                          </td>
                          <td>
                            <input 
                              type="number" 
                              min="0" 
                              max="20" 
                              step="0.25"
                              value={n.note} 
                              onChange={e => {
                                const newGrid = [...notesGrid];
                                newGrid[idx].note = e.target.value;
                                setNotesGrid(newGrid);
                              }}
                              className="note-input"
                              placeholder="-- / 20"
                            />
                          </td>
                          <td>
                             <input 
                                type="text"
                                value={n.appreciation || ''}
                                onChange={e => {
                                    const newGrid = [...notesGrid];
                                    newGrid[idx].appreciation = e.target.value;
                                    setNotesGrid(newGrid);
                                }}
                                className="appreciation-input"
                                placeholder="TB, A encourager..."
                             />
                          </td>
                          <td>
                            {n.note !== '' && (
                              <span className={`status-pill ${parseFloat(n.note) >= 10 ? 'status-pass' : 'status-fail'}`}>
                                {parseFloat(n.note) >= 10 ? 'Admis' : 'Échec'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="messages-view">
              <div className="welcome-section">
                <h1>Messagerie</h1>
                <button className="btn btn-primary" onClick={() => setShowMessageModal(true)}><Plus size={18} /> Nouveau Message</button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>De</th>
                      <th>Sujet</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(m => (
                      <tr key={m.id}>
                        <td>{m.expediteur_nom}</td>
                        <td>{m.sujet}</td>
                        <td>{new Date(m.date_envoi).toLocaleDateString()}</td>
                        <td><span className="status-pill">{m.lu ? 'Lu' : 'Nouveau'}</span></td>
                      </tr>
                    ))}
                    {messages.length === 0 && <tr><td colSpan="4" className="text-center">Aucun message.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'profs' && (
            <div className="profs-view">
              <div className="welcome-section">
                <h1>Corps Enseignant</h1>
                <button className="btn btn-primary" onClick={() => setShowProfModal(true)}><Plus size={18} /> Ajouter un Professeur</button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Date d'ajout</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profs.map(p => (
                      <tr key={p.id}>
                        <td>{p.email}</td>
                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td><button className="btn-icon-small"><Settings size={18}/></button></td>
                      </tr>
                    ))}
                    {profs.length === 0 && <tr><td colSpan="3" className="text-center">Aucun professeur enregistré.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-view">
              <div className="welcome-section">
                <h1>Paramètres de l'Établissement</h1>
              </div>
              <div className="modal-card" style={{maxWidth: '600px', margin: '0'}}>
                <form onSubmit={handleUpdateProfile}>
                  <div className="input-group"><label>Nom de l'Établissement</label><input type="text" value={profile.nom} onChange={e => setProfile({...profile, nom: e.target.value})} /></div>
                  <div className="input-group"><label>Code Établissement</label><input type="text" value={profile.code_etablissement} onChange={e => setProfile({...profile, code_etablissement: e.target.value})} /></div>
                  <div className="form-row">
                    <div className="input-group"><label>Région</label><input type="text" value={profile.region} onChange={e => setProfile({...profile, region: e.target.value})} /></div>
                    <div className="input-group"><label>Ville</label><input type="text" value={profile.ville} onChange={e => setProfile({...profile, ville: e.target.value})} /></div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Enregistrer les modifications'}</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showClassModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Nouvelle Classe</h3>
            <form onSubmit={handleAddClass}>
              <div className="input-group"><label>Nom de la classe</label><input type="text" required value={newClass.nom} onChange={e => setNewClass({...newClass, nom: e.target.value})} placeholder="ex: 6ème A" /></div>
              <div className="input-group">
                <label>Niveau</label>
                <select value={newClass.niveau} onChange={e => setNewClass({...newClass, niveau: e.target.value})}>
                  <option value="6ème">6ème</option>
                  <option value="5ème">5ème</option>
                  <option value="4ème">4ème</option>
                  <option value="3ème">3ème</option>
                  <option value="Seconde">Seconde</option>
                  <option value="Première">Première</option>
                  <option value="Terminale">Terminale</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowClassModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEleveModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Inscrire un Élève</h3>
            <form onSubmit={handleAddEleve}>
              <div className="form-row">
                <div className="input-group"><label>Prénom</label><input type="text" required value={newEleve.prenom} onChange={e => setNewEleve({...newEleve, prenom: e.target.value})} placeholder="Abdou" /></div>
                <div className="input-group"><label>Nom</label><input type="text" required value={newEleve.nom} onChange={e => setNewEleve({...newEleve, nom: e.target.value})} placeholder="Diop" /></div>
              </div>
              <div className="input-group"><label>Date de Naissance</label><div className="input-wrapper"><Calendar size={18}/><input type="date" required value={newEleve.date_naissance} onChange={e => setNewEleve({...newEleve, date_naissance: e.target.value})} /></div></div>
              <div className="input-group">
                <label>Classe</label>
                <select required value={newEleve.classe_id} onChange={e => setNewEleve({...newEleve, classe_id: e.target.value})}>
                  <option value="">Sélectionner une classe</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowEleveModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Inscrire'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMessageModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Nouveau Message</h3>
            <form onSubmit={handleSendMessage}>
              <div className="input-group">
                <label>Destinataire Type</label>
                <select value={newMessage.destinataire_type} onChange={e => setNewMessage({...newMessage, destinataire_type: e.target.value})}>
                  <option value="CLASSE">Une Classe</option>
                  <option value="ELEVE">Un Élève</option>
                  <option value="OFFICE_BAC">Office du Bac</option>
                </select>
              </div>
              {newMessage.destinataire_type === 'CLASSE' && (
                <div className="input-group">
                    <label>Classe</label>
                    <select required value={newMessage.destinataire_id} onChange={e => setNewMessage({...newMessage, destinataire_id: e.target.value})}>
                        <option value="">Sélectionner</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                </div>
              )}
              <div className="input-group"><label>Sujet</label><input type="text" required value={newMessage.sujet} onChange={e => setNewMessage({...newMessage, sujet: e.target.value})} /></div>
              <div className="input-group"><label>Contenu</label><textarea required rows="4" style={{width: '100%', borderRadius: '10px', padding: '0.8rem', border: '2px solid #E2E8F0'}} value={newMessage.contenu} onChange={e => setNewMessage({...newMessage, contenu: e.target.value})}></textarea></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowMessageModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

