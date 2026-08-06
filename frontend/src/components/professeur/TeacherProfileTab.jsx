import React from 'react';

const TeacherProfileTab = ({
  editProfileData,
  setEditProfileData,
  handleUpdateProfile
}) => {
  return (
    <div className="tab-pane">
      <div className="card-box" style={{ maxWidth: '600px' }}>
        <h3>Profil Académique Certifié</h3>
        <p className="subtitle" style={{ fontSize: '12px', color: 'var(--text-slate-500)', marginBottom: '20px' }}>
          Ces informations sont affichées sur votre identifiant de professeur et visibles par les établissements qui vous invitent.
        </p>

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Prénom</label>
              <input
                type="text"
                required
                value={editProfileData.prenom}
                onChange={e => setEditProfileData({ ...editProfileData, prenom: e.target.value })}
              />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Nom</label>
              <input
                type="text"
                required
                value={editProfileData.nom}
                onChange={e => setEditProfileData({ ...editProfileData, nom: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Téléphone</label>
            <input
              type="text"
              required
              placeholder="+221 77 123 45 67"
              value={editProfileData.telephone}
              onChange={e => setEditProfileData({ ...editProfileData, telephone: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Matière principale enseignée</label>
            <input
              type="text"
              required
              placeholder="ex: Mathématiques"
              value={editProfileData.matiere_principale}
              onChange={e => setEditProfileData({ ...editProfileData, matiere_principale: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>URL de votre photo de profil (Optionnelle)</label>
            <input
              type="text"
              placeholder="/uploads/prof_avatar.jpg"
              value={editProfileData.photo_url}
              onChange={e => setEditProfileData({ ...editProfileData, photo_url: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ background: 'var(--primary-blue)', borderColor: 'var(--primary-blue)', alignSelf: 'flex-start', padding: '10px 24px' }}>
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherProfileTab;
