// Fenêtre modale extraite de TeacherDashboard.jsx
export default function ScheduleSyncModal({ profile, setShowSyncModal, showNotification }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '480px' }}>
        <h3>Synchroniser votre Emploi du Temps</h3>
        <p
          className="subtitle"
          style={{ fontSize: '12.5px', color: 'var(--text-slate-500)', marginBottom: '16px', lineHeight: 1.5 }}
        >
          Copiez ce lien pour ajouter votre emploi du temps consolidé en temps réel dans votre agenda externe (Google
          Calendar, Apple iCal, Outlook, etc.).
        </p>

        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label>Lien de synchronisation (iCal)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value={`/api/professeurs-portal/public-schedule/ical/${profile?.id}`}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid var(--border-slate-200)',
                borderRadius: '8px',
                fontSize: '11px',
                background: '#f8fafc',
                fontWeight: 600,
              }}
              onClick={(e) => e.target.select()}
            />
            <button
              className="btn btn-outline"
              onClick={() => {
                navigator.clipboard.writeText(`/api/professeurs-portal/public-schedule/ical/${profile?.id}`);
                showNotification('Lien copié dans le presse-papier !');
              }}
              style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              Copier
            </button>
          </div>
        </div>

        <div
          style={{
            background: '#f0f9ff',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #bae6fd',
            fontSize: '11.5px',
            color: '#0369a1',
            lineHeight: 1.5,
          }}
        >
          <strong> Comment faire ?</strong>
          <br />• Dans <strong>Google Calendar</strong>: Cliquez sur le bouton "+" à côté de "Autres agendas",
          sélectionnez "À partir de l'URL" et collez le lien.
          <br />• Dans <strong>Apple iCal</strong>: Sélectionnez Fichier &gt; Nouvel abonnement calendrier, et collez le
          lien.
        </div>

        <div className="modal-actions" style={{ marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={() => setShowSyncModal(false)}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
