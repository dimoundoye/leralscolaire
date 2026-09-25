import { X, FileUp, RefreshCw } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function SignatureScannerModal({
  scannerCanvasRef,
  scannerFileInputRef,
  scannerGrayscale,
  scannerImage,
  scannerTarget,
  scannerThreshold,
  setCachetFile,
  setCachetPreview,
  setScannerGrayscale,
  setScannerImage,
  setScannerThreshold,
  setShowSignatureScanner,
  setSignatureFile,
  setSignaturePreview,
}) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-card" style={{ maxWidth: '600px', padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: '1px solid var(--slate-100)',
            paddingBottom: '10px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            {scannerTarget === 'signature' ? 'Numérisation (Scan) de Signature' : 'Numérisation (Scan) du Cachet'}
          </h2>
          <button
            type="button"
            onClick={() => setShowSignatureScanner(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
          >
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
              style={{
                height: '200px',
                border: '2px dashed var(--slate-300)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: '#f8fafc',
                cursor: 'pointer',
              }}
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
                onChange={(e) => {
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
              <div
                style={{
                  position: 'relative',
                  border: '1px solid var(--slate-200)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#e2e8f0',
                  minHeight: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                }}
              >
                <canvas ref={scannerCanvasRef} style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' }} />
                <button
                  type="button"
                  onClick={() => setScannerImage(null)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '14px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--slate-700)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Seuil de tolérance du fond
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--primary-color)',
                        background: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid var(--slate-200)',
                      }}
                    >
                      {scannerThreshold}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="250"
                    value={scannerThreshold}
                    onChange={(e) => setScannerThreshold(parseInt(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--slate-400)' }}>
                    Ajustez pour effacer les ombres ou impuretés du papier blanc.
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--slate-200)',
                    paddingTop: '10px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--slate-700)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {scannerTarget === 'signature'
                      ? 'Tracé noir pur (Monochrome)'
                      : 'Forcer le noir pur (Monochrome optionnel)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={scannerGrayscale}
                    onChange={(e) => setScannerGrayscale(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '20px',
            borderTop: '1px solid var(--slate-100)',
            paddingTop: '16px',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={() => setShowSignatureScanner(false)}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!scannerImage}
            onClick={() => {
              const canvas = scannerCanvasRef.current;
              if (canvas) {
                canvas.toBlob((blob) => {
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
  );
}
