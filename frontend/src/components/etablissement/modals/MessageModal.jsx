// Fenêtre modale extraite de Dashboard.jsx
export default function MessageModal({
  classes,
  eleves,
  handleSendMessage,
  loading,
  newMessage,
  profs,
  setNewMessage,
  setShowMessageModal,
  setStudentSearchQuery,
  studentSearchQuery,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Nouveau Message / Diffusion</h3>
        <form onSubmit={handleSendMessage}>
          <div className="input-group">
            <label>Destinataire Type</label>
            <select
              value={newMessage.destinataire_type}
              onChange={(e) => setNewMessage({ ...newMessage, destinataire_type: e.target.value, destinataire_id: '' })}
            >
              <option value="CLASSE">Une Classe (Diffusion)</option>
              <option value="ELEVE">Un Élève</option>
              <option value="PROFESSEUR">Un Enseignant</option>
              <option value="OFFICE_BAC">Office du Bac</option>
            </select>
          </div>

          {newMessage.destinataire_type === 'CLASSE' && (
            <div className="input-group">
              <label>Classe</label>
              <select
                required
                value={newMessage.destinataire_id}
                onChange={(e) => setNewMessage({ ...newMessage, destinataire_id: e.target.value })}
              >
                <option value="">Sélectionner la classe</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.annee_scolaire})
                  </option>
                ))}
              </select>
            </div>
          )}

          {newMessage.destinataire_type === 'ELEVE' && (
            <>
              <div className="input-group" style={{ marginBottom: '10px' }}>
                <label>Rechercher un élève</label>
                <input
                  type="text"
                  placeholder="Tapez le nom, prénom ou identifiant..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div className="input-group">
                <label>Élève destinataire</label>
                {(() => {
                  const filtered = eleves.filter((el) => {
                    const q = studentSearchQuery.toLowerCase().trim();
                    if (!q) return true;
                    const fullName = `${el.prenom} ${el.nom}`.toLowerCase();
                    const nationalId = (el.identifiant_national || '').toLowerCase();
                    const classeName = (el.classe_nom || '').toLowerCase();
                    return fullName.includes(q) || nationalId.includes(q) || classeName.includes(q);
                  });
                  return (
                    <select
                      required
                      value={newMessage.destinataire_id}
                      onChange={(e) => setNewMessage({ ...newMessage, destinataire_id: e.target.value })}
                    >
                      <option value="">
                        {filtered.length === 0 ? 'Aucun élève trouvé' : `Sélectionner l'élève (${filtered.length})`}
                      </option>
                      {filtered.map((el) => (
                        <option key={el.id} value={el.user_id}>
                          {el.prenom} {el.nom} ({el.identifiant_national || 'Sans ID'}) -{' '}
                          {el.classe_nom || 'Sans classe'}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>
            </>
          )}

          {newMessage.destinataire_type === 'PROFESSEUR' && (
            <div className="input-group">
              <label>Enseignant destinataire</label>
              <select
                required
                value={newMessage.destinataire_id}
                onChange={(e) => setNewMessage({ ...newMessage, destinataire_id: e.target.value })}
              >
                <option value="">Sélectionner l'enseignant</option>
                {profs
                  .filter((p) => p.statut === 'ACCEPTE')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.prenom && p.nom ? `${p.prenom} ${p.nom}` : p.email} (
                      {p.matiere_principale || 'Matière non spécifiée'})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="input-group">
            <label>Sujet</label>
            <input
              type="text"
              required
              value={newMessage.sujet}
              onChange={(e) => setNewMessage({ ...newMessage, sujet: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Contenu</label>
            <textarea
              required
              rows="4"
              style={{ width: '100%', borderRadius: '10px', padding: '0.8rem', border: '2px solid #E2E8F0' }}
              value={newMessage.contenu}
              onChange={(e) => setNewMessage({ ...newMessage, contenu: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowMessageModal(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
