import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { offlineFetch } from '../services/api';
import { 
  LayoutDashboard, Calendar, Users, FileText, CheckCircle2, Clock, 
  Settings, LogOut, Menu, X, Bell, Sparkles, Plus, Edit, Trash2, 
  Loader2, Building, Check, Send, Search, ShieldCheck, BookOpen, BookOpenCheck,
  Info, AlertTriangle, User, RefreshCw, XCircle, ArrowRight, ClipboardList,
  Mail, MessageSquare, ChevronLeft, Paperclip, Download, BookMarked, Scale, GraduationCap, Award
} from 'lucide-react';
import TeacherDisciplineView from '../components/professeur/TeacherDisciplineView';
import TeacherOverviewTab from '../components/professeur/TeacherOverviewTab';
import TeacherPartnerSchoolsTab from '../components/professeur/TeacherPartnerSchoolsTab';
import TeacherAttachedClassesTab from '../components/professeur/TeacherAttachedClassesTab';
import TeacherInvitationsTab from '../components/professeur/TeacherInvitationsTab';
import TeacherScheduleTab from '../components/professeur/TeacherScheduleTab';
import TeacherGradesTab from '../components/professeur/TeacherGradesTab';
import TeacherAttendanceTab from '../components/professeur/TeacherAttendanceTab';
import TeacherPedagogyTab from '../components/professeur/TeacherPedagogyTab';
import TeacherPlanningTab from '../components/professeur/TeacherPlanningTab';
import TeacherProfileTab from '../components/professeur/TeacherProfileTab';
import TeacherMessagesTab from '../components/professeur/TeacherMessagesTab';
import TeacherCahierTexteTab from '../components/professeur/TeacherCahierTexteTab';
import ProfDashboardEmargement from './ProfDashboardEmargement';
import TeacherSidebar from '../components/professeur/TeacherSidebar';
import TeacherTopbar from '../components/professeur/TeacherTopbar';
import './TeacherDashboard.css';


