import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  RefreshCw,
  CheckCircle,
  Clock,
  BookOpen,
  AlertCircle,
  PlusCircle,
  ShieldCheck,
  Award,
  Star,
  Compass,
  History,
  Sparkles,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { offlineFetch, api } from '../services/api';
import { getCurrentPosition } from '../utils/geolocation';
import { apiFetch } from '../services/http';
import EmargementEpsTab from '../components/professeur/emargement/EmargementEpsTab';
import EmargementRattrapageTab from '../components/professeur/emargement/EmargementRattrapageTab';
import EmargementScanTab from '../components/professeur/emargement/EmargementScanTab';

export default function ProfDashboardEmargement({
  classes: propClasses = [],
  schedule: propSchedule = [],
  onNavigateTab = null,
}) {
  const [activeTab, setActiveTab] = useState('scanne');
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [gpsStatus, setGpsStatus] = useState(null);
  const [terrainsEps, setTerrainsEps] = useState([]);
  const [selectedTerrainId, setSelectedTerrainId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Dynamic Data States
  const [classesList, setClassesList] = useState(propClasses || []);
  const [scheduleList, setScheduleList] = useState(propSchedule || []);
  const [myStats, setMyStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Active Seance Selection for Emargement
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedMatiereCode, setSelectedMatiereCode] = useState('');
  const [selectedMatiereNom, setSelectedMatiereNom] = useState('');
  const [selectedEtabId, setSelectedEtabId] = useState('');
  const [heureDebut, setHeureDebut] = useState('08:00');
  const [heureFin, setHeureFin] = useState('10:00');
  const [autoDetectedCourse, setAutoDetectedCourse] = useState(null);

  // Camera Scanner States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const scannerRef = useRef(null);

  // Form states for Rattrapage
  const [rattrapageClassId, setRattrapageClassId] = useState('');
  const [rattrapageDate, setRattrapageDate] = useState('');
  const [rattrapageHeureDeb, setRattrapageHeureDeb] = useState('09:00');
  const [rattrapageHeureFin, setRattrapageHeureFin] = useState('11:00');
  const [rattrapageMotif, setRattrapageMotif] = useState('');

  // 1. Fetch Dynamic Stats & Classes if not provided
  const fetchMyStats = async () => {
    try {
      setStatsLoading(true);
      const res = await offlineFetch('/api/emargement/my-stats', {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMyStats(data);
        }
      }
    } catch (err) {
      console.warn('Impossible de charger les stats emargement:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchClassesAndSchedule = async () => {
    const headers = {};
    try {
      if (classesList.length === 0) {
        const res = await offlineFetch('/api/professeurs-portal/classes', { headers });
        if (res.ok) {
          const data = await res.json();
          setClassesList(Array.isArray(data) ? data : []);
        }
      }
      if (scheduleList.length === 0) {
        const sRes = await offlineFetch('/api/professeurs-portal/schedule', { headers });
        if (sRes.ok) {
          const sData = await sRes.json();
          setScheduleList(Array.isArray(sData) ? sData : []);
        }
      }
    } catch (e) {
      console.warn('Erreur chargement classes/schedule:', e);
    }
  };

  useEffect(() => {
    fetchMyStats();
    fetchClassesAndSchedule();
  }, []);

  // Update classes when props change
  useEffect(() => {
    if (propClasses && propClasses.length > 0) setClassesList(propClasses);
  }, [propClasses]);

  useEffect(() => {
    if (propSchedule && propSchedule.length > 0) setScheduleList(propSchedule);
  }, [propSchedule]);

  // 2. Auto-detect current active course from Schedule
  useEffect(() => {
    if (!scheduleList || scheduleList.length === 0) {
      if (classesList && classesList.length > 0 && !selectedClassId) {
        const first = classesList[0];
        setSelectedClassId(first.classe_id || first.id || '');
        setSelectedMatiereCode(first.matiere_code || 'GEN');
        setSelectedMatiereNom(first.matiere_nom || first.nom || 'Cours');
        setSelectedEtabId(first.etablissement_id || '');
      }
      return;
    }

    const now = new Date();
    const daysMap = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
    const currentDay = daysMap[now.getDay()];
    const currentHour = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const match = scheduleList.find((s) => {
      const matchDay = (s.jour || s.jour_semaine || '').toUpperCase() === currentDay;
      const matchTime = s.heure_debut <= currentHour && s.heure_fin >= currentHour;
      return matchDay && matchTime;
    });

    if (match) {
      setAutoDetectedCourse(match);
      setSelectedClassId(match.classe_id || match.id || '');
      setSelectedMatiereCode(match.matiere_code || 'GEN');
      setSelectedMatiereNom(match.matiere_nom || match.matiere || 'Matière');
      setSelectedEtabId(match.etablissement_id || '');
      setHeureDebut(match.heure_debut?.slice(0, 5) || '08:00');
      setHeureFin(match.heure_fin?.slice(0, 5) || '10:00');
    } else if (classesList && classesList.length > 0 && !selectedClassId) {
      const first = classesList[0];
      setSelectedClassId(first.classe_id || first.id || '');
      setSelectedMatiereCode(first.matiere_code || 'GEN');
      setSelectedMatiereNom(first.matiere_nom || first.nom || 'Cours');
      setSelectedEtabId(first.etablissement_id || '');
    }
  }, [scheduleList, classesList]);

  // Handle class select change
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    const found = classesList.find((c) => (c.classe_id || c.id) === classId);
    if (found) {
      setSelectedMatiereCode(found.matiere_code || 'GEN');
      setSelectedMatiereNom(found.matiere_nom || found.nom || 'Cours');
      setSelectedEtabId(found.etablissement_id || '');
    }
  };

  // 3. Audio Feedback on Scan
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Audio not supported or blocked
    }
  };

  // 4. Camera Scanner Control
  const startCamera = async (overrideCamId = null) => {
    setCameraError(null);
    setIsCameraStarting(true);
    setMessage(null);

    // Vérification du contexte sécurisé (HTTPS ou localhost)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!window.isSecureContext && !isLocalhost) {
      setCameraError(
        "L'accès direct au flux vidéo de la caméra nécessite une connexion sécurisée (HTTPS). En HTTP, les navigateurs bloquent la caméra en direct. Vous pouvez utiliser le bouton « Prendre une Photo du QR » ou saisir le code ci-dessous."
      );
      setIsCameraStarting(false);
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia && typeof Html5Qrcode === 'undefined') {
      setCameraError(
        "Votre navigateur ne supporte pas l'accès caméra. Veuillez utiliser la capture photo ou la saisie manuelle."
      );
      setIsCameraStarting(false);
      return;
    }

    // Arrêt préalable d'une instance existante
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Nettoyage scanner précédent:', e);
      }
      scannerRef.current = null;
    }

    try {
      const html5Qr = new Html5Qrcode('ls-camera-reader-viewport');
      scannerRef.current = html5Qr;

      const qrConfig = {
        fps: 15,
        qrbox: (viewWidth, viewHeight) => {
          const minSide = Math.min(viewWidth, viewHeight);
          const edge = Math.max(180, Math.min(minSide * 0.75, 280));
          return { width: edge, height: edge };
        },
        aspectRatio: 1.0,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      };

      const onScanSuccess = (decodedText) => {
        playScanBeep();
        if (navigator.vibrate) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch {
            // Vibration non disponible sur cet appareil : sans conséquence
          }
        }
        setQrTokenInput(decodedText);
        stopCamera();
        setMessage("✅ QR Code détecté et numérisé avec succès ! Cliquez sur « Valider l'Émargement » ci-dessous.");
      };

      // Si un ID de caméra spécifique est sélectionné
      if (overrideCamId) {
        await html5Qr.start(overrideCamId, qrConfig, onScanSuccess, () => {});
      } else {
        // Tenter d'abord la caméra arrière (smartphone)
        try {
          await html5Qr.start({ facingMode: 'environment' }, qrConfig, onScanSuccess, () => {});
        } catch (envErr) {
          console.warn('Caméra environnement indisponible, tentative caméra utilisateur/PC...', envErr);
          // Si échec (ex: webcam de PC portable), basculer sur la caméra utilisateur
          await html5Qr.start({ facingMode: 'user' }, qrConfig, onScanSuccess, () => {});
        }
      }

      setIsCameraActive(true);

      // Une fois la permission accordée et le flux démarré, lister les caméras disponibles
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setAvailableCameras(devices);
          if (!selectedCameraId) {
            setSelectedCameraId(devices[0].id);
          }
        }
      } catch (devErr) {
        console.warn('Énumération caméras après start:', devErr);
      }
    } catch (err) {
      console.error('Erreur démarrage caméra:', err);
      const isDenied = err?.name === 'NotAllowedError' || String(err).toLowerCase().includes('permission');
      setCameraError(
        isDenied
          ? "Accès à la caméra refusé. Veuillez autoriser la caméra dans votre navigateur (icône cadenas dans la barre d'adresse)."
          : "Impossible d'accéder au flux caméra (" +
              (err.message || err) +
              '). Vous pouvez utiliser « Prendre une Photo du QR » ou coller le code ci-dessous.'
      );
      setIsCameraActive(false);
    } finally {
      setIsCameraStarting(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Arrêt caméra info:', e);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraStarting(false);
  };

  const switchCamera = async () => {
    if (!availableCameras || availableCameras.length <= 1) return;
    const currentIndex = availableCameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCam = availableCameras[nextIndex];
    setSelectedCameraId(nextCam.id);
    await stopCamera();
    setTimeout(() => {
      startCamera(nextCam.id);
    }, 250);
  };

  // Scan instantané via photo ou capture d'image (Fonctionne à 100% sur mobile même en HTTP)
  const handleFileScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCameraError(null);
    setMessage("Analyse du QR Code sur l'image en cours...");

    try {
      if (isCameraActive) {
        await stopCamera();
      }

      const html5Qr = new Html5Qrcode('ls-camera-reader-viewport');
      const decodedText = await html5Qr.scanFile(file, false);
      playScanBeep();
      if (navigator.vibrate) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {
          // Vibration non disponible sur cet appareil : sans conséquence
        }
      }
      setQrTokenInput(decodedText);
      setMessage("✅ QR Code scanné depuis la photo avec succès ! Cliquez sur « Valider l'Émargement » ci-dessous.");
    } catch (err) {
      console.error('Erreur scan photo QR:', err);
      setCameraError(
        "Aucun QR Code valide détecté sur cette photo. Assurez-vous que l'image est nette et bien cadrée, ou saisissez le token directement."
      );
    } finally {
      e.target.value = '';
    }
  };

  // Cleanup camera on unmount or tab change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'scanne' && isCameraActive) {
      stopCamera();
    }
  }, [activeTab]);

  // 5. Submit QR Attendance
  // L'émargement exige le réseau : le QR Code expire en 20 s et la position est vérifiée par le serveur.
  const handleScanQrSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!qrTokenInput) {
      setError('Veuillez scanner ou saisir le token du QR Code.');
      return;
    }
    if (!navigator.onLine) {
      setError('Connexion Internet requise pour émarger : le QR Code et votre position sont vérifiés en direct.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const position = await getCurrentPosition();
      const res = await apiFetch('/api/emargement/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: qrTokenInput,
          classeId: selectedClassId && selectedClassId !== 'classe-auto' ? selectedClassId : undefined,
          matiereCode: selectedMatiereCode || 'GEN',
          matiereNom: selectedMatiereNom || 'Cours Général',
          heureDebut: heureDebut || '08:00',
          heureFin: heureFin || '10:00',
          ...position,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setQrTokenInput('');
        fetchMyStats(); // Refresh real stats
      } else {
        setError(data.error || 'Erreur lors de la validation du scan.');
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la communication avec le serveur d'émargement.");
    } finally {
      setLoading(false);
    }
  };

  // Terrains d'EPS de l'établissement sélectionné
  useEffect(() => {
    if (activeTab !== 'eps' || !selectedEtabId || selectedEtabId === 'default') {
      setTerrainsEps([]);
      return;
    }
    api
      .getTerrainsEps(selectedEtabId)
      .then((data) => {
        setTerrainsEps(data.terrains || []);
        setSelectedTerrainId((current) =>
          (data.terrains || []).some((t) => t.id === current) ? current : data.terrains?.[0]?.id || ''
        );
      })
      .catch(() => setTerrainsEps([]));
  }, [activeTab, selectedEtabId]);

  // 6. Submit EPS Attendance : position comparée au terrain d'EPS choisi
  const handleEpsGpsEmargement = async () => {
    if (!selectedTerrainId) {
      setError("Choisissez le terrain d'EPS où se déroule la séance.");
      return;
    }
    if (!navigator.onLine) {
      setError('Connexion Internet requise pour émarger : votre position est vérifiée en direct.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const position = await getCurrentPosition();
      const res = await apiFetch('/api/emargement/eps-terrain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          terrainId: selectedTerrainId,
          classeId: selectedClassId || undefined,
          heureDebut: heureDebut || '08:00',
          heureFin: heureFin || '10:00',
          ...position,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setGpsStatus(`Position validée (précision ± ${Math.round(position.precision)} m)`);
        fetchMyStats();
      } else {
        setError(data.error || 'Position hors du périmètre du terrain.');
      }
    } catch (err) {
      setError(err.message || 'Erreur de transmission EPS.');
    } finally {
      setLoading(false);
    }
  };

  // 7. Submit Rattrapage
  const handleRattrapageSubmit = async (e) => {
    e.preventDefault();
    if (!rattrapageDate || !rattrapageMotif) {
      setError('Veuillez renseigner la date et le motif du cours de rattrapage.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    const targetClass = classesList.find((c) => (c.id || c.classe_id) === (rattrapageClassId || selectedClassId));

    try {
      const res = await offlineFetch('/api/emargement/rattrapage/demande', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          etablissementId: targetClass?.etablissement_id || selectedEtabId || 'default',
          classeId: rattrapageClassId || selectedClassId,
          matiereCode: targetClass?.matiere_code || selectedMatiereCode || 'GEN',
          matiereNom: targetClass?.matiere_nom || selectedMatiereNom || 'Matière',
          dateSeance: rattrapageDate,
          heureDebut: rattrapageHeureDeb,
          heureFin: rattrapageHeureFin,
          motif: rattrapageMotif,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setRattrapageMotif('');
        fetchMyStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la transmission de la demande de rattrapage');
    } finally {
      setLoading(false);
    }
  };

  // Derived Dynamic Display Metrics (100% real, no fake fallbacks)
  const totalScore = myStats?.score1000?.totalScore ?? 0;
  const gradeTier = myStats?.score1000?.gradeTier || 'INITIAL';
  const badgeLabel = myStats?.score1000?.badgeLabel || 'Nouveau profil (En cours de constitution)';

  const heuresEffectuees = myStats?.metrics?.heuresEffectuees ?? 0;
  const heuresTotal = myStats?.metrics?.heuresTotal ?? 0;
  const tauxEmargement = myStats?.metrics?.tauxEmargement;
  const tauxCahier = myStats?.metrics?.tauxCahier;
  const noteEleves = myStats?.metrics?.noteEleves;
  const totalVotes = myStats?.metrics?.totalVotes ?? 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, system-ui, sans-serif' }}>
      {/* 1. Header Card LeralScolaire Style */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #131e6c 0%, #1d2c94 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(19, 30, 108, 0.25)',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#131e6c' }}>
                Émargement & Assiduité Enseignant
              </h1>
              <span
                style={{
                  background: '#e0e7ff',
                  color: '#3730a3',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: '12px',
                }}
              >
                Direct Caméra 20s
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Pointez votre présence par scan vidéo QR Code 20s, géofencez vos cours EPS ou complétez vos cahiers de
              texte.
            </p>
          </div>
        </div>

        {/* Dynamic Score Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #cbd5e1',
            padding: '10px 18px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <Award
            size={30}
            color={
              gradeTier === 'OR'
                ? '#f59e0b'
                : gradeTier === 'ARGENT'
                  ? '#3b82f6'
                  : gradeTier === 'BRONZE'
                    ? '#b45309'
                    : '#94a3b8'
            }
          />
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Score LeralScolaire
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#131e6c' }}>
              {statsLoading ? '...' : totalScore}{' '}
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>/ 1000 pts</span>
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color:
                  gradeTier === 'OR'
                    ? '#16a34a'
                    : gradeTier === 'ARGENT'
                      ? '#2563eb'
                      : gradeTier === 'BRONZE'
                        ? '#b45309'
                        : '#64748b',
              }}
            >
              Grade {gradeTier} • {badgeLabel}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Metrics Row (Honest Data, No Fake Percentages) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        {/* Heures */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#131e6c', marginBottom: '6px' }}>
            <Clock size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Heures Effectuées</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
            {heuresEffectuees}h{' '}
            {heuresTotal > 0 && (
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>/ {heuresTotal}h</span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
            {heuresTotal > 0 ? `${heuresEffectuees}h validées` : 'Aucun cours émargé'}
          </div>
        </div>

        {/* Taux d'émargement */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', marginBottom: '6px' }}>
            <CheckCircle size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Taux d'Émargement</span>
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: tauxEmargement !== null && tauxEmargement !== undefined ? '#16a34a' : '#64748b',
            }}
          >
            {tauxEmargement !== null && tauxEmargement !== undefined ? `${tauxEmargement}%` : '—'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
            {tauxEmargement !== null && tauxEmargement !== undefined ? 'Assiduité calculée' : 'Aucune séance à émarger'}
          </div>
        </div>

        {/* Cahiers de texte */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', marginBottom: '6px' }}>
            <BookOpen size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Cahiers de Texte</span>
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: tauxCahier !== null && tauxCahier !== undefined ? '#7c3aed' : '#64748b',
            }}
          >
            {tauxCahier !== null && tauxCahier !== undefined ? `${tauxCahier}%` : '—'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
            {tauxCahier !== null && tauxCahier !== undefined
              ? tauxCahier === 100
                ? '100% à jour'
                : `${tauxCahier}% complétés`
              : 'Aucune séance effectuée'}
          </div>
        </div>

        {/* Évaluation élèves */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '6px' }}>
            <Star size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Évaluation Élèves</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: noteEleves ? '#d97706' : '#64748b' }}>
            {noteEleves ? `${noteEleves} / 5.0 ⭐` : '— / 5.0'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
            {totalVotes > 0 ? `${totalVotes} avis d'élèves` : "0 avis d'élève enregistré"}
          </div>
        </div>
      </div>

      {/* 3. Action Tab Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('scanne')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 800,
            border: activeTab === 'scanne' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'scanne' ? '#131e6c' : '#ffffff',
            color: activeTab === 'scanne' ? '#ffffff' : '#475569',
            cursor: 'pointer',
            boxShadow: activeTab === 'scanne' ? '0 4px 12px rgba(19, 30, 108, 0.2)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Camera size={16} /> 1. Scanner QR Code Caméra
        </button>

        <button
          onClick={() => setActiveTab('eps')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 800,
            border: activeTab === 'eps' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'eps' ? '#059669' : '#ffffff',
            color: activeTab === 'eps' ? '#ffffff' : '#475569',
            cursor: 'pointer',
            boxShadow: activeTab === 'eps' ? '0 4px 12px rgba(5, 150, 105, 0.2)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Compass size={16} /> Mode Terrain EPS (GPS)
        </button>

        <button
          onClick={() => setActiveTab('rattrapage')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 800,
            border: activeTab === 'rattrapage' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'rattrapage' ? '#d97706' : '#ffffff',
            color: activeTab === 'rattrapage' ? '#ffffff' : '#475569',
            cursor: 'pointer',
            boxShadow: activeTab === 'rattrapage' ? '0 4px 12px rgba(217, 119, 6, 0.2)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <PlusCircle size={16} /> Demande de Rattrapage
        </button>
      </div>

      {/* Global Alert Banners */}
      {message && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle size={18} /> {message}
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left / Main Card: Active Tab Interface */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          {/* SÉLECTION DU COURS / CLASSE DYNAMIQUE */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#334155',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Séance d'Enseignement
              </span>
              {autoDetectedCourse && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={12} /> Cours actuel détecté
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#64748b',
                    marginBottom: '4px',
                  }}
                >
                  Classe & Matière :
                </label>
                <select
                  value={selectedClassId}
                  onChange={handleClassChange}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#0f172a',
                    background: '#ffffff',
                  }}
                >
                  {classesList.length > 0 ? (
                    classesList.map((c, idx) => (
                      <option key={c.id || c.classe_id || idx} value={c.id || c.classe_id}>
                        {c.nom || c.classe_nom || 'Classe'} —{' '}
                        {c.matiere_nom || c.matiere || selectedMatiereNom || 'Cours'}
                      </option>
                    ))
                  ) : (
                    <option value="default">Classe par défaut (Générale)</option>
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#64748b',
                      marginBottom: '4px',
                    }}
                  >
                    Début :
                  </label>
                  <input
                    type="time"
                    value={heureDebut}
                    onChange={(e) => setHeureDebut(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                      fontWeight: 600,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#64748b',
                      marginBottom: '4px',
                    }}
                  >
                    Fin :
                  </label>
                  <input
                    type="time"
                    value={heureFin}
                    onChange={(e) => setHeureFin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: SCANNER QR CODE AVEC ACCÈS CAMÉRA VIDÉO */}
          {activeTab === 'scanne' && (
            <EmargementScanTab
              availableCameras={availableCameras}
              cameraError={cameraError}
              handleFileScan={handleFileScan}
              handleScanQrSubmit={handleScanQrSubmit}
              isCameraActive={isCameraActive}
              isCameraStarting={isCameraStarting}
              loading={loading}
              qrTokenInput={qrTokenInput}
              setQrTokenInput={setQrTokenInput}
              setShowManualInput={setShowManualInput}
              showManualInput={showManualInput}
              startCamera={startCamera}
              stopCamera={stopCamera}
              switchCamera={switchCamera}
            />
          )}

          {/* TAB 2: MODE TERRAIN EPS (GPS) */}
          {activeTab === 'eps' && (
            <EmargementEpsTab
              gpsStatus={gpsStatus}
              handleEpsGpsEmargement={handleEpsGpsEmargement}
              loading={loading}
              selectedTerrainId={selectedTerrainId}
              setSelectedTerrainId={setSelectedTerrainId}
              terrainsEps={terrainsEps}
            />
          )}

          {/* TAB: RATTRAPAGE */}
          {activeTab === 'rattrapage' && (
            <EmargementRattrapageTab
              classesList={classesList}
              handleRattrapageSubmit={handleRattrapageSubmit}
              loading={loading}
              rattrapageClassId={rattrapageClassId}
              rattrapageDate={rattrapageDate}
              rattrapageHeureDeb={rattrapageHeureDeb}
              rattrapageHeureFin={rattrapageHeureFin}
              rattrapageMotif={rattrapageMotif}
              selectedClassId={selectedClassId}
              setRattrapageClassId={setRattrapageClassId}
              setRattrapageDate={setRattrapageDate}
              setRattrapageHeureDeb={setRattrapageHeureDeb}
              setRattrapageHeureFin={setRattrapageHeureFin}
              setRattrapageMotif={setRattrapageMotif}
            />
          )}
        </div>

        {/* Right Card: Historique Récent des Séances */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 800,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <History size={18} color="#2563eb" /> Historique Récent
            </h3>
            <button
              onClick={fetchMyStats}
              title="Rafraîchir"
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {myStats?.recentSeances && myStats.recentSeances.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myStats.recentSeances.slice(0, 6).map((seance, index) => {
                const isComplete = seance.statut === 'VALIDE_COMPLET';
                return (
                  <div
                    key={seance.id || index}
                    style={{
                      border: '1px solid #f1f5f9',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                        {seance.classe_nom || 'Classe'} • {seance.matiere_nom || seance.matiere_code || 'Matière'}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '2px',
                        }}
                      >
                        <span>{new Date(seance.date_seance).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span>
                          {seance.heure_debut?.substring(0, 5)} - {seance.heure_fin?.substring(0, 5)}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isComplete ? '#dcfce7' : '#fef3c7',
                          color: isComplete ? '#15803d' : '#b45309',
                          display: 'inline-block',
                        }}
                      >
                        {isComplete ? '100% Validé' : 'Cahier requis'}
                      </span>
                      {!isComplete && onNavigateTab && (
                        <div style={{ marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => onNavigateTab('cahier-texte')}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#7c3aed',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Cahier de texte →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
              <Clock size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: '12px', margin: 0 }}>Aucun émargement récent enregistré.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
