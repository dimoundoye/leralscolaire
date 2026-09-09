import React from 'react';
import {
  ShieldCheck, Printer, Plus, CheckCircle2, GraduationCap, MapPin, Award,
  AwardIcon, X, Sparkles, Activity, PartyPopper, Trash2, WifiOff
} from 'lucide-react';

const StudentPortfolioTab = ({
  profile,
  portfolio,
  cvData,
  isAddingPortfolio,
  setIsAddingPortfolio,
  newPortfolio,
  setNewPortfolio,
  handleAddPortfolio,
  handleDeletePortfolio,
  portfolioCategoryFilter,
  setPortfolioCategoryFilter,
  filteredPortfolio,
  getCategoryBadgeClass
}) => {
  const getCategoryLabel = (type) => {
    switch (type) {
      case 'PROJET': return 'Projet Tech/Scientifique';
      case 'SPORT': return 'Activité Sportive';
      case 'ART': return 'Art & Culture';
      default: return 'Engagement / Autre';
    }
  };

  return (
    <div className="tab-pane">
      
      {/* Top Hero Banner */}
      <div className="portfolio-hero-banner card-box">
        <div className="portfolio-hero-left">
          <div className="portfolio-hero-title-group">
            <h2>Mon Portfolio & CV Numérique Certifié</h2>
            <span className="men-official-tag"><ShieldCheck size={14} /> Certifié MEN Sénégal</span>
          </div>
          <p className="portfolio-hero-desc">
            Consultez votre livret officiel, valorisez vos compétences extra-scolaires et constituez un dossier d'excellence pour vos choix d'orientation post-BAC.
          </p>
        </div>

        <div className="portfolio-hero-actions">
          <button className="secondary-btn print-cv-btn" onClick={() => window.print()}>
            <Printer size={16} /> Imprimer le CV Officiel
          </button>
          {!isAddingPortfolio && (
            <button className="primary-btn add-activity-btn" onClick={() => setIsAddingPortfolio(true)}>
              <Plus size={16} /> Ajouter une activité
            </button>
          )}
        </div>
      </div>

      <div className="portfolio-cv-layout">
        {/* Official Printable CV Document */}
        <div className="cv-container card-box printable-cv">
          
          {/* Top Official Seal & Header */}
          <div className="cv-header-official">
            <div className="cv-republic-header">
              <div className="senegal-flag-icon">🇸🇳</div>
              <div>
                <h4 className="rep-heading">RÉPUBLIQUE DU SÉNÉGAL</h4>
                <p className="rep-motto">Un Peuple - Un But - Une Foi</p>
                <p className="rep-ministry">Ministère de l'Éducation Nationale • Office du Baccalauréat</p>
              </div>
            </div>

            <div className="cv-doc-badge">
              <span className="doc-title">LIVRET NUMÉRIQUE ÉVOLUTIF</span>
              <span className="doc-sub">Parcours Scolaire Certifié</span>
              <span className="doc-id">N° {profile?.identifiant_national || 'SN-2026-BAC'}</span>
            </div>

            <div className="cv-qr-stamp">
              <div className="qr-box-inner">
                <ShieldCheck size={24} className="qr-shield" />
                <span>VÉRIFIÉ</span>
              </div>
              <small className="qr-label">QR Authentification</small>
            </div>
          </div>

          <div className="cv-gold-divider"></div>

          {/* Student Identity Header */}
          <div className="cv-identity-banner">
            <div className="cv-photo-frame">
              {profile?.photo_url ? (
                <img src={`${profile.photo_url}`} alt="Photo d'identité" className="cv-photo-img" />
              ) : (
                <div className="cv-photo-fallback">
                  {profile ? `${profile.prenom[0]}${profile.nom[0]}` : 'EL'}
                </div>
              )}
              <span className="cv-photo-cert-tag"><CheckCircle2 size={11} /> Photo Certifiée</span>
            </div>

            <div className="cv-identity-details">
              <div className="cv-name-row">
                <h2>{profile?.prenom} {profile?.nom}</h2>
                <span className="cv-id-pill">ID National : <strong>{profile?.identifiant_national || '---'}</strong></span>
              </div>

              <div className="cv-meta-grid">
                <div className="cv-meta-col">
                  <span className="meta-lbl">Date de naissance :</span>
                  <span className="meta-val">{profile?.date_naissance ? new Date(profile.date_naissance).toLocaleDateString('fr-FR') : 'Non renseigné'}</span>
                </div>
                <div className="cv-meta-col">
                  <span className="meta-lbl">Lieu de naissance :</span>
                  <span className="meta-val">{profile?.lieu_naissance || 'Non précisé'}</span>
                </div>
                <div className="cv-meta-col">
                  <span className="meta-lbl">Nationalité :</span>
                  <span className="meta-val">{profile?.nationalite || 'Sénégalaise'}</span>
                </div>
                <div className="cv-meta-col">
                  <span className="meta-lbl">Établissement & Classe :</span>
                  <span className="meta-val"><strong>{profile?.etablissement_nom || 'Lycée'}</strong> — {profile?.classe_nom || 'Classe'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CV Sections */}
          <div className="cv-sections-container">
            
            {/* Parcours Académique */}
            <div className="cv-section-box">
              <div className="cv-section-header">
                <div className="icon-wrap"><GraduationCap size={16} /></div>
                <h3>PARCOURS ACADÉMIQUE</h3>
                <div className="header-line"></div>
              </div>

              {cvData?.parcours && cvData.parcours.length > 0 ? (
                <div className="cv-timeline">
                  {cvData.parcours.map((p, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-body">
                        <div className="timeline-header">
                          <span className="timeline-year">{p.annee_scolaire}</span>
                          <strong className="timeline-class">Classe de {p.classe_nom}</strong>
                        </div>
                        <p className="timeline-school"><MapPin size={12} /> {p.etablissement_nom}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="cv-empty-text">Aucun historique de classe enregistré dans le livret.</p>
              )}
            </div>

            {/* Projets & Activités Extra-Scolaires */}
            <div className="cv-section-box mt-6">
              <div className="cv-section-header">
                <div className="icon-wrap"><Award size={16} /></div>
                <h3>PROJETS & ACTIVITÉS EXTRA-SCOLAIRES</h3>
                <div className="header-line"></div>
              </div>

              {portfolio.length > 0 ? (
                <div className="cv-activities-list">
                  {portfolio.map(item => (
                    <div key={item.id} className="cv-activity-card">
                      <div className="activity-card-top">
                        <span className={`activity-type-badge ${getCategoryBadgeClass(item.type)}`}>
                          {getCategoryLabel(item.type)}
                        </span>
                        <span className="activity-date">
                          {item.annee_scolaire} • {new Date(item.date_realisation).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h4>{item.titre}</h4>
                      <p>{item.description}</p>
                      {item.id.toString().startsWith('offline-') && (
                        <span className="offline-indicator-tag"><WifiOff size={10} /> En attente de sync</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="cv-empty-text">Aucune activité ajoutée pour le moment. Utilisez le formulaire pour enrichir votre portfolio.</p>
              )}
            </div>

            {/* Examens Nationaux */}
            {cvData?.examens && cvData.examens.length > 0 && (
              <div className="cv-section-box mt-6">
                <div className="cv-section-header">
                  <div className="icon-wrap"><AwardIcon size={16} /></div>
                  <h3>DIPLÔMES & EXAMENS NATIONAUX</h3>
                  <div className="header-line"></div>
                </div>
                <div className="cv-exams-list">
                  {cvData.examens.map((ex, idx) => (
                    <div key={idx} className="cv-exam-badge">
                      <div className="exam-icon-flag">🇸🇳</div>
                      <div className="exam-details">
                        <strong>{ex.type_examen} (Session {ex.annee})</strong>
                        <span>Moyenne : <strong>{ex.moyenne}/20</strong> • Mention : <strong>{ex.mention}</strong></span>
                      </div>
                      <span className="exam-status-pill">{ex.statut_resultat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Document Bottom Footer */}
          <div className="cv-doc-footer">
            <div className="footer-stamp">
              <ShieldCheck size={14} /> Document extrait du Livret Scolaire Numérique National (LeralScolaire MEN).
            </div>
            <div className="footer-date">Généré le {new Date().toLocaleDateString('fr-FR')}</div>
          </div>

        </div>

        {/* Portfolio Manager Sidebar */}
        <div className="portfolio-manager card-box">
          <div className="pm-top-header">
            <div>
              <h3>Gestion du Portfolio</h3>
              <p className="subtitle">Enrichissez votre livret avec vos réalisations.</p>
            </div>
            <div className="pm-count-tag">
              <strong>{portfolio.length}</strong> {portfolio.length > 1 ? 'activités' : 'activité'}
            </div>
          </div>

          {/* Add Activity Form or Add Trigger */}
          {isAddingPortfolio ? (
            <div className="pm-form-box">
              <div className="pm-form-header">
                <h4><Plus size={16} /> Nouvelle réalisation</h4>
                <button className="close-btn" onClick={() => setIsAddingPortfolio(false)} title="Fermer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddPortfolio} className="sd-form">
                <div className="form-group">
                  <label>Catégorie</label>
                  <div className="category-pills-group">
                    {[
                      { key: 'PROJET', label: 'Projet Tech/Scientifique', icon: Sparkles },
                      { key: 'SPORT', label: 'Sport', icon: Activity },
                      { key: 'ART', label: 'Art & Culture', icon: PartyPopper },
                      { key: 'AUTRE', label: 'Engagement / Autre', icon: Award }
                    ].map(cat => {
                      const IconComp = cat.icon;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          className={`cat-pill-option ${newPortfolio.type === cat.key ? 'active' : ''}`}
                          onClick={() => setNewPortfolio({ ...newPortfolio, type: cat.key })}
                        >
                          <IconComp size={13} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label>Titre de la réalisation</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Robot suiveur de ligne, Capitaine de l'équipe..."
                    value={newPortfolio.titre}
                    onChange={e => setNewPortfolio({ ...newPortfolio, titre: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description & compétences</label>
                  <textarea 
                    required 
                    rows={3}
                    placeholder="Décrivez ce que vous avez accompli, les compétences développées..."
                    value={newPortfolio.description}
                    onChange={e => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Année scolaire</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: 2025-2026"
                      value={newPortfolio.annee_scolaire}
                      onChange={e => setNewPortfolio({ ...newPortfolio, annee_scolaire: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date de réalisation</label>
                    <input 
                      type="date" 
                      required 
                      value={newPortfolio.date_realisation}
                      onChange={e => setNewPortfolio({ ...newPortfolio, date_realisation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-btn w-full">Enregistrer</button>
                  <button type="button" className="secondary-btn w-full" onClick={() => setIsAddingPortfolio(false)}>Annuler</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="pm-add-trigger">
              <button className="primary-btn w-full add-activity-main-btn" onClick={() => setIsAddingPortfolio(true)}>
                <Plus size={18} /> Ajouter une activité/projet
              </button>
            </div>
          )}

          {/* Existing portfolio items */}
          <div className="pm-list-container mt-6">
            <div className="pm-list-title-row">
              <h4>Mes éléments ({portfolio.length})</h4>
              {portfolio.length > 0 && (
                <div className="pm-filter-pills">
                  {['TOUS', 'PROJET', 'SPORT', 'ART'].map(cat => (
                    <button
                      key={cat}
                      className={`pm-filter-pill ${portfolioCategoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setPortfolioCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredPortfolio.length > 0 ? (
              <div className="pm-items-grid">
                {filteredPortfolio.map(item => (
                  <div key={item.id} className="pm-card-item">
                    <div className="pm-card-header">
                      <span className={`activity-type-badge ${getCategoryBadgeClass(item.type)}`}>
                        {item.type}
                      </span>
                      <button className="delete-btn-mini" onClick={() => handleDeletePortfolio(item.id)} title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h5>{item.titre}</h5>
                    <p>{item.description}</p>
                    <div className="pm-card-footer">
                      <span className="pm-year-tag">{item.annee_scolaire}</span>
                      {item.id.toString().startsWith('offline-') && (
                        <span className="offline-tag-mini"><WifiOff size={10} /> Sync</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pm-empty-box">
                <Award size={36} className="text-gray" />
                <p>Aucune activité enregistrée.</p>
                <span>Enrichissez votre dossier pour valoriser votre parcours !</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentPortfolioTab;
