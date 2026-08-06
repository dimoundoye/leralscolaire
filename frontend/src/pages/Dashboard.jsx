import React, { useEffect, useState, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpenCheck, 
  Settings, 
  LogOut, 
  Search, 
  Bell, Activity,
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
  Paperclip,
  Brain,
  Send,
  Mail,
  Printer,
  History,
  Edit,
  Trash2,
  MoveHorizontal,
  Copy,
  Check,
  Camera,
  SearchIcon,
  BookMarked,
  Book,
  Clock,
  CalendarDays,
  Share2,
  Download,
  UserPlus,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Unlock,
  FileText,
  ShieldCheck,
  Mars,
  Venus
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import EtabSidebar from '../components/etablissement/EtabSidebar';
import EtabTopbar from '../components/etablissement/EtabTopbar';
import DisciplineTab from '../components/etablissement/DisciplineTab';
import DossierScolaireModal from '../components/etablissement/DossierScolaireModal';
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
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    semestre: 1
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
  const [profile, setProfile] = useState({ nom: '', region: '', ville: '', code_etablissement: '', signature_url: '', cachet_url: '' });
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
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('fichier', file);

    try {
      const res = await fetch('http://localhost:5002/api/messages/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setAttachedFile({ url: data.fichier_url, name: data.fichier_nom });
      } else {
        const errData = await res.json();
        alert(errData.message || "Erreur lors du téléchargement du fichier.");
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
  const [loadingPreInscriptions, setLoadingPreInscriptions] = useState(false);
  const [editingPreInscription, setEditingPreInscription] = useState(null);
  const [showPreModal, setShowPreModal] = useState(false);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);

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
    nom: '', prenom: '', sexe: 'M', date_naissance: '', lieu_naissance: '', 
    nationalite: '', telephone: '', coordonnees_parent: '', 
    classe_id: '', statut: 'APTE', photo: null 
  });
  const [newMatiere, setNewMatiere] = useState({ nom: '', code: '' });
  const [newProf, setNewProf] = useState({ email: '', password: '' });
  const [newMessage, setNewMessage] = useState({ destinataire_type: 'CLASSE', destinataire_id: '', sujet: '', contenu: '' });

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
  const [newSchedule, setNewSchedule] = useState({ matiere_id: '', professeur_id: '', jour_semaine: 'Lundi', heure_debut: '08:00', heure_fin: '09:00', salle: '' });
  const [newExam, setNewExam] = useState({ matiere_id: '', type_examen: 'DEVOIR', date_examen: '', heure_examen: '', salle: '' });
  const [calendarExams, setCalendarExams] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedExam, setSelectedExam] = useState(null);
  const [scheduleMatieres, setScheduleMatieres] = useState([]);
  const [scheduleProfs, setScheduleProfs] = useState([]);
  const [proposedDevoirs, setProposedDevoirs] = useState([]);

  // Décisions states
  const [notesSubTab, setNotesSubTab] = useState('saisie');
  const [decisionsClasseId, setDecisionsClasseId] = useState('');
  const notesAnneeScolaire = selectedYear;
  const [decisions, setDecisions] = useState([]);
  const [reglesPassage, setReglesPassage] = useState({ seuil_passage_direct: 12, seuil_passage: 10, seuil_cours_vacances: 8 });
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
    const token = localStorage.getItem('token');
    if (!user && !token) {
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
    const token = localStorage.getItem('token');
    try {
      const [incRes, outRes] = await Promise.all([
        fetch('http://localhost:5002/api/eleves/transfers/incoming', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5002/api/eleves/transfers/outgoing', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (incRes.ok) setIncomingTransfers(await incRes.json());
      if (outRes.ok) setOutgoingTransfers(await outRes.json());
    } catch (err) { console.error(err); }
  };

  const fetchPartages = async () => {
    const token = localStorage.getItem('token');
    try {
      const [recusRes, envoyesRes] = await Promise.all([
        fetch('http://localhost:5002/api/partages/received', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5002/api/partages/sent', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (recusRes.ok) setPartagesRecus(await recusRes.json());
      if (envoyesRes.ok) setPartagesEnvoyes(await envoyesRes.json());
    } catch (err) { console.error(err); }
  };

  const fetchPartageEtab = async (q) => {
    if (q.length < 2) { setPartageResults([]); return; }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/etablissement/search?q=${encodeURIComponent(q)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPartageResults(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchDecisions = async (classeId) => {
    if (!classeId) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [decisionsRes, reglesRes] = await Promise.all([
        fetch(`http://localhost:5002/api/notes/decisions/${classeId}?annee_scolaire=${notesAnneeScolaire}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5002/api/notes/regles-passage', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      if (decisionsRes.ok) setDecisions(await decisionsRes.json());
      if (reglesRes.ok) setReglesPassage(await reglesRes.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchAuditLog = async (classeId = '', trimestre = '', anneeScolaire = notesAnneeScolaire) => {
    setAuditLoading(true);
    const token = localStorage.getItem('token');
    try {
      let url = 'http://localhost:5002/api/etablissement/audit';
      const params = new URLSearchParams();
      if (classeId) params.append('classe_id', classeId);
      if (trimestre) params.append('trimestre', trimestre);
      if (anneeScolaire) params.append('annee_scolaire', anneeScolaire);
      if ([...params].length > 0) url += '?' + params.toString();

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setAuditLog(await res.json());
    } catch (err) { console.error(err); }
    setAuditLoading(false);
  };

  const openAuditConfirmModal = (entry, type) => {
    setAuditConfirmAction({ type, entry });
    setShowAuditConfirmModal(true);
  };

  const executeAuditAction = async () => {
    if (!auditConfirmAction) return;
    const { type, entry } = auditConfirmAction;
    const token = localStorage.getItem('token');
    const endpoint = type === 'confirm' ? 'confirm' : 'reject';
    
    try {
      const res = await fetch(`http://localhost:5002/api/etablissement/audit/${entry.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || (type === 'confirm' ? 'Modification de la note validée et appliquée.' : 'Modification de la note rejetée.'));
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/notes/suivi-remplissage?semestre=${sem}&annee_scolaire=${anneeScolaire}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setSuiviRemplissage(await res.json());
    } catch (err) { console.error(err); }
    setSuiviLoading(false);
  };

  const handleToggleBulletinPublication = async (classeId, anneeScolaire, currentStatus) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/notes/publications/${classeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          semestre: suiviSemestre,
          annee_scolaire: anneeScolaire,
          autorise: !currentStatus
        })
      });
      if (res.ok) {
        showNotification('Statut de publication mis à jour !');
        fetchSuiviRemplissage(suiviSemestre);
      } else {
        showNotification("Erreur lors de la modification de l'autorisation.", 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification("Erreur de connexion au serveur.", 'error');
    }
  };

  const handleNotesAnneeChange = (newYear) => {
    setNotesAnneeScolaire(newYear);
    setSelectedClasse('');
    setDecisionsClasseId('');
    setDecisions([]);
    setAuditClasseFilter('');
    
    if (notesSubTab === 'audit') {
      fetchAuditLog('', auditTrimestreFilter, newYear);
    } else if (notesSubTab === 'suivi') {
      fetchSuiviRemplissage(suiviSemestre, newYear);
    }
  };

  const fetchAbsencesLog = async (classeId = '', justifiee = '', date = '', q = '') => {
    setAbsLoading(true);
    const token = localStorage.getItem('token');
    try {
      let url = 'http://localhost:5002/api/etablissement/absences';
      const params = new URLSearchParams();
      if (classeId) params.append('classe_id', classeId);
      if (justifiee !== '') params.append('justifiee', justifiee);
      if (date) params.append('date', date);
      if (q) params.append('q', q);
      if ([...params].length > 0) url += '?' + params.toString();

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setAbsencesLog(await res.json());
    } catch (err) { console.error(err); }
    setAbsLoading(false);
  };

  const handleJustifyAbsence = async (e) => {
    e.preventDefault();
    if (!selectedAbsenceForJustify) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/etablissement/absences/${selectedAbsenceForJustify.id}/justifier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ motif_justification: absJustificationMotif })
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
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (cahierFilterClasse) params.append('classe_id', cahierFilterClasse);
      if (cahierFilterProf) params.append('professeur_id', cahierFilterProf);
      const res = await fetch(`http://localhost:5002/api/cahier-texte/admin?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/cahier-texte/${id}/visa`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/notes/regles-passage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reglesPassage)
      });
      if (res.ok) {
        showNotification('Règles de passage mises à jour !');
        setShowReglesModal(false);
        if (decisionsClasseId) fetchDecisions(decisionsClasseId);
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveDecisions = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/notes/decisions/${decisionsClasseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ decisions, annee_scolaire: notesAnneeScolaire })
      });
      if (res.ok) {
        showNotification('Décisions enregistrées !');
        fetchDecisions(decisionsClasseId);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const updateDecision = (eleveId, field, value) => {
    setDecisions(prev => prev.map(d => {
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
          const targetClasses = classes.filter(c => c.niveau === targetNiveau);
          const currentClassObj = classes.find(c => c.id === decisionsClasseId);
          const currentSuffix = currentClassObj ? currentClassObj.nom.slice(-1) : '';
          const matchedClass = targetClasses.find(tc => tc.nom.endsWith(currentSuffix)) || targetClasses[0];
          
          updated.decision_detail = matchedClass ? matchedClass.nom : 
                                    value === 'PASSAGE' ? 'Passage' :
                                    value === 'COURS_VACANCES' ? 'Cours de vacances' :
                                    'Redoublement';
        } else if (field === 'decision_detail') {
          // If target class is manually changed, update level (for grade skipping)
          const targetClassObj = classes.find(c => c.nom === value);
          if (targetClassObj) {
            updated.niveau_suivant = targetClassObj.niveau;
          }
        }
        return updated;
      }
      return d;
    }));
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

  const fetchSchedule = async (classeId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/classes/${classeId}/schedule`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setScheduleEntries(data);
    } catch (err) { console.error(err); }
  };

  const fetchExams = async (classeId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/classes/${classeId}/exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setExamPlans(data);
    } catch (err) { console.error(err); }
  };

  const fetchProposedDevoirs = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/etablissement/planning/propositions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setProposedDevoirs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecideProposal = async (proposalId, action) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/etablissement/planning/propositions/${proposalId}/decider`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/classes/exams/all?debut=${debut}&fin=${fin}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCalendarExams(data);
    } catch (err) { console.error(err); }
  };

  const fetchScheduleMatieres = async (classeId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/classes/${classeId}/matieres`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setScheduleMatieres(data);
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

  const fetchClassAverages = async (semestre, anneeScolaire) => {
    const token = localStorage.getItem('token');
    const targetYear = anneeScolaire || overviewAnneeFilter;
    try {
      const res = await fetch(`http://localhost:5002/api/notes/moyennes-classes?semestre=${semestre || 1}&annee_scolaire=${encodeURIComponent(targetYear)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClassAverages(data.map(c => ({ ...c, moyenne_generale: parseFloat(c.moyenne_generale) || 0 })));
      }
    } catch (err) { console.error('fetchClassAverages error:', err); }
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

  const fetchChatChannels = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/messages/channels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatChannels(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchChatHistory = async (contact) => {
    if (!contact) return;
    setChatLoading(true);
    const token = localStorage.getItem('token');
    try {
      const params = new URLSearchParams({ type: contact.type, target_id: contact.id });
      if (chatChannels.etablissement_id) params.append('etablissement_id', chatChannels.etablissement_id);
      const res = await fetch(`http://localhost:5002/api/messages/history?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) { console.error(err); } finally { setChatLoading(false); }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if ((!chatInput.trim() && !attachedFile) || !activeChatContact) return;
    const token = localStorage.getItem('token');
    const destType = activeChatContact.type === 'PROFESSEUR' ? 'PROFESSEUR' :
                     activeChatContact.type === 'ELEVE' ? 'ELEVE' :
                     activeChatContact.type === 'CLASSE' ? 'CLASSE' : 'ADMIN_ETABLISSEMENT';
    try {
      const res = await fetch('http://localhost:5002/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          destinataire_type: destType,
          destinataire_id: activeChatContact.id,
          sujet: 'Message',
          contenu: chatInput.trim() || (attachedFile ? `📎 ${attachedFile.name}` : ''),
          etablissement_id: chatChannels.etablissement_id,
          fichier_url: attachedFile ? attachedFile.url : null,
          fichier_nom: attachedFile ? attachedFile.name : null
        })
      });
      if (res.ok) {
        setChatInput('');
        setAttachedFile(null);
        fetchChatHistory(activeChatContact);
      }
    } catch (err) { console.error(err); }
  };

  const handleChatContactClick = (contact) => {
    setActiveChatContact(contact);
    fetchChatHistory(contact);
  };

  const toggleMessagePermission = async (profId, currentValue) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5002/api/professeurs/${profId}/permission`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ droit_envoi_message: !currentValue })
      });
      fetchProfs();
      showNotification(`Permission de messagerie ${!currentValue ? 'accordée' : 'révoquée'}.`);
    } catch (err) { console.error(err); }
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/notes/classe/${classeId}/matiere/${matiereId}?semestre=${selectedSemestre}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setNotesGrid(data.map(item => ({ 
          ...item, 
          note_devoir: item.note_devoir || '', 
          note_examen: item.note_examen || '',
          appreciation: item.appreciation || ''
        })));
      }
    } catch (err) { console.error(err); }
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
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5002/api/etablissement/search?q=${encodeURIComponent(transferSearch.trim())}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          // Filter out current establishment so school can't transfer to itself
          const filtered = data.filter(e => e.id !== profile.id && e.id !== transferEleve?.etablissement_id);
          setTransferResults(filtered);
        }
      } catch (err) { console.error(err); }
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
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/notes/eleve/${eleveId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedGradesData(data);
        
        // Initialize jury input states from loaded data
        if (data.decisionJury) {
          const loadedDec = data.decisionJury.decision;
          setJuryDecision(loadedDec === 'PASSAGE_DIRECT' ? 'PASSAGE' : (loadedDec || 'PASSAGE'));
          setJuryObservations(data.decisionJury.observations_jury || '');
          setJuryAppreciations(data.decisionJury.appreciations_conseil ? data.decisionJury.appreciations_conseil.split(',').map(s => s.trim()) : []);
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
        showNotification('Impossible de charger les notes de l\'élève.', 'error');
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
    const token = localStorage.getItem('token');
    
    const student = selectedGradesData.student;
    const activeYear = Object.keys(selectedGradesData.notes)[0];
    const periodData = selectedGradesData.notes[activeYear]?.periodes[gradesModalSemestre];
    const avg = periodData ? periodData.moyenne_generale : null;

    const isFinalPeriod = gradesModalSemestre === 'Semestre 2' || gradesModalSemestre === 'Trimestre 3';
    
    // Auto-calculate target level and default class name
    const currentClassObj = classes.find(c => c.id === student.classe_id);
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
    
    const targetClasses = classes.filter(c => c.niveau === computedTargetNiveau);
    const defaultTargetClass = targetClasses.find(tc => tc.nom.endsWith(currentSuffix))?.nom || targetClasses[0]?.nom || computedTargetNiveau;
    const finalDetail = juryTargetClass || defaultTargetClass;

    const payload = {
      classeId: student.classe_id,
      anneeScolaire: student.annee_scolaire,
      moyenneGenerale: avg,
      decision: isFinalPeriod ? juryDecision : null,
      decisionDetail: isFinalPeriod ? finalDetail : null,
      observationsJury: juryObservations,
      appreciationsConseil: juryAppreciations.join(',')
    };

    try {
      const res = await fetch(`http://localhost:5002/api/notes/eleve/${student.id}/decision`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showNotification('Décision et observations du jury enregistrées !');
        // Update loaded data states
        setSelectedGradesData(prev => ({
          ...prev,
          decisionJury: {
            decision: isFinalPeriod ? juryDecision : (prev.decisionJury ? prev.decisionJury.decision : null),
            decision_detail: isFinalPeriod ? payload.decisionDetail : (prev.decisionJury ? prev.decisionJury.decision_detail : null),
            observations_jury: juryObservations,
            moyenne_generale: avg,
            appreciations_conseil: juryAppreciations.join(',')
          }
        }));
      } else {
        showNotification('Erreur lors de l\'enregistrement de la décision.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur réseau.', 'error');
    } finally {
      setSavingJuryDecision(false);
    }
  };

  const toggleAppreciation = (label) => {
    setJuryAppreciations(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label) 
        : [...prev, label]
    );
  };

  const fetchRankingData = async (classeId, period) => {
    if (!classeId) {
      setRankingData([]);
      return;
    }
    setRankingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/notes/classe/${classeId}/classement?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
      const yearClasses = classes.filter(c => c.annee_scolaire === elevesAnneeFilter);
      if (yearClasses.length > 0) {
        if (!rankingClasseId || !yearClasses.some(c => c.id === rankingClasseId)) {
          setRankingClasseId(yearClasses[0].id);
        }
      } else {
        setRankingClasseId('');
      }
    }
  }, [eleveSubTab, classes, rankingClasseId, elevesAnneeFilter]);

  const handleDownloadRankingPDF = () => {
    if (!rankingClasseId) return;
    const token = localStorage.getItem('token');
    const url = `http://localhost:5002/api/documents/classe/${rankingClasseId}/classement-pdf?period=${rankingPeriod}&token=${token}`;
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
    const token = localStorage.getItem('token');
    const formData = new FormData();
    const fields = ['nom', 'prenom', 'sexe', 'date_naissance', 'lieu_naissance', 'nationalite', 'telephone', 'coordonnees_parent', 'classe_id', 'statut'];
    fields.forEach(key => {
      if (newEleve[key] !== null && newEleve[key] !== '') formData.append(key, newEleve[key]);
    });
    if (newEleve.photo) formData.append('photo', newEleve.photo);
    if (newEleve.justificatif_inapte) formData.append('justificatif_inapte', newEleve.justificatif_inapte);

    try {
      const res = await fetch('http://localhost:5002/api/eleves', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessData({ identifiant: data.identifiant, password: data.password });
        setShowSuccessModal(true);
        setShowEleveModal(false);
        setNewEleve({ 
          nom: '', prenom: '', sexe: 'M', date_naissance: '', lieu_naissance: '', 
          nationalite: '', telephone: '', coordonnees_parent: '', 
          classe_id: '', statut: 'APTE', photo: null, justificatif_inapte: null
        });
        fetchEleves();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleUpdateEleve = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    const fields = ['nom', 'prenom', 'sexe', 'date_naissance', 'lieu_naissance', 'nationalite', 'telephone', 'coordonnees_parent', 'statut', 'classe_id'];
    fields.forEach(key => {
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
      const res = await fetch(`http://localhost:5002/api/eleves/${editingEleve.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setEditingEleve(null);
        fetchEleves();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDeleteEleve = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élève et son compte ?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/eleves/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchEleves();
    } catch (err) { console.error(err); }
  };

  const fetchPreInscriptions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingPreInscriptions(true);
    try {
      const res = await fetch('http://localhost:5002/api/pre-inscriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPreInscriptions(data);
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de chargement des pré-inscriptions.', 'error');
    } finally {
      setLoadingPreInscriptions(false);
    }
  };

  const handleValidatePreInscription = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/pre-inscriptions/${id}/validate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedCreds(data.credentials);
        setShowCredsModal(true);
        showNotification(data.message);
        fetchPreInscriptions();
        fetchEleves();
      } else {
        showNotification(data.message || 'Erreur lors de la validation.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de serveur lors de la validation.', 'error');
    }
  };

  const handleRejectPreInscription = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/pre-inscriptions/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/pre-inscriptions/${editingPreInscription.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(editingPreInscription)
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
    showNotification('Lien d\'inscription copié !');
  };

  const handleTransferEleve = async (e) => {
    e.preventDefault();
    if (!selectedTargetEtab) return showNotification('Veuillez sélectionner un établissement destinataire.', 'error');

    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const isBulk = selectedEleveIds.length > 0;
      const url = isBulk 
        ? 'http://localhost:5002/api/eleves/transfer-bulk'
        : `http://localhost:5002/api/eleves/${transferEleve.id}/transfer`;
      
      const body = isBulk
        ? { eleve_ids: selectedEleveIds, nouveau_etablissement_id: selectedTargetEtab.id, motif: transferMotif }
        : { nouveau_etablissement_id: selectedTargetEtab.id, motif: transferMotif };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAcceptTransfer = async (transferId) => {
    setLoading(true);
    setConfirmTransferModal(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/eleves/transfers/${transferId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Transfert accepté avec succès !');
        fetchTransfers();
        fetchEleves();
      } else {
        showNotification(data.message || 'Erreur lors de l\'acceptation.', 'error');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleRejectTransfer = async (transferId) => {
    setLoading(true);
    setConfirmTransferModal(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/eleves/transfers/${transferId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Demande de transfert refusée.');
        fetchTransfers();
      } else {
        showNotification(data.message || 'Erreur lors du refus.', 'error');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCancelTransfer = async (transferId) => {
    setLoading(true);
    setConfirmTransferModal(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/eleves/transfers/${transferId}/cancel`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Demande de transfert annulée.');
        fetchTransfers();
        fetchEleves();
      } else {
        showNotification(data.message || 'Erreur lors de l\'annulation.', 'error');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAssignClass = async (eleve, classeId) => {
    if (!classeId) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/eleves/${eleve.id}/assign-class`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ classe_id: classeId })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Élève affecté à la classe avec succès !');
        fetchEleves();
      } else {
        showNotification(data.message || 'Erreur lors de l\'affectation.', 'error');
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/classes/${scheduleClassId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSchedule)
      });
      if (res.ok) {
        setShowScheduleModal(false);
        setNewSchedule({ matiere_id: '', professeur_id: '', jour_semaine: 'Lundi', heure_debut: '08:00', heure_fin: '09:00', salle: '' });
        fetchSchedule(scheduleClassId);
        showNotification('Créneau ajouté !');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Supprimer ce créneau ?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/classes/${scheduleClassId}/schedule/${scheduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { fetchSchedule(scheduleClassId); showNotification('Créneau supprimé.'); }
    } catch (err) { console.error(err); }
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const dateTime = newExam.heure_examen
      ? `${newExam.date_examen}T${newExam.heure_examen}:00`
      : newExam.date_examen;
    const isEdit = !!editingExam;
    const url = isEdit
      ? `http://localhost:5002/api/classes/${examClassId}/exams/${editingExam.id}`
      : `http://localhost:5002/api/classes/${examClassId}/exams`;
    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...newExam, date_examen: dateTime })
      });
      if (res.ok) {
        setShowExamModal(false);
        setEditingExam(null);
        setNewExam({ matiere_id: '', type_examen: 'DEVOIR', date_examen: '', heure_examen: '', salle: '' });
        fetchExams(examClassId);
        fetchProposedDevoirs();
        showNotification(isEdit ? 'Examen modifié !' : 'Examen planifié !');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Supprimer cet examen ?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/classes/${examClassId}/exams/${examId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { fetchExams(examClassId); showNotification('Examen supprimé.'); }
    } catch (err) { console.error(err); }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const method = editingClass ? 'PUT' : 'POST';
    const url = editingClass ? `http://localhost:5002/api/classes/${editingClass.id}` : 'http://localhost:5002/api/classes';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingClass || newClass)
      });
      if (res.ok) {
        setShowClassModal(false);
        setNewClass({ nom: '', niveau: '6ème', annee_scolaire: '2025-2026' });
        setEditingClass(null);
        fetchClasses();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAddMatiere = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const method = editingMatiere ? 'PUT' : 'POST';
    const url = editingMatiere ? `http://localhost:5002/api/notes/matieres/${editingMatiere.id}` : 'http://localhost:5002/api/notes/matieres';
    const payload = editingMatiere 
      ? { nom: editingMatiere.nom, code: editingMatiere.code_matiere } 
      : newMatiere;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowMatiereModal(false);
        setNewMatiere({ nom: '', code: '' });
        setEditingMatiere(null);
        fetchMatieres();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDeleteMatiere = async (id) => {
    if (!window.confirm('Supprimer cette matière ?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/notes/matieres/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchMatieres();
    } catch (err) { console.error(err); }
  };

  const handleSaveNotes = async () => {
    if (!selectedClasse || !selectedMatiere) return showNotification('Veuillez sélectionner une classe et une matière.', 'error');
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const editable = notesGrid.filter(n => !n.readonly);

      // 1. Envoi des Devoirs
      const resDevoir = await fetch('http://localhost:5002/api/notes/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          notes: editable.map(n => ({ eleve_id: n.eleve_id, valeur: n.note_devoir, appreciation: '' })),
          matiere_id: selectedMatiere,
          semestre: selectedSemestre,
          type_note: 'DEVOIR'
        })
      });

      if (!resDevoir.ok) {
        const errorData = await resDevoir.json();
        throw new Error(errorData.message || 'Erreur lors de l\'enregistrement des devoirs');
      }

      // 2. Envoi des Examens
      const resExamen = await fetch('http://localhost:5002/api/notes/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          notes: editable.map(n => ({ eleve_id: n.eleve_id, valeur: n.note_examen, appreciation: n.appreciation })),
          matiere_id: selectedMatiere,
          semestre: selectedSemestre,
          type_note: 'EXAMEN'
        })
      });

      if (!resExamen.ok) {
        const errorData = await resExamen.json();
        throw new Error(errorData.message || 'Erreur lors de l\'enregistrement des examens');
      }

      showNotification('Toutes les notes et appréciations ont été enregistrées !');
      // Recharger les notes pour confirmer l'affichage
      fetchNotesGrid(selectedClasse, selectedMatiere);

    } catch (err) { 
      console.error(err); 
      showNotification(err.message || 'Erreur lors de l\'enregistrement.', 'error');
    } finally { setLoading(false); }
  };


  const openCoefModal = async (classe) => {
    setSelectedClassCoef(classe);
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/classes/${classe.id}/matieres`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const coefs = {};
        data.forEach(m => coefs[m.id] = m.coefficient);
        setCurrentCoefs(coefs);
        setShowCoefModal(true);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveCoefs = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const matieresToUpdate = Object.keys(currentCoefs).map(id => ({
      matiere_id: id,
      coefficient: currentCoefs[id]
    }));

    try {
      const res = await fetch(`http://localhost:5002/api/classes/${selectedClassCoef.id}/matieres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ matieres: matieresToUpdate })
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
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5002/api/eleves/export?token=${token}&classe_id=${selectedClasseFilter}`, '_blank');
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
        showNotification(data.message);
        fetchEleves();
      } else {
        showNotification(data.message || 'Erreur lors de l\'importation.', 'error');
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
      if (res.ok) alert(`Noms détectés: ${data.names.join(', ')}`);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleOpenBulletinPreview = (eleve) => {
    setDocPreviewModal({
      isOpen: true,
      eleve,
      type: 'bulletin',
      semestre: selectedSemestre || 1
    });
  };

  const handleOpenDossierPreview = (eleve) => {
    setDocPreviewModal({
      isOpen: true,
      eleve,
      type: 'dossier',
      semestre: 1
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
    const token = localStorage.getItem('token');
    const eleve = docPreviewModal.eleve;
    let url = '';
    let fileName = '';

    if (docPreviewModal.type === 'bulletin') {
      url = `http://localhost:5002/api/documents/bulletin/${eleve.id}?token=${token}&semestre=${docPreviewModal.semestre}`;
      fileName = `Bulletin_${eleve.prenom}_${eleve.nom}_S${docPreviewModal.semestre}.pdf`.replace(/\s+/g, '_');
    } else if (docPreviewModal.type === 'dossier') {
      url = `http://localhost:5002/api/documents/dossier-transfert/${eleve.id}?token=${token}`;
      fileName = `Dossier_Transfert_${eleve.prenom}_${eleve.nom}.pdf`.replace(/\s+/g, '_');
    }

    try {
      showNotification('Téléchargement du document en cours...', 'info');
      const res = await fetch(url);
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
    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('fichier', partageFile);
      formData.append('destinataire_etablissement_id', selectedPartageEtab.id);
      formData.append('description', partageDescription);
      if (partageEleveId) formData.append('eleve_id', partageEleveId);

      const res = await fetch('http://localhost:5002/api/partages', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
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
    } catch (err) { showNotification(err.message, 'error'); } finally { setLoading(false); }
  };

  const handleDownloadPartage = async (id) => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5002/api/partages/${id}/download?token=${token}`, '_blank');
    fetchPartages();
  };

  const handleDeletePartage = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/partages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification('Document supprimé.');
        fetchPartages();
      }
    } catch (err) { console.error(err); }
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
        showNotification('Message envoyé !');
        setShowMessageModal(false);
        setNewMessage({ destinataire_type: 'CLASSE', destinataire_id: '', sujet: '', contenu: '' });
        fetchMessages();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleTransmettreLivretsZone = async () => {
    if (!window.confirm(" Transmettre officiellement les Livrets Scolaires des élèves de Terminale / BFEM vers l'Office du BAC et la Zone d'Examen attribuée ?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/office-bac/transmettre-livrets-zone', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Livrets scolaires transmis à la zone d\'examen !');
      } else {
        showNotification(data.message || 'Erreur lors de la transmission.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur réseau.', 'error');
    }
  };

  const fetchAttestations = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/documents/attestations/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttestations(data);
      }
    } catch (err) { console.error(err); }
  };

  const handleAcceptAttestation = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/documents/attestations/requests/${id}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification('Demande d\'attestation acceptée !');
        fetchAttestations();
      }
    } catch (err) { console.error(err); }
  };

  const handleRefuseAttestation = async (e) => {
    e.preventDefault();
    if (!motifRefusAttestation) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/documents/attestations/requests/${refusingAttestation.id}/refuse`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ motif_refus: motifRefusAttestation })
      });
      if (res.ok) {
        showNotification('Demande d\'attestation refusée.', 'error');
        setRefusingAttestation(null);
        setMotifRefusAttestation('');
        fetchAttestations();
      }
    } catch (err) { console.error(err); }
  };

  const handleAddProf = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const method = editingProf ? 'PUT' : 'POST';
    const url = editingProf ? `http://localhost:5002/api/professeurs/${editingProf.id}` : 'http://localhost:5002/api/professeurs';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingProf || newProf)
      });
      if (res.ok) {
        setShowProfModal(false);
        setNewProf({ email: '', password: '' });
        setEditingProf(null);
        fetchProfs();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSearchProf = async (e) => {
    e.preventDefault();
    if (!profSearchId.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchedProf(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/professeurs/search/${profSearchId.trim()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/professeurs/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ professeur_id: searchedProf.id })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Invitation envoyée !', 'success');
        setShowProfModal(false);
        setProfSearchId('');
        setSearchedProf(null);
        fetchProfs();
      } else {
        showNotification(data.message || 'Erreur lors de l\'envoi de l\'invitation.', 'error');
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/professeurs/${p.id}/assignments`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5002/api/professeurs/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          professeur_id: editingProf.id,
          classe_id: assignClasseId,
          matiere_id: assignMatiereId
        })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Classe/Matière affectée avec succès !', 'success');
        
        // Refresh assignments list
        const resList = await fetch(`http://localhost:5002/api/professeurs/${editingProf.id}/assignments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataList = await resList.json();
        if (resList.ok) setProfAssignments(dataList);
        
        setAssignClasseId('');
        setAssignMatiereId('');
      } else {
        showNotification(data.message || 'Erreur lors de l\'affectation.', 'error');
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5002/api/professeurs/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Affectation retirée.', 'success');
        
        // Refresh assignments list
        const resList = await fetch(`http://localhost:5002/api/professeurs/${editingProf.id}/assignments`, {
          headers: { 'Authorization': `Bearer ${token}` }
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
    const token = localStorage.getItem('token');
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
      const res = await fetch('http://localhost:5002/api/etablissement/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
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
    } finally { setLoading(false); }
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const availableYears = Array.from(new Set(classes.map(c => c.annee_scolaire))).filter(Boolean);
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
    
    const yearClasses = classes.filter(c => c.annee_scolaire === newYear);
    setRankingClasseId(yearClasses[0]?.id || '');

    if (notesSubTab === 'audit') {
      fetchAuditLog('', auditTrimestreFilter, newYear);
    } else if (notesSubTab === 'suivi') {
      fetchSuiviRemplissage(suiviSemestre, newYear);
    }
  };

  if (!user) return null;

  const firstLetter = (user.email || profile.nom || 'A')[0].toUpperCase();

  return (
    <div className="dashboard-layout">
      <EtabSidebar 
        activeTab={activeTab} 
        profile={profile} 
        elevesCount={eleves.length} 
        preInscriptionsCount={preInscriptions.length} 
        unreadPartagesCount={partagesRecus.filter(d => !d.lu).length} 
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

          {activeTab === 'discipline' && (
            <DisciplineTab elevesList={eleves} />
          )}

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
          </div> {/* content-inner */}
        </div> {/* content-area */}
      </div> {/* main */}

      {/* Modals */}
      {(showEleveModal || editingEleve) && (
        <div className="modal-overlay">
          <div className="modal-card" style={{maxWidth: '700px'}}>
            <h3>{editingEleve ? 'Modifier l\'élève' : 'Inscrire un Élève'}</h3>
            <form onSubmit={editingEleve ? handleUpdateEleve : handleAddEleve}>
              <div className="form-row">
                <div style={{flex: '0 0 100px'}}>
                    <div className="photo-upload-container" onClick={() => editingEleve ? editPhotoInputRef.current.click() : photoInputRef.current.click()}>
                        {(() => {
                            const src = editingEleve
                                ? (editingEleve.photoPreview || (editingEleve.photo_url ? `http://localhost:5002${editingEleve.photo_url}` : null))
                                : newEleve.photoPreview;
                            return src ? (
                                <img src={src} alt="Preview" className="photo-preview" />
                            ) : (
                                <Camera size={32} color="#CBD5E0" />
                            );
                        })()}
                    </div>
                    <input type="file" ref={photoInputRef} style={{display: 'none'}} accept="image/*" onChange={e => {
                        const file = e.target.files[0];
                        if (file) setNewEleve({...newEleve, photo: file, photoPreview: URL.createObjectURL(file)});
                    }} />
                    <input type="file" ref={editPhotoInputRef} style={{display: 'none'}} accept="image/*" onChange={e => {
                        const file = e.target.files[0];
                        if (file) setEditingEleve({...editingEleve, photoFile: file, photoPreview: URL.createObjectURL(file)});
                    }} />
                </div>
                <div style={{flex: 1}}>
                  <div className="form-row">
                    <div className="input-group"><label>Prénom</label><input type="text" required value={editingEleve ? editingEleve.prenom : newEleve.prenom} onChange={e => editingEleve ? setEditingEleve({...editingEleve, prenom: e.target.value}) : setNewEleve({...newEleve, prenom: e.target.value})} /></div>
                    <div className="input-group"><label>Nom</label><input type="text" required value={editingEleve ? editingEleve.nom : newEleve.nom} onChange={e => editingEleve ? setEditingEleve({...editingEleve, nom: e.target.value}) : setNewEleve({...newEleve, nom: e.target.value})} /></div>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Civilité / Sexe</label>
                  <select 
                    value={editingEleve ? (editingEleve.sexe || 'M') : (newEleve.sexe || 'M')} 
                    onChange={e => editingEleve ? setEditingEleve({...editingEleve, sexe: e.target.value}) : setNewEleve({...newEleve, sexe: e.target.value})}
                  >
                    <option value="M">Masculin (M.)</option>
                    <option value="F">Féminin (Mme / Mlle)</option>
                  </select>
                </div>
                <div className="input-group"><label>Date de Naissance</label><input type="date" required value={editingEleve ? editingEleve.date_naissance?.split('T')[0] : newEleve.date_naissance} onChange={e => editingEleve ? setEditingEleve({...editingEleve, date_naissance: e.target.value}) : setNewEleve({...newEleve, date_naissance: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label>Lieu de Naissance</label><input type="text" value={editingEleve ? editingEleve.lieu_naissance : newEleve.lieu_naissance} onChange={e => editingEleve ? setEditingEleve({...editingEleve, lieu_naissance: e.target.value}) : setNewEleve({...newEleve, lieu_naissance: e.target.value})} /></div>
                <div className="input-group"><label>Nationalité</label><input type="text" value={editingEleve ? editingEleve.nationalite : newEleve.nationalite} onChange={e => editingEleve ? setEditingEleve({...editingEleve, nationalite: e.target.value}) : setNewEleve({...newEleve, nationalite: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label>Téléphone</label><input type="text" value={editingEleve ? editingEleve.telephone : newEleve.telephone} onChange={e => editingEleve ? setEditingEleve({...editingEleve, telephone: e.target.value}) : setNewEleve({...newEleve, telephone: e.target.value})} /></div>
                <div className="input-group"><label>Coordonnées Parent</label><input type="text" value={editingEleve ? editingEleve.coordonnees_parent : newEleve.coordonnees_parent} onChange={e => editingEleve ? setEditingEleve({...editingEleve, coordonnees_parent: e.target.value}) : setNewEleve({...newEleve, coordonnees_parent: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Statut</label>
                  <select
                    value={editingEleve ? editingEleve.statut : newEleve.statut}
                    onChange={e => editingEleve
                      ? setEditingEleve({...editingEleve, statut: e.target.value})
                      : setNewEleve({...newEleve, statut: e.target.value})
                    }
                  >
                    <option value="APTE">Apte</option>
                    <option value="INAPTE">Inapte</option>
                  </select>
                </div>
                {!editingEleve && (<div className="input-group"><label>Classe</label><select required value={newEleve.classe_id} onChange={e => setNewEleve({...newEleve, classe_id: e.target.value})}><option value="">Sélectionner</option>{classes.filter(c => c.annee_scolaire === elevesAnneeFilter).map(c => <option key={c.id} value={c.id}>{c.nom} ({c.annee_scolaire})</option>)}</select></div>)}
              </div>

              {/* Justificatif obligatoire si INAPTE */}
              {((editingEleve ? editingEleve.statut : newEleve.statut) === 'INAPTE') && (
                <div style={{
                  background: '#fff7ed', border: '2px solid #fb923c',
                  borderRadius: 10, padding: '14px 16px', marginBottom: 12
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#c2410c', marginBottom: 8 }}>
                    <AlertTriangle size={16} /> Pièce Justificative (obligatoire pour statut Inapte)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    required={editingEleve ? !editingEleve.justificatif_inapte_url : true}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (editingEleve) setEditingEleve({...editingEleve, justificatifFile: file});
                      else setNewEleve({...newEleve, justificatif_inapte: file});
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #fed7aa', background: '#fff' }}
                  />
                  <p style={{ fontSize: 11, color: '#92400e', marginTop: 6, marginBottom: 0 }}>
                    📄 Formats acceptés : PDF, JPG, PNG — Max 5 Mo
                  </p>
                  {editingEleve?.justificatif_inapte_url && (
                    <a
                      href={`http://localhost:5002${editingEleve.justificatif_inapte_url}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: '#2563eb', fontWeight: 700 }}
                    >
                      <FileText size={14} /> Voir le justificatif actuel
                    </a>
                  )}
                </div>
              )}
              <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={() => {setShowEleveModal(false); setEditingEleve(null);}}>Annuler</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : (editingEleve ? 'Enregistrer' : 'Inscrire')}</button></div>
            </form>
          </div>
        </div>
      )}

      {transferEleve && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px', width: '90%' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--slate-900)' }}>
              {selectedEleveIds.length > 0 ? `Transférer un lot d'élèves (${selectedEleveIds.length})` : "Transférer l'élève"}
            </h3>
            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '13px', fontWeight: 600 }}>
              {selectedEleveIds.length > 0 
                ? `${selectedEleveIds.length} élèves sélectionnés dans la liste` 
                : `${transferEleve.prenom} ${transferEleve.nom} (${transferEleve.identifiant_national})`}
            </p>

            {/* Informative notice on transfer of editing rights */}
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '12px', color: '#c2410c', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertTriangle size={18} style={{ color: '#ea580c', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Droits d'édition :</strong> La demande de transfert sera transmise au statut <strong>EN ATTENTE</strong>. Votre établissement conservera tous les droits d'édition jusqu'à l'acceptation finale par l'établissement d'accueil.
              </div>
            </div>

            <form onSubmit={handleTransferEleve}>
              <div className="input-group" style={{ position: 'relative' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '6px', display: 'block' }}>
                  Chercher l'établissement destinataire
                </label>
                <div className="search-input-wrapper">
                    <SearchIcon size={18} className="search-icon-abs" />
                    <input 
                      type="text" 
                      value={transferSearch} 
                      onChange={e => {
                        setTransferSearch(e.target.value);
                        if (selectedTargetEtab) setSelectedTargetEtab(null);
                      }} 
                      placeholder="Rechercher par nom ou code d'établissement..." 
                      style={{ width: '100%', borderRadius: '10px', height: '42px', fontSize: '13px' }}
                    />
                </div>

                {/* Real-time search results dropdown */}
                {transferSearch.trim().length > 0 && !selectedTargetEtab && (
                    <div className="search-results-dropdown" style={{ maxH: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', borderRadius: '10px', marginTop: '4px' }}>
                        {transferResults.length > 0 ? (
                          transferResults.map(etab => (
                            <div 
                              key={etab.id} 
                              className="search-result-item" 
                              onClick={() => { setSelectedTargetEtab(etab); setTransferSearch(etab.nom); setTransferResults([]); }}
                              style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <strong style={{ fontSize: '13px', color: 'var(--slate-800)' }}>{etab.nom}</strong>
                                  <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                                    {etab.code_etablissement || etab.id.substring(0, 8)}
                                  </span>
                                </div>
                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--slate-500)' }}>{etab.ville}, {etab.region}</p>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '12px', fontSize: '12px', color: 'var(--slate-400)', textAlign: 'center' }}>
                            Aucun établissement trouvé pour "{transferSearch}".
                          </div>
                        )}
                    </div>
                )}

                {/* Selected establishment badge */}
                {selectedTargetEtab && (
                    <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '10px', padding: '12px 14px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#047857', fontWeight: 800, display: 'block', letterSpacing: '0.04em' }}>Établissement destinataire sélectionné :</span>
                          <strong style={{ fontSize: '14px', color: '#064e3b' }}>{selectedTargetEtab.nom}</strong>
                          <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ background: '#d1fae5', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Code: {selectedTargetEtab.code_etablissement || selectedTargetEtab.id}</span>
                            <span>{selectedTargetEtab.ville}, {selectedTargetEtab.region}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => { setSelectedTargetEtab(null); setTransferSearch(''); }} style={{ background: 'transparent', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#047857', fontWeight: 700, fontSize: '11px', cursor: 'pointer', padding: '4px 8px' }}>Modifier</button>
                    </div>
                )}
              </div>

              <div className="input-group mt-4">
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '6px', display: 'block' }}>Motif du transfert</label>
                <textarea 
                  required 
                  rows="3" 
                  value={transferMotif} 
                  onChange={e => setTransferMotif(e.target.value)} 
                  placeholder="Ex: Déménagement de la famille, demande des parents..."
                  style={{ width: '100%', borderRadius: '10px', padding: '0.8rem', border: '1px solid #cbd5e1', fontSize: '13px' }}
                ></textarea>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setTransferEleve(null); setTransferSearch(''); setTransferResults([]); setSelectedTargetEtab(null); setTransferMotif(''); }}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading || !selectedTargetEtab} style={{ background: 'var(--primary-color)' }}>Confirmer le Transfert</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewTransferMotifModal && (
        <div className="modal-overlay" onClick={() => setViewTransferMotifModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px', width: '90%', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} className="text-primary" /> Motif du transfert
              </h3>
              <button className="close-btn" onClick={() => setViewTransferMotifModal(null)}><X size={18} /></button>
            </div>

            {viewTransferMotifModal.eleveNom && (
              <p className="text-muted" style={{ marginBottom: '14px', fontSize: '13px', fontWeight: 600 }}>
                Élève concerné : <strong style={{ color: 'var(--slate-800)' }}>{viewTransferMotifModal.eleveNom}</strong>
              </p>
            )}

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: '12px', fontSize: '13px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap', maxHeight: '250px', overflowY: 'auto' }}>
              {viewTransferMotifModal.motif || 'Aucun motif spécifié pour cette demande.'}
            </div>

            <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setViewTransferMotifModal(null)} style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '8px' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmTransferModal && (
        <div className="modal-overlay" onClick={() => setConfirmTransferModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px', width: '90%', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                background: confirmTransferModal.type === 'accept' ? '#dcfce7' : '#fee2e2',
                color: confirmTransferModal.type === 'accept' ? '#15803d' : '#dc2626',
                flexShrink: 0
              }}>
                {confirmTransferModal.type === 'accept' ? (
                  <CheckCircle size={22} />
                ) : (
                  <AlertTriangle size={22} />
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {confirmTransferModal.type === 'accept' && "Accepter le transfert"}
                  {confirmTransferModal.type === 'reject' && "Refuser la demande"}
                  {confirmTransferModal.type === 'cancel' && "Annuler la demande"}
                </h3>
                {confirmTransferModal.eleveNom && (
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    Élève : {confirmTransferModal.eleveNom}
                  </span>
                )}
              </div>
            </div>

            <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.6', marginBottom: '20px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              {confirmTransferModal.type === 'accept' && (
                <>Voulez-vous vraiment <strong>accepter</strong> ce transfert ? L'élève sera rattaché à votre établissement et les <strong>droits d'édition</strong> vous seront automatiquement transmis.</>
              )}
              {confirmTransferModal.type === 'reject' && (
                <>Êtes-vous sûr de vouloir <strong>refuser</strong> cette demande de transfert ? L'élève restera sous la gestion de son établissement d'origine.</>
              )}
              {confirmTransferModal.type === 'cancel' && (
                <>Êtes-vous sûr de vouloir <strong>annuler</strong> cette demande de transfert ?</>
              )}
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setConfirmTransferModal(null)} 
                disabled={loading}
                style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '8px' }}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={confirmTransferModal.onConfirm}
                disabled={loading}
                style={{
                  fontSize: '12px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  color: '#fff',
                  background: confirmTransferModal.type === 'accept' ? '#10b981' : '#ef4444',
                  borderColor: confirmTransferModal.type === 'accept' ? '#059669' : '#dc2626'
                }}
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : (
                  confirmTransferModal.type === 'accept' ? 'Confirmer l\'acceptation' :
                  confirmTransferModal.type === 'reject' ? 'Confirmer le refus' : 'Confirmer l\'annulation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showGradesModal && (
        <div className="modal-overlay" onClick={() => setShowGradesModal(false)}>
          <div className="modal-card grades-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%' }}>
            <div className="grades-modal-header">
              <h3>Détails Scolaires & Notes</h3>
              <button className="close-btn" onClick={() => setShowGradesModal(false)}><X size={20} /></button>
            </div>

            {gradesModalLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={40} style={{ color: 'var(--primary-color)' }} />
                <p className="mt-4 text-slate-500 font-semibold">Chargement des notes de l'élève...</p>
              </div>
            ) : selectedGradesData ? (
              <div className="grades-modal-body">
                <div className="grades-modal-grid">
                  {/* Column 1: Identity Card */}
                  <div className="grades-student-card">
                    <div className="grades-avatar-wrapper">
                      {selectedGradesData.student.photo_url ? (
                        <img src={`http://localhost:5002${selectedGradesData.student.photo_url}`} alt="Photo de l'élève" className="grades-student-photo" />
                      ) : (
                        <div className="grades-student-avatar-placeholder"><User size={48} /></div>
                      )}
                    </div>
                    <div className="grades-student-info">
                      <h4>{selectedGradesData.student.nom}</h4>
                      <h3>{selectedGradesData.student.prenom}</h3>
                      <code className="grades-student-id">{selectedGradesData.student.identifiant_national}</code>
                      
                      <div className="grades-student-meta">
                        <div className="meta-item">
                          <span className="label">Classe actuelle</span>
                          <span className="value">{selectedGradesData.student.classe_nom || 'Non affectée'}</span>
                        </div>
                        <div className="meta-item">
                          <span className="label">Statut d'aptitude</span>
                          <span className={`status-pill ${selectedGradesData.student.statut === 'APTE' ? 'status-pass' : 'status-fail'}`}>
                            {selectedGradesData.student.statut}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Grades and Performance */}
                  <div className="grades-details-panel">
                    {Object.keys(selectedGradesData.notes).length > 0 ? (
                      (() => {
                        const years = Object.keys(selectedGradesData.notes);
                        const activeYear = years[0];
                        const periods = Object.keys(selectedGradesData.notes[activeYear].periodes);
                        
                        return (
                          <>
                            <div className="grades-period-tabs">
                              {periods.map(period => (
                                <button 
                                  key={period} 
                                  type="button"
                                  className={`period-tab-btn ${gradesModalSemestre === period ? 'active' : ''}`}
                                  onClick={() => setGradesModalSemestre(period)}
                                >
                                  {period}
                                </button>
                              ))}
                            </div>

                            {selectedGradesData.notes[activeYear].periodes[gradesModalSemestre] ? (
                              (() => {
                                const periodData = selectedGradesData.notes[activeYear].periodes[gradesModalSemestre];
                                const matieresKeys = Object.keys(periodData.matieres);
                                
                                return (
                                  <div className="grades-table-wrapper">
                                    <table className="grades-table">
                                      <thead>
                                        <tr>
                                          <th>Matière</th>
                                          <th>Coeff</th>
                                          <th>Devoirs</th>
                                          <th>Examen</th>
                                          <th>Moyenne</th>
                                          <th>Appréciation</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {matieresKeys.map(codeMat => {
                                          const mat = periodData.matieres[codeMat];
                                          const devoirs = mat.notes.filter(n => n.type_note === 'DEVOIR');
                                          const examen = mat.notes.find(n => n.type_note === 'EXAMEN' || n.type_note === 'COMPOSITION');
                                          return (
                                            <tr key={codeMat}>
                                              <td className="subject-cell"><strong>{mat.nom}</strong></td>
                                              <td className="coeff-cell">{mat.coefficient}</td>
                                              <td className="notes-cell">
                                                {devoirs.length > 0 
                                                  ? devoirs.map(d => d.valeur).join(', ') 
                                                  : <span className="text-slate-400">--</span>}
                                              </td>
                                              <td className="notes-cell">
                                                {examen ? examen.valeur : <span className="text-slate-400">--</span>}
                                              </td>
                                              <td className={`average-cell ${mat.moyenne >= 10 ? 'pass' : 'fail'}`}>
                                                {mat.moyenne !== null ? `${mat.moyenne}/20` : <span className="text-slate-400">--</span>}
                                              </td>
                                              <td className="appreciation-cell" title={mat.appreciation}>
                                                {mat.appreciation || <span className="text-slate-400 italic">Aucune</span>}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>

                                    <div className="grades-summary-footer">
                                      <div className="summary-card">
                                        <span className="label">Moyenne Générale</span>
                                        <span className={`value ${periodData.moyenne_generale >= 10 ? 'pass' : 'fail'}`}>
                                          {periodData.moyenne_generale !== null ? `${periodData.moyenne_generale}/20` : '--'}
                                        </span>
                                      </div>
                                      <div className="summary-card">
                                        <span className="label">Total Coefficients</span>
                                        <span className="value coeff">{periodData.total_coefficients}</span>
                                      </div>
                                    </div>

                                    {/* Jury decision form - only visible for second semester or third trimester */}
                                    {/* Jury decision form */}
                                    <form onSubmit={handleSaveJuryDecision} className="grades-jury-form">
                                      <h4>Orientation & Observations du Jury</h4>
                                      
                                      {/* Only visible for second semester or third trimester */}
                                      {(gradesModalSemestre === 'Semestre 2' || gradesModalSemestre === 'Trimestre 3') && (
                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                          <div className="input-group" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
                                            <label>Décision du Conseil</label>
                                            <select 
                                              value={juryDecision === 'PASSAGE_DIRECT' ? 'PASSAGE' : juryDecision} 
                                              onChange={e => {
                                                const val = e.target.value;
                                                setJuryDecision(val);
                                                setJuryTargetClass('');
                                              }}
                                              className="jury-select"
                                            >
                                              <option value="PASSAGE">Passage</option>
                                              <option value="COURS_VACANCES">Cours de vacances</option>
                                              <option value="REDOUBLEMENT">Redoublement</option>
                                            </select>
                                          </div>

                                          {(() => {
                                            const currentClassObj = classes.find(c => c.id === selectedGradesData.student.classe_id);
                                            const currentLevel = currentClassObj ? currentClassObj.niveau : '';
                                            const currentSuffix = currentClassObj ? currentClassObj.nom.slice(-1) : '';
                                            
                                            let targetNiveau = currentLevel;
                                            if (juryDecision !== 'REDOUBLEMENT') {
                                              const niveaux = ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'];
                                              const idx = niveaux.indexOf(currentLevel);
                                              if (idx !== -1 && idx < niveaux.length - 1) {
                                                targetNiveau = niveaux[idx + 1];
                                              }
                                            }
                                            const targetClasses = classes.filter(c => c.niveau === targetNiveau);
                                            const validValue = targetClasses.some(tc => tc.nom === juryTargetClass)
                                              ? juryTargetClass
                                              : (targetClasses.find(tc => tc.nom.endsWith(currentSuffix))?.nom || targetClasses[0]?.nom || '');
                                            
                                            if (targetClasses.length > 0) {
                                              return (
                                                <div className="input-group" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
                                                  <label>Classe Suivante</label>
                                                  <select
                                                    value={validValue}
                                                    onChange={e => setJuryTargetClass(e.target.value)}
                                                    className="jury-select"
                                                    style={{ fontWeight: 700 }}
                                                  >
                                                    {targetClasses.map(tc => (
                                                      <option key={tc.id} value={tc.nom}>{tc.nom}</option>
                                                    ))}
                                                  </select>
                                                </div>
                                              );
                                            }
                                            return null;
                                          })()}
                                        </div>
                                      )}

                                      <div className="input-group mb-3">
                                         <label>Appréciations globales du Conseil</label>
                                         <div className="jury-checkboxes-grid">
                                           {[
                                             "Satisfaisant, doit continuer",
                                             "Peut mieux faire",
                                             "Insuffisant",
                                             "Risque de redoubler",
                                             "Risque l'exclusion",
                                             "Félicitations",
                                             "Encouragements",
                                             "Tableau d'honneur",
                                             "Avertissement",
                                             "Blâme"
                                           ].map(appr => (
                                             <label key={appr} className="jury-checkbox-label">
                                               <input 
                                                 type="checkbox"
                                                 checked={juryAppreciations.includes(appr)}
                                                 onChange={() => toggleAppreciation(appr)}
                                                 className="jury-checkbox"
                                               />
                                               <span>{appr}</span>
                                             </label>
                                           ))}
                                         </div>
                                       </div>

                                      <div className="input-group">
                                        <label>Observations et Décisions rédigées du jury</label>
                                        <textarea
                                          value={juryObservations}
                                          onChange={e => setJuryObservations(e.target.value)}
                                          placeholder="Ex: Excellent travail, félicitations du jury. / À encourager. / Doit redoubler d'efforts..."
                                          rows="2"
                                          className="jury-textarea"
                                        ></textarea>
                                      </div>
                                      <div className="jury-form-actions">
                                        <button 
                                          type="submit" 
                                          className="btn btn-primary btn-save-jury"
                                          disabled={savingJuryDecision}
                                        >
                                          {savingJuryDecision ? <Loader2 className="animate-spin" size={14} /> : 'Enregistrer'}
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="empty-grades-view">
                                <p>Aucune note enregistrée pour cette période.</p>
                              </div>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      <div className="empty-grades-view">
                        <AlertTriangle size={32} className="text-amber-500 mb-2" style={{ color: '#f59e0b' }} />
                        <p className="font-semibold text-slate-700">Aucune note enregistrée pour cet élève.</p>
                        <p className="text-xs text-slate-400 mt-1">Vous pouvez ajouter des notes dans l'onglet "Saisie des Notes".</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="text-red-500" size={40} />
                <p className="mt-4 text-slate-500 font-semibold">Impossible de récupérer les informations de l'élève.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showCoefModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{maxWidth: '500px'}}>
            <h3>Coefficients - {selectedClassCoef?.nom}</h3>
            <p className="text-muted" style={{marginBottom: '1.5rem'}}>Définissez les coefficients pour chaque matière enseignée dans cette classe.</p>
            <div className="coef-list" style={{maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem'}}>
              {matieres.map(m => {
                const isChecked = currentCoefs[m.id] !== undefined;
                return (
                  <div key={m.id} className="coef-item" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', borderBottom: '1px solid #F1F5F9'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <input 
                        type="checkbox" 
                        id={`coef-chk-${m.id}`}
                        checked={isChecked} 
                        onChange={(e) => {
                          const newCoefs = {...currentCoefs};
                          if (e.target.checked) newCoefs[m.id] = 1;
                          else delete newCoefs[m.id];
                          setCurrentCoefs(newCoefs);
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <label htmlFor={`coef-chk-${m.id}`} style={{ fontWeight: 600, color: isChecked ? 'var(--slate-800)' : '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>{m.nom}</label>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{fontSize: '0.75rem', color: isChecked ? 'var(--slate-500)' : '#cbd5e1', fontWeight: 600}}>Coef :</span>
                      <input 
                        type="number" 
                        min="1" 
                        max="20" 
                        value={isChecked ? currentCoefs[m.id] : 1} 
                        disabled={!isChecked}
                        onChange={(e) => setCurrentCoefs({...currentCoefs, [m.id]: parseInt(e.target.value) || 1})}
                        style={{
                          width: '70px', 
                          padding: '5px 10px', 
                          borderRadius: '6px', 
                          border: '1.5px solid var(--border-color)',
                          fontSize: '12px',
                          fontWeight: 700,
                          textAlign: 'center',
                          background: isChecked ? 'white' : '#f8fafc',
                          color: isChecked ? 'var(--slate-800)' : '#cbd5e1',
                          outline: 'none',
                          transition: 'all 0.15s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowCoefModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSaveCoefs} disabled={loading}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {(showMatiereModal || editingMatiere) && (
        <div className="modal-overlay">
            <div className="modal-card">
                <h3>{editingMatiere ? 'Modifier la Matière' : 'Nouvelle Matière'}</h3>
                <form onSubmit={handleAddMatiere}>
                    <div className="input-group">
                        <label>Nom de la matière</label>
                        <input type="text" required value={editingMatiere ? editingMatiere.nom : newMatiere.nom} onChange={e => editingMatiere ? setEditingMatiere({...editingMatiere, nom: e.target.value}) : setNewMatiere({...newMatiere, nom: e.target.value})} placeholder="ex: Physique-Chimie" />
                    </div>
                    <div className="input-group">
                        <label>Code (Optionnel)</label>
                        <input type="text" value={editingMatiere ? editingMatiere.code_matiere : newMatiere.code} onChange={e => editingMatiere ? setEditingMatiere({...editingMatiere, code_matiere: e.target.value}) : setNewMatiere({...newMatiere, code: e.target.value})} placeholder="ex: PC" />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={() => {setShowMatiereModal(false); setEditingMatiere(null);}}>Annuler</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Enregistrer'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {viewMotifModal && (
        <div className="modal-overlay" onClick={() => setViewMotifModal(null)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: viewMotifModal.titre.includes('Admin') ? '#dcfce7' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} style={{ color: viewMotifModal.titre.includes('Admin') ? '#15803d' : 'var(--primary-color)' }} />
                </div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--slate-800)' }}>{viewMotifModal.titre}</h3>
              </div>
              <button onClick={() => setViewMotifModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: '4px', borderRadius: '6px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Student info */}
            <div style={{ background: 'var(--bg-subtle, #f8fafc)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '4px' }}>Élève</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate-800)' }}>
                {viewMotifModal.entry.eleve_prenom} {viewMotifModal.entry.eleve_nom}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--slate-500)', marginTop: '2px' }}>
                {viewMotifModal.entry.classe_nom} · {new Date(viewMotifModal.entry.date_absence).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Full motif text */}
            <div style={{ background: 'white', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Motif complet</div>
              <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.7', color: 'var(--slate-700)', fontStyle: 'italic', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                "{viewMotifModal.texte}"
              </p>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setViewMotifModal(null)} className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 18px' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAbsenceForJustify && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <h3 style={{ marginBottom: '12px' }}>Justifier l'Absence / Retard</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', marginBottom: '16px', lineHeight: 1.4 }}>
              Vous justifiez l'incident de présence de <strong>{selectedAbsenceForJustify.eleve_prenom} {selectedAbsenceForJustify.eleve_nom}</strong> ({selectedAbsenceForJustify.classe_nom}) du {new Date(selectedAbsenceForJustify.date_absence).toLocaleDateString('fr-FR')}.
            </p>
            <form onSubmit={handleJustifyAbsence}>
              <div className="input-group">
                <label>Motif de la justification</label>
                <textarea 
                  required 
                  rows="3" 
                  placeholder="ex: Certificat médical fourni par le parent." 
                  value={absJustificationMotif} 
                  onChange={e => setAbsJustificationMotif(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setSelectedAbsenceForJustify(null); setAbsJustificationMotif(''); }}>Annuler</button>
                <button type="submit" className="btn btn-primary">Valider la justification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(showClassModal || editingClass) && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editingClass ? 'Modifier la Classe' : 'Nouvelle Classe'}</h3>
            <form onSubmit={handleAddClass}>
              <div className="input-group"><label>Nom de la classe</label><input type="text" required value={editingClass ? editingClass.nom : newClass.nom} onChange={e => editingClass ? setEditingClass({...editingClass, nom: e.target.value}) : setNewClass({...newClass, nom: e.target.value})} /></div>
              <div className="input-group"><label>Niveau</label><select value={editingClass ? editingClass.niveau : newClass.niveau} onChange={e => editingClass ? setEditingClass({...editingClass, niveau: e.target.value}) : setNewClass({...newClass, niveau: e.target.value})}><option value="6ème">6ème</option><option value="5ème">5ème</option><option value="4ème">4ème</option><option value="3ème">3ème</option><option value="Seconde">Seconde</option><option value="Première">Première</option><option value="Terminale">Terminale</option></select></div>
              <div className="input-group">
                <label>Année Scolaire</label>
                <select 
                  value={editingClass ? editingClass.annee_scolaire : newClass.annee_scolaire} 
                  onChange={e => editingClass ? setEditingClass({...editingClass, annee_scolaire: e.target.value}) : setNewClass({...newClass, annee_scolaire: e.target.value})}
                >
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>
              <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={() => {setShowClassModal(false); setEditingClass(null);}}>Annuler</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Enregistrer'}</button></div>
            </form>
          </div>
        </div>
      )}

      {(showProfModal || editingProf) && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: editingProf ? '650px' : '500px', width: '90%' }}>
            <h3>{editingProf ? 'Modifier Professeur' : 'Nouveau Professeur'}</h3>
            
            {!editingProf && (
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setProfModalTab('invite'); setSearchedProf(null); setSearchError(''); }}
                  style={{
                    flex: 1, padding: '10px', background: 'none', border: 'none',
                    borderBottom: profModalTab === 'invite' ? '3px solid var(--accent-color)' : 'none',
                    fontWeight: profModalTab === 'invite' ? '700' : '500',
                    color: profModalTab === 'invite' ? 'var(--primary-color)' : 'var(--slate-500)',
                    cursor: 'pointer'
                  }}
                >
                  Inviter par ID National
                </button>
                <button
                  type="button"
                  onClick={() => { setProfModalTab('create'); }}
                  style={{
                    flex: 1, padding: '10px', background: 'none', border: 'none',
                    borderBottom: profModalTab === 'create' ? '3px solid var(--accent-color)' : 'none',
                    fontWeight: profModalTab === 'create' ? '700' : '500',
                    color: profModalTab === 'create' ? 'var(--primary-color)' : 'var(--slate-500)',
                    cursor: 'pointer'
                  }}
                >
                  Créer un compte
                </button>
              </div>
            )}

            {profModalTab === 'invite' && !editingProf ? (
              <div>
                <form onSubmit={handleSearchProf} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Identifiant National Enseignant</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: ENS-2026-DKR-000101"
                      value={profSearchId}
                      onChange={e => setProfSearchId(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '13px' }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={searchLoading}
                    style={{ alignSelf: 'flex-end', height: '38px', background: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                  >
                    {searchLoading ? <Loader2 className="animate-spin" size={16} /> : 'Rechercher'}
                  </button>
                </form>

                {searchError && (
                  <div style={{ color: '#991b1b', background: '#fee2e2', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px', fontWeight: 600 }}>
                    ⚠️ {searchError}
                  </div>
                )}

                {searchedProf && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(19, 30, 108, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary-color)' }}>
                        {searchedProf.prenom ? `${searchedProf.prenom[0]}${searchedProf.nom[0]}`.toUpperCase() : 'EP'}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--primary-color)' }}>
                          {searchedProf.prenom} {searchedProf.nom}
                        </h4>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--slate-500)' }}>
                          ID : <code>{searchedProf.identifiant_national}</code>
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--slate-500)' }}>
                          Matière : <strong>{searchedProf.matiere_principale || 'Non spécifiée'}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="modal-actions" style={{ marginTop: '20px' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => { setShowProfModal(false); setProfSearchId(''); setSearchedProf(null); setSearchError(''); }}
                  >
                    Fermer
                  </button>
                  {searchedProf && (
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={handleInviteProf} 
                      disabled={loading}
                      style={{ background: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                    >
                      {loading ? <Loader2 className="animate-spin" size={16} /> : "Envoyer l'invitation"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <form onSubmit={handleAddProf} style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>Email</label>
                      <input 
                        type="email" 
                        required 
                        value={editingProf ? editingProf.email : newProf.email} 
                        onChange={e => editingProf ? setEditingProf({...editingProf, email: e.target.value}) : setNewProf({...newProf, email: e.target.value})} 
                      />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>{editingProf ? 'Nouveau Mot de passe (optionnel)' : 'Mot de passe'}</label>
                      <input 
                        type="password" 
                        required={!editingProf} 
                        value={editingProf ? (editingProf.password || '') : newProf.password} 
                        onChange={e => editingProf ? setEditingProf({...editingProf, password: e.target.value}) : setNewProf({...newProf, password: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>Civilité / Sexe</label>
                      <select
                        value={editingProf ? (editingProf.sexe || 'M') : (newProf.sexe || 'M')}
                        onChange={e => editingProf ? setEditingProf({...editingProf, sexe: e.target.value}) : setNewProf({...newProf, sexe: e.target.value})}
                        style={{ padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid var(--border)', background: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}
                      >
                        <option value="M">Masculin (Mr.)</option>
                        <option value="F">Féminin (Mme.)</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-actions" style={{ marginTop: '10px' }}>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={() => { setShowProfModal(false); setEditingProf(null); }}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" size={16} /> : 'Enregistrer'}
                    </button>
                  </div>
                </form>

                {editingProf && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--primary-color)' }}>Affectations (Classes & Matières)</h4>
                    
                    <form onSubmit={handleAddAssignment} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-end' }}>
                      <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Classe</label>
                        <select required value={assignClasseId} onChange={e => setAssignClasseId(e.target.value)} style={{ padding: '8px', fontSize: '13px' }}>
                          <option value="">Sélectionner</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.nom} ({c.annee_scolaire})</option>)}
                        </select>
                      </div>
                      <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Matière</label>
                        <select required value={assignMatiereId} onChange={e => setAssignMatiereId(e.target.value)} style={{ padding: '8px', fontSize: '13px' }}>
                          <option value="">Sélectionner</option>
                          {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '36px', background: 'var(--accent-color)', borderColor: 'var(--accent-color)', fontSize: '12px' }}>
                        Affecter
                      </button>
                    </form>

                    <div style={{ maxHeight: '150px', overflowY: 'auto', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                      {profAssignments.map(asg => (
                        <div key={asg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
                          <span>Classe : <strong>{asg.classe_nom} {asg.annee_scolaire ? `(${asg.annee_scolaire})` : ''}</strong> | Matière : <strong>{asg.matiere_nom}</strong></span>
                          <button type="button" onClick={() => handleDeleteAssignment(asg.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>Retirer</button>
                        </div>
                      ))}
                      {profAssignments.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '10px', fontSize: '11px' }}>Aucune affectation de classe/matière en cours.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showMessageModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Nouveau Message / Diffusion</h3>
            <form onSubmit={handleSendMessage}>
              <div className="input-group">
                <label>Destinataire Type</label>
                <select 
                  value={newMessage.destinataire_type} 
                  onChange={e => setNewMessage({ ...newMessage, destinataire_type: e.target.value, destinataire_id: '' })}
                >
                  <option value="CLASSE">Une Classe (Diffusion)</option>
                  <option value="ELEVE">Un Élève</option>
                  <option value="PROFESSEUR">Un Enseignant</option>
                  <option value="OFFICE_BAC">Office du Bac</option>
                </select>
              </div>

              {newMessage.destinataire_type === 'CLASSE' && (
                <div className="input-group">
                  <label>Classe</label>
                  <select 
                    required 
                    value={newMessage.destinataire_id} 
                    onChange={e => setNewMessage({ ...newMessage, destinataire_id: e.target.value })}
                  >
                    <option value="">Sélectionner la classe</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom} ({c.annee_scolaire})</option>)}
                  </select>
                </div>
              )}

              {newMessage.destinataire_type === 'ELEVE' && (
                <>
                  <div className="input-group" style={{ marginBottom: '10px' }}>
                    <label>Rechercher un élève</label>
                    <input 
                      type="text"
                      placeholder="Tapez le nom, prénom ou identifiant..."
                      value={studentSearchQuery}
                      onChange={e => setStudentSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border)',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div className="input-group">
                    <label>Élève destinataire</label>
                    {(() => {
                      const filtered = eleves.filter(el => {
                        const q = studentSearchQuery.toLowerCase().trim();
                        if (!q) return true;
                        const fullName = `${el.prenom} ${el.nom}`.toLowerCase();
                        const nationalId = (el.identifiant_national || '').toLowerCase();
                        const classeName = (el.classe_nom || '').toLowerCase();
                        return fullName.includes(q) || nationalId.includes(q) || classeName.includes(q);
                      });
                      return (
                        <select 
                          required 
                          value={newMessage.destinataire_id} 
                          onChange={e => setNewMessage({ ...newMessage, destinataire_id: e.target.value })}
                        >
                          <option value="">
                            {filtered.length === 0 ? "Aucun élève trouvé" : `Sélectionner l'élève (${filtered.length})`}
                          </option>
                          {filtered.map(el => (
                            <option key={el.id} value={el.user_id}>
                              {el.prenom} {el.nom} ({el.identifiant_national || 'Sans ID'}) - {el.classe_nom || 'Sans classe'}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                </>
              )}

              {newMessage.destinataire_type === 'PROFESSEUR' && (
                <div className="input-group">
                  <label>Enseignant destinataire</label>
                  <select 
                    required 
                    value={newMessage.destinataire_id} 
                    onChange={e => setNewMessage({ ...newMessage, destinataire_id: e.target.value })}
                  >
                    <option value="">Sélectionner l'enseignant</option>
                    {profs.filter(p => p.statut === 'ACCEPTE').map(p => (
                      <option key={p.id} value={p.id}>
                        {p.prenom && p.nom ? `${p.prenom} ${p.nom}` : p.email} ({p.matiere_principale || 'Matière non spécifiée'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="input-group">
                <label>Sujet</label>
                <input 
                  type="text" 
                  required 
                  value={newMessage.sujet} 
                  onChange={e => setNewMessage({ ...newMessage, sujet: e.target.value })} 
                />
              </div>

              <div className="input-group">
                <label>Contenu</label>
                <textarea 
                  required 
                  rows="4" 
                  style={{ width: '100%', borderRadius: '10px', padding: '0.8rem', border: '2px solid #E2E8F0' }} 
                  value={newMessage.contenu} 
                  onChange={e => setNewMessage({ ...newMessage, contenu: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowMessageModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showPartageModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{maxWidth: '500px'}}>
            <h3>Partager un Document</h3>
            <form onSubmit={handleSendPartage}>
              <div className="input-group">
                <label>Établissement destinataire</label>
                <input type="text" placeholder="Rechercher un établissement..." value={partageSearch}
                  onChange={e => { setPartageSearch(e.target.value); setSelectedPartageEtab(null); fetchPartageEtab(e.target.value); }} />
                {partageResults.length > 0 && (
                  <div className="autocomplete-list">
                    {partageResults.map(etab => (
                      <div key={etab.id} className={`autocomplete-item ${selectedPartageEtab?.id === etab.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedPartageEtab(etab); setPartageSearch(`${etab.nom} - ${etab.ville}`); setPartageResults([]); }}>
                        {etab.nom} <small>({etab.ville})</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="input-group">
                <label>Élève (optionnel)</label>
                <select value={partageEleveId} onChange={e => setPartageEleveId(e.target.value)}>
                  <option value="">Aucun élève spécifique</option>
                  {eleves.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Fichier</label>
                <input type="file" required onChange={e => setPartageFile(e.target.files[0])} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea rows="3" style={{width: '100%', borderRadius: '10px', padding: '0.8rem', border: '2px solid #E2E8F0'}}
                  value={partageDescription} onChange={e => setPartageDescription(e.target.value)} placeholder="Description optionnelle..."></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowPartageModal(false); setPartageResults([]); }}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading || !selectedPartageEtab || !partageFile}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Partager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAuditConfirmModal && auditConfirmAction && (
        <div className="modal-overlay" onClick={() => setShowAuditConfirmModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: auditConfirmAction.type === 'confirm' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                color: auditConfirmAction.type === 'confirm' ? '#059669' : '#dc2626'
              }}>
                {auditConfirmAction.type === 'confirm' ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--slate-800)' }}>
                {auditConfirmAction.type === 'confirm' ? 'Confirmer la modification' : 'Rejeter la modification'}
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--slate-600)', lineHeight: '1.5', marginBottom: '20px' }}>
              {auditConfirmAction.type === 'confirm'
                ? 'Êtes-vous sûr de vouloir valider et appliquer cette modification de note dans les bulletins scolaires ?'
                : 'Êtes-vous sûr de vouloir rejeter cette proposition de modification de note ? L\'ancienne note sera conservée.'}
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Élève :</span>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>{auditConfirmAction.entry.eleve_prenom} {auditConfirmAction.entry.eleve_nom}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Classe & Matière :</span>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>{auditConfirmAction.entry.classe_nom} • {auditConfirmAction.entry.matiere_nom}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Type & Période :</span>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>{auditConfirmAction.entry.type_note} ({auditConfirmAction.entry.trimestre ? `Trimestre ${auditConfirmAction.entry.trimestre}` : `Semestre ${auditConfirmAction.entry.semestre}`})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Valeur de la note :</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ textDecoration: 'line-through', color: '#dc2626', fontWeight: 700, fontSize: '14px' }}>
                    {parseFloat(auditConfirmAction.entry.ancienne_valeur).toFixed(2)}/20
                  </span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>➔</span>
                  <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '15px' }}>
                    {parseFloat(auditConfirmAction.entry.nouvelle_valeur).toFixed(2)}/20
                  </span>
                </div>
              </div>
              {auditConfirmAction.entry.motif && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontStyle: 'italic' }}>
                  Motif : "{auditConfirmAction.entry.motif}"
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 0 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowAuditConfirmModal(false)}
                style={{ padding: '10px 18px', fontSize: '13px', fontWeight: 600, margin: 0 }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn"
                onClick={executeAuditAction}
                style={{
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  margin: 0,
                  background: auditConfirmAction.type === 'confirm' ? '#059669' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {auditConfirmAction.type === 'confirm' ? 'Valider et appliquer' : 'Rejeter la modification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeMotifText && (
        <div className="modal-overlay" onClick={() => setActiveMotifText('')}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: 'var(--slate-800)' }}>Motif de la modification</h3>
            <div style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              padding: '16px', 
              fontSize: '13px', 
              color: 'var(--slate-700)', 
              fontStyle: 'italic', 
              lineHeight: '1.6', 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word' 
            }}>
              "{activeMotifText}"
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={() => setActiveMotifText('')} 
                style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600 }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showReglesModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{maxWidth: '450px'}}>
            <h3>Règles de Passage</h3>
            <p style={{fontSize: 13, color: 'var(--gray-500)', marginBottom: 16}}>
              Définissez les seuils pour chaque décision. Les moyennes sont sur 20.
            </p>
            <form onSubmit={handleSaveRegles}>
              <div className="input-group">
                <label>Passage (moyenne ≥)</label>
                <input type="number" min="0" max="20" step="0.5" required
                  value={reglesPassage.seuil_passage}
                  onChange={e => setReglesPassage({...reglesPassage, seuil_passage: parseFloat(e.target.value) || 0, seuil_passage_direct: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="input-group">
                <label>Cours de vacances (moyenne ≥)</label>
                <input type="number" min="0" max="20" step="0.5" required
                  value={reglesPassage.seuil_cours_vacances}
                  onChange={e => setReglesPassage({...reglesPassage, seuil_cours_vacances: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowReglesModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{maxWidth: '500px'}}>
            <h3>Ajouter un créneau</h3>
            <form onSubmit={handleAddSchedule}>
              <div className="input-group">
                <label>Matière</label>
                <select required value={newSchedule.matiere_id} onChange={e => setNewSchedule({...newSchedule, matiere_id: e.target.value})}>
                  <option value="">Sélectionner</option>
                  {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Professeur</label>
                <select required value={newSchedule.professeur_id} onChange={e => setNewSchedule({...newSchedule, professeur_id: e.target.value})}>
                  <option value="">Sélectionner</option>
                  {profs.map(p => <option key={p.id} value={p.id}>{p.email}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Jour</label>
                <select required value={newSchedule.jour_semaine} onChange={e => setNewSchedule({...newSchedule, jour_semaine: e.target.value})}>
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Début</label>
                  <input type="time" required value={newSchedule.heure_debut} onChange={e => setNewSchedule({...newSchedule, heure_debut: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Fin</label>
                  <input type="time" required value={newSchedule.heure_fin} onChange={e => setNewSchedule({...newSchedule, heure_fin: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Salle (optionnel)</label>
                <input type="text" value={newSchedule.salle} onChange={e => setNewSchedule({...newSchedule, salle: e.target.value})} placeholder="ex: Salle 12" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowScheduleModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExamModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{maxWidth: '500px'}}>
            <h3>{editingExam ? 'Modifier l\'examen' : 'Planifier un examen'}</h3>
            <form onSubmit={handleAddExam}>
              <div className="input-group">
                <label>Matière</label>
                <select required value={newExam.matiere_id} onChange={e => setNewExam({...newExam, matiere_id: e.target.value})}>
                  <option value="">Sélectionner</option>
                  {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Type</label>
                <select required value={newExam.type_examen} onChange={e => setNewExam({...newExam, type_examen: e.target.value})}>
                  <option value="DEVOIR">Devoir</option>
                  <option value="COMPOSITION">Composition</option>
                  <option value="EXAMEN">Examen</option>
                </select>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Date</label>
                  <input type="date" required value={newExam.date_examen} onChange={e => setNewExam({...newExam, date_examen: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Heure (optionnel)</label>
                  <input type="time" value={newExam.heure_examen} onChange={e => setNewExam({...newExam, heure_examen: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Salle (optionnel)</label>
                <input type="text" value={newExam.salle} onChange={e => setNewExam({...newExam, salle: e.target.value})} placeholder="ex: Salle 5" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowExamModal(false); setEditingExam(null); setNewExam({ matiere_id: '', type_examen: 'DEVOIR', date_examen: '', heure_examen: '', salle: '' }); }}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : editingExam ? 'Modifier' : 'Planifier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showSuccessModal && successData && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in" style={{textAlign: 'center', maxWidth: '400px'}}>
            <div className="success-icon-large"><GraduationCap size={48} color="white" /></div>
            <h2 style={{margin: '1.5rem 0 0.5rem'}}>Inscription Réussie !</h2>
            <p className="text-muted" style={{marginBottom: '2rem'}}>Veuillez noter ou imprimer les identifiants provisoires de l'élève.</p>
            <div className="credential-box"><label>Identifiant National</label><div className="credential-row"><code>{successData.identifiant}</code><button className={`btn-icon-small ${copiedId ? 'status-pass' : ''}`} onClick={() => handleCopy(successData.identifiant, 'id')} title="Copier">{copiedId ? <Check size={16} /> : <Copy size={16} />}</button></div></div>
            <div className="credential-box"><label>Mot de passe provisoire</label><div className="credential-row"><code>{successData.password}</code><button className={`btn-icon-small ${copiedPass ? 'status-pass' : ''}`} onClick={() => handleCopy(successData.password, 'pass')} title="Copier">{copiedPass ? <Check size={16} /> : <Copy size={16} />}</button></div></div>
            <div className="modal-actions" style={{justifyContent: 'center', marginTop: '2.5rem'}}><button className="btn btn-primary" onClick={() => setShowSuccessModal(false)} style={{width: '100%'}}>Terminer</button></div>
          </div>
        </div>
      )}

      {/* Exam Detail Modal */}
      {selectedExam && (
        <div className="modal-overlay" onClick={() => setSelectedExam(null)}>
          <div className="modal-card" style={{maxWidth: '500px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails des épreuves</h3>
              <button className="btn-icon-small" onClick={() => setSelectedExam(null)}><Trash2 size={16} /></button>
            </div>
            <div className="exam-detail-body">
              <div className="exam-detail-meta">
                <span><strong>Classe :</strong> {selectedExam.classe} </span>
                <span><strong>Date :</strong> {selectedExam.date}</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Type</th>
                    <th>Horaire</th>
                    <th>Salle</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExam.exams.map(ex => {
                    const hasTime = ex.date_examen && ex.date_examen.includes('T');
                    const timeStr = hasTime ? new Date(ex.date_examen).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--';
                    return (
                      <tr key={ex.id}>
                        <td className="font-bold">{ex.matiere_nom}</td>
                        <td>
                          <span className={`status-pill ${ex.type_examen === 'EXAMEN' ? 'status-fail' : ex.type_examen === 'COMPOSITION' ? 'status-warning' : 'status-pass'}`}>
                            {ex.type_examen}
                          </span>
                        </td>
                        <td>{timeStr}</td>
                        <td>{ex.salle || '--'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setSelectedExam(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT PRE-INSCRIPTION */}
      {showPreModal && editingPreInscription && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Modifier la demande d'inscription</h2>
            <form onSubmit={handleUpdatePreInscription}>
              <div className="form-row">
                <div className="input-group">
                  <label>Prénom</label>
                  <input 
                    type="text" 
                    value={editingPreInscription.prenom} 
                    onChange={e => setEditingPreInscription({...editingPreInscription, prenom: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Nom</label>
                  <input 
                    type="text" 
                    value={editingPreInscription.nom} 
                    onChange={e => setEditingPreInscription({...editingPreInscription, nom: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Date de naissance</label>
                  <input 
                    type="date" 
                    value={editingPreInscription.date_naissance ? editingPreInscription.date_naissance.split('T')[0] : ''} 
                    onChange={e => setEditingPreInscription({...editingPreInscription, date_naissance: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Lieu de naissance</label>
                  <input 
                    type="text" 
                    value={editingPreInscription.lieu_naissance || ''} 
                    onChange={e => setEditingPreInscription({...editingPreInscription, lieu_naissance: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Civilité / Sexe</label>
                  <select 
                    value={editingPreInscription.sexe || 'M'} 
                    onChange={e => setEditingPreInscription({...editingPreInscription, sexe: e.target.value})}
                  >
                    <option value="M">Masculin (M.)</option>
                    <option value="F">Féminin (Mme / Mlle)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Nationalité</label>
                  <input 
                    type="text" 
                    value={editingPreInscription.nationalite || ''} 
                    onChange={e => setEditingPreInscription({...editingPreInscription, nationalite: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Téléphone</label>
                  <input 
                    type="text" 
                    value={editingPreInscription.telephone || ''} 
                    onChange={e => setEditingPreInscription({...editingPreInscription, telephone: e.target.value})} 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Aptitude Physique</label>
                <select 
                  value={editingPreInscription.statut || 'APTE'} 
                  onChange={e => setEditingPreInscription({...editingPreInscription, statut: e.target.value})}
                >
                  <option value="APTE">Apte</option>
                  <option value="INAPTE">Inapte</option>
                </select>
              </div>

              {editingPreInscription.identifiant_existant && (
                <div className="input-group">
                  <label>Identifiant National Existant (Transfert)</label>
                  <input 
                    type="text" 
                    value={editingPreInscription.identifiant_existant} 
                    onChange={e => setEditingPreInscription({...editingPreInscription, identifiant_existant: e.target.value})} 
                    required 
                  />
                </div>
              )}

              <div className="input-group">
                <label>Coordonnées du Parent</label>
                <textarea 
                  rows="3" 
                  value={editingPreInscription.coordonnees_parent || ''} 
                  onChange={e => setEditingPreInscription({...editingPreInscription, coordonnees_parent: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-actions" style={{marginTop: 20}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPreModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer les modifications</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REFUS ATTESTATION */}
      {refusingAttestation && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 450 }}>
            <h3>Refuser la Demande d'Attestation</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '12px', marginBottom: '15px' }}>
              Veuillez indiquer le motif du refus pour l'élève <strong>{refusingAttestation.eleve_prenom} {refusingAttestation.eleve_nom}</strong>.
            </p>
            <form onSubmit={handleRefuseAttestation}>
              <div className="input-group">
                <label>Motif du Refus</label>
                <textarea 
                  rows="4" 
                  value={motifRefusAttestation} 
                  onChange={e => setMotifRefusAttestation(e.target.value)} 
                  required 
                  placeholder="Ex: Dossier incomplet, non inscrit pour cette année scolaire..."
                  style={{ width: '100%', borderRadius: '8px', border: '1.5px solid var(--border-color)', padding: '10px', fontSize: '12px', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setRefusingAttestation(null);
                  setMotifRefusAttestation('');
                }}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#ef4444' }}>Confirmer le Refus</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREDENTIALS GENERATED */}
      {showCredsModal && generatedCreds && (
        <div className="modal-overlay">
          <div className="modal-card text-center" style={{maxWidth: 400}}>
            <div style={{color: '#16a34a', marginBottom: 16}}>
              <CheckCircle2 size={56} style={{margin: '0 auto'}} />
            </div>
            <h2>Inscription Validée !</h2>
            <p style={{color: 'var(--gray-500)', fontSize: 13, marginBottom: 20}}>
              Le compte élève a été configuré avec succès. Voici les accès de connexion :
            </p>

            <div style={{background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 16, textAlign: 'left', marginBottom: 20}}>
              <div style={{marginBottom: 10}}>
                <span style={{fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase'}}>Identifiant National (Login)</span>
                <div style={{fontSize: 15, fontWeight: 700, color: 'var(--gray-800)', marginTop: 2, fontFamily: 'monospace'}}>{generatedCreds.identifiant}</div>
              </div>
              <div>
                <span style={{fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase'}}>Mot de passe de l'élève</span>
                <div style={{fontSize: 15, fontWeight: 700, color: '#15803d', marginTop: 2, fontFamily: 'monospace'}}>{generatedCreds.password}</div>
              </div>
            </div>

            <p style={{fontSize: 11, color: 'var(--gray-400)', marginBottom: 20}}>
              Veuillez copier ces accès et les transmettre à l'élève ou à ses parents.
            </p>

            <div className="flex gap-2 justify-center">
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  navigator.clipboard.writeText(`Identifiant: ${generatedCreds.identifiant}\nMot de passe: ${generatedCreds.password}`);
                  showNotification('Identifiants copiés dans le presse-papier !');
                }}
              >
                Copier les accès
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCredsModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}


      {/* SIGNATURE SCANNER MODAL */}
      {showSignatureScanner && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-card" style={{ maxWidth: '600px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--slate-100)', paddingBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                {scannerTarget === 'signature' ? 'Numérisation (Scan) de Signature' : 'Numérisation (Scan) du Cachet'}
              </h2>
              <button type="button" onClick={() => setShowSignatureScanner(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--slate-500)', fontSize: '11px', marginBottom: '16px', lineHeight: '1.4' }}>
              {scannerTarget === 'signature' 
                ? "Importez une photo claire de votre signature manuscrite sur fond blanc, puis ajustez le seuil pour isoler l'encre et rendre le fond transparent."
                : "Importez une photo ou image claire de votre cachet d'établissement sur fond blanc. Ajustez le seuil pour éliminer le fond papier tout en conservant la couleur d'origine (comme le rouge ou le bleu)."}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!scannerImage ? (
                <div 
                  onClick={() => scannerFileInputRef.current.click()}
                  style={{ height: '200px', border: '2px dashed var(--slate-300)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#f8fafc', cursor: 'pointer' }}
                >
                  <FileUp size={32} style={{ color: 'var(--primary-color)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate-700)' }}>
                    {scannerTarget === 'signature' ? "Choisir l'image de la signature" : "Choisir l'image du cachet"}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--slate-400)' }}>Formats acceptés: PNG, JPG, JPEG</span>
                  <input 
                    type="file" 
                    ref={scannerFileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => setScannerImage(img);
                          img.src = event.target.result;
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ position: 'relative', border: '1px solid var(--slate-200)', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                    <canvas ref={scannerCanvasRef} style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' }} />
                    <button 
                      type="button" 
                      onClick={() => setScannerImage(null)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-700)', textTransform: 'uppercase' }}>Seuil de tolérance du fond</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)', background: 'white', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--slate-200)' }}>{scannerThreshold}</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="250" 
                        value={scannerThreshold} 
                        onChange={e => setScannerThreshold(parseInt(e.target.value))} 
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '10px', color: 'var(--slate-400)' }}>Ajustez pour effacer les ombres ou impuretés du papier blanc.</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--slate-200)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-700)', textTransform: 'uppercase' }}>
                        {scannerTarget === 'signature' ? 'Tracé noir pur (Monochrome)' : 'Forcer le noir pur (Monochrome optionnel)'}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={scannerGrayscale} 
                        onChange={e => setScannerGrayscale(e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--slate-100)', paddingTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowSignatureScanner(false)}>Annuler</button>
              <button 
                type="button" 
                className="btn btn-primary" 
                disabled={!scannerImage}
                onClick={() => {
                  const canvas = scannerCanvasRef.current;
                  if (canvas) {
                    canvas.toBlob(blob => {
                      if (blob) {
                        const filename = scannerTarget === 'signature' ? 'scanned_signature.png' : 'scanned_cachet.png';
                        const file = new File([blob], filename, { type: 'image/png' });
                        if (scannerTarget === 'signature') {
                          setSignatureFile(file);
                          setSignaturePreview(URL.createObjectURL(file));
                        } else {
                          setCachetFile(file);
                          setCachetPreview(URL.createObjectURL(file));
                        }
                        setShowSignatureScanner(false);
                      }
                    }, 'image/png');
                  }
                }}
              >
                {scannerTarget === 'signature' ? 'Utiliser la signature' : 'Utiliser le cachet'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL PRÉVISUALISATION DOCUMENT (BULLETIN / DOSSIER) */}
      {docPreviewModal.isOpen && docPreviewModal.eleve && (
        <div className="modal-overlay" style={{ zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div 
            className="modal-card" 
            style={{ 
              maxWidth: '1000px', 
              width: '95vw', 
              height: '92vh', 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '0', 
              overflow: 'hidden',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
            }}
          >
            {/* Modal Header Bar */}
            <div 
              style={{ 
                padding: '14px 20px', 
                background: '#1e293b', 
                color: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justify: 'space-between', 
                flexWrap: 'wrap', 
                gap: '12px',
                borderBottom: '1px solid #334155'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                  {docPreviewModal.type === 'bulletin' ? <Printer size={20} style={{ color: '#38bdf8' }} /> : <FileDown size={20} style={{ color: '#a855f7' }} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                    {docPreviewModal.type === 'bulletin' ? 'Bulletin Scolaire' : 'Dossier de Transfert'}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                    Élève : <strong style={{ color: '#f8fafc' }}>{docPreviewModal.eleve.prenom} {docPreviewModal.eleve.nom}</strong> ({docPreviewModal.eleve.classe_nom || 'Sans classe'})
                  </span>
                </div>
              </div>

              {/* Controls & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Semestre Toggle if Bulletin */}
                {docPreviewModal.type === 'bulletin' && (
                  <div style={{ display: 'flex', background: '#0f172a', borderRadius: '8px', padding: '3px', border: '1px solid #334155', marginRight: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setDocPreviewModal(prev => ({ ...prev, semestre: 1 }))}
                      style={{
                        padding: '5px 14px',
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        background: docPreviewModal.semestre === 1 ? 'var(--primary-color)' : 'transparent',
                        color: docPreviewModal.semestre === 1 ? '#ffffff' : '#94a3b8',
                        transition: 'all 0.2s'
                      }}
                    >
                      Semestre 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocPreviewModal(prev => ({ ...prev, semestre: 2 }))}
                      style={{
                        padding: '5px 14px',
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        background: docPreviewModal.semestre === 2 ? 'var(--primary-color)' : 'transparent',
                        color: docPreviewModal.semestre === 2 ? '#ffffff' : '#94a3b8',
                        transition: 'all 0.2s'
                      }}
                    >
                      Semestre 2
                    </button>
                  </div>
                )}

                {/* Print Button */}
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="btn"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '7px 14px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={15} /> Imprimer
                </button>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadDocument}
                  className="btn"
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '7px 14px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <FileDown size={15} /> Télécharger
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setDocPreviewModal({ isOpen: false, eleve: null, type: 'bulletin', semestre: 1 })}
                  style={{
                    background: 'transparent',
                    color: '#94a3b8',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    marginLeft: '4px'
                  }}
                  title="Fermer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body / iFrame viewer */}
            <div style={{ flex: 1, background: '#525659', position: 'relative' }}>
              <iframe
                ref={docIframeRef}
                src={
                  docPreviewModal.type === 'bulletin'
                    ? `http://localhost:5002/api/documents/bulletin/${docPreviewModal.eleve.id}?token=${localStorage.getItem('token')}&semestre=${docPreviewModal.semestre}`
                    : `http://localhost:5002/api/documents/dossier-transfert/${docPreviewModal.eleve.id}?token=${localStorage.getItem('token')}`
                }
                title="Prévisualisation du document"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
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
