import React, { useEffect } from 'react';

const AdminBaremesTab = ({
  baremes,
  setBaremes,
  baremesSaving,
  setBaremesSaving,
  showNotification
}) => {
  useEffect(() => {
    if (baremes.length === 0 && !baremesSaving) {
      const token = localStorage.getItem('token');
      fetch('/api/etablissement/baremes', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()).then(data => { if (Array.isArray(data)) setBaremes(data); }).catch(console.error);
    }
  }, []);

  return (
    <div className="settings-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Barèmes d'Appréciation</h1>
          <p className="page-subtitle">Définissez les appréciations automatiques selon les notes. Elles seront appliquées automatiquement dans le portail des professeurs.</p>
        </div>
      </div>

      <div className="table-block" style={{ maxWidth: '800px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--primary-color)' }}>Grille de notation (sur 20)</h3>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 14px' }}
            onClick={() => setBaremes([...baremes, { note_min: '', note_max: '', appreciation: '', couleur: '#64748b' }])}
          >
            + Ajouter un palier
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {baremes.map((b, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', borderRadius: '10px', padding: '12px 16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto' }}>
                <input
                  type="color"
                  value={b.couleur || '#64748b'}
                  onChange={e => { const n = [...baremes]; n[idx] = { ...n[idx], couleur: e.target.value }; setBaremes(n); }}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '2px solid #e2e8f0', cursor: 'pointer', padding: '2px' }}
                  title="Couleur du palier"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Note min</label>
                <input
                  type="number" step="0.01" min="0" max="20"
                  value={b.note_min}
                  onChange={e => { const n = [...baremes]; n[idx] = { ...n[idx], note_min: e.target.value }; setBaremes(n); }}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Note max</label>
                <input
                  type="number" step="0.01" min="0" max="20"
                  value={b.note_max}
                  onChange={e => { const n = [...baremes]; n[idx] = { ...n[idx], note_max: e.target.value }; setBaremes(n); }}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}
                />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Appréciation</label>
                <input
                  type="text"
                  placeholder="ex: Très Bien"
                  value={b.appreciation}
                  onChange={e => { const n = [...baremes]; n[idx] = { ...n[idx], appreciation: e.target.value }; setBaremes(n); }}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', background: b.couleur || '#64748b', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                  {b.appreciation || '—'}
                </span>
                <button
                  type="button"
                  onClick={() => setBaremes(baremes.filter((_, i) => i !== idx))}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', lineHeight: 1 }}
                  title="Supprimer ce palier"
                >✕</button>
              </div>
            </div>
          ))}
          {baremes.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px', border: '2px dashed #e2e8f0', borderRadius: '10px' }}>
              Aucun barème défini. Cliquez sur "+ Ajouter un palier" pour commencer.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={baremesSaving}
            onClick={async () => {
              setBaremesSaving(true);
              const token = localStorage.getItem('token');
              try {
                const res = await fetch('/api/etablissement/baremes', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ baremes })
                });
                const data = await res.json();
                if (res.ok) {
                  showNotification('Barèmes sauvegardés avec succès !', 'success');
                } else {
                  showNotification(data.message || 'Erreur lors de la sauvegarde.', 'error');
                }
              } catch (err) {
                console.error(err);
                showNotification('Erreur de connexion au serveur.', 'error');
              } finally {
                setBaremesSaving(false);
              }
            }}
          >
            {baremesSaving ? '⏳ Sauvegarde...' : 'Sauvegarder les barèmes'}
          </button>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6366f1', fontWeight: '600' }}>Ces barèmes s'appliquent automatiquement dans l'onglet saisie des notes du portail enseignant. Dès qu'un professeur entre une note, l'appréciation est calculée et affichée en lecture seule selon votre grille.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminBaremesTab;