const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || 'overview';

  // State variables
  const [profile, setProfile] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [affiliations, setAffiliations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [summary, setSummary] = useState({ schoolsCount: 0, classesCount: 0, studentsCount: 0 });
  const [dashboardDetails, setDashboardDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() =>
    localStorage.getItem('teacher_sidebar_collapsed') === 'true'
  );
  const toggleSidebar = () => setIsSidebarCollapsed(prev => {
    const next = !prev;
    localStorage.setItem('teacher_sidebar_collapsed', String(next));
    return next;
  });
  const [toast, setToast] = useState({ message: '', type: null });
  const [searchTermSchools, setSearchTermSchools] = useState('');
  const [searchTermClasses, setSearchTermClasses] = useState('');

  // Messaging / Chat states
  const [chatChannels, setChatChannels] = useState({ etablissements: [], classes: [] });
  const [activeChatContact, setActiveChatContact] = useState(null); // { id, name, type }
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null); // { url, name }
  const [uploadingFile, setUploadingFile] = useState(false);
  const chatEndRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('fichier', file);

    try {
      const res = await fetch('/api/messages/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setAttachedFile({ url: data.fichier_url, name: data.fichier_nom });
      } else {
        const errData = await res.json();
        showNotification(errData.message || "Erreur lors du téléchargement du fichier.", 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de l'envoi du fichier.", 'error');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Profile Edit State
  const [editProfileData, setEditProfileData] = useState({
    nom: '', prenom: '', telephone: '', matiere_principale: '', photo_url: ''
  });

  // Grades Tab State
  const [selectedEtab, setSelectedEtab] = useState('');
  const [selectedEtabId, setSelectedEtabId] = useState(''); // UUID of selected etablissement
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('Semestre 1');
  const [selectedTypeNote, setSelectedTypeNote] = useState('DEVOIR');
  const [gradesData, setGradesData] = useState({ students: [], grades: [] });
  const [draftGrades, setDraftGrades] = useState({}); // eleve_id -> { note: '', appreciation: '' }
  const [originalGrades, setOriginalGrades] = useState({}); // noteId -> note
  const [auditMotif, setAuditMotif] = useState('');
  const [modifyingGradeId, setModifyingGradeId] = useState(null);
  const [modifyingGradeValue, setModifyingGradeValue] = useState('');
  const [modifyingGradeAppreciation, setModifyingGradeAppreciation] = useState('');
  const [baremes, setBaremes] = useState([]); // appreciation scales from school
  
  // Audit modifications states
  const [gradesSubTab, setGradesSubTab] = useState('saisie'); // 'saisie' | 'suivi'
  const [auditLog, setAuditLog] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [activeMotifText, setActiveMotifText] = useState('');

  // Academic Years dynamically extracted from classes & schedule (no hardcoding)
  const availableAcademicYears = React.useMemo(() => {
    const yearsSet = new Set();
    classes.forEach(c => { if (c.annee_scolaire) yearsSet.add(c.annee_scolaire); });
    schedule.forEach(s => { if (s.annee_scolaire) yearsSet.add(s.annee_scolaire); });
    if (dashboardDetails?.classes) {
      dashboardDetails.classes.forEach(c => { if (c.annee_scolaire) yearsSet.add(c.annee_scolaire); });
    }
    const arr = Array.from(yearsSet).sort().reverse();
    return arr.length > 0 ? arr : ['2025-2026', '2026-2027'];
  }, [classes, schedule, dashboardDetails]);

  const [profAnneeFilter, setProfAnneeFilter] = useState('');

  // Automatically default to the latest academic year with data when loaded
  useEffect(() => {
    if (availableAcademicYears.length > 0 && (!profAnneeFilter || !availableAcademicYears.includes(profAnneeFilter))) {
      setProfAnneeFilter(availableAcademicYears[0]);
    }
  }, [availableAcademicYears, profAnneeFilter]);

  const activeClasses = classes.filter(c => c.annee_scolaire === profAnneeFilter || !c.annee_scolaire);
  const activeSchedule = schedule.filter(s => s.annee_scolaire === profAnneeFilter || !s.annee_scolaire);

  // Attendance Tab State — SEPARATE from grades to avoid cross-tab conflicts
  const [attClasse, setAttClasse] = useState('');
  const [attMatiere, setAttMatiere] = useState('');
  const [attCreneau, setAttCreneau] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRoster, setAttendanceRoster] = useState({}); // eleve_id -> { type_presence: 'PRESENT', duree_retard: '', motif: '' }
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attLoading, setAttLoading] = useState(false);

  const getFrenchDayName = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[d.getDay()];
  };

  const getAvailableSlotOptions = () => {
    if (!attClasse || !attMatiere) return [];
    const dayName = getFrenchDayName(attendanceDate);
    let matchingSlots = schedule.filter(s => 
      s.classe_id === attClasse && 
      s.matiere_id === attMatiere && 
      s.jour_semaine === dayName
    );
    if (matchingSlots.length === 0) {
      matchingSlots = schedule.filter(s => 
        s.classe_id === attClasse && 
        s.matiere_id === attMatiere
      );
    }
    return matchingSlots.map(s => {
      const start = s.heure_debut?.slice(0, 5) || '';
      const end = s.heure_fin?.slice(0, 5) || '';
      const label = `${start} - ${end} (${s.jour_semaine}${s.salle ? ' - Salle ' + s.salle : ''})`;
      return { key: `${start} - ${end}`, label, raw: s };
    });
  };

  // Pedagogy Tab State
  const [pedClass, setPedClass] = useState('');
  const [pedMatiere, setPedMatiere] = useState('');
  const [pedData, setPedData] = useState(null);
  const [pedLoading, setPedLoading] = useState(false);
  const [pedSubTab, setPedSubTab] = useState('stats'); // 'stats' | 'ia'

  // Planning Tab State
  const [planning, setPlanning] = useState([]);
  const [planningLoading, setPlanningLoading] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [propEtab, setPropEtab] = useState('');
  const [propClasse, setPropClasse] = useState('');
  const [propMatiere, setPropMatiere] = useState('');
  const [propType, setPropType] = useState('DEVOIR');
  const [propDate, setPropDate] = useState('');
  const [propSalle, setPropSalle] = useState('');
  const [planningFilterEtab, setPlanningFilterEtab] = useState('');
  const [planningFilterClasse, setPlanningFilterClasse] = useState('');

  // Cahier de texte state
  const [cahierEntries, setCahierEntries] = useState([]);
  const [cahierLoading, setCahierLoading] = useState(false);
  const [cahierClasse, setCahierClasse] = useState('');
  const [cahierMatiere, setCahierMatiere] = useState('');
  const [cahierDateSeance, setCahierDateSeance] = useState(new Date().toISOString().split('T')[0]);
  const [cahierHeureDebut, setCahierHeureDebut] = useState('08:00');
  const [cahierHeureFin, setCahierHeureFin] = useState('10:00');
  const [cahierTitre, setCahierTitre] = useState('');
  const [cahierContenu, setCahierContenu] = useState('');
  const [cahierTravail, setCahierTravail] = useState('');
  const [cahierDateRemise, setCahierDateRemise] = useState('');
  const [cahierFile, setCahierFile] = useState(null);
  const [cahierUploading, setCahierUploading] = useState(false);
  const [cahierFilterClasse, setCahierFilterClasse] = useState('');

  // Timetable display variables
  const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // Schedule view mode & sync & notifications states
  const [scheduleViewMode, setScheduleViewMode] = useState('weekly'); // 'weekly' | 'etablissement'
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const getEtabColor = (etabName) => {
    if (!etabName) return { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' };
    const colors = [
      { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' }, // Bleu
      { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46' }, // Vert
      { bg: '#fffbeb', border: '#fef3c7', text: '#92400e' }, // Jaune/Orange
      { bg: '#fdf2f8', border: '#fbcfe8', text: '#9d174d' }, // Rose
      { bg: '#faf5ff', border: '#e9d5ff', text: '#6b21a8' }, // Violet
      { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e' }  // Turquoise
    ];
    let hash = 0;
    for (let i = 0; i < etabName.length; i++) {
      hash = etabName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  const fetchChatChannels = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/messages/channels', {
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
      if (contact.etablissement_id) params.append('etablissement_id', contact.etablissement_id);
      const res = await fetch(`/api/messages/history?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        const detRes = await fetch('/api/professeurs-portal/dashboard-details', { headers: { 'Authorization': `Bearer ${token}` } });
        if (detRes.ok) setDashboardDetails(await detRes.json());
      }
    } catch (err) { console.error(err); } finally { setChatLoading(false); }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if ((!chatInput.trim() && !attachedFile) || !activeChatContact) return;
    const token = localStorage.getItem('token');
    const destType = activeChatContact.type === 'ADMIN' ? 'ADMIN_ETABLISSEMENT' : activeChatContact.type === 'OFFICE_BAC' ? 'OFFICE_BAC' : 'CLASSE';
    try {
      const res = await offlineFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          destinataire_type: destType,
          destinataire_id: activeChatContact.type === 'OFFICE_BAC' ? null : (activeChatContact.type === 'ADMIN' ? activeChatContact.etablissement_id : activeChatContact.id),
          sujet: activeChatContact.type === 'OFFICE_BAC' ? 'Message Office du BAC' : 'Message',
          contenu: chatInput.trim() || (attachedFile ? `📎 ${attachedFile.name}` : ''),
          etablissement_id: activeChatContact.etablissement_id || null,
          fichier_url: attachedFile ? attachedFile.url : null,
          fichier_nom: attachedFile ? attachedFile.name : null
        })
      }, 'Envoi message');
      if (res.ok) {
        const data = await res.json();
        setChatInput('');
        setAttachedFile(null);
        if (data.offline) {
          showNotification('Message enregistré en local (⏳ sera envoyé automatiquement dès le retour du réseau) !', 'info');
        } else {
          fetchChatHistory(activeChatContact);
        }
      } else {
        const errData = await res.json();
        showNotification(errData.message || "Erreur lors de l'envoi du message.", 'error');
      }
    } catch (err) { console.error(err); }
  };

  const handleChatContactClick = (contact) => {
    setActiveChatContact(contact);
    fetchChatHistory(contact);
  };


  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch initial profile & data
  useEffect(() => {
    const fetchBaseData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        // Fetch Profile
        const profRes = await fetch('/api/professeurs-portal/profile', { headers: getHeaders() });
        if (profRes.status === 401) {
          navigate('/auth');
          return;
        }
        const profData = await profRes.json();
        if (profRes.ok) {
          setProfile(profData);
          setEditProfileData({
            nom: profData.nom || '',
            prenom: profData.prenom || '',
            telephone: profData.telephone || '',
            matiere_principale: profData.matiere_principale || '',
            photo_url: profData.photo_url || ''
          });
        }

        // Fetch Summary
        const sumRes = await fetch('/api/professeurs-portal/summary', { headers: getHeaders() });
        const sumData = await sumRes.json();
        if (sumRes.ok) setSummary(sumData);

        // Fetch Consolidated Dashboard Details
        const detRes = await fetch('/api/professeurs-portal/dashboard-details', { headers: getHeaders() });
        const detData = await detRes.json();
        if (detRes.ok) setDashboardDetails(detData);

        // Fetch Invitations
        const invRes = await fetch('/api/professeurs-portal/invitations', { headers: getHeaders() });
        const invData = await invRes.json();
        if (invRes.ok) setInvitations(invData);

        // Fetch Affiliations
        const affRes = await fetch('/api/professeurs-portal/summary', { headers: getHeaders() }); // reusing dashboard details
        
        // Fetch active affiliations list
        const activeAffRes = await fetch('/api/professeurs-portal/profile', { headers: getHeaders() });
        
        // Load classes and schedules
        const classesRes = await fetch('/api/professeurs-portal/classes', { headers: getHeaders() });
        const classesData = await classesRes.json();
        if (classesRes.ok) setClasses(classesData);

        const scheduleRes = await fetch('/api/professeurs-portal/schedule', { headers: getHeaders() });
        const scheduleData = await scheduleRes.json();
        if (scheduleRes.ok) setSchedule(scheduleData);

        if (activeTab === 'messages') {
          await fetchChatChannels();
        }
        if (activeTab === 'cahier-texte') {
          await fetchCahierEntries();
        }
        await fetchNotifications();
      } catch (err) {
        console.error(err);
        showNotification('Erreur de chargement des données.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBaseData();
  }, [activeTab]);

  const fetchCahierEntries = async () => {
    const token = localStorage.getItem('token');
    setCahierLoading(true);
    try {
      const params = new URLSearchParams();
      if (cahierFilterClasse) params.append('classe_id', cahierFilterClasse);
      const res = await fetch(`/api/cahier-texte/professeur?${params}`, {
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

  const handleCahierFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      showNotification('Le fichier ne doit pas dépasser 20 Mo.', 'error');
      return;
    }
    setCahierUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('fichier', file);

    try {
      const res = await fetch('/api/cahier-texte/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setCahierFile(data);
        showNotification('Support de cours téléchargé.', 'success');
      } else {
        const err = await res.json();
        showNotification(err.message || 'Erreur téléchargement.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur réseau lors de l\'envoi.', 'error');
    } finally {
      setCahierUploading(false);
    }
  };

  const handleCreateCahierEntry = async (e) => {
    e.preventDefault();
    if (!cahierClasse || !cahierMatiere || !cahierTitre.trim() || !cahierContenu.trim()) {
      showNotification('Veuillez remplir au moins la classe, la matière, le titre et le résumé du cours.', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await offlineFetch('/api/cahier-texte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          classe_id: cahierClasse,
          matiere_id: cahierMatiere,
          date_seance: cahierDateSeance,
          heure_debut: cahierHeureDebut,
          heure_fin: cahierHeureFin,
          titre_lecon: cahierTitre,
          contenu_seance: cahierContenu,
          travail_a_faire: cahierTravail,
          date_remise_devoir: cahierDateRemise || null,
          fichier_url: cahierFile?.fichier_url || null,
          fichier_nom: cahierFile?.fichier_nom || null
        })
      }, 'Cahier de texte');

      if (res.ok) {
        const data = await res.json();
        if (data.offline) {
          showNotification('Séance enregistrée localement (⏳ synchronisation dès le retour du réseau) !', 'info');
        } else {
          showNotification('Séance enregistrée dans le Cahier de Texte.', 'success');
        }
        setCahierTitre('');
        setCahierContenu('');
        setCahierTravail('');
        setCahierDateRemise('');
        setCahierFile(null);
        fetchCahierEntries();
      } else {
        const err = await res.json();
        showNotification(err.message || 'Erreur enregistrement.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/professeurs-portal/notifications', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadNotificationsCount(data.filter(n => !n.lu).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      const res = await fetch(`/api/professeurs-portal/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: getHeaders()
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, lu: true } : n));
        setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/professeurs-portal/schedule/pdf', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'emploi_du_temps_consolide.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        showNotification('Erreur de téléchargement du PDF', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion', 'error');
    }
  };

  const fetchPedagogyData = async (classId, matId) => {
    if (!classId || !matId) return;
    setPedLoading(true);
    try {
      const res = await fetch(`/api/professeurs-portal/pedagogie/${classId}/${matId}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setPedData(data);
      } else {
        showNotification(data.message || 'Erreur lors du calcul des statistiques.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion.', 'error');
    } finally {
      setPedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pedagogy' && pedClass && pedMatiere) {
      fetchPedagogyData(pedClass, pedMatiere);
    }
  }, [activeTab, pedClass, pedMatiere]);

  const fetchPlanning = async () => {
    setPlanningLoading(true);
    try {
      const res = await fetch('/api/professeurs-portal/planning', {
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setPlanning(data);
      } else {
        showNotification(data.message || 'Erreur lors du chargement du planning.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion.', 'error');
    } finally {
      setPlanningLoading(false);
    }
  };

  const handleProposeDevoir = async (e) => {
    e.preventDefault();
    if (!propEtab || !propClasse || !propMatiere || !propType || !propDate) {
      showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/professeurs-portal/planning/propose', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          etablissement_id: propEtab,
          classe_id: propClasse,
          matiere_id: propMatiere,
          type_examen: propType,
          date_examen: propDate,
          salle: propSalle
        })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Proposition envoyée pour validation !');
        setShowProposeModal(false);
        setPropEtab('');
        setPropClasse('');
        setPropMatiere('');
        setPropType('DEVOIR');
        setPropDate('');
        setPropSalle('');
        fetchPlanning();
      } else {
        showNotification(data.message || 'Erreur lors de la soumission.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion.', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'planning') {
      fetchPlanning();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleRespondInvitation = async (etablissementId, accept) => {
    try {
      const res = await fetch(`/api/professeurs-portal/invitations/${etablissementId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ accept })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message, 'success');
        // Refresh invitations
        const invRes = await fetch('/api/professeurs-portal/invitations', { headers: getHeaders() });
        const invData = await invRes.json();
        if (invRes.ok) setInvitations(invData);

        // Refresh Summary
        const sumRes = await fetch('/api/professeurs-portal/summary', { headers: getHeaders() });
        const sumData = await sumRes.json();
        if (sumRes.ok) setSummary(sumData);
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors du traitement de l\'invitation.', 'error');
    }
  };

  // Profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/professeurs-portal/profile', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editProfileData)
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        showNotification('Profil mis à jour avec succès !', 'success');
      } else {
        showNotification(data.message || 'Erreur lors de la mise à jour.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion au serveur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper: compute appreciation from baremes — accepts baremes list directly to avoid stale state
  const getAppreciationFromBaremes = (noteVal, baremesRef) => {
    if (noteVal === '' || noteVal === null || noteVal === undefined) return '';
    const n = parseFloat(noteVal);
    if (isNaN(n)) return '';
    const activeBaremes = baremesRef || baremes;
    if (activeBaremes.length > 0) {
      const match = activeBaremes.find(b => n >= parseFloat(b.note_min) && n <= parseFloat(b.note_max));
      return match ? match.appreciation : '';
    }
    // Fallback default scale
    if (n <= 4) return 'Très Faible';
    if (n <= 7) return 'Faible';
    if (n <= 9) return 'Insuffisant';
    if (n <= 11) return 'Passable';
    if (n <= 13) return 'Assez Bien';
    if (n <= 15) return 'Bien';
    if (n <= 17) return 'Très Bien';
    return 'Excellent';
  };

  // Load students for grade entry tab
  // baremesOverride: pass the freshly-fetched baremes to avoid stale closure when called right after loading them
  const handleLoadGradesGrid = async (baremesOverride) => {
    if (!selectedClasse || !selectedMatiere) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/professeurs-portal/grades/${selectedClasse}/${selectedMatiere}?periode=${selectedPeriode}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setGradesData(data);
        // Prepare draft values — pre-fill with existing grades from DB (including those entered by school admin)
        const drafts = {};
        const originals = {};
        data.students.forEach(stud => {
          const g = data.grades.find(gr => gr.eleve_id === stud.id && gr.type_note === selectedTypeNote);
          const noteVal = g ? g.note : '';
          // Use baremesOverride if provided (avoids stale closure), otherwise use current baremes state
          const autoApprec = noteVal !== '' ? getAppreciationFromBaremes(noteVal, baremesOverride) : '';
          drafts[stud.id] = {
            note: noteVal,
            appreciation: g ? (g.appreciation || autoApprec) : ''
          };
          if (g) {
            originals[g.id] = g.note;
          }
        });
        setDraftGrades(drafts);
        setOriginalGrades(originals);
      }

      // Also load audit log for this class to check if there are pending/rejected modifications
      try {
        const auditRes = await fetch(`/api/etablissement/audit?classe_id=${selectedClasse}`, {
          headers: getHeaders()
        });
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setAuditLog(auditData);
        }
      } catch (e) {
        console.error('Failed to load audit logs:', e);
      }

    } catch (err) {
      console.error(err);
      showNotification('Erreur lors du chargement de la grille.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Separate useEffect to load baremes when classe changes
  useEffect(() => {
    if (!selectedClasse) return;
    const found = classes.find(cl => cl.classe_id === selectedClasse);
    if (!found || !found.etablissement_id) return;
    setSelectedEtabId(found.etablissement_id);
    fetch(
      `/api/professeurs-portal/baremes/${found.etablissement_id}`,
      { headers: getHeaders() }
    )
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBaremes(data); })
      .catch(console.error);
  }, [selectedClasse]);

  // Reload grades grid when classe, matiere, periode, typeNote OR baremes change
  useEffect(() => {
    if (selectedClasse && selectedMatiere) {
      handleLoadGradesGrid(baremes);
    }
  }, [selectedClasse, selectedMatiere, selectedPeriode, selectedTypeNote, baremes]);

  // Save new grade
  const handleSaveGrade = async (eleveId) => {
    const draft = draftGrades[eleveId];
    if (!draft || draft.note === '') return;
    try {
      const res = await offlineFetch('/api/professeurs-portal/grades', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          eleve_id: eleveId,
          classe_id: selectedClasse,
          matiere_id: selectedMatiere,
          type_note: selectedTypeNote,
          note: parseFloat(draft.note),
          appreciation: draft.appreciation,
          periode: selectedPeriode
        })
      }, 'Saisie note');
      if (res.ok) {
        const data = await res.json();
        if (data.offline) {
          showNotification('Note sauvegardée localement (⏳ sera transmise dès le retour du réseau) !', 'info');
        } else {
          showNotification('Note enregistrée !', 'success');
        }
        handleLoadGradesGrid();
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors de la saisie.', 'error');
    }
  };

  // Trigger modification modal (Audit required)
  const handleTriggerModifyGrade = (gradeId, currentValue, currentAppr) => {
    setModifyingGradeId(gradeId);
    setModifyingGradeValue(currentValue);
    setModifyingGradeAppreciation(currentAppr || '');
    setAuditMotif('');
  };

  const handleUpdateGradeWithAudit = async (e) => {
    e.preventDefault();
    if (!auditMotif.trim()) {
      showNotification('Un motif de modification est requis.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await offlineFetch(`/api/professeurs-portal/grades/${modifyingGradeId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          note: parseFloat(modifyingGradeValue),
          appreciation: modifyingGradeAppreciation,
          motif: auditMotif
        })
      }, 'Modification note');
      const data = await res.json();
      if (res.ok) {
        if (data.offline) {
          showNotification('Modification enregistrée localement (⏳ en attente de synchro) !', 'info');
        } else {
          showNotification('Note modifiée et tracée dans le journal d\'audit.', 'success');
        }
        setModifyingGradeId(null);
        setAuditMotif('');
        handleLoadGradesGrid();
      } else {
        showNotification(data.message || 'Erreur lors de la modification.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion au serveur.', 'error');
    } finally {
      setLoading(false);
    }
  };



  // Load students for attendance roster — uses separate attClasse state
  useEffect(() => {
    const loadRoster = async () => {
      if (!attClasse) return;
      setAttLoading(true);
      try {
        const res = await fetch(`/api/professeurs-portal/classes/${attClasse}/students`, {
          headers: getHeaders()
        });
        const data = await res.json();
        if (res.ok) {
          setAttendanceStudents(data);
          const roster = {};
          data.forEach(stud => {
            roster[stud.id] = { type_presence: 'PRESENT', duree_retard: '', motif: '' };
          });
          setAttendanceRoster(roster);
        }
      } catch (err) { console.error(err); }
      finally { setAttLoading(false); }
    };
    loadRoster();
  }, [attClasse, activeTab]);

  useEffect(() => {
    if (attClasse && attMatiere && attendanceDate) {
      const options = getAvailableSlotOptions();
      if (options.length > 0) {
        setAttCreneau(options[0].key);
      } else {
        setAttCreneau('');
      }
    } else {
      setAttCreneau('');
    }
  }, [attClasse, attMatiere, attendanceDate, schedule]);

  const handleSaveAttendance = async () => {
    if (!attClasse || !attMatiere) {
      showNotification('Veuillez sélectionner une classe et une matière.', 'error');
      return;
    }
    setAttLoading(true);
    try {
      const rosterList = Object.keys(attendanceRoster).map(eleveId => ({
        eleve_id: eleveId,
        type_presence: attendanceRoster[eleveId].type_presence,
        duree_retard: attendanceRoster[eleveId].type_presence === 'RETARD' ? parseInt(attendanceRoster[eleveId].duree_retard || 0) : 0,
        motif: attendanceRoster[eleveId].motif
      }));

      const res = await offlineFetch(`/api/professeurs-portal/attendance/${attClasse}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          date: attendanceDate,
          matiere_id: attMatiere,
          roster: rosterList
        })
      }, 'Appel / Présences');
      const data = await res.json();
      if (res.ok) {
        if (data.offline) {
          showNotification('Appel sauvegardé en local (⏳ synchronisation automatique dès retour réseau) !', 'info');
        } else {
          showNotification('Appel enregistré avec succès !', 'success');
        }
      } else {
        showNotification(data.message || 'Erreur lors de l\'enregistrement.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion au serveur.', 'error');
    } finally {
      setAttLoading(false);
    }
  };

  const getDaySchedule = (day) => {
    return schedule.filter(item => item.jour_semaine === day);
  };

  // Find if there is a conflict between slots
  const hasConflict = (slot, daySlots) => {
    return daySlots.some(other => {
      if (other.id === slot.id) return false;
      const [sh, sm] = slot.heure_debut.split(':').map(Number);
      const [eh, em] = slot.heure_fin.split(':').map(Number);
      const [osh, osm] = other.heure_debut.split(':').map(Number);
      const [oeh, oem] = other.heure_fin.split(':').map(Number);

      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      const ostart = osh * 60 + osm;
      const oend = oeh * 60 + oem;

      return (start < oend && end > ostart);
    });
  };

  return (
    <div className="teacher-dashboard">
      {/* SIDEBAR */}
      <TeacherSidebar
        profile={profile}
        invitations={invitations}
        activeTab={activeTab}
        navigate={navigate}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
      />

      {/* ZONE PRINCIPALE */}
      <div className="td-main-area">
        {/* HEADER TOPBAR */}
        <TeacherTopbar
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          profAnneeFilter={profAnneeFilter}
          setProfAnneeFilter={setProfAnneeFilter}
          unreadNotificationsCount={unreadNotificationsCount}
          invitations={invitations}
          setShowNotificationsDrawer={setShowNotificationsDrawer}
          fetchNotifications={fetchNotifications}
          profile={profile}
          navigate={navigate}
          handleLogout={handleLogout}
          schedule={schedule}
          hasConflict={hasConflict}
          toggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          availableAcademicYears={availableAcademicYears}
        />

        {/* CONTENU SCROLLABLE */}
        <div className="td-container">
          <div className="td-main-content">

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
              <Loader2 className="animate-spin" size={32} color="var(--primary-blue)" />
            </div>
          )}

          {!loading && activeTab === 'overview' && (
            <TeacherOverviewTab
              profile={profile}
              summary={summary}
              activeSchedule={activeSchedule}
              activeClasses={activeClasses}
              profAnneeFilter={profAnneeFilter}
              dashboardDetails={dashboardDetails}
              invitations={invitations}
              navigate={navigate}
              setActiveTab={(t) => navigate('/professeur/dashboard/' + t)}
              handleChatContactClick={handleChatContactClick}
              setSelectedClasse={setSelectedClasse}
              setSelectedMatiere={setSelectedMatiere}
              setSelectedTypeNote={setSelectedTypeNote}
              setSelectedPeriode={setSelectedPeriode}
            />
          )}

          {!loading && activeTab === 'partner-schools' && (
            <TeacherPartnerSchoolsTab
              dashboardDetails={dashboardDetails}
              searchTermSchools={searchTermSchools}
              setSearchTermSchools={setSearchTermSchools}
            />
          )}

          {!loading && activeTab === 'attached-classes' && (
            <TeacherAttachedClassesTab
              dashboardDetails={dashboardDetails}
              profAnneeFilter={profAnneeFilter}
              searchTermClasses={searchTermClasses}
              setSearchTermClasses={setSearchTermClasses}
              setSelectedClasse={setSelectedClasse}
              setSelectedMatiere={setSelectedMatiere}
              navigate={navigate}
            />
          )}

          {!loading && activeTab === 'invitations' && (
            <TeacherInvitationsTab
              invitations={invitations}
              handleRespondInvitation={handleRespondInvitation}
            />
          )}

          {!loading && activeTab === 'schedule' && (
            <TeacherScheduleTab
              activeSchedule={activeSchedule}
              schedule={schedule}
              profAnneeFilter={profAnneeFilter}
              scheduleViewMode={scheduleViewMode}
              setScheduleViewMode={setScheduleViewMode}
              handleDownloadPDF={handleDownloadPDF}
              setShowSyncModal={setShowSyncModal}
              hasConflict={hasConflict}
              getEtabColor={getEtabColor}
            />
          )}

          {!loading && activeTab === 'grades' && (
            <TeacherGradesTab
              selectedClasse={selectedClasse}
              setSelectedClasse={setSelectedClasse}
              selectedMatiere={selectedMatiere}
              setSelectedMatiere={setSelectedMatiere}
              selectedPeriode={selectedPeriode}
              setSelectedPeriode={setSelectedPeriode}
              selectedTypeNote={selectedTypeNote}
              setSelectedTypeNote={setSelectedTypeNote}
              activeClasses={activeClasses}
              setBaremes={setBaremes}
              gradesData={gradesData}
              draftGrades={draftGrades}
              setDraftGrades={setDraftGrades}
              getAppreciationFromBaremes={getAppreciationFromBaremes}
              auditLog={auditLog}
              setActiveMotifText={setActiveMotifText}
              handleTriggerModifyGrade={handleTriggerModifyGrade}
              handleSaveGrade={handleSaveGrade}
            />
          )}

          {!loading && activeTab === 'attendance' && (
            <TeacherAttendanceTab
              attClasse={attClasse}
              setAttClasse={setAttClasse}
              attMatiere={attMatiere}
              setAttMatiere={setAttMatiere}
              attendanceDate={attendanceDate}
              setAttendanceDate={setAttendanceDate}
              attCreneau={attCreneau}
              setAttCreneau={setAttCreneau}
              activeClasses={activeClasses}
              getAvailableSlotOptions={getAvailableSlotOptions}
              attendanceStudents={attendanceStudents}
              attendanceRoster={attendanceRoster}
              setAttendanceRoster={setAttendanceRoster}
              handleSaveAttendance={handleSaveAttendance}
              attLoading={attLoading}
            />
          )}

          {!loading && activeTab === 'pedagogy' && (
            <TeacherPedagogyTab
              pedClass={pedClass}
              setPedClass={setPedClass}
              pedMatiere={pedMatiere}
              setPedMatiere={setPedMatiere}
              activeClasses={activeClasses}
              setPedData={setPedData}
              pedLoading={pedLoading}
              pedData={pedData}
              pedSubTab={pedSubTab}
              setPedSubTab={setPedSubTab}
              showNotification={showNotification}
            />
          )}

          {!loading && activeTab === 'planning' && (
            <TeacherPlanningTab
              classes={classes}
              planningFilterEtab={planningFilterEtab}
              setPlanningFilterEtab={setPlanningFilterEtab}
              planningFilterClasse={planningFilterClasse}
              setPlanningFilterClasse={setPlanningFilterClasse}
              planningLoading={planningLoading}
              planning={planning}
              setShowProposeModal={setShowProposeModal}
            />
          )}

          {!loading && activeTab === 'profile' && (
            <TeacherProfileTab
              editProfileData={editProfileData}
              setEditProfileData={setEditProfileData}
              handleUpdateProfile={handleUpdateProfile}
            />
          )}

          {!loading && activeTab === 'messages' && (
            <TeacherMessagesTab
              activeChatContact={activeChatContact}
              setActiveChatContact={setActiveChatContact}
              handleChatContactClick={handleChatContactClick}
              chatChannels={chatChannels}
              profAnneeFilter={profAnneeFilter}
              profile={profile}
              chatLoading={chatLoading}
              chatHistory={chatHistory}
              sendChatMessage={sendChatMessage}
              attachedFile={attachedFile}
              setAttachedFile={setAttachedFile}
              fileInputRef={fileInputRef}
              handleFileUpload={handleFileUpload}
              uploadingFile={uploadingFile}
              chatInput={chatInput}
              setChatInput={setChatInput}
              chatEndRef={chatEndRef}
            />
          )}

          {!loading && activeTab === 'cahier-texte' && (
            <TeacherCahierTexteTab
              classes={classes}
              profAnneeFilter={profAnneeFilter}
              handleCreateCahierEntry={handleCreateCahierEntry}
              cahierClasse={cahierClasse}
              setCahierClasse={setCahierClasse}
              cahierMatiere={cahierMatiere}
              setCahierMatiere={setCahierMatiere}
              cahierDateSeance={cahierDateSeance}
              setCahierDateSeance={setCahierDateSeance}
              cahierHeureDebut={cahierHeureDebut}
              setCahierHeureDebut={setCahierHeureDebut}
              cahierHeureFin={cahierHeureFin}
              setCahierHeureFin={setCahierHeureFin}
              cahierTitre={cahierTitre}
              setCahierTitre={setCahierTitre}
              cahierContenu={cahierContenu}
              setCahierContenu={setCahierContenu}
              cahierTravail={cahierTravail}
              setCahierTravail={setCahierTravail}
              cahierDateRemise={cahierDateRemise}
              setCahierDateRemise={setCahierDateRemise}
              cahierFile={cahierFile}
              setCahierFile={setCahierFile}
              handleCahierFileUpload={handleCahierFileUpload}
              cahierUploading={cahierUploading}
              cahierFilterClasse={cahierFilterClasse}
              setCahierFilterClasse={setCahierFilterClasse}
              fetchCahierEntries={fetchCahierEntries}
              cahierLoading={cahierLoading}
              cahierEntries={cahierEntries}
            />
          )}

          {!loading && activeTab === 'discipline' && <TeacherDisciplineView />}
          {!loading && activeTab === 'emargement' && <ProfDashboardEmargement />}
          </div>{/* .td-main-content */}
        </div>{/* .td-container */}
      </div>{/* .td-main-area */}



      {showProposeModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <h3 style={{ marginBottom: '6px' }}>Proposer un Devoir</h3>
            <p className="subtitle" style={{ fontSize: '12px', color: 'var(--text-slate-500)', marginBottom: '20px' }}>
              Soumettez une proposition de date de devoir à l'administrateur de l'établissement concerné.
            </p>

            <form onSubmit={handleProposeDevoir} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label>Établissement & Classe</label>
                <select 
                  required
                  value={propClasse} 
                  onChange={e => {
                    const cId = e.target.value;
                    setPropClasse(cId);
                    const matchingClass = classes.find(c => c.classe_id === cId);
                    if (matchingClass) {
                      setPropEtab(matchingClass.etablissement_id);
                    } else {
                      setPropEtab('');
                    }
                    setPropMatiere('');
                  }}
                >
                  <option value="">Sélectionner</option>
                  {Array.from(new Set(classes.map(c => c.classe_id))).map(cId => {
                    const c = classes.find(cl => cl.classe_id === cId);
                    return <option key={cId} value={cId}>{c.classe_nom} ({c.etablissement_nom})</option>;
                  })}
                </select>
              </div>

              {propClasse && (
                <div className="input-group">
                  <label>Matière</label>
                  <select 
                    required
                    value={propMatiere} 
                    onChange={e => setPropMatiere(e.target.value)}
                  >
                    <option value="">Sélectionner</option>
                    {classes.filter(c => c.classe_id === propClasse).map(c => (
                      <option key={c.matiere_id} value={c.matiere_id}>{c.matiere_nom}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="input-group">
                <label>Type d'Évaluation</label>
                <select 
                  required
                  value={propType} 
                  onChange={e => setPropType(e.target.value)}
                >
                  <option value="DEVOIR">Devoir</option>
                  <option value="COMPOSITION">Composition</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Date & Heure</label>
                  <input
                    type="datetime-local"
                    required
                    value={propDate}
                    onChange={e => setPropDate(e.target.value)}
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Salle (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="ex: Salle B1"
                    value={propSalle}
                    onChange={e => setPropSalle(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowProposeModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Soumettre la date</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSyncModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <h3>Synchroniser votre Emploi du Temps</h3>
            <p className="subtitle" style={{ fontSize: '12.5px', color: 'var(--text-slate-500)', marginBottom: '16px', lineHeight: 1.5 }}>
              Copiez ce lien pour ajouter votre emploi du temps consolidé en temps réel dans votre agenda externe (Google Calendar, Apple iCal, Outlook, etc.).
            </p>
            
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label>Lien de synchronisation (iCal)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={`/api/professeurs-portal/public-schedule/ical/${profile?.id}`}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-slate-200)', borderRadius: '8px', fontSize: '11px', background: '#f8fafc', fontWeight: 600 }}
                  onClick={e => e.target.select()}
                />
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`/api/professeurs-portal/public-schedule/ical/${profile?.id}`);
                    showNotification('Lien copié dans le presse-papier !');
                  }}
                  style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  Copier
                </button>
              </div>
            </div>

            <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '11.5px', color: '#0369a1', lineHeight: 1.5 }}>
              <strong>  Comment faire ?</strong><br />
              • Dans <strong>Google Calendar</strong>: Cliquez sur le bouton "+" à côté de "Autres agendas", sélectionnez "À partir de l'URL" et collez le lien.<br />
              • Dans <strong>Apple iCal</strong>: Sélectionnez Fichier &gt; Nouvel abonnement calendrier, et collez le lien.
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={() => setShowSyncModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {showNotificationsDrawer && (
        <div className="modal-overlay" onClick={() => setShowNotificationsDrawer(false)}>
          <div 
            className="modal-card" 
            style={{ 
              position: 'absolute', top: 0, right: 0, bottom: 0, height: '100%', 
              maxWidth: '400px', width: '100%', borderRadius: 0, display: 'flex', 
              flexDirection: 'column', padding: '24px', boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
              background: 'white'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={20} /> Alertes de cours</h3>
              <button onClick={() => setShowNotificationsDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-slate-400)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-slate-400)', fontSize: '13px' }}>
                  Aucune notification.
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    style={{ 
                      padding: '14px', borderRadius: '10px', background: notif.lu ? '#f8fafc' : '#eff6ff', 
                      border: `1px solid ${notif.lu ? 'var(--border-slate-200)' : '#bfdbfe'}`,
                      position: 'relative', cursor: 'pointer' 
                    }}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    {!notif.lu && <span style={{ position: 'absolute', top: '14px', right: '14px', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span>}
                    <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 800, color: notif.lu ? 'var(--text-slate-800)' : '#1e3a8a' }}>{notif.titre}</h4>
                    <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'var(--text-slate-600)', lineHeight: 1.4 }}>{notif.description}</p>
                    <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>{new Date(notif.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOG MODAL FOR NOTE JUSTIFICATION */}
      {modifyingGradeId && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#b45309' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Justification de Modification</h3>
            </div>
            
            <form onSubmit={handleUpdateGradeWithAudit}>
              <p style={{ fontSize: '12.5px', color: 'var(--text-slate-700)', lineHeight: 1.5, marginBottom: '16px' }}>
                Toute modification de note sur le livret scolaire numérique est enregistrée de manière permanente dans le <strong>journal d'audit</strong> de l'etablissement concerné. Veuillez justifier cette modification.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Nouvelle note</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    required
                    value={modifyingGradeValue}
                    onChange={e => setModifyingGradeValue(e.target.value)}
                    style={{ fontWeight: 'bold', fontSize: '16px', textAlign: 'center' }}
                  />
                </div>
                <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
                  <label>Nouvel appréciation</label>
                  <input
                    type="text"
                    value={modifyingGradeAppreciation}
                    onChange={e => setModifyingGradeAppreciation(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Motif de la modification (Obligatoire)</label>
                <textarea
                  required
                  rows="3"
                  placeholder="ex: Erreur de report lors de la saisie initiale"
                  value={auditMotif}
                  onChange={e => setAuditMotif(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-slate-200)', fontSize: '13px' }}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModifyingGradeId(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#b45309', borderColor: '#b45309' }}>Valider et enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOTIF MODAL FOR AUDIT LOG VIEW */}
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

      {/* TOAST NOTIFICATION */}
      {toast.message && (
        <div className="toast-container">
          <div className="toast">
            {toast.type === 'error' ? <XCircle size={18} color="#ef4444" /> : <CheckCircle2 size={18} color="#10b981" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
