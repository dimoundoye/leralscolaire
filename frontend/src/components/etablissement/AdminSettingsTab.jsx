import React from 'react';
import { Edit, Camera, Loader2 } from 'lucide-react';

const AdminSettingsTab = ({
  handleUpdateProfile,
  profile,
  setProfile,
  signaturePreview,
  signatureInputRef,
  setSignatureFile,
  setSignaturePreview,
  setScannerTarget,
  setScannerGrayscale,
  setScannerImage,
  setShowSignatureScanner,
  cachetPreview,
  cachetInputRef,
  setCachetFile,
  setCachetPreview,
  loading
}) => {
  return (
    <div className="settings-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">Configuration des informations de votre établissement scolaire</p>
        </div>
      </div>

      <div className="table-block" style={{ maxWidth: '680px', padding: '24px' }}>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Nom de l'Établissement</label>
              <input type="text" value={profile.nom} onChange={e => setProfile({...profile, nom: e.target.value})} style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid var(--border-color)', padding: '0 12px', fontSize: '12px', outline: 'none' }} />
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Code Établissement</label>
              <input type="text" value={profile.code_etablissement} onChange={e => setProfile({...profile, code_etablissement: e.target.value})} style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid var(--border-color)', padding: '0 12px', fontSize: '12px', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Région</label>
              <input type="text" value={profile.region || ''} onChange={e => setProfile({...profile, region: e.target.value})} style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid var(--border-color)', padding: '0 12px', fontSize: '12px', outline: 'none' }} />
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Ville</label>
              <input type="text" value={profile.ville || ''} onChange={e => setProfile({...profile, ville: e.target.value})} style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid var(--border-color)', padding: '0 12px', fontSize: '12px', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Directeur Général / Secrétaire Général (Titre & Nom complet)</label>
              <input 
                type="text" 
                placeholder="Ex: Le Directeur Général, M. Habiboullah EL HEYID" 
                value={profile.nom_directeur || ''} 
                onChange={e => setProfile({...profile, nom_directeur: e.target.value})} 
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid var(--border-color)', padding: '0 12px', fontSize: '12px', outline: 'none' }} 
              />
              <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'var(--slate-400)' }}>Cet intitulé sera affiché dans le corps et la zone de signature de l'attestation d'inscription.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Signature du Directeur</label>
              <div className="photo-upload-container" style={{ minHeight: '120px', position: 'relative', cursor: 'pointer', border: '1.5px dashed var(--slate-300)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }} onClick={() => signatureInputRef.current.click()}>
                {signaturePreview || profile.signature_url ? (
                  <img src={signaturePreview || `http://localhost:5002${profile.signature_url}`} alt="Signature" style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--slate-400)', fontSize: '11px' }}>
                    <Edit size={24} />
                    <span>Cliquez pour charger</span>
                  </div>
                )}
              </div>
              <input type="file" ref={signatureInputRef} style={{ display: 'none' }} accept="image/*" onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  setSignatureFile(file);
                  setSignaturePreview(URL.createObjectURL(file));
                }
              }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, fontSize: '10px', padding: '6px 12px' }} onClick={() => {
                  setScannerTarget('signature');
                  setScannerGrayscale(true);
                  setScannerImage(null);
                  setShowSignatureScanner(true);
                }}>
                  <Camera size={12} /> Numériser la Signature
                </button>
              </div>
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Cachet Numérique de l'Établissement</label>
              <div className="photo-upload-container" style={{ minHeight: '120px', position: 'relative', cursor: 'pointer', border: '1.5px dashed var(--slate-300)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }} onClick={() => cachetInputRef.current.click()}>
                {cachetPreview || profile.cachet_url ? (
                  <img src={cachetPreview || `http://localhost:5002${profile.cachet_url}`} alt="Cachet" style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--slate-400)', fontSize: '11px' }}>
                    <Edit size={24} />
                    <span>Cliquez pour charger</span>
                  </div>
                )}
              </div>
              <input type="file" ref={cachetInputRef} style={{ display: 'none' }} accept="image/*" onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  setCachetFile(file);
                  setCachetPreview(URL.createObjectURL(file));
                }
              }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, fontSize: '10px', padding: '6px 12px' }} onClick={() => {
                  setScannerTarget('cachet');
                  setScannerGrayscale(false);
                  setScannerImage(null);
                  setShowSignatureScanner(true);
                }}>
                  <Camera size={12} /> Numériser le Cachet
                </button>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ background: 'var(--primary-color)', height: '40px', padding: '0 24px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}>
              {loading ? <Loader2 className="animate-spin" /> : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsTab;
