import { GraduationCap, Check, Copy } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function EnrollmentSuccessModal({ copiedId, copiedPass, handleCopy, setShowSuccessModal, successData }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card animate-fade-in" style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div className="success-icon-large">
          <GraduationCap size={48} color="white" />
        </div>
        <h2 style={{ margin: '1.5rem 0 0.5rem' }}>Inscription Réussie !</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Veuillez noter ou imprimer les identifiants provisoires de l'élève.
        </p>
        <div className="credential-box">
          <label>Identifiant National</label>
          <div className="credential-row">
            <code>{successData.identifiant}</code>
            <button
              className={`btn-icon-small ${copiedId ? 'status-pass' : ''}`}
              onClick={() => handleCopy(successData.identifiant, 'id')}
              title="Copier"
            >
              {copiedId ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        <div className="credential-box">
          <label>Mot de passe provisoire</label>
          <div className="credential-row">
            <code>{successData.password}</code>
            <button
              className={`btn-icon-small ${copiedPass ? 'status-pass' : ''}`}
              onClick={() => handleCopy(successData.password, 'pass')}
              title="Copier"
            >
              {copiedPass ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '2.5rem' }}>
          <button className="btn btn-primary" onClick={() => setShowSuccessModal(false)} style={{ width: '100%' }}>
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
}
