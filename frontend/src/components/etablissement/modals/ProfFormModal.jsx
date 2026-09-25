import { Loader2 } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function ProfFormModal({
  assignClasseId,
  assignMatiereId,
  classes,
  editingProf,
  handleAddAssignment,
  handleAddProf,
  handleDeleteAssignment,
  handleInviteProf,
  handleSearchProf,
  loading,
  matieres,
  newProf,
  profAssignments,
  profModalTab,
  profSearchId,
  searchError,
  searchLoading,
  searchedProf,
  setAssignClasseId,
  setAssignMatiereId,
  setEditingProf,
  setNewProf,
  setProfModalTab,
  setProfSearchId,
  setSearchError,
  setSearchedProf,
  setShowProfModal,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: editingProf ? '650px' : '500px', width: '90%' }}>
        <h3>{editingProf ? 'Modifier Professeur' : 'Nouveau Professeur'}</h3>

        {!editingProf && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setProfModalTab('invite');
                setSearchedProf(null);
                setSearchError('');
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'none',
                border: 'none',
                borderBottom: profModalTab === 'invite' ? '3px solid var(--accent-color)' : 'none',
                fontWeight: profModalTab === 'invite' ? '700' : '500',
                color: profModalTab === 'invite' ? 'var(--primary-color)' : 'var(--slate-500)',
                cursor: 'pointer',
              }}
            >
              Inviter par ID National
            </button>
            <button
              type="button"
              onClick={() => {
                setProfModalTab('create');
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'none',
                border: 'none',
                borderBottom: profModalTab === 'create' ? '3px solid var(--accent-color)' : 'none',
                fontWeight: profModalTab === 'create' ? '700' : '500',
                color: profModalTab === 'create' ? 'var(--primary-color)' : 'var(--slate-500)',
                cursor: 'pointer',
              }}
            >
              Créer un compte
            </button>
          </div>
        )}

        {profModalTab === 'invite' && !editingProf ? (
          <div>
            <form onSubmit={handleSearchProf} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Identifiant National Enseignant</label>
                <input
                  type="text"
                  required
                  placeholder="ex: ENS-2026-DKR-000101"
                  value={profSearchId}
                  onChange={(e) => setProfSearchId(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '13px' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={searchLoading}
                style={{
                  alignSelf: 'flex-end',
                  height: '38px',
                  background: 'var(--primary-color)',
                  borderColor: 'var(--primary-color)',
                }}
              >
                {searchLoading ? <Loader2 className="animate-spin" size={16} /> : 'Rechercher'}
              </button>
            </form>

            {searchError && (
              <div
                style={{
                  color: '#991b1b',
                  background: '#fee2e2',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  marginBottom: '16px',
                  fontWeight: 600,
                }}
              >
                ⚠️ {searchError}
              </div>
            )}

            {searchedProf && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(19, 30, 108, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: 'var(--primary-color)',
                    }}
                  >
                    {searchedProf.prenom ? `${searchedProf.prenom[0]}${searchedProf.nom[0]}`.toUpperCase() : 'EP'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--primary-color)' }}>
                      {searchedProf.prenom} {searchedProf.nom}
                    </h4>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--slate-500)' }}>
                      ID : <code>{searchedProf.identifiant_national}</code>
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--slate-500)' }}>
                      Matière : <strong>{searchedProf.matiere_principale || 'Non spécifiée'}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setShowProfModal(false);
                  setProfSearchId('');
                  setSearchedProf(null);
                  setSearchError('');
                }}
              >
                Fermer
              </button>
              {searchedProf && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleInviteProf}
                  disabled={loading}
                  style={{ background: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Envoyer l'invitation"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <form onSubmit={handleAddProf} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={editingProf ? editingProf.email : newProf.email}
                    onChange={(e) =>
                      editingProf
                        ? setEditingProf({ ...editingProf, email: e.target.value })
                        : setNewProf({ ...newProf, email: e.target.value })
                    }
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>{editingProf ? 'Nouveau Mot de passe (optionnel)' : 'Mot de passe'}</label>
                  <input
                    type="password"
                    required={!editingProf}
                    value={editingProf ? editingProf.password || '' : newProf.password}
                    onChange={(e) =>
                      editingProf
                        ? setEditingProf({ ...editingProf, password: e.target.value })
                        : setNewProf({ ...newProf, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Civilité / Sexe</label>
                  <select
                    value={editingProf ? editingProf.sexe || 'M' : newProf.sexe || 'M'}
                    onChange={(e) =>
                      editingProf
                        ? setEditingProf({ ...editingProf, sexe: e.target.value })
                        : setNewProf({ ...newProf, sexe: e.target.value })
                    }
                    style={{
                      padding: '9px 12px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      background: '#f8fafc',
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="M">Masculin (Mr.)</option>
                    <option value="F">Féminin (Mme.)</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowProfModal(false);
                    setEditingProf(null);
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={16} /> : 'Enregistrer'}
                </button>
              </div>
            </form>

            {editingProf && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--primary-color)' }}>
                  Affectations (Classes & Matières)
                </h4>

                <form
                  onSubmit={handleAddAssignment}
                  style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-end' }}
                >
                  <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Classe</label>
                    <select
                      required
                      value={assignClasseId}
                      onChange={(e) => setAssignClasseId(e.target.value)}
                      style={{ padding: '8px', fontSize: '13px' }}
                    >
                      <option value="">Sélectionner</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom} ({c.annee_scolaire})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Matière</label>
                    <select
                      required
                      value={assignMatiereId}
                      onChange={(e) => setAssignMatiereId(e.target.value)}
                      style={{ padding: '8px', fontSize: '13px' }}
                    >
                      <option value="">Sélectionner</option>
                      {matieres.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{
                      height: '36px',
                      background: 'var(--accent-color)',
                      borderColor: 'var(--accent-color)',
                      fontSize: '12px',
                    }}
                  >
                    Affecter
                  </button>
                </form>

                <div
                  style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px',
                  }}
                >
                  {profAssignments.map((asg) => (
                    <div
                      key={asg.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 12px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        marginBottom: '6px',
                        fontSize: '12px',
                      }}
                    >
                      <span>
                        Classe :{' '}
                        <strong>
                          {asg.classe_nom} {asg.annee_scolaire ? `(${asg.annee_scolaire})` : ''}
                        </strong>{' '}
                        | Matière : <strong>{asg.matiere_nom}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAssignment(asg.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                  {profAssignments.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '10px', fontSize: '11px' }}>
                      Aucune affectation de classe/matière en cours.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
