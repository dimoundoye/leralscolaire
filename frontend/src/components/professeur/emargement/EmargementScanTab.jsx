import { Camera, RefreshCw, FlipHorizontal, CameraOff, AlertCircle, CheckCircle } from 'lucide-react';

// Onglet extrait de ProfDashboardEmargement.jsx
export default function EmargementScanTab({
  availableCameras,
  cameraError,
  handleFileScan,
  handleScanQrSubmit,
  isCameraActive,
  isCameraStarting,
  loading,
  qrTokenInput,
  setQrTokenInput,
  setShowManualInput,
  showManualInput,
  startCamera,
  stopCamera,
  switchCamera,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <h3
          style={{
            margin: '0 0 4px',
            fontSize: '16px',
            fontWeight: 800,
            color: '#131e6c',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Camera size={20} color="#131e6c" /> Scan Direct Caméra (QR 20s)
        </h3>
        <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
          Activez votre caméra et visez l'écran du surveillant ou le moniteur d'affichage pour valider instantanément
          votre présence.
        </p>
      </div>

      {/* CAMERA VIEWFINDER CONTAINER */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: isCameraActive || isCameraStarting ? '340px' : '230px',
          background: '#090d16',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: isCameraActive ? '2px solid #38bdf8' : '1px dashed #cbd5e1',
          boxShadow: isCameraActive ? '0 10px 25px -5px rgba(56, 189, 248, 0.3)' : 'none',
        }}
      >
        {/* Real Video Reader Viewport - MUST have physical dimensions in DOM so Html5Qrcode can attach */}
        <div
          id="ls-camera-reader-viewport"
          style={{
            width: '100%',
            minHeight: isCameraActive || isCameraStarting ? '340px' : '1px',
            display: isCameraActive || isCameraStarting ? 'block' : 'none',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        />

        {/* State: Camera Inactive Overlay */}
        {!isCameraActive && !isCameraStarting && (
          <div style={{ textAlign: 'center', padding: '24px 20px', color: '#94a3b8', zIndex: 5 }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Camera size={32} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
              Caméra en veille
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '300px', margin: '0 auto 16px' }}>
              Pointez votre caméra vers le QR Code affiché sur l'écran (renouvelé toutes les 20 secondes).
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => startCamera()}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Camera size={16} /> Activer la Caméra en Direct
              </button>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                id="qr-photo-input"
                style={{ display: 'none' }}
                onChange={handleFileScan}
              />
              <button
                type="button"
                onClick={() => document.getElementById('qr-photo-input')?.click()}
                style={{
                  padding: '12px 18px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Camera size={16} color="#38bdf8" /> Scanner via Photo / Image
              </button>
            </div>
          </div>
        )}

        {/* State: Starting / Loading */}
        {isCameraStarting && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(9, 13, 22, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '30px',
              color: '#ffffff',
              zIndex: 15,
            }}
          >
            <RefreshCw className="animate-spin" size={36} color="#38bdf8" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700 }}>Initialisation de la caméra...</div>
            <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '6px' }}>
              Veuillez autoriser l'accès caméra si votre navigateur le demande.
            </div>
          </div>
        )}

        {/* Laser Overlay Animation when Active */}
        {isCameraActive && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
              pointerEvents: 'auto',
            }}
          >
            <span
              style={{
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                color: '#22c55e',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              Caméra Active
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              {availableCameras.length > 1 && (
                <button
                  type="button"
                  onClick={switchCamera}
                  title="Changer de caméra (Avant / Arrière)"
                  style={{
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <FlipHorizontal size={14} /> Retourner
                </button>
              )}

              <button
                type="button"
                onClick={stopCamera}
                title="Éteindre la caméra"
                style={{
                  background: 'rgba(239, 68, 68, 0.85)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CameraOff size={14} /> Arrêter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Camera Error Message */}
      {cameraError && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} flexShrink={0} />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Scanned Token Field / Fallback */}
      <form onSubmit={handleScanQrSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Token Scanné :</label>
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {showManualInput ? 'Masquer saisie manuelle' : 'Saisir manuellement'}
            </button>
          </div>

          {(showManualInput || qrTokenInput) && (
            <input
              type="text"
              value={qrTokenInput}
              onChange={(e) => setQrTokenInput(e.target.value)}
              placeholder="Collez le token si la caméra est indisponible..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: qrTokenInput ? '2px solid #22c55e' : '1px solid #cbd5e1',
                fontSize: '12px',
                fontFamily: 'monospace',
                background: qrTokenInput ? '#f0fdf4' : '#f8fafc',
                color: '#0f172a',
              }}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !qrTokenInput}
          style={{
            padding: '13px',
            background: qrTokenInput ? 'linear-gradient(135deg, #131e6c 0%, #1d2c94 100%)' : '#cbd5e1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: qrTokenInput ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: qrTokenInput ? '0 4px 12px rgba(19, 30, 108, 0.25)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <CheckCircle size={16} />
          {loading
            ? 'Validation en cours...'
            : qrTokenInput
              ? "Valider l'Émargement Physique"
              : 'Scannez le QR Code pour valider'}
        </button>
      </form>
    </div>
  );
}
