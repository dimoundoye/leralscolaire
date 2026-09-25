import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';

import { getIasByRegion, getIefsByIa } from '../utils/referentielIaIef';
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
import { apiFetch } from '../services/http';
import AddCandidatModal from '../components/office/modals/AddCandidatModal';
import AddCentreModal from '../components/office/modals/AddCentreModal';
import AddEtablissementModal from '../components/office/modals/AddEtablissementModal';
import AddJuryModal from '../components/office/modals/AddJuryModal';
import AddLivretModal from '../components/office/modals/AddLivretModal';
import AddProfesseurModal from '../components/office/modals/AddProfesseurModal';
import CandidatResultModal from '../components/office/modals/CandidatResultModal';
import HistoriqueCandidatModal from '../components/office/modals/HistoriqueCandidatModal';
import OfficeCredentialsModal from '../components/office/modals/OfficeCredentialsModal';
import PublierResultatsModal from '../components/office/modals/PublierResultatsModal';
import RejectDemandeModal from '../components/office/modals/RejectDemandeModal';
import ReleveNotesModal from '../components/office/modals/ReleveNotesModal';
import SuspendCandidatModal from '../components/office/modals/SuspendCandidatModal';

const API = '/api';

const SENEGAL_REGIONS_ZONES = {
  Dakar: [
    'Dakar Plateau',
    'Grand Dakar',
    'Parcelles Assainies',
    'Guédiawaye',
    'Pikine',
    'Rufisque',
    'Bambilor',
    'Keur Massar',
  ],
  Thiès: ['Thiès Ville', 'Mbour', 'Tivaouane', 'Popenguine', 'Pout'],
  'Saint-Louis': ['Saint-Louis Nord', 'Saint-Louis Sud', 'Dagana', 'Podor', 'Richard-Toll'],
  Diourbel: ['Diourbel Ville', 'Mbacké', 'Bambey', 'Touba'],
  Fatick: ['Fatick Ville', 'Foundiougne', 'Gossas', 'Passy', 'Diofior'],
  Kaolack: ['Kaolack Commune', 'Ndiaganiao', 'Guinguinéo', 'Ndoffane'],
  Kolda: ['Kolda Ville', 'Vélingara', 'Medina Yoro Foulah', 'Dabo'],
  Louga: ['Louga Ville', 'Linguère', 'Kébémer', 'Dahra'],
  Matam: ['Matam Ville', 'Ranérou', 'Kanel', 'Ourossogui'],
  Sédhiou: ['Sédhiou Ville', 'Bounkiling', 'Goudomp', 'Marsassoum'],
  Tambacounda: ['Tambacounda Ville', 'Bakel', 'Goudiry', 'Koupentoum'],
  Kaffrine: ['Kaffrine Ville', 'Birkelane', 'Koungheul', 'Malem Hodar'],
  Kédougou: ['Kédougou Ville', 'Salémata', 'Saraya', 'Bandafassi'],
  Ziguinchor: ['Ziguinchor Ville', 'Bignona', 'Oussouye', 'Thionck-Essyl'],
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
    case 'ADMIS':
      return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
    case 'AJOURNÉ':
      return { bg: '#fef9c3', color: '#b45309', border: '#fde68a' };
    case 'EXCLU':
      return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' };
    case 'SUSPENDU':
      return { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' };
    default:
      return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  }
};

const DEFAULT_COEFFS = {
  S1: { Mathématiques: 6, 'Sciences Physiques': 5, SVT: 2, Français: 3, Philosophie: 2, Anglais: 2, 'Histoire-Géo': 2 },
  S2: { Mathématiques: 5, 'Sciences Physiques': 5, SVT: 5, Français: 3, Philosophie: 2, Anglais: 2, 'Histoire-Géo': 2 },
  L1: { Français: 5, Philosophie: 5, Anglais: 4, 'Histoire-Géo': 4, Mathématiques: 2, LV2: 3 },
  L2: { Français: 5, Philosophie: 4, 'Histoire-Géo': 5, Anglais: 3, Mathématiques: 2, LV2: 3 },
  STEG: { Comptabilité: 5, 'Économie & Droit': 4, Mathématiques: 4, Français: 3, Anglais: 2 },
};

