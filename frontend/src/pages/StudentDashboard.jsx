import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, User, BookOpen, GraduationCap, Calendar, 
  FileText, Bell, MessageSquare, Plus, Trash2, Award, Printer, 
  WifiOff, RefreshCw, LogOut, CheckCircle2, ChevronRight, ChevronLeft, Menu, X, Activity, 
  Percent, BrainCircuit, ShieldAlert, AwardIcon, Phone, Mail, MapPin,
  HelpCircle, Sparkles, Send, Download, Lock,
  Clock, CheckCircle, XCircle, AlertCircle, PartyPopper, ShieldCheck,
  Users, UserCheck, Building2, Paperclip, BookMarked, ClipboardList, Scale
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import StudentDisciplineView from '../components/eleve/StudentDisciplineView';
import StudentOverviewTab from '../components/eleve/StudentOverviewTab';
import StudentProfileTab from '../components/eleve/StudentProfileTab';
import StudentPortfolioTab from '../components/eleve/StudentPortfolioTab';
import StudentGradesTab from '../components/eleve/StudentGradesTab';
import StudentSimulatorTab from '../components/eleve/StudentSimulatorTab';
import StudentEvolutionTab from '../components/eleve/StudentEvolutionTab';
import StudentScheduleTab from '../components/eleve/StudentScheduleTab';
import StudentExamsTab from '../components/eleve/StudentExamsTab';
import StudentMessagesTab from '../components/eleve/StudentMessagesTab';
import StudentAIAssistantTab from '../components/eleve/StudentAIAssistantTab';
import StudentAttestationTab from '../components/eleve/StudentAttestationTab';
import StudentCahierTexteTab from '../components/eleve/StudentCahierTexteTab';
import { StudentSidebar, StudentMobileDrawer } from '../components/eleve/StudentSidebar';
import StudentTopbar from '../components/eleve/StudentTopbar';
import './StudentDashboard.css';

const API_BASE_URL = '/api';

