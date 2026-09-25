import { Bell, X } from 'lucide-react';

// Fenêtre modale extraite de TeacherDashboard.jsx
export default function NotificationsDrawer({ handleMarkAsRead, notifications, setShowNotificationsDrawer }) {
  return (
    <div className="modal-overlay" onClick={() => setShowNotificationsDrawer(false)}>
      <div
        className="modal-card"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          height: '100%',
          maxWidth: '400px',
          width: '100%',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
          background: 'white',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} /> Alertes de cours
          </h3>
          <button
            onClick={() => setShowNotificationsDrawer(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-slate-400)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingRight: '4px',
          }}
        >
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-slate-400)', fontSize: '13px' }}>
              Aucune notification.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: notif.lu ? '#f8fafc' : '#eff6ff',
                  border: `1px solid ${notif.lu ? 'var(--border-slate-200)' : '#bfdbfe'}`,
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onClick={() => handleMarkAsRead(notif.id)}
              >
                {!notif.lu && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      width: '8px',
                      height: '8px',
                      background: '#3b82f6',
                      borderRadius: '50%',
                    }}
                  ></span>
                )}
                <h4
                  style={{
                    margin: '0 0 4px',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: notif.lu ? 'var(--text-slate-800)' : '#1e3a8a',
                  }}
                >
                  {notif.titre}
                </h4>
                <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'var(--text-slate-600)', lineHeight: 1.4 }}>
                  {notif.description}
                </p>
                <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>
                  {new Date(notif.created_at).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
