import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardList, Send, BarChart3,
  LogOut, Search, Plus, X, CheckCircle, AlertCircle, XCircle,
  Clock, ChevronDown, Save, Eye, EyeOff, Edit3, Trash2,
  GraduationCap, Award, FileText, Bell, Loader2, ChevronLeft,
  ChevronRight, Filter, Download, RefreshCw, Menu,
  Lock, Unlock, Printer, QrCode, History, Sliders, Medal,
  MapPin, UserCheck, CheckSquare, FileCheck, PieChart as PieIcon, Activity,
  School, Key, Copy, Check, Inbox, BookOpen, Zap, Building
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { REFERENTIEL_IA_IEF, getIasByRegion, getIefsByIa } from '../utils/referentielIaIef';
import './OfficeBacDashboard.css';

import OfficeOverviewTab from '../components/office/OfficeOverviewTab';
import OfficeEtablissementsTab from '../components/office/OfficeEtablissementsTab';
import OfficeProfesseursTab from '../components/office/OfficeProfesseursTab';
import OfficeCentresTab from '../components/office/OfficeCentresTab';
import OfficeJurysTab from '../components/office/OfficeJurysTab';
import OfficeCandidatsTab from '../components/office/OfficeCandidatsTab';
import OfficeSaisieTab from '../components/office/OfficeSaisieTab';
import OfficePublicationTab from '../components/office/OfficePublicationTab';
import OfficeStatsTab from '../components/office/OfficeStatsTab';
import OfficeDemandesTab from '../components/office/OfficeDemandesTab';
import OfficeMessagerieTab from '../components/office/OfficeMessagerieTab';
import OfficeLivretsTab from '../components/office/OfficeLivretsTab';
import OfficeSidebar from '../components/office/OfficeSidebar';
import OfficeTopbar from '../components/office/OfficeTopbar';


const API = '/api';

const SENEGAL_REGIONS_ZONES = {
  'Dakar': ['Dakar Plateau', 'Grand Dakar', 'Parcelles Assainies', 'Guédiawaye', 'Pikine', 'Rufisque', 'Bambilor', 'Keur Massar'],
  'Thiès': ['Thiès Ville', 'Mbour', 'Tivaouane', 'Popenguine', 'Pout'],
  'Saint-Louis': ['Saint-Louis Nord', 'Saint-Louis Sud', 'Dagana', 'Podor', 'Richard-Toll'],
  'Diourbel': ['Diourbel Ville', 'Mbacké', 'Bambey', 'Touba'],
  'Fatick': ['Fatick Ville', 'Foundiougne', 'Gossas', 'Passy', 'Diofior'],
  'Kaolack': ['Kaolack Commune', 'Ndiaganiao', 'Guinguinéo', 'Ndoffane'],
  'Kolda': ['Kolda Ville', 'Vélingara', 'Medina Yoro Foulah', 'Dabo'],
  'Louga': ['Louga Ville', 'Linguère', 'Kébémer', 'Dahra'],
  'Matam': ['Matam Ville', 'Ranérou', 'Kanel', 'Ourossogui'],
  'Sédhiou': ['Sédhiou Ville', 'Bounkiling', 'Goudomp', 'Marsassoum'],
  'Tambacounda': ['Tambacounda Ville', 'Bakel', 'Goudiry', 'Koupentoum'],
  'Kaffrine': ['Kaffrine Ville', 'Birkelane', 'Koungheul', 'Malem Hodar'],
  'Kédougou': ['Kédougou Ville', 'Salémata', 'Saraya', 'Bandafassi'],
  'Ziguinchor': ['Ziguinchor Ville', 'Bignona', 'Oussouye', 'Thionck-Essyl']
};

const ALL_SERIES_OPTIONS = ['S1', 'S2', 'S3', 'L1', 'L2', "L'", 'STEG', 'T1', 'T2'];

// ─── Helpers ─────────────────────────────────
const getMentionColor = (mention) => {
  if (!mention) return '#64748b';
  if (mention.includes('Très')) return '#7c3aed';
  if (mention.includes('Bien') && !mention.includes('Très') && !mention.includes('Assez')) return '#2563eb';
  if (mention.includes('Assez')) return '#0891b2';
  return '#16a34a';
};

