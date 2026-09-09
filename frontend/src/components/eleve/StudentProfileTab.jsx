import React from 'react';
import { CheckCircle2, Phone, Mail, User, GraduationCap, BookOpen } from 'lucide-react';

const StudentProfileTab = ({ profile }) => {
  return (
    <div className="tab-pane">
      <div className="profile-section card-box">
        <div className="profile-header-banner">
          <div className="profile-header-avatar">
            {profile?.photo_url ? (
              <img src={`${profile.photo_url}`} alt="Student" />
            ) : (
              <div className="avatar-placeholder-large">
                {profile ? `${profile.prenom[0]}${profile.nom[0]}` : 'EL'}
              </div>
            )}
          </div>
          <div className="profile-header-meta">
            <h2>{profile?.prenom} {profile?.nom}</h2>
            <p className="text-orange font-medium">{profile?.identifiant_national}</p>
            <span className="official-badge"><CheckCircle2 size={12} /> Profil État Sénégalais Certifié</span>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="details-group">
            <h3>État Civil</h3>
            <div className="detail-item">
              <span className="label">Nom complet</span>
              <span className="val">{profile?.prenom} {profile?.nom}</span>
            </div>
            <div className="detail-item">
              <span className="label">Date de naissance</span>
              <span className="val">{profile?.date_naissance ? new Date(profile.date_naissance).toLocaleDateString('fr-FR') : 'Non précisée'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Lieu de naissance</span>
              <span className="val">{profile?.lieu_naissance || 'Non précisé'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Nationalité</span>
              <span className="val">{profile?.nationalite || 'Sénégalaise'}</span>
            </div>
          </div>

          <div className="details-group">
            <h3>Coordonnées & Parents</h3>
            <div className="detail-item">
              <span className="label"><Phone size={14} /> Téléphone</span>
              <span className="val">{profile?.telephone || 'Non renseigné'}</span>
            </div>
            <div className="detail-item">
              <span className="label"><Mail size={14} /> E-mail d'accès</span>
              <span className="val">{profile?.email}</span>
            </div>
            <div className="detail-item">
              <span className="label"><User size={14} /> Contact parent</span>
              <span className="val" style={{ whiteSpace: 'pre-line' }}>{profile?.coordonnees_parent || 'Non renseigné'}</span>
            </div>
          </div>

          <div className="details-group full-width">
            <h3>Cursus scolaire actuel</h3>
            <div className="detail-item">
              <span className="label"><GraduationCap size={14} /> Établissement</span>
              <span className="val">{profile?.etablissement_nom} ({profile?.etablissement_region}, {profile?.etablissement_ville})</span>
            </div>
            <div className="detail-item">
              <span className="label"><BookOpen size={14} /> Classe</span>
              <span className="val">{profile?.classe_nom} (Niveau: {profile?.statut})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileTab;
