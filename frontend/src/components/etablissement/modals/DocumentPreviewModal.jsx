import { Printer, FileDown, X } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function DocumentPreviewModal({
  docIframeRef,
  docPreviewModal,
  handleDownloadDocument,
  handlePrintDocument,
  setDocPreviewModal,
}) {
  return (
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
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
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {docPreviewModal.type === 'bulletin' ? (
                <Printer size={20} style={{ color: '#38bdf8' }} />
              ) : (
                <FileDown size={20} style={{ color: '#a855f7' }} />
              )}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                {docPreviewModal.type === 'bulletin' ? 'Bulletin Scolaire' : 'Dossier de Transfert'}
              </h3>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                Élève :{' '}
                <strong style={{ color: '#f8fafc' }}>
                  {docPreviewModal.eleve.prenom} {docPreviewModal.eleve.nom}
                </strong>{' '}
                ({docPreviewModal.eleve.classe_nom || 'Sans classe'})
              </span>
            </div>
          </div>

          {/* Controls & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Semestre Toggle if Bulletin */}
            {docPreviewModal.type === 'bulletin' && (
              <div
                style={{
                  display: 'flex',
                  background: '#0f172a',
                  borderRadius: '8px',
                  padding: '3px',
                  border: '1px solid #334155',
                  marginRight: '8px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setDocPreviewModal((prev) => ({ ...prev, semestre: 1 }))}
                  style={{
                    padding: '5px 14px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: docPreviewModal.semestre === 1 ? 'var(--primary-color)' : 'transparent',
                    color: docPreviewModal.semestre === 1 ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.2s',
                  }}
                >
                  Semestre 1
                </button>
                <button
                  type="button"
                  onClick={() => setDocPreviewModal((prev) => ({ ...prev, semestre: 2 }))}
                  style={{
                    padding: '5px 14px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: docPreviewModal.semestre === 2 ? 'var(--primary-color)' : 'transparent',
                    color: docPreviewModal.semestre === 2 ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.2s',
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
                cursor: 'pointer',
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
                cursor: 'pointer',
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
                marginLeft: '4px',
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
                ? `/api/documents/bulletin/${docPreviewModal.eleve.id}?semestre=${docPreviewModal.semestre}`
                : `/api/documents/dossier-transfert/${docPreviewModal.eleve.id}`
            }
            title="Prévisualisation du document"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
