import { Camera, AlertTriangle, FileText, Loader2 } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function EleveFormModal({
  classes,
  editPhotoInputRef,
  editingEleve,
  elevesAnneeFilter,
  handleAddEleve,
  handleUpdateEleve,
  loading,
  newEleve,
  photoInputRef,
  setEditingEleve,
  setNewEleve,
  setShowEleveModal,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '700px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '12px',
          }}
        >
          <img
            src="/logo_leralscolaire.png"
            alt="LéralScolaire"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h3 style={{ margin: 0 }}>{editingEleve ? "Modifier l'élève" : 'Inscrire un Élève'}</h3>
        </div>
        <form onSubmit={editingEleve ? handleUpdateEleve : handleAddEleve}>
          <div className="form-row">
            <div style={{ flex: '0 0 100px' }}>
              <div
                className="photo-upload-container"
                onClick={() => (editingEleve ? editPhotoInputRef.current.click() : photoInputRef.current.click())}
              >
                {(() => {
                  const src = editingEleve
                    ? editingEleve.photoPreview || (editingEleve.photo_url ? `${editingEleve.photo_url}` : null)
                    : newEleve.photoPreview;
                  return src ? (
                    <img src={src} alt="Preview" className="photo-preview" />
                  ) : (
                    <Camera size={32} color="#CBD5E0" />
                  );
                })()}
              </div>
              <input
                type="file"
                ref={photoInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setNewEleve({ ...newEleve, photo: file, photoPreview: URL.createObjectURL(file) });
                }}
              />
              <input
                type="file"
                ref={editPhotoInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file)
                    setEditingEleve({ ...editingEleve, photoFile: file, photoPreview: URL.createObjectURL(file) });
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div className="form-row">
                <div className="input-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    required
                    value={editingEleve ? editingEleve.prenom : newEleve.prenom}
                    onChange={(e) =>
                      editingEleve
                        ? setEditingEleve({ ...editingEleve, prenom: e.target.value })
                        : setNewEleve({ ...newEleve, prenom: e.target.value })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    required
                    value={editingEleve ? editingEleve.nom : newEleve.nom}
                    onChange={(e) =>
                      editingEleve
                        ? setEditingEleve({ ...editingEleve, nom: e.target.value })
                        : setNewEleve({ ...newEleve, nom: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Civilité / Sexe</label>
              <select
                value={editingEleve ? editingEleve.sexe || 'M' : newEleve.sexe || 'M'}
                onChange={(e) =>
                  editingEleve
                    ? setEditingEleve({ ...editingEleve, sexe: e.target.value })
                    : setNewEleve({ ...newEleve, sexe: e.target.value })
                }
              >
                <option value="M">Masculin (M.)</option>
                <option value="F">Féminin (Mme / Mlle)</option>
              </select>
            </div>
            <div className="input-group">
              <label>Date de Naissance</label>
              <input
                type="date"
                required
                value={editingEleve ? editingEleve.date_naissance?.split('T')[0] : newEleve.date_naissance}
                onChange={(e) =>
                  editingEleve
                    ? setEditingEleve({ ...editingEleve, date_naissance: e.target.value })
                    : setNewEleve({ ...newEleve, date_naissance: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Lieu de Naissance</label>
              <input
                type="text"
                value={editingEleve ? editingEleve.lieu_naissance : newEleve.lieu_naissance}
                onChange={(e) =>
                  editingEleve
                    ? setEditingEleve({ ...editingEleve, lieu_naissance: e.target.value })
                    : setNewEleve({ ...newEleve, lieu_naissance: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>Nationalité</label>
              <input
                type="text"
                value={editingEleve ? editingEleve.nationalite : newEleve.nationalite}
                onChange={(e) =>
                  editingEleve
                    ? setEditingEleve({ ...editingEleve, nationalite: e.target.value })
                    : setNewEleve({ ...newEleve, nationalite: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Téléphone *</label>
              <input
                type="text"
                required
                value={editingEleve ? editingEleve.telephone || '' : newEleve.telephone}
                onChange={(e) =>
                  editingEleve
                    ? setEditingEleve({ ...editingEleve, telephone: e.target.value })
                    : setNewEleve({ ...newEleve, telephone: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>Email (Élève ou Parent / Tuteur) *</label>
              <input
                type="email"
                required
                placeholder="parent@gmail.com ou eleve@sn.sn"
                value={editingEleve ? editingEleve.email || '' : newEleve.email}
                onChange={(e) =>
                  editingEleve
                    ? setEditingEleve({ ...editingEleve, email: e.target.value })
                    : setNewEleve({ ...newEleve, email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group" style={{ flex: 1 }}>
              <label>Coordonnées Parent (Nom, Adresse)</label>
              <input
                type="text"
                value={editingEleve ? editingEleve.coordonnees_parent || '' : newEleve.coordonnees_parent}
                onChange={(e) =>
                  editingEleve
                    ? setEditingEleve({ ...editingEleve, coordonnees_parent: e.target.value })
                    : setNewEleve({ ...newEleve, coordonnees_parent: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Statut</label>
              <select
                value={editingEleve ? editingEleve.statut : newEleve.statut}
                onChange={(e) =>
                  editingEleve
                    ? setEditingEleve({ ...editingEleve, statut: e.target.value })
                    : setNewEleve({ ...newEleve, statut: e.target.value })
                }
              >
                <option value="APTE">Apte</option>
                <option value="INAPTE">Inapte</option>
              </select>
            </div>
            {!editingEleve && (
              <div className="input-group">
                <label>Classe</label>
                <select
                  required
                  value={newEleve.classe_id}
                  onChange={(e) => setNewEleve({ ...newEleve, classe_id: e.target.value })}
                >
                  <option value="">Sélectionner</option>
                  {classes
                    .filter((c) => c.annee_scolaire === elevesAnneeFilter)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom} ({c.annee_scolaire})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Justificatif obligatoire si INAPTE */}
          {(editingEleve ? editingEleve.statut : newEleve.statut) === 'INAPTE' && (
            <div
              style={{
                background: '#fff7ed',
                border: '2px solid #fb923c',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 12,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#c2410c',
                  marginBottom: 8,
                }}
              >
                <AlertTriangle size={16} /> Pièce Justificative (obligatoire pour statut Inapte)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                required={editingEleve ? !editingEleve.justificatif_inapte_url : true}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (editingEleve) setEditingEleve({ ...editingEleve, justificatifFile: file });
                  else setNewEleve({ ...newEleve, justificatif_inapte: file });
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 8,
                  border: '1px solid #fed7aa',
                  background: '#fff',
                }}
              />
              <p style={{ fontSize: 11, color: '#92400e', marginTop: 6, marginBottom: 0 }}>
                📄 Formats acceptés : PDF, JPG, PNG — Max 5 Mo
              </p>
              {editingEleve?.justificatif_inapte_url && (
                <a
                  href={`${editingEleve.justificatif_inapte_url}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 8,
                    fontSize: 12,
                    color: '#2563eb',
                    fontWeight: 700,
                  }}
                >
                  <FileText size={14} /> Voir le justificatif actuel
                </a>
              )}
            </div>
          )}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowEleveModal(false);
                setEditingEleve(null);
              }}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : editingEleve ? 'Enregistrer' : 'Inscrire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
