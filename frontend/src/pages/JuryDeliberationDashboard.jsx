import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, GraduationCap, Users, BookOpen, CheckCircle, AlertCircle, XCircle,
  Clock, Search, RefreshCw, Lock, Save, FileText, Check, ShieldCheck,
  Scale, FileCheck, Eye, LogOut, AlertOctagon, HelpCircle, X, Printer, Send, MessageSquare, Download, Zap
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import './JuryDeliberationDashboard.css';

const API = 'http://localhost:5002/api';

const JuryDeliberationDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [juryInfo, setJuryInfo] = useState(null);
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filterSerie, setFilterSerie] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tous');

  // Modal Saisie des Notes & Appréciation
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [notesGrid, setNotesGrid] = useState([]);
  const [appreciationJury, setAppreciationJury] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Modal Consultation Livret Scolaire (Repêchage)
  const [showLivretModal, setShowLivretModal] = useState(false);
  const [candLivret, setCandLivret] = useState(null);

  // Modal Procès-Verbal (PV) de Délibération PDF / Impression
  const [showPVModal, setShowPVModal] = useState(false);

  // Modals de Confirmation Personnalisées
  const [showPublierModal, setShowPublierModal] = useState(false);
  const [showVerrouillerModal, setShowVerrouillerModal] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchJuryAndCandidats = async () => {
    setLoading(true);
    try {
      const rJury = await fetch(`${API}/jury/my-jury`, { headers });
      if (rJury.ok) {
        const jData = await rJury.json();
        setJuryInfo(jData);

        const rCand = await fetch(`${API}/jury/candidats`, { headers });
        if (rCand.ok) setCandidats(await rCand.json());
      } else {
        showToast('Erreur d\'accès au Jury attribué.', 'error');
      }
    } catch (err) {
      showToast('Impossible de contacter le serveur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    fetchJuryAndCandidats();
  }, []);

  const handleOpenNotesModal = async (candidat) => {
    setSelectedCandidat(candidat);
    setAppreciationJury(candidat.appreciation_jury || '');
    try {
      const r = await fetch(`${API}/jury/candidats/${candidat.id}/notes`, { headers });
      if (r.ok) {
        const data = await r.json();
        setNotesGrid(data.notes);
      }
    } catch (e) {
      showToast('Erreur chargement épreuves.', 'error');
    }
  };

  const handleNoteChange = (index, value) => {
    const updated = [...notesGrid];
    updated[index].note = value;
    setNotesGrid(updated);
  };

  const calculateLiveStats = () => {
    let totalPoints = 0;
    let totalCoefs = 0;
    let hasABI = false;
    let hasNote2ndTour = false;

    for (const m of notesGrid) {
      if (m.statut_presence === 'ABI') hasABI = true;
      const n1 = (m.note !== '' && m.note !== null) ? parseFloat(m.note) : null;
      const n2 = (m.note_2nd_tour !== '' && m.note_2nd_tour !== null) ? parseFloat(m.note_2nd_tour) : null;
      if (n2 !== null) hasNote2ndTour = true;

      let valEff = null;
      if (n1 !== null && n2 !== null) valEff = Math.max(n1, n2);
      else if (n2 !== null) valEff = n2;
      else if (n1 !== null) valEff = n1;

      if (m.statut_presence === 'PRESENT' && valEff !== null) {
        const coef = parseInt(m.coefficient) || 1;
        totalPoints += valEff * coef;
        totalCoefs += coef;
      }
    }
    const moyenne = totalCoefs > 0 ? (totalPoints / totalCoefs) : 0;
    const rounded = Math.round(moyenne * 100) / 100;
    let mention = '—';
    let statut = 'EN ATTENTE';
    if (hasABI) {
      statut = 'AJOURNÉ (ABI)';
    } else if (selectedCandidat?.statut_deliberation === 'SECOND_TOUR' || hasNote2ndTour) {
      if (rounded >= 10.00) {
        statut = 'ADMIS 2ND TOUR (RATTRAPAGE RÉUSSI)';
        mention = 'PASSABLE';
      } else {
        statut = 'AJOURNÉ (ÉCHEC 2ND TOUR)';
      }
    } else if (rounded >= 10.00) {
      statut = 'ADMIS (1ER TOUR)';
      if (rounded >= 16.00) mention = 'TRÈS BIEN';
      else if (rounded >= 14.00) mention = 'BIEN';
      else if (rounded >= 12.00) mention = 'ASSEZ BIEN';
      else mention = 'PASSABLE';
    } else if (rounded >= 9.00 && rounded < 10.00) {
      statut = 'CONVOQUÉ AU 2ND TOUR (RATTRAPAGE)';
    } else if (rounded > 0) {
      statut = 'AJOURNÉ (ÉCHEC)';
    }
    return { totalPoints, totalCoefs, moyenne: rounded, mention, statut };
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!selectedCandidat) return;
    setSavingNotes(true);

    try {
      const r = await fetch(`${API}/jury/candidats/${selectedCandidat.id}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ notes: notesGrid, appreciation_jury: appreciationJury })
      });
      const data = await r.json();

      if (r.ok) {
        showToast(data.message);
        setSelectedCandidat(null);
        fetchJuryAndCandidats();
      } else {
        showToast(data.message || 'Erreur enregistrement.', 'error');
      }
    } catch (err) {
      showToast('Erreur réseau.', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRepecher = async (candidatId, nouvelleMoyenne, nouveauStatut) => {
    try {
      const r = await fetch(`${API}/jury/candidats/${candidatId}/repecher`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          nouvelle_moyenne: nouvelleMoyenne,
          statut_deliberation: nouveauStatut,
          appreciation_jury: 'Repêché après délibération sur avis du livret scolaire'
        })
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        setShowLivretModal(false);
        fetchJuryAndCandidats();
      } else {
        showToast(data.message || 'Erreur repêchage.', 'error');
      }
    } catch (err) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleVerrouillerPV = () => {
    setShowVerrouillerModal(true);
  };

  const confirmVerrouillerPV = async () => {
    try {
      const r = await fetch(`${API}/jury/verrouiller`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ numero_jury: juryInfo?.numero_jury })
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        fetchJuryAndCandidats();
      } else {
        showToast(data.message || 'Erreur clôture.', 'error');
      }
    } catch (err) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handlePublierResultats = () => {
    setShowPublierModal(true);
  };

  const confirmPublierResultats = async () => {
    try {
      const r = await fetch(`${API}/jury/publier`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ numero_jury: juryInfo?.numero_jury })
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        fetchJuryAndCandidats();
      } else {
        showToast(data.message || 'Erreur publication.', 'error');
      }
    } catch (err) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const getCandidatsParSerieOrdreMerite = () => {
    const grouped = {};
    candidats.forEach(c => {
      const serie = c.serie || 'SÉRIE INCONNUE';
      if (!grouped[serie]) grouped[serie] = [];
      grouped[serie].push(c);
    });

    const sortedSeries = Object.keys(grouped).sort();

    sortedSeries.forEach(s => {
      grouped[s].sort((a, b) => {
        const mA = parseFloat(a.moyenne_generale) || 0;
        const mB = parseFloat(b.moyenne_generale) || 0;
        return mB - mA; // Ordre de mérite : moyenne la plus élevée en premier
      });
    });

    return { grouped, sortedSeries };
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('pv-printable-content');
    if (!element) {
      showToast('Élément PV introuvable', 'error');
      return;
    }

    showToast('Génération du fichier PDF en cours…');

    const opt = {
      margin: [8, 8, 8, 8],
      filename: `PV_Deliberation_${juryInfo?.numero_jury || 'Jury001'}_${new Date().getFullYear()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      showToast('Fichier PDF téléchargé avec succès !');
    }).catch(err => {
      console.error(err);
      showToast('Erreur génération PDF, tentative d\'impression...', 'warning');
      window.print();
    });
  };

  const filteredCandidats = candidats.filter(c => {
    const matchSerie = !filterSerie || c.serie === filterSerie;
    const matchSearch = !searchQuery ||
      (c.eleve_nom || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.eleve_prenom || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.numero_table && c.numero_table.includes(searchQuery)) ||
      (c.identifiant_national && c.identifiant_national.includes(searchQuery));

    let matchTab = true;
    if (activeTab === 'second_tour') {
      matchTab = c.statut_deliberation === 'SECOND_TOUR' || c.statut_deliberation === '2ND_TOUR' || c.statut_deliberation === 'ADMIS_2ND_TOUR';
    } else if (activeTab === 'admis') {
      matchTab = c.statut_deliberation === 'ADMIS' || c.statut_deliberation === 'ADMIS_2ND_TOUR';
    } else if (activeTab === 'ajournes') {
      matchTab = c.statut_deliberation === 'AJOURNÉ';
    }

    return matchSerie && matchSearch && matchTab;
  });

  const totalCandidats = candidats.length;
  const totalAdmis = candidats.filter(c => c.statut_deliberation === 'ADMIS').length;
  const totalSecondTour = candidats.filter(c => c.statut_deliberation === 'SECOND_TOUR').length;
  const totalAjournes = candidats.filter(c => c.statut_deliberation === 'AJOURNÉ').length;
  const totalPublies = candidats.filter(c => c.publie).length;
  const isVerrouille = candidats.some(c => c.verrouille) || juryInfo?.statut === 'CLÔTURÉ';

  const liveStats = calculateLiveStats();

  return (
    <div className="jdd-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`jdd-toast jdd-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="jdd-navbar">
        <div className="jdd-nav-brand">
          <GraduationCap size={28} className="jdd-brand-icon" />
          <div>
            <h1>Portail de Délibération & Saisie du Jury</h1>
            <p>Office du Baccalauréat & BFEM · Ministère de l'Éducation Nationale du Sénégal</p>
          </div>
        </div>

        <div className="jdd-nav-user">
          <div className="jdd-user-badge">
            <ShieldCheck size={16} />
            <span>Pr. {user.nom || 'Saliou Diop'} (Président de Jury)</span>
          </div>
          <button className="jdd-logout-btn" onClick={() => { localStorage.clear(); navigate('/auth'); }}>
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </header>

      {/* Header Fiche du Jury */}
      <div className="jdd-card jdd-jury-banner mt-4">
        <div className="jdd-jury-info-grid">
          <div>
            <div className="jdd-badge-jury">{juryInfo?.numero_jury || 'Jury 001'}</div>
            <h2 className="jdd-centre-name">{juryInfo?.centre_examen || 'Lycée Lamine Guèye'}</h2>
            <p className="jdd-centre-region"> Région de {juryInfo?.region || 'Dakar'} — Zone {juryInfo?.zone_commune || 'Dakar Plateau'}</p>
          </div>

          <div className="jdd-jury-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {isVerrouille ? (
              <div className="jdd-pv-status jdd-pv-locked">
                <Lock size={18} />
                <div>
                  <strong>PV de Délibération Signé & Verrouillé</strong>
                  <p>Notes gelées en lecture seule pour l'Office</p>
                </div>
              </div>
            ) : (
              <button className="jdd-btn jdd-btn-lock" onClick={handleVerrouillerPV}>
                <Lock size={16} /> Verrouiller & Signer le PV
              </button>
            )}

            <button className="jdd-btn" onClick={handlePublierResultats} style={{ background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Send size={15} /> {totalPublies > 0 ? 'Résultats Publiés (Re-publier)' : 'Publier les Résultats'}
            </button>

            <button className="jdd-btn" onClick={() => setShowPVModal(true)} style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Printer size={15} /> Imprimer PV (PDF)
            </button>

            <button className="jdd-btn" onClick={fetchJuryAndCandidats} style={{ background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={15} /> Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="jdd-stats-grid mt-4">
        <div className="jdd-stat-card jdd-stat-total">
          <div className="jdd-stat-icon"><Users size={22} /></div>
          <div>
            <div className="jdd-stat-num">{totalCandidats}</div>
            <div className="jdd-stat-label">Candidats du Jury</div>
          </div>
        </div>

        <div className="jdd-stat-card jdd-stat-admis">
          <div className="jdd-stat-icon"><CheckCircle size={22} /></div>
          <div>
            <div className="jdd-stat-num">{totalAdmis}</div>
            <div className="jdd-stat-label">Admis d'Emblée (1er Tour)</div>
          </div>
        </div>

        <div className="jdd-stat-card jdd-stat-rattrapage">
          <div className="jdd-stat-icon"><Clock size={22} /></div>
          <div>
            <div className="jdd-stat-num">{totalSecondTour}</div>
            <div className="jdd-stat-label">Admis au 2nd Tour (Rattrapage)</div>
          </div>
        </div>

        <div className="jdd-stat-card jdd-stat-ajournes">
          <div className="jdd-stat-icon"><XCircle size={22} /></div>
          <div>
            <div className="jdd-stat-num">{totalAjournes}</div>
            <div className="jdd-stat-label">Ajournés (Échec)</div>
          </div>
        </div>
      </div>

      {/* BARRE D'ACCÈS RAPIDES & ONGLETS DE DÉLIBÉRATION */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
        marginBottom: 16,
        background: '#ffffff',
        padding: '10px 14px',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginRight: 4, letterSpacing: '0.5px' }}>
          Onglets & Accès Rapides :
        </span>

        <button
          type="button"
          onClick={() => setActiveTab('tous')}
          style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
            background: activeTab === 'tous' ? '#131e6c' : '#f8fafc',
            color: activeTab === 'tous' ? '#ffffff' : '#475569',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: activeTab === 'tous' ? '0 2px 6px rgba(19,30,108,0.2)' : 'none'
          }}
        >
          <Users size={14} /> Tous les Candidats <span style={{ fontSize: 10, background: activeTab === 'tous' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>{totalCandidats}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('second_tour')}
          style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'second_tour' ? '#f59e0b' : '#fffbeb',
            color: activeTab === 'second_tour' ? '#ffffff' : '#b45309',
            border: activeTab === 'second_tour' ? 'none' : '1px solid #fde68a',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: activeTab === 'second_tour' ? '0 2px 6px rgba(245,158,11,0.25)' : 'none'
          }}
        >
          <Zap size={14} /> ⚡ Saisie 2nd Groupe (Rattrapage) <span style={{ fontSize: 10, background: activeTab === 'second_tour' ? 'rgba(255,255,255,0.25)' : '#fef3c7', padding: '1px 6px', borderRadius: 10 }}>{totalSecondTour}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admis')}
          style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'admis' ? '#10b981' : '#f0fdf4',
            color: activeTab === 'admis' ? '#ffffff' : '#15803d',
            border: activeTab === 'admis' ? 'none' : '1px solid #bbf7d0',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: activeTab === 'admis' ? '0 2px 6px rgba(16,185,129,0.25)' : 'none'
          }}
        >
          <CheckCircle size={14} /> Admis (1er & 2nd Tour) <span style={{ fontSize: 10, background: activeTab === 'admis' ? 'rgba(255,255,255,0.25)' : '#dcfce7', padding: '1px 6px', borderRadius: 10 }}>{totalAdmis}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ajournes')}
          style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'ajournes' ? '#ef4444' : '#fef2f2',
            color: activeTab === 'ajournes' ? '#ffffff' : '#b91c1c',
            border: activeTab === 'ajournes' ? 'none' : '1px solid #fecaca',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: activeTab === 'ajournes' ? '0 2px 6px rgba(239,68,68,0.25)' : 'none'
          }}
        >
          <XCircle size={14} /> Ajournés & Échecs <span style={{ fontSize: 10, background: activeTab === 'ajournes' ? 'rgba(255,255,255,0.25)' : '#fee2e2', padding: '1px 6px', borderRadius: 10 }}>{totalAjournes}</span>
        </button>
      </div>

      {/* Barre de recherche et Filtres */}
      <div className="jdd-card jdd-filters-bar">
        <div className="jdd-search-box">
          <Search size={16} />
          <input
            placeholder="Rechercher par nom, N° de table, INE…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={filterSerie} onChange={e => setFilterSerie(e.target.value)}>
          <option value="">Toutes les séries prises en charge</option>
          {['S1', 'S2', 'S3', 'L1', 'L2', 'G', 'STEG', 'T'].map(s => <option key={s} value={s}>Série {s}</option>)}
        </select>
      </div>

      {/* Tableau des Candidats & Saisie des Notes */}
      <div className="jdd-card jdd-table-card mt-4">
        {loading ? (
          <div className="jdd-empty"><RefreshCw className="spin" size={32} /><p>Chargement des dossiers candidats du jury…</p></div>
        ) : filteredCandidats.length === 0 ? (
          <div className="jdd-empty"><Users size={48} /><p>Aucun candidat trouvé dans ce jury.</p></div>
        ) : (
          <table className="jdd-table">
            <thead>
              <tr>
                <th>N° Table</th>
                <th>Candidat & INE</th>
                <th>Lycée / Origine</th>
                <th>Série</th>
                <th>Moyenne /20</th>
                <th>Statut Délibération</th>
                <th>Appréciation Jury</th>
                <th>Livret Scolaire</th>
                <th>Saisie des Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidats.map(c => (
                <tr key={c.id}>
                  <td><code className="jdd-num-table">{c.numero_table || '—'}</code></td>
                  <td>
                    <strong className="jdd-cand-name">{c.eleve_prenom} {c.eleve_nom}</strong>
                    {c.repeche && <span className="jdd-repeche-tag" style={{ background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, marginLeft: 6 }}>Repêché</span>}
                    {c.publie && <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, marginLeft: 6 }}>Publié</span>}
                    <div style={{ fontSize: 11, color: '#64748b' }}><code>{c.identifiant_national}</code></div>
                  </td>
                  <td>{c.etablissement_nom || 'Candidat Libre'}</td>
                  <td><span className="jdd-badge-serie">{c.serie}</span></td>
                  <td>
                    <strong style={{ fontSize: 14, color: c.moyenne_generale >= 10 ? '#15803d' : c.moyenne_generale >= 9 ? '#b45309' : '#b91c1c' }}>
                      {c.moyenne_generale ? parseFloat(c.moyenne_generale).toFixed(2) + '/20' : '—'}
                    </strong>
                    {c.mention && <div style={{ fontSize: 10, color: '#15803d', fontWeight: 700 }}>Mention {c.mention}</div>}
                  </td>
                  <td>
                    <span className={`jdd-delib-pill jdd-delib-${c.statut_deliberation || 'EN_ATTENTE'}`}>
                      {c.statut_deliberation === 'ADMIS' ? 'ADMIS 1ER TOUR' : c.statut_deliberation === 'ADMIS_2ND_TOUR' ? 'ADMIS 2ND TOUR' : c.statut_deliberation === 'SECOND_TOUR' ? '2ND TOUR' : c.statut_deliberation === 'AJOURNÉ' ? 'AJOURNÉ' : 'EN ATTENTE'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', maxWidth: 180 }}>
                    {c.appreciation_jury || '—'}
                  </td>
                  <td>
                    <button className="jdd-btn-livret" onClick={() => { setCandLivret(c); setShowLivretModal(true); }}>
                      <BookOpen size={14} /> Voir Livret ({c.moyenne_terminale ? parseFloat(c.moyenne_terminale).toFixed(2) : 'Dossier'})
                    </button>
                  </td>
                  <td>
                    <button
                      className="jdd-btn jdd-btn-notes"
                      onClick={() => handleOpenNotesModal(c)}
                      disabled={isVerrouille}
                    >
                      {isVerrouille ? <Eye size={14} /> : <FileText size={14} />} {isVerrouille ? 'Consulter Notes' : 'Saisir / Modifier'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ══ MODAL SAISIE DES NOTES PAR ÉPREUVE ET APPRÉCIATION ══ */}
      {selectedCandidat && (
        <div className="jdd-modal-overlay" onClick={() => setSelectedCandidat(null)}>
          <div className="jdd-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 780 }}>
            <div className="jdd-modal-header">
              <div>
                <h3>Saisie des Épreuves & Délibération — {selectedCandidat.eleve_prenom} {selectedCandidat.eleve_nom}</h3>
                <p>N° Table: {selectedCandidat.numero_table} · Série {selectedCandidat.serie} · {selectedCandidat.etablissement_nom}</p>
              </div>
              <button onClick={() => setSelectedCandidat(null)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveNotes} className="jdd-modal-body">
              {/* LIVE STATS BANNER */}
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL POINTS CALCULÉS</span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#131e6c' }}>{liveStats.totalPoints} pts / {liveStats.totalCoefs} Coefs</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>MOYENNE GÉNÉRALE</span>
                  <div style={{ fontSize: 20, fontWeight: 900, color: liveStats.moyenne >= 10 ? '#15803d' : liveStats.moyenne >= 9 ? '#b45309' : '#b91c1c' }}>
                    {liveStats.moyenne.toFixed(2)} / 20
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>RÉSULTAT DU JURY</span>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                    {liveStats.statut}
                  </div>
                </div>
              </div>

              <div className="jdd-notes-grid">
                {notesGrid.map((m, idx) => (
                  <div key={m.matiere_code} className="jdd-note-box">
                    <div className="jdd-note-header">
                      <strong>{m.matiere_nom}</strong>
                      <span className="jdd-coef-tag">Coef {m.coefficient}</span>
                    </div>

                    <div className="jdd-note-inputs" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 2 }}>Note 1er Tour</span>
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            max="20"
                            placeholder="1er Tour /20"
                            value={m.note !== undefined && m.note !== null ? m.note : ''}
                            onChange={e => handleNoteChange(idx, e.target.value)}
                            disabled={isVerrouille}
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 10, color: '#d97706', fontWeight: 800, display: 'block', marginBottom: 2 }}>
                            ⚡ Note 2nd Tour
                          </span>
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            max="20"
                            placeholder="2nd Tour /20"
                            value={m.note_2nd_tour !== undefined && m.note_2nd_tour !== null ? m.note_2nd_tour : ''}
                            onChange={e => {
                              const updated = [...notesGrid];
                              updated[idx].note_2nd_tour = e.target.value;
                              setNotesGrid(updated);
                            }}
                            disabled={isVerrouille}
                            style={{ border: '1.5px solid #f59e0b', background: '#fffbeb', fontWeight: 800, color: '#92400e' }}
                          />
                        </div>
                      </div>

                      <select
                        value={m.statut_presence}
                        onChange={e => {
                          const updated = [...notesGrid];
                          updated[idx].statut_presence = e.target.value;
                          setNotesGrid(updated);
                        }}
                        disabled={isVerrouille}
                        style={{ fontSize: 11 }}
                      >
                        <option value="PRESENT">Présent</option>
                        <option value="ABI">Absence Injustifiée (ABI)</option>
                        <option value="ABJ">Absence Justifiée (ABJ)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* SAISIE DE L'APPRÉCIATION DU JURY */}
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <MessageSquare size={15} /> Appréciation & Observations Officielles du Jury
                </label>
                <textarea
                  rows={2}
                  placeholder="Appréciation du jury (ex: Élève sérieux, résultats réguliers, repêchage accordé...)"
                  value={appreciationJury}
                  onChange={e => setAppreciationJury(e.target.value)}
                  disabled={isVerrouille}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'inherit' }}
                />
              </div>

              {!isVerrouille && (
                <div className="jdd-modal-footer mt-4">
                  <button type="button" className="jdd-btn jdd-btn-ghost" onClick={() => setSelectedCandidat(null)}>Annuler</button>
                  <button type="submit" className="jdd-btn jdd-btn-primary" disabled={savingNotes}>
                    <Save size={16} /> {savingNotes ? 'Enregistrement…' : 'Enregistrer les Notes & Calculer le Résultat'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL CONSULTATION LIVRET SCOLAIRE & REPÊCHAGE ══ */}
      {showLivretModal && candLivret && (
        <div className="jdd-modal-overlay" onClick={() => setShowLivretModal(false)}>
          <div className="jdd-modal jdd-modal-livret" onClick={e => e.stopPropagation()}>
            <div className="jdd-modal-header">
              <div>
                <h3>Livret Scolaire du BAC — Avis de Repêchage du Jury</h3>
                <p>{candLivret.eleve_prenom} {candLivret.eleve_nom} ({candLivret.identifiant_national})</p>
              </div>
              <button onClick={() => setShowLivretModal(false)}><X size={20} /></button>
            </div>

            <div className="jdd-modal-body">
              <div className="jdd-livret-stats">
                <div className="jdd-livret-box">
                  <span>Moyenne Seconde</span>
                  <strong>{candLivret.moyenne_seconde ? parseFloat(candLivret.moyenne_seconde).toFixed(2) + '/20' : 'Non renseignée'}</strong>
                </div>
                <div className="jdd-livret-box">
                  <span>Moyenne Première</span>
                  <strong>{candLivret.moyenne_premiere ? parseFloat(candLivret.moyenne_premiere).toFixed(2) + '/20' : 'Non renseignée'}</strong>
                </div>
                <div className="jdd-livret-box highlight">
                  <span>Moyenne Terminale</span>
                  <strong>{candLivret.moyenne_terminale ? parseFloat(candLivret.moyenne_terminale).toFixed(2) + '/20' : 'Non renseignée'}</strong>
                </div>
              </div>

              <div className="jdd-appreciation-box mt-4">
                <strong>Appréciation Synthétique du Conseil de Classe :</strong>
                <p>{candLivret.appreciation_conseil || 'Candidat régulier, assidu et ayant suivi un cursus secondaire complet sans avertissement.'}</p>
              </div>

              {!isVerrouille && candLivret.moyenne_generale < 10.00 && (
                <div className="jdd-repechage-banner mt-4">
                  <div className="jdd-repechage-header">
                    <Scale size={20} />
                    <strong>Pouvoir de Repêchage du Jury du BAC</strong>
                  </div>
                  <p>Si le dossier scolaire du candidat atteste de sa régularité, le Jury peut décider d'attribuer le point de grâce pour l'admettre d'emblée ou le convoquer au 2nd tour.</p>

                  <div className="jdd-repechage-actions mt-3">
                    <button className="jdd-btn jdd-btn-success" onClick={() => handleRepecher(candLivret.id, 10.00, 'ADMIS')}>
                      <CheckCircle size={16} /> Accorder le Repêchage (Passer Admis à 10.00/20)
                    </button>
                    {candLivret.moyenne_generale < 9.00 && (
                      <button className="jdd-btn jdd-btn-warning" onClick={() => handleRepecher(candLivret.id, 9.00, 'SECOND_TOUR')}>
                        <Clock size={16} /> Repêcher pour le 2nd Tour (Rattrapage à 9.00/20)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL IMPRESSION / EXPORTation PV DE DÉLIBÉRATION (PDF) ══ */}
      {showPVModal && (
        <div className="jdd-modal-overlay" onClick={() => setShowPVModal(false)}>
          <div className="jdd-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 900, background: '#fff' }}>
            <div className="jdd-modal-header" style={{ borderBottom: '2px solid #131e6c' }}>
              <div>
                <h3>Procès-Verbal Officiel de Délibération ({juryInfo?.numero_jury || 'Jury 001'})</h3>
                <p>Document officiel pour impression et archivage du Ministère de l'Éducation Nationale</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="jdd-btn jdd-btn-primary" onClick={() => window.print()}>
                  <Printer size={16} /> Lancer l'Impression / PDF
                </button>
                <button
                  type="button"
                  className="jdd-btn"
                  onClick={handleDownloadPDF}
                  style={{ background: '#10b981', borderColor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <Download size={16} /> Télécharger le PDF
                </button>
                <button onClick={() => setShowPVModal(false)}><X size={20} /></button>
              </div>
            </div>

            <div id="pv-printable-content" className="jdd-modal-body" style={{ padding: 24, fontSize: 13, background: '#ffffff' }}>
              {/* SENEGAL HEADER */}
              <div style={{ textAlign: 'center', borderBottom: '2px double #0f172a', paddingBottom: 16, marginBottom: 20 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, textTransform: 'uppercase' }}>RÉPUBLIQUE DU SÉNÉGAL</h4>
                <p style={{ margin: '2px 0', fontSize: 11, fontStyle: 'italic' }}>Un Peuple - Un But - Une Foi</p>
                <p style={{ margin: '4px 0', fontSize: 12, fontWeight: 700 }}>MINISTÈRE DE L'ÉDUCATION NATIONALE · DIRECTION DES EXAMENS ET CONCOURS</p>
                <h3 style={{ margin: '12px 0 0', fontSize: 16, fontWeight: 900, color: '#131e6c', letterSpacing: 0.5 }}>
                  PROCÈS-VERBAL DE DÉLIBÉRATION DE L'EXAMEN DU BAC (1ER TOUR)
                </h3>
              </div>

              {/* JURY DETAILS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 20, border: '1px solid #e2e8f0' }}>
                <div>
                  <strong>Jury :</strong> {juryInfo?.numero_jury || 'Jury 001'}<br />
                  <strong>Centre d'Examen :</strong> {juryInfo?.centre_examen || 'Lycée Lamine Guèye'}<br />
                  <strong>Région :</strong> {juryInfo?.region || 'Dakar'} ({juryInfo?.zone_commune || 'Dakar Plateau'})
                </div>
                <div>
                  <strong>Président du Jury :</strong> Pr. {user.nom || 'Saliou Diop'}<br />
                  <strong>Session :</strong> {new Date().getFullYear()}<br />
                  <strong>Date d'Édition :</strong> {new Date().toLocaleDateString('fr-FR')}
                </div>
              </div>

              {/* LISTE DES CANDIDATS CLASSÉS PAR SÉRIE ET PAR ORDRE DE MÉRITE */}
              {(() => {
                const { grouped, sortedSeries } = getCandidatsParSerieOrdreMerite();
                return sortedSeries.map(serie => (
                  <div key={serie} style={{ marginBottom: 24 }}>
                    <div style={{ background: '#131e6c', color: '#fff', padding: '8px 12px', borderRadius: '6px 6px 0 0', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>SÉRIE : {serie}</span>
                      <span style={{ fontWeight: 500, fontSize: 11, background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 4 }}>
                        {grouped[serie].length} Candidat(s) · Classés par ordre de mérite
                      </span>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, border: '1px solid #cbd5e1', borderTop: 'none', marginBottom: 0 }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '8px', width: 60 }}>Rang</th>
                          <th style={{ padding: '8px' }}>N° Table</th>
                          <th style={{ padding: '8px' }}>Candidat & INE</th>
                          <th style={{ padding: '8px' }}>Lycée / Origine</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Moyenne /20</th>
                          <th style={{ padding: '8px' }}>Mention</th>
                          <th style={{ padding: '8px' }}>Décision Jury</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grouped[serie].map((c, idx) => (
                          <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '8px', fontWeight: 800, color: idx === 0 ? '#b45309' : '#475569' }}>
                              {idx === 0 ? '1er' : `${idx + 1}ème`}
                            </td>
                            <td style={{ padding: '8px', fontWeight: 700 }}><code>{c.numero_table || '—'}</code></td>
                            <td style={{ padding: '8px' }}>
                              <strong>{c.eleve_prenom} {c.eleve_nom}</strong>
                              <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{c.identifiant_national}</div>
                            </td>
                            <td style={{ padding: '8px', color: '#475569' }}>{c.etablissement_nom || 'Candidat Libre'}</td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 900, color: c.moyenne_generale >= 10 ? '#15803d' : c.moyenne_generale >= 9 ? '#b45309' : '#b91c1c' }}>
                              {c.moyenne_generale ? parseFloat(c.moyenne_generale).toFixed(2) + '/20' : '—'}
                            </td>
                            <td style={{ padding: '8px', fontWeight: 600 }}>{c.mention || '—'}</td>
                            <td style={{ padding: '8px', fontWeight: 700, color: c.statut_deliberation === 'ADMIS' ? '#15803d' : c.statut_deliberation === 'SECOND_TOUR' ? '#b45309' : '#b91c1c' }}>
                              {c.statut_deliberation === 'ADMIS' ? 'ADMIS (1ER TOUR)' : c.statut_deliberation === 'SECOND_TOUR' ? 'ADMIS (2ND TOUR)' : c.statut_deliberation === 'AJOURNÉ' ? 'AJOURNÉ' : 'EN ATTENTE'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ));
              })()}

              {/* RECAP STATS */}
              <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f1f5f9', padding: 12, borderRadius: 8, marginBottom: 24, textAlign: 'center', fontWeight: 700 }}>
                <div>Total Candidats: {totalCandidats}</div>
                <div style={{ color: '#15803d' }}>Admis 1er Tour: {totalAdmis}</div>
                <div style={{ color: '#b45309' }}>Admis 2nd Tour: {totalSecondTour}</div>
                <div style={{ color: '#b91c1c' }}>Ajournés: {totalAjournes}</div>
              </div>

              {/* SIGNATURES BLOCK */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30, paddingTop: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>Les Membres du Jury / Assesseurs</p>
                  <div style={{ height: 60 }} />
                  <p style={{ fontSize: 11, color: '#64748b' }}>(Signatures des examinateurs)</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>Le Président du Jury</p>
                  <p style={{ margin: '4px 0 0', fontStyle: 'italic' }}>Pr. {user.nom || 'Saliou Diop'}</p>
                  <div style={{ height: 40 }} />
                  <div style={{ display: 'inline-block', border: '1px solid #10b981', color: '#047857', padding: '4px 10px', borderRadius: 4, fontSize: 10, fontWeight: 800 }}>
                    ✓ SIGNÉ ÉLECTRONIQUEMENT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ══ MODAL DE CONFIRMATION DE PUBLICATION DES RÉSULTATS ══ */}
      {showPublierModal && (
        <div className="jdd-modal-overlay" onClick={() => setShowPublierModal(false)}>
          <div className="jdd-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Send size={26} />
            </div>
            
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              Publier les Résultats Officiels ?
            </h3>
            
            <p style={{ fontSize: 13, color: '#475569', marginTop: 10, lineHeight: 1.5 }}>
              Cette action rendra les notes et statuts du <strong>{juryInfo?.numero_jury || 'Jury 001'}</strong> immédiatement consultables par les candidats sur la plateforme. Une notification automatique leur sera transmise.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
              <button
                type="button"
                className="jdd-btn jdd-btn-ghost"
                onClick={() => setShowPublierModal(false)}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #cbd5e1', fontWeight: 600 }}
              >
                Annuler
              </button>

              <button
                type="button"
                className="jdd-btn jdd-btn-primary"
                onClick={() => {
                  setShowPublierModal(false);
                  confirmPublierResultats();
                }}
                style={{ background: '#10b981', borderColor: '#059669', padding: '10px 22px', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Send size={16} /> Confirmer la Publication
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL DE CONFIRMATION DE VERROUILLAGE PV ══ */}
      {showVerrouillerModal && (
        <div className="jdd-modal-overlay" onClick={() => setShowVerrouillerModal(false)}>
          <div className="jdd-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Lock size={26} />
            </div>

            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              Verrouiller & Signer le Procès-Verbal ?
            </h3>

            <p style={{ fontSize: 13, color: '#475569', marginTop: 10, lineHeight: 1.5 }}>
              Le verrouillage gèle définitivement les notes et les moyennes en lecture seule. Vous ne pourrez plus modifier la grille après signature numérique du PV du 1er tour.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
              <button
                type="button"
                className="jdd-btn jdd-btn-ghost"
                onClick={() => setShowVerrouillerModal(false)}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #cbd5e1', fontWeight: 600 }}
              >
                Annuler
              </button>

              <button
                type="button"
                className="jdd-btn jdd-btn-warning"
                onClick={() => {
                  setShowVerrouillerModal(false);
                  confirmVerrouillerPV();
                }}
                style={{ background: '#d97706', borderColor: '#b45309', color: '#fff', padding: '10px 22px', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Lock size={16} /> Signer et Verrouiller
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JuryDeliberationDashboard;