const normalizeNotesData = (rawNotes) => {
  if (!rawNotes || typeof rawNotes !== 'object') return {};
  const normalized = {};
  Object.keys(rawNotes).forEach(year => {
    normalized[year] = {
      ...rawNotes[year],
      periodes: {}
    };
    if (rawNotes[year]?.periodes) {
      Object.keys(rawNotes[year].periodes).forEach(periodKey => {
        const cleanKey = periodKey.replace(/Trimestre/gi, 'Semestre');
        normalized[year].periodes[cleanKey] = rawNotes[year].periodes[periodKey];
      });
    }
  });
  return normalized;
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { tab = 'overview' } = useParams();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Network & Sync state
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [offlineChanges, setOfflineChanges] = useState([]);

  // Data states
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [cvData, setCvData] = useState(null);
  const [notes, setNotes] = useState({});
  const [evolution, setEvolution] = useState([]);
  const [schedule, setSchedule] = useState({ timetable: [], exams: [] });
  const [examResults, setExamResults] = useState({ eleve: null, resultats: [] });
  const [documents, setDocuments] = useState({ bulletins: [], attestationDisponible: true });
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cahier de Texte states
  const [cahierEntries, setCahierEntries] = useState([]);
  const [cahierLoading, setCahierLoading] = useState(false);
  const [cahierSubTab, setCahierSubTab] = useState('cours');

  // Form & filter states
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState('TOUS');
  const [newPortfolio, setNewPortfolio] = useState({
    type: 'PROJET',
    titre: '',
    description: '',
    annee_scolaire: '2025-2026',
    date_realisation: new Date().toISOString().split('T')[0]
  });
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);

  // Grade selectors & filter state
  const [selectedGradeYear, setSelectedGradeYear] = useState('');
  const [selectedGradePeriod, setSelectedGradePeriod] = useState('');

  // Grade simulator state
  const [selectedSimPeriod, setSelectedSimPeriod] = useState('');
  const [simulatedGrades, setSimulatedGrades] = useState({});

  // AI Assistant states
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', text: 'Bonjour ! Je suis votre Assistant Pédagogique IA. Je peux analyser vos notes, vous proposer des méthodes de révision adaptées et vous guider pour votre orientation post-BAC au Sénégal.' }
  ]);
  const [aiInput, setAiInput] = useState('');

  // Attestation states
  const [attestationHistory, setAttestationHistory] = useState([]);
  const [attestationMotif, setAttestationMotif] = useState('');
  const [attestationSubmitting, setAttestationSubmitting] = useState(false);

  // Popup modal (centered — success confirmations)
  const [popup, setPopup] = useState(null); // { title, message }
  const showPopup = (title, message) => setPopup({ title, message });
  const closePopup = () => setPopup(null);

  // Messaging / Chat states
  const [chatChannelInfo, setChatChannelInfo] = useState(null); // { admin, classe, teachers }
  const [activeChatTarget, setActiveChatTarget] = useState(null); // { type, target_id, title, sub, badge }
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const chatEndRef = React.useRef(null);


  // Corner toast (errors / info)
  const [toast, setToast] = useState(null); // { message, type: 'error'|'info' }
  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Handle network state change
  useEffect(() => {
    const goOnline = () => {
      setIsOffline(false);
      triggerSync();
    };
    const goOffline = () => setIsOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Fetch all data
  const fetchData = async (forceSync = false) => {
    if (!token) {
      navigate('/auth');
      return;
    }

    if (navigator.onLine && !isOffline) {
      if (forceSync) setSyncing(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Profile
        const profRes = await fetch(`${API_BASE_URL}/eleve-portal/profile`, { headers });
        if (profRes.status === 401) { logout(); return; }
        const profileData = await profRes.json();
        setProfile(profileData);
        localStorage.setItem('cached_profile', JSON.stringify(profileData));

        // Fetch Portfolio
        const portRes = await fetch(`${API_BASE_URL}/eleve-portal/portfolio`, { headers });
        const portfolioData = await portRes.json();
        setPortfolio(portfolioData);
        localStorage.setItem('cached_portfolio', JSON.stringify(portfolioData));

        // Fetch CV
        const cvRes = await fetch(`${API_BASE_URL}/eleve-portal/cv`, { headers });
        const cvDataFetched = await cvRes.json();
        setCvData(cvDataFetched);
        localStorage.setItem('cached_cv', JSON.stringify(cvDataFetched));

        // Fetch Notes
        const notesRes = await fetch(`${API_BASE_URL}/eleve-portal/notes`, { headers });
        const rawNotesData = await notesRes.json();
        const notesData = normalizeNotesData(rawNotesData);
        setNotes(notesData);
        localStorage.setItem('cached_notes', JSON.stringify(notesData));
        
        // Pick default simulation period
        if (notesData && Object.keys(notesData).length > 0) {
          const latestYear = Object.keys(notesData)[0];
          const latestPeriods = Object.keys(notesData[latestYear].periodes);
          if (latestPeriods.length > 0) {
            setSelectedSimPeriod(`${latestYear}::${latestPeriods[0]}`);
          }
        }

        // Fetch Evolution
        const evoRes = await fetch(`${API_BASE_URL}/eleve-portal/notes-evolution`, { headers });
        const evoData = await evoRes.json();
        setEvolution(evoData);
        localStorage.setItem('cached_evolution', JSON.stringify(evoData));

        // Fetch Schedule
        const schedRes = await fetch(`${API_BASE_URL}/eleve-portal/schedule`, { headers });
        const schedData = await schedRes.json();
        setSchedule(schedData);
        localStorage.setItem('cached_schedule', JSON.stringify(schedData));

        // Fetch Exam Results (Portail BAC/BFEM)
        const examRes = await fetch(`${API_BASE_URL}/eleve-portal/exam-results`, { headers });
        const examData = await examRes.json();
        // Support both legacy array format and new { eleve, resultats } format
        const normalizedExamData = Array.isArray(examData)
          ? { eleve: null, resultats: examData }
          : examData;
        setExamResults(normalizedExamData);
        localStorage.setItem('cached_examResults', JSON.stringify(normalizedExamData));

        // Fetch Documents
        const docRes = await fetch(`${API_BASE_URL}/eleve-portal/documents`, { headers });
        const docData = await docRes.json();
        setDocuments(docData);
        localStorage.setItem('cached_documents', JSON.stringify(docData));

        // Fetch Notifications
        const notifRes = await fetch(`${API_BASE_URL}/eleve-portal/notifications`, { headers });
        const notifData = await notifRes.json();
        setNotifications(notifData);
        localStorage.setItem('cached_notifications', JSON.stringify(notifData));

        // Fetch Messages
        const msgRes = await fetch(`${API_BASE_URL}/eleve-portal/messages`, { headers });
        const msgData = await msgRes.json();
        setMessages(msgData);
        localStorage.setItem('cached_messages', JSON.stringify(msgData));

        // Fetch Absences
        const absRes = await fetch(`${API_BASE_URL}/eleve-portal/absences`, { headers });
        const absData = await absRes.json();
        setAbsences(absData);
        localStorage.setItem('cached_absences', JSON.stringify(absData));

        // Fetch Attestation History
        const attRes = await fetch(`${API_BASE_URL}/eleve-portal/attestations/history`, { headers });
        if (attRes.ok) {
          const attData = await attRes.json();
          setAttestationHistory(attData);
        }

      } catch (err) {
        console.error('Error fetching online data, switching to offline cache:', err);
        loadFromCache();
      } finally {
        setSyncing(false);
      }
    } else {
      loadFromCache();
    }
  };

  const loadFromCache = () => {
    setIsOffline(true);
    setProfile(JSON.parse(localStorage.getItem('cached_profile') || 'null'));
    setPortfolio(JSON.parse(localStorage.getItem('cached_portfolio') || '[]'));
    setCvData(JSON.parse(localStorage.getItem('cached_cv') || 'null'));
    
    const rawNotesData = JSON.parse(localStorage.getItem('cached_notes') || '{}');
    const notesData = normalizeNotesData(rawNotesData);
    setNotes(notesData);
    if (notesData && Object.keys(notesData).length > 0) {
      const latestYear = Object.keys(notesData)[0];
      const latestPeriods = Object.keys(notesData[latestYear].periodes);
      if (latestPeriods.length > 0) {
        setSelectedSimPeriod(`${latestYear}::${latestPeriods[0]}`);
      }
    }

    setEvolution(JSON.parse(localStorage.getItem('cached_evolution') || '[]'));
    setSchedule(JSON.parse(localStorage.getItem('cached_schedule') || '{"timetable":[],"exams":[]}'));
    const cachedExam = JSON.parse(localStorage.getItem('cached_examResults') || 'null');
    setExamResults(cachedExam && !Array.isArray(cachedExam) ? cachedExam : { eleve: null, resultats: [] });
    setDocuments(JSON.parse(localStorage.getItem('cached_documents') || '{"bulletins":[],"attestationDisponible":true}'));
    setNotifications(JSON.parse(localStorage.getItem('cached_notifications') || '[]'));
    setMessages(JSON.parse(localStorage.getItem('cached_messages') || '[]'));
    setAbsences(JSON.parse(localStorage.getItem('cached_absences') || '[]'));
  };

  const triggerSync = async () => {
    setSyncing(true);
    await fetchData();
    // Process offline changes if any (simulated for portfolio additions)
    const storedOffline = JSON.parse(localStorage.getItem('offline_portfolio_adds') || '[]');
    if (storedOffline.length > 0 && navigator.onLine) {
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      for (const item of storedOffline) {
        try {
          await fetch(`${API_BASE_URL}/eleve-portal/portfolio`, {
            method: 'POST',
            headers,
            body: JSON.stringify(item)
          });
        } catch (e) {
          console.error('Error syncing offline item:', e);
        }
      }
      localStorage.removeItem('offline_portfolio_adds');
      setOfflineChanges([]);
      await fetchData(); // refresh
    }
    setSyncing(false);
  };

  useEffect(() => {
    fetchData();
    const offlineItems = JSON.parse(localStorage.getItem('offline_portfolio_adds') || '[]');
    setOfflineChanges(offlineItems);
    if (tab === 'messages') {
      fetchChatChannel();
    }
  }, [tab]);


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  // === MESSAGING FUNCTIONS ===
  const fetchChatChannel = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/channels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatChannelInfo(data);
        // Default active target to Class channel if available, or Admin
        if (!activeChatTarget) {
          if (data.classe) {
            const defaultTarget = {
              type: 'CLASSE',
              target_id: data.classe.classe_id,
              title: `Canal de Groupe ${data.classe.classe_nom}`,
              sub: `Discussion de la classe • ${data.classe.annee_scolaire}`,
              badge: 'Groupe'
            };
            setActiveChatTarget(defaultTarget);
            await fetchChatHistory(defaultTarget);
          } else if (data.admin) {
            const defaultTarget = {
              type: 'ADMIN',
              target_id: data.admin.admin_user_id,
              etablissement_id: data.admin.etablissement_id,
              title: data.admin.etablissement_nom,
              sub: "Administration de l'établissement",
              badge: 'Admin'
            };
            setActiveChatTarget(defaultTarget);
            await fetchChatHistory(defaultTarget);
          }
        }
      }
    } catch (err) { console.error(err); }
  };

  const fetchChatHistory = async (target) => {
    if (!target) return;
    setChatLoading(true);
    try {
      if (target.type === 'BROADCAST') {
        setChatHistory([]);
        setChatLoading(false);
        return;
      }

      const params = new URLSearchParams({
        type: target.type,
        target_id: target.target_id
      });
      if (target.etablissement_id) {
        params.append('etablissement_id', target.etablissement_id);
      }

      const res = await fetch(`${API_BASE_URL}/messages/history?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) { console.error(err); } finally { setChatLoading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showToast('Le fichier ne doit pas dépasser 15 Mo.', 'error');
      return;
    }
    setUploadingFile(true);
    const formData = new FormData();
    formData.append('fichier', file);

    try {
      const res = await fetch(`${API_BASE_URL}/messages/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedFile(data);
      } else {
        const err = await res.json();
        showToast(err.message || 'Erreur lors du téléchargement du fichier.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l\'envoi du fichier.', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if ((!chatInput.trim() && !selectedFile) || !activeChatTarget) return;

    let payload = {
      sujet: 'Message élève',
      contenu: chatInput || (selectedFile ? `[Fichier joint: ${selectedFile.fichier_nom}]` : ''),
      fichier_url: selectedFile?.fichier_url || null,
      fichier_nom: selectedFile?.fichier_nom || null
    };

    if (activeChatTarget.type === 'ADMIN') {
      payload.destinataire_type = 'ADMIN_ETABLISSEMENT';
      payload.destinataire_id = activeChatTarget.etablissement_id;
      payload.etablissement_id = activeChatTarget.etablissement_id;
    } else if (activeChatTarget.type === 'CLASSE') {
      payload.destinataire_type = 'CLASSE';
      payload.destinataire_id = activeChatTarget.target_id;
    } else if (activeChatTarget.type === 'PROFESSEUR') {
      payload.destinataire_type = 'PROFESSEUR';
      payload.destinataire_id = activeChatTarget.target_id;
    } else {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setChatInput('');
        setSelectedFile(null);
        fetchChatHistory(activeChatTarget);
      } else {
        const errData = await res.json();
        showToast(errData.message || "Erreur lors de l'envoi.", 'error');
      }
    } catch (err) { console.error(err); }
  };



  // Refresh attestation history
  const refreshAttestationHistory = async () => {
    try {
      const attRes = await fetch(`${API_BASE_URL}/eleve-portal/attestations/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (attRes.ok) {
        const attData = await attRes.json();
        setAttestationHistory(attData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit attestation request
  const handleSubmitAttestationRequest = async (e) => {
    e.preventDefault();
    setAttestationSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/eleve-portal/attestations/request`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motif_demande: attestationMotif })
      });
      const data = await res.json();
      if (res.ok) {
        setAttestationMotif('');
        // Refresh history
        await refreshAttestationHistory();
        showPopup(
          'Demande envoyée !',
          'Votre demande d\'attestation a bien été transmise à votre établissement. Vous serez notifié dès qu\'une décision est prise.'
        );
      } else {
        showToast(data.message || 'Erreur lors de la soumission de la demande.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur réseau. Veuillez réessayer.', 'error');
    } finally {
      setAttestationSubmitting(false);
    }
  };

  // Add portfolio item
  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (isOffline) {
      // Offline mode - cache change locally
      const pendingItem = {
        ...newPortfolio,
        id: 'offline-' + Date.now(),
        eleve_id: profile?.id
      };
      const updatedOffline = [...offlineChanges, pendingItem];
      localStorage.setItem('offline_portfolio_adds', JSON.stringify(updatedOffline));
      setOfflineChanges(updatedOffline);
      setPortfolio([pendingItem, ...portfolio]);
      setIsAddingPortfolio(false);
      alert('Mode hors-ligne : votre projet est enregistré localement et sera synchronisé dès le retour de la connexion.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/eleve-portal/portfolio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPortfolio)
      });
      if (response.ok) {
        setNewPortfolio({
          type: 'PROJET',
          titre: '',
          description: '',
          annee_scolaire: '2025-2026',
          date_realisation: new Date().toISOString().split('T')[0]
        });
        setIsAddingPortfolio(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete portfolio item
  const handleDeletePortfolio = async (id) => {
    if (id.toString().startsWith('offline-')) {
      const updatedOffline = offlineChanges.filter(item => item.id !== id);
      localStorage.setItem('offline_portfolio_adds', JSON.stringify(updatedOffline));
      setOfflineChanges(updatedOffline);
      setPortfolio(portfolio.filter(item => item.id !== id));
      return;
    }

    if (isOffline) {
      alert('Impossible de supprimer un élément en ligne pendant que vous êtes hors-ligne.');
      return;
    }

    if (window.confirm('Voulez-vous vraiment supprimer cet élément ?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/eleve-portal/portfolio/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Fetch Cahier de texte élève
  const fetchCahierEleve = async () => {
    setCahierLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cahier-texte/eleve`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCahierEntries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erreur chargement cahier de texte élève:', err);
    } finally {
      setCahierLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'cahier-texte') {
      fetchCahierEleve();
    }
  }, [tab]);

  // Read notifications
  const handleMarkNotificationsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, lu: true })));
    try {
      await fetch(`${API_BASE_URL}/eleve-portal/notifications/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to mark read on server:', err);
    }
  };

  // Initialize simulated grades on period select
  useEffect(() => {
    if (!selectedSimPeriod || !notes) return;
    const [year, period] = selectedSimPeriod.split('::');
    const periodData = notes[year]?.periodes[period];
    if (periodData) {
      const initialSims = {};
      Object.keys(periodData.matieres).forEach(code => {
        initialSims[code] = periodData.matieres[code].moyenne || 10;
      });
      setSimulatedGrades(initialSims);
    }
  }, [selectedSimPeriod, notes]);

  const handleSimGradeChange = (code, value) => {
    const val = parseFloat(value);
    setSimulatedGrades({
      ...simulatedGrades,
      [code]: isNaN(val) ? 0 : Math.min(20, Math.max(0, val))
    });
  };

  // Recalculate simulated overall average
  const getSimulatedAverage = () => {
    if (!selectedSimPeriod || !notes) return 0;
    const [year, period] = selectedSimPeriod.split('::');
    const periodData = notes[year]?.periodes[period];
    if (!periodData) return 0;

    let totalPoints = 0;
    let totalCoeff = 0;

    Object.keys(periodData.matieres).forEach(code => {
      const coeff = periodData.matieres[code].coefficient;
      const simVal = simulatedGrades[code] !== undefined ? simulatedGrades[code] : (periodData.matieres[code].moyenne || 10);
      totalPoints += simVal * coeff;
      totalCoeff += coeff;
    });

    return totalCoeff > 0 ? (totalPoints / totalCoeff).toFixed(2) : 0;
  };

  // Passage check rules
  const getPassageStatusText = (avg) => {
    const average = parseFloat(avg);
    if (average >= 10) return { text: 'Passage accordé ! (Moyenne ≥ 10/20)', color: 'text-emerald' };
    if (average >= 8) return { text: 'Cours de vacances requis. (Moyenne entre 8 et 10/20)', color: 'text-orange' };
    return { text: 'Redoublement de classe recommandé. (Moyenne < 8/20)', color: 'text-red' };
  };

  // --- RENDERING DES ABSENCES TYPE GITHUB ---
  const generateCalendarData = () => {
    const data = [];
    const today = new Date('2026-06-29'); // Date fixe pour correspondre à l'année scolaire en cours
    
    // Reculer de 364 jours (52 semaines)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    
    // Aligner sur le lundi précédent
    const startDay = startDate.getDay();
    const offset = startDay === 0 ? 6 : startDay - 1;
    startDate.setDate(startDate.getDate() - offset);
    
    const tempDate = new Date(startDate);
    while (tempDate <= today) {
      const dateStr = tempDate.toISOString().split('T')[0];
      const abs = absences.find(a => {
        const aDate = new Date(a.date_absence).toISOString().split('T')[0];
        return aDate === dateStr;
      });
      
      data.push({
        date: dateStr,
        dayOfWeek: tempDate.getDay(),
        month: tempDate.getMonth(),
        hours: abs ? abs.heures_absent : 0,
        justified: abs ? abs.justifiee : false,
        type: abs ? abs.type_presence : null,
        delay: abs ? abs.duree_retard : 0,
        motif: abs ? abs.motif : null,
        subject: abs ? abs.matiere_nom : null
      });
      
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return data;
  };

  const getAbsenceColorClass = (hours, type) => {
    if (hours === 0 && !type) return 'cell-empty';
    if (type === 'RETARD') return 'cell-delay';
    if (hours <= 2) return 'cell-level-1'; // rouge clair
    if (hours <= 4) return 'cell-level-2'; // rouge moyen
    if (hours <= 6) return 'cell-level-3'; // rouge vif
    return 'cell-level-4'; // rouge foncé
  };

  const renderAbsenceCalendar = () => {
    const calendarData = generateCalendarData();
    const weeks = [];
    let currentWeek = [];

    calendarData.forEach((day, index) => {
      const orderedDayIndex = day.dayOfWeek === 0 ? 6 : day.dayOfWeek - 1;
      currentWeek[orderedDayIndex] = day;

      if (orderedDayIndex === 6 || index === calendarData.length - 1) {
        for (let i = 0; i < 7; i++) {
          if (!currentWeek[i]) {
            currentWeek[i] = { date: '', hours: 0, dayOfWeek: i === 6 ? 0 : i + 1 };
          }
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const monthHeaders = [];
    let lastMonth = -1;

    weeks.forEach((week, wIdx) => {
      const firstValidDay = week.find(d => d.date);
      if (firstValidDay) {
        const m = new Date(firstValidDay.date).getMonth();
        if (m !== lastMonth) {
          monthHeaders.push({ label: monthNames[m], index: wIdx });
          lastMonth = m;
        }
      }
    });

    const totalAbsenceHours = absences.reduce((sum, a) => sum + a.heures_absent, 0);

    return (
      <div className="absence-heatmap-card">
        <div className="heatmap-header">
          <h3>Présence & Assiduité</h3>
          <p className="subtitle">{totalAbsenceHours} heures de cours manquées sur les 12 derniers mois</p>
        </div>

        <div className="heatmap-container">
          <div className="heatmap-grid-layout">
            <div className="days-y-labels">
              <span>Lun</span>
              <span>Mer</span>
              <span>Ven</span>
            </div>

            <div className="heatmap-weeks-columns">
              <div className="month-headers">
                {monthHeaders.map((header, idx) => (
                  <span 
                    key={idx} 
                    className="month-label" 
                    style={{ left: `${header.index * 13}px` }}
                  >
                    {header.label}
                  </span>
                ))}
              </div>

              <div className="columns-wrapper">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="week-column">
                    {week.map((day, dIdx) => (
                      <div 
                        key={dIdx} 
                        className={`heatmap-cell ${day.date ? getAbsenceColorClass(day.hours, day.type) : 'cell-empty'}`}
                      >
                        {day.date && (
                          <span className="cell-tooltip">
                            {new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}<br/>
                            {day.hours > 0 || day.type === 'RETARD' ? (
                              day.type === 'RETARD'
                                ? `⏱️ Retard de ${day.delay} min en ${day.subject || 'cours'}${day.motif ? ` (${day.motif})` : ''}`
                                : `❌ Absence de ${day.hours}h en ${day.subject || 'cours'} (${day.justified ? 'Justifiée' : 'Non justifiée'})${day.motif ? ` - ${day.motif}` : ''}`
                            ) : 'Présence complète'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="heatmap-footer">
          <span>Découvrez comment nous comptabilisons les contributions d'assiduité</span>
          <div className="heatmap-legend">
            <span>Moins</span>
            <div className="legend-square cell-empty"></div>
            <div className="legend-square cell-level-1"></div>
            <div className="legend-square cell-level-2"></div>
            <div className="legend-square cell-level-3"></div>
            <div className="legend-square cell-level-4"></div>
            <span>Plus</span>
          </div>
        </div>
      </div>
    );
  };

  // AI Chat send message
  const handleSendAi = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = { role: 'user', text: aiInput };
    setAiChat(prev => [...prev, userMsg]);
    setAiInput('');

    // Generate AI response mock based on student profile and grades
    setTimeout(() => {
      let aiResp = '';
      const textLower = userMsg.text.toLowerCase();

      if (textLower.includes('note') || textLower.includes('bulletin') || textLower.includes('moyenne')) {
        let bestSubj = '';
        let worstSubj = '';
        let bestVal = 0;
        let worstVal = 20;

        // Analyze grades
        if (notes && Object.keys(notes).length > 0) {
          const year = Object.keys(notes)[0];
          const periods = Object.keys(notes[year].periodes);
          if (periods.length > 0) {
            const matieresObj = notes[year].periodes[periods[0]].matieres;
            Object.keys(matieresObj).forEach(code => {
              const mVal = matieresObj[code].moyenne;
              if (mVal !== null) {
                if (mVal > bestVal) { bestVal = mVal; bestSubj = matieresObj[code].nom; }
                if (mVal < worstVal) { worstVal = mVal; worstSubj = matieresObj[code].nom; }
              }
            });
          }
        }

        if (bestSubj) {
          aiResp = `D'après vos notes récentes, vous excellez en **${bestSubj}** avec une moyenne de **${bestVal}/20**. C'est un excellent point fort ! En revanche, votre matière la plus faible semble être le **${worstSubj}** avec **${worstVal}/20**. Je vous conseille de consacrer 30 minutes de révision supplémentaires par jour à cette matière en utilisant des fiches de synthèse.`;
        } else {
          aiResp = "Je n'ai pas trouvé de notes récentes dans votre livret scolaire pour faire une analyse. Mais d'une manière générale, je vous conseille de réviser régulièrement les matières scientifiques (Maths, PC) qui ont des coefficients élevés au Sénégal.";
        }
      } else if (textLower.includes('orientation') || textLower.includes('université') || textLower.includes('bac') || textLower.includes('métier')) {
        aiResp = "Pour votre orientation au Sénégal :\n- Si vous êtes en série **S (S1/S2)**, les écoles d'ingénieurs comme l'**ESP** (Dakar), l'**EPT** (Thiès) ou les filières informatiques/mathématiques de l'**UGB** et de l'**UCAD** sont d'excellents choix.\n- Si vous êtes en série **L**, l'**ENAM** ou les facultés de Droit (UCAD) et de Lettres vous offriront de superbes débouchés.\nPensez également aux filières émergentes en agro-écologie et énergies renouvelables à l'**USSEIN** de Kaolack.";
      } else if (textLower.includes('planning') || textLower.includes('examen') || textLower.includes('réviser')) {
        aiResp = "Voici ma méthode de révision recommandée (la méthode Pomodoro) :\n1. Travaillez concentré pendant 25 minutes.\n2. Prenez 5 minutes de pause.\n3. Répétez 4 fois, puis prenez une pause de 20 minutes.\nFaites des fiches pour les matières à formule (Physique, Maths) et apprenez les plans de cours en Histoire-Géographie.";
      } else {
        aiResp = `Intéressant ! Pour réussir au mieux votre année académique en classe de ${profile?.classe_nom || 'lycée'}, restez régulier. N'hésitez pas à me demander des recommandations sur vos notes, sur les universités sénégalaises (UCAD, UGB, USSEIN) ou comment simuler vos moyennes pour le BAC.`;
      }

      setAiChat(prev => [...prev, { role: 'assistant', text: aiResp }]);
    }, 1000);
  };

  const currentYearNotes = notes && Object.keys(notes).length > 0 ? notes[Object.keys(notes)[0]] : null;
  const currentPeriodKey = currentYearNotes ? Object.keys(currentYearNotes.periodes)[0] : '';
  const currentPeriod = currentYearNotes && currentPeriodKey ? currentYearNotes.periodes[currentPeriodKey] : null;

  const filteredPortfolio = portfolioCategoryFilter === 'TOUS' 
    ? portfolio 
    : (portfolio || []).filter(item => item.type === portfolioCategoryFilter);

  const getCategoryBadgeClass = (type) => {
    switch (type) {
      case 'PROJET': return 'cat-badge-projet';
      case 'SPORT': return 'cat-badge-sport';
      case 'ART': return 'cat-badge-art';
      default: return 'cat-badge-autre';
    }
  };

  const renderPortfolioTab = () => {

    const getCategoryLabel = (type) => {
      switch (type) {
        case 'PROJET': return 'Projet Tech/Scientifique';
        case 'SPORT': return 'Activité Sportive';
        case 'ART': return 'Art & Culture';
        default: return 'Engagement / Autre';
      }
    };

    return (
      <div className="tab-pane">
        
        {/* Top Hero Banner */}
        <div className="portfolio-hero-banner card-box">
          <div className="portfolio-hero-left">
            <div className="portfolio-hero-title-group">
              <h2>Mon Portfolio & CV Numérique Certifié</h2>
              <span className="men-official-tag"><ShieldCheck size={14} /> Certifié MEN Sénégal</span>
            </div>
            <p className="portfolio-hero-desc">
              Consultez votre livret officiel, valorisez vos compétences extra-scolaires et constituez un dossier d'excellence pour vos choix d'orientation post-BAC.
            </p>
          </div>

          <div className="portfolio-hero-actions">
            <button className="secondary-btn print-cv-btn" onClick={() => window.print()}>
              <Printer size={16} /> Imprimer le CV Officiel
            </button>
            {!isAddingPortfolio && (
              <button className="primary-btn add-activity-btn" onClick={() => setIsAddingPortfolio(true)}>
                <Plus size={16} /> Ajouter une activité
              </button>
            )}
          </div>
        </div>

        <div className="portfolio-cv-layout">
          {/* Official Printable CV Document */}
          <div className="cv-container card-box printable-cv">
            
            {/* Top Official Seal & Header */}
            <div className="cv-header-official">
              <div className="cv-republic-header">
                <div className="senegal-flag-icon">🇸🇳</div>
                <div>
                  <h4 className="rep-heading">RÉPUBLIQUE DU SÉNÉGAL</h4>
                  <p className="rep-motto">Un Peuple - Un But - Une Foi</p>
                  <p className="rep-ministry">Ministère de l'Éducation Nationale • Office du Baccalauréat</p>
                </div>
              </div>

              <div className="cv-doc-badge">
                <span className="doc-title">LIVRET NUMÉRIQUE ÉVOLUTIF</span>
                <span className="doc-sub">Parcours Scolaire Certifié</span>
                <span className="doc-id">N° {profile?.identifiant_national || 'SN-2026-BAC'}</span>
              </div>

              <div className="cv-qr-stamp">
                <div className="qr-box-inner">
                  <ShieldCheck size={24} className="qr-shield" />
                  <span>VÉRIFIÉ</span>
                </div>
                <small className="qr-label">QR Authentification</small>
              </div>
            </div>

            <div className="cv-gold-divider"></div>

            {/* Student Identity Header */}
            <div className="cv-identity-banner">
              <div className="cv-photo-frame">
                {profile?.photo_url ? (
                  <img src={`${profile.photo_url}`} alt="Photo d'identité" className="cv-photo-img" />
                ) : (
                  <div className="cv-photo-fallback">
                    {profile ? `${profile.prenom[0]}${profile.nom[0]}` : 'EL'}
                  </div>
                )}
                <span className="cv-photo-cert-tag"><CheckCircle2 size={11} /> Photo Certifiée</span>
              </div>

              <div className="cv-identity-details">
                <div className="cv-name-row">
                  <h2>{profile?.prenom} {profile?.nom}</h2>
                  <span className="cv-id-pill">ID National : <strong>{profile?.identifiant_national || '---'}</strong></span>
                </div>

                <div className="cv-meta-grid">
                  <div className="cv-meta-col">
                    <span className="meta-lbl">Date de naissance :</span>
                    <span className="meta-val">{profile?.date_naissance ? new Date(profile.date_naissance).toLocaleDateString('fr-FR') : 'Non renseigné'}</span>
                  </div>
                  <div className="cv-meta-col">
                    <span className="meta-lbl">Lieu de naissance :</span>
                    <span className="meta-val">{profile?.lieu_naissance || 'Non précisé'}</span>
                  </div>
                  <div className="cv-meta-col">
                    <span className="meta-lbl">Nationalité :</span>
                    <span className="meta-val">{profile?.nationalite || 'Sénégalaise'}</span>
                  </div>
                  <div className="cv-meta-col">
                    <span className="meta-lbl">Établissement & Classe :</span>
                    <span className="meta-val"><strong>{profile?.etablissement_nom || 'Lycée'}</strong> — {profile?.classe_nom || 'Classe'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CV Sections */}
            <div className="cv-sections-container">
              
              {/* Parcours Académique */}
              <div className="cv-section-box">
                <div className="cv-section-header">
                  <div className="icon-wrap"><GraduationCap size={16} /></div>
                  <h3>PARCOURS ACADÉMIQUE</h3>
                  <div className="header-line"></div>
                </div>

                {cvData?.parcours && cvData.parcours.length > 0 ? (
                  <div className="cv-timeline">
                    {cvData.parcours.map((p, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-body">
                          <div className="timeline-header">
                            <span className="timeline-year">{p.annee_scolaire}</span>
                            <strong className="timeline-class">Classe de {p.classe_nom}</strong>
                          </div>
                          <p className="timeline-school"><MapPin size={12} /> {p.etablissement_nom}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="cv-empty-text">Aucun historique de classe enregistré dans le livret.</p>
                )}
              </div>

              {/* Projets & Activités Extra-Scolaires */}
              <div className="cv-section-box mt-6">
                <div className="cv-section-header">
                  <div className="icon-wrap"><Award size={16} /></div>
                  <h3>PROJETS & ACTIVITÉS EXTRA-SCOLAIRES</h3>
                  <div className="header-line"></div>
                </div>

                {portfolio.length > 0 ? (
                  <div className="cv-activities-list">
                    {portfolio.map(item => (
                      <div key={item.id} className="cv-activity-card">
                        <div className="activity-card-top">
                          <span className={`activity-type-badge ${getCategoryBadgeClass(item.type)}`}>
                            {getCategoryLabel(item.type)}
                          </span>
                          <span className="activity-date">
                            {item.annee_scolaire} • {new Date(item.date_realisation).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h4>{item.titre}</h4>
                        <p>{item.description}</p>
                        {item.id.toString().startsWith('offline-') && (
                          <span className="offline-indicator-tag"><WifiOff size={10} /> En attente de sync</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="cv-empty-text">Aucune activité ajoutée pour le moment. Utilisez le formulaire pour enrichir votre portfolio.</p>
                )}
              </div>

              {/* Examens Nationaux */}
              {cvData?.examens && cvData.examens.length > 0 && (
                <div className="cv-section-box mt-6">
                  <div className="cv-section-header">
                    <div className="icon-wrap"><AwardIcon size={16} /></div>
                    <h3>DIPLÔMES & EXAMENS NATIONAUX</h3>
                    <div className="header-line"></div>
                  </div>
                  <div className="cv-exams-list">
                    {cvData.examens.map((ex, idx) => (
                      <div key={idx} className="cv-exam-badge">
                        <div className="exam-icon-flag">🇸🇳</div>
                        <div className="exam-details">
                          <strong>{ex.type_examen} (Session {ex.annee})</strong>
                          <span>Moyenne : <strong>{ex.moyenne}/20</strong> • Mention : <strong>{ex.mention}</strong></span>
                        </div>
                        <span className="exam-status-pill">{ex.statut_resultat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Document Bottom Footer */}
            <div className="cv-doc-footer">
              <div className="footer-stamp">
                <ShieldCheck size={14} /> Document extrait du Livret Scolaire Numérique National (LeralScolaire MEN).
              </div>
              <div className="footer-date">Généré le {new Date().toLocaleDateString('fr-FR')}</div>
            </div>

          </div>

          {/* Portfolio Manager Sidebar */}
          <div className="portfolio-manager card-box">
            <div className="pm-top-header">
              <div>
                <h3>Gestion du Portfolio</h3>
                <p className="subtitle">Enrichissez votre livret avec vos réalisations.</p>
              </div>
              <div className="pm-count-tag">
                <strong>{portfolio.length}</strong> {portfolio.length > 1 ? 'activités' : 'activité'}
              </div>
            </div>

            {/* Add Activity Form or Add Trigger */}
            {isAddingPortfolio ? (
              <div className="pm-form-box">
                <div className="pm-form-header">
                  <h4><Plus size={16} /> Nouvelle réalisation</h4>
                  <button className="close-btn" onClick={() => setIsAddingPortfolio(false)} title="Fermer">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddPortfolio} className="sd-form">
                  <div className="form-group">
                    <label>Catégorie</label>
                    <div className="category-pills-group">
                      {[
                        { key: 'PROJET', label: 'Projet Tech/Scientifique', icon: Sparkles },
                        { key: 'SPORT', label: 'Sport', icon: Activity },
                        { key: 'ART', label: 'Art & Culture', icon: PartyPopper },
                        { key: 'AUTRE', label: 'Engagement / Autre', icon: Award }
                      ].map(cat => {
                        const IconComp = cat.icon;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            className={`cat-pill-option ${newPortfolio.type === cat.key ? 'active' : ''}`}
                            onClick={() => setNewPortfolio({ ...newPortfolio, type: cat.key })}
                          >
                            <IconComp size={13} />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Titre de la réalisation</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: Robot suiveur de ligne, Capitaine de l'équipe..."
                      value={newPortfolio.titre}
                      onChange={e => setNewPortfolio({ ...newPortfolio, titre: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description & compétences</label>
                    <textarea 
                      required 
                      rows={3}
                      placeholder="Décrivez ce que vous avez accompli, les compétences développées..."
                      value={newPortfolio.description}
                      onChange={e => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Année scolaire</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: 2025-2026"
                        value={newPortfolio.annee_scolaire}
                        onChange={e => setNewPortfolio({ ...newPortfolio, annee_scolaire: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date de réalisation</label>
                      <input 
                        type="date" 
                        required 
                        value={newPortfolio.date_realisation}
                        onChange={e => setNewPortfolio({ ...newPortfolio, date_realisation: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="primary-btn w-full">Enregistrer</button>
                    <button type="button" className="secondary-btn w-full" onClick={() => setIsAddingPortfolio(false)}>Annuler</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="pm-add-trigger">
                <button className="primary-btn w-full add-activity-main-btn" onClick={() => setIsAddingPortfolio(true)}>
                  <Plus size={18} /> Ajouter une activité/projet
                </button>
              </div>
            )}

            {/* Existing portfolio items */}
            <div className="pm-list-container mt-6">
              <div className="pm-list-title-row">
                <h4>Mes éléments ({portfolio.length})</h4>
                {portfolio.length > 0 && (
                  <div className="pm-filter-pills">
                    {['TOUS', 'PROJET', 'SPORT', 'ART'].map(cat => (
                      <button
                        key={cat}
                        className={`pm-filter-pill ${portfolioCategoryFilter === cat ? 'active' : ''}`}
                        onClick={() => setPortfolioCategoryFilter(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {filteredPortfolio.length > 0 ? (
                <div className="pm-items-grid">
                  {filteredPortfolio.map(item => (
                    <div key={item.id} className="pm-card-item">
                      <div className="pm-card-header">
                        <span className={`activity-type-badge ${getCategoryBadgeClass(item.type)}`}>
                          {item.type}
                        </span>
                        <button className="delete-btn-mini" onClick={() => handleDeletePortfolio(item.id)} title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h5>{item.titre}</h5>
                      <p>{item.description}</p>
                      <div className="pm-card-footer">
                        <span className="pm-year-tag">{item.annee_scolaire}</span>
                        {item.id.toString().startsWith('offline-') && (
                          <span className="offline-tag-mini"><WifiOff size={10} /> Sync</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pm-empty-box">
                  <Award size={36} className="text-gray" />
                  <p>Aucune activité enregistrée.</p>
                  <span>Enrichissez votre dossier pour valoriser votre parcours !</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    );
  };

  const renderCahierTexteTab = () => {
    const devoirsAfaire = cahierEntries.filter(e => e.travail_a_faire && e.travail_a_faire.trim() !== '');

    return (
      <div className="tab-pane">
        <div className="schedule-hero-banner card-box" style={{ marginBottom: '20px' }}>
          <div className="sched-hero-left">
            <div className="sched-title-row">
              <h2><BookMarked size={22} style={{ color: 'var(--accent-red)' }} /> Cahier de Texte Numérique</h2>
              <span className="sched-badge-tag"><Calendar size={14} /> Suivi des cours et devoirs</span>
            </div>
            <p className="sched-hero-sub">
              Retrouvez l'ensemble des cours dispensés par vos enseignants ainsi que les devoirs et exercices à rendre.
            </p>
          </div>
        </div>

        {/* SUB-TABS SWITCHER */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button" 
            onClick={() => setCahierSubTab('cours')} 
            className={`secondary-btn ${cahierSubTab === 'cours' ? 'active' : ''}`}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
              background: cahierSubTab === 'cours' ? 'var(--primary-blue)' : '#f1f5f9',
              color: cahierSubTab === 'cours' ? '#ffffff' : 'var(--text-slate-700)',
              border: 'none', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <BookOpen size={16} /> Journal des Cours ({cahierEntries.length})
          </button>
          <button 
            type="button" 
            onClick={() => setCahierSubTab('devoirs')} 
            className={`secondary-btn ${cahierSubTab === 'devoirs' ? 'active' : ''}`}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
              background: cahierSubTab === 'devoirs' ? 'var(--primary-blue)' : '#f1f5f9',
              color: cahierSubTab === 'devoirs' ? '#ffffff' : 'var(--text-slate-700)',
              border: 'none', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <ClipboardList size={16} /> Devoirs & Travaux à faire ({devoirsAfaire.length})
          </button>
        </div>

        {/* CONTENT */}
        <div className="card-box">
          {cahierLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>Chargement du cahier de texte...</div>
          ) : cahierSubTab === 'devoirs' ? (
            <div className="devoirs-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {devoirsAfaire.length > 0 ? (
                devoirsAfaire.map(entry => (
                  <div key={entry.id} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: '#166534', color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '6px' }}>
                        {entry.matiere_nom}
                      </span>
                      {entry.date_remise_devoir && (
                        <span style={{ background: '#dcfce7', color: '#14532d', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> À rendre pour le : {new Date(entry.date_remise_devoir).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: '#14532d' }}>
                      {entry.titre_lecon}
                    </h4>

                    <p style={{ fontSize: '13px', color: '#166534', margin: '0 0 10px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {entry.travail_a_faire}
                    </p>

                    <div style={{ fontSize: '11px', color: 'var(--text-slate-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={12} /> Enseignant : {entry.professeur_nom}
                    </div>

                    {entry.fichier_url && (
                      <a 
                        href={`${API_BASE_URL.replace('/api', '')}${entry.fichier_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ marginTop: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary-blue)', background: '#ffffff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', fontWeight: 600 }}
                      >
                        <Paperclip size={13} /> {entry.fichier_nom || 'Télécharger le support de cours'} <Download size={12} />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-slate-400)' }}>
                  <CheckCircle size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p>Aucun devoir à faire pour le moment. Vous êtes à jour !</p>
                </div>
              )}
            </div>
          ) : (
            <div className="cours-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cahierEntries.length > 0 ? (
                cahierEntries.map(entry => (
                  <div key={entry.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ background: 'var(--primary-blue)', color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 9px', borderRadius: '6px' }}>
                          {entry.matiere_nom}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {new Date(entry.date_seance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {entry.heure_debut && ` (${entry.heure_debut} - ${entry.heure_fin})`}
                        </span>
                      </div>

                      {entry.visa_admin && (
                        <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={12} /> Visé par l'Admin
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: 'var(--text-slate-900)' }}>
                      {entry.titre_lecon}
                    </h4>

                    <p style={{ fontSize: '13px', color: 'var(--text-slate-700)', margin: '0 0 10px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {entry.contenu_seance}
                    </p>

                    <div style={{ fontSize: '11px', color: 'var(--text-slate-500)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: entry.travail_a_faire ? '10px' : '0' }}>
                      <User size={12} /> Professeur : {entry.professeur_nom}
                    </div>

                    {entry.travail_a_faire && (
                      <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px 12px', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-blue)' }}>
                          Devoir associé :
                        </span>
                        <p style={{ fontSize: '12px', color: 'var(--text-slate-700)', margin: '2px 0 0', whiteSpace: 'pre-line' }}>
                          {entry.travail_a_faire}
                        </p>
                      </div>
                    )}

                    {entry.fichier_url && (
                      <a 
                        href={`${API_BASE_URL.replace('/api', '')}${entry.fichier_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ marginTop: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary-blue)', background: '#eff6ff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', fontWeight: 600 }}
                      >
                        <Paperclip size={13} /> {entry.fichier_nom || 'Support de cours joint'} <Download size={12} />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-slate-400)' }}>
                  <BookOpen size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p>Aucune séance enregistrée dans le cahier de texte de votre classe pour l'instant.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderScheduleTab = () => {
    const hasTimetable = schedule.timetable && schedule.timetable.length > 0;
    const hasExams = schedule.exams && schedule.exams.length > 0;

    const activeClassNom = schedule.timetable[0]?.classe_nom || profile?.classe_nom || '';
    const activeAnnee = schedule.timetable[0]?.annee_scolaire || '2025-2026';

    return (
      <div className="tab-pane">
        
        {/* Top Hero Banner */}
        <div className="schedule-hero-banner card-box">
          <div className="sched-hero-left">
            <div className="sched-title-row">
              <h2>Emploi du Temps & Planning des Évaluations</h2>
              <span className="sched-badge-tag"><Calendar size={14} /> Année {activeAnnee}</span>
            </div>
            <p className="sched-hero-sub">
              Consultez le déroulement hebdomadaire de vos cours et soyez informé à l'avance des dates de vos devoirs et examens.
            </p>
          </div>
          {activeClassNom && (
            <div className="sched-class-pill">
              <BookOpen size={15} /> Classe : <strong>{activeClassNom}</strong>
            </div>
          )}
        </div>

        {/* 1. FULL WIDTH TIMETABLE SECTION */}
        <div className="timetable-section card-box mt-5">
          <div className="sim-inputs-header">
            <div>
              <h3>Emploi du Temps Hebdomadaire</h3>
              <p className="subtitle">Organisation des cours du Lundi au Samedi</p>
            </div>
          </div>

          {hasTimetable ? (
            <div className="timetable-grid-full mt-4">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(jour => {
                const classesForDay = schedule.timetable.filter(t => t.jour_semaine === jour);
                return (
                  <div key={jour} className="day-column-full">
                    <div className="day-header-pill">
                      <span>{jour}</span>
                      {classesForDay.length > 0 && <span className="count-dot">{classesForDay.length}</span>}
                    </div>
                    <div className="slots-list">
                      {classesForDay.length > 0 ? (
                        classesForDay.map(slot => {
                          const formatRoom = (roomStr) => {
                            if (!roomStr || roomStr.trim() === '') return 'Salle N/A';
                            const trimmed = roomStr.trim();
                            if (trimmed.toLowerCase().startsWith('salle')) {
                              return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                            }
                            return `Salle ${trimmed}`;
                          };

                          return (
                            <div key={slot.id} className="slot-card-full">
                              <div className="slot-time-badge">
                                <Clock size={12} /> {slot.heure_debut.slice(0, 5)} - {slot.heure_fin.slice(0, 5)}
                              </div>
                              <strong className="slot-subject-title">{slot.matiere_nom}</strong>
                              <div className="slot-footer-details">
                                <span className="slot-teacher-lbl" title={slot.professeur_email}>
                                  <User size={11} /> {slot.professeur_email ? slot.professeur_email.split('@')[0] : 'Enseignant'}
                                </span>
                                <span className="slot-room-lbl">
                                  {formatRoom(slot.salle)}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="slot-empty-full">Pas de cours</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state py-8">
              <Calendar size={48} className="text-gray" />
              <p>Aucun emploi du temps n'a été saisi pour votre classe.</p>
            </div>
          )}
        </div>

        {/* 2. FULL WIDTH EXAM CALENDAR SECTION BELOW */}
        <div className="exams-planning-section card-box mt-6">
          <div className="sim-inputs-header">
            <div>
              <h3>Calendrier des Évaluations & Examens</h3>
              <p className="subtitle">Dates de devoirs sur table, compositions et examens programmés</p>
            </div>
            {hasExams && (
              <span className="exams-count-badge">
                <GraduationCap size={14} /> {schedule.exams.length} évaluation(s) planifiée(s)
              </span>
            )}
          </div>

          {hasExams ? (
            <div className="exams-grid-full mt-4">
              {schedule.exams.map(ex => {
                const examDate = new Date(ex.date_examen);
                const dayNum = examDate.getDate();
                const monthStr = examDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
                const fullDateStr = examDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                const timeStr = examDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={ex.id} className="exam-card-full">
                    <div className="exam-card-date-box">
                      <span className="exam-day-num">{dayNum}</span>
                      <span className="exam-month-name">{monthStr}</span>
                    </div>

                    <div className="exam-card-content">
                      <div className="exam-card-top">
                        <h4>{ex.matiere_nom}</h4>
                        <span className={`exam-type-pill ${ex.type_examen === 'COMPOSITION' ? 'type-comp' : 'type-dev'}`}>
                          {ex.type_examen}
                        </span>
                      </div>
                      <p className="exam-date-detail">
                        <Clock size={13} /> {fullDateStr} à {timeStr}
                      </p>
                      <div className="exam-card-bottom">
                        <span className="exam-room-pill">Salle : <strong>{ex.salle || 'Non définie'}</strong></span>
                        <span className="exam-status-pill"><CheckCircle2 size={12} /> Confirmation {ex.statut || 'VALIDÉ'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state py-8">
              <GraduationCap size={48} className="text-gray" />
              <p>Aucune évaluation n'est actuellement planifiée pour votre classe.</p>
            </div>
          )}
        </div>

      </div>
    );
  };

  const renderMessagesTab = () => {
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

  const renderSimulatorTab = () => {
    const hasNotes = notes && Object.keys(notes).length > 0;
    const simAverage = parseFloat(getSimulatedAverage());

    const handleResetGrades = () => {
      if (!selectedSimPeriod || !notes) return;
      const [year, period] = selectedSimPeriod.split('::');
      const periodData = notes[year]?.periodes[period];
      if (periodData) {
        const initialSims = {};
        Object.keys(periodData.matieres).forEach(code => {
          initialSims[code] = periodData.matieres[code].moyenne || 10;
        });
        setSimulatedGrades(initialSims);
      }
    };

    const getSimColorClass = (val) => {
      if (val >= 12) return 'sim-good';
      if (val >= 10) return 'sim-warn';
      return 'sim-danger';
    };

    // Calculate smart AI advice for highest coefficient subject boost
    const getSimAdvice = () => {
      if (!selectedSimPeriod || !notes) return null;
      const [year, period] = selectedSimPeriod.split('::');
      const periodData = notes[year]?.periodes[period];
      if (!periodData) return null;

      let topMat = null;
      let maxCoeff = 0;
      let totalCoeff = 0;

      Object.keys(periodData.matieres).forEach(code => {
        const mat = periodData.matieres[code];
        totalCoeff += mat.coefficient;
        if (mat.coefficient > maxCoeff) {
          maxCoeff = mat.coefficient;
          topMat = mat;
        }
      });

      if (topMat && totalCoeff > 0) {
        const boostVal = (2 * topMat.coefficient / totalCoeff).toFixed(2);
        return (
          <span>
            Astuce : Gagner <strong>+2 points</strong> en <strong>{topMat.nom}</strong> (Coeff {topMat.coefficient}) augmentera votre moyenne générale de <strong>+{boostVal} points</strong> !
          </span>
        );
      }
      return "Ajustez vos notes prévisionnelles pour analyser votre classement et vos chances de passage.";
    };

    return (
      <div className="tab-pane">
        
        {/* Top Hero Banner */}
        <div className="simulator-hero-banner card-box">
          <div className="simulator-hero-left">
            <div className="sim-hero-title-row">
              <h2>Simulateur de Moyenne Périodique</h2>
              <span className="sim-badge-tag"><Percent size={14} /> Calcul Prévisionnel</span>
            </div>
            <p className="sim-hero-sub">
              Ajustez vos notes prévisionnelles par matière et visualisez en temps réel leur impact sur votre moyenne générale et votre statut de passage.
            </p>
          </div>

          <div className="simulator-hero-actions">
            {hasNotes && (
              <div className="sim-selector-box">
                <label><Calendar size={13} /> Période :</label>
                <select 
                  value={selectedSimPeriod} 
                  onChange={e => setSelectedSimPeriod(e.target.value)}
                >
                  {Object.keys(notes).map(year => 
                    Object.keys(notes[year].periodes).map(period => (
                      <option key={`${year}::${period}`} value={`${year}::${period}`}>
                        {year} - {period}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            <button className="secondary-btn sim-reset-btn" onClick={handleResetGrades} title="Réinitialiser aux notes réelles">
              <RefreshCw size={15} /> Réinitialiser
            </button>
          </div>
        </div>

        {selectedSimPeriod && notes && (
          <div className="simulator-grid">
            
            {/* LEFT COLUMN: Input controls */}
            <div className="simulator-inputs card-box">
              <div className="sim-inputs-header">
                <div>
                  <h3>Matières & Notes Simulées</h3>
                  <p className="subtitle">Modifiez les notes prévisionnelles ou utilisez les ajustements rapides.</p>
                </div>
                {(() => {
                  const [year, period] = selectedSimPeriod.split('::');
                  const pData = notes[year]?.periodes[period];
                  if (!pData) return null;
                  const countMat = Object.keys(pData.matieres).length;
                  const totalCoeff = Object.values(pData.matieres).reduce((acc, m) => acc + m.coefficient, 0);
                  return (
                    <div className="sim-coeff-total-pill">
                      <span>{countMat} matières</span> • <strong>Coeff Total: {totalCoeff}</strong>
                    </div>
                  );
                })()}
              </div>

              <div className="sim-inputs-list mt-4">
                {(() => {
                  const [year, period] = selectedSimPeriod.split('::');
                  const periodData = notes[year]?.periodes[period];
                  if (!periodData) return null;

                  return Object.keys(periodData.matieres).map(code => {
                    const mat = periodData.matieres[code];
                    const currentVal = simulatedGrades[code] !== undefined ? simulatedGrades[code] : (mat.moyenne || 10);
                    const isModified = mat.moyenne !== null && Math.abs(currentVal - mat.moyenne) > 0.01;

                    return (
                      <div key={code} className={`sim-subject-card ${getSimColorClass(currentVal)}`}>
                        <div className="sim-subj-meta">
                          <div className="sim-subj-name-row">
                            <h4>{mat.nom}</h4>
                            <span className="coeff-tag">Coeff {mat.coefficient}</span>
                          </div>
                          {mat.moyenne !== null ? (
                            <span className="real-grade-lbl">
                              Note actuelle: <strong>{mat.moyenne}/20</strong>
                              {isModified && <span className="modified-dot" title="Note simulée modifiée">• Modifié</span>}
                            </span>
                          ) : (
                            <span className="real-grade-lbl">Aucune note saisie</span>
                          )}
                        </div>

                        <div className="sim-controls-wrapper">
                          {/* Quick adjust buttons */}
                          <div className="quick-adjust-btns">
                            <button 
                              type="button" 
                              className="adjust-btn" 
                              onClick={() => handleSimGradeChange(code, currentVal - 1)}
                              title="-1 point"
                            >-1</button>
                            <button 
                              type="button" 
                              className="adjust-btn" 
                              onClick={() => handleSimGradeChange(code, currentVal - 0.5)}
                              title="-0.5 point"
                            >-0.5</button>
                            <button 
                              type="button" 
                              className="adjust-btn" 
                              onClick={() => handleSimGradeChange(code, currentVal + 0.5)}
                              title="+0.5 point"
                            >+0.5</button>
                            <button 
                              type="button" 
                              className="adjust-btn" 
                              onClick={() => handleSimGradeChange(code, currentVal + 1)}
                              title="+1 point"
                            >+1</button>
                          </div>

                          <div className="sim-input-box">
                            <input 
                              type="number" 
                              step="0.25"
                              min="0"
                              max="20"
                              value={currentVal}
                              onChange={e => handleSimGradeChange(code, e.target.value)}
                            />
                            <span className="unit-20">/20</span>
                          </div>
                        </div>

                        <div className="sim-score-bar-bg">
                          <div 
                            className="sim-score-bar-fill"
                            style={{ width: `${Math.min(100, (currentVal / 20) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* RIGHT COLUMN: Results & AI Advice */}
            <div className="simulator-results-col">
              
              {/* Score Display Card */}
              <div className="dashboard-card sim-result-card">
                <span className="sim-result-tag">Moyenne Prévisionnelle</span>
                
                <div className={`sim-avg-circle ${getSimColorClass(simAverage)}`}>
                  <div className="avg-circle-inner">
                    <span className="avg-score-num">{getSimulatedAverage()}</span>
                    <span className="avg-score-denom">/20</span>
                  </div>
                </div>

                {/* Progress bar with threshold markers */}
                <div className="sim-progress-wrapper">
                  <div className="progress-thresholds">
                    <span className="thresh-lbl">0</span>
                    <span className="thresh-lbl mid">10 (Passage)</span>
                    <span className="thresh-lbl top">12 (Mention)</span>
                    <span className="thresh-lbl max">20</span>
                  </div>
                  <div className="sim-progress-track">
                    <div 
                      className={`sim-progress-fill ${getSimColorClass(simAverage)}`}
                      style={{ width: `${Math.min(100, (simAverage / 20) * 100)}%` }}
                    ></div>
                    <div className="marker-10" style={{ left: '50%' }} title="Seuil de passage (10/20)"></div>
                    <div className="marker-12" style={{ left: '60%' }} title="Seuil d'encouragement (12/20)"></div>
                  </div>
                </div>

                {/* Decision Box */}
                <div className="sim-decision-box">
                  <span className="dec-title"><CheckCircle2 size={14} /> Décision Prévisionnelle</span>
                  <div className={`dec-pill ${getSimColorClass(simAverage)}`}>
                    {getPassageStatusText(simAverage).text}
                  </div>
                </div>
              </div>

              {/* AI Optimisation Advice Card */}
              <div className="dashboard-card sim-advice-card">
                <div className="sim-advice-header">
                  <div className="sparkle-icon-box">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4>Conseil d'Optimisation</h4>
                    <span>Analyse d'impact des coefficients</span>
                  </div>
                </div>
                <p className="sim-advice-body">
                  {getSimAdvice()}
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    );
  };

  const renderGradesTab = () => {
    const hasNotes = notes && Object.keys(notes).length > 0;
    const availableYears = hasNotes ? Object.keys(notes) : [];
    const activeYearKey = (selectedGradeYear && notes[selectedGradeYear]) 
      ? selectedGradeYear 
      : (availableYears[0] || '');
    const activeYearData = activeYearKey ? notes[activeYearKey] : null;
    const defaultPeriods = ['Semestre 1', 'Semestre 2'];
    const existingPeriods = activeYearData?.periodes ? Object.keys(activeYearData.periodes) : [];
    const availablePeriods = Array.from(new Set([...defaultPeriods, ...existingPeriods]));
    const activePeriodKey = (selectedGradePeriod && availablePeriods.includes(selectedGradePeriod)) 
      ? selectedGradePeriod 
      : availablePeriods[0];
    const activePeriodData = (activeYearData && activeYearData.periodes && activeYearData.periodes[activePeriodKey]) 
      ? activeYearData.periodes[activePeriodKey] 
      : null;

    return (
      <div className="tab-pane">
        <div className="grades-layout">
          
          {/* Grades explorer with selectors */}
          <div className="grades-explorer card-box">
            <div className="grades-header-toolbar">
              <div>
                <h3>Notes & Bulletins Scolaires</h3>
                <p className="subtitle">Consultez vos relevés de notes et appréciations certifiés par période.</p>
              </div>
              
              {hasNotes && (
                <div className="grades-selectors-row">
                  {/* Year Selector */}
                  <div className="selector-group">
                    <label><Calendar size={13} /> Année Scolaire</label>
                    <select 
                      value={activeYearKey} 
                      onChange={(e) => {
                        const year = e.target.value;
                        setSelectedGradeYear(year);
                        setSelectedGradePeriod('Semestre 1');
                      }}
                    >
                      {availableYears.map(annee => (
                        <option key={annee} value={annee}>
                          {annee} ({notes[annee].classe})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Period Selector Dropdown */}
                  {availablePeriods.length > 0 && (
                    <div className="selector-group">
                      <label><BookOpen size={13} /> Période / Semestre</label>
                      <select 
                        value={activePeriodKey}
                        onChange={(e) => setSelectedGradePeriod(e.target.value)}
                      >
                        {availablePeriods.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Period Pills Switcher for quick clicks */}
            {availablePeriods.length > 1 && (
              <div className="period-pills-switcher">
                {availablePeriods.map(p => (
                  <button 
                    key={p} 
                    className={`period-pill-btn ${activePeriodKey === p ? 'active' : ''}`}
                    onClick={() => setSelectedGradePeriod(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Selected Period Summary Card */}
            {activePeriodData ? (
              <div className="period-grades-view">
                <div className="period-summary-card">
                  <div className="meta-info">
                    <h4>{activeYearKey} — {activePeriodKey}</h4>
                    <span className="class-badge">Classe : <strong>{activeYearData?.classe}</strong></span>
                  </div>
                  <div className="avg-highlight-badge">
                    <Award size={16} /> Moyenne Générale : {activePeriodData.moyenne_generale} / 20
                  </div>
                </div>

                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Matière</th>
                      <th>Coeff</th>
                      <th>Devoirs</th>
                      <th>Examen / Composition</th>
                      <th>Moyenne Matière</th>
                      <th>Appréciation / Enseignant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(activePeriodData.matieres).map(codeMat => {
                      const mat = activePeriodData.matieres[codeMat];
                      const devoirs = mat.notes.filter(n => n.type_note === 'DEVOIR');
                      const examen = mat.notes.find(n => n.type_note === 'EXAMEN' || n.type_note === 'COMPOSITION');
                      return (
                        <tr key={codeMat}>
                          <td><strong>{mat.nom}</strong></td>
                          <td><span className="coeff-badge">{mat.coefficient}</span></td>
                          <td>
                            {devoirs.length > 0 
                              ? devoirs.map(d => d.valeur + '/20').join(', ') 
                              : '--'}
                          </td>
                          <td>
                            {examen ? `${examen.valeur}/20` : '--'}
                          </td>
                          <td className="text-emerald font-bold">
                            {mat.moyenne !== null ? `${mat.moyenne}/20` : '--'}
                          </td>
                          <td className="appr-cell">
                            {mat.appreciation || 'Aucune appréciation.'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <BookOpen size={48} className="text-gray" style={{ marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700 }}>Aucune note pour le {activePeriodKey}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-slate-500)' }}>
                  Les notes et évaluations de ce semestre n'ont pas encore été renseignées par l'équipe enseignante.
                </p>
              </div>
            )}
          </div>

          {/* Documents Downloads (Secured PDFs) */}
          <div className="documents-panel card-box">
            <h3>Bulletins & Attestations Officiels</h3>
            <p className="subtitle">Tous les documents générés sur la plateforme LeralScolaire comportent un QR code d'authentification unique vérifiable par l'État du Sénégal.</p>
            
            <div className="document-download-list mt-6">
              {documents.bulletins && documents.bulletins.length > 0 ? (
                documents.bulletins.map((bull, idx) => (
                  <div key={idx} className="document-card-download" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch', padding: '16px', border: '1.5px solid var(--border-color)', borderRadius: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="doc-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>PDF</div>
                        <div className="doc-info">
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Bulletin - Semestre {bull.semestre}</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--slate-500)' }}>
                            Classe : {bull.classe_nom} | Année : {bull.annee_scolaire}
                          </p>
                        </div>
                      </div>
                      
                      {!bull.autorise ? (
                        <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={11} /> En attente de publication
                        </span>
                      ) : bull.telecharge ? (
                        <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', background: '#d1fae5', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={11} /> Déjà téléchargé
                        </span>
                      ) : (
                        <a 
                          href={`/api/documents/bulletin/${bull.eleve_id}?semestre=${bull.semestre}&token=${token}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="download-action-btn"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '6px 12px', borderRadius: '6px', background: 'var(--primary-color)', color: '#fff', fontWeight: 600, textDecoration: 'none' }}
                          onClick={() => {
                            setTimeout(() => {
                              fetchData();
                            }, 1500);
                          }}
                        >
                          <Download size={14} /> Télécharger
                        </a>
                      )}
                    </div>

                    {!bull.autorise && (
                      <div style={{ fontSize: '11px', color: '#92400e', background: '#fffbeb', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={13} style={{ flexShrink: 0 }} />
                        <span>Les notes de ce semestre sont en cours de saisie. Le téléchargement officiel sera ouvert par l'administration une fois toutes les notes finalisées.</span>
                      </div>
                    )}

                    {bull.telecharge && (
                      <div style={{ fontSize: '11px', color: '#065f46', background: '#ecfdf5', padding: '8px 12px', borderRadius: '6px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={13} style={{ flexShrink: 0 }} />
                        <span>Ce bulletin officiel a été téléchargé le {new Date(bull.date_telechargement).toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Conformément à la réglementation, le téléchargement multiple est désactivé.</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="info-box-alert">
                  Aucun bulletin officiel n'a encore été généré par l'administration de votre établissement.
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="student-dashboard">
      
      {/* OFFLINE BANNER */}
      {isOffline && (
        <div className="offline-banner">
          <div className="banner-content">
            <WifiOff size={18} />
            <span>Mode Hors-ligne activé. Les données affichées proviennent du cache local.</span>
          </div>
          <button className="sync-btn" onClick={triggerSync} disabled={syncing}>
            <RefreshCw size={14} className={syncing ? 'spinning' : ''} />
            {syncing ? 'Synchronisation...' : 'Synchroniser'}
          </button>
        </div>
      )}

      {/* HEADER TOPBAR */}
      <StudentTopbar
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navigate={navigate}
        notifications={notifications}
        profile={profile}
        logout={logout}
      />

      <div className="sd-container">
        {/* DESKTOP SIDEBAR */}
        <StudentSidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          tab={tab}
          navigate={navigate}
        />

        {/* MAIN CONTENT AREA */}
        <main className="sd-main-content">
          {!loading && tab === 'overview' && (
            <StudentOverviewTab
              profile={profile}
              currentPeriod={currentPeriod}
              currentPeriodKey={currentPeriodKey}
              schedule={schedule}
              navigate={navigate}
              generateCalendarData={generateCalendarData}
              absences={absences}
              getAbsenceColorClass={getAbsenceColorClass}
            />
          )}

          {!loading && tab === 'profile' && (
            <StudentProfileTab profile={profile} />
          )}

          {!loading && tab === 'portfolio' && (
            <StudentPortfolioTab
              profile={profile}
              portfolio={portfolio}
              cvData={cvData}
              isAddingPortfolio={isAddingPortfolio}
              setIsAddingPortfolio={setIsAddingPortfolio}
              newPortfolio={newPortfolio}
              setNewPortfolio={setNewPortfolio}
              handleAddPortfolio={handleAddPortfolio}
              handleDeletePortfolio={handleDeletePortfolio}
              portfolioCategoryFilter={portfolioCategoryFilter}
              setPortfolioCategoryFilter={setPortfolioCategoryFilter}
              filteredPortfolio={filteredPortfolio}
              getCategoryBadgeClass={getCategoryBadgeClass}
            />
          )}

          {!loading && tab === 'grades' && (
            <StudentGradesTab
              notes={notes}
              selectedGradeYear={selectedGradeYear}
              setSelectedGradeYear={setSelectedGradeYear}
              selectedGradePeriod={selectedGradePeriod}
              setSelectedGradePeriod={setSelectedGradePeriod}
              documents={documents}
              token={token}
              fetchData={fetchData}
            />
          )}

          {!loading && tab === 'simulator' && (
            <StudentSimulatorTab
              notes={notes}
              selectedSimPeriod={selectedSimPeriod}
              setSelectedSimPeriod={setSelectedSimPeriod}
              simulatedGrades={simulatedGrades}
              setSimulatedGrades={setSimulatedGrades}
              getSimulatedAverage={getSimulatedAverage}
              handleSimGradeChange={handleSimGradeChange}
              getPassageStatusText={getPassageStatusText}
            />
          )}

          {!loading && tab === 'evolution' && (
            <StudentEvolutionTab evolution={evolution} />
          )}

          {!loading && tab === 'schedule' && (
            <StudentScheduleTab schedule={schedule} profile={profile} />
          )}

          {!loading && tab === 'cahier-texte' && (
            <StudentCahierTexteTab
              cahierEntries={cahierEntries}
              cahierSubTab={cahierSubTab}
              setCahierSubTab={setCahierSubTab}
              cahierLoading={cahierLoading}
              API_BASE_URL={API_BASE_URL}
            />
          )}

          {!loading && tab === 'exams' && (
            <StudentExamsTab examResults={examResults} profile={profile} />
          )}

          {!loading && tab === 'messages' && (
            <StudentMessagesTab
              chatChannelInfo={chatChannelInfo}
              activeChatTarget={activeChatTarget}
              setActiveChatTarget={setActiveChatTarget}
              fetchChatHistory={fetchChatHistory}
              messages={messages}
              chatLoading={chatLoading}
              chatHistory={chatHistory}
              user={user}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              sendChatMessage={sendChatMessage}
              handleFileUpload={handleFileUpload}
              uploadingFile={uploadingFile}
              chatInput={chatInput}
              setChatInput={setChatInput}
              chatEndRef={chatEndRef}
              API_BASE_URL={API_BASE_URL}
            />
          )}

          {!loading && tab === 'ai-assistant' && (
            <StudentAIAssistantTab
              aiChat={aiChat}
              handleSendAi={handleSendAi}
              aiInput={aiInput}
              setAiInput={setAiInput}
            />
          )}

          {!loading && tab === 'attestation' && (
            <StudentAttestationTab
              attestationHistory={attestationHistory}
              profile={profile}
              token={token}
              refreshAttestationHistory={refreshAttestationHistory}
              handleSubmitAttestationRequest={handleSubmitAttestationRequest}
              attestationMotif={attestationMotif}
              setAttestationMotif={setAttestationMotif}
              attestationSubmitting={attestationSubmitting}
            />
          )}

          {!loading && tab === 'discipline' && (
            <StudentDisciplineView />
          )}
        </main>
      </div>

      {/* ==========================================
          SUCCESS POPUP — centered modal
      ========================================== */}
      {popup && (
        <div
          onClick={closePopup}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(10,25,49,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeInOverlay .25s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px 36px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 24px 64px rgba(10,25,49,0.22)',
              animation: 'popIn .35s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Icon circle */}
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #131e6c, #2a3a9e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(19,30,108,0.35)',
            }}>
              <PartyPopper size={34} color="white" />
            </div>

            <h2 style={{ margin: '0 0 10px', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
              {popup.title}
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              {popup.message}
            </p>
            <button
              onClick={closePopup}
              style={{
                background: 'linear-gradient(135deg, #131e6c, #2a3a9e)',
                color: 'white', border: 'none', borderRadius: '10px',
                padding: '12px 32px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', width: '100%',
                boxShadow: '0 4px 14px rgba(19,30,108,0.3)',
                transition: 'transform .15s ease, box-shadow .15s ease',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(19,30,108,0.4)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 14px rgba(19,30,108,0.3)'; }}
            >
              Parfait, merci !
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          CORNER TOAST — errors & info
      ========================================== */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          padding: '14px 16px', borderRadius: '14px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.22)',
          maxWidth: '360px', minWidth: '260px',
          background: toast.type === 'error' ? '#1e0a0a' : '#0a1424',
          border: `1.5px solid ${toast.type === 'error' ? '#7f1d1d' : '#1e3a5f'}`,
          animation: 'slideInRight .3s cubic-bezier(0.34,1.3,0.64,1)',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: toast.type === 'error' ? 'rgba(220,38,38,0.2)' : 'rgba(59,130,246,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {toast.type === 'error'
              ? <XCircle size={18} color="#f87171" />
              : <AlertCircle size={18} color="#60a5fa" />
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: toast.type === 'error' ? '#f87171' : '#60a5fa', marginBottom: '3px' }}>
              {toast.type === 'error' ? 'Erreur' : 'Information'}
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
              {toast.message}
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '2px', flexShrink: 0, lineHeight: 1, display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="sd-mobile-nav">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => navigate('/student/dashboard/overview')}>
          <LayoutDashboard size={18} />
          <span>Aperçu</span>
        </button>
        <button className={tab === 'grades' ? 'active' : ''} onClick={() => navigate('/student/dashboard/grades')}>
          <BookOpen size={18} />
          <span>Notes</span>
        </button>
        <button className={tab === 'portfolio' ? 'active' : ''} onClick={() => navigate('/student/dashboard/portfolio')}>
          <Award size={18} />
          <span>Portfolio</span>
        </button>
        <button className={isMobileMenuOpen ? 'active' : ''} onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={18} />
          <span>Menu</span>
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      <StudentMobileDrawer
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        profile={profile}
        tab={tab}
        navigate={navigate}
      />

    </div>
  );
};

export default StudentDashboard;
