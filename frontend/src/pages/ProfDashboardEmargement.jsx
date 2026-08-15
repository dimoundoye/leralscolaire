import React, { useState } from 'react';
import { QrCode, MapPin, CheckCircle, Clock, BookOpen, AlertCircle, PlusCircle, ShieldCheck, Award, Star, Compass } from 'lucide-react';

export default function ProfDashboardEmargement() {
  const [activeTab, setActiveTab] = useState('scanne');
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [gpsStatus, setGpsStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form states for Cahier de Texte
  const [selectedSeanceId, setSelectedSeanceId] = useState('');
  const [cahierTitre, setCahierTitre] = useState('');
  const [cahierContenu, setCahierContenu] = useState('');
  const [cahierDevoirs, setCahierDevoirs] = useState('');

  // Form states for Rattrapage
  const [rattrapageDate, setRattrapageDate] = useState('');
  const [rattrapageHeureDeb, setRattrapageHeureDeb] = useState('09:00');
  const [rattrapageHeureFin, setRattrapageHeureFin] = useState('11:00');
  const [rattrapageMotif, setRattrapageMotif] = useState('');

  const handleScanQrSubmit = async (e) => {
    e.preventDefault();
    if (!qrTokenInput) {
      setError('Veuillez coller ou scanner le token QR Code');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5002/api/emargement/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          token: qrTokenInput,
          etablissementId: 'default',
          classeId: 'classe-tles2',
          matiereCode: 'MATH',
          matiereNom: 'Mathématiques',
          heureDebut: '08:00',
          heureFin: '10:00'
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setQrTokenInput('');
        if (data.seance) setSelectedSeanceId(data.seance.id);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la validation du QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleEpsGpsEmargement = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par votre navigateur');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5002/api/emargement/eps-terrain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            etablissementId: 'default',
            classeId: 'classe-3a',
            matiereCode: 'EPS',
            matiereNom: 'Éducation Physique & Sportive',
            heureDebut: '08:00',
            heureFin: '10:00',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          })
        });

        const data = await res.json();
        if (data.success) {
          setMessage(data.message);
          setGpsStatus(`GPS Validé: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Erreur de connexion serveur EPS');
      } finally {
        setLoading(false);
      }
    }, () => {
      setError('Accès GPS refusé. Veuillez autoriser la géolocalisation pour le Mode EPS.');
      setLoading(false);
    });
  };

  const handleCahierTexteSubmit = async (e) => {
    e.preventDefault();
    if (!cahierTitre || !cahierContenu) {
      setError('Le titre et le contenu du cours sont requis.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5002/api/emargement/cahier-texte-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          seanceId: selectedSeanceId || 'seance-demo-1',
          titre: cahierTitre,
          contenu: cahierContenu,
          devoirs: cahierDevoirs
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setCahierTitre('');
        setCahierContenu('');
        setCahierDevoirs('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur serveur cahier de texte');
    } finally {
      setLoading(false);
    }
  };

  const handleRattrapageSubmit = async (e) => {
    e.preventDefault();
    if (!rattrapageDate || !rattrapageMotif) {
      setError('Veuillez remplir la date et le motif du rattrapage.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5002/api/emargement/rattrapage/demande', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          etablissementId: 'default',
          classeId: 'classe-tles2',
          matiereCode: 'MATH',
          matiereNom: 'Mathématiques',
          dateSeance: rattrapageDate,
          heureDebut: rattrapageHeureDeb,
          heureFin: rattrapageHeureFin,
          motif: rattrapageMotif
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setRattrapageMotif('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la demande de rattrapage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, system-ui, sans-serif' }}>
      
      {/* 1. Header Card LeralScolaire Style */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #131e6c 0%, #1d2c94 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(19, 30, 108, 0.25)'
          }}>
            <ShieldCheck size={28} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#131e6c' }}>
              Émargement & Assiduité Enseignant
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Pointez votre présence par QR Code 20s, géofencez vos séances d'EPS ou renseignez vos cahiers de texte.
            </p>
          </div>
        </div>

        {/* Score Card */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          padding: '10px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Award size={28} color="#f59e0b" />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Score LeralScolaire</div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#131e6c' }}>
              920 <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>/ 1000 pts</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>Grade Or • Éligible Président de Jury</div>
          </div>
        </div>
      </div>

      {/* 2. Quick Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#131e6c', marginBottom: '6px' }}>
            <Clock size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Heures Effectuées</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>84h / 90h</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', marginBottom: '6px' }}>
            <CheckCircle size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Taux d'Émargement</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a' }}>98%</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', marginBottom: '6px' }}>
            <BookOpen size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Cahiers de Texte</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#7c3aed' }}>100% à jour</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '6px' }}>
            <Star size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Vote Élèves (5 Qs)</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#d97706' }}>4.7 / 5.0 ⭐</div>
        </div>
      </div>

      {/* 3. Action Tab Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('scanne')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
            border: activeTab === 'scanne' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'scanne' ? '#131e6c' : '#ffffff',
            color: activeTab === 'scanne' ? '#ffffff' : '#475569',
            cursor: 'pointer', boxShadow: activeTab === 'scanne' ? '0 4px 12px rgba(19, 30, 108, 0.2)' : 'none'
          }}
        >
          <QrCode size={16} /> 1. Émerger (QR Code 20s)
        </button>

        <button
          onClick={() => setActiveTab('eps')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
            border: activeTab === 'eps' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'eps' ? '#059669' : '#ffffff',
            color: activeTab === 'eps' ? '#ffffff' : '#475569',
            cursor: 'pointer', boxShadow: activeTab === 'eps' ? '0 4px 12px rgba(5, 150, 105, 0.2)' : 'none'
          }}
        >
          <Compass size={16} /> Mode Terrain EPS (GPS)
        </button>

        <button
          onClick={() => setActiveTab('cahier')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
            border: activeTab === 'cahier' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'cahier' ? '#7c3aed' : '#ffffff',
            color: activeTab === 'cahier' ? '#ffffff' : '#475569',
            cursor: 'pointer', boxShadow: activeTab === 'cahier' ? '0 4px 12px rgba(124, 58, 237, 0.2)' : 'none'
          }}
        >
          <BookOpen size={16} /> 2. Saisir Cahier de Texte
        </button>

        <button
          onClick={() => setActiveTab('rattrapage')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
            border: activeTab === 'rattrapage' ? 'none' : '1px solid #cbd5e1',
            background: activeTab === 'rattrapage' ? '#d97706' : '#ffffff',
            color: activeTab === 'rattrapage' ? '#ffffff' : '#475569',
            cursor: 'pointer', boxShadow: activeTab === 'rattrapage' ? '0 4px 12px rgba(217, 119, 6, 0.2)' : 'none'
          }}
        >
          <PlusCircle size={16} /> Demande de Rattrapage
        </button>
      </div>

      {/* Global Alert Banners */}
      {message && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={18} /> {message}
        </div>
      )}

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* 4. Active Tab Content Cards */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', maxWidth: '680px' }}>
        
        {/* Tab 1: QR Code Scanner */}
        {activeTab === 'scanne' && (
          <form onSubmit={handleScanQrSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#131e6c' }}>
                Émargement Présence par QR Code (20s)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                Pointez votre caméra vers l'écran du surveillant ou collez le token TOTP 20s généré.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Token Scanné / Données du QR Code :
              </label>
              <textarea
                rows={3}
                value={qrTokenInput}
                onChange={(e) => setQrTokenInput(e.target.value)}
                placeholder="Ex : eyJldGFiSWQiOiJkZWZhdWx0IiwidGltZSI6ODkzMTk0MjUsImhhc2giOiJlM2IwYzQ0MiJ9..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  background: '#f8fafc',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                background: '#131e6c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Validation en cours...' : 'Valider l\'Émargement Physique'}
            </button>
          </form>
        )}

        {/* Tab 2: EPS Outdoor Mode */}
        {activeTab === 'eps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={20} /> Mode Terrain EPS (Stade / Géofencing GPS)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                Émargement automatique pour les professeurs d'Éducation Physique en extérieur.
              </p>
            </div>

            <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, background: '#f0fdf4', padding: '14px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              Ce mode utilise les coordonnées GPS de votre smartphone pour valider votre présence physique sur le stade du lycée sans passer par le bureau du surveillant.
            </p>

            {gpsStatus && (
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> {gpsStatus}
              </div>
            )}

            <button
              onClick={handleEpsGpsEmargement}
              disabled={loading}
              style={{
                padding: '12px',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.6 : 1
              }}
            >
              <MapPin size={16} />
              {loading ? 'Vérification GPS...' : 'Émerger mon Cours EPS (Position Stade)'}
            </button>
          </div>
        )}

        {/* Tab 3: Cahier de Texte */}
        {activeTab === 'cahier' && (
          <form onSubmit={handleCahierTexteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#7c3aed' }}>
                Saisie du Cahier de Texte (Validation 100%)
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                Renseignez le résumé de la leçon pour valider définitivement vos heures d'enseignement.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Titre de la Leçon / Chapitre :
              </label>
              <input
                type="text"
                value={cahierTitre}
                onChange={(e) => setCahierTitre(e.target.value)}
                placeholder="Ex : Chapitre 4 - Intégration et Primitives"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Résumé du Cours Fait en Classe :
              </label>
              <textarea
                rows={4}
                value={cahierContenu}
                onChange={(e) => setCahierContenu(e.target.value)}
                placeholder="Résumé des notions abordées et exercices corrigés..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Devoirs pour le prochain cours :
              </label>
              <input
                type="text"
                value={cahierDevoirs}
                onChange={(e) => setCahierDevoirs(e.target.value)}
                placeholder="Ex : Exercice 12 page 148 pour Mardi"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Enregistrement...' : 'Valider le Cahier de Texte'}
            </button>
          </form>
        )}

        {/* Tab 4: Rattrapage */}
        {activeTab === 'rattrapage' && (
          <form onSubmit={handleRattrapageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#d97706' }}>
                Programmation d'un Cours de Rattrapage
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                Soumettez un créneau de rattrapage au Censeur pour régulariser votre compteur d'heures.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Date Souhaitée :
              </label>
              <input
                type="date"
                value={rattrapageDate}
                onChange={(e) => setRattrapageDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Heure Début :</label>
                <input
                  type="time"
                  value={rattrapageHeureDeb}
                  onChange={(e) => setRattrapageHeureDeb(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Heure Fin :</label>
                <input
                  type="time"
                  value={rattrapageHeureFin}
                  onChange={(e) => setRattrapageHeureFin(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Motif / Cours à remplacer :
              </label>
              <input
                type="text"
                value={rattrapageMotif}
                onChange={(e) => setRattrapageMotif(e.target.value)}
                placeholder="Ex : Rattrapage de la séance manquée du 05 Mai"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Transmission...' : 'Soumettre la Demande au Censeur'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
