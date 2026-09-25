import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { WifiOff, RefreshCw, X, XCircle, AlertCircle, PartyPopper } from 'lucide-react';
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
import { apiFetch } from '../services/http';
import './StudentDashboard.css';

const API_BASE_URL = '/api';

const normalizeNotesData = (rawNotes) => {
  if (!rawNotes || typeof rawNotes !== 'object') return {};
  const normalized = {};
  Object.keys(rawNotes).forEach((year) => {
    normalized[year] = {
      ...rawNotes[year],
      periodes: {},
    };
    if (rawNotes[year]?.periodes) {
      Object.keys(rawNotes[year].periodes).forEach((periodKey) => {
        const cleanKey = periodKey.replace(/Trimestre/gi, 'Semestre');
        normalized[year].periodes[cleanKey] = rawNotes[year].periodes[periodKey];
      });
    }
  });
  return normalized;
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout: endSession } = useAuth();
  const { tab = 'overview' } = useParams();

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
    date_realisation: new Date().toISOString().split('T')[0],
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
    {
      role: 'assistant',
      text: 'Bonjour ! Je suis votre Assistant Pédagogique IA. Je peux analyser vos notes, vous proposer des méthodes de révision adaptées et vous guider pour votre orientation post-BAC au Sénégal.',
    },
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
    if (!user) {
      navigate('/auth');
      return;
    }

    if (navigator.onLine && !isOffline) {
      if (forceSync) setSyncing(true);
      try {
        const headers = {};

        // Fetch Profile
        const profRes = await apiFetch(`${API_BASE_URL}/eleve-portal/profile`, { headers });
        if (profRes.status === 401) {
          logout();
          return;
        }
        const profileData = await profRes.json();
        setProfile(profileData);
        localStorage.setItem('cached_profile', JSON.stringify(profileData));

        // Fetch Portfolio
        const portRes = await apiFetch(`${API_BASE_URL}/eleve-portal/portfolio`, { headers });
        const portfolioData = await portRes.json();
        setPortfolio(portfolioData);
        localStorage.setItem('cached_portfolio', JSON.stringify(portfolioData));

        // Fetch CV
        const cvRes = await apiFetch(`${API_BASE_URL}/eleve-portal/cv`, { headers });
        const cvDataFetched = await cvRes.json();
        setCvData(cvDataFetched);
        localStorage.setItem('cached_cv', JSON.stringify(cvDataFetched));

        // Fetch Notes
        const notesRes = await apiFetch(`${API_BASE_URL}/eleve-portal/notes`, { headers });
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
        const evoRes = await apiFetch(`${API_BASE_URL}/eleve-portal/notes-evolution`, { headers });
        const evoData = await evoRes.json();
        setEvolution(evoData);
        localStorage.setItem('cached_evolution', JSON.stringify(evoData));

        // Fetch Schedule
        const schedRes = await apiFetch(`${API_BASE_URL}/eleve-portal/schedule`, { headers });
        const schedData = await schedRes.json();
        setSchedule(schedData);
        localStorage.setItem('cached_schedule', JSON.stringify(schedData));

        // Fetch Exam Results (Portail BAC/BFEM)
        const examRes = await apiFetch(`${API_BASE_URL}/eleve-portal/exam-results`, { headers });
        const examData = await examRes.json();
        // Support both legacy array format and new { eleve, resultats } format
        const normalizedExamData = Array.isArray(examData) ? { eleve: null, resultats: examData } : examData;
        setExamResults(normalizedExamData);
        localStorage.setItem('cached_examResults', JSON.stringify(normalizedExamData));

        // Fetch Documents
        const docRes = await apiFetch(`${API_BASE_URL}/eleve-portal/documents`, { headers });
        const docData = await docRes.json();
        setDocuments(docData);
        localStorage.setItem('cached_documents', JSON.stringify(docData));

        // Fetch Notifications
        const notifRes = await apiFetch(`${API_BASE_URL}/eleve-portal/notifications`, { headers });
        const notifData = await notifRes.json();
        setNotifications(notifData);
        localStorage.setItem('cached_notifications', JSON.stringify(notifData));

        // Fetch Messages
        const msgRes = await apiFetch(`${API_BASE_URL}/eleve-portal/messages`, { headers });
        const msgData = await msgRes.json();
        setMessages(msgData);
        localStorage.setItem('cached_messages', JSON.stringify(msgData));

        // Fetch Absences
        const absRes = await apiFetch(`${API_BASE_URL}/eleve-portal/absences`, { headers });
        const absData = await absRes.json();
        setAbsences(absData);
        localStorage.setItem('cached_absences', JSON.stringify(absData));

        // Fetch Attestation History
        const attRes = await apiFetch(`${API_BASE_URL}/eleve-portal/attestations/history`, { headers });
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
    setDocuments(
      JSON.parse(localStorage.getItem('cached_documents') || '{"bulletins":[],"attestationDisponible":true}')
    );
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
        'Content-Type': 'application/json',
      };
      for (const item of storedOffline) {
        try {
          await apiFetch(`${API_BASE_URL}/eleve-portal/portfolio`, {
            method: 'POST',
            headers,
            body: JSON.stringify(item),
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

  const logout = () => endSession();

  // === MESSAGING FUNCTIONS ===
  const fetchChatChannel = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/messages/channels`, {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        setChatChannelInfo(data);
      }
    } catch (err) {
      console.error(err);
    }
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
        target_id: target.target_id,
      });
      if (target.etablissement_id) {
        params.append('etablissement_id', target.etablissement_id);
      }

      const res = await apiFetch(`${API_BASE_URL}/messages/history?${params}`, {
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
      const res = await apiFetch(`${API_BASE_URL}/messages/upload`, {
        method: 'POST',
        headers: {},
        body: formData,
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
      showToast("Erreur lors de l'envoi du fichier.", 'error');
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
      fichier_nom: selectedFile?.fichier_nom || null,
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
      const res = await apiFetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setChatInput('');
        setSelectedFile(null);
        fetchChatHistory(activeChatTarget);
      } else {
        const errData = await res.json();
        showToast(errData.message || "Erreur lors de l'envoi.", 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Refresh attestation history
  const refreshAttestationHistory = async () => {
    try {
      const attRes = await apiFetch(`${API_BASE_URL}/eleve-portal/attestations/history`, {
        headers: {},
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
      const res = await apiFetch(`${API_BASE_URL}/eleve-portal/attestations/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motif_demande: attestationMotif }),
      });
      const data = await res.json();
      if (res.ok) {
        setAttestationMotif('');
        // Refresh history
        await refreshAttestationHistory();
        showPopup(
          'Demande envoyée !',
          "Votre demande d'attestation a bien été transmise à votre établissement. Vous serez notifié dès qu'une décision est prise."
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
        eleve_id: profile?.id,
      };
      const updatedOffline = [...offlineChanges, pendingItem];
      localStorage.setItem('offline_portfolio_adds', JSON.stringify(updatedOffline));
      setOfflineChanges(updatedOffline);
      setPortfolio([pendingItem, ...portfolio]);
      setIsAddingPortfolio(false);
      alert(
        'Mode hors-ligne : votre projet est enregistré localement et sera synchronisé dès le retour de la connexion.'
      );
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/eleve-portal/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPortfolio),
      });
      if (response.ok) {
        setNewPortfolio({
          type: 'PROJET',
          titre: '',
          description: '',
          annee_scolaire: '2025-2026',
          date_realisation: new Date().toISOString().split('T')[0],
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
      const updatedOffline = offlineChanges.filter((item) => item.id !== id);
      localStorage.setItem('offline_portfolio_adds', JSON.stringify(updatedOffline));
      setOfflineChanges(updatedOffline);
      setPortfolio(portfolio.filter((item) => item.id !== id));
      return;
    }

    if (isOffline) {
      alert('Impossible de supprimer un élément en ligne pendant que vous êtes hors-ligne.');
      return;
    }

    if (window.confirm('Voulez-vous vraiment supprimer cet élément ?')) {
      try {
        const response = await apiFetch(`${API_BASE_URL}/eleve-portal/portfolio/${id}`, {
          method: 'DELETE',
          headers: {},
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
      const res = await apiFetch(`${API_BASE_URL}/cahier-texte/eleve`, {
        headers: {},
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

  // Initialize simulated grades on period select
  useEffect(() => {
    if (!selectedSimPeriod || !notes) return;
    const [year, period] = selectedSimPeriod.split('::');
    const periodData = notes[year]?.periodes[period];
    if (periodData) {
      const initialSims = {};
      Object.keys(periodData.matieres).forEach((code) => {
        initialSims[code] = periodData.matieres[code].moyenne || 10;
      });
      setSimulatedGrades(initialSims);
    }
  }, [selectedSimPeriod, notes]);

  const handleSimGradeChange = (code, value) => {
    const val = parseFloat(value);
    setSimulatedGrades({
      ...simulatedGrades,
      [code]: isNaN(val) ? 0 : Math.min(20, Math.max(0, val)),
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

    Object.keys(periodData.matieres).forEach((code) => {
      const coeff = periodData.matieres[code].coefficient;
      const simVal =
        simulatedGrades[code] !== undefined ? simulatedGrades[code] : periodData.matieres[code].moyenne || 10;
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
      const abs = absences.find((a) => {
        const aDate = new Date(a.date_absence).toISOString().split('T')[0];
        return aDate === dateStr;
      });
      const isAbsentType = abs && (abs.type_presence === 'ABSENCE' || abs.type_presence === 'ABSENT');
      const hoursVal = abs ? Number(abs.heures_absent) || (isAbsentType ? 2 : 0) : 0;

      data.push({
        date: dateStr,
        dayOfWeek: tempDate.getDay(),
        month: tempDate.getMonth(),
        hours: hoursVal,
        justified: abs ? abs.justifiee : false,
        type: abs ? abs.type_presence : null,
        delay: abs ? abs.duree_retard : 0,
        motif: abs ? abs.motif : null,
        subject: abs ? abs.matiere_nom : null,
      });

      tempDate.setDate(tempDate.getDate() + 1);
    }
    return data;
  };

  const getAbsenceColorClass = (hours, type) => {
    if ((!hours || hours === 0) && (!type || type === 'PRESENT')) return 'cell-empty';
    if (type === 'RETARD') return 'cell-delay';
    if (type === 'ABSENCE' || type === 'ABSENT' || hours > 0) {
      if (hours > 6) return 'cell-level-4';
      if (hours > 4) return 'cell-level-3';
      if (hours > 2) return 'cell-level-2';
      return 'cell-level-1';
    }
    return 'cell-empty';
  };

  // AI Chat send message
  const handleSendAi = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = { role: 'user', text: aiInput };
    setAiChat((prev) => [...prev, userMsg]);
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
            Object.keys(matieresObj).forEach((code) => {
              const mVal = matieresObj[code].moyenne;
              if (mVal !== null) {
                if (mVal > bestVal) {
                  bestVal = mVal;
                  bestSubj = matieresObj[code].nom;
                }
                if (mVal < worstVal) {
                  worstVal = mVal;
                  worstSubj = matieresObj[code].nom;
                }
              }
            });
          }
        }

        if (bestSubj) {
          aiResp = `D'après vos notes récentes, vous excellez en **${bestSubj}** avec une moyenne de **${bestVal}/20**. C'est un excellent point fort ! En revanche, votre matière la plus faible semble être le **${worstSubj}** avec **${worstVal}/20**. Je vous conseille de consacrer 30 minutes de révision supplémentaires par jour à cette matière en utilisant des fiches de synthèse.`;
        } else {
          aiResp =
            "Je n'ai pas trouvé de notes récentes dans votre livret scolaire pour faire une analyse. Mais d'une manière générale, je vous conseille de réviser régulièrement les matières scientifiques (Maths, PC) qui ont des coefficients élevés au Sénégal.";
        }
      } else if (
        textLower.includes('orientation') ||
        textLower.includes('université') ||
        textLower.includes('bac') ||
        textLower.includes('métier')
      ) {
        aiResp =
          "Pour votre orientation au Sénégal :\n- Si vous êtes en série **S (S1/S2)**, les écoles d'ingénieurs comme l'**ESP** (Dakar), l'**EPT** (Thiès) ou les filières informatiques/mathématiques de l'**UGB** et de l'**UCAD** sont d'excellents choix.\n- Si vous êtes en série **L**, l'**ENAM** ou les facultés de Droit (UCAD) et de Lettres vous offriront de superbes débouchés.\nPensez également aux filières émergentes en agro-écologie et énergies renouvelables à l'**USSEIN** de Kaolack.";
      } else if (textLower.includes('planning') || textLower.includes('examen') || textLower.includes('réviser')) {
        aiResp =
          'Voici ma méthode de révision recommandée (la méthode Pomodoro) :\n1. Travaillez concentré pendant 25 minutes.\n2. Prenez 5 minutes de pause.\n3. Répétez 4 fois, puis prenez une pause de 20 minutes.\nFaites des fiches pour les matières à formule (Physique, Maths) et apprenez les plans de cours en Histoire-Géographie.';
      } else {
        aiResp = `Intéressant ! Pour réussir au mieux votre année académique en classe de ${profile?.classe_nom || 'lycée'}, restez régulier. N'hésitez pas à me demander des recommandations sur vos notes, sur les universités sénégalaises (UCAD, UGB, USSEIN) ou comment simuler vos moyennes pour le BAC.`;
      }

      setAiChat((prev) => [...prev, { role: 'assistant', text: aiResp }]);
    }, 1000);
  };

  const currentYearNotes = notes && Object.keys(notes).length > 0 ? notes[Object.keys(notes)[0]] : null;
  const currentPeriodKey = currentYearNotes ? Object.keys(currentYearNotes.periodes)[0] : '';
  const currentPeriod = currentYearNotes && currentPeriodKey ? currentYearNotes.periodes[currentPeriodKey] : null;

  const filteredPortfolio =
    portfolioCategoryFilter === 'TOUS'
      ? portfolio
      : (portfolio || []).filter((item) => item.type === portfolioCategoryFilter);

  const getCategoryBadgeClass = (type) => {
    switch (type) {
      case 'PROJET':
        return 'cat-badge-projet';
      case 'SPORT':
        return 'cat-badge-sport';
      case 'ART':
        return 'cat-badge-art';
      default:
        return 'cat-badge-autre';
    }
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
          {tab === 'overview' && (
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

          {tab === 'profile' && <StudentProfileTab profile={profile} />}

          {tab === 'portfolio' && (
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

          {tab === 'grades' && (
            <StudentGradesTab
              notes={notes}
              selectedGradeYear={selectedGradeYear}
              setSelectedGradeYear={setSelectedGradeYear}
              selectedGradePeriod={selectedGradePeriod}
              setSelectedGradePeriod={setSelectedGradePeriod}
              documents={documents}
              fetchData={fetchData}
            />
          )}

          {tab === 'simulator' && (
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

          {tab === 'evolution' && <StudentEvolutionTab evolution={evolution} />}

          {tab === 'schedule' && <StudentScheduleTab schedule={schedule} profile={profile} />}

          {tab === 'cahier-texte' && (
            <StudentCahierTexteTab
              cahierEntries={cahierEntries}
              cahierSubTab={cahierSubTab}
              setCahierSubTab={setCahierSubTab}
              cahierLoading={cahierLoading}
              API_BASE_URL={API_BASE_URL}
            />
          )}

          {tab === 'exams' && <StudentExamsTab examResults={examResults} profile={profile} />}

          {tab === 'messages' && (
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

          {tab === 'ai-assistant' && (
            <StudentAIAssistantTab
              aiChat={aiChat}
              handleSendAi={handleSendAi}
              aiInput={aiInput}
              setAiInput={setAiInput}
            />
          )}

          {tab === 'attestation' && (
            <StudentAttestationTab
              attestationHistory={attestationHistory}
              profile={profile}
              refreshAttestationHistory={refreshAttestationHistory}
              handleSubmitAttestationRequest={handleSubmitAttestationRequest}
              attestationMotif={attestationMotif}
              setAttestationMotif={setAttestationMotif}
              attestationSubmitting={attestationSubmitting}
            />
          )}

          {tab === 'discipline' && <StudentDisciplineView />}
        </main>
      </div>

      {/* ==========================================
          SUCCESS POPUP — centered modal
      ========================================== */}
      {popup && (
        <div
          onClick={closePopup}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(10,25,49,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeInOverlay .25s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
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
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #131e6c, #2a3a9e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(19,30,108,0.35)',
              }}
            >
              <PartyPopper size={34} color="white" />
            </div>

            <h2 style={{ margin: '0 0 10px', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{popup.title}</h2>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{popup.message}</p>
            <button
              onClick={closePopup}
              style={{
                background: 'linear-gradient(135deg, #131e6c, #2a3a9e)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 32px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 14px rgba(19,30,108,0.3)',
                transition: 'transform .15s ease, box-shadow .15s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 20px rgba(19,30,108,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 14px rgba(19,30,108,0.3)';
              }}
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
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '14px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.22)',
            maxWidth: '360px',
            minWidth: '260px',
            background: toast.type === 'error' ? '#1e0a0a' : '#0a1424',
            border: `1.5px solid ${toast.type === 'error' ? '#7f1d1d' : '#1e3a5f'}`,
            animation: 'slideInRight .3s cubic-bezier(0.34,1.3,0.64,1)',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              flexShrink: 0,
              background: toast.type === 'error' ? 'rgba(220,38,38,0.2)' : 'rgba(59,130,246,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {toast.type === 'error' ? <XCircle size={18} color="#f87171" /> : <AlertCircle size={18} color="#60a5fa" />}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: toast.type === 'error' ? '#f87171' : '#60a5fa',
                marginBottom: '3px',
              }}
            >
              {toast.type === 'error' ? 'Erreur' : 'Information'}
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>{toast.message}</div>
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#475569',
              padding: '2px',
              flexShrink: 0,
              lineHeight: 1,
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

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
