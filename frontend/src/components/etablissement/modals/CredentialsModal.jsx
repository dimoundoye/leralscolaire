import { CheckCircle2 } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function CredentialsModal({ generatedCreds, setShowCredsModal, showNotification }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card text-center" style={{ maxWidth: 400 }}>
        <div style={{ color: '#16a34a', marginBottom: 16 }}>
          <CheckCircle2 size={56} style={{ margin: '0 auto' }} />
        </div>
        <h2>Inscription Validée !</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 20 }}>
          Le compte élève a été configuré avec succès. Voici les accès de connexion :
        </p>

        <div
          style={{
            background: 'var(--gray-50)',
            border: '1px solid var(--gray-200)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'left',
            marginBottom: 20,
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase' }}>
              Identifiant National (Login)
            </span>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--gray-800)',
                marginTop: 2,
                fontFamily: 'monospace',
              }}
            >
              {generatedCreds.identifiant}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase' }}>
              Mot de passe de l'élève
            </span>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#15803d', marginTop: 2, fontFamily: 'monospace' }}>
              {generatedCreds.password}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 20 }}>
          Veuillez copier ces accès et les transmettre à l'élève ou à ses parents.
        </p>

        <div className="flex gap-2 justify-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              navigator.clipboard.writeText(
                `Identifiant: ${generatedCreds.identifiant}\nMot de passe: ${generatedCreds.password}`
              );
              showNotification('Identifiants copiés dans le presse-papier !');
            }}
          >
            Copier les accès
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowCredsModal(false)}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
