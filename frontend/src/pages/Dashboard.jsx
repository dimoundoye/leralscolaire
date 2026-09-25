import { useEffect, useState, useRef } from 'react';
import { Trash2, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import EtabSidebar from '../components/etablissement/EtabSidebar';
import EtabTopbar from '../components/etablissement/EtabTopbar';
import DisciplineTab from '../components/etablissement/DisciplineTab';
import AdminOverviewTab from '../components/etablissement/AdminOverviewTab';
import AdminTransfertsTab from '../components/etablissement/AdminTransfertsTab';
import AdminPreInscriptionsTab from '../components/etablissement/AdminPreInscriptionsTab';
import AdminClassesTab from '../components/etablissement/AdminClassesTab';
import AdminMatieresTab from '../components/etablissement/AdminMatieresTab';
import AdminElevesTab from '../components/etablissement/AdminElevesTab';
import AdminNotesTab from '../components/etablissement/AdminNotesTab';
import AdminAttendanceTab from '../components/etablissement/AdminAttendanceTab';
import AdminCahierTexteTab from '../components/etablissement/AdminCahierTexteTab';
import AdminScheduleTab from '../components/etablissement/AdminScheduleTab';
import AdminExamsTab from '../components/etablissement/AdminExamsTab';
import AdminCalendarTab from '../components/etablissement/AdminCalendarTab';
import AdminMessagesTab from '../components/etablissement/AdminMessagesTab';
import AdminPartagesTab from '../components/etablissement/AdminPartagesTab';
import AdminProfsTab from '../components/etablissement/AdminProfsTab';
import AdminAttestationsTab from '../components/etablissement/AdminAttestationsTab';
import AdminBaremesTab from '../components/etablissement/AdminBaremesTab';
import AdminSettingsTab from '../components/etablissement/AdminSettingsTab';
import { apiFetch } from '../services/http';
import AuditConfirmModal from '../components/etablissement/modals/AuditConfirmModal';
import AuditMotifModal from '../components/etablissement/modals/AuditMotifModal';
import ClassFormModal from '../components/etablissement/modals/ClassFormModal';
import CoefficientsModal from '../components/etablissement/modals/CoefficientsModal';
import ConfirmTransferModal from '../components/etablissement/modals/ConfirmTransferModal';
import CredentialsModal from '../components/etablissement/modals/CredentialsModal';
import DocumentPreviewModal from '../components/etablissement/modals/DocumentPreviewModal';
import EleveFormModal from '../components/etablissement/modals/EleveFormModal';
import EmailDuplicateModal from '../components/etablissement/modals/EmailDuplicateModal';
import EnrollmentSuccessModal from '../components/etablissement/modals/EnrollmentSuccessModal';
import ExamDetailsModal from '../components/etablissement/modals/ExamDetailsModal';
import ExamFormModal from '../components/etablissement/modals/ExamFormModal';
import GradesModal from '../components/etablissement/modals/GradesModal';
import JustifyAbsenceModal from '../components/etablissement/modals/JustifyAbsenceModal';
import MatiereFormModal from '../components/etablissement/modals/MatiereFormModal';
import MessageModal from '../components/etablissement/modals/MessageModal';
import MotifTextModal from '../components/etablissement/modals/MotifTextModal';
import PartageModal from '../components/etablissement/modals/PartageModal';
import PreInscriptionModal from '../components/etablissement/modals/PreInscriptionModal';
import ProfFormModal from '../components/etablissement/modals/ProfFormModal';
import RefuseAttestationModal from '../components/etablissement/modals/RefuseAttestationModal';
import ReglesPassageModal from '../components/etablissement/modals/ReglesPassageModal';
import ScheduleFormModal from '../components/etablissement/modals/ScheduleFormModal';
import SignatureScannerModal from '../components/etablissement/modals/SignatureScannerModal';
import TransferEleveModal from '../components/etablissement/modals/TransferEleveModal';
import TransferMotifModal from '../components/etablissement/modals/TransferMotifModal';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { tab } = useParams();
  const activeTab = tab || 'overview';
  const fileInputRef = useRef(null);
  const scanInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const editPhotoInputRef = useRef(null);
  const signatureInputRef = useRef(null);
  const cachetInputRef = useRef(null);
  const scannerCanvasRef = useRef(null);
  const scannerFileInputRef = useRef(null);
  const docIframeRef = useRef(null);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docPreviewModal, setDocPreviewModal] = useState({
    isOpen: false,
    eleve: null,
    type: 'bulletin',
    semestre: 1,
  });

  // Data states
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [notesGrid, setNotesGrid] = useState([]);
  const [messages, setMessages] = useState([]);
  const [profs, setProfs] = useState([]);
  const [profile, setProfile] = useState({
    nom: '',
    region: '',
    ville: '',
    code_etablissement: '',
    signature_url: '',
    cachet_url: '',
  });
  const [signatureFile, setSignatureFile] = useState(null);
  const [cachetFile, setCachetFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [cachetPreview, setCachetPreview] = useState(null);
  const [showSignatureScanner, setShowSignatureScanner] = useState(false);
  const [scannerImage, setScannerImage] = useState(null);
  const [scannerThreshold, setScannerThreshold] = useState(200);
  const [scannerGrayscale, setScannerGrayscale] = useState(true);
  const [scannerTarget, setScannerTarget] = useState('signature');
  const [attestations, setAttestations] = useState([]);
  const [refusingAttestation, setRefusingAttestation] = useState(null);
  const [motifRefusAttestation, setMotifRefusAttestation] = useState('');
  const [attestationFilter, setAttestationFilter] = useState('all');
  const [profSearchId, setProfSearchId] = useState('');
  const [searchedProf, setSearchedProf] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [profModalTab, setProfModalTab] = useState('invite'); // 'invite' | 'create'
  const [profAssignments, setProfAssignments] = useState([]);
  const [assignClasseId, setAssignClasseId] = useState('');
  const [assignMatiereId, setAssignMatiereId] = useState('');
  const [selectedClasseFilter, setSelectedClasseFilter] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState(1);
  const [eleveSearch, setEleveSearch] = useState('');
  const [eleveStatusFilter, setEleveStatusFilter] = useState('all');
  const [baremes, setBaremes] = useState([]);
  const [baremesSaving, setBaremesSaving] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: null });
  const [classAverages, setClassAverages] = useState([]);
  const [chartSemestre, setChartSemestre] = useState(1);

  // Messaging / Chat states
  const [chatChannels, setChatChannels] = useState({ teachers: [], students: [], etablissement_id: null });
  const [activeChatContact, setActiveChatContact] = useState(null); // { id, name, type }
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null); // { url, name }
  const [uploadingFile, setUploadingFile] = useState(false);
  const chatEndRef = useRef(null);
  const chatFileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const formData = new FormData();
    formData.append('fichier', file);

    try {
      const res = await apiFetch('/api/messages/upload', {
        method: 'POST',
        headers: {},
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAttachedFile({ url: data.fichier_url, name: data.fichier_nom });
      } else {
        const errData = await res.json();
        alert(errData.message || 'Erreur lors du téléchargement du fichier.');
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi du fichier.");
    } finally {
      setUploadingFile(false);
      if (chatFileInputRef.current) chatFileInputRef.current.value = '';
    }
  };

  // Partages states
  const [partagesRecus, setPartagesRecus] = useState([]);
  const [partagesEnvoyes, setPartagesEnvoyes] = useState([]);
  const [partageView, setPartageView] = useState('received');
  const [showPartageModal, setShowPartageModal] = useState(false);
  const [partageSearch, setPartageSearch] = useState('');
  const [partageResults, setPartageResults] = useState([]);
  const [selectedPartageEtab, setSelectedPartageEtab] = useState(null);
  const [partageDescription, setPartageDescription] = useState('');
  const [partageFile, setPartageFile] = useState(null);
  const [partageEleveId, setPartageEleveId] = useState('');

  // Modal states
  const [showClassModal, setShowClassModal] = useState(false);
  const [showEleveModal, setShowEleveModal] = useState(false);
  const [showProfModal, setShowProfModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [showCoefModal, setShowCoefModal] = useState(false);
  const [showMatiereModal, setShowMatiereModal] = useState(false);

  // Editing states
  const [editingEleve, setEditingEleve] = useState(null);
  const [editingMatiere, setEditingMatiere] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingProf, setEditingProf] = useState(null);

  const [transferEleve, setTransferEleve] = useState(null);
  const [selectedEleveIds, setSelectedEleveIds] = useState([]);
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  const [outgoingTransfers, setOutgoingTransfers] = useState([]);
  const [transferSubTab, setTransferSubTab] = useState('incoming'); // 'incoming' | 'outgoing'
  const [viewTransferMotifModal, setViewTransferMotifModal] = useState(null); // { eleveNom, motif }
  const [confirmTransferModal, setConfirmTransferModal] = useState(null); // { type, transferId, eleveNom, onConfirm }
  const [successData, setSuccessData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Pre-inscription states
  const [preInscriptions, setPreInscriptions] = useState([]);
  const [editingPreInscription, setEditingPreInscription] = useState(null);
  const [showPreModal, setShowPreModal] = useState(false);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [emailDuplicateModal, setEmailDuplicateModal] = useState(null);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [resolvingDuplicateEmail, setResolvingDuplicateEmail] = useState(false);

  // Form states
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const classesAnneeFilter = selectedYear;
  const attendanceAnneeFilter = selectedYear;
  const scheduleAnneeFilter = selectedYear;
  const examsAnneeFilter = selectedYear;
  const messagesAnneeFilter = selectedYear;
  const elevesAnneeFilter = selectedYear;
  const overviewAnneeFilter = selectedYear;
  const [newClass, setNewClass] = useState({ nom: '', niveau: '6ème', annee_scolaire: '2025-2026' });
  const [newEleve, setNewEleve] = useState({
    nom: '',
    prenom: '',
    sexe: 'M',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: '',
    telephone: '',
    email: '',
    coordonnees_parent: '',
    classe_id: '',
    statut: 'APTE',
    photo: null,
  });
  const [newMatiere, setNewMatiere] = useState({ nom: '', code: '' });
  const [newProf, setNewProf] = useState({ email: '', password: '' });
  const [newMessage, setNewMessage] = useState({
    destinataire_type: 'CLASSE',
    destinataire_id: '',
    sujet: '',
    contenu: '',
  });

  // Coef management state
  const [selectedClassCoef, setSelectedClassCoef] = useState(null);
  const [currentCoefs, setCurrentCoefs] = useState({}); // {matiere_id: coefficient}

  // Schedule & Exam states
  const [scheduleEntries, setScheduleEntries] = useState([]);
  const [examPlans, setExamPlans] = useState([]);
  const [scheduleClassId, setScheduleClassId] = useState(null);
  const [examClassId, setExamClassId] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    matiere_id: '',
    professeur_id: '',
    jour_semaine: 'Lundi',
    heure_debut: '08:00',
    heure_fin: '09:00',
    salle: '',
  });
  const [newExam, setNewExam] = useState({
    matiere_id: '',
    type_examen: 'DEVOIR',
    date_examen: '',
    heure_examen: '',
    salle: '',
  });
  const [calendarExams, setCalendarExams] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedExam, setSelectedExam] = useState(null);
  const [scheduleMatieres, setScheduleMatieres] = useState([]);
  const [proposedDevoirs, setProposedDevoirs] = useState([]);

  // Décisions states
  const [notesSubTab, setNotesSubTab] = useState('saisie');
  const [decisionsClasseId, setDecisionsClasseId] = useState('');
  const notesAnneeScolaire = selectedYear;
  const [decisions, setDecisions] = useState([]);
  const [reglesPassage, setReglesPassage] = useState({
    seuil_passage_direct: 12,
    seuil_passage: 10,
    seuil_cours_vacances: 8,
  });
  const [showReglesModal, setShowReglesModal] = useState(false);

  // Audit Journal states
  const [auditLog, setAuditLog] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditClasseFilter, setAuditClasseFilter] = useState('');
  const [auditTrimestreFilter, setAuditTrimestreFilter] = useState('');

  // Suivi de remplissage des notes states
  const [suiviRemplissage, setSuiviRemplissage] = useState([]);
  const [suiviLoading, setSuiviLoading] = useState(false);
  const [suiviSemestre, setSuiviSemestre] = useState(1);

  // Assiduité (Absences & Retards) states
  const [absencesLog, setAbsencesLog] = useState([]);
  const [absClassFilter, setAbsClassFilter] = useState('');
  const [absStatusFilter, setAbsStatusFilter] = useState('');
  const [absDateFilter, setAbsDateFilter] = useState('');
  const [absSearchQuery, setAbsSearchQuery] = useState('');
  const [absLoading, setAbsLoading] = useState(false);
  const [selectedAbsenceForJustify, setSelectedAbsenceForJustify] = useState(null);
  const [absJustificationMotif, setAbsJustificationMotif] = useState('');
  const [viewMotifModal, setViewMotifModal] = useState(null); // { titre, texte }

  // Transfer Search states
  const [transferSearch, setTransferSearch] = useState('');

  // Student grades modal states
  const [selectedGradesData, setSelectedGradesData] = useState(null);
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [gradesModalSemestre, setGradesModalSemestre] = useState('Semestre 1');
  const [gradesModalLoading, setGradesModalLoading] = useState(false);
  const [juryDecision, setJuryDecision] = useState('PASSAGE');
  const [juryTargetClass, setJuryTargetClass] = useState('');
  const [juryObservations, setJuryObservations] = useState('');
  const [savingJuryDecision, setSavingJuryDecision] = useState(false);
  const [juryAppreciations, setJuryAppreciations] = useState([]);
  const [transferResults, setTransferResults] = useState([]);
  const [selectedTargetEtab, setSelectedTargetEtab] = useState(null);
  const [transferMotif, setTransferMotif] = useState('');

  // Ranking sub-tab states
  const [eleveSubTab, setEleveSubTab] = useState('liste');
  const [rankingClasseId, setRankingClasseId] = useState('');
  const [rankingPeriod, setRankingPeriod] = useState('Semestre 1');
  const [rankingData, setRankingData] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  // Audit log custom confirmation modal states
  const [showAuditConfirmModal, setShowAuditConfirmModal] = useState(false);
  const [auditConfirmAction, setAuditConfirmAction] = useState(null); // { type: 'confirm'|'reject', entry: object }
  const [activeMotifText, setActiveMotifText] = useState('');

  // Feedback states
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      fetchAllData();
    }
  }, [user, navigate]);

  const fetchAllData = () => {
    fetchClasses();
    fetchEleves();
    fetchMatieres();
    fetchProfs();
    fetchProfile();
    fetchMessages();
    fetchClassAverages(chartSemestre, overviewAnneeFilter);
    fetchPartages();
    fetchPreInscriptions();
    fetchAttestations();
    fetchTransfers();
  };

  const fetchTransfers = async () => {
    try {
      const [incRes, outRes] = await Promise.all([
        apiFetch('/api/eleves/transfers/incoming', { headers: {} }),
        apiFetch('/api/eleves/transfers/outgoing', { headers: {} }),
      ]);
      if (incRes.ok) setIncomingTransfers(await incRes.json());
      if (outRes.ok) setOutgoingTransfers(await outRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPartages = async () => {
    try {
      const [recusRes, envoyesRes] = await Promise.all([
        apiFetch('/api/partages/received', { headers: {} }),
        apiFetch('/api/partages/sent', { headers: {} }),
      ]);
      if (recusRes.ok) setPartagesRecus(await recusRes.json());
      if (envoyesRes.ok) setPartagesEnvoyes(await envoyesRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPartageEtab = async (q) => {
    if (q.length < 2) {
      setPartageResults([]);
      return;
    }
    try {
      const res = await apiFetch(`/api/etablissement/search?q=${encodeURIComponent(q)}`, {
        headers: {},
      });
      if (res.ok) setPartageResults(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDecisions = async (classeId) => {
    if (!classeId) return;
    setLoading(true);
    try {
      const [decisionsRes, reglesRes] = await Promise.all([
        apiFetch(`/api/notes/decisions/${classeId}?annee_scolaire=${notesAnneeScolaire}`, {
          headers: {},
        }),
        apiFetch('/api/notes/regles-passage', {
          headers: {},
        }),
      ]);
      if (decisionsRes.ok) setDecisions(await decisionsRes.json());
      if (reglesRes.ok) setReglesPassage(await reglesRes.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchAuditLog = async (classeId = '', trimestre = '', anneeScolaire = notesAnneeScolaire) => {
    setAuditLoading(true);
    try {
      let url = '/api/etablissement/audit';
      const params = new URLSearchParams();
      if (classeId) params.append('classe_id', classeId);
      if (trimestre) params.append('trimestre', trimestre);
      if (anneeScolaire) params.append('annee_scolaire', anneeScolaire);
      if ([...params].length > 0) url += '?' + params.toString();

      const res = await apiFetch(url, { headers: {} });
      if (res.ok) setAuditLog(await res.json());
    } catch (err) {
      console.error(err);
    }
    setAuditLoading(false);
  };

  const openAuditConfirmModal = (entry, type) => {
    setAuditConfirmAction({ type, entry });
    setShowAuditConfirmModal(true);
  };

  const executeAuditAction = async () => {
    if (!auditConfirmAction) return;
    const { type, entry } = auditConfirmAction;
    const endpoint = type === 'confirm' ? 'confirm' : 'reject';

    try {
      const res = await apiFetch(`/api/etablissement/audit/${entry.id}/${endpoint}`, {
        method: 'POST',
        headers: {},
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(
          data.message ||
            (type === 'confirm' ? 'Modification de la note validée et appliquée.' : 'Modification de la note rejetée.')
        );
        fetchAuditLog(auditClasseFilter, auditTrimestreFilter);
      } else {
        showNotification(data.message || 'Une erreur est survenue.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur réseau.', 'error');
    } finally {
      setShowAuditConfirmModal(false);
      setAuditConfirmAction(null);
    }
  };

  const fetchSuiviRemplissage = async (sem = suiviSemestre, anneeScolaire = notesAnneeScolaire) => {
    setSuiviLoading(true);
    try {
      const res = await apiFetch(`/api/notes/suivi-remplissage?semestre=${sem}&annee_scolaire=${anneeScolaire}`, {
        headers: {},
      });
      if (res.ok) setSuiviRemplissage(await res.json());
    } catch (err) {
      console.error(err);
    }
    setSuiviLoading(false);
  };

  const handleToggleBulletinPublication = async (classeId, anneeScolaire, currentStatus) => {
    try {
      const res = await apiFetch(`/api/notes/publications/${classeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          semestre: suiviSemestre,
          annee_scolaire: anneeScolaire,
          autorise: !currentStatus,
        }),
      });
      if (res.ok) {
        showNotification('Statut de publication mis à jour !');
        fetchSuiviRemplissage(suiviSemestre);
      } else {
        showNotification("Erreur lors de la modification de l'autorisation.", 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion au serveur.', 'error');
    }
  };

  const fetchAbsencesLog = async (classeId = '', justifiee = '', date = '', q = '') => {
    setAbsLoading(true);
    try {
      let url = '/api/etablissement/absences';
      const params = new URLSearchParams();
      if (classeId) params.append('classe_id', classeId);
      if (justifiee !== '') params.append('justifiee', justifiee);
      if (date) params.append('date', date);
      if (q) params.append('q', q);
      if ([...params].length > 0) url += '?' + params.toString();

      const res = await apiFetch(url, { headers: {} });
      if (res.ok) setAbsencesLog(await res.json());
    } catch (err) {
      console.error(err);
    }
    setAbsLoading(false);
  };

  const handleJustifyAbsence = async (e) => {
    e.preventDefault();
    if (!selectedAbsenceForJustify) return;
    try {
      const res = await apiFetch(`/api/etablissement/absences/${selectedAbsenceForJustify.id}/justifier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motif_justification: absJustificationMotif }),
      });
      if (res.ok) {
        showNotification('Absence justifiée avec succès.');
        setSelectedAbsenceForJustify(null);
        setAbsJustificationMotif('');
        fetchAbsencesLog(absClassFilter, absStatusFilter, absDateFilter, absSearchQuery);
      } else {
        showNotification('Erreur lors de la justification.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion.', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAbsencesLog(absClassFilter, absStatusFilter, absDateFilter, absSearchQuery);
    }
  }, [activeTab, absClassFilter, absStatusFilter, absDateFilter]);

  // Cahier de Texte Admin state & handlers
  const [cahierEntries, setCahierEntries] = useState([]);
  const [cahierLoading, setCahierLoading] = useState(false);
  const cahierAnneeFilter = selectedYear;
  const [cahierFilterClasse, setCahierFilterClasse] = useState('');
  const [cahierFilterProf, setCahierFilterProf] = useState('');

  const fetchCahierAdmin = async () => {
    setCahierLoading(true);
    try {
      const params = new URLSearchParams();
      if (cahierFilterClasse) params.append('classe_id', cahierFilterClasse);
      if (cahierFilterProf) params.append('professeur_id', cahierFilterProf);
      const res = await apiFetch(`/api/cahier-texte/admin?${params}`, {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        setCahierEntries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCahierLoading(false);
    }
  };

  const handleToggleVisa = async (id) => {
    try {
      const res = await apiFetch(`/api/cahier-texte/${id}/visa`, {
        method: 'PUT',
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        showNotification(data.message, 'success');
        fetchCahierAdmin();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'cahier-texte') {
      fetchCahierAdmin();
    }
  }, [activeTab, cahierAnneeFilter, cahierFilterClasse, cahierFilterProf]);

  const handleSaveRegles = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/notes/regles-passage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reglesPassage),
      });
      if (res.ok) {
        showNotification('Règles de passage mises à jour !');
        setShowReglesModal(false);
        if (decisionsClasseId) fetchDecisions(decisionsClasseId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDecisions = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/notes/decisions/${decisionsClasseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisions, annee_scolaire: notesAnneeScolaire }),
      });
      if (res.ok) {
        showNotification('Décisions enregistrées !');
        fetchDecisions(decisionsClasseId);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateDecision = (eleveId, field, value) => {
    setDecisions((prev) =>
      prev.map((d) => {
        if (d.eleve_id === eleveId) {
          const updated = { ...d, [field]: value, decision_auto: false };
          if (field === 'decision') {
            // Update next class level
            let targetNiveau = d.niveau;
            if (value !== 'REDOUBLEMENT') {
              const niveaux = ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'];
              const idx = niveaux.indexOf(d.niveau);
              if (idx !== -1 && idx < niveaux.length - 1) {
                targetNiveau = niveaux[idx + 1];
              }
            }
            updated.niveau_suivant = targetNiveau;

            // Set default target class name in decision_detail
            const targetClasses = classes.filter((c) => c.niveau === targetNiveau);
            const currentClassObj = classes.find((c) => c.id === decisionsClasseId);
            const currentSuffix = currentClassObj ? currentClassObj.nom.slice(-1) : '';
            const matchedClass = targetClasses.find((tc) => tc.nom.endsWith(currentSuffix)) || targetClasses[0];

            updated.decision_detail = matchedClass
              ? matchedClass.nom
              : value === 'PASSAGE'
                ? 'Passage'
                : value === 'COURS_VACANCES'
                  ? 'Cours de vacances'
                  : 'Redoublement';
          } else if (field === 'decision_detail') {
            // If target class is manually changed, update level (for grade skipping)
            const targetClassObj = classes.find((c) => c.nom === value);
            if (targetClassObj) {
              updated.niveau_suivant = targetClassObj.niveau;
            }
          }
          return updated;
        }
        return d;
      })
    );
  };

  const fetchClasses = async () => {
    try {
      const res = await apiFetch('/api/classes', {
        headers: {},
      });
      if (res.status === 401) {
        logout?.();
        navigate('/auth');
        return;
      }
      const data = await res.json();
      if (res.ok) setClasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEleves = async () => {
    try {
      const res = await apiFetch('/api/eleves', {
        headers: {},
      });
      if (res.status === 401) {
        logout?.();
        navigate('/auth');
        return;
      }
      const data = await res.json();
      if (res.ok) setEleves(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMatieres = async () => {
    try {
      const res = await apiFetch('/api/notes/matieres', {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) setMatieres(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfs = async () => {
    try {
      const res = await apiFetch('/api/professeurs', {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) setProfs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedule = async (classeId) => {
    try {
      const res = await apiFetch(`/api/classes/${classeId}/schedule`, {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) setScheduleEntries(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExams = async (classeId) => {
    try {
      const res = await apiFetch(`/api/classes/${classeId}/exams`, {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) setExamPlans(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProposedDevoirs = async () => {
    try {
      const res = await apiFetch('/api/etablissement/planning/propositions', {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) setProposedDevoirs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecideProposal = async (proposalId, action) => {
    try {
      const res = await apiFetch(`/api/etablissement/planning/propositions/${proposalId}/decider`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(action === 'VALIDER' ? 'Proposition validée et planifiée !' : 'Proposition rejetée.');
        fetchProposedDevoirs();
        if (examClassId) fetchExams(examClassId);
      } else {
        showNotification(data.message || 'Erreur lors du traitement.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion.', 'error');
    }
  };

  const fetchAllExams = async (debut, fin) => {
    try {
      const res = await apiFetch(`/api/classes/exams/all?debut=${debut}&fin=${fin}`, {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) setCalendarExams(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchScheduleMatieres = async (classeId) => {
    try {
      const res = await apiFetch(`/api/classes/${classeId}/matieres`, {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) setScheduleMatieres(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await apiFetch('/api/etablissement/profile', {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) setProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClassAverages = async (semestre, anneeScolaire) => {
    const targetYear = anneeScolaire || overviewAnneeFilter;
    try {
      const res = await apiFetch(
        `/api/notes/moyennes-classes?semestre=${semestre || 1}&annee_scolaire=${encodeURIComponent(targetYear)}`,
        {
          headers: {},
        }
      );
      const data = await res.json();
      if (res.ok) {
        setClassAverages(data.map((c) => ({ ...c, moyenne_generale: parseFloat(c.moyenne_generale) || 0 })));
      }
    } catch (err) {
      console.error('fetchClassAverages error:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await apiFetch('/api/messages/inbox', {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatChannels = async () => {
    try {
      const res = await apiFetch('/api/messages/channels', {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        setChatChannels(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatHistory = async (contact) => {
    if (!contact) return;
    setChatLoading(true);
    try {
      const params = new URLSearchParams({ type: contact.type, target_id: contact.id });
      if (chatChannels.etablissement_id) params.append('etablissement_id', chatChannels.etablissement_id);
      const res = await apiFetch(`/api/messages/history?${params}`, {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if ((!chatInput.trim() && !attachedFile) || !activeChatContact) return;
    const destType =
      activeChatContact.type === 'PROFESSEUR'
        ? 'PROFESSEUR'
        : activeChatContact.type === 'ELEVE'
          ? 'ELEVE'
          : activeChatContact.type === 'CLASSE'
            ? 'CLASSE'
            : 'ADMIN_ETABLISSEMENT';
    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinataire_type: destType,
          destinataire_id: activeChatContact.id,
          sujet: 'Message',
          contenu: chatInput.trim() || (attachedFile ? `📎 ${attachedFile.name}` : ''),
          etablissement_id: chatChannels.etablissement_id,
          fichier_url: attachedFile ? attachedFile.url : null,
          fichier_nom: attachedFile ? attachedFile.name : null,
        }),
      });
      if (res.ok) {
        setChatInput('');
        setAttachedFile(null);
        fetchChatHistory(activeChatContact);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatContactClick = (contact) => {
    setActiveChatContact(contact);
    fetchChatHistory(contact);
  };

  const toggleMessagePermission = async (profId, currentValue) => {
    try {
      await apiFetch(`/api/professeurs/${profId}/permission`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ droit_envoi_message: !currentValue }),
      });
      fetchProfs();
      showNotification(`Permission de messagerie ${!currentValue ? 'accordée' : 'révoquée'}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const getAutomaticAppreciation = (note) => {
    if (note === '' || note === null) return '';
    const n = parseFloat(note);
    if (n <= 4) return 'Très Faible';
    if (n <= 7) return 'Faible';
    if (n <= 9) return 'Insuffisant';
    if (n <= 11) return 'Passable';
    if (n <= 13) return 'Assez Bien';
    if (n <= 15) return 'Bien';
    if (n <= 17) return 'Très Bien';
    return 'Excellent';
  };

  const fetchNotesGrid = async (classeId, matiereId) => {
    if (!classeId || !matiereId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/notes/classe/${classeId}/matiere/${matiereId}?semestre=${selectedSemestre}`, {
        headers: {},
      });

      const data = await res.json();
      if (res.ok) {
        setNotesGrid(
          data.map((item) => ({
            ...item,
            note_devoir: item.note_devoir || '',
            note_examen: item.note_examen || '',
            appreciation: item.appreciation || '',
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedClasse && selectedMatiere) {
      fetchNotesGrid(selectedClasse, selectedMatiere);
    }
  }, [selectedClasse, selectedMatiere, selectedSemestre]);

  useEffect(() => {
    fetchClassAverages(chartSemestre, overviewAnneeFilter);
  }, [chartSemestre, overviewAnneeFilter]);

  useEffect(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const debut = new Date(year, month, 1).toISOString().split('T')[0];
    const fin = new Date(year, month + 1, 0).toISOString().split('T')[0];
    fetchAllExams(debut, fin);
  }, [calendarDate]);

  useEffect(() => {
    if (activeTab === 'exams') {
      fetchProposedDevoirs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchChatChannels();
      fetchMessages();
    }
  }, [activeTab]);

  const processScannerImage = () => {
    const canvas = scannerCanvasRef.current;
    if (!canvas || !scannerImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / scannerImage.width);
    canvas.width = scannerImage.width * scale;
    canvas.height = scannerImage.height * scale;

    ctx.drawImage(scannerImage, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      if (brightness > scannerThreshold) {
        data[i + 3] = 0; // Make white background transparent
      } else if (scannerGrayscale) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  useEffect(() => {
    if (scannerImage) {
      setTimeout(processScannerImage, 50); // Small timeout to ensure canvas ref is mounted
    }
  }, [scannerImage, scannerThreshold, scannerGrayscale]);

  // Establishment Search for Transfer (Real-Time Search)
  useEffect(() => {
    if (!transferSearch || transferSearch.trim().length === 0) {
      setTransferResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await apiFetch(`/api/etablissement/search?q=${encodeURIComponent(transferSearch.trim())}`, {
          headers: {},
        });
        const data = await res.json();
        if (res.ok) {
          // Filter out current establishment so school can't transfer to itself
          const filtered = data.filter((e) => e.id !== profile.id && e.id !== transferEleve?.etablissement_id);
          setTransferResults(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    }, 150);
    return () => clearTimeout(delayDebounceFn);
  }, [transferSearch, profile.id, transferEleve]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: null }), 3000);
  };

  const handleOpenGradesModal = async (eleveId) => {
    setGradesModalLoading(true);
    setShowGradesModal(true);
    setSelectedGradesData(null);
    try {
      const res = await apiFetch(`/api/notes/eleve/${eleveId}`, {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedGradesData(data);

        // Initialize jury input states from loaded data
        if (data.decisionJury) {
          const loadedDec = data.decisionJury.decision;
          setJuryDecision(loadedDec === 'PASSAGE_DIRECT' ? 'PASSAGE' : loadedDec || 'PASSAGE');
          setJuryObservations(data.decisionJury.observations_jury || '');
          setJuryAppreciations(
            data.decisionJury.appreciations_conseil
              ? data.decisionJury.appreciations_conseil.split(',').map((s) => s.trim())
              : []
          );
          setJuryTargetClass(data.decisionJury.decision_detail || '');
        } else {
          setJuryDecision('PASSAGE');
          setJuryObservations('');
          setJuryAppreciations([]);
          setJuryTargetClass('');
        }

        // Default to the first available period
        if (data.notes && Object.keys(data.notes).length > 0) {
          const firstYear = Object.keys(data.notes)[0];
          const periods = Object.keys(data.notes[firstYear].periodes);
          if (periods.length > 0) {
            setGradesModalSemestre(periods[0]);
          }
        }
      } else {
        showNotification("Impossible de charger les notes de l'élève.", 'error');
        setShowGradesModal(false);
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors du chargement des notes.', 'error');
      setShowGradesModal(false);
    } finally {
      setGradesModalLoading(false);
    }
  };

  const handleSaveJuryDecision = async (e) => {
    e.preventDefault();
    if (!selectedGradesData || !selectedGradesData.student) return;
    setSavingJuryDecision(true);

    const student = selectedGradesData.student;
    const activeYear = Object.keys(selectedGradesData.notes)[0];
    const periodData = selectedGradesData.notes[activeYear]?.periodes[gradesModalSemestre];
    const avg = periodData ? periodData.moyenne_generale : null;

    const isFinalPeriod = gradesModalSemestre === 'Semestre 2' || gradesModalSemestre === 'Trimestre 3';

    // Auto-calculate target level and default class name
    const currentClassObj = classes.find((c) => c.id === student.classe_id);
    const currentLevel = currentClassObj ? currentClassObj.niveau : '';
    const currentSuffix = currentClassObj ? currentClassObj.nom.slice(-1) : '';

    let computedTargetNiveau = currentLevel;
    if (isFinalPeriod && juryDecision !== 'REDOUBLEMENT') {
      const niveaux = ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'];
      const idx = niveaux.indexOf(currentLevel);
      if (idx !== -1 && idx < niveaux.length - 1) {
        computedTargetNiveau = niveaux[idx + 1];
      }
    }

    const targetClasses = classes.filter((c) => c.niveau === computedTargetNiveau);
    const defaultTargetClass =
      targetClasses.find((tc) => tc.nom.endsWith(currentSuffix))?.nom || targetClasses[0]?.nom || computedTargetNiveau;
    const finalDetail = juryTargetClass || defaultTargetClass;

    const payload = {
      classeId: student.classe_id,
      anneeScolaire: student.annee_scolaire,
      moyenneGenerale: avg,
      decision: isFinalPeriod ? juryDecision : null,
      decisionDetail: isFinalPeriod ? finalDetail : null,
      observationsJury: juryObservations,
      appreciationsConseil: juryAppreciations.join(','),
    };

    try {
      const res = await apiFetch(`/api/notes/eleve/${student.id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotification('Décision et observations du jury enregistrées !');
        // Update loaded data states
        setSelectedGradesData((prev) => ({
          ...prev,
          decisionJury: {
            decision: isFinalPeriod ? juryDecision : prev.decisionJury ? prev.decisionJury.decision : null,
            decision_detail: isFinalPeriod
              ? payload.decisionDetail
              : prev.decisionJury
                ? prev.decisionJury.decision_detail
                : null,
            observations_jury: juryObservations,
            moyenne_generale: avg,
            appreciations_conseil: juryAppreciations.join(','),
          },
        }));
      } else {
        showNotification("Erreur lors de l'enregistrement de la décision.", 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur réseau.', 'error');
    } finally {
      setSavingJuryDecision(false);
    }
  };

  const toggleAppreciation = (label) => {
    setJuryAppreciations((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));
  };

  const fetchRankingData = async (classeId, period) => {
    if (!classeId) {
      setRankingData([]);
      return;
    }
    setRankingLoading(true);
    try {
      const res = await apiFetch(`/api/notes/classe/${classeId}/classement?period=${period}`, {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        setRankingData(data);
      } else {
        showNotification('Impossible de charger le classement.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur réseau lors du chargement du classement.', 'error');
    } finally {
      setRankingLoading(false);
    }
  };

  useEffect(() => {
    if (eleveSubTab === 'classement' && rankingClasseId) {
      fetchRankingData(rankingClasseId, rankingPeriod);
    }
  }, [eleveSubTab, rankingClasseId, rankingPeriod]);

  useEffect(() => {
    if (eleveSubTab === 'classement') {
      const yearClasses = classes.filter((c) => c.annee_scolaire === elevesAnneeFilter);
      if (yearClasses.length > 0) {
        if (!rankingClasseId || !yearClasses.some((c) => c.id === rankingClasseId)) {
          setRankingClasseId(yearClasses[0].id);
        }
      } else {
        setRankingClasseId('');
      }
    }
  }, [eleveSubTab, classes, rankingClasseId, elevesAnneeFilter]);

  const handleDownloadRankingPDF = () => {
    if (!rankingClasseId) return;
    const url = `/api/documents/classe/${rankingClasseId}/classement-pdf?period=${rankingPeriod}`;
    window.open(url, '_blank');
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
    showNotification('Copié dans le presse-papier !');
  };

  const handleAddEleve = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    const fields = [
      'nom',
      'prenom',
      'sexe',
      'date_naissance',
      'lieu_naissance',
      'nationalite',
      'telephone',
      'email',
      'coordonnees_parent',
      'classe_id',
      'statut',
    ];
    fields.forEach((key) => {
      if (newEleve[key] !== null && newEleve[key] !== '') formData.append(key, newEleve[key]);
    });
    if (newEleve.photo) formData.append('photo', newEleve.photo);
    if (newEleve.justificatif_inapte) formData.append('justificatif_inapte', newEleve.justificatif_inapte);

    try {
      const res = await apiFetch('/api/eleves', {
        method: 'POST',
        headers: {},
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessData({ identifiant: data.identifiant, password: data.password });
        setShowSuccessModal(true);
        setShowEleveModal(false);
        setNewEleve({
          nom: '',
          prenom: '',
          sexe: 'M',
          date_naissance: '',
          lieu_naissance: '',
          nationalite: '',
          telephone: '',
          email: '',
          coordonnees_parent: '',
          classe_id: '',
          statut: 'APTE',
          photo: null,
          justificatif_inapte: null,
        });
        fetchEleves();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEleve = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    const fields = [
      'nom',
      'prenom',
      'sexe',
      'date_naissance',
      'lieu_naissance',
      'nationalite',
      'telephone',
      'email',
      'coordonnees_parent',
      'statut',
      'classe_id',
    ];
    fields.forEach((key) => {
      if (editingEleve[key] !== null && editingEleve[key] !== '' && editingEleve[key] !== undefined) {
        formData.append(key, editingEleve[key]);
      }
    });
    if (editingEleve.photoFile) {
      formData.append('photo', editingEleve.photoFile);
    }
    if (editingEleve.justificatifFile) {
      formData.append('justificatif_inapte', editingEleve.justificatifFile);
    }

    try {
      const res = await apiFetch(`/api/eleves/${editingEleve.id}`, {
        method: 'PUT',
        headers: {},
        body: formData,
      });
      if (res.ok) {
        setEditingEleve(null);
        fetchEleves();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEleve = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élève et son compte ?')) return;
    try {
      const res = await apiFetch(`/api/eleves/${id}`, {
        method: 'DELETE',
        headers: {},
      });
      if (res.ok) fetchEleves();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPreInscriptions = async () => {
    try {
      const res = await apiFetch('/api/pre-inscriptions', {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        setPreInscriptions(data);
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de chargement des pré-inscriptions.', 'error');
    }
  };

  const handleValidatePreInscription = async (id, overrideEmail = null) => {
    if (overrideEmail !== null) setResolvingDuplicateEmail(true);
    try {
      const body = overrideEmail !== null ? JSON.stringify({ email: overrideEmail }) : undefined;
      const res = await apiFetch(`/api/pre-inscriptions/${id}/validate`, {
        method: 'POST',
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body,
      });
      const data = await res.json();
      if (res.ok) {
        setEmailDuplicateModal(null);
        setNewStudentEmail('');
        setGeneratedCreds(data.credentials);
        setShowCredsModal(true);
        showNotification(data.message);
        fetchPreInscriptions();
        fetchEleves();
      } else if (res.status === 409 || data.error === 'EMAIL_DUPLICATE') {
        setEmailDuplicateModal({
          preInscriptionId: id,
          email: data.email || '',
          eleveNom: data.eleveNom || 'Élève',
          message: data.message || `L'adresse email "${data.email}" est déjà enregistrée dans le système.`,
        });
        setNewStudentEmail('');
      } else {
        showNotification(data.message || 'Erreur lors de la validation.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de serveur lors de la validation.', 'error');
    } finally {
      setResolvingDuplicateEmail(false);
    }
  };

  const handleRejectPreInscription = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) return;
    try {
      const res = await apiFetch(`/api/pre-inscriptions/${id}/reject`, {
        method: 'POST',
        headers: {},
      });
      if (res.ok) {
        showNotification('Demande rejetée.');
        fetchPreInscriptions();
      } else {
        showNotification('Erreur lors du rejet.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur serveur.', 'error');
    }
  };

  const handleUpdatePreInscription = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch(`/api/pre-inscriptions/${editingPreInscription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingPreInscription),
      });
      if (res.ok) {
        showNotification('Demande mise à jour avec succès.');
        setShowPreModal(false);
        fetchPreInscriptions();
      } else {
        const data = await res.json();
        showNotification(data.message || 'Erreur de mise à jour.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur serveur.', 'error');
    }
  };

  const handleCopyRegLink = (classId) => {
    const link = `${window.location.origin}/register/class/${classId}`;
    navigator.clipboard.writeText(link);
    showNotification("Lien d'inscription copié !");
  };

  const handleTransferEleve = async (e) => {
    e.preventDefault();
    if (!selectedTargetEtab) return showNotification('Veuillez sélectionner un établissement destinataire.', 'error');

    setLoading(true);
    try {
      const isBulk = selectedEleveIds.length > 0;
      const url = isBulk ? '/api/eleves/transfer-bulk' : `/api/eleves/${transferEleve.id}/transfer`;

      const body = isBulk
        ? { eleve_ids: selectedEleveIds, nouveau_etablissement_id: selectedTargetEtab.id, motif: transferMotif }
        : { nouveau_etablissement_id: selectedTargetEtab.id, motif: transferMotif };

      const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Demande de transfert effectuée !');
        setTransferEleve(null);
        setSelectedEleveIds([]);
        setSelectedTargetEtab(null);
        setTransferSearch('');
        setTransferMotif('');
        fetchEleves();
        fetchTransfers();
      } else {
        showNotification(data.message || 'Erreur lors de la demande de transfert.', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTransfer = async (transferId) => {
    setLoading(true);
    setConfirmTransferModal(null);
    try {
      const res = await apiFetch(`/api/eleves/transfers/${transferId}/accept`, {
        method: 'POST',
        headers: {},
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Transfert accepté avec succès !');
        fetchTransfers();
        fetchEleves();
      } else {
        showNotification(data.message || "Erreur lors de l'acceptation.", 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTransfer = async (transferId) => {
    setLoading(true);
    setConfirmTransferModal(null);
    try {
      const res = await apiFetch(`/api/eleves/transfers/${transferId}/reject`, {
        method: 'POST',
        headers: {},
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Demande de transfert refusée.');
        fetchTransfers();
      } else {
        showNotification(data.message || 'Erreur lors du refus.', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTransfer = async (transferId) => {
    setLoading(true);
    setConfirmTransferModal(null);
    try {
      const res = await apiFetch(`/api/eleves/transfers/${transferId}/cancel`, {
        method: 'DELETE',
        headers: {},
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Demande de transfert annulée.');
        fetchTransfers();
        fetchEleves();
      } else {
        showNotification(data.message || "Erreur lors de l'annulation.", 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClass = async (eleve, classeId) => {
    if (!classeId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/eleves/${eleve.id}/assign-class`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classe_id: classeId }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Élève affecté à la classe avec succès !');
        fetchEleves();
      } else {
        showNotification(data.message || "Erreur lors de l'affectation.", 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur serveur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch(`/api/classes/${scheduleClassId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      });
      if (res.ok) {
        setShowScheduleModal(false);
        setNewSchedule({
          matiere_id: '',
          professeur_id: '',
          jour_semaine: 'Lundi',
          heure_debut: '08:00',
          heure_fin: '09:00',
          salle: '',
        });
        fetchSchedule(scheduleClassId);
        showNotification('Créneau ajouté !');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Supprimer ce créneau ?')) return;
    try {
      const res = await apiFetch(`/api/classes/${scheduleClassId}/schedule/${scheduleId}`, {
        method: 'DELETE',
        headers: {},
      });
      if (res.ok) {
        fetchSchedule(scheduleClassId);
        showNotification('Créneau supprimé.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dateTime = newExam.heure_examen ? `${newExam.date_examen}T${newExam.heure_examen}:00` : newExam.date_examen;
    const isEdit = !!editingExam;
    const url = isEdit ? `/api/classes/${examClassId}/exams/${editingExam.id}` : `/api/classes/${examClassId}/exams`;
    try {
      const res = await apiFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newExam, date_examen: dateTime }),
      });
      if (res.ok) {
        setShowExamModal(false);
        setEditingExam(null);
        setNewExam({ matiere_id: '', type_examen: 'DEVOIR', date_examen: '', heure_examen: '', salle: '' });
        fetchExams(examClassId);
        fetchProposedDevoirs();
        showNotification(isEdit ? 'Examen modifié !' : 'Examen planifié !');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Supprimer cet examen ?')) return;
    try {
      const res = await apiFetch(`/api/classes/${examClassId}/exams/${examId}`, {
        method: 'DELETE',
        headers: {},
      });
      if (res.ok) {
        fetchExams(examClassId);
        showNotification('Examen supprimé.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editingClass ? 'PUT' : 'POST';
    const url = editingClass ? `/api/classes/${editingClass.id}` : '/api/classes';
    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingClass || newClass),
      });
      if (res.ok) {
        setShowClassModal(false);
        setNewClass({ nom: '', niveau: '6ème', annee_scolaire: '2025-2026' });
        setEditingClass(null);
        fetchClasses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatiere = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editingMatiere ? 'PUT' : 'POST';
    const url = editingMatiere ? `/api/notes/matieres/${editingMatiere.id}` : '/api/notes/matieres';
    const payload = editingMatiere ? { nom: editingMatiere.nom, code: editingMatiere.code_matiere } : newMatiere;
    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowMatiereModal(false);
        setNewMatiere({ nom: '', code: '' });
        setEditingMatiere(null);
        fetchMatieres();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatiere = async (id) => {
    if (!window.confirm('Supprimer cette matière ?')) return;
    try {
      const res = await apiFetch(`/api/notes/matieres/${id}`, {
        method: 'DELETE',
        headers: {},
      });
      if (res.ok) fetchMatieres();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedClasse || !selectedMatiere)
      return showNotification('Veuillez sélectionner une classe et une matière.', 'error');
    setLoading(true);
    try {
      const editable = notesGrid.filter((n) => !n.readonly);

      // 1. Envoi des Devoirs
      const resDevoir = await apiFetch('/api/notes/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: editable.map((n) => ({ eleve_id: n.eleve_id, valeur: n.note_devoir, appreciation: '' })),
          matiere_id: selectedMatiere,
          semestre: selectedSemestre,
          type_note: 'DEVOIR',
        }),
      });

      if (!resDevoir.ok) {
        const errorData = await resDevoir.json();
        throw new Error(errorData.message || "Erreur lors de l'enregistrement des devoirs");
      }

      // 2. Envoi des Examens
      const resExamen = await apiFetch('/api/notes/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: editable.map((n) => ({ eleve_id: n.eleve_id, valeur: n.note_examen, appreciation: n.appreciation })),
          matiere_id: selectedMatiere,
          semestre: selectedSemestre,
          type_note: 'EXAMEN',
        }),
      });

      if (!resExamen.ok) {
        const errorData = await resExamen.json();
        throw new Error(errorData.message || "Erreur lors de l'enregistrement des examens");
      }

      showNotification('Toutes les notes et appréciations ont été enregistrées !');
      // Recharger les notes pour confirmer l'affichage
      fetchNotesGrid(selectedClasse, selectedMatiere);
    } catch (err) {
      console.error(err);
      showNotification(err.message || "Erreur lors de l'enregistrement.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCoefModal = async (classe) => {
    setSelectedClassCoef(classe);
    setLoading(true);
    try {
      const res = await apiFetch(`/api/classes/${classe.id}/matieres`, {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) {
        const coefs = {};
        data.forEach((m) => (coefs[m.id] = m.coefficient));
        setCurrentCoefs(coefs);
        setShowCoefModal(true);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSaveCoefs = async () => {
    setLoading(true);
    const matieresToUpdate = Object.keys(currentCoefs).map((id) => ({
      matiere_id: id,
      coefficient: currentCoefs[id],
    }));

    try {
      const res = await apiFetch(`/api/classes/${selectedClassCoef.id}/matieres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matieres: matieresToUpdate }),
      });
      if (res.ok) {
        showNotification('Coefficients mis à jour !');
        setShowCoefModal(false);
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de mise à jour.', 'error');
    }
    setLoading(false);
  };

  const handleExportExcel = async () => {
    window.open(`/api/eleves/export?classe_id=${selectedClasseFilter}`, '_blank');
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await apiFetch('/api/eleves/import', {
        method: 'POST',
        headers: {},
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message);
        fetchEleves();
      } else {
        showNotification(data.message || "Erreur lors de l'importation.", 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanStudents = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await apiFetch('/api/ai/scan-students', {
        method: 'POST',
        headers: {},
        body: formData,
      });
      const data = await res.json();
      if (res.ok) alert(`Noms détectés: ${data.names.join(', ')}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBulletinPreview = (eleve) => {
    setDocPreviewModal({
      isOpen: true,
      eleve,
      type: 'bulletin',
      semestre: selectedSemestre || 1,
    });
  };

  const handleOpenDossierPreview = (eleve) => {
    setDocPreviewModal({
      isOpen: true,
      eleve,
      type: 'dossier',
      semestre: 1,
    });
  };

  const handlePrintDocument = () => {
    if (docIframeRef.current && docIframeRef.current.contentWindow) {
      docIframeRef.current.contentWindow.focus();
      docIframeRef.current.contentWindow.print();
    }
  };

  const handleDownloadDocument = async () => {
    if (!docPreviewModal.eleve) return;
    const eleve = docPreviewModal.eleve;
    let url = '';
    let fileName = '';

    if (docPreviewModal.type === 'bulletin') {
      url = `/api/documents/bulletin/${eleve.id}?semestre=${docPreviewModal.semestre}`;
      fileName = `Bulletin_${eleve.prenom}_${eleve.nom}_S${docPreviewModal.semestre}.pdf`.replace(/\s+/g, '_');
    } else if (docPreviewModal.type === 'dossier') {
      url = `/api/documents/dossier-transfert/${eleve.id}`;
      fileName = `Dossier_Transfert_${eleve.prenom}_${eleve.nom}.pdf`.replace(/\s+/g, '_');
    }

    try {
      showNotification('Téléchargement du document en cours...', 'info');
      const res = await apiFetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showNotification('Téléchargement terminé !', 'success');
    } catch (err) {
      console.error(err);
      window.open(url, '_blank');
    }
  };

  const handleSendPartage = async (e) => {
    e.preventDefault();
    if (!selectedPartageEtab) return showNotification('Sélectionnez un établissement destinataire.', 'error');
    if (!partageFile) return showNotification('Sélectionnez un fichier.', 'error');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fichier', partageFile);
      formData.append('destinataire_etablissement_id', selectedPartageEtab.id);
      formData.append('description', partageDescription);
      if (partageEleveId) formData.append('eleve_id', partageEleveId);

      const res = await apiFetch('/api/partages', {
        method: 'POST',
        headers: {},
        body: formData,
      });
      if (res.ok) {
        showNotification('Document partagé avec succès !');
        setShowPartageModal(false);
        setSelectedPartageEtab(null);
        setPartageDescription('');
        setPartageFile(null);
        setPartageEleveId('');
        setPartageSearch('');
        setPartageResults([]);
        fetchPartages();
      } else {
        const err = await res.json();
        throw new Error(err.message);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPartage = async (id) => {
    window.open(`/api/partages/${id}/download`, '_blank');
    fetchPartages();
  };

  const handleDeletePartage = async (id) => {
    try {
      const res = await apiFetch(`/api/partages/${id}`, {
        method: 'DELETE',
        headers: {},
      });
      if (res.ok) {
        showNotification('Document supprimé.');
        fetchPartages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });
      if (res.ok) {
        showNotification('Message envoyé !');
        setShowMessageModal(false);
        setNewMessage({ destinataire_type: 'CLASSE', destinataire_id: '', sujet: '', contenu: '' });
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransmettreLivretsZone = async () => {
    if (
      !window.confirm(
        " Transmettre officiellement les Livrets Scolaires des élèves de Terminale / BFEM vers l'Office du BAC et la Zone d'Examen attribuée ?"
      )
    )
      return;
    try {
      const res = await apiFetch('/api/office-bac/transmettre-livrets-zone', {
        method: 'POST',
        headers: {},
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || "Livrets scolaires transmis à la zone d'examen !");
      } else {
        showNotification(data.message || 'Erreur lors de la transmission.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur réseau.', 'error');
    }
  };

  const fetchAttestations = async () => {
    try {
      const res = await apiFetch('/api/documents/attestations/requests', {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        setAttestations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptAttestation = async (id) => {
    try {
      const res = await apiFetch(`/api/documents/attestations/requests/${id}/accept`, {
        method: 'POST',
        headers: {},
      });
      if (res.ok) {
        showNotification("Demande d'attestation acceptée !");
        fetchAttestations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefuseAttestation = async (e) => {
    e.preventDefault();
    if (!motifRefusAttestation) return;
    try {
      const res = await apiFetch(`/api/documents/attestations/requests/${refusingAttestation.id}/refuse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motif_refus: motifRefusAttestation }),
      });
      if (res.ok) {
        showNotification("Demande d'attestation refusée.", 'error');
        setRefusingAttestation(null);
        setMotifRefusAttestation('');
        fetchAttestations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProf = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editingProf ? 'PUT' : 'POST';
    const url = editingProf ? `/api/professeurs/${editingProf.id}` : '/api/professeurs';
    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProf || newProf),
      });
      if (res.ok) {
        setShowProfModal(false);
        setNewProf({ email: '', password: '' });
        setEditingProf(null);
        fetchProfs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchProf = async (e) => {
    e.preventDefault();
    if (!profSearchId.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchedProf(null);
    try {
      const res = await apiFetch(`/api/professeurs/search/${profSearchId.trim()}`, {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) {
        setSearchedProf(data);
      } else {
        setSearchError(data.message || 'Enseignant introuvable.');
      }
    } catch (err) {
      console.error(err);
      setSearchError('Erreur de connexion au serveur.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInviteProf = async () => {
    if (!searchedProf) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/professeurs/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professeur_id: searchedProf.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Invitation envoyée !', 'success');
        setShowProfModal(false);
        setProfSearchId('');
        setSearchedProf(null);
        fetchProfs();
      } else {
        showNotification(data.message || "Erreur lors de l'envoi de l'invitation.", 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion au serveur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditProfModal = async (p) => {
    setEditingProf(p);
    setProfModalTab('create'); // when editing we show the fields form
    setShowProfModal(true);
    setProfAssignments([]);
    setAssignClasseId('');
    setAssignMatiereId('');

    // Fetch current assignments
    try {
      const res = await apiFetch(`/api/professeurs/${p.id}/assignments`, {
        headers: {},
      });
      const data = await res.json();
      if (res.ok) {
        setProfAssignments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!assignClasseId || !assignMatiereId || !editingProf) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/professeurs/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professeur_id: editingProf.id,
          classe_id: assignClasseId,
          matiere_id: assignMatiereId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Classe/Matière affectée avec succès !', 'success');

        // Refresh assignments list
        const resList = await apiFetch(`/api/professeurs/${editingProf.id}/assignments`, {
          headers: {},
        });
        const dataList = await resList.json();
        if (resList.ok) setProfAssignments(dataList);

        setAssignClasseId('');
        setAssignMatiereId('');
      } else {
        showNotification(data.message || "Erreur lors de l'affectation.", 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion au serveur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Retirer cette affectation ?')) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/professeurs/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {},
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Affectation retirée.', 'success');

        // Refresh assignments list
        const resList = await apiFetch(`/api/professeurs/${editingProf.id}/assignments`, {
          headers: {},
        });
        const dataList = await resList.json();
        if (resList.ok) setProfAssignments(dataList);
      } else {
        showNotification(data.message || 'Erreur lors de la suppression.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion au serveur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('nom', profile.nom || '');
    formData.append('code_etablissement', profile.code_etablissement || '');
    formData.append('region', profile.region || '');
    formData.append('ville', profile.ville || '');
    formData.append('nom_directeur', profile.nom_directeur || '');

    if (signatureFile) {
      formData.append('signature', signatureFile);
    }
    if (cachetFile) {
      formData.append('cachet', cachetFile);
    }

    try {
      const res = await apiFetch('/api/etablissement/profile', {
        method: 'PUT',
        headers: {},
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSignatureFile(null);
        setCachetFile(null);
        setSignaturePreview(null);
        setCachetPreview(null);
        showNotification('Profil mis à jour !');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors de la mise à jour.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const availableYears = Array.from(new Set(classes.map((c) => c.annee_scolaire))).filter(Boolean);
  if (availableYears.length === 0) {
    availableYears.push('2025-2026');
  }
  availableYears.sort().reverse();

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    setSelectedClasseFilter('');
    setScheduleClassId('');
    setExamClassId('');
    setSelectedClasse('');
    setDecisionsClasseId('');
    setDecisions([]);
    setAuditClasseFilter('');
    setCahierFilterClasse('');

    const yearClasses = classes.filter((c) => c.annee_scolaire === newYear);
    setRankingClasseId(yearClasses[0]?.id || '');

    if (notesSubTab === 'audit') {
      fetchAuditLog('', auditTrimestreFilter, newYear);
    } else if (notesSubTab === 'suivi') {
      fetchSuiviRemplissage(suiviSemestre, newYear);
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <EtabSidebar
        activeTab={activeTab}
        profile={profile}
        elevesCount={eleves.length}
        preInscriptionsCount={preInscriptions.length}
        unreadPartagesCount={partagesRecus.filter((d) => !d.lu).length}
        transfersCount={incomingTransfers.length}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      {/* MAIN */}
      <div className="main">
        <EtabTopbar
          profile={profile}
          notificationsCount={messages.length}
          onShowMessages={() => navigate('/dashboard/messages')}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          availableYears={availableYears}
        />
        {/* CONTENT */}
        <div className="content-area">
          <div className="content-inner">
            {activeTab === 'overview' && (
              <AdminOverviewTab
                profile={profile}
                navigate={navigate}
                setShowEleveModal={setShowEleveModal}
                eleves={eleves}
                classes={classes}
                classesAnneeFilter={classesAnneeFilter}
                profs={profs}
                chartSemestre={chartSemestre}
                setChartSemestre={setChartSemestre}
                classAverages={classAverages}
              />
            )}

            {activeTab === 'transferts' && (
              <AdminTransfertsTab
                transferSubTab={transferSubTab}
                setTransferSubTab={setTransferSubTab}
                incomingTransfers={incomingTransfers}
                outgoingTransfers={outgoingTransfers}
                setViewTransferMotifModal={setViewTransferMotifModal}
                handleOpenDossierPreview={handleOpenDossierPreview}
                setConfirmTransferModal={setConfirmTransferModal}
                handleAcceptTransfer={handleAcceptTransfer}
                handleRejectTransfer={handleRejectTransfer}
                handleCancelTransfer={handleCancelTransfer}
                loading={loading}
              />
            )}

            {activeTab === 'pre-inscriptions' && (
              <AdminPreInscriptionsTab
                preInscriptions={preInscriptions}
                setEditingPreInscription={setEditingPreInscription}
                setShowPreModal={setShowPreModal}
                handleValidatePreInscription={handleValidatePreInscription}
                handleRejectPreInscription={handleRejectPreInscription}
              />
            )}

            {activeTab === 'classes' && (
              <AdminClassesTab
                selectedYear={selectedYear}
                setEditingClass={setEditingClass}
                setNewClass={setNewClass}
                classesAnneeFilter={classesAnneeFilter}
                setShowClassModal={setShowClassModal}
                classes={classes}
                eleves={eleves}
                openCoefModal={openCoefModal}
                handleCopyRegLink={handleCopyRegLink}
              />
            )}

            {activeTab === 'matieres' && (
              <AdminMatieresTab
                matieres={matieres}
                setEditingMatiere={setEditingMatiere}
                setShowMatiereModal={setShowMatiereModal}
                handleDeleteMatiere={handleDeleteMatiere}
              />
            )}

            {activeTab === 'eleves' && (
              <AdminElevesTab
                classes={classes}
                eleves={eleves}
                elevesAnneeFilter={elevesAnneeFilter}
                selectedClasseFilter={selectedClasseFilter}
                setSelectedClasseFilter={setSelectedClasseFilter}
                eleveStatusFilter={eleveStatusFilter}
                setEleveStatusFilter={setEleveStatusFilter}
                eleveSearch={eleveSearch}
                setEleveSearch={setEleveSearch}
                chatFileInputRef={chatFileInputRef}
                scanInputRef={scanInputRef}
                fileInputRef={fileInputRef}
                handleImportExcel={handleImportExcel}
                handleScanStudents={handleScanStudents}
                handleExportExcel={handleExportExcel}
                setEditingEleve={setEditingEleve}
                setShowEleveModal={setShowEleveModal}
                eleveSubTab={eleveSubTab}
                setEleveSubTab={setEleveSubTab}
                selectedEleveIds={selectedEleveIds}
                setSelectedEleveIds={setSelectedEleveIds}
                setTransferEleve={setTransferEleve}
                handleOpenGradesModal={handleOpenGradesModal}
                handleAssignClass={handleAssignClass}
                loading={loading}
                handleOpenBulletinPreview={handleOpenBulletinPreview}
                handleOpenDossierPreview={handleOpenDossierPreview}
                handleDeleteEleve={handleDeleteEleve}
                rankingClasseId={rankingClasseId}
                setRankingClasseId={setRankingClasseId}
                rankingPeriod={rankingPeriod}
                setRankingPeriod={setRankingPeriod}
                handleDownloadRankingPDF={handleDownloadRankingPDF}
                rankingLoading={rankingLoading}
                rankingData={rankingData}
              />
            )}

            {activeTab === 'notes' && (
              <AdminNotesTab
                notesSubTab={notesSubTab}
                setNotesSubTab={setNotesSubTab}
                selectedSemestre={selectedSemestre}
                setSelectedSemestre={setSelectedSemestre}
                selectedClasse={selectedClasse}
                setSelectedClasse={setSelectedClasse}
                selectedMatiere={selectedMatiere}
                setSelectedMatiere={setSelectedMatiere}
                classes={classes}
                matieres={matieres}
                notesAnneeScolaire={notesAnneeScolaire}
                handleSaveNotes={handleSaveNotes}
                loading={loading}
                notesGrid={notesGrid}
                setNotesGrid={setNotesGrid}
                getAutomaticAppreciation={getAutomaticAppreciation}
                decisionsClasseId={decisionsClasseId}
                setDecisionsClasseId={setDecisionsClasseId}
                fetchDecisions={fetchDecisions}
                setShowReglesModal={setShowReglesModal}
                handleSaveDecisions={handleSaveDecisions}
                decisions={decisions}
                updateDecision={updateDecision}
                auditClasseFilter={auditClasseFilter}
                setAuditClasseFilter={setAuditClasseFilter}
                auditTrimestreFilter={auditTrimestreFilter}
                setAuditTrimestreFilter={setAuditTrimestreFilter}
                fetchAuditLog={fetchAuditLog}
                auditLoading={auditLoading}
                auditLog={auditLog}
                setActiveMotifText={setActiveMotifText}
                openAuditConfirmModal={openAuditConfirmModal}
                suiviSemestre={suiviSemestre}
                setSuiviSemestre={setSuiviSemestre}
                fetchSuiviRemplissage={fetchSuiviRemplissage}
                suiviLoading={suiviLoading}
                suiviRemplissage={suiviRemplissage}
                handleToggleBulletinPublication={handleToggleBulletinPublication}
              />
            )}

            {activeTab === 'discipline' && <DisciplineTab elevesList={eleves} />}

            {activeTab === 'attendance' && (
              <AdminAttendanceTab
                selectedYear={selectedYear}
                absSearchQuery={absSearchQuery}
                setAbsSearchQuery={setAbsSearchQuery}
                fetchAbsencesLog={fetchAbsencesLog}
                absClassFilter={absClassFilter}
                setAbsClassFilter={setAbsClassFilter}
                classes={classes}
                attendanceAnneeFilter={attendanceAnneeFilter}
                absStatusFilter={absStatusFilter}
                setAbsStatusFilter={setAbsStatusFilter}
                absDateFilter={absDateFilter}
                setAbsDateFilter={setAbsDateFilter}
                absencesLog={absencesLog}
                absLoading={absLoading}
                setViewMotifModal={setViewMotifModal}
                setSelectedAbsenceForJustify={setSelectedAbsenceForJustify}
                setAbsJustificationMotif={setAbsJustificationMotif}
              />
            )}

            {activeTab === 'cahier-texte' && (
              <AdminCahierTexteTab
                cahierFilterClasse={cahierFilterClasse}
                setCahierFilterClasse={setCahierFilterClasse}
                cahierAnneeFilter={cahierAnneeFilter}
                classes={classes}
                cahierFilterProf={cahierFilterProf}
                setCahierFilterProf={setCahierFilterProf}
                profs={profs}
                fetchCahierAdmin={fetchCahierAdmin}
                cahierLoading={cahierLoading}
                cahierEntries={cahierEntries}
                handleToggleVisa={handleToggleVisa}
              />
            )}

            {activeTab === 'schedule' && (
              <AdminScheduleTab
                scheduleClassId={scheduleClassId}
                setScheduleClassId={setScheduleClassId}
                fetchSchedule={fetchSchedule}
                fetchScheduleMatieres={fetchScheduleMatieres}
                classes={classes}
                scheduleAnneeFilter={scheduleAnneeFilter}
                setShowScheduleModal={setShowScheduleModal}
                scheduleEntries={scheduleEntries}
                handleDeleteSchedule={handleDeleteSchedule}
              />
            )}

            {activeTab === 'exams' && (
              <AdminExamsTab
                examClassId={examClassId}
                setExamClassId={setExamClassId}
                fetchExams={fetchExams}
                classes={classes}
                examsAnneeFilter={examsAnneeFilter}
                setShowExamModal={setShowExamModal}
                handleTransmettreLivretsZone={handleTransmettreLivretsZone}
                proposedDevoirs={proposedDevoirs}
                handleDecideProposal={handleDecideProposal}
                setEditingExam={setEditingExam}
                setNewExam={setNewExam}
                examPlans={examPlans}
                handleDeleteExam={handleDeleteExam}
              />
            )}

            {activeTab === 'calendar' && (
              <AdminCalendarTab
                calendarDate={calendarDate}
                setCalendarDate={setCalendarDate}
                calendarExams={calendarExams}
                setSelectedExam={setSelectedExam}
              />
            )}

            {activeTab === 'messages' && (
              <AdminMessagesTab
                contactSearchQuery={contactSearchQuery}
                setContactSearchQuery={setContactSearchQuery}
                classes={classes}
                messagesAnneeFilter={messagesAnneeFilter}
                chatChannels={chatChannels}
                activeChatContact={activeChatContact}
                handleChatContactClick={handleChatContactClick}
                chatLoading={chatLoading}
                chatHistory={chatHistory}
                user={user}
                chatEndRef={chatEndRef}
                attachedFile={attachedFile}
                setAttachedFile={setAttachedFile}
                fileInputRef={fileInputRef}
                chatFileInputRef={chatFileInputRef}
                handleFileUpload={handleFileUpload}
                uploadingFile={uploadingFile}
                chatInput={chatInput}
                setChatInput={setChatInput}
                sendChatMessage={sendChatMessage}
              />
            )}

            {activeTab === 'partages' && (
              <AdminPartagesTab
                setShowPartageModal={setShowPartageModal}
                partageView={partageView}
                setPartageView={setPartageView}
                partagesRecus={partagesRecus}
                partagesEnvoyes={partagesEnvoyes}
                handleDownloadPartage={handleDownloadPartage}
                handleDeletePartage={handleDeletePartage}
              />
            )}

            {activeTab === 'profs' && (
              <AdminProfsTab
                profs={profs}
                setEditingProf={setEditingProf}
                setShowProfModal={setShowProfModal}
                toggleMessagePermission={toggleMessagePermission}
                handleOpenEditProfModal={handleOpenEditProfModal}
                fetchProfs={fetchProfs}
              />
            )}

            {activeTab === 'attestations' && (
              <AdminAttestationsTab
                attestationFilter={attestationFilter}
                setAttestationFilter={setAttestationFilter}
                attestations={attestations}
                handleAcceptAttestation={handleAcceptAttestation}
                setRefusingAttestation={setRefusingAttestation}
              />
            )}

            {activeTab === 'baremes' && (
              <AdminBaremesTab
                baremes={baremes}
                setBaremes={setBaremes}
                baremesSaving={baremesSaving}
                setBaremesSaving={setBaremesSaving}
                showNotification={showNotification}
              />
            )}

            {activeTab === 'settings' && (
              <AdminSettingsTab
                handleUpdateProfile={handleUpdateProfile}
                profile={profile}
                setProfile={setProfile}
                signaturePreview={signaturePreview}
                signatureInputRef={signatureInputRef}
                setSignatureFile={setSignatureFile}
                setSignaturePreview={setSignaturePreview}
                setScannerTarget={setScannerTarget}
                setScannerGrayscale={setScannerGrayscale}
                setScannerImage={setScannerImage}
                setShowSignatureScanner={setShowSignatureScanner}
                cachetPreview={cachetPreview}
                cachetInputRef={cachetInputRef}
                setCachetFile={setCachetFile}
                setCachetPreview={setCachetPreview}
                loading={loading}
              />
            )}
          </div>{' '}
          {/* content-inner */}
        </div>{' '}
        {/* content-area */}
      </div>{' '}
      {/* main */}
      {/* Modals */}
      {(showEleveModal || editingEleve) && (
        <EleveFormModal
          classes={classes}
          editPhotoInputRef={editPhotoInputRef}
          editingEleve={editingEleve}
          elevesAnneeFilter={elevesAnneeFilter}
          handleAddEleve={handleAddEleve}
          handleUpdateEleve={handleUpdateEleve}
          loading={loading}
          newEleve={newEleve}
          photoInputRef={photoInputRef}
          setEditingEleve={setEditingEleve}
          setNewEleve={setNewEleve}
          setShowEleveModal={setShowEleveModal}
        />
      )}
      {transferEleve && (
        <TransferEleveModal
          handleTransferEleve={handleTransferEleve}
          loading={loading}
          selectedEleveIds={selectedEleveIds}
          selectedTargetEtab={selectedTargetEtab}
          setSelectedTargetEtab={setSelectedTargetEtab}
          setTransferEleve={setTransferEleve}
          setTransferMotif={setTransferMotif}
          setTransferResults={setTransferResults}
          setTransferSearch={setTransferSearch}
          transferEleve={transferEleve}
          transferMotif={transferMotif}
          transferResults={transferResults}
          transferSearch={transferSearch}
        />
      )}
      {viewTransferMotifModal && (
        <TransferMotifModal
          setViewTransferMotifModal={setViewTransferMotifModal}
          viewTransferMotifModal={viewTransferMotifModal}
        />
      )}
      {confirmTransferModal && (
        <ConfirmTransferModal
          confirmTransferModal={confirmTransferModal}
          loading={loading}
          setConfirmTransferModal={setConfirmTransferModal}
        />
      )}
      {showGradesModal && (
        <GradesModal
          classes={classes}
          gradesModalLoading={gradesModalLoading}
          gradesModalSemestre={gradesModalSemestre}
          handleSaveJuryDecision={handleSaveJuryDecision}
          juryAppreciations={juryAppreciations}
          juryDecision={juryDecision}
          juryObservations={juryObservations}
          juryTargetClass={juryTargetClass}
          savingJuryDecision={savingJuryDecision}
          selectedGradesData={selectedGradesData}
          setGradesModalSemestre={setGradesModalSemestre}
          setJuryDecision={setJuryDecision}
          setJuryObservations={setJuryObservations}
          setJuryTargetClass={setJuryTargetClass}
          setShowGradesModal={setShowGradesModal}
          toggleAppreciation={toggleAppreciation}
        />
      )}
      {showCoefModal && (
        <CoefficientsModal
          currentCoefs={currentCoefs}
          handleSaveCoefs={handleSaveCoefs}
          loading={loading}
          matieres={matieres}
          selectedClassCoef={selectedClassCoef}
          setCurrentCoefs={setCurrentCoefs}
          setShowCoefModal={setShowCoefModal}
        />
      )}
      {(showMatiereModal || editingMatiere) && (
        <MatiereFormModal
          editingMatiere={editingMatiere}
          handleAddMatiere={handleAddMatiere}
          loading={loading}
          newMatiere={newMatiere}
          setEditingMatiere={setEditingMatiere}
          setNewMatiere={setNewMatiere}
          setShowMatiereModal={setShowMatiereModal}
        />
      )}
      {viewMotifModal && <AuditMotifModal setViewMotifModal={setViewMotifModal} viewMotifModal={viewMotifModal} />}
      {selectedAbsenceForJustify && (
        <JustifyAbsenceModal
          absJustificationMotif={absJustificationMotif}
          handleJustifyAbsence={handleJustifyAbsence}
          selectedAbsenceForJustify={selectedAbsenceForJustify}
          setAbsJustificationMotif={setAbsJustificationMotif}
          setSelectedAbsenceForJustify={setSelectedAbsenceForJustify}
        />
      )}
      {(showClassModal || editingClass) && (
        <ClassFormModal
          editingClass={editingClass}
          handleAddClass={handleAddClass}
          loading={loading}
          newClass={newClass}
          setEditingClass={setEditingClass}
          setNewClass={setNewClass}
          setShowClassModal={setShowClassModal}
        />
      )}
      {(showProfModal || editingProf) && (
        <ProfFormModal
          assignClasseId={assignClasseId}
          assignMatiereId={assignMatiereId}
          classes={classes}
          editingProf={editingProf}
          handleAddAssignment={handleAddAssignment}
          handleAddProf={handleAddProf}
          handleDeleteAssignment={handleDeleteAssignment}
          handleInviteProf={handleInviteProf}
          handleSearchProf={handleSearchProf}
          loading={loading}
          matieres={matieres}
          newProf={newProf}
          profAssignments={profAssignments}
          profModalTab={profModalTab}
          profSearchId={profSearchId}
          searchError={searchError}
          searchLoading={searchLoading}
          searchedProf={searchedProf}
          setAssignClasseId={setAssignClasseId}
          setAssignMatiereId={setAssignMatiereId}
          setEditingProf={setEditingProf}
          setNewProf={setNewProf}
          setProfModalTab={setProfModalTab}
          setProfSearchId={setProfSearchId}
          setSearchError={setSearchError}
          setSearchedProf={setSearchedProf}
          setShowProfModal={setShowProfModal}
        />
      )}
      {showMessageModal && (
        <MessageModal
          classes={classes}
          eleves={eleves}
          handleSendMessage={handleSendMessage}
          loading={loading}
          newMessage={newMessage}
          profs={profs}
          setNewMessage={setNewMessage}
          setShowMessageModal={setShowMessageModal}
          setStudentSearchQuery={setStudentSearchQuery}
          studentSearchQuery={studentSearchQuery}
        />
      )}
      {showPartageModal && (
        <PartageModal
          eleves={eleves}
          fetchPartageEtab={fetchPartageEtab}
          handleSendPartage={handleSendPartage}
          loading={loading}
          partageDescription={partageDescription}
          partageEleveId={partageEleveId}
          partageFile={partageFile}
          partageResults={partageResults}
          partageSearch={partageSearch}
          selectedPartageEtab={selectedPartageEtab}
          setPartageDescription={setPartageDescription}
          setPartageEleveId={setPartageEleveId}
          setPartageFile={setPartageFile}
          setPartageResults={setPartageResults}
          setPartageSearch={setPartageSearch}
          setSelectedPartageEtab={setSelectedPartageEtab}
          setShowPartageModal={setShowPartageModal}
        />
      )}
      {showAuditConfirmModal && auditConfirmAction && (
        <AuditConfirmModal
          auditConfirmAction={auditConfirmAction}
          executeAuditAction={executeAuditAction}
          setShowAuditConfirmModal={setShowAuditConfirmModal}
        />
      )}
      {activeMotifText && <MotifTextModal activeMotifText={activeMotifText} setActiveMotifText={setActiveMotifText} />}
      {showReglesModal && (
        <ReglesPassageModal
          handleSaveRegles={handleSaveRegles}
          reglesPassage={reglesPassage}
          setReglesPassage={setReglesPassage}
          setShowReglesModal={setShowReglesModal}
        />
      )}
      {showScheduleModal && (
        <ScheduleFormModal
          handleAddSchedule={handleAddSchedule}
          loading={loading}
          matieres={matieres}
          newSchedule={newSchedule}
          profs={profs}
          scheduleMatieres={scheduleMatieres}
          setNewSchedule={setNewSchedule}
          setShowScheduleModal={setShowScheduleModal}
        />
      )}
      {showExamModal && (
        <ExamFormModal
          editingExam={editingExam}
          handleAddExam={handleAddExam}
          loading={loading}
          matieres={matieres}
          newExam={newExam}
          setEditingExam={setEditingExam}
          setNewExam={setNewExam}
          setShowExamModal={setShowExamModal}
        />
      )}
      {showSuccessModal && successData && (
        <EnrollmentSuccessModal
          copiedId={copiedId}
          copiedPass={copiedPass}
          handleCopy={handleCopy}
          setShowSuccessModal={setShowSuccessModal}
          successData={successData}
        />
      )}
      {/* Exam Detail Modal */}
      {selectedExam && <ExamDetailsModal selectedExam={selectedExam} setSelectedExam={setSelectedExam} />}
      {/* MODAL EDIT PRE-INSCRIPTION */}
      {showPreModal && editingPreInscription && (
        <PreInscriptionModal
          editingPreInscription={editingPreInscription}
          handleUpdatePreInscription={handleUpdatePreInscription}
          setEditingPreInscription={setEditingPreInscription}
          setShowPreModal={setShowPreModal}
        />
      )}
      {/* MODAL REFUS ATTESTATION */}
      {refusingAttestation && (
        <RefuseAttestationModal
          handleRefuseAttestation={handleRefuseAttestation}
          motifRefusAttestation={motifRefusAttestation}
          refusingAttestation={refusingAttestation}
          setMotifRefusAttestation={setMotifRefusAttestation}
          setRefusingAttestation={setRefusingAttestation}
        />
      )}
      {/* MODAL CREDENTIALS GENERATED */}
      {showCredsModal && generatedCreds && (
        <CredentialsModal
          generatedCreds={generatedCreds}
          setShowCredsModal={setShowCredsModal}
          showNotification={showNotification}
        />
      )}
      {/* MODAL CONFLIT DOUBLON EMAIL PRÉ-INSCRIPTION */}
      {emailDuplicateModal && (
        <EmailDuplicateModal
          emailDuplicateModal={emailDuplicateModal}
          handleValidatePreInscription={handleValidatePreInscription}
          newStudentEmail={newStudentEmail}
          resolvingDuplicateEmail={resolvingDuplicateEmail}
          setEmailDuplicateModal={setEmailDuplicateModal}
          setNewStudentEmail={setNewStudentEmail}
        />
      )}
      {/* SIGNATURE SCANNER MODAL */}
      {showSignatureScanner && (
        <SignatureScannerModal
          scannerCanvasRef={scannerCanvasRef}
          scannerFileInputRef={scannerFileInputRef}
          scannerGrayscale={scannerGrayscale}
          scannerImage={scannerImage}
          scannerTarget={scannerTarget}
          scannerThreshold={scannerThreshold}
          setCachetFile={setCachetFile}
          setCachetPreview={setCachetPreview}
          setScannerGrayscale={setScannerGrayscale}
          setScannerImage={setScannerImage}
          setScannerThreshold={setScannerThreshold}
          setShowSignatureScanner={setShowSignatureScanner}
          setSignatureFile={setSignatureFile}
          setSignaturePreview={setSignaturePreview}
        />
      )}
      {/* MODAL PRÉVISUALISATION DOCUMENT (BULLETIN / DOSSIER) */}
      {docPreviewModal.isOpen && docPreviewModal.eleve && (
        <DocumentPreviewModal
          docIframeRef={docIframeRef}
          docPreviewModal={docPreviewModal}
          handleDownloadDocument={handleDownloadDocument}
          handlePrintDocument={handlePrintDocument}
          setDocPreviewModal={setDocPreviewModal}
        />
      )}
      {/* Custom Notification Toast */}
      {notification.message && (
        <div className={`notification-toast animate-slide-up ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === 'error' ? <Trash2 size={20} /> : <Check size={20} />}
          </div>
          <p>{notification.message}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
