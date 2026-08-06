import React, { useState } from 'react';
import { GraduationCap, School, UserCheck, Send, CheckCircle, AlertCircle, ArrowLeft, FileText, Upload, ShieldCheck, AlertOctagon, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PublicOfficeRegistration.css';

import { REFERENTIEL_IA_IEF, getIasByRegion, getIefsByIa } from '../utils/referentielIaIef';

const API = 'http://localhost:5002/api';

const PublicOfficeRegistration = () => {
  const navigate = useNavigate();
  const [typeDemande, setTypeDemande] = useState('ETABLISSEMENT');
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '', region: 'Dakar', ville: 'Dakar',
    ia_nom: 'IA de Dakar', ief_nom: 'IEF Dakar-Centre',
    specialite_ou_code: '', cni_numero: '', autorisation_numero: '', matricule_solde: '', sexe: 'M'
  });

  const handleRegionChange = (r) => {
    const ias = getIasByRegion(r);
    const defaultIa = ias[0] || '';
    const iefs = getIefsByIa(defaultIa);
    const defaultIef = iefs[0] || '';
    setFormData(f => ({
      ...f,
      region: r,
      ia_nom: defaultIa,
      ief_nom: defaultIef
    }));
  };

  const handleIaChange = (ia) => {
    const iefs = getIefsByIa(ia);
    const defaultIef = iefs[0] || '';
    setFormData(f => ({
      ...f,
      ia_nom: ia,
      ief_nom: defaultIef
    }));
  };

  const [docs, setDocs] = useState({
    doc_autorisation: null,
    doc_cni: null,
    doc_ninea_ou_diplome: null,
    doc_rib_ou_pv: null
  });

  const [certifyHonor, setCertifyHonor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileChange = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocs(d => ({
          ...d,
          [field]: {
            name: file.name,
            type: file.type,
            data: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!certifyHonor) {
      setErrorMsg("Vous devez cocher la certification sur l'honneur confirmant l'authenticité de vos documents sous peine de poursuites judiciaires.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        ...formData,
        type_demande: typeDemande,
        documents_fournis: docs
      };

      const r = await fetch(`${API}/office-bac/demande-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json();

      if (r.ok) {
        setSuccessMsg(data.message);
        setFormData({ nom: '', prenom: '', email: '', telephone: '', region: 'Dakar', ville: 'Dakar', specialite_ou_code: '', cni_numero: '', autorisation_numero: '', matricule_solde: '', sexe: 'M' });
        setDocs({ doc_autorisation: null, doc_cni: null, doc_ninea_ou_diplome: null, doc_rib_ou_pv: null });
        setCertifyHonor(false);
      } else {
        setErrorMsg(data.message || 'Erreur lors de la soumission de votre demande.');
      }
    } catch (err) {
      setErrorMsg('Impossible d\'accéder au serveur. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="por-container">
      <div className="por-card">
        <button className="por-back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={16} /> Retour à la connexion
        </button>

        <div className="por-header">
          <div className="por-logo">
            <GraduationCap size={44} style={{ color: '#131e6c' }} />
          </div>
          <h1>Portail d'Auto-Inscription Nationale</h1>
          <p>Office du Baccalauréat & BFEM · Ministère de l'Éducation Nationale du Sénégal</p>
        </div>

        {/* AVERTISSEMENT LÉGAL ET PÉNAL SÉNÉGAL */}
        <div className="por-legal-warning">
          <div className="por-legal-header">
            <Scale size={20} className="por-legal-icon" />
            <span>AVERTISSEMENT LÉGAL ET SANCTIONS PÉNALES</span>
          </div>
          <p>
            Conformément aux <strong>Articles 130 à 135 du Code Pénal du Sénégal</strong> et aux directives ministérielles, toute fausse déclaration, falsification de documents administratifs ou tentative de fraude fera l'objet d'une <strong>dénonciation immédiate auprès du Procureur de la République et des autorités judiciaires</strong>.
          </p>
          <p style={{ marginTop: 6, fontStyle: 'italic', color: '#be123c' }}>
            L'auteur s'expose au rejet définitif de son dossier, à l'annulation d'agrément ainsi qu'à des peines d'emprisonnement prévues par la loi.
          </p>
        </div>

        {/* Toggle Type */}
        <div className="por-type-toggle mt-4">
          <button
            type="button"
            className={`por-toggle-btn ${typeDemande === 'ETABLISSEMENT' ? 'active' : ''}`}
            onClick={() => setTypeDemande('ETABLISSEMENT')}
          >
            <School size={18} /> Inscription Établissement (Lycée / Centre)
          </button>
          <button
            type="button"
            className={`por-toggle-btn ${typeDemande === 'PROFESSEUR' ? 'active' : ''}`}
            onClick={() => setTypeDemande('PROFESSEUR')}
          >
            <UserCheck size={18} /> Inscription Professeur / Correcteur
          </button>
        </div>

        {successMsg && (
          <div className="por-alert por-alert-success">
            <CheckCircle size={20} />
            <div>
              <strong>Demande et pièces justificatives transmises !</strong>
              <p>{successMsg}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="por-alert por-alert-error">
            <AlertCircle size={20} />
            <div>
              <strong>Erreur :</strong>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="por-form">
          <div className="por-section-title">
            <span>1. Identification Générale</span>
          </div>

          <div className="por-form-group">
            <label>
              {typeDemande === 'ETABLISSEMENT' ? 'Nom officiel de l\'Établissement *' : 'Nom de l\'Enseignant *'}
            </label>
            <input
              placeholder={typeDemande === 'ETABLISSEMENT' ? 'ex: Lycée Lamine Guèye' : 'ex: Ndiaye'}
              value={formData.nom}
              onChange={e => setFormData(f => ({ ...f, nom: e.target.value }))}
              required
            />
          </div>

          {typeDemande === 'PROFESSEUR' && (
            <div className="por-form-group">
              <label>Prénom de l'Enseignant *</label>
              <input
                placeholder="ex: Amadou"
                value={formData.prenom}
                onChange={e => setFormData(f => ({ ...f, prenom: e.target.value }))}
                required
              />
            </div>
          )}

          {typeDemande === 'PROFESSEUR' && (
            <div className="por-form-group">
              <label>Civilité / Sexe *</label>
              <select
                value={formData.sexe || 'M'}
                onChange={e => setFormData(f => ({ ...f, sexe: e.target.value }))}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', color: '#0f172a', cursor: 'pointer' }}
              >
                <option value="M">Masculin — Mr.</option>
                <option value="F">Féminin — Mme.</option>
              </select>
            </div>
          )}

          <div className="por-form-row">
            <div className="por-form-group">
              <label>Adresse Email de contact *</label>
              <input
                type="email"
                placeholder="ex: contact@education.sn"
                value={formData.email}
                onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="por-form-group">
              <label>Numéro de Téléphone *</label>
              <input
                placeholder="ex: +221 77 000 00 00"
                value={formData.telephone}
                onChange={e => setFormData(f => ({ ...f, telephone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="por-form-row">
            <div className="por-form-group">
              <label>Région du Sénégal *</label>
              <select value={formData.region} onChange={e => handleRegionChange(e.target.value)}>
                {REFERENTIEL_IA_IEF.map(r => <option key={r.region} value={r.region}>{r.region}</option>)}
              </select>
            </div>

            <div className="por-form-group">
              <label>Inspection d'Académie (IA) *</label>
              <select value={formData.ia_nom} onChange={e => handleIaChange(e.target.value)} required>
                {getIasByRegion(formData.region).map(ia => (
                  <option key={ia} value={ia}>{ia}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="por-form-row">
            <div className="por-form-group">
              <label>Inspection de l'Éducation et de la Formation (IEF) *</label>
              <select value={formData.ief_nom} onChange={e => setFormData(f => ({ ...f, ief_nom: e.target.value }))} required>
                {getIefsByIa(formData.ia_nom).map(ief => (
                  <option key={ief} value={ief}>{ief}</option>
                ))}
              </select>
            </div>

            <div className="por-form-group">
              <label>Ville / Commune *</label>
              <input
                placeholder="ex: Dakar Plateau"
                value={formData.ville}
                onChange={e => setFormData(f => ({ ...f, ville: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="por-form-group">
            <label>
              {typeDemande === 'ETABLISSEMENT' ? 'Code Établissement (si déjà attribué)' : 'Discipline / Matière Principale d\'enseignement *'}
            </label>
            {typeDemande === 'PROFESSEUR' ? (
              <select value={formData.specialite_ou_code} onChange={e => setFormData(f => ({ ...f, specialite_ou_code: e.target.value }))} required>
                <option value="">Sélectionnez la discipline</option>
                {['Mathématiques', 'Sciences Physiques', 'SVT', 'Français', 'Philosophie', 'Anglais', 'Histoire-Géo', 'Comptabilité', 'Économie & Droit'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input
                placeholder="Optionnel — Laisser vide pour auto-génération"
                value={formData.specialite_ou_code}
                onChange={e => setFormData(f => ({ ...f, specialite_ou_code: e.target.value }))}
              />
            )}
          </div>

          {/* SECTION DOSSIER & PIÈCES JUSTIFICATIVES OBLIGATOIRES SÉNÉGAL */}
          <div className="por-section-title mt-4">
            <span>2. Dossier Administratif & Pièces Justificatives (Sénégal)</span>
          </div>

          {typeDemande === 'ETABLISSEMENT' ? (
            <>
              <div className="por-form-group">
                <label>N° Arrêté / Autorisation d'ouverture MEN *</label>
                <input
                  placeholder="ex: Arrêté ministériel N° 004892/MEN/SG"
                  value={formData.autorisation_numero}
                  onChange={e => setFormData(f => ({ ...f, autorisation_numero: e.target.value }))}
                  required
                />
              </div>

              <div className="por-docs-grid">
                <div className="por-doc-box">
                  <FileText size={18} />
                  <div>
                    <strong>1. Arrêté / Autorisation d'Enseigner (MEN) *</strong>
                    <p>Fichier PDF ou Image de l'arrêté ministériel</p>
                  </div>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange('doc_autorisation', e.target.files[0])} />
                </div>

                <div className="por-doc-box">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>2. Carte CNI du Proviseur / Directeur *</strong>
                    <p>Copie rectoverso CNI du responsable légal</p>
                  </div>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange('doc_cni', e.target.files[0])} />
                </div>

                <div className="por-doc-box">
                  <FileText size={18} />
                  <div>
                    <strong>3. NINEA / Décret de Création *</strong>
                    <p>Attestation immatriculation fiscale ou Décret public</p>
                  </div>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange('doc_ninea_ou_diplome', e.target.files[0])} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="por-form-row">
                <div className="por-form-group">
                  <label>N° Carte Nationale d'Identité (CNI) *</label>
                  <input
                    placeholder="ex: 1 757 1994 00291"
                    value={formData.cni_numero}
                    onChange={e => setFormData(f => ({ ...f, cni_numero: e.target.value }))}
                    required
                  />
                </div>
                <div className="por-form-group">
                  <label>Matricule de la Solde / Réf. Admin</label>
                  <input
                    placeholder="ex: 649 201/F"
                    value={formData.matricule_solde}
                    onChange={e => setFormData(f => ({ ...f, matricule_solde: e.target.value }))}
                  />
                </div>
              </div>

              <div className="por-docs-grid">
                <div className="por-doc-box">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>1. Carte CNI (Recto-Verso) *</strong>
                    <p>Copie CNI de l'enseignant examinateur</p>
                  </div>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange('doc_cni', e.target.files[0])} />
                </div>

                <div className="por-doc-box">
                  <FileText size={18} />
                  <div>
                    <strong>2. Diplôme Académique / Professionnel *</strong>
                    <p>Master, Licence, Doctorat, CAES, BAPET...</p>
                  </div>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange('doc_ninea_ou_diplome', e.target.files[0])} />
                </div>

                <div className="por-doc-box">
                  <Upload size={18} />
                  <div>
                    <strong>3. Relevé d'Identité Bancaire (RIB) *</strong>
                    <p>RIB officiel pour versement des indemnités BAC/BFEM</p>
                  </div>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange('doc_rib_ou_pv', e.target.files[0])} />
                </div>
              </div>
            </>
          )}

          {/* CHECKBOX DÉCLARATION SUR L'HONNEUR OBLIGATOIRE */}
          <div className="por-certify-check mt-4">
            <input
              type="checkbox"
              id="certify_honor"
              checked={certifyHonor}
              onChange={e => setCertifyHonor(e.target.checked)}
              required
            />
            <label htmlFor="certify_honor">
              <strong>Je certifie sur l'honneur</strong> l'exactitude des informations transmises et l'authenticité stricte de mes documents administratifs. J'ai pris connaissance que toute fraude ou fausse déclaration sera dénoncée aux autorités judiciaires.
            </label>
          </div>

          <button type="submit" className="por-submit-btn" disabled={loading}>
            <Send size={18} /> {loading ? 'Transmission du dossier en cours…' : 'Soumettre la demande et le dossier officiel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicOfficeRegistration;
