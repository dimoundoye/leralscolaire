import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { offlineFetch } from '../services/api';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
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
import { apiFetch } from '../services/http';
import ModifyGradeModal from '../components/professeur/modals/ModifyGradeModal';
import NotificationsDrawer from '../components/professeur/modals/NotificationsDrawer';
import ProposeDevoirModal from '../components/professeur/modals/ProposeDevoirModal';
import ScheduleSyncModal from '../components/professeur/modals/ScheduleSyncModal';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { tab } = useParams();
  const activeTab = tab || 'overview';

  // State variables
  const [profile, setProfile] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [summary, setSummary] = useState({ schoolsCount: 0, classesCount: 0, studentsCount: 0 });
  const [dashboardDetails, setDashboardDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem('teacher_sidebar_collapsed') === 'true'
  );
  const toggleSidebar = () =>
    setIsSidebarCollapsed((prev) => {
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
        showNotification(errData.message || 'Erreur lors du téléchargement du fichier.', 'error');
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
    nom: '',
    prenom: '',
    telephone: '',
    matiere_principale: '',
    photo_url: '',
  });

  // Grades Tab State
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('Semestre 1');
  const [selectedTypeNote, setSelectedTypeNote] = useState('DEVOIR');
  const [gradesData, setGradesData] = useState({ students: [], grades: [] });
  const [draftGrades, setDraftGrades] = useState({}); // eleve_id -> { note: '', appreciation: '' }
  const [auditMotif, setAuditMotif] = useState('');
  const [modifyingGradeId, setModifyingGradeId] = useState(null);
  const [modifyingGradeValue, setModifyingGradeValue] = useState('');
  const [modifyingGradeAppreciation, setModifyingGradeAppreciation] = useState('');
  const [baremes, setBaremes] = useState([]); // appreciation scales from school

  // Audit modifications states
  const [auditLog, setAuditLog] = useState([]);
  const [activeMotifText, setActiveMotifText] = useState('');

  // Academic Years dynamically extracted from classes & schedule (no hardcoding)
  const availableAcademicYears = React.useMemo(() => {
    const yearsSet = new Set();
    classes.forEach((c) => {
      if (c.annee_scolaire) yearsSet.add(c.annee_scolaire);
    });
    schedule.forEach((s) => {
      if (s.annee_scolaire) yearsSet.add(s.annee_scolaire);
    });
    if (dashboardDetails?.classes) {
      dashboardDetails.classes.forEach((c) => {
        if (c.annee_scolaire) yearsSet.add(c.annee_scolaire);
      });
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

  const activeClasses = React.useMemo(() => {
    if (!classes || classes.length === 0) return [];
    const filtered = classes.filter((c) => c.annee_scolaire === profAnneeFilter || !c.annee_scolaire);
    return filtered.length > 0 ? filtered : classes;
  }, [classes, profAnneeFilter]);

  const activeSchedule = React.useMemo(() => {
    if (!schedule || schedule.length === 0) return [];
    const filtered = schedule.filter((s) => s.annee_scolaire === profAnneeFilter || !s.annee_scolaire);
    return filtered.length > 0 ? filtered : schedule;
  }, [schedule, profAnneeFilter]);

  // Attendance Tab State — SEPARATE from grades to avoid cross-tab conflicts
  const [attClasse, setAttClasse] = useState('');
  const [attMatiere, setAttMatiere] = useState('');
  const [attCreneau, setAttCreneau] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRoster, setAttendanceRoster] = useState({}); // eleve_id -> { type_presence: 'PRESENT', duree_retard: '', motif: '' }
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attLoading, setAttLoading] = useState(false);

  // Auto-sélection de la première classe et matière si non définies
  useEffect(() => {
    if (activeClasses.length > 0 && !attClasse) {
      setAttClasse(activeClasses[0].classe_id || activeClasses[0].id || '');
    }
  }, [activeClasses, attClasse]);

  useEffect(() => {
    if (attClasse && !attMatiere) {
      const classMatieres = activeClasses.filter((c) => (c.classe_id || c.id) === attClasse);
      if (classMatieres.length > 0) {
        setAttMatiere(classMatieres[0].matiere_id || '');
      }
    }
  }, [attClasse, attMatiere, activeClasses]);

  const getFrenchDayName = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[d.getDay()];
  };

  const getAvailableSlotOptions = () => {
    if (!attClasse || !attMatiere) return [];
    const dayName = getFrenchDayName(attendanceDate);
    let matchingSlots = schedule.filter(
      (s) => s.classe_id === attClasse && s.matiere_id === attMatiere && s.jour_semaine === dayName
    );
    if (matchingSlots.length === 0) {
      matchingSlots = schedule.filter((s) => s.classe_id === attClasse && s.matiere_id === attMatiere);
    }
    return matchingSlots.map((s) => {
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
      { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e' }, // Turquoise
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
      if (contact.etablissement_id) params.append('etablissement_id', contact.etablissement_id);
      const res = await apiFetch(`/api/messages/history?${params}`, {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        const detRes = await apiFetch('/api/professeurs-portal/dashboard-details', { headers: {} });
        if (detRes.ok) setDashboardDetails(await detRes.json());
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
      activeChatContact.type === 'ADMIN'
        ? 'ADMIN_ETABLISSEMENT'
        : activeChatContact.type === 'OFFICE_BAC'
          ? 'OFFICE_BAC'
          : activeChatContact.type === 'ELEVE'
            ? 'ELEVE'
            : 'CLASSE';
    const destId =
      activeChatContact.type === 'OFFICE_BAC'
        ? null
        : activeChatContact.type === 'ADMIN'
          ? activeChatContact.etablissement_id
          : activeChatContact.id;
    try {
      const res = await offlineFetch(
        '/api/messages',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinataire_type: destType,
            destinataire_id: destId,
            sujet:
              activeChatContact.type === 'OFFICE_BAC'
                ? 'Message Office du BAC'
                : activeChatContact.type === 'ELEVE'
                  ? `Message à ${activeChatContact.name}`
                  : 'Message',
            contenu: chatInput.trim() || (attachedFile ? `📎 ${attachedFile.name}` : ''),
            etablissement_id: activeChatContact.etablissement_id || null,
            fichier_url: attachedFile ? attachedFile.url : null,
            fichier_nom: attachedFile ? attachedFile.name : null,
          }),
        },
        'Envoi message'
      );
      if (res.ok) {
        const data = await res.json();
        setChatInput('');
        setAttachedFile(null);
        if (data.offline) {
          showNotification(
            'Message enregistré en local (⏳ sera envoyé automatiquement dès le retour du réseau) !',
            'info'
          );
        } else {
          fetchChatHistory(activeChatContact);
        }
      } else {
        const errData = await res.json();
        showNotification(errData.message || "Erreur lors de l'envoi du message.", 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatContactClick = (contact) => {
    setActiveChatContact(contact);
    fetchChatHistory(contact);
  };

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
    };
  };

  // Fetch initial profile & data
  useEffect(() => {
    const fetchBaseData = async () => {
      setLoading(true);
      try {
        if (!user) {
          navigate('/auth');
          return;
        }

        // Fetch Profile
        const profRes = await offlineFetch('/api/professeurs-portal/profile', { headers: getHeaders() });
        if (profRes.status === 401 && navigator.onLine) {
          navigate('/auth');
          return;
        }
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData);
          setEditProfileData({
            nom: profData.nom || '',
            prenom: profData.prenom || '',
            telephone: profData.telephone || '',
            matiere_principale: profData.matiere_principale || '',
            photo_url: profData.photo_url || '',
          });
        }

        // Fetch Summary
        const sumRes = await offlineFetch('/api/professeurs-portal/summary', { headers: getHeaders() });
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setSummary(sumData);
        }

        // Fetch Consolidated Dashboard Details
        const detRes = await offlineFetch('/api/professeurs-portal/dashboard-details', { headers: getHeaders() });
        if (detRes.ok) {
          const detData = await detRes.json();
          setDashboardDetails(detData);
        }

        // Fetch Invitations
        const invRes = await offlineFetch('/api/professeurs-portal/invitations', { headers: getHeaders() });
        if (invRes.ok) {
          const invData = await invRes.json();
          setInvitations(invData);
        }

        // Load classes and schedules (avec support Offline & cache IndexedDB)
        const classesRes = await offlineFetch('/api/professeurs-portal/classes', { headers: getHeaders() });
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          const validClasses = Array.isArray(classesData) ? classesData : [];
          setClasses(validClasses);

          // Préchargement automatique des élèves, barèmes et notes pour garantir le mode hors-ligne
          if (validClasses.length > 0) {
            const uniqueClassIds = Array.from(new Set(validClasses.map((c) => c.classe_id || c.id).filter(Boolean)));
            uniqueClassIds.forEach((cId) => {
              offlineFetch(`/api/professeurs-portal/classes/${cId}/students`, { headers: getHeaders() }).catch((err) =>
                console.warn(`Pré-cache élèves hors-ligne classe ${cId}:`, err)
              );
            });

            // Pré-cache des barèmes d'établissement et des grilles de notes
            validClasses.forEach((c) => {
              const cId = c.classe_id || c.id;
              const mId = c.matiere_id || c.matiere_code;
              if (cId && mId) {
                offlineFetch(`/api/professeurs-portal/grades/${cId}/${mId}?periode=Semestre 1`, {
                  headers: getHeaders(),
                }).catch(() => {});
              }
              if (c.etablissement_id) {
                offlineFetch(`/api/professeurs-portal/baremes/${c.etablissement_id}`, { headers: getHeaders() }).catch(
                  () => {}
                );
              }
            });
          }
        }

        const scheduleRes = await offlineFetch('/api/professeurs-portal/schedule', { headers: getHeaders() });
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json();
          setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
        }

        if (activeTab === 'messages') {
          await fetchChatChannels();
        }
        if (activeTab === 'cahier-texte') {
          await fetchCahierEntries();
        }
        await fetchNotifications();
      } catch (err) {
        console.error('Erreur chargement données professeur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBaseData();
  }, [activeTab]);

  const fetchCahierEntries = async () => {
    setCahierLoading(true);
    try {
      const params = new URLSearchParams();
      if (cahierFilterClasse) params.append('classe_id', cahierFilterClasse);
      const res = await apiFetch(`/api/cahier-texte/professeur?${params}`, {
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

  const handleCahierFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      showNotification('Le fichier ne doit pas dépasser 20 Mo.', 'error');
      return;
    }
    setCahierUploading(true);
    const formData = new FormData();
    formData.append('fichier', file);

    try {
      const res = await apiFetch('/api/cahier-texte/upload', {
        method: 'POST',
        headers: {},
        body: formData,
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
      showNotification("Erreur réseau lors de l'envoi.", 'error');
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

    try {
      const res = await offlineFetch(
        '/api/cahier-texte',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
            fichier_nom: cahierFile?.fichier_nom || null,
          }),
        },
        'Cahier de texte'
      );

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
      const res = await apiFetch('/api/professeurs-portal/notifications', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadNotificationsCount(data.filter((n) => !n.lu).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      const res = await apiFetch(`/api/professeurs-portal/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, lu: true } : n)));
        setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await apiFetch('/api/professeurs-portal/schedule/pdf', {
        headers: {},
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
      const res = await apiFetch(`/api/professeurs-portal/pedagogie/${classId}/${matId}`, {
        headers: getHeaders(),
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
      const res = await apiFetch('/api/professeurs-portal/planning', {
        headers: getHeaders(),
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
      const res = await apiFetch('/api/professeurs-portal/planning/propose', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          etablissement_id: propEtab,
          classe_id: propClasse,
          matiere_id: propMatiere,
          type_examen: propType,
          date_examen: propDate,
          salle: propSalle,
        }),
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

  const handleLogout = () => logout();

  const handleRespondInvitation = async (etablissementId, accept) => {
    try {
      const res = await apiFetch(`/api/professeurs-portal/invitations/${etablissementId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ accept }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message, 'success');
        // Refresh invitations
        const invRes = await apiFetch('/api/professeurs-portal/invitations', { headers: getHeaders() });
        const invData = await invRes.json();
        if (invRes.ok) setInvitations(invData);

        // Refresh Summary
        const sumRes = await apiFetch('/api/professeurs-portal/summary', { headers: getHeaders() });
        const sumData = await sumRes.json();
        if (sumRes.ok) setSummary(sumData);
      }
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors du traitement de l'invitation.", 'error');
    }
  };

  // Profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/professeurs-portal/profile', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editProfileData),
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
      const match = activeBaremes.find((b) => n >= parseFloat(b.note_min) && n <= parseFloat(b.note_max));
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
      let data = { students: [], grades: [] };
      try {
        const res = await offlineFetch(
          `/api/professeurs-portal/grades/${selectedClasse}/${selectedMatiere}?periode=${selectedPeriode}`,
          {
            headers: getHeaders(),
          }
        );
        if (res.ok) {
          const fetched = await res.json();
          if (fetched && !Array.isArray(fetched) && typeof fetched === 'object') {
            data = fetched;
          }
        }
      } catch (fetchErr) {
        console.warn('Chargement notes via réseau indisponible:', fetchErr);
      }

      if (!Array.isArray(data.students)) data.students = [];
      if (!Array.isArray(data.grades)) data.grades = [];

      // Si aucun élève dans le retour des notes (ex: mode hors-ligne sans cache de notes préalable),
      // on charge les élèves de secours depuis le cache IndexedDB de la classe
      if (data.students.length === 0) {
        try {
          const studentsRes = await offlineFetch(`/api/professeurs-portal/classes/${selectedClasse}/students`, {
            headers: getHeaders(),
          });
          if (studentsRes.ok) {
            const studentsData = await studentsRes.json();
            if (Array.isArray(studentsData) && studentsData.length > 0) {
              data.students = studentsData;
            }
          }
        } catch (sErr) {
          console.warn('Erreur chargement élèves de secours pour notes:', sErr);
        }
      }

      setGradesData(data);
      // Prepare draft values — pre-fill with existing grades from DB (including those entered by school admin)
      const drafts = {};
      if (Array.isArray(data.students)) {
        data.students.forEach((stud) => {
          const g = (data.grades || []).find((gr) => gr.eleve_id === stud.id && gr.type_note === selectedTypeNote);
          const noteVal = g ? g.note : '';
          // Use baremesOverride if provided (avoids stale closure), otherwise use current baremes state
          const autoApprec = noteVal !== '' ? getAppreciationFromBaremes(noteVal, baremesOverride) : '';
          drafts[stud.id] = {
            note: noteVal,
            appreciation: g ? g.appreciation || autoApprec : '',
          };
        });
      }
      setDraftGrades(drafts);

      // Also load audit log for this class to check if there are pending/rejected modifications
      try {
        const auditRes = await offlineFetch(`/api/etablissement/audit?classe_id=${selectedClasse}`, {
          headers: getHeaders(),
        });
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setAuditLog(Array.isArray(auditData) ? auditData : []);
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
    const found = classes.find((cl) => (cl.classe_id || cl.id) === selectedClasse);
    if (!found || !found.etablissement_id) return;
    offlineFetch(`/api/professeurs-portal/baremes/${found.etablissement_id}`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBaremes(data);
      })
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
      const res = await offlineFetch(
        '/api/professeurs-portal/grades',
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            eleve_id: eleveId,
            classe_id: selectedClasse,
            matiere_id: selectedMatiere,
            type_note: selectedTypeNote,
            note: parseFloat(draft.note),
            appreciation: draft.appreciation,
            periode: selectedPeriode,
          }),
        },
        'Saisie note'
      );
      if (res.ok) {
        const data = await res.json();
        if (data.offline) {
          showNotification('Note sauvegardée localement (⏳ sera transmise dès le retour du réseau) !', 'info');
          // Optimistically update gradesData in local state
          setGradesData((prev) => {
            const currentGrades = Array.isArray(prev?.grades) ? [...prev.grades] : [];
            const existingIdx = currentGrades.findIndex(
              (g) => g.eleve_id === eleveId && g.type_note === selectedTypeNote
            );
            const newGradeItem = {
              id: 'local-' + Date.now(),
              eleve_id: eleveId,
              note: parseFloat(draft.note),
              type_note: selectedTypeNote,
              appreciation: draft.appreciation,
            };
            if (existingIdx >= 0) {
              currentGrades[existingIdx] = newGradeItem;
            } else {
              currentGrades.push(newGradeItem);
            }
            return {
              ...(prev || {}),
              students: Array.isArray(prev?.students) ? prev.students : [],
              grades: currentGrades,
            };
          });
        } else {
          showNotification('Note enregistrée !', 'success');
          handleLoadGradesGrid();
        }
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
      const res = await offlineFetch(
        `/api/professeurs-portal/grades/${modifyingGradeId}`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            note: parseFloat(modifyingGradeValue),
            appreciation: modifyingGradeAppreciation,
            motif: auditMotif,
          }),
        },
        'Modification note'
      );
      const data = await res.json();
      if (res.ok) {
        if (data.offline) {
          showNotification('Modification enregistrée localement (⏳ en attente de synchro) !', 'info');
        } else {
          showNotification("Note modifiée et tracée dans le journal d'audit.", 'success');
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
        const res = await offlineFetch(`/api/professeurs-portal/classes/${attClasse}/students`, {
          headers: getHeaders(),
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setAttendanceStudents(data);
          const roster = {};
          data.forEach((stud) => {
            roster[stud.id] = { type_presence: 'PRESENT', duree_retard: '', motif: '' };
          });
          setAttendanceRoster(roster);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAttLoading(false);
      }
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
      const rosterList = Object.keys(attendanceRoster).map((eleveId) => ({
        eleve_id: eleveId,
        type_presence: attendanceRoster[eleveId].type_presence,
        duree_retard:
          attendanceRoster[eleveId].type_presence === 'RETARD'
            ? parseInt(attendanceRoster[eleveId].duree_retard || 0)
            : 0,
        motif: attendanceRoster[eleveId].motif,
      }));

      const res = await offlineFetch(
        `/api/professeurs-portal/attendance/${attClasse}`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            date: attendanceDate,
            matiere_id: attMatiere,
            roster: rosterList,
          }),
        },
        'Appel / Présences'
      );
      const data = await res.json();
      if (res.ok) {
        if (data.offline) {
          showNotification('Appel sauvegardé en local (⏳ synchronisation automatique dès retour réseau) !', 'info');
        } else {
          showNotification('Appel enregistré avec succès !', 'success');
        }
      } else {
        showNotification(data.message || "Erreur lors de l'enregistrement.", 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erreur de connexion au serveur.', 'error');
    } finally {
      setAttLoading(false);
    }
  };

  // Find if there is a conflict between slots
  const hasConflict = (slot, daySlots) => {
    return daySlots.some((other) => {
      if (other.id === slot.id) return false;
      const [sh, sm] = slot.heure_debut.split(':').map(Number);
      const [eh, em] = slot.heure_fin.split(':').map(Number);
      const [osh, osm] = other.heure_debut.split(':').map(Number);
      const [oeh, oem] = other.heure_fin.split(':').map(Number);

      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      const ostart = osh * 60 + osm;
      const oend = oeh * 60 + oem;

      return start < oend && end > ostart;
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
              <TeacherInvitationsTab invitations={invitations} handleRespondInvitation={handleRespondInvitation} />
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
            {!loading && activeTab === 'emargement' && (
              <ProfDashboardEmargement
                classes={classes}
                schedule={schedule}
                profile={profile}
                onNavigateTab={(targetTab) => navigate(`/professeur/dashboard/${targetTab}`)}
              />
            )}
          </div>
          {/* .td-main-content */}
        </div>
        {/* .td-container */}
      </div>
      {/* .td-main-area */}

      {showProposeModal && (
        <ProposeDevoirModal
          classes={classes}
          handleProposeDevoir={handleProposeDevoir}
          propClasse={propClasse}
          propDate={propDate}
          propMatiere={propMatiere}
          propSalle={propSalle}
          propType={propType}
          setPropClasse={setPropClasse}
          setPropDate={setPropDate}
          setPropEtab={setPropEtab}
          setPropMatiere={setPropMatiere}
          setPropSalle={setPropSalle}
          setPropType={setPropType}
          setShowProposeModal={setShowProposeModal}
        />
      )}

      {showSyncModal && (
        <ScheduleSyncModal profile={profile} setShowSyncModal={setShowSyncModal} showNotification={showNotification} />
      )}

      {showNotificationsDrawer && (
        <NotificationsDrawer
          handleMarkAsRead={handleMarkAsRead}
          notifications={notifications}
          setShowNotificationsDrawer={setShowNotificationsDrawer}
        />
      )}

      {/* AUDIT LOG MODAL FOR NOTE JUSTIFICATION */}
      {modifyingGradeId && (
        <ModifyGradeModal
          auditMotif={auditMotif}
          handleUpdateGradeWithAudit={handleUpdateGradeWithAudit}
          modifyingGradeAppreciation={modifyingGradeAppreciation}
          modifyingGradeValue={modifyingGradeValue}
          setAuditMotif={setAuditMotif}
          setModifyingGradeAppreciation={setModifyingGradeAppreciation}
          setModifyingGradeId={setModifyingGradeId}
          setModifyingGradeValue={setModifyingGradeValue}
        />
      )}

      {/* MOTIF MODAL FOR AUDIT LOG VIEW */}
      {activeMotifText && (
        <div className="modal-overlay" onClick={() => setActiveMotifText('')}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-lg)' }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: 'var(--slate-800)' }}>
              Motif de la modification
            </h3>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '13px',
                color: 'var(--slate-700)',
                fontStyle: 'italic',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
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
            {toast.type === 'error' ? (
              <XCircle size={18} color="#ef4444" />
            ) : (
              <CheckCircle2 size={18} color="#10b981" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
