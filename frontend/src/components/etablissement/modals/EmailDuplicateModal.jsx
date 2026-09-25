import { AlertTriangle, Check } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function EmailDuplicateModal({
  emailDuplicateModal,
  handleValidatePreInscription,
  newStudentEmail,
  resolvingDuplicateEmail,
  setEmailDuplicateModal,
  setNewStudentEmail,
}) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="modal-card" style={{ maxWidth: 520, padding: '28px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: '#fff7ed',
              border: '1.5px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#9a3412' }}>
              Conflit d'adresse Email détecté
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#c2410c' }}>
              Validation impossible pour l'élève <strong>{emailDuplicateModal.eleveNom}</strong>
            </p>
          </div>
        </div>

        <div
          style={{
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: 10,
            padding: '14px 16px',
            fontSize: 13,
            color: '#92400e',
            lineHeight: 1.5,
            marginBottom: 18,
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>
            L'adresse email{' '}
            <code
              style={{
                background: '#fef3c7',
                padding: '2px 6px',
                borderRadius: 4,
                color: '#b45309',
                fontWeight: 800,
              }}
            >
              {emailDuplicateModal.email}
            </code>{' '}
            est déjà enregistrée dans le système LéralScolaire.
          </p>
          <div
            style={{
              fontSize: 12,
              background: 'rgba(255,255,255,0.8)',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #fef08a',
            }}
          >
            • <strong>Règle de sécurité &amp; confidentialité :</strong> Chaque compte doit disposer d'une adresse email
            unique afin de garantir la réception sécurisée de ses accès et de ses notifications.
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newStudentEmail.trim()) return;
            handleValidatePreInscription(emailDuplicateModal.preInscriptionId, newStudentEmail.trim());
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              Renseigner une autre adresse email pour cet élève (ou son tuteur) :
            </label>
            <input
              type="email"
              required
              autoFocus
              placeholder="ex: parent2@gmail.com ou eleve@gmail.com"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #cbd5e1',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
              Cette nouvelle adresse sera mise à jour dans le dossier et recevra instantanément les identifiants de
              l'élève.
            </span>
          </div>

          <div className="flex gap-2 justify-end" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={resolvingDuplicateEmail}
              onClick={() => {
                setEmailDuplicateModal(null);
                setNewStudentEmail('');
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={resolvingDuplicateEmail || !newStudentEmail.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Check size={16} />
              {resolvingDuplicateEmail ? 'Mise à jour & Validation…' : "Modifier l'email & Valider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