// ─── Composant principal ──────────────────────
const OfficeBacDashboard = () => {
  const navigate = useNavigate();
  const { user, logout: endSession } = useAuth();
  const { tab = 'overview' } = useParams();

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
    annee: new Date().getFullYear(),
    type_examen: 'BAC',
    serie: '',
    jury: '',
    statut: '',
    search: '',
    statut_dossier: '',
    type_candidat: '',
    order_by: 'numero_table',
  });

  // Modals & Forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [eleveSearch, setEleveSearch] = useState('');
  const [eleveResults, setEleveResults] = useState([]);
  const [selectedEleve, setSelectedEleve] = useState(null);
  const [newCandidat, setNewCandidat] = useState({
    type_examen: 'BAC',
    annee: new Date().getFullYear(),
    numero_table: '',
    serie: 'S1',
    jury: '',
    centre_examen: '',
    region: 'Dakar',
    type_candidat: 'Scolaire',
    statut_redoublant: false,
    amenagement_handicap: '',
  });

  // Modal Établissement
  const [showAddEtabModal, setShowAddEtabModal] = useState(false);
  const [newEtab, setNewEtab] = useState({
    nom: '',
    region: 'Dakar',
    ville: 'Dakar',
    ia_nom: 'IA de Dakar',
    ief_nom: 'IEF Dakar-Centre',
    admin_email: '',
    telephone: '',
    autorisation_numero: '',
    code_etablissement: '',
  });

  const handleEtabRegionChange = (r) => {
    const ias = getIasByRegion(r);
    const defaultIa = ias[0] || '';
    const iefs = getIefsByIa(defaultIa);
    const defaultIef = iefs[0] || '';
    setNewEtab((f) => ({ ...f, region: r, ia_nom: defaultIa, ief_nom: defaultIef }));
  };

  const handleEtabIaChange = (ia) => {
    const iefs = getIefsByIa(ia);
    const defaultIef = iefs[0] || '';
    setNewEtab((f) => ({ ...f, ia_nom: ia, ief_nom: defaultIef }));
  };

  // Modal Professeur
  const [showAddProfModal, setShowAddProfModal] = useState(false);
  const [newProf, setNewProf] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sexe: 'M',
    region: 'Dakar',
    ville: 'Dakar',
    matiere_principale: 'Mathématiques',
    etablissement_id: '',
    cni_numero: '',
    matricule_solde: '',
    identifiant_national: '',
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
    details_epreuves: {},
    appreciation_jury: '',
    date_deliberation: '',
    absent_epreuve: '',
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
    annee: new Date().getFullYear(),
    type_examen: 'BAC',
    serie: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const headers = { 'Content-Type': 'application/json' };

  // State Demandes publiques
  const [demandesList, setDemandesList] = useState([]);
  const [demandeFilterType, setDemandeFilterType] = useState('ALL');
  const [demandeFilterStatut, setDemandeFilterStatut] = useState('ALL');
  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectMotif, setRejectMotif] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const safeFetch = async (url, options = {}) => {
    try {
      const res = await apiFetch(url, { ...options, headers });
      if (res.status === 401 || res.status === 403) {
        showToast('Session expirée ou non autorisée. Redirection...', 'error');
        setTimeout(() => endSession(), 1200);
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
    eleve_id: '',
    etablissement_id: '',
    annee: new Date().getFullYear(),
    serie: 'S1',
    moyenne_seconde: '',
    moyenne_premiere: '',
    moyenne_terminale: '',
    appreciation_conseil: '',
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
    destinataire_type: 'PROFESSEUR',
    destinataire_id: '',
    sujet: '',
    contenu: '',
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
      const r = await apiFetch(`${API}/office-bac/settings/expiration-date`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ expiration_date: sessionExpDateInput }),
      });
      const data = await r.json();
      if (r.ok) {
        showToast("Date d'expiration globale de la session enregistrée !");
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (err) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleSendOfficeMessage = async (e) => {
    e.preventDefault();
    if (!newMsgForm.sujet || !newMsgForm.contenu) {
      showToast('Veuillez remplir le sujet et le contenu.', 'error');
      return;
    }
    try {
      const r = await apiFetch(`${API}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newMsgForm),
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Message officiel expédié avec succès !');
        setNewMsgForm((f) => ({ ...f, sujet: '', contenu: '' }));
        fetchMessagesOffice();
      } else {
        showToast(data.message || "Erreur lors de l'envoi.", 'error');
      }
    } catch (err) {
      showToast('Erreur réseau.', 'error');
    }
  };

  // State Centres d'Examen Pré-configurés
  const [centresList, setCentresList] = useState([]);
  const [centreSearchQuery, setCentreSearchQuery] = useState('');
  const [centreRegionFilter, setCentreRegionFilter] = useState('');
  const [centreTypeFilter, setCentreTypeFilter] = useState('');
  const [showAddCentreModal, setShowAddCentreModal] = useState(false);
  const [editingCentre, setEditingCentre] = useState(null);
  const [newCentre, setNewCentre] = useState({
    nom_centre: '',
    type_centre: 'PRINCIPAL',
    centre_principal_id: '',
    region: 'Dakar',
    zone_commune: 'Dakar Plateau',
    effectif_previsionnel: 500,
    series_disponibles: ['S1', 'S2', 'L1', 'L2'],
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
    numero_jury_num: '',
    numero_jury: '',
    centre_examen_id: '',
    centre_examen: '',
    centre_secondaire: '',
    region: 'Dakar',
    zone_commune: 'Dakar Plateau',
    series_autorisees: 'S1, S2, L1, L2',
    annee: new Date().getFullYear(),
    president_jury: '',
    president_prof_id: '',
  });

  const fetchCentres = async () => {
    const r = await safeFetch(`${API}/office-bac/centres-examen`);
    if (r && r.ok) setCentresList(await r.json());
  };

  const handleSaveCentre = async (e) => {
    e.preventDefault();
    if (!newCentre.nom_centre) {
      showToast("Veuillez entrer le nom du centre d'examen.", 'error');
      return;
    }

    try {
      const url = editingCentre
        ? `${API}/office-bac/centres-examen/${editingCentre.id}`
        : `${API}/office-bac/centres-examen`;
      const method = editingCentre ? 'PUT' : 'POST';
      const r = await apiFetch(url, {
        method,
        headers,
        body: JSON.stringify(newCentre),
      });
      const data = await r.json();

      if (r.ok) {
        showToast(data.message);
        setShowAddCentreModal(false);
        setEditingCentre(null);
        setNewCentre({
          nom_centre: '',
          region: 'Dakar',
          zone_commune: 'Dakar Plateau',
          effectif_previsionnel: 500,
          series_disponibles: ['S1', 'S2', 'L1', 'L2'],
        });
        fetchCentres();
      } else {
        showToast(data.message || "Erreur lors de l'enregistrement.", 'error');
      }
    } catch (err) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleDeleteCentre = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce centre d'examen ?")) return;
    try {
      const r = await apiFetch(`${API}/office-bac/centres-examen/${id}`, { method: 'DELETE', headers });
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
        president_jury: `${selectedProf.sexe === 'F' ? 'Mme.' : 'Mr.'} ${selectedProf.prenom} ${selectedProf.nom}`,
      };
      const r = await apiFetch(`${API}/office-bac/jurys`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        setShowAddJuryModal(false);
        setSelectedProf(null);
        setProfSearchQuery('');
        setNewJury({
          numero_jury_num: '',
          numero_jury: '',
          centre_examen: '',
          region: 'Dakar',
          zone_commune: 'Dakar Plateau',
          series_autorisees: 'S1, S2, L1, L2',
          annee: new Date().getFullYear(),
          president_jury: '',
          president_prof_id: '',
        });
        setSelectedJurySeries(['S1', 'S2', 'L1', 'L2']);
        fetchJurys();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleReattribuerJury = async (candidatId, juryNom, centreNom) => {
    try {
      const r = await apiFetch(`${API}/office-bac/candidats/${candidatId}/reattribuer-jury`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ jury: juryNom, centre_examen: centreNom }),
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        fetchCandidats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleValiderDemande = async (id) => {
    try {
      const r = await apiFetch(`${API}/office-bac/demandes/${id}/valider`, {
        method: 'PUT',
        headers,
      });
      const data = await r.json();
      if (r.ok) {
        showToast(
          data.message ||
            'Demande validée avec succès ! Les identifiants et le mot de passe ont été expédiés confidentiellement par email au demandeur.'
        );
        fetchDemandes();
        fetchEtablissements();
        fetchProfesseurs();
        fetchStats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleRejeterDemande = (demandeOrId) => {
    const dem = typeof demandeOrId === 'object' ? demandeOrId : demandesList.find((x) => x.id === demandeOrId);
    setRejectModalData(dem || { id: demandeOrId, nom: 'cette demande' });
    setRejectMotif('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalData || !rejectMotif.trim()) return;
    setRejectLoading(true);
    try {
      const r = await apiFetch(`${API}/office-bac/demandes/${rejectModalData.id}/rejeter`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ motif_rejet: rejectMotif.trim() }),
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const searchEleves = async (q) => {
    if (q.length < 2) {
      setEleveResults([]);
      return;
    }
    const r = await apiFetch(`${API}/office-bac/eleves-search?q=${encodeURIComponent(q)}`, { headers });
    if (r.ok) setEleveResults(await r.json());
  };

  const fetchHistorique = async (eleveId) => {
    try {
      const r = await apiFetch(`${API}/office-bac/candidats/historique/${eleveId}`, { headers });
      if (r.ok) {
        setHistoriqueData(await r.json());
        setShowHistoriqueModal(true);
      }
    } catch (e) {
      showToast('Erreur historique.', 'error');
    }
  };

  const fetchReleve = async (id) => {
    try {
      const r = await apiFetch(`${API}/office-bac/releve/${id}`, { headers });
      if (r.ok) {
        setReleveData(await r.json());
        setShowReleveModal(true);
      }
    } catch (e) {
      showToast('Erreur chargement relevé.', 'error');
    }
  };

  const handleToggleVerrou = async (id, currentStatus) => {
    try {
      const r = await apiFetch(`${API}/office-bac/candidats/${id}/verrouiller`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ verrouille: !currentStatus }),
      });
      if (r.ok) {
        showToast(!currentStatus ? 'Fiche de résultats verrouillée.' : 'Fiche déverrouillée.');
        fetchCandidats();
      }
    } catch (e) {
      showToast('Erreur verrouillage.', 'error');
    }
  };

  const copyPublicLink = () => {
    const url = `${window.location.origin}/inscription-nationale`;
    navigator.clipboard.writeText(url);
    showToast("Lien d'inscription publique copié dans le presse-papier !");
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
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
  }, [
    tab,
    examenMode,
    filters.annee,
    filters.jury,
    filters.serie,
    filters.statut,
    filters.statut_dossier,
    filters.type_candidat,
    filters.order_by,
  ]);

  // ── Actions ──
  const handleAddEtablissement = async (e) => {
    e.preventDefault();
    try {
      const r = await apiFetch(`${API}/office-bac/etablissements`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newEtab),
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Établissement enregistré ! Identifiants générés.');
        setShowAddEtabModal(false);
        setCredentialsModalData({
          title: `Identifiants Établissement — ${data.etablissement.nom}`,
          credentials: data.credentials,
        });
        setNewEtab({
          nom: '',
          region: 'Dakar',
          ville: 'Dakar',
          admin_email: '',
          telephone: '',
          autorisation_numero: '',
          code_etablissement: '',
        });
        fetchEtablissements();
        fetchStats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleAddProfesseur = async (e) => {
    e.preventDefault();
    try {
      const r = await apiFetch(`${API}/office-bac/professeurs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newProf),
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Enseignant enregistré ! Identifiants générés.');
        setShowAddProfModal(false);
        setCredentialsModalData({
          title: `Identifiants Enseignant — ${newProf.prenom} ${newProf.nom}`,
          credentials: data.credentials,
        });
        setNewProf({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          sexe: 'M',
          region: 'Dakar',
          ville: 'Dakar',
          matiere_principale: 'Mathématiques',
          etablissement_id: '',
          cni_numero: '',
          matricule_solde: '',
          identifiant_national: '',
        });
        fetchProfesseurs();
        fetchStats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleGenererNumeros = async () => {
    if (!window.confirm(`Générer automatiquement les numéros de table pour la session ${filters.annee} ?`)) return;
    try {
      const r = await apiFetch(`${API}/office-bac/candidats/generer-numeros`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ annee: filters.annee, type_examen: 'BAC' }),
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        fetchCandidats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleValiderDossier = async (id, newStatut) => {
    try {
      const r = await apiFetch(`${API}/office-bac/candidats/${id}/dossier`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ statut_dossier: newStatut }),
      });
      const data = await r.json();
      if (r.ok) {
        showToast(`Dossier ${newStatut.toLowerCase()} avec succès.`);
        fetchCandidats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleSuspendre = async (e) => {
    e.preventDefault();
    if (!suspendTarget) return;
    try {
      const r = await apiFetch(`${API}/office-bac/candidats/${suspendTarget.id}/suspendre`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ motif: suspendMotif }),
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
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleAnnulerSuspension = async (id) => {
    if (!window.confirm('Lever la suspension de cette candidature ?')) return;
    try {
      const r = await apiFetch(`${API}/office-bac/candidats/${id}/suspendre`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ annuler: true }),
      });
      const data = await r.json();
      if (r.ok) {
        showToast('Suspension levée. Candidat convoqué.');
        fetchCandidats();
      } else {
        showToast(data.message || 'Erreur.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleAddCandidat = async (e) => {
    e.preventDefault();
    if (!selectedEleve) {
      showToast('Veuillez sélectionner un élève.', 'error');
      return;
    }
    try {
      const r = await apiFetch(`${API}/office-bac/candidats`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...newCandidat, eleve_id: selectedEleve.id }),
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
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleSaveResultat = async (e) => {
    e.preventDefault();
    if (!selectedCandidat) return;

    const epreuves = resultForm.details_epreuves;
    let totalPts = 0,
      totalCoeff = 0;
    Object.values(epreuves).forEach((ep) => {
      const note = parseFloat(ep.note || 0);
      const coeff = parseFloat(ep.coefficient || 1);
      totalPts += note * coeff;
      totalCoeff += coeff;
    });
    const moyenne = totalCoeff > 0 ? parseFloat((totalPts / totalCoeff).toFixed(2)) : null;

    try {
      const r = await apiFetch(`${API}/office-bac/candidats/${selectedCandidat.id}/resultats`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          moyenne,
          details_epreuves: epreuves,
          appreciation_jury: resultForm.appreciation_jury,
          date_deliberation: resultForm.date_deliberation || null,
          absent_epreuve: resultForm.absent_epreuve || null,
        }),
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
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handlePublier = async (e) => {
    e.preventDefault();
    try {
      const r = await apiFetch(`${API}/office-bac/publier`, {
        method: 'POST',
        headers,
        body: JSON.stringify(publierForm),
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
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleDeleteCandidat = async (id) => {
    if (!window.confirm('Supprimer ce candidat ?')) return;
    try {
      const r = await apiFetch(`${API}/office-bac/candidats/${id}`, { method: 'DELETE', headers });
      const data = await r.json();
      if (r.ok) {
        showToast('Candidat supprimé.');
        fetchCandidats();
        fetchStats();
      } else showToast(data.message || 'Erreur.', 'error');
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
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
      date_deliberation: c.date_deliberation
        ? c.date_deliberation.split('T')[0]
        : new Date().toISOString().split('T')[0],
      absent_epreuve: c.absent_epreuve || '',
    });
    setShowResultModal(true);
  };

  const handleDispatchAlphabetique = async () => {
    if (
      !window.confirm(
        ` Lancer la répartition automatique des candidats par ORDRE ALPHABÉTIQUE et par CAPACITÉ DE JURY (120 candidats max/jury) pour la session ${examenMode} ${filters.annee} ?\n\nDes numéros de table uniques (ex: 100101, 100102...) seront automatiquement attribués.`
      )
    )
      return;

    try {
      const r = await apiFetch(`${API}/office-bac/dispatch-alphabetique`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type_examen: examenMode,
          annee: filters.annee,
          capacite_defaut: 120,
        }),
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
    if (
      !window.confirm(
        `↩️ Confirmer la Restitution Officielle de TOUS les Livrets Scolaires de la session BAC ${filters.annee} aux établissements du Sénégal après fin des délibérations ?`
      )
    )
      return;

    try {
      const r = await apiFetch(`${API}/office-bac/restituer-livrets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ annee: filters.annee }),
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        fetchLivrets();
      } else {
        showToast(data.message || 'Erreur lors de la restitution.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  // Transmission d'un livret scolaire au jury du BAC (élève choisi dans la recherche)
  const handleAddLivret = async (e) => {
    e.preventDefault();
    if (!selectedEleve) {
      showToast('Veuillez sélectionner un élève.', 'error');
      return;
    }
    try {
      const r = await apiFetch(`${API}/office-bac/livrets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...newLivret, eleve_id: selectedEleve.id }),
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        setShowAddLivretModal(false);
        setSelectedEleve(null);
        setEleveSearch('');
        setNewLivret((livret) => ({
          ...livret,
          moyenne_seconde: '',
          moyenne_premiere: '',
          moyenne_terminale: '',
          appreciation_conseil: '',
        }));
        fetchLivrets();
      } else {
        showToast(data.message || 'Erreur lors de la transmission du livret.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  // Certification (CONFORME) ou rejet (REJETÉ) d'un livret reçu
  const handleValiderLivret = async (livretId, statut) => {
    try {
      const r = await apiFetch(`${API}/office-bac/livrets/${livretId}/valider`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ statut_validation: statut }),
      });
      const data = await r.json();
      if (r.ok) {
        showToast(data.message);
        fetchLivrets();
      } else {
        showToast(data.message || 'Erreur lors de la mise à jour du livret.', 'error');
      }
    } catch (e) {
      showToast('Erreur réseau.', 'error');
    }
  };

  const logout = () => endSession();

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
        pendingDemandesCount={demandesList.filter((d) => d.statut === 'EN_ATTENTE').length}
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
              <OfficeEtablissementsTab etablissements={etablissements} setShowAddEtabModal={setShowAddEtabModal} />
            )}
            {tab === 'professeurs' && (
              <OfficeProfesseursTab professeursList={professeursList} setShowAddProfModal={setShowAddProfModal} />
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
            {tab === 'publication' && <OfficePublicationTab stats={stats} setShowPublierModal={setShowPublierModal} />}
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
        <AddLivretModal
          eleveResults={eleveResults}
          eleveSearch={eleveSearch}
          handleAddLivret={handleAddLivret}
          newLivret={newLivret}
          searchEleves={searchEleves}
          selectedEleve={selectedEleve}
          setEleveResults={setEleveResults}
          setEleveSearch={setEleveSearch}
          setNewLivret={setNewLivret}
          setSelectedEleve={setSelectedEleve}
          setShowAddLivretModal={setShowAddLivretModal}
        />
      )}

      {/* ══ MODAL AJOUT ÉTABLISSEMENT ══ */}
      {showAddEtabModal && (
        <AddEtablissementModal
          handleAddEtablissement={handleAddEtablissement}
          handleEtabIaChange={handleEtabIaChange}
          handleEtabRegionChange={handleEtabRegionChange}
          newEtab={newEtab}
          setNewEtab={setNewEtab}
          setShowAddEtabModal={setShowAddEtabModal}
        />
      )}

      {/* ══ MODAL AJOUT PROFESSEUR ══ */}
      {showAddProfModal && (
        <AddProfesseurModal
          SENEGAL_REGIONS_ZONES={SENEGAL_REGIONS_ZONES}
          etablissements={etablissements}
          handleAddProfesseur={handleAddProfesseur}
          newProf={newProf}
          setNewProf={setNewProf}
          setShowAddProfModal={setShowAddProfModal}
        />
      )}

      {/* ══ MODAL IDENTIFIANTS UNIQUE GÉNÉRÉS ══ */}
      {credentialsModalData && (
        <OfficeCredentialsModal
          copied={copied}
          credentialsModalData={credentialsModalData}
          setCopied={setCopied}
          setCredentialsModalData={setCredentialsModalData}
        />
      )}

      {/* ══ MODAL NOUVEAU JURY & CENTRE D'EXAMEN ══ */}
      {showAddJuryModal && (
        <AddJuryModal
          ALL_SERIES_OPTIONS={ALL_SERIES_OPTIONS}
          SENEGAL_REGIONS_ZONES={SENEGAL_REGIONS_ZONES}
          centresList={centresList}
          handleAddJury={handleAddJury}
          jurysList={jurysList}
          newJury={newJury}
          profSearchQuery={profSearchQuery}
          professeursList={professeursList}
          selectedJurySeries={selectedJurySeries}
          selectedProf={selectedProf}
          setNewJury={setNewJury}
          setProfSearchQuery={setProfSearchQuery}
          setSelectedJurySeries={setSelectedJurySeries}
          setSelectedProf={setSelectedProf}
          setShowAddJuryModal={setShowAddJuryModal}
        />
      )}

      {/* ══ MODAL PRÉ-CONFIGURATION CENTRE D'EXAMEN ══ */}
      {showAddCentreModal && (
        <AddCentreModal
          ALL_SERIES_OPTIONS={ALL_SERIES_OPTIONS}
          SENEGAL_REGIONS_ZONES={SENEGAL_REGIONS_ZONES}
          centresList={centresList}
          editingCentre={editingCentre}
          handleSaveCentre={handleSaveCentre}
          newCentre={newCentre}
          setNewCentre={setNewCentre}
          setShowAddCentreModal={setShowAddCentreModal}
        />
      )}

      {/* ══ MODAL AJOUT CANDIDAT ══ */}
      {showAddModal && (
        <AddCandidatModal
          eleveResults={eleveResults}
          eleveSearch={eleveSearch}
          handleAddCandidat={handleAddCandidat}
          jurysList={jurysList}
          newCandidat={newCandidat}
          searchEleves={searchEleves}
          selectedEleve={selectedEleve}
          setEleveResults={setEleveResults}
          setEleveSearch={setEleveSearch}
          setNewCandidat={setNewCandidat}
          setSelectedEleve={setSelectedEleve}
          setShowAddModal={setShowAddModal}
        />
      )}

      {/* ══ MODAL SAISIE RÉSULTATS ══ */}
      {showResultModal && selectedCandidat && (
        <CandidatResultModal
          handleSaveResultat={handleSaveResultat}
          resultForm={resultForm}
          selectedCandidat={selectedCandidat}
          setResultForm={setResultForm}
          setShowResultModal={setShowResultModal}
        />
      )}

      {/* ══ MODAL RELEVÉ CERTIFIÉ & QR CODE ══ */}
      {showReleveModal && releveData && (
        <ReleveNotesModal releveData={releveData} setShowReleveModal={setShowReleveModal} />
      )}

      {/* ══ MODAL HISTORIQUE DU CANDIDAT ══ */}
      {showHistoriqueModal && (
        <HistoriqueCandidatModal historiqueData={historiqueData} setShowHistoriqueModal={setShowHistoriqueModal} />
      )}

      {/* ══ MODAL SUSPENSION DE CANDIDATURE ══ */}
      {showSuspendModal && suspendTarget && (
        <SuspendCandidatModal
          handleSuspendre={handleSuspendre}
          setShowSuspendModal={setShowSuspendModal}
          setSuspendMotif={setSuspendMotif}
          suspendMotif={suspendMotif}
          suspendTarget={suspendTarget}
        />
      )}

      {/* ══ MODAL PUBLICATION ══ */}
      {showPublierModal && (
        <PublierResultatsModal
          handlePublier={handlePublier}
          publierForm={publierForm}
          setPublierForm={setPublierForm}
          setShowPublierModal={setShowPublierModal}
        />
      )}

      {/* ══ MODAL REJET DE DEMANDE DE PRÉ-INSCRIPTION ══ */}
      {rejectModalData && (
        <RejectDemandeModal
          handleConfirmReject={handleConfirmReject}
          rejectLoading={rejectLoading}
          rejectModalData={rejectModalData}
          rejectMotif={rejectMotif}
          setRejectModalData={setRejectModalData}
          setRejectMotif={setRejectMotif}
        />
      )}
    </div>
  );
};

export default OfficeBacDashboard;
