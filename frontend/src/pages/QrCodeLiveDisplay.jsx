import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Clock, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function QrCodeLiveDisplay() {
  const { etablissementId } = useParams();
  const targetEtabId = etablissementId || 'default';

  const [qrToken, setQrToken] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  const fetchLiveToken = async () => {
    try {
      const res = await fetch(`http://localhost:5002/api/emargement/live-qr/${targetEtabId}`);
      const data = await res.json();
      if (data.success) {
        setQrToken(data.token);
        setSecondsRemaining(data.expiresInSeconds || 20);
        setError(null);
      } else {
        setError('Impossible d\'obtenir le QR code d\'émargement.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur d\'émargement TOTP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveToken();
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          fetchLiveToken();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetEtabId]);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const progressPercent = ((20 - secondsRemaining) / 20) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #0f172a 100%)',
      color: '#ffffff',
      fontFamily: 'Poppins, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Header Info */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '32px',
        right: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={32} color="#818cf8" />
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
              Leral<span style={{ color: '#f93f2d' }}>Scolaire</span> • Borne d'Émargement Live
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
              Sécurité TOTP HMAC-SHA256 • Renouvellement dynamique (20s)
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '8px 16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Clock size={18} color="#38bdf8" />
          <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'monospace', color: '#38bdf8' }}>
            {currentTimeStr || '00:00:00'}
          </span>
        </div>
      </div>

      {/* Giant QR Card */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '32px',
        padding: '36px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        maxWidth: '620px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1px',
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.12)',
            padding: '6px 14px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '8px'
          }}>
            Scannez avec votre application Enseignant
          </span>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
            Émargement Présence Professeur
          </h2>
        </div>

        {/* QR Code Container */}
        <div style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          border: '4px solid #38bdf8'
        }}>
          {loading ? (
            <div style={{ width: '380px', height: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', color: '#0f172a' }}>
              <RefreshCw className="animate-spin" size={48} style={{ color: '#4f46e5', margin: 'auto' }} />
            </div>
          ) : error ? (
            <div style={{ width: '380px', height: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', textAlign: 'center' }}>
              <AlertCircle size={48} />
              <p style={{ marginTop: 12, fontWeight: 700, fontSize: '14px' }}>{error}</p>
            </div>
          ) : (
            <QRCodeSVG
              value={qrToken}
              size={380}
              level="H"
              includeMargin={false}
            />
          )}
        </div>

        {/* Progress Bar 20s */}
        <div style={{ width: '100%', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', fontWeight: 700 }}>
            <span style={{ color: '#94a3b8' }}>Expiration du code actuel</span>
            <span style={{ color: secondsRemaining <= 5 ? '#f87171' : '#38bdf8', fontFamily: 'monospace', fontSize: '14px' }}>
              {secondsRemaining}s
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: secondsRemaining <= 5 ? 'linear-gradient(90deg, #f87171, #ef4444)' : 'linear-gradient(90deg, #38bdf8, #818cf8)',
              transition: 'width 1s linear'
            }} />
          </div>
        </div>
      </div>

      {/* Footer Notice */}
      <div style={{ position: 'absolute', bottom: '20px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
        LeralScolaire Anti-Fraud Protection System • Ministère de l'Éducation Nationale du Sénégal
      </div>
    </div>
  );
}
