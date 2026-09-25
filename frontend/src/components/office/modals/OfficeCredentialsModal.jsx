import { CheckCircle, X, Key, Check, Copy } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function OfficeCredentialsModal({ copied, credentialsModalData, setCopied, setCredentialsModalData }) {
  return (
    <div className="ob-modal-overlay" onClick={() => setCredentialsModalData(null)}>
      <div className="ob-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header" style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
          <h3 style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={20} /> {credentialsModalData.title}
          </h3>
          <button onClick={() => setCredentialsModalData(null)}>
            <X size={20} />
          </button>
        </div>
        <div className="ob-modal-body">
          <p style={{ fontSize: 13, color: '#475569' }}>
            Un compte sécurisé a été automatiquement créé dans le système LeralScolaire. Transmettez ces identifiants à
            l'utilisateur :
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {credentialsModalData.credentials.code_etablissement && (
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  CODE ÉTABLISSEMENT (ID UNIQUE)
                </span>
                <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 800, color: '#131e6c' }}>
                  {credentialsModalData.credentials.code_etablissement}
                </div>
              </div>
            )}

            {credentialsModalData.credentials.identifiant_national && (
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  IDENTIFIANT UNIQUE PROF (IUP)
                </span>
                <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 800, color: '#131e6c' }}>
                  {credentialsModalData.credentials.identifiant_national}
                </div>
              </div>
            )}

            <div>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                EMAIL / LOGIN DE CONNEXION
              </span>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                {credentialsModalData.credentials.login}
              </div>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: 12, borderRadius: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  color: '#b45309',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Key size={13} /> MOT DE PASSE TEMPORAIRE UNIQUE
              </span>
              <div
                style={{
                  fontSize: 18,
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  color: '#b45309',
                  letterSpacing: 1,
                }}
              >
                {credentialsModalData.credentials.temp_password}
              </div>
            </div>
          </div>

          <div className="ob-modal-footer">
            <button
              type="button"
              className="ob-btn ob-btn-primary"
              onClick={() => {
                const text = `Identifiants LeralScolaire :\nLogin: ${credentialsModalData.credentials.login}\nMot de passe temporaire: ${credentialsModalData.credentials.temp_password}`;
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}{' '}
              {copied ? 'Copié dans le presse-papier !' : 'Copier les Identifiants'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