const getStatutColor = (statut) => {
  switch (statut) {
    case 'ADMIS': return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
    case 'AJOURNÉ': return { bg: '#fef9c3', color: '#b45309', border: '#fde68a' };
    case 'EXCLU': return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' };
    case 'SUSPENDU': return { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' };
    default: return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  }
};

const DEFAULT_COEFFS = {
  S1: { 'Mathématiques': 6, 'Sciences Physiques': 5, 'SVT': 2, 'Français': 3, 'Philosophie': 2, 'Anglais': 2, 'Histoire-Géo': 2 },
  S2: { 'Mathématiques': 5, 'Sciences Physiques': 5, 'SVT': 5, 'Français': 3, 'Philosophie': 2, 'Anglais': 2, 'Histoire-Géo': 2 },
  L1: { 'Français': 5, 'Philosophie': 5, 'Anglais': 4, 'Histoire-Géo': 4, 'Mathématiques': 2, 'LV2': 3 },
  L2: { 'Français': 5, 'Philosophie': 4, 'Histoire-Géo': 5, 'Anglais': 3, 'Mathématiques': 2, 'LV2': 3 },
  STEG: { 'Comptabilité': 5, 'Économie & Droit': 4, 'Mathématiques': 4, 'Français': 3, 'Anglais': 2 }
};

// ─── Composant principal ──────────────────────
const OfficeBacDashboard = () => {
  const navigate = useNavigate();
  const { tab = 'overview' } = useParams();
  const token = localStorage.getItem('token');

  // Mode d'examen : BAC ou BFEM
  const [examenMode, setExamenMode] = useState('BAC');

  // States globaux
  const [stats, setStats] = useState(null);
  const [candidats, setCandidats] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [professeursList, setProfesseursList] = useState([]);
  const [palmares, setPalmares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filtres candidats
  const [filters, setFilters] = useState({
    annee: new Date().getFullYear(), type_examen: 'BAC', serie: '', jury: '', statut: '', search: '', statut_dossier: '', type_candidat: '', order_by: 'numero_table'
  });

  // Modals & Forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [eleveSearch, setEleveSearch] = useState('');
  const [eleveResults, setEleveResults] = useState([]);
  const [selectedEleve, setSelectedEleve] = useState(null);
  const [newCandidat, setNewCandidat] = useState({
    type_examen: 'BAC', annee: new Date().getFullYear(),
    numero_table: '', serie: 'S1', jury: '', centre_examen: '', region: 'Dakar',
    type_candidat: 'Scolaire', statut_redoublant: false, amenagement_handicap: ''
  });

  // Modal Établissement
  const [showAddEtabModal, setShowAddEtabModal] = useState(false);
  const [newEtab, setNewEtab] = useState({
    nom: '', region: 'Dakar', ville: 'Dakar',
    ia_nom: 'IA de Dakar', ief_nom: 'IEF Dakar-Centre', admin_email: '',
    telephone: '', autorisation_numero: '', code_etablissement: ''
  });

  const handleEtabRegionChange = (r) => {
    const ias = getIasByRegion(r);
    const defaultIa = ias[0] || '';
    const iefs = getIefsByIa(defaultIa);
    const defaultIef = iefs[0] || '';
    setNewEtab(f => ({ ...f, region: r, ia_nom: defaultIa, ief_nom: defaultIef }));
  };

  const handleEtabIaChange = (ia) => {
    const iefs = getIefsByIa(ia);
    const defaultIef = iefs[0] || '';
    setNewEtab(f => ({ ...f, ia_nom: ia, ief_nom: defaultIef }));
  };

  // Modal Professeur
  const [showAddProfModal, setShowAddProfModal] = useState(false);
  const [newProf, setNewProf] = useState({
    nom: '', prenom: '', email: '', telephone: '', sexe: 'M',
    region: 'Dakar', ville: 'Dakar', matiere_principale: 'Mathématiques',
    etablissement_id: '', cni_numero: '', matricule_solde: '', identifiant_national: ''
  });

  // Modal Identifiants générés
  const [credentialsModalData, setCredentialsModalData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Modal suspension
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendMotif, setSuspendMotif] = useState('');

  // Modal saisie résultats
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [resultForm, setResultForm] = useState({
    details_epreuves: {}, appreciation_jury: '', date_deliberation: '', absent_epreuve: ''
  });

  // Modal relevé certifié & QR Code
  const [showReleveModal, setShowReleveModal] = useState(false);
  const [releveData, setReleveData] = useState(null);

  // Modal historique candidat
  const [showHistoriqueModal, setShowHistoriqueModal] = useState(false);
  const [historiqueData, setHistoriqueData] = useState([]);

  // Modal publication
  const [showPublierModal, setShowPublierModal] = useState(false);
  const [publierForm, setPublierForm] = useState({
    annee: new Date().getFullYear(), type_examen: 'BAC', serie: ''
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // State Demandes publiques
  const [demandesList, setDemandesList] = useState([]);
  const [demandeFilterType, setDemandeFilterType] = useState('ALL');
  const [demandeFilterStatut, setDemandeFilterStatut] = useState('ALL');
  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectMotif, setRejectMotif] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const safeFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Session expirée ou non autorisée. Redirection...', 'error');
        setTimeout(() => navigate('/auth'), 1200);
        return null;
      }
      return res;
    } catch (e) {
      console.error('Network error:', e);
      return null;
    }
  };

  // Fetch données
  const fetchStats = async () => {
    const r = await safeFetch(`${API}/office-bac/stats`);
    if (r && r.ok) setStats(await r.json());
  };

  const fetchDemandes = async () => {
    const r = await safeFetch(`${API}/office-bac/demandes`);
    if (r && r.ok) setDemandesList(await r.json());
  };

  // State Livrets Scolaires
  const [livretsList, setLivretsList] = useState([]);
  const [showAddLivretModal, setShowAddLivretModal] = useState(false);
  const [newLivret, setNewLivret] = useState({
    eleve_id: '', etablissement_id: '', annee: new Date().getFullYear(), serie: 'S1',
    moyenne_seconde: '', moyenne_premiere: '', moyenne_terminale: '', appreciation_conseil: ''
  });

  // State Cartographie Régionale du Sénégal
  const [carteData, setCarteData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('Dakar');
  const [activeMetric, setActiveMetric] = useState('total_eleves');
  const [selectedDemandeForDocs, setSelectedDemandeForDocs] = useState(null);

  const fetchCarteRegionale = async () => {
    const r = await safeFetch(`${API}/office-bac/carte-regionale`);
    if (r && r.ok) {
      setCarteData(await r.json());
    }
  };

  const fetchLivrets = async () => {
    const r = await safeFetch(`${API}/office-bac/livrets?annee=${filters.annee}`);
    if (r && r.ok) setLivretsList(await r.json());
  };

  // State Messagerie Officielle Office du BAC & Expiration globale
  const [messagesList, setMessagesList] = useState([]);
  const [selectedChannelCategory, setSelectedChannelCategory] = useState('PROFESSEUR');
  const [newMsgForm, setNewMsgForm] = useState({
    destinataire_type: 'PROFESSEUR', destinataire_id: '', sujet: '', contenu: ''
  });
  const [sessionExpDateInput, setSessionExpDateInput] = useState('');

  const fetchMessagesOffice = async () => {
    const r = await safeFetch(`${API}/messages/inbox`);
    if (r && r.ok) setMessagesList(await r.json());
  };

  const fetchSessionExpiration = async () => {
    const r = await safeFetch(`${API}/office-bac/settings/expiration-date`);
    if (r && r.ok) {
      const d = await r.json();
      if (d.setting_value) setSessionExpDateInput(d.setting_value);
    }
  };

  const handleSaveSessionExpiration = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/office-bac/settings/expiration-date`, {
        method: 'POST', headers,
        body: JSON.stringify({ expiration_date: sessionExpDateInput })
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Date d\'expiration globale de la session enregistrée !');
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (err) { showToast('Erreur réseau.', 'error'); }
  };

  const handleSendOfficeMessage = async (e) => {
    e.preventDefault();
    if (!newMsgForm.sujet || !newMsgForm.contenu) {
      showToast('Veuillez remplir le sujet et le contenu.', 'error');
      return;
    }
    try {
      const r = await fetch(`${API}/messages`, {
        method: 'POST', headers,
        body: JSON.stringify(newMsgForm)
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Message officiel expédié avec succès !');
        setNewMsgForm(f => ({ ...f, sujet: '', contenu: '' }));
        fetchMessagesOffice();
      } else {
        showToast(data.message || 'Erreur lors de l\'envoi.', 'error');
      }
    } catch (err) { showToast('Erreur réseau.', 'error'); }
  };

  // State Centres d'Examen Pré-configurés
  const [centresList, setCentresList] = useState([]);
  const [centreSearchQuery, setCentreSearchQuery] = useState('');
  const [centreRegionFilter, setCentreRegionFilter] = useState('');
  const [centreTypeFilter, setCentreTypeFilter] = useState('');
  const [showAddCentreModal, setShowAddCentreModal] = useState(false);
  const [editingCentre, setEditingCentre] = useState(null);
  const [newCentre, setNewCentre] = useState({
    nom_centre: '', type_centre: 'PRINCIPAL', centre_principal_id: '', region: 'Dakar', zone_commune: 'Dakar Plateau',
    effectif_previsionnel: 500, series_disponibles: ['S1', 'S2', 'L1', 'L2']
  });

  // State Registre des Jurys
  const [jurysList, setJurysList] = useState([]);
  const [jurySearchQuery, setJurySearchQuery] = useState('');
  const [juryRegionFilter, setJuryRegionFilter] = useState('');
  const [showAddJuryModal, setShowAddJuryModal] = useState(false);
  const [profSearchQuery, setProfSearchQuery] = useState('');
  const [selectedProf, setSelectedProf] = useState(null);
  const [selectedJurySeries, setSelectedJurySeries] = useState(['S1', 'S2', 'L1', 'L2']);
  const [newJury, setNewJury] = useState({
    numero_jury_num: '', numero_jury: '', centre_examen_id: '', centre_examen: '', centre_secondaire: '', region: 'Dakar', zone_commune: 'Dakar Plateau',
    series_autorisees: 'S1, S2, L1, L2', annee: new Date().getFullYear(), president_jury: '', president_prof_id: ''
  });

  const fetchCentres = async () => {
    const r = await safeFetch(`${API}/office-bac/centres-examen`);
    if (r && r.ok) setCentresList(await r.json());
  };

  const handleSaveCentre = async (e) => {
    e.preventDefault();
    if (!newCentre.nom_centre) {
      showToast('Veuillez entrer le nom du centre d\'examen.', 'error');
      return;
    }

    try {
      const url = editingCentre ? `${API}/office-bac/centres-examen/${editingCentre.id}` : `${API}/office-bac/centres-examen`;
      const method = editingCentre ? 'PUT' : 'POST';
      const r = await fetch(url, {
        method, headers,
        body: JSON.stringify(newCentre)
      });
      const data = await r.json();

      if (r.ok) {
        showToast(data.message);
        setShowAddCentreModal(false);
        setEditingCentre(null);
        setNewCentre({ nom_centre: '', region: 'Dakar', zone_commune: 'Dakar Plateau', effectif_previsionnel: 500, series_disponibles: ['S1', 'S2', 'L1', 'L2'] });
        fetchCentres();
      } else {
        showToast(data.message || 'Erreur lors de l\'enregistrement.', 'error');
      }
    } catch (err) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleDeleteCentre = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce centre d\'examen ?')) return;
    try {
      const r = await fetch(`${API}/office-bac/centres-examen/${id}`, { method: 'DELETE', headers });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        fetchCentres();
      } else {
        showToast(data.message || 'Erreur suppression.', 'error');
      }
    } catch (err) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const fetchJurys = async () => {
    const r = await safeFetch(`${API}/office-bac/jurys?annee=${filters.annee}&type_examen=${examenMode}`);
    if (r && r.ok) setJurysList(await r.json());
  };

  const handleAddJury = async (e) => {
    e.preventDefault();
    if (!selectedProf) {
      showToast('Veuillez désigner un Président de Jury dans la liste.', 'error');
      return;
    }
    try {
      const numRaw = newJury.numero_jury_num || newJury.numero_jury;
      const formattedNum = (numRaw + '').startsWith('Jury') ? numRaw : `Jury ${numRaw}`;
      const seriesFormatted = selectedJurySeries.length > 0 ? selectedJurySeries.join(', ') : 'Toutes séries';

      const payload = {
        ...newJury,
        numero_jury: formattedNum,
        series_autorisees: seriesFormatted,
        type_examen: examenMode,
        president_prof_id: selectedProf.id,
        president_jury: `${selectedProf.sexe === 'F' ? 'Mme.' : 'Mr.'} ${selectedProf.prenom} ${selectedProf.nom}`
      };
      const r = await fetch(`${API}/office-bac/jurys`, {
        method: 'POST', headers,
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        setShowAddJuryModal(false);
        setSelectedProf(null);
        setProfSearchQuery('');
        setNewJury({ numero_jury_num: '', numero_jury: '', centre_examen: '', region: 'Dakar', zone_commune: 'Dakar Plateau', series_autorisees: 'S1, S2, L1, L2', annee: new Date().getFullYear(), president_jury: '', president_prof_id: '' });
        setSelectedJurySeries(['S1', 'S2', 'L1', 'L2']);
        fetchJurys();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handleReattribuerJury = async (candidatId, juryNom, centreNom) => {
    try {
      const r = await fetch(`${API}/office-bac/candidats/${candidatId}/reattribuer-jury`, {
        method: 'PUT', headers,
        body: JSON.stringify({ jury: juryNom, centre_examen: centreNom })
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        fetchCandidats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handleValiderDemande = async (id) => {
    try {
      const r = await fetch(`${API}/office-bac/demandes/${id}/valider`, {
        method: 'PUT', headers
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message || 'Demande validée avec succès ! Les identifiants et le mot de passe ont été expédiés confidentiellement par email au demandeur.');
        fetchDemandes();
        fetchEtablissements();
        fetchProfesseurs();
        fetchStats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handleRejeterDemande = (demandeOrId) => {
    const dem = typeof demandeOrId === 'object' ? demandeOrId : demandesList.find(x => x.id === demandeOrId);
    setRejectModalData(dem || { id: demandeOrId, nom: 'cette demande' });
    setRejectMotif('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalData || !rejectMotif.trim()) return;
    setRejectLoading(true);
    try {
      const r = await fetch(`${API}/office-bac/demandes/${rejectModalData.id}/rejeter`, {
        method: 'PUT', headers,
        body: JSON.stringify({ motif_rejet: rejectMotif.trim() })
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Demande rejetée et email explicatif envoyé avec succès.');
        setRejectModalData(null);
        setRejectMotif('');
        fetchDemandes();
      } else {
        showToast(data.message || 'Erreur lors du rejet.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau lors du rejet.', 'error');
    } finally {
      setRejectLoading(false);
    }
  };

  const fetchPalmares = async () => {
    const r = await safeFetch(`${API}/office-bac/palmares?annee=${filters.annee}&limit=10`);
    if (r && r.ok) setPalmares(await r.json());
  };

  const fetchEtablissements = async () => {
    const r = await safeFetch(`${API}/office-bac/etablissements`);
    if (r && r.ok) setEtablissements(await r.json());
  };

  const fetchProfesseurs = async () => {
    const r = await safeFetch(`${API}/office-bac/professeurs`);
    if (r && r.ok) setProfesseursList(await r.json());
  };

  const fetchCandidats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.annee) params.append('annee', filters.annee);
      params.append('type_examen', examenMode);
      if (filters.jury) params.append('jury', filters.jury);
      if (filters.serie) params.append('serie', filters.serie);
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.statut_dossier) params.append('statut_dossier', filters.statut_dossier);
      if (filters.type_candidat) params.append('type_candidat', filters.type_candidat);
      if (filters.order_by) params.append('order_by', filters.order_by);
      if (filters.search) params.append('search', filters.search);
      const r = await safeFetch(`${API}/office-bac/candidats?${params}`);
      if (r && r.ok) setCandidats(await r.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const searchEleves = async (q) => {
    if (q.length < 2) { setEleveResults([]); return; }
    const r = await fetch(`${API}/office-bac/eleves-search?q=${encodeURIComponent(q)}`, { headers });
    if (r.ok) setEleveResults(await r.json());
  };

  const fetchHistorique = async (eleveId) => {
    try {
      const r = await fetch(`${API}/office-bac/candidats/historique/${eleveId}`, { headers });
      if (r.ok) {
        setHistoriqueData(await r.json());
        setShowHistoriqueModal(true);
      }
    } catch (e) { showToast('Erreur historique.', 'error'); }
  };

  const fetchReleve = async (id) => {
    try {
      const r = await fetch(`${API}/office-bac/releve/${id}`, { headers });
      if (r.ok) {
        setReleveData(await r.json());
        setShowReleveModal(true);
      }
    } catch (e) { showToast('Erreur chargement relevé.', 'error'); }
  };

  const handleToggleVerrou = async (id, currentStatus) => {
    try {
      const r = await fetch(`${API}/office-bac/candidats/${id}/verrouiller`, {
        method: 'PUT', headers,
        body: JSON.stringify({ verrouille: !currentStatus })
      });
      if (r.ok) {
        showToast(!currentStatus ? 'Fiche de résultats verrouillée.' : 'Fiche déverrouillée.');
        fetchCandidats();
      }
    } catch (e) { showToast('Erreur verrouillage.', 'error'); }
  };

  const copyPublicLink = () => {
    const url = `${window.location.origin}/inscription-nationale`;
    navigator.clipboard.writeText(url);
    showToast('Lien d\'inscription publique copié dans le presse-papier !');
  };

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    fetchStats();
    fetchPalmares();
    fetchEtablissements();
    fetchProfesseurs();
    fetchCentres();
    fetchJurys();
    fetchCarteRegionale();
    fetchMessagesOffice();
    fetchSessionExpiration();
  }, []);

  useEffect(() => {
    fetchCandidats();
    fetchJurys();
    fetchCentres();
    fetchProfesseurs();
    fetchEtablissements();
    fetchDemandes();
    fetchLivrets();
    fetchStats();
    fetchPalmares();
    fetchCarteRegionale();
    fetchMessagesOffice();
    fetchSessionExpiration();
  }, [tab, examenMode, filters.annee, filters.jury, filters.serie, filters.statut, filters.statut_dossier, filters.type_candidat, filters.order_by]);

  // ── Actions ──
  const handleAddEtablissement = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/office-bac/etablissements`, {
        method: 'POST', headers,
        body: JSON.stringify(newEtab)
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Établissement enregistré ! Identifiants générés.');
        setShowAddEtabModal(false);
        setCredentialsModalData({ title: `Identifiants Établissement — ${data.etablissement.nom}`, credentials: data.credentials });
        setNewEtab({
          nom: '', region: 'Dakar', ville: 'Dakar', admin_email: '',
          telephone: '', autorisation_numero: '', code_etablissement: ''
        });
        fetchEtablissements();
        fetchStats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handleAddProfesseur = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/office-bac/professeurs`, {
        method: 'POST', headers,
        body: JSON.stringify(newProf)
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Enseignant enregistré ! Identifiants générés.');
        setShowAddProfModal(false);
        setCredentialsModalData({ title: `Identifiants Enseignant — ${newProf.prenom} ${newProf.nom}`, credentials: data.credentials });
        setNewProf({
          nom: '', prenom: '', email: '', telephone: '', sexe: 'M',
          region: 'Dakar', ville: 'Dakar', matiere_principale: 'Mathématiques',
          etablissement_id: '', cni_numero: '', matricule_solde: '', identifiant_national: ''
        });
        fetchProfesseurs();
        fetchStats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handleGenererNumeros = async () => {
    if (!window.confirm(`Générer automatiquement les numéros de table pour la session ${filters.annee} ?`)) return;
    try {
      const r = await fetch(`${API}/office-bac/candidats/generer-numeros`, {
        method: 'POST', headers,
        body: JSON.stringify({ annee: filters.annee, type_examen: 'BAC' })
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        fetchCandidats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handleValiderDossier = async (id, newStatut) => {
    try {
      const r = await fetch(`${API}/office-bac/candidats/${id}/dossier`, {
        method: 'PUT', headers,
        body: JSON.stringify({ statut_dossier: newStatut })
      });
      const data = await r.json();
      if (r.ok) {
        showToast(`Dossier ${newStatut.toLowerCase()} avec succès.`);
        fetchCandidats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handleSuspendre = async (e) => {
    e.preventDefault();
    if (!suspendTarget) return;
    try {
      const r = await fetch(`${API}/office-bac/candidats/${suspendTarget.id}/suspendre`, {
        method: 'PUT', headers,
        body: JSON.stringify({ motif: suspendMotif })
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Candidature suspendue.');
        setShowSuspendModal(false);
        setSuspendTarget(null);
        setSuspendMotif('');
        fetchCandidats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handleAnnulerSuspension = async (id) => {
    if (!window.confirm('Lever la suspension de cette candidature ?')) return;
    try {
      const r = await fetch(`${API}/office-bac/candidats/${id}/suspendre`, {
        method: 'PUT', headers,
        body: JSON.stringify({ annuler: true })
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Suspension levée. Candidat convoqué.');
        fetchCandidats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handleAddCandidat = async (e) => {
    e.preventDefault();
    if (!selectedEleve) { showToast('Veuillez sélectionner un élève.', 'error'); return; }
    try {
      const r = await fetch(`${API}/office-bac/candidats`, {
        method: 'POST', headers,
        body: JSON.stringify({ ...newCandidat, eleve_id: selectedEleve.id })
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Candidat enregistré avec succès !');
        setShowAddModal(false);
        setSelectedEleve(null);
        setEleveSearch('');
        fetchCandidats();
        fetchStats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handleSaveResultat = async (e) => {
    e.preventDefault();
    if (!selectedCandidat) return;

    const epreuves = resultForm.details_epreuves;
    let totalPts = 0, totalCoeff = 0;
    Object.values(epreuves).forEach(ep => {
      const note = parseFloat(ep.note || 0);
      const coeff = parseFloat(ep.coefficient || 1);
      totalPts += note * coeff;
      totalCoeff += coeff;
    });
    const moyenne = totalCoeff > 0 ? parseFloat((totalPts / totalCoeff).toFixed(2)) : null;

    try {
      const r = await fetch(`${API}/office-bac/candidats/${selectedCandidat.id}/resultats`, {
        method: 'PUT', headers,
        body: JSON.stringify({
          moyenne,
          details_epreuves: epreuves,
          appreciation_jury: resultForm.appreciation_jury,
          date_deliberation: resultForm.date_deliberation || null,
          absent_epreuve: resultForm.absent_epreuve || null
        })
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Résultats enregistrés ! Moyenne calculée : ' + (moyenne ?? '—') + '/20');
        setShowResultModal(false);
        fetchCandidats();
        fetchStats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handlePublier = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/office-bac/publier`, {
        method: 'POST', headers,
        body: JSON.stringify(publierForm)
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        setShowPublierModal(false);
        fetchCandidats();
        fetchStats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const handleDeleteCandidat = async (id) => {
    if (!window.confirm('Supprimer ce candidat ?')) return;
    try {
      const r = await fetch(`${API}/office-bac/candidats/${id}`, { method: 'DELETE', headers });
      const data = await r.json();
      if (r.ok) { showToast('Candidat supprimé.'); fetchCandidats(); fetchStats(); }
      else showToast(data.message || 'Erreur.', 'error');
    } catch (e) { showToast('Erreur réseau.', 'error'); }
  };

  const openResultModal = (c) => {
    setSelectedCandidat(c);
    let defaultEpreuves = c.details_epreuves || {};
    if (Object.keys(defaultEpreuves).length === 0 && c.serie && DEFAULT_COEFFS[c.serie]) {
      defaultEpreuves = {};
      Object.entries(DEFAULT_COEFFS[c.serie]).forEach(([mat, coeff]) => {
        defaultEpreuves[mat] = { note: '', coefficient: coeff };
      });
    }

    setResultForm({
      details_epreuves: defaultEpreuves,
      appreciation_jury: c.appreciation_jury || '',
      date_deliberation: c.date_deliberation ? c.date_deliberation.split('T')[0] : new Date().toISOString().split('T')[0],
      absent_epreuve: c.absent_epreuve || ''
    });
    setShowResultModal(true);
  };

  const handleDispatchAlphabetique = async () => {
    if (!window.confirm(` Lancer la répartition automatique des candidats par ORDRE ALPHABÉTIQUE et par CAPACITÉ DE JURY (120 candidats max/jury) pour la session ${examenMode} ${filters.annee} ?\n\nDes numéros de table uniques (ex: 100101, 100102...) seront automatiquement attribués.`)) return;

    try {
      const r = await fetch(`${API}/office-bac/dispatch-alphabetique`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type_examen: examenMode,
          annee: filters.annee,
          capacite_defaut: 120
        })
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        fetchCandidats();
        fetchJurys();
        fetchStats();
      } else {
        showToast(data.message || 'Erreur répartition.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleRestituerLivrets = async () => {
    if (!window.confirm(`↩️ Confirmer la Restitution Officielle de TOUS les Livrets Scolaires de la session BAC ${filters.annee} aux établissements du Sénégal après fin des délibérations ?`)) return;

    try {
      const r = await fetch(`${API}/office-bac/restituer-livrets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ annee: filters.annee })
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        showToast(data.message || 'Erreur lors de la restitution.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <div className="ob-dashboard">
      {/* Toast */}
      {toast && (
        <div className={`ob-toast ob-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Navigation Sidebar & Header mobile */}
      <OfficeSidebar
        tab={tab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        examenMode={examenMode}
        setExamenMode={setExamenMode}
        setFilters={setFilters}
        navigate={navigate}
        logout={logout}
        pendingDemandesCount={demandesList.filter(d => d.statut === 'EN_ATTENTE').length}
      />

      {/* Main Container */}
      <main className="ob-main">
        {/* Topbar */}
        <OfficeTopbar examenMode={examenMode} copyPublicLink={copyPublicLink} />

        {/* Content Area */}
        <div className="ob-content-area">
          <div className="ob-content-inner">
            {tab === 'overview' && (
              <OfficeOverviewTab
                stats={stats}
                etablissements={etablissements}
                professeursList={professeursList}
                palmares={palmares}
                navigate={navigate}
                setShowPublierModal={setShowPublierModal}
                getMentionColor={getMentionColor}
                demandesList={demandesList}
              />
            )}
            {tab === 'demandes' && (
              <OfficeDemandesTab
                demandesList={demandesList}
                demandeFilterType={demandeFilterType}
                setDemandeFilterType={setDemandeFilterType}
                demandeFilterStatut={demandeFilterStatut}
                setDemandeFilterStatut={setDemandeFilterStatut}
                copyPublicLink={copyPublicLink}
                fetchDemandes={fetchDemandes}
                handleValiderDemande={handleValiderDemande}
                handleRejeterDemande={handleRejeterDemande}
                selectedDemandeForDocs={selectedDemandeForDocs}
                setSelectedDemandeForDocs={setSelectedDemandeForDocs}
              />
            )}
            {tab === 'etablissements' && (
              <OfficeEtablissementsTab
                etablissements={etablissements}
                setShowAddEtabModal={setShowAddEtabModal}
              />
            )}
            {tab === 'professeurs' && (
              <OfficeProfesseursTab
                professeursList={professeursList}
                setShowAddProfModal={setShowAddProfModal}
              />
            )}
            {tab === 'centres' && (
              <OfficeCentresTab
                examenMode={examenMode}
                centresList={centresList}
                centreSearchQuery={centreSearchQuery}
                setCentreSearchQuery={setCentreSearchQuery}
                centreTypeFilter={centreTypeFilter}
                setCentreTypeFilter={setCentreTypeFilter}
                centreRegionFilter={centreRegionFilter}
                setCentreRegionFilter={setCentreRegionFilter}
                SENEGAL_REGIONS_ZONES={SENEGAL_REGIONS_ZONES}
                fetchCentres={fetchCentres}
                setEditingCentre={setEditingCentre}
                setNewCentre={setNewCentre}
                setShowAddCentreModal={setShowAddCentreModal}
                handleDeleteCentre={handleDeleteCentre}
              />
            )}
            {tab === 'jurys' && (
              <OfficeJurysTab
                examenMode={examenMode}
                jurysList={jurysList}
                jurySearchQuery={jurySearchQuery}
                setJurySearchQuery={setJurySearchQuery}
                juryRegionFilter={juryRegionFilter}
                setJuryRegionFilter={setJuryRegionFilter}
                sessionExpDateInput={sessionExpDateInput}
                setSessionExpDateInput={setSessionExpDateInput}
                fetchJurys={fetchJurys}
                handleDispatchAlphabetique={handleDispatchAlphabetique}
                fetchProfesseurs={fetchProfesseurs}
                setShowAddJuryModal={setShowAddJuryModal}
                handleSaveSessionExpiration={handleSaveSessionExpiration}
              />
            )}
            {tab === 'livrets' && (
              <OfficeLivretsTab
                filters={filters}
                setFilters={setFilters}
                livretsList={livretsList}
                setShowAddLivretModal={setShowAddLivretModal}
                handleRestituerLivrets={handleRestituerLivrets}
                fetchLivrets={fetchLivrets}
                handleValiderLivret={handleValiderLivret}
              />
            )}
            {tab === 'candidats' && (
              <OfficeCandidatsTab
                filters={filters}
                setFilters={setFilters}
                jurysList={jurysList}
                candidats={candidats}
                loading={loading}
                fetchProfesseurs={fetchProfesseurs}
                setShowAddJuryModal={setShowAddJuryModal}
                handleGenererNumeros={handleGenererNumeros}
                setShowAddModal={setShowAddModal}
                fetchCandidats={fetchCandidats}
                handleValiderDossier={handleValiderDossier}
                handleReattribuerJury={handleReattribuerJury}
                getStatutColor={getStatutColor}
                fetchReleve={fetchReleve}
                openResultModal={openResultModal}
                fetchHistorique={fetchHistorique}
                handleAnnulerSuspension={handleAnnulerSuspension}
                setSuspendTarget={setSuspendTarget}
                setShowSuspendModal={setShowSuspendModal}
                handleDeleteCandidat={handleDeleteCandidat}
              />
            )}
            {tab === 'saisie' && (
              <OfficeSaisieTab
                filters={filters}
                setFilters={setFilters}
                candidats={candidats}
                loading={loading}
                getMentionColor={getMentionColor}
                handleToggleVerrou={handleToggleVerrou}
                openResultModal={openResultModal}
              />
            )}
            {tab === 'publication' && (
              <OfficePublicationTab
                stats={stats}
                setShowPublierModal={setShowPublierModal}
              />
            )}
            {tab === 'statistiques' && (
              <OfficeStatsTab
                stats={stats}
                carteData={carteData}
                activeMetric={activeMetric}
                setActiveMetric={setActiveMetric}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                fetchStats={fetchStats}
                fetchCarteRegionale={fetchCarteRegionale}
              />
            )}
            {tab === 'messagerie' && (
              <OfficeMessagerieTab
                messagesList={messagesList}
                selectedChannelCategory={selectedChannelCategory}
                setSelectedChannelCategory={setSelectedChannelCategory}
                newMsgForm={newMsgForm}
                setNewMsgForm={setNewMsgForm}
                professeursList={professeursList}
                etablissements={etablissements}
                fetchMessagesOffice={fetchMessagesOffice}
                handleSendOfficeMessage={handleSendOfficeMessage}
              />
            )}
          </div>
        </div>
      </main>

      {/* ══ MODAL TRANSMISSION LIVRET SCOLAIRE BAC ══ */}
      {showAddLivretModal && (
        <div className="ob-modal-overlay" onClick={() => setShowAddLivretModal(false)}>
          <div className="ob-modal ob-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} /> Transmettre un Livret Scolaire du BAC
              </h3>
              <button onClick={() => setShowAddLivretModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddLivret} className="ob-modal-body">
              <div className="ob-form-group">
                <label>Rechercher le candidat élève *</label>
                <div className="ob-eleve-search-wrap">
                  <Search size={15} />
                  <input placeholder="Nom, prénom ou identifiant unique (IUP)…"
                    value={eleveSearch}
                    onChange={e => { setEleveSearch(e.target.value); searchEleves(e.target.value); }} />
                </div>
                {eleveResults.length > 0 && !selectedEleve && (
                  <div className="ob-eleve-dropdown">
                    {eleveResults.map(el => (
                      <div key={el.id} className="ob-eleve-option"
                        onClick={() => { setSelectedEleve(el); setEleveSearch(`${el.prenom} ${el.nom}`); setEleveResults([]); }}>
                        <strong>{el.prenom} {el.nom}</strong>
                        <span>{el.identifiant_national} · {el.etablissement_nom}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedEleve && (
                  <div className="ob-selected-eleve">
                    <CheckCircle size={14} style={{ color: '#15803d' }} />
                    <span><strong>{selectedEleve.prenom} {selectedEleve.nom}</strong> — {selectedEleve.identifiant_national} ({selectedEleve.etablissement_nom})</span>
                    <button type="button" onClick={() => { setSelectedEleve(null); setEleveSearch(''); }}><X size={14} /></button>
                  </div>
                )}
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Série BAC *</label>
                  <select value={newLivret.serie} onChange={e => setNewLivret(f => ({ ...f, serie: e.target.value }))}>
                    {['S1', 'S2', 'S3', 'L1', 'L2', 'G', 'STEG', 'T'].map(s => <option key={s} value={s}>Série {s}</option>)}
                  </select>
                </div>
                <div className="ob-form-group">
                  <label>Session *</label>
                  <input type="number" value={newLivret.annee} onChange={e => setNewLivret(f => ({ ...f, annee: parseInt(e.target.value) }))} />
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Moyenne Classe de Seconde (/20)</label>
                  <input type="number" step="0.01" min="0" max="20" placeholder="ex: 13.50" value={newLivret.moyenne_seconde} onChange={e => setNewLivret(f => ({ ...f, moyenne_seconde: e.target.value }))} />
                </div>
                <div className="ob-form-group">
                  <label>Moyenne Classe de Première (/20)</label>
                  <input type="number" step="0.01" min="0" max="20" placeholder="ex: 14.25" value={newLivret.moyenne_premiere} onChange={e => setNewLivret(f => ({ ...f, moyenne_premiere: e.target.value }))} />
                </div>
                <div className="ob-form-group">
                  <label>Moyenne Classe de Terminale (/20) *</label>
                  <input type="number" step="0.01" min="0" max="20" placeholder="ex: 15.00" value={newLivret.moyenne_terminale} onChange={e => setNewLivret(f => ({ ...f, moyenne_terminale: e.target.value }))} required />
                </div>
              </div>

              <div className="ob-form-group">
                <label>Appréciation Générale du Conseil de Classe</label>
                <textarea rows={3} placeholder="Appréciation synthétique sur l'assiduité, le comportement et le travail du candidat pendant son cursus secondaire…" value={newLivret.appreciation_conseil} onChange={e => setNewLivret(f => ({ ...f, appreciation_conseil: e.target.value }))} />
              </div>

              <div className="ob-modal-footer">
                <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddLivretModal(false)}>Annuler</button>
                <button type="submit" className="ob-btn ob-btn-primary"><Send size={16} /> Transmettre au Jury du BAC</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL AJOUT ÉTABLISSEMENT ══ */}
      {showAddEtabModal && (
        <div className="ob-modal-overlay" onClick={() => setShowAddEtabModal(false)}>
          <div className="ob-modal ob-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header">
              <div>
                <h3>Nouvel Établissement (Lycée / Centre d'Examen)</h3>
                <p>Enregistrement d'un établissement scolaire et création de l'accès administrateur</p>
              </div>
              <button onClick={() => setShowAddEtabModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddEtablissement} className="ob-modal-body">
              <div className="ob-form-group">
                <label>Nom Officiel de l'Établissement *</label>
                <input placeholder="ex: Lycée Lamine Guèye" value={newEtab.nom}
                  onChange={e => setNewEtab(f => ({ ...f, nom: e.target.value }))} required />
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Adresse Email de Contact *</label>
                  <input type="email" placeholder="ex: contact@education.sn" value={newEtab.admin_email}
                    onChange={e => setNewEtab(f => ({ ...f, admin_email: e.target.value }))} required />
                </div>
                <div className="ob-form-group">
                  <label>Numéro de Téléphone *</label>
                  <input placeholder="ex: +221 33 800 00 00" value={newEtab.telephone || ''}
                    onChange={e => setNewEtab(f => ({ ...f, telephone: e.target.value }))} required />
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Région du Sénégal *</label>
                  <select value={newEtab.region} onChange={e => handleEtabRegionChange(e.target.value)}>
                    {REFERENTIEL_IA_IEF.map(r => <option key={r.region} value={r.region}>{r.region}</option>)}
                  </select>
                </div>
                <div className="ob-form-group">
                  <label>Inspection d'Académie (IA) *</label>
                  <select value={newEtab.ia_nom || ''} onChange={e => handleEtabIaChange(e.target.value)} required>
                    {getIasByRegion(newEtab.region).map(ia => (
                      <option key={ia} value={ia}>{ia}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Inspection de l'Éducation et de la Formation (IEF) *</label>
                  <select value={newEtab.ief_nom || ''} onChange={e => setNewEtab(f => ({ ...f, ief_nom: e.target.value }))} required>
                    {getIefsByIa(newEtab.ia_nom).map(ief => (
                      <option key={ief} value={ief}>{ief}</option>
                    ))}
                  </select>
                </div>
                <div className="ob-form-group">
                  <label>Ville / Commune *</label>
                  <input placeholder="ex: Dakar" value={newEtab.ville}
                    onChange={e => setNewEtab(f => ({ ...f, ville: e.target.value }))} required />
                </div>
              </div>

              <div className="ob-form-group">
                <label>Code Établissement (Si déjà attribué - optionnel)</label>
                <input placeholder="Optionnel — Laisser vide pour auto-génération (ex: ETAB-DKR-4892)" value={newEtab.code_etablissement}
                  onChange={e => setNewEtab(f => ({ ...f, code_etablissement: e.target.value }))} />
              </div>

              <div className="ob-form-group">
                <label>N° Arrêté / Autorisation d'Ouverture MEN *</label>
                <input placeholder="ex: Arrêté ministériel N° 004892/MEN/SG" value={newEtab.autorisation_numero || ''}
                  onChange={e => setNewEtab(f => ({ ...f, autorisation_numero: e.target.value }))} required />
              </div>

              <div className="ob-modal-footer">
                <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddEtabModal(false)}>Annuler</button>
                <button type="submit" className="ob-btn ob-btn-primary"><Plus size={16} /> Générer les Accès Établissement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL AJOUT PROFESSEUR ══ */}
      {showAddProfModal && (
        <div className="ob-modal-overlay" onClick={() => setShowAddProfModal(false)}>
          <div className="ob-modal ob-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header">
              <div>
                <h3>Nouveau Professeur / Correcteur National</h3>
                <p>Création d'un profil enseignant avec enregistrement des pièces administratives</p>
              </div>
              <button onClick={() => setShowAddProfModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProfesseur} className="ob-modal-body">
              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Civilité / Sexe *</label>
                  <select value={newProf.sexe || 'M'} onChange={e => setNewProf(f => ({ ...f, sexe: e.target.value }))}>
                    <option value="M">Masculin — Mr.</option>
                    <option value="F">Féminin — Mme.</option>
                  </select>
                </div>
                <div className="ob-form-group">
                  <label>Prénom de l'Enseignant *</label>
                  <input placeholder="ex: Amadou" value={newProf.prenom}
                    onChange={e => setNewProf(f => ({ ...f, prenom: e.target.value }))} required />
                </div>
                <div className="ob-form-group">
                  <label>Nom de l'Enseignant *</label>
                  <input placeholder="ex: Diallo" value={newProf.nom}
                    onChange={e => setNewProf(f => ({ ...f, nom: e.target.value }))} required />
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Adresse Email de connexion *</label>
                  <input type="email" placeholder="prof.diallo@education.sn" value={newProf.email}
                    onChange={e => setNewProf(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="ob-form-group">
                  <label>Numéro de Téléphone *</label>
                  <input placeholder="ex: +221 77 000 00 00" value={newProf.telephone}
                    onChange={e => setNewProf(f => ({ ...f, telephone: e.target.value }))} required />
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Région du Sénégal *</label>
                  <select value={newProf.region || 'Dakar'} onChange={e => setNewProf(f => ({ ...f, region: e.target.value }))}>
                    {Object.keys(SENEGAL_REGIONS_ZONES).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="ob-form-group">
                  <label>Ville / Commune *</label>
                  <input placeholder="ex: Dakar" value={newProf.ville || ''}
                    onChange={e => setNewProf(f => ({ ...f, ville: e.target.value }))} required />
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Discipline / Matière Principale d'enseignement *</label>
                  <select value={newProf.matiere_principale} onChange={e => setNewProf(f => ({ ...f, matiere_principale: e.target.value }))}>
                    {['Mathématiques', 'Sciences Physiques', 'SVT', 'Français', 'Philosophie', 'Anglais', 'Histoire-Géo', 'Comptabilité', 'Économie & Droit'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="ob-form-group">
                  <label>Rattacher à un Établissement</label>
                  <select value={newProf.etablissement_id} onChange={e => setNewProf(f => ({ ...f, etablissement_id: e.target.value }))}>
                    <option value="">Aucun (Examinateur National Indépendant)</option>
                    {etablissements.map(e => <option key={e.id} value={e.id}>{e.nom} ({e.region})</option>)}
                  </select>
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>N° Carte Nationale d'Identité (CNI) *</label>
                  <input placeholder="ex: 1 757 1994 00291" value={newProf.cni_numero || ''}
                    onChange={e => setNewProf(f => ({ ...f, cni_numero: e.target.value }))} />
                </div>
                <div className="ob-form-group">
                  <label>Matricule de la Solde / Réf. Admin</label>
                  <input placeholder="ex: 649 201/F" value={newProf.matricule_solde || ''}
                    onChange={e => setNewProf(f => ({ ...f, matricule_solde: e.target.value }))} />
                </div>
              </div>

              <div className="ob-form-group">
                <label>Identifiant Unique Enseignant (IUP - optionnel)</label>
                <input placeholder="Laisser vide pour auto-générer (ex: PROF-SN-940212)" value={newProf.identifiant_national}
                  onChange={e => setNewProf(f => ({ ...f, identifiant_national: e.target.value }))} />
              </div>

              <div className="ob-modal-footer">
                <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddProfModal(false)}>Annuler</button>
                <button type="submit" className="ob-btn ob-btn-primary"><Plus size={16} /> Enregistrer l'Enseignant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL IDENTIFIANTS UNIQUE GÉNÉRÉS ══ */}
      {credentialsModalData && (
        <div className="ob-modal-overlay" onClick={() => setCredentialsModalData(null)}>
          <div className="ob-modal" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header" style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
              <h3 style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={20} /> {credentialsModalData.title}
              </h3>
              <button onClick={() => setCredentialsModalData(null)}><X size={20} /></button>
            </div>
            <div className="ob-modal-body">
              <p style={{ fontSize: 13, color: '#475569' }}>
                Un compte sécurisé a été automatiquement créé dans le système LeralScolaire. Transmettez ces identifiants à l'utilisateur :
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {credentialsModalData.credentials.code_etablissement && (
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CODE ÉTABLISSEMENT (ID UNIQUE)</span>
                    <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 800, color: '#131e6c' }}>{credentialsModalData.credentials.code_etablissement}</div>
                  </div>
                )}

                {credentialsModalData.credentials.identifiant_national && (
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>IDENTIFIANT UNIQUE PROF (IUP)</span>
                    <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 800, color: '#131e6c' }}>{credentialsModalData.credentials.identifiant_national}</div>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>EMAIL / LOGIN DE CONNEXION</span>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{credentialsModalData.credentials.login}</div>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: '#b45309', fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Key size={13} /> MOT DE PASSE TEMPORAIRE UNIQUE
                  </span>
                  <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 900, color: '#b45309', letterSpacing: 1 }}>{credentialsModalData.credentials.temp_password}</div>
                </div>
              </div>

              <div className="ob-modal-footer">
                <button
                  type="button"
                  className="ob-btn ob-btn-primary"
                  onClick={() => {
                    const text = `Identifiants LeralScolaire :\nLogin: ${credentialsModalData.credentials.login}\nMot de passe temporaire: ${credentialsModalData.credentials.temp_password}`;
                    navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 3000);
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copié dans le presse-papier !' : 'Copier les Identifiants'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL NOUVEAU JURY & CENTRE D'EXAMEN ══ */}
      {showAddJuryModal && (
        <div className="ob-modal-overlay" onClick={() => setShowAddJuryModal(false)}>
          <div className="ob-modal ob-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header">
              <div>
                <h3>Créer un nouveau Jury & Centre d'Examen</h3>
                <p>Enregistrement dans le registre national des jurys et convocation du Président</p>
              </div>
              <button onClick={() => setShowAddJuryModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddJury} className="ob-modal-body">
              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Numéro de Jury (ex: 1002) *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ padding: '8px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Jury N°</span>
                    <input
                      type="number"
                      min="100"
                      max="9999"
                      placeholder="ex: 1002"
                      value={newJury.numero_jury_num || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setNewJury(f => ({ ...f, numero_jury_num: val, numero_jury: val ? `Jury ${val}` : '' }));
                      }}
                      required
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div className="ob-form-group">
                  <label>Région *</label>
                  <select
                    value={newJury.region}
                    onChange={e => {
                      const reg = e.target.value;
                      const defaultZone = (SENEGAL_REGIONS_ZONES[reg] && SENEGAL_REGIONS_ZONES[reg][0]) || 'Centre';
                      setNewJury(f => ({
                        ...f,
                        region: reg,
                        zone_commune: defaultZone,
                        centre_examen: '',
                        centre_examen_id: '',
                        centre_secondaire: ''
                      }));
                    }}
                  >
                    {Object.keys(SENEGAL_REGIONS_ZONES).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>
                    Centre Principal (Hôte — {newJury.region}) *
                  </label>
                  <select
                    value={newJury.centre_examen}
                    onChange={e => {
                      const selectedName = e.target.value;
                      const foundCentre = centresList.find(c => c.nom_centre === selectedName);
                      if (foundCentre) {
                        setSelectedJurySeries(foundCentre.series_disponibles || ['S1', 'S2', 'L1', 'L2']);
                        setNewJury(f => ({
                          ...f,
                          centre_examen_id: foundCentre.id,
                          centre_examen: foundCentre.nom_centre,
                          region: foundCentre.region,
                          zone_commune: foundCentre.zone_commune,
                          series_autorisees: (foundCentre.series_disponibles || ['S1', 'S2', 'L1', 'L2']).join(', ')
                        }));
                      } else {
                        setNewJury(f => ({ ...f, centre_examen: selectedName }));
                      }
                    }}
                    required
                  >
                    <option value="">-- Sélectionnez un Centre Principal ({newJury.region}) --</option>
                    {centresList
                      .filter(c => (c.type_centre || 'PRINCIPAL') === 'PRINCIPAL' && (!newJury.region || c.region === newJury.region))
                      .map(c => (
                        <option key={c.id} value={c.nom_centre}>
                          {c.nom_centre} ({c.zone_commune})
                        </option>
                      ))}
                  </select>
                  {newJury.centre_examen && (() => {
                    const existingInSameCentre = jurysList.filter(j => j.centre_examen === newJury.centre_examen);
                    if (existingInSameCentre.length > 0) {
                      return (
                        <div style={{ fontSize: 11.5, color: '#0369a1', background: '#e0f2fe', padding: '6px 10px', borderRadius: 6, marginTop: 6, fontWeight: 600 }}>
                          Ce centre hôte héberge déjà <strong>{existingInSameCentre.length} jury(s)</strong> : {existingInSameCentre.map(j => j.numero_jury).join(', ')}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="ob-form-group">
                  <label style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>
                    Centre Secondaire Rattaché ({newJury.region})
                  </label>
                  <select
                    value={newJury.centre_secondaire || ''}
                    onChange={e => setNewJury(f => ({ ...f, centre_secondaire: e.target.value }))}
                  >
                    <option value="">-- Aucun (Tous composent au Centre Principal) --</option>
                    {centresList
                      .filter(c => c.type_centre === 'SECONDAIRE' && (!newJury.region || c.region === newJury.region))
                      .map(cs => (
                        <option key={cs.id} value={cs.nom_centre}>
                          {cs.nom_centre} ({cs.zone_commune})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="ob-form-group">
                <label>Séries prises en charge par ce jury (Cochez les séries concernées) *</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6, padding: '12px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 10 }}>
                  {ALL_SERIES_OPTIONS.map(s => {
                    const isChecked = selectedJurySeries.includes(s);
                    return (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: isChecked ? '#e0f2fe' : '#ffffff', color: isChecked ? '#0369a1' : '#475569', padding: '6px 12px', borderRadius: 8, border: isChecked ? '1.5px solid #0284c7' : '1px solid #cbd5e1' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            let updated = [...selectedJurySeries];
                            if (e.target.checked) {
                              if (!updated.includes(s)) updated.push(s);
                            } else {
                              updated = updated.filter(item => item !== s);
                            }
                            setSelectedJurySeries(updated);
                            setNewJury(f => ({ ...f, series_autorisees: updated.join(', ') }));
                          }}
                        />
                        {s}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="ob-form-group">
                <label>Désigner le Président de Jury (Recherche en temps réel par Nom, Prénom ou Matricule) *</label>
                {!selectedProf ? (
                  <div style={{ position: 'relative' }}>
                    <div className="ob-eleve-search-wrap">
                      <Search size={15} />
                      <input
                        placeholder="Tapez le nom, prénom, discipline ou matricule (ex: Diallo, PROF-SN-…)"
                        value={profSearchQuery}
                        onChange={e => setProfSearchQuery(e.target.value)}
                      />
                    </div>
                    {(() => {
                      const q = profSearchQuery.toLowerCase().trim();
                      const cleanQ = q.replace(/[\s-]/g, '');
                      const filtered = professeursList.filter(p => {
                        const nom = (p.nom || '').toLowerCase();
                        const prenom = (p.prenom || '').toLowerCase();
                        const ine = (p.identifiant_national || '').toLowerCase();
                        const ineClean = ine.replace(/[\s-]/g, '');
                        const matiere = (p.matiere_principale || '').toLowerCase();
                        const email = (p.email || '').toLowerCase();

                        return nom.includes(q) ||
                               prenom.includes(q) ||
                               ine.includes(q) ||
                               (cleanQ.length > 0 && ineClean.includes(cleanQ)) ||
                               matiere.includes(q) ||
                               email.includes(q);
                      });

                      return (
                        <div className="ob-eleve-dropdown" style={{ maxHeight: 220, overflowY: 'auto' }}>
                          {filtered.length > 0 ? (
                            filtered.slice(0, 10).map(p => (
                              <div
                                key={p.id}
                                className="ob-eleve-option"
                                onClick={() => {
                                  setSelectedProf(p);
                                  setProfSearchQuery('');
                                  setNewJury(f => ({
                                    ...f,
                                    president_prof_id: p.id,
                                    president_jury: `Pr. ${p.prenom || ''} ${p.nom || ''}`.trim()
                                  }));
                                }}
                              >
                                <strong>Pr. {p.prenom || ''} {p.nom || ''}</strong>
                                <span>
                                  <code>{p.identifiant_national || 'PROF'}</code> · {p.matiere_principale || 'Enseignant'} ({p.region || 'Sénégal'})
                                </span>
                              </div>
                            ))
                          ) : (
                            <div style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                              Aucun enseignant trouvé pour "{profSearchQuery}"
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="ob-selected-eleve">
                    <CheckCircle size={15} style={{ color: '#15803d' }} />
                    <span>
                      <strong>{selectedProf.sexe === 'F' ? 'Mme.' : 'Mr.'} {selectedProf.prenom} {selectedProf.nom}</strong> — <code>{selectedProf.identifiant_national || 'PROF-SN'}</code> ({selectedProf.matiere_principale || 'Général'} · {selectedProf.region || 'Sénégal'})
                    </span>
                    <button type="button" onClick={() => setSelectedProf(null)}><X size={14} /></button>
                  </div>
                )}
                <span style={{ fontSize: 11, color: '#0284c7', marginTop: 6, display: 'block' }}>
                 Une convocation officielle pré-rédigée sera automatiquement transmise dans la messagerie et l'email du professeur désigné.
                </span>
              </div>

              <div className="ob-modal-footer">
                <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddJuryModal(false)}>Annuler</button>
                <button type="submit" className="ob-btn ob-btn-primary"><Plus size={16} /> Enregistrer le Jury</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL PRÉ-CONFIGURATION CENTRE D'EXAMEN ══ */}
      {showAddCentreModal && (
        <div className="ob-modal-overlay" onClick={() => setShowAddCentreModal(false)}>
          <div className="ob-modal ob-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header">
              <div>
                <h3>{editingCentre ? 'Modifier le Centre d\'Examen' : 'Pré-configurer un Centre d\'Examen'}</h3>
                <p>Définissez les paramètres du Centre Principal (Hôte) ou du Centre Secondaire rattaché</p>
              </div>
              <button onClick={() => setShowAddCentreModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCentre} className="ob-modal-body">
              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Type de Centre *</label>
                  <select
                    value={newCentre.type_centre || 'PRINCIPAL'}
                    onChange={e => setNewCentre(f => ({ ...f, type_centre: e.target.value }))}
                  >
                    <option value="PRINCIPAL">Centre Principal (Établissement Hôte / Siège de Jury)</option>
                    <option value="SECONDAIRE">Centre Secondaire (Centre Rattaché d'Épreuves Écrites)</option>
                  </select>
                </div>

                {newCentre.type_centre === 'SECONDAIRE' && (
                  <div className="ob-form-group">
                    <label>Rattacher au Centre Principal *</label>
                    <select
                      value={newCentre.centre_principal_id || ''}
                      onChange={e => {
                        const pid = e.target.value;
                        const parent = centresList.find(c => c.id == pid);
                        setNewCentre(f => ({
                          ...f,
                          centre_principal_id: pid,
                          region: parent ? parent.region : f.region,
                          zone_commune: parent ? parent.zone_commune : f.zone_commune
                        }));
                      }}
                      required
                    >
                      <option value="">-- Sélectionner le Centre Principal Hôte --</option>
                      {centresList.filter(c => (c.type_centre || 'PRINCIPAL') === 'PRINCIPAL').map(p => (
                        <option key={p.id} value={p.id}>{p.nom_centre} ({p.region} — {p.zone_commune})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="ob-form-group">
                <label>Nom du Centre d'Examen *</label>
                <input
                  placeholder={newCentre.type_centre === 'SECONDAIRE' ? "ex: CEM Ababacar Sy (Centre Secondaire)" : "ex: Lycée Seydina Limamou Laye"}
                  value={newCentre.nom_centre}
                  onChange={e => setNewCentre(f => ({ ...f, nom_centre: e.target.value }))}
                  required
                />
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Région *</label>
                  <select
                    value={newCentre.region}
                    onChange={e => {
                      const reg = e.target.value;
                      const defaultZone = (SENEGAL_REGIONS_ZONES[reg] && SENEGAL_REGIONS_ZONES[reg][0]) || 'Centre';
                      setNewCentre(f => ({ ...f, region: reg, zone_commune: defaultZone }));
                    }}
                  >
                    {Object.keys(SENEGAL_REGIONS_ZONES).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="ob-form-group">
                  <label>Zone / Commune *</label>
                  <select
                    value={newCentre.zone_commune}
                    onChange={e => setNewCentre(f => ({ ...f, zone_commune: e.target.value }))}
                  >
                    {(SENEGAL_REGIONS_ZONES[newCentre.region] || ['Centre']).map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ob-form-group">
                <label>Effectif Prévisionnel de Candidats (Capacité)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="ex: 500"
                  value={newCentre.effectif_previsionnel}
                  onChange={e => setNewCentre(f => ({ ...f, effectif_previsionnel: e.target.value }))}
                />
              </div>

              <div className="ob-form-group">
                <label>Séries Disponibles / Autorisées dans ce Centre *</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6, padding: '12px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 10 }}>
                  {ALL_SERIES_OPTIONS.map(s => {
                    const isChecked = (newCentre.series_disponibles || []).includes(s);
                    return (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: isChecked ? '#e0f2fe' : '#ffffff', color: isChecked ? '#0369a1' : '#475569', padding: '6px 12px', borderRadius: 8, border: isChecked ? '1.5px solid #0284c7' : '1px solid #cbd5e1' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            let updated = [...(newCentre.series_disponibles || [])];
                            if (e.target.checked) {
                              if (!updated.includes(s)) updated.push(s);
                            } else {
                              updated = updated.filter(item => item !== s);
                            }
                            setNewCentre(f => ({ ...f, series_disponibles: updated }));
                          }}
                        />
                        {s}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="ob-modal-footer">
                <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddCentreModal(false)}>Annuler</button>
                <button type="submit" className="ob-btn ob-btn-primary">
                  <Save size={16} /> {editingCentre ? 'Enregistrer les Modifications' : 'Créer le Centre d\'Examen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL AJOUT CANDIDAT ══ */}
      {showAddModal && (
        <div className="ob-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ob-modal" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header">
              <h3>Nouveau Candidat</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCandidat} className="ob-modal-body">
              <div className="ob-form-group">
                <label>Rechercher l'élève *</label>
                <div className="ob-eleve-search-wrap">
                  <Search size={15} />
                  <input placeholder="Nom, prénom ou identifiant national…"
                    value={eleveSearch}
                    onChange={e => { setEleveSearch(e.target.value); searchEleves(e.target.value); }} />
                </div>
                {eleveResults.length > 0 && !selectedEleve && (
                  <div className="ob-eleve-dropdown">
                    {eleveResults.map(el => (
                      <div key={el.id} className="ob-eleve-option"
                        onClick={() => { setSelectedEleve(el); setEleveSearch(`${el.prenom} ${el.nom}`); setEleveResults([]); }}>
                        <strong>{el.prenom} {el.nom}</strong>
                        <span>{el.identifiant_national} · {el.etablissement_nom}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedEleve && (
                  <div className="ob-selected-eleve">
                    <CheckCircle size={14} style={{ color: '#15803d' }} />
                    <span><strong>{selectedEleve.prenom} {selectedEleve.nom}</strong> — {selectedEleve.identifiant_national}</span>
                    <button type="button" onClick={() => { setSelectedEleve(null); setEleveSearch(''); }}><X size={14} /></button>
                  </div>
                )}
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Type de candidat *</label>
                  <select value={newCandidat.type_candidat} onChange={e => setNewCandidat(f => ({ ...f, type_candidat: e.target.value }))}>
                    <option value="Scolaire">Scolaire (Issu d'établissement)</option>
                    <option value="Candidat Libre">Candidat Libre</option>
                  </select>
                </div>
                <div className="ob-form-group">
                  <label>Redoublant ?</label>
                  <select value={newCandidat.statut_redoublant} onChange={e => setNewCandidat(f => ({ ...f, statut_redoublant: e.target.value === 'true' }))}>
                    <option value="false">Non (Nouveau)</option>
                    <option value="true">Oui (Redoublant)</option>
                  </select>
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Type d'examen *</label>
                  <select value={newCandidat.type_examen} onChange={e => setNewCandidat(f => ({ ...f, type_examen: e.target.value }))}>
                    <option value="BAC">BAC</option>
                    <option value="BFEM">BFEM</option>
                  </select>
                </div>
                <div className="ob-form-group">
                  <label>Année *</label>
                  <input type="number" value={newCandidat.annee}
                    onChange={e => setNewCandidat(f => ({ ...f, annee: parseInt(e.target.value) }))} />
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>N° de table</label>
                  <input placeholder="Laisser vide pour auto-générer" value={newCandidat.numero_table}
                    onChange={e => setNewCandidat(f => ({ ...f, numero_table: e.target.value }))} />
                </div>
                <div className="ob-form-group">
                  <label>Série *</label>
                  <select value={newCandidat.serie} onChange={e => setNewCandidat(f => ({ ...f, serie: e.target.value }))}>
                    {['S1', 'S2', 'S3', 'L1', 'L2', 'G', 'STEG', 'T'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Jury Officiel (Préréglé par l'Office du BAC) *</label>
                  <select
                    value={newCandidat.jury}
                    onChange={e => {
                      const selectedJ = jurysList.find(j => j.numero_jury === e.target.value);
                      setNewCandidat(f => ({
                        ...f,
                        jury: e.target.value,
                        centre_examen: selectedJ ? selectedJ.centre_examen : f.centre_examen,
                        region: selectedJ ? selectedJ.region : f.region
                      }));
                    }}
                  >
                    <option value="">Sélectionnez un Jury édité par l'Office du BAC</option>
                    {jurysList
                      .filter(j => !newCandidat.region || j.region === newCandidat.region)
                      .map(j => (
                        <option key={j.id} value={j.numero_jury}>
                          {j.numero_jury} — {j.centre_examen} ({j.region} - {j.zone_commune || ''})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="ob-form-group">
                  <label>Centre d'examen</label>
                  <input placeholder="Centre d'examen lié au jury" value={newCandidat.centre_examen} readOnly />
                </div>
              </div>

              <div className="ob-form-group">
                <label>Aménagement Handicap / Tiers-temps</label>
                <input placeholder="ex: Tiers-temps (+1/3), Assistance scripteur..." value={newCandidat.amenagement_handicap}
                  onChange={e => setNewCandidat(f => ({ ...f, amenagement_handicap: e.target.value }))} />
              </div>

              <div className="ob-modal-footer">
                <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="ob-btn ob-btn-primary"><Plus size={16} /> Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL SAISIE RÉSULTATS ══ */}
      {showResultModal && selectedCandidat && (
        <div className="ob-modal-overlay" onClick={() => setShowResultModal(false)}>
          <div className="ob-modal ob-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header">
              <div>
                <h3>Saisie des résultats & Délibération</h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  {selectedCandidat.prenom} {selectedCandidat.nom} · N° {selectedCandidat.numero_table || 'Non attribué'} · {selectedCandidat.type_examen} {selectedCandidat.annee} · Série {selectedCandidat.serie}
                </p>
              </div>
              <button onClick={() => setShowResultModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveResultat} className="ob-modal-body">
              <div className="ob-form-group">
                <label>Absence à l'examen (si applicable)</label>
                <select value={resultForm.absent_epreuve} onChange={e => setResultForm(f => ({ ...f, absent_epreuve: e.target.value }))}>
                  <option value="">Présent (Aucune absence)</option>
                  <option value="ABI">ABI — Absence Injustifiée (Ajournement direct)</option>
                  <option value="ABJ">ABJ — Absence Justifiée</option>
                </select>
              </div>

              <div className="ob-form-group">
                <label>Épreuves et Notes / Coefficients (Série {selectedCandidat.serie})</label>
                <div className="ob-epreuves-editor">
                  {Object.entries(resultForm.details_epreuves).map(([matiere, data]) => (
                    <div key={matiere} className="ob-epreuve-row">
                      <input className="ob-ep-matiere" value={matiere} readOnly />
                      <input className="ob-ep-note" type="number" min="0" max="20" step="0.25"
                        placeholder="Note /20"
                        value={data.note || ''}
                        onChange={e => setResultForm(f => ({
                          ...f,
                          details_epreuves: { ...f.details_epreuves, [matiere]: { ...data, note: e.target.value } }
                        }))} />
                      <input className="ob-ep-coeff" type="number" min="1" max="10"
                        placeholder="Coeff"
                        value={data.coefficient || ''}
                        onChange={e => setResultForm(f => ({
                          ...f,
                          details_epreuves: { ...f.details_epreuves, [matiere]: { ...data, coefficient: e.target.value } }
                        }))} />
                      <button type="button" className="ob-icon-btn ob-icon-del"
                        onClick={() => {
                          const ep = { ...resultForm.details_epreuves };
                          delete ep[matiere];
                          setResultForm(f => ({ ...f, details_epreuves: ep }));
                        }}><Trash2 size={13} /></button>
                    </div>
                  ))}
                  <button type="button" className="ob-add-epreuve-btn"
                    onClick={() => {
                      const nom = prompt('Nom de l\'épreuve (ex: Mathématiques):');
                      if (nom && nom.trim()) {
                        setResultForm(f => ({
                          ...f,
                          details_epreuves: { ...f.details_epreuves, [nom.trim()]: { note: '', coefficient: 1 } }
                        }));
                      }
                    }}>
                    <Plus size={14} /> Ajouter une épreuve
                  </button>
                </div>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Appréciation du jury</label>
                  <textarea rows={3} placeholder="Appréciation libre du jury…"
                    value={resultForm.appreciation_jury}
                    onChange={e => setResultForm(f => ({ ...f, appreciation_jury: e.target.value }))} />
                </div>
                <div className="ob-form-group">
                  <label>Date de délibération</label>
                  <input type="date" value={resultForm.date_deliberation}
                    onChange={e => setResultForm(f => ({ ...f, date_deliberation: e.target.value }))} />
                </div>
              </div>

              <div className="ob-calc-preview">
                <span> Délibération automatique : Moyenne &ge; 10/20 &rarr; Admis | 8.00 à 9.99/20 &rarr; Admissible 2nd Tour (Rattrapage).</span>
              </div>

              <div className="ob-modal-footer">
                <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowResultModal(false)}>Annuler</button>
                <button type="submit" className="ob-btn ob-btn-primary"><Save size={16} /> Valider la délibération</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL RELEVÉ CERTIFIÉ & QR CODE ══ */}
      {showReleveModal && releveData && (
        <div className="ob-modal-overlay" onClick={() => setShowReleveModal(false)}>
          <div className="ob-modal ob-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header">
              <h3> Relevé Officiel de Notes & Attestation Certifiée</h3>
              <button onClick={() => setShowReleveModal(false)}><X size={20} /></button>
            </div>
            <div className="ob-modal-body">
              <div style={{ border: '2px solid #131e6c', borderRadius: 14, padding: 24, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #131e6c', paddingBottom: 16, marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 900, color: '#131e6c', margin: 0 }}>RÉPUBLIQUE DU SÉNÉGAL</h2>
                    <p style={{ fontSize: 11, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Ministère de l'Éducation Nationale · Office du BAC</p>
                    <h3 style={{ fontSize: 14, fontWeight: 800, marginTop: 8, color: '#0f172a' }}>RELEVÉ DE NOTES OFFICIEL</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24 }}>🇸🇳</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#131e6c' }}>Session {releveData.annee}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12, marginBottom: 16, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                  <div><strong>Candidat :</strong> {releveData.prenom} {releveData.nom}</div>
                  <div><strong>N° de Table :</strong> <code style={{ color: '#131e6c', fontWeight: 700 }}>{releveData.numero_table}</code></div>
                  <div><strong>Série :</strong> {releveData.serie}</div>
                  <div><strong>Jury :</strong> {releveData.jury}</div>
                  <div><strong>Centre :</strong> {releveData.centre_examen}</div>
                  <div><strong>Établissement :</strong> {releveData.etablissement_nom || 'Candidat Libre'}</div>
                </div>

                {releveData.details_epreuves && Object.keys(releveData.details_epreuves).length > 0 && (
                  <table className="ob-table ob-table-sm" style={{ marginBottom: 16 }}>
                    <thead><tr><th>Matière</th><th>Coeff</th><th>Note/20</th><th>Points</th></tr></thead>
                    <tbody>
                      {Object.entries(releveData.details_epreuves).map(([mat, d]) => {
                        const note = parseFloat(d.note || 0);
                        const coeff = parseFloat(d.coefficient || 1);
                        return (
                          <tr key={mat}>
                            <td>{mat}</td>
                            <td>{coeff}</td>
                            <td><strong>{note.toFixed(2)}</strong></td>
                            <td>{(note * coeff).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: releveData.statut_resultat === 'Admis' ? '#15803d' : '#b45309' }}>
                      RÉSULTAT : {releveData.statut_resultat?.toUpperCase()} {releveData.mention && `(${releveData.mention})`}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Moyenne Générale : {parseFloat(releveData.moyenne).toFixed(2)} / 20</div>
                  </div>

                  <div style={{ textAlign: 'center', background: '#f1f5f9', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}>
                    <QrCode size={40} style={{ color: '#131e6c' }} />
                    <div style={{ fontSize: 9, fontFamily: 'monospace', marginTop: 4, color: '#64748b' }}>
                      Token: {releveData.qr_code_hash?.substring(0, 10)}…
                    </div>
                  </div>
                </div>
              </div>

              <div className="ob-modal-footer">
                <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowReleveModal(false)}>Fermer</button>
                <button type="button" className="ob-btn ob-btn-primary" onClick={() => window.print()}><Printer size={16} /> Imprimer Relevé Certifié</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL HISTORIQUE DU CANDIDAT ══ */}
      {showHistoriqueModal && (
        <div className="ob-modal-overlay" onClick={() => setShowHistoriqueModal(false)}>
          <div className="ob-modal ob-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header">
              <h3> Historique des Participations du Candidat</h3>
              <button onClick={() => setShowHistoriqueModal(false)}><X size={20} /></button>
            </div>
            <div className="ob-modal-body">
              {historiqueData.length === 0 ? (
                <p>Aucun historique antérieur trouvé.</p>
              ) : (
                <div className="ob-table-wrap">
                  <table className="ob-table">
                    <thead><tr><th>Session</th><th>N° Table</th><th>Examen & Série</th><th>Moyenne</th><th>Mention</th><th>Résultat</th></tr></thead>
                    <tbody>
                      {historiqueData.map(h => (
                        <tr key={h.id}>
                          <td><strong>Session {h.annee}</strong></td>
                          <td><code>{h.numero_table || '—'}</code></td>
                          <td>{h.type_examen} Série {h.serie}</td>
                          <td><strong>{h.moyenne ? parseFloat(h.moyenne).toFixed(2) + '/20' : '—'}</strong></td>
                          <td>{h.mention || '—'}</td>
                          <td><span className="ob-statut-pill" style={{ background: h.statut_resultat === 'Admis' ? '#dcfce7' : '#fee2e2', color: h.statut_resultat === 'Admis' ? '#15803d' : '#b91c1c' }}>{h.statut_resultat || h.statut_candidat}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="ob-modal-footer">
                <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowHistoriqueModal(false)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL SUSPENSION DE CANDIDATURE ══ */}
      {showSuspendModal && suspendTarget && (
        <div className="ob-modal-overlay" onClick={() => setShowSuspendModal(false)}>
          <div className="ob-modal" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header">
              <h3>🛑 Suspendre la candidature</h3>
              <button onClick={() => setShowSuspendModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSuspendre} className="ob-modal-body">
              <div className="ob-publi-warning" style={{ background: '#fff1f2', borderColor: '#fecdd3', color: '#9f1239' }}>
                <AlertCircle size={18} style={{ color: '#be123c' }} />
                <p>Vous êtes sur le point de suspendre la candidature de <strong>{suspendTarget.prenom} {suspendTarget.nom}</strong> (N° Table: {suspendTarget.numero_table || 'Non attribué'}).</p>
              </div>

              <div className="ob-form-group">
                <label>Motif obligatoire de suspension *</label>
                <textarea
                  rows={3}
                  placeholder="Saisissez le motif explicite (ex: Fraude documentaire, Dossier incomplet, Litige d'état civil…)"
                  value={suspendMotif}
                  onChange={e => setSuspendMotif(e.target.value)}
                  required
                />
              </div>

              <div className="ob-modal-footer">
                <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowSuspendModal(false)}>Annuler</button>
                <button type="submit" className="ob-btn ob-btn-danger"><AlertCircle size={16} /> Confirmer la suspension</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL PUBLICATION ══ */}
      {showPublierModal && (
        <div className="ob-modal-overlay" onClick={() => setShowPublierModal(false)}>
          <div className="ob-modal" onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header">
              <h3> Publier les résultats officiels</h3>
              <button onClick={() => setShowPublierModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handlePublier} className="ob-modal-body">
              <div className="ob-publi-warning">
                <AlertCircle size={18} />
                <p>Une fois publiés, les résultats seront certifiés et consultables immédiatement sur le portail candidat des élèves avec notifications.</p>
              </div>

              <div className="ob-form-row">
                <div className="ob-form-group">
                  <label>Type d'examen *</label>
                  <select value={publierForm.type_examen} onChange={e => setPublierForm(f => ({ ...f, type_examen: e.target.value }))}>
                    <option value="BAC">BAC</option>
                    <option value="BFEM">BFEM</option>
                  </select>
                </div>
                <div className="ob-form-group">
                  <label>Année de session *</label>
                  <input type="number" value={publierForm.annee}
                    onChange={e => setPublierForm(f => ({ ...f, annee: parseInt(e.target.value) }))} required />
                </div>
              </div>

              <div className="ob-form-group">
                <label>Série (laisser vide = toutes les séries)</label>
                <select value={publierForm.serie} onChange={e => setPublierForm(f => ({ ...f, serie: e.target.value }))}>
                  <option value="">Toutes les séries</option>
                  {['S1', 'S2', 'S3', 'L1', 'L2', 'G', 'STEG', 'T'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="ob-modal-footer">
                <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowPublierModal(false)}>Annuler</button>
                <button type="submit" className="ob-btn ob-btn-publish"><Send size={16} /> Confirmer la publication</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL REJET DE DEMANDE DE PRÉ-INSCRIPTION ══ */}
      {rejectModalData && (
        <div className="ob-modal-overlay" onClick={() => !rejectLoading && setRejectModalData(null)}>
          <div className="ob-modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="ob-modal-header" style={{ borderBottom: '1.5px solid #fecaca', background: '#fff5f5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', color: '#991b1b', fontWeight: 800 }}>Rejet de la pré-inscription</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#b91c1c' }}>Dossier #{rejectModalData.id} — {rejectModalData.prenom ? `${rejectModalData.prenom} ` : ''}{rejectModalData.nom}</p>
                </div>
              </div>
              <button onClick={() => !rejectLoading && setRejectModalData(null)} disabled={rejectLoading}><X size={20} /></button>
            </div>

            <form onSubmit={handleConfirmReject} className="ob-modal-body">
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
                ⚠️ <strong>Notification automatique par email :</strong> Le motif renseigné ci-dessous sera immédiatement expédié à <strong>{rejectModalData.email}</strong> pour l'informer de la décision et lui indiquer les pièces à corriger.
              </div>

              <div className="ob-form-group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px', display: 'block' }}>
                  Motifs fréquents (cliquez pour insérer rapidement) :
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {[
                    "Arrêté d'ouverture MEN non conforme ou illisible",
                    "Carte CNI expirée ou copie recto-verso manquante",
                    "Décret de création ou attestation NINEA non joint",
                    "Diplôme ou attestation académique non recevable",
                    "Coordonnées de l'établissement ou contact erroné"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectMotif(preset)}
                      style={{
                        fontSize: '11px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        color: '#334155',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  Motif explicite du rejet *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Détaillez le motif du refus et indiquez la liste précise des documents ou informations à compléter ou corriger..."
                  value={rejectMotif}
                  onChange={e => setRejectMotif(e.target.value)}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div className="ob-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="ob-btn ob-btn-ghost" 
                  onClick={() => setRejectModalData(null)}
                  disabled={rejectLoading}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="ob-btn ob-btn-danger"
                  disabled={rejectLoading || !rejectMotif.trim()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dc2626' }}
                >
                  <XCircle size={16} />
                  {rejectLoading ? 'Envoi de la décision…' : 'Confirmer le Rejet & Notifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeBacDashboard;
