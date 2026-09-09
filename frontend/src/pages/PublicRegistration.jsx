import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { School, User, Calendar, MapPin, Phone, Mail, Globe, ShieldAlert, Award, FileText, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import './PublicRegistration.css';

const PublicRegistration = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isTransfer, setIsTransfer] = useState(false);

  // Photo state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    sexe: 'M',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: 'Sénégalaise',
    telephone: '',
    email: '',
    coordonnees_parent: '',
    statut: 'APTE',
    identifiant_existant: ''
  });

  useEffect(() => {
    fetchClassInfo();
  }, [classId]);

  const fetchClassInfo = async () => {
    try {
      const res = await fetch(`/api/pre-inscriptions/public/class/${classId}`);
      if (!res.ok) {
        throw new Error('Classe introuvable ou lien invalide.');
      }
      const data = await res.json();
      setClassInfo(data);
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération des informations.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'identifiant_existant') {
          formDataToSend.append(key, isTransfer ? formData.identifiant_existant : '');
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      formDataToSend.append('classe_id', classId);
      formDataToSend.append('etablissement_id', classInfo.etablissement_id);
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const res = await fetch('/api/pre-inscriptions/public/register', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Une erreur est survenue lors de l\'inscription.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="registration-loading">
        <div className="spinner"></div>
        <p>Chargement du portail d'inscription...</p>
      </div>
    );
  }

  if (error && !classInfo) {
    return (
      <div className="registration-container error-state">
        <div className="error-card">
          <AlertCircle size={48} className="text-red" />
          <h2>Lien Invalide</h2>
          <p>{error}</p>
          <button className="back-btn" onClick={() => navigate('/auth')}>Retour à la connexion</button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-page">
      <div className="registration-container">
        
        {/* HEADER BRAND */}
        <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img 
            src="/logo_leralscolaire.png" 
            alt="Logo LéralScolaire" 
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <h2>Portail LeralScolaire</h2>
            <p>Ministère de l'Éducation Nationale</p>
          </div>
        </div>

        {/* WELCOME BANNER */}
        <div className="class-banner-card">
          <div className="banner-text">
            <h3>Inscription en ligne</h3>
            <h1>{classInfo?.classe_nom}</h1>
            <p className="school-name">
              <School size={16} /> {classInfo?.etablissement_nom}
            </p>
            <span className="level-badge">{classInfo?.niveau}</span>
          </div>
          <div className="banner-decor">🇸🇳</div>
        </div>

        {success ? (
          <div className="success-card animate-fade-in">
            <CheckCircle2 size={64} className="text-green" />
            <h2>Demande transmise avec succès !</h2>
            <p className="success-message">
              Votre dossier de pré-inscription pour la classe de <strong>{classInfo?.classe_nom}</strong> a bien été envoyé à l'administration de l'établissement <strong>{classInfo?.etablissement_nom}</strong>.
            </p>
            <div className="success-next-steps">
              <h4>Étapes suivantes :</h4>
              <ul>
                <li>L'administration examinera et validera vos informations.</li>
                {isTransfer ? (
                  <li>Après validation, vous pourrez vous connecter directement sur le portail avec vos identifiants existants.</li>
                ) : (
                  <li>Après validation, vos identifiants d'accès (Identifiant national unique et mot de passe provisoire) vous seront fournis par l'établissement.</li>
                )}
              </ul>
            </div>
            <button className="finish-btn" onClick={() => navigate('/auth')}>Aller au portail de connexion</button>
          </div>
        ) : (
          <div className="form-card animate-fade-in">
            
            {/* TABS CONTROL */}
            <div className="reg-tabs">
              <button 
                type="button" 
                className={`reg-tab ${!isTransfer ? 'active' : ''}`} 
                onClick={() => { setIsTransfer(false); setError(''); }}
              >
                Nouvelle Inscription
              </button>
              <button 
                type="button" 
                className={`reg-tab ${isTransfer ? 'active' : ''}`} 
                onClick={() => { setIsTransfer(true); setError(''); }}
              >
                Transfert (J'ai déjà un compte)
              </button>
            </div>

            {error && (
              <div className="alert-error-box">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="reg-form">
              
              {isTransfer && (
                <div className="form-section highlight-section">
                  <h3>Identifiant Existant</h3>
                  <div className="input-group">
                    <label htmlFor="identifiant_existant">Identifiant National Unique (Format: SN-YYYY-XXX-XXXXXX) *</label>
                    <div className="input-with-icon">
                      <ShieldAlert size={18} />
                      <input 
                        type="text" 
                        id="identifiant_existant"
                        name="identifiant_existant"
                        placeholder="Ex: SN-2026-XCH-000004"
                        value={formData.identifiant_existant}
                        onChange={handleChange}
                        required={isTransfer}
                      />
                    </div>
                    <p className="helper-text">Saisissez exactement l'identifiant fourni par votre ancien établissement.</p>
                  </div>
                </div>
              )}

              <div className="form-section">
                <h3>Informations Personnelles de l'Élève</h3>
                
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="prenom">Prénom *</label>
                    <div className="input-with-icon">
                      <User size={18} />
                      <input 
                        type="text" 
                        id="prenom"
                        name="prenom"
                        placeholder="Ex: Babacar"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="nom">Nom *</label>
                    <div className="input-with-icon">
                      <User size={18} />
                      <input 
                        type="text" 
                        id="nom"
                        name="nom"
                        placeholder="Ex: Diop"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="date_naissance">Date de naissance *</label>
                    <div className="input-with-icon">
                      <Calendar size={18} />
                      <input 
                        type="date" 
                        id="date_naissance"
                        name="date_naissance"
                        value={formData.date_naissance}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="lieu_naissance">Lieu de naissance *</label>
                    <div className="input-with-icon">
                      <MapPin size={18} />
                      <input 
                        type="text" 
                        id="lieu_naissance"
                        name="lieu_naissance"
                        placeholder="Ex: Dakar"
                        value={formData.lieu_naissance}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="sexe">Civilité / Sexe *</label>
                    <div className="input-with-icon">
                      <User size={18} />
                      <select
                        id="sexe"
                        name="sexe"
                        value={formData.sexe || 'M'}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="M">Masculin (M.)</option>
                        <option value="F">Féminin (Mme / Mlle)</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="nationalite">Nationalité *</label>
                    <div className="input-with-icon">
                      <Globe size={18} />
                      <input 
                        type="text" 
                        id="nationalite"
                        name="nationalite"
                        placeholder="Ex: Sénégalaise"
                        value={formData.nationalite}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="telephone">Numéro de Téléphone *</label>
                    <div className="input-with-icon">
                      <Phone size={18} />
                      <input 
                        type="tel" 
                        id="telephone"
                        name="telephone"
                        placeholder="Ex: 77 123 45 67"
                        value={formData.telephone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="email">Email (Élève ou Parent / Tuteur) *</label>
                    <div className="input-with-icon">
                      <Mail size={18} />
                      <input 
                        type="email" 
                        id="email"
                        name="email"
                        placeholder="Ex: parent@gmail.com ou eleve@sn.sn"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <small style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Obligatoire : cet email recevra l'IUP et le mot de passe temporaire dès validation.
                    </small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="statut">Aptitude Physique *</label>
                    <div className="input-with-icon">
                      <Award size={18} />
                      <select 
                        id="statut"
                        name="statut"
                        value={formData.statut}
                        onChange={handleChange}
                        required
                      >
                        <option value="APTE">Apte aux activités physiques</option>
                        <option value="INAPTE">Inapte (Certificat médical requis)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              <div className="form-section">
                <h3>Coordonnées du Responsable Légitime (Parent)</h3>
                <div className="input-group">
                  <label htmlFor="coordonnees_parent">Nom complet, Téléphone et Adresse du Parent *</label>
                  <div className="textarea-with-icon">
                    <FileText size={18} className="textarea-icon" />
                    <textarea 
                      id="coordonnees_parent"
                      name="coordonnees_parent"
                      rows="3"
                      placeholder="Ex: M. Ibrahima Diop (Père) - Tél: 77 987 65 43 - Adresse: Rue 10, Dakar"
                      value={formData.coordonnees_parent}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Photo d'identité</h3>
                <div className="photo-upload-container">
                  {photoPreview ? (
                    <div className="photo-preview-wrapper">
                      <img src={photoPreview} alt="Aperçu" className="photo-preview-img" />
                      <button type="button" className="remove-photo-btn" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}>Retirer la photo</button>
                    </div>
                  ) : (
                    <label className="photo-upload-label">
                      <Camera size={24} />
                      <span>Ajouter une photo d'identité (Optionnel)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoChange} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  )}
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="btn-spinner"></div>
                    Envoi en cours...
                  </>
                ) : (
                  isTransfer ? 'Soumettre la demande de transfert' : 'Soumettre ma pré-inscription'
                )}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default PublicRegistration;
