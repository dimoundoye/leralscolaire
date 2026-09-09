import React, { useState } from 'react';
import { 
  LogIn, 
  Sparkles, 
  Menu, 
  X, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  WifiOff, 
  Lock, 
  GraduationCap, 
  Building2, 
  Users, 
  Award, 
  QrCode, 
  FileText, 
  CheckCircle2, 
  Cpu, 
  Database, 
  Smartphone,
  School,
  FileCheck,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Key,
  Flame,
  Check,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LampLight3D from '../components/LampLight3D';
import './LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [terminalCopied, setTerminalCopied] = useState(false);

  // Redirection dynamique selon rôle ou vers /auth
  const handleAuthAction = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const role = user.role;
    if (role === 'ELEVE') navigate('/student/dashboard');
    else if (role === 'PROFESSEUR') navigate('/professeur/dashboard');
    else if (role === 'OFFICE_BAC') navigate('/office/dashboard');
    else if (role === 'PRESIDENT_JURY') navigate('/jury/dashboard');
    else navigate('/dashboard');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="landing-modern">
      {/* 1. NAVBAR FLOTTANTE CAPSULE (OPTIMISÉE & RESPONSIVE) */}
      <header className="capsule-header">
        <div className="capsule-container">
          {/* Logo officiel (100% Bleu) */}
          <Link to="/" className="capsule-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="/logo_leralscolaire.png" 
              alt="Logo LéralScolaire" 
              className="capsule-logo-img"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="capsule-brand-text">
              LéralScolaire
            </div>
          </Link>

          {/* Liens Desktop */}
          <nav className="capsule-nav">
            <a href="#vision" className="nav-link">Accueil</a>
            <Link to="/a-propos" className="nav-link">À Propos</Link>
            <a href="#poles" className="nav-link">4 Pôles</a>
            <a href="#comparatif" className="nav-link">Souveraineté</a>
            <a href="#piliers" className="nav-link">Fonctionnalités</a>
            <a href="#processus" className="nav-link">Processus</a>
            <a href="#securite" className="nav-link">Sécurité</a>
          </nav>

          {/* Action Droite */}
          <div className="capsule-actions">
            <button 
              className="btn-capsule-primary" 
              onClick={handleAuthAction}
              title={user ? "Accéder à mon espace" : "Se connecter"}
            >
              {user ? (
                <>
                  <Sparkles size={16} />
                  <span className="btn-capsule-text">Mon espace</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span className="btn-capsule-text">Connexion</span>
                </>
              )}
            </button>

            {/* Bouton Hamburger Mobile */}
            <button 
              className="capsule-burger" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Déroulant */}
        {mobileMenuOpen && (
          <div className="capsule-mobile-drawer">
            <a href="#vision" onClick={closeMobileMenu} className="mobile-nav-link">Accueil</a>
            <Link to="/a-propos" onClick={closeMobileMenu} className="mobile-nav-link font-semibold text-blue-900">À Propos du Projet</Link>
            <a href="#poles" onClick={closeMobileMenu} className="mobile-nav-link">Les 4 Pôles Éducatifs</a>
            <a href="#comparatif" onClick={closeMobileMenu} className="mobile-nav-link">Papier vs LéralScolaire</a>
            <a href="#piliers" onClick={closeMobileMenu} className="mobile-nav-link">Piliers Technologiques</a>
            <a href="#processus" onClick={closeMobileMenu} className="mobile-nav-link">Processus en 4 Étapes</a>
            <a href="#securite" onClick={closeMobileMenu} className="mobile-nav-link">Sécurité & Souveraineté</a>
            <div className="mobile-drawer-btn">
              <button className="btn-capsule-primary w-full" onClick={() => { closeMobileMenu(); handleAuthAction(); }}>
                {user ? 'Accéder à mon espace' : 'Se connecter'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HÉRO SECTION ARCHITECTURAL AVEC FAISCEAU 3D LÉRAL (VERROUILLÉ) */}
      <section id="vision" className="hero-section hero-with-lamp">
        {/* Simulation 3D des particules du faisceau Léral */}
        <LampLight3D className="hero-lamp-canvas" />

        <div className="hero-ruler-left" aria-hidden="true" />
        <div className="hero-ruler-right" aria-hidden="true" />

        <div className="hero-glow-bg" />

        <div className="hero-container hero-split-layout">
          {/* Colonne Gauche : Description & Accès au tableau de bord */}
          <div className="hero-split-left">
            <p className="hero-description hero-description-left">
              LéralScolaire simplifie la gestion du livret scolaire numérique. 
              Une plateforme transparente et accessible hors-ligne.
            </p>
            <div className="hero-btn-wrap-left">
              <button onClick={handleAuthAction} className="btn-hero-secondary">
                <span>Tableau de bord</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Espace Central pour le Lustre & le Faisceau 3D */}
          <div className="hero-split-center-spacer" aria-hidden="true" />

          {/* Espace Droite */}
          <div className="hero-split-right-spacer" aria-hidden="true" />
        </div>
      </section>

      {/* SECTION 2 : LE SCEAU PÉDAGOGIQUE NATIONAL & LES 4 PÔLES DU LOGO */}
      <section id="poles" className="stitch-section bg-surface-low">
        <div className="stitch-container">
          <div className="stitch-head text-center">
            <span className="stitch-tag-badge">Symbolisme & Rigueur Académique</span>
            <h2 className="stitch-title">Le Sceau Pédagogique National aux 4 Pôles Éducatifs</h2>
            <p className="stitch-subtitle">
              Inspiré du blason de la transmission du savoir sénégalais, chaque discipline trouve sa traçabilité garantie et son équilibre certifié au sein du livret LéralScolaire.
            </p>
          </div>

          {/* Carte Présentation Centrale du Logo */}
          <div className="stitch-logo-hero-card">
            <div className="logo-hero-visual">
              <img 
                src="/logo_leralscolaire.png" 
                alt="Logo officiel LéralScolaire aux 4 pôles éducatifs" 
                className="logo-hero-img"
              />
            </div>
            <div className="logo-hero-content">
              <h3 className="logo-hero-heading">
                Une architecture modulaire alignée sur les filières générales, techniques et professionnelles
              </h3>
              <p className="logo-hero-desc">
                Le livret numérique unifie l'ensemble des parcours scolaires du cycle moyen au secondaire, garantissant une pondération irréprochable des coefficients officiels et l'évaluation intégrale des aptitudes transversales.
              </p>
            </div>
          </div>

          {/* Grille des 4 Pôles correspondant aux 4 cadrans du logo */}
          <div className="stitch-poles-grid">
            {/* 1. Arts & Culture */}
            <div className="pole-card pole-card-red">
              <div className="pole-icon-wrap bg-red-trans text-accent-red">
                <span className="material-symbols-outlined text-[28px]">palette</span>
              </div>
              <div className="pole-badge bg-red-trans text-accent-red">
                Arts & Culture
              </div>
              <h4 className="pole-name">Humanités & Expression</h4>
              <p className="pole-text">
                Arts plastiques, éducation musicale, histoire de l'art, EPS et formation civique républicaine.
              </p>
              <ul className="pole-features-list">
                <li><Check size={16} className="text-accent-red" /> Évaluation continue des projets</li>
                <li><Check size={16} className="text-accent-red" /> Validation des dispenses EPS</li>
              </ul>
            </div>

            {/* 2. Sciences Exactes */}
            <div className="pole-card pole-card-orange">
              <div className="pole-icon-wrap bg-orange-trans text-accent-orange">
                <span className="material-symbols-outlined text-[28px]">biotech</span>
              </div>
              <div className="pole-badge bg-orange-trans text-accent-orange">
                Sciences Exactes
              </div>
              <h4 className="pole-name">Raisonnement & Recherche</h4>
              <p className="pole-text">
                Mathématiques pures et appliquées, sciences physiques, chimie et SVT pour les séries S1, S2, S3.
              </p>
              <ul className="pole-features-list">
                <li><Check size={16} className="text-accent-orange" /> Barèmes TP normalisés MEN</li>
                <li><Check size={16} className="text-accent-orange" /> Pondération dynamique par série</li>
              </ul>
            </div>

            {/* 3. Lettres & Langues */}
            <div className="pole-card pole-card-green">
              <div className="pole-icon-wrap bg-green-trans text-accent-green">
                <span className="material-symbols-outlined text-[28px]">menu_book</span>
              </div>
              <div className="pole-badge bg-green-trans text-accent-green">
                Lettres & Langues
              </div>
              <h4 className="pole-name">Maîtrise Linguistique</h4>
              <p className="pole-text">
                Français, philosophie, anglais, arabe, espagnol, portugais et valorisation des langues nationales (Wolof, Sereer, Pulaar).
              </p>
              <ul className="pole-features-list">
                <li><Check size={16} className="text-accent-green" /> Épreuves écrites & oratoires</li>
                <li><Check size={16} className="text-accent-green" /> Normes de correction harmonisées</li>
              </ul>
            </div>

            {/* 4. Numérique & Tech */}
            <div className="pole-card pole-card-cyan">
              <div className="pole-icon-wrap bg-cyan-trans text-accent-cyan">
                <span className="material-symbols-outlined text-[28px]">terminal</span>
              </div>
              <div className="pole-badge bg-cyan-trans text-accent-cyan">
                Numérique & Tech
              </div>
              <h4 className="pole-name">Filières Techniques & SI</h4>
              <p className="pole-text">
                Informatique, algorithmique, électrotechnique, génie civil (T1, T2, STEG) et compétences numériques certifiées Pix-Sénégal.
              </p>
              <ul className="pole-features-list">
                <li><Check size={16} className="text-accent-cyan" /> Suivi d'ateliers et projets tech</li>
                <li><Check size={16} className="text-accent-cyan" /> Certification e-portfolio</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 : COMPARATIF PAPIER VS LÉRAL SCOLAIRE */}
      <section id="comparatif" className="stitch-section">
        <div className="stitch-container">
          <div className="stitch-head text-center">
            <span className="stitch-tag-badge">Transformation Régalien</span>
            <h2 className="stitch-title">Pourquoi éradiquer définitivement le livret papier ?</h2>
            <p className="stitch-subtitle">
              Le Sénégal fait face chaque année à des centaines de cas de bulletins modifiés manuellement, de faux diplômes au Bac et de pertes irréversibles de dossiers scolaires.
            </p>
          </div>

          <div className="stitch-comparison-grid">
            {/* Ancien Modèle Papier */}
            <div className="compare-card compare-card-danger">
              <div className="compare-card-head">
                <div className="flex items-center gap-3">
                  <div className="compare-icon-box bg-red-100 text-red-600">
                    <span className="material-symbols-outlined text-[24px]">history_edu</span>
                  </div>
                  <div>
                    <h3 className="compare-title">L'Ancien Modèle Papier</h3>
                  </div>
                </div>
              </div>

              <div className="compare-points-list">
                <div className="compare-point-box bg-white">
                  <X size={20} className="text-red-500 shrink-0 mt-1" />
                  <div>
                    <p className="point-head">Falsification des moyennes et cachets</p>
                    <p className="point-desc">Facilité de contrefaire les signatures d'enseignants et d'altérer les notes pour les candidatures au Bac et bourses étrangères.</p>
                  </div>
                </div>

                <div className="compare-point-box bg-white">
                  <X size={20} className="text-red-500 shrink-0 mt-1" />
                  <div>
                    <p className="point-head">Pertes physiques irréversibles</p>
                    <p className="point-desc">Sinistres, inondations saisonnières, termites et incendies dans les archives scolaires régionales entraînant la disparition du parcours de l'élève.</p>
                  </div>
                </div>

                <div className="compare-point-box bg-white">
                  <X size={20} className="text-red-500 shrink-0 mt-1" />
                  <div>
                    <p className="point-head">Paralysie logistique et coûts d'impression</p>
                    <p className="point-desc">Des millions de FCFA dépensés chaque trimestre en papier, avec des délais de distribution de plusieurs semaines pour les parents.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Standard LéralScolaire */}
            <div className="compare-card compare-card-success">
              <div className="pole-top-stripe bg-secondary" />
              <div className="compare-card-head">
                <div className="flex items-center gap-3">
                  <div className="compare-icon-box bg-teal-100 text-teal-800">
                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                  </div>
                  <div>
                    <h3 className="compare-title">Le Standard LéralScolaire</h3>
                  </div>
                </div>
              </div>

              <div className="compare-points-list">
                <div className="compare-point-box bg-slate-50">
                  <CheckCircle2 size={20} className="text-teal-700 shrink-0 mt-1" />
                  <div>
                    <p className="point-head">Immuabilité et intégrité certifiée</p>
                    <p className="point-desc">Chaque livret dispose d'un scellement officiel apposé par le chef d'établissement, rendant toute falsification impossible et immédiatement détectable.</p>
                  </div>
                </div>

                <div className="compare-point-box bg-slate-50">
                  <CheckCircle2 size={20} className="text-teal-700 shrink-0 mt-1" />
                  <div>
                    <p className="point-head">Coffre-fort souverain adossé à l'IUP</p>
                    <p className="point-desc">L'Identifiant Unique de la Plateforme (IUP) centralise et conserve l'historique complet de la 6ème au Bac. Consultation accessible à vie en ligne ou hors-ligne.</p>
                  </div>
                </div>

                <div className="compare-point-box bg-slate-50">
                  <CheckCircle2 size={20} className="text-teal-700 shrink-0 mt-1" />
                  <div>
                    <p className="point-head">Résilience Hors-Ligne pour tout le Sénégal</p>
                    <p className="point-desc">Les enseignants saisissent les notes sans connexion internet dans les zones isolées ; la synchronisation s'opère automatiquement dès le retour du réseau.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION MAILLAGE TERRITORIAL & CARTE DU SÉNÉGAL (ZÉRO CONVOI PAPIER) */}
      <section id="maillage" className="stitch-section maillage-territorial-section">
        <div className="stitch-container">
          <div className="maillage-grid-2cols">
            {/* Colonne Gauche : Carte Interactive / Visuelle */}
            <div className="maillage-map-container">
              <div className="maillage-map-card">
                <div className="maillage-map-header">
                  <div className="maillage-status-pill">
                    <span className="maillage-pulse-dot" />
                    <span>Réseau National Actif : 14 Régions</span>
                  </div>
                  <span className="maillage-protocol-tag">Maillage Décentralisé</span>
                </div>

                <div className="maillage-image-wrapper">
                  <img 
                    src="/senegal_map_official.png" 
                    alt="Carte du Maillage Territorial LéralScolaire Sénégal" 
                    className="maillage-map-img"
                  />

                  {/* COUCHE SVG DYNAMIQUE DU MAILLAGE RÉSEAU INTERCONNECTÉ */}
                  <svg 
                    className="maillage-svg-overlay" 
                    viewBox="0 0 1000 750" 
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* LIGNES DU MAILLAGE COMPLET ENTRE TOUTES LES RÉGIONS */}
                    <g className="network-lines">
                      {/* Axe Nord / Ouest */}
                      <line x1="70" y1="370" x2="175" y2="350" className="mesh-line" />
                      <line x1="70" y1="370" x2="340" y2="110" className="mesh-line" />
                      <line x1="175" y1="350" x2="340" y2="110" className="mesh-line" />
                      <line x1="340" y1="110" x2="350" y2="250" className="mesh-line" />
                      <line x1="340" y1="110" x2="640" y2="260" className="mesh-line" />
                      <line x1="350" y1="250" x2="640" y2="260" className="mesh-line" />

                      {/* Axe Centre / Bassin Arachidier */}
                      <line x1="175" y1="350" x2="270" y2="350" className="mesh-line" />
                      <line x1="175" y1="350" x2="350" y2="250" className="mesh-line" />
                      <line x1="175" y1="350" x2="210" y2="475" className="mesh-line" />
                      <line x1="270" y1="350" x2="350" y2="250" className="mesh-line" />
                      <line x1="270" y1="350" x2="210" y2="475" className="mesh-line" />
                      <line x1="270" y1="350" x2="305" y2="475" className="mesh-line" />
                      <line x1="210" y1="475" x2="305" y2="475" className="mesh-line" />
                      <line x1="305" y1="475" x2="420" y2="445" className="mesh-line" />
                      <line x1="350" y1="250" x2="420" y2="445" className="mesh-line" />

                      {/* Axe Est / Sénégal Oriental */}
                      <line x1="640" y1="260" x2="670" y2="490" className="mesh-line" />
                      <line x1="420" y1="445" x2="670" y2="490" className="mesh-line" />
                      <line x1="305" y1="475" x2="670" y2="490" className="mesh-line" />
                      <line x1="670" y1="490" x2="810" y2="645" className="mesh-line" />

                      {/* Axe Sud / Casamance */}
                      <line x1="70" y1="370" x2="175" y2="680" className="mesh-line mesh-subline" />
                      <line x1="210" y1="475" x2="175" y2="680" className="mesh-line" />
                      <line x1="305" y1="475" x2="295" y2="615" className="mesh-line" />
                      <line x1="305" y1="475" x2="440" y2="605" className="mesh-line" />
                      <line x1="420" y1="445" x2="440" y2="605" className="mesh-line" />
                      <line x1="670" y1="490" x2="440" y2="605" className="mesh-line" />
                      <line x1="810" y1="645" x2="440" y2="605" className="mesh-line" />
                      <line x1="440" y1="605" x2="295" y2="615" className="mesh-line" />
                      <line x1="295" y1="615" x2="175" y2="680" className="mesh-line" />
                    </g>

                    {/* NŒUDS RÉGIONAUX AVEC BULLES ET LABELS */}
                    <g className="network-nodes">
                      {/* Saint-Louis */}
                      <circle cx="340" cy="110" r="9" className="mesh-node node-green" />
                      <text x="358" y="117" className="mesh-label">Saint-Louis</text>

                      {/* Matam */}
                      <circle cx="640" cy="260" r="9" className="mesh-node node-cyan" />
                      <text x="658" y="267" className="mesh-label">Matam</text>

                      {/* Linguère / Louga */}
                      <circle cx="350" cy="250" r="9" className="mesh-node node-green" />
                      <text x="368" y="257" className="mesh-label">Linguère / Louga</text>

                      {/* Thiès */}
                      <circle cx="175" cy="350" r="8" className="mesh-node node-cyan" />
                      <text x="145" y="334" className="mesh-label font-compact">Thiès</text>

                      {/* Dakar */}
                      <circle cx="70" cy="370" r="10" className="mesh-node node-red" />
                      <text x="15" y="352" className="mesh-label label-bold">Dakar</text>

                      {/* Diourbel */}
                      <circle cx="270" cy="350" r="8" className="mesh-node node-cyan" />
                      <text x="285" y="356" className="mesh-label font-compact">Diourbel</text>

                      {/* Fatick */}
                      <circle cx="210" cy="475" r="8" className="mesh-node node-cyan" />
                      <text x="148" y="482" className="mesh-label font-compact">Fatick</text>

                      {/* Kaolack */}
                      <circle cx="305" cy="475" r="9" className="mesh-node node-orange" />
                      <text x="272" y="508" className="mesh-label">Kaolack</text>

                      {/* Kaffrine */}
                      <circle cx="420" cy="445" r="8" className="mesh-node node-orange" />
                      <text x="438" y="451" className="mesh-label font-compact">Kaffrine</text>

                      {/* Tambacounda */}
                      <circle cx="670" cy="490" r="11" className="mesh-node node-orange" />
                      <text x="690" y="497" className="mesh-label label-bold">Tambacounda</text>

                      {/* Sédhiou */}
                      <circle cx="295" cy="615" r="8" className="mesh-node node-orange" />
                      <text x="235" y="605" className="mesh-label font-compact">Sédhiou</text>

                      {/* Kolda */}
                      <circle cx="440" cy="605" r="9" className="mesh-node node-cyan" />
                      <text x="458" y="612" className="mesh-label">Kolda</text>

                      {/* Ziguinchor */}
                      <circle cx="175" cy="680" r="10" className="mesh-node node-green" />
                      <text x="95" y="700" className="mesh-label">Ziguinchor</text>

                      {/* Kédougou */}
                      <circle cx="810" cy="645" r="10" className="mesh-node node-green" />
                      <text x="735" y="675" className="mesh-label">Kédougou</text>
                    </g>
                  </svg>
                </div>

                <div className="maillage-map-footer">
                  <div className="maillage-metric-item">
                    <span className="maillage-metric-val">14/14</span>
                    <span className="maillage-metric-lbl">Académies Couvertes</span>
                  </div>
                  <div className="maillage-metric-item">
                    <span className="maillage-metric-val">&lt; 1 sec</span>
                    <span className="maillage-metric-lbl">Transfert de Livret</span>
                  </div>
                  <div className="maillage-metric-item">
                    <span className="maillage-metric-val">0 km</span>
                    <span className="maillage-metric-lbl">Déplacement Physique</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne Droite : Explications & Bénéfices */}
            <div className="maillage-text-content">
              <span className="stitch-tag-badge">Continuité Territoriale & Dématérialisation</span>
              <h2 className="maillage-title">
                Le maillage territorial de l'Éducation : <span className="text-cyan-400">Zéro transport de papier</span>
              </h2>
              <p className="maillage-description">
                De Dakar à Kédougou, de Saint-Louis à Ziguinchor : <strong>LéralScolaire interconnecte instantanément tous les établissements du Sénégal</strong> avec les Inspections d'Académie (IA/IEF) et l'Office du Baccalauréat.
              </p>

              <div className="maillage-benefits-list">
                <div className="maillage-benefit-item">
                  <div className="maillage-icon-box bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                    <FileCheck size={22} />
                  </div>
                  <div>
                    <h4 className="maillage-benefit-title">Fin des transferts physiques de dossiers</h4>
                    <p className="maillage-benefit-desc">
                      Plus aucun carton de bulletins ni convoi routier de dossiers scolaires à acheminer vers Dakar pour les sessions d'examens. Les livrets scellés transitent numériquement en toute sécurité.
                    </p>
                  </div>
                </div>

                <div className="maillage-benefit-item">
                  <div className="maillage-icon-box bg-teal-950 text-teal-400 border border-teal-700/50">
                    <Users size={22} />
                  </div>
                  <div>
                    <h4 className="maillage-benefit-title">Mobilité fluide des élèves inter-régions</h4>
                    <p className="maillage-benefit-desc">
                      Lorsqu'un élève change d'établissement ou de région, son dossier complet de la 6e à la Terminale est transféré instantanément via son IUP sans risque de perte ni démarches fastidieuses.
                    </p>
                  </div>
                </div>

                <div className="maillage-benefit-item">
                  <div className="maillage-icon-box bg-blue-950 text-blue-400 border border-blue-700/50">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h4 className="maillage-benefit-title">Égalité républicaine pour chaque lycée</h4>
                    <p className="maillage-benefit-desc">
                      Les établissements des zones les plus isolées disposent exactement de la même rapidité de délibération, de certification et d'accès aux opportunités post-bac que les lycées de la capitale.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 : LES PILIERS TECHNOLOGIQUES DE LA SOUVERAINETÉ SCOLAIRE */}
      <section id="piliers" className="stitch-section bg-surface-low">
        <div className="stitch-container">
          <div className="stitch-head-split">
            <div>
              <span className="stitch-tag-badge">Infrastructure Nationale</span>
              <h2 className="stitch-title">Les piliers technologiques de la souveraineté scolaire</h2>
              <p className="stitch-subtitle">
                Une suite d'outils pensée pour l'exactitude pédagogique, la simplicité administrative et la robustesse en conditions réelles.
              </p>
            </div>
          </div>

          <div className="stitch-features-grid">
            {/* 1. IUP */}
            <div className="feature-card">
              <div className="feature-icon-wrap bg-primary text-white">
                <span className="material-symbols-outlined text-[22px]">badge</span>
              </div>
              <h3 className="feature-title">Identifiant Unique de la Plateforme (IUP)</h3>
              <p className="feature-desc">
                Unicité absolue du dossier élève. Interopérabilité directe avec les registres de l'État civil sénégalais pour éliminer définitivement les doublons.
              </p>
            </div>

            {/* 2. Multi-rôles */}
            <div className="feature-card">
              <div className="feature-icon-wrap bg-teal-700 text-white">
                <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
              </div>
              <h3 className="feature-title">Gouvernance Multi-Rôles Stricte</h3>
              <p className="feature-desc">
                Droits d'accès cloisonnés : Proviseur (scellement), Censeur (programmation), Enseignant (saisie de notes), Parent (consultation) et Inspecteur MEN (audit).
              </p>
            </div>

            {/* 3. Calcul automatisé des coefs */}
            <div className="feature-card">
              <div className="feature-icon-wrap bg-orange-600 text-white">
                <span className="material-symbols-outlined text-[22px]">calculate</span>
              </div>
              <h3 className="feature-title">Calcul Automatisé des Coefficients</h3>
              <p className="feature-desc">
                Moteur de calcul conforme aux arrêtés ministériels. Prise en compte immédiate des séries S1, S2, L1, L2, L' et filières techniques sans erreur de formule.
              </p>
            </div>

            {/* 4. PDF Sécurisé & Filigrane */}
            <div className="feature-card">
              <div className="feature-icon-wrap bg-red-600 text-white">
                <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
              </div>
              <h3 className="feature-title">Édition PDF & Filigrane Anti-Copie</h3>
              <p className="feature-desc">
                Génération de livrets et relevés pérennes munis d'un micro-motif officiel et d'un filigrane réactif visible en cas de falsification.
              </p>
            </div>

            {/* 5. Mode Offline Résilient */}
            <div className="feature-card">
              <div className="feature-icon-wrap bg-green-700 text-white">
                <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
              </div>
              <h3 className="feature-title">Mode Hors-Ligne Résilient</h3>
              <p className="feature-desc">
                Fonctionne sans connexion Internet continue. Le système fusionne automatiquement et en toute sécurité les saisies des conseils de classe sans perte de données.
              </p>
            </div>

            {/* 6. Vérification sans App */}
            <div className="feature-card">
              <div className="feature-icon-wrap bg-blue-900 text-white">
                <span className="material-symbols-outlined text-[22px]">qr_code_2</span>
              </div>
              <h3 className="feature-title">Vérification QR sans Application</h3>
              <p className="feature-desc">
                Un simple appareil photo de smartphone suffit à vérifier la validité sur le portail public sécurisé du ministère, garantissant l'accès universel aux familles.
              </p>
            </div> 
          </div>
        </div>
      </section>

      {/* SECTION 5 : COMMENT ÇA MARCHE (LE PARCOURS EN 4 ÉTAPES) */}
      <section id="processus" className="stitch-section">
        <div className="stitch-container">
          <div className="stitch-head text-center">
            <span className="stitch-tag-badge">Processus Cadré</span>
            <h2 className="stitch-title">Le parcours de certification en 4 étapes simples</h2>
            <p className="stitch-subtitle">
              De la fin du trimestre scolaire à l'admission universitaire, un protocole strict et fluide pour tous les acteurs.
            </p>
          </div>

          <div className="stitch-steps-grid">
            {/* Step 1 */}
            <div className="step-box-card">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="step-huge-num text-slate-300">01</span>
                  <span className="material-symbols-outlined text-teal-700 text-[26px]">edit_note</span>
                </div>
                <h3 className="step-card-title">Saisie Décentralisée</h3>
                <p className="step-card-desc">
                  Les professeurs saisissent leurs notes et appréciations sur smartphone, tablette ou ordinateur portable, avec ou sans internet.
                </p>
              </div>
              <div className="step-card-actor">
                <span>Acteur : Corps Enseignant</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-box-card">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="step-huge-num text-slate-300">02</span>
                  <span className="material-symbols-outlined text-blue-900 text-[26px]">gavel</span>
                </div>
                <h3 className="step-card-title">Conseil & Scellement</h3>
                <p className="step-card-desc">
                  Le chef d'établissement clôture la délibération et appose son sceau cryptographique officiel. Les notes deviennent immuables.
                </p>
              </div>
              <div className="step-card-actor">
                <span>Acteur : Proviseur / Censeur</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-box-card">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="step-huge-num text-slate-300">03</span>
                  <span className="material-symbols-outlined text-green-700 text-[26px]">forward_to_inbox</span>
                </div>
                <h3 className="step-card-title">Diffusion Instantanée</h3>
                <p className="step-card-desc">
                  Notification automatique envoyée aux parents par SMS, WhatsApp sécurisé et mise à disposition dans l'espace famille souverain.
                </p>
              </div>
              <div className="step-card-actor">
                <span>Acteur : Parents & Élèves</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="step-box-card">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="step-huge-num text-slate-300">04</span>
                  <span className="material-symbols-outlined text-orange-600 text-[26px]">school</span>
                </div>
                <h3 className="step-card-title">Contrôle Bac & Universités</h3>
                <p className="step-card-desc">
                  L'Office du Baccalauréat et Campusen vérifient instantanément l'authenticité de l'intégralité du cursus sans solliciter d'originaux papier.
                </p>
              </div>
              <div className="step-card-actor">
                <span>Acteur : Enseignement Supérieur</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 : PENSÉ POUR CHAQUE ACTEUR ÉDUCATIF */}
      <section id="acteurs" className="stitch-section bg-surface-low">
        <div className="stitch-container">
          <div className="stitch-head text-center">
            <span className="stitch-tag-badge">Écosystème Inclusif</span>
            <h2 className="stitch-title">Une valeur concrète pour chaque maillon scolaire</h2>
            <p className="stitch-subtitle">
              Conçu pour alléger le travail quotidien sans jamais complexifier les usages.
            </p>
          </div>

          <div className="stitch-actors-grid">
            {/* Proviseurs */}
            <div className="actor-card">
              <div className="actor-card-body">
                <div className="actor-icon-box bg-blue-900 text-white">
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                </div>
                <h3 className="actor-card-title">Chefs d'Établissement</h3>
                <p className="actor-card-desc">
                  Tableaux de bord d'avancement des saisies, délibération automatisée et zéro risque d'usurpation de la signature du lycée.
                </p>
              </div>
              <div className="actor-card-gain">
                <span>Gain de 80h par session</span>
              </div>
            </div>

            {/* Enseignants */}
            <div className="actor-card">
              <div className="actor-card-body">
                <div className="actor-icon-box bg-orange-600 text-white">
                  <span className="material-symbols-outlined text-[20px]">edit_square</span>
                </div>
                <h3 className="actor-card-title">Corps Enseignant</h3>
                <p className="actor-card-desc">
                  Saisie intuitive en 3 clics, calcul automatique des rangs et conservation de l'historique pédagogique sans papier.
                </p>
              </div>
              <div className="actor-card-gain">
                <span>100% Fonctionnel hors-ligne</span>
              </div>
            </div>

            {/* Parents / Elèves */}
            <div className="actor-card">
              <div className="actor-card-body">
                <div className="actor-icon-box bg-green-600 text-white">
                  <span className="material-symbols-outlined text-[20px]">family_restroom</span>
                </div>
                <h3 className="actor-card-title">Parents & Élèves</h3>
                <p className="actor-card-desc">
                  Accès immédiat et gratuit aux bulletins officiels, alertes présences, et conservation à vie du livret scolaire certifié.
                </p>
              </div>
              <div className="actor-card-gain">
                <span>Zéro frais d'impression</span>
              </div>
            </div>

            {/* Office du Bac */}
            <div className="actor-card">
              <div className="actor-card-body">
                <div className="actor-icon-box bg-teal-700 text-white">
                  <span className="material-symbols-outlined text-[20px]">domain_verification</span>
                </div>
                <h3 className="actor-card-title">Office du Bac & MEN</h3>
                <p className="actor-card-desc">
                  Agrégation nationale des statistiques, détection immédiate des fraudes aux candidatures et conformité totale aux audits publics.
                </p>
              </div>
              <div className="actor-card-gain">
                <span>Vérification en 1.8 seconde</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 : SÉCURITÉ & SOUVERAINETÉ NUMÉRIQUE (GÉNÉRALISÉE ET INSTITUTIONNELLE) */}
      <section id="securite" className="stitch-section stitch-dark-security">
        <div className="stitch-container">
          <div className="security-grid-2cols">
            {/* Colonne Gauche : Principes Généraux de Sécurité */}
            <div className="security-content">
              <div className="security-badge-chip">
                <span className="material-symbols-outlined text-[16px]">shield</span>
                <span>Protection & Souveraineté</span>
              </div>
              <h2 className="security-main-title">
                Sécurité renforcée et protection intégrale du parcours scolaire
              </h2>
              <p className="security-main-desc">
                Une architecture conçue selon les normes régaliennes les plus exigeantes pour garantir la confidentialité, l'authenticité et la traçabilité de chaque livret scolaire.
              </p>

              <div className="security-items-list">
                <div className="security-item-row">
                  <span className="material-symbols-outlined icon-green text-[22px]">verified_user</span>
                  <div>
                    <h4 className="security-item-heading">Intégrité & Immuabilité des Bulletins</h4>
                    <p className="security-item-text">Chaque relevé est scellé numériquement dès la délibération du conseil, rendant toute altération ou modification a posteriori impossible.</p>
                  </div>
                </div>

                <div className="security-item-row">
                  <span className="material-symbols-outlined icon-green text-[22px]">lock</span>
                  <div>
                    <h4 className="security-item-heading">Protection des Données Personnelles</h4>
                    <p className="security-item-text">Respect strict des exigences nationales de confidentialité et de conformité pour protéger les informations des élèves et des familles.</p>
                  </div>
                </div>

                <div className="security-item-row">
                  <span className="material-symbols-outlined icon-green text-[22px]">qr_code_scanner</span>
                  <div>
                    <h4 className="security-item-heading">Authentification & Traçabilité Immédiate</h4>
                    <p className="security-item-text">Vérification instantanée de la validité des livrets par les jurys du Baccalauréat, les universités et les institutions partenaires.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne Droite : Carte Institutionnelle de Garantie Numérique */}
            <div className="security-terminal-col">
              <div className="security-cert-card">
                <div className="cert-card-header">
                  <div className="cert-badge-official">
                    <ShieldCheck size={18} className="text-teal-300" />
                    <span>Garantie d'Authenticité Officielle</span>
                  </div>
                  <span className="cert-status-pill">Sceau Actif</span>
                </div>

                <div className="cert-card-body">
                  <div className="cert-field-row">
                    <span className="cert-label">Type de document</span>
                    <span className="cert-value">Livret Scolaire Numérique</span>
                  </div>
                  <div className="cert-field-row">
                    <span className="cert-label">Niveau de protection</span>
                    <span className="cert-value font-semibold text-teal-300">Scellement Numérique d'État</span>
                  </div>
                  <div className="cert-field-row">
                    <span className="cert-label">Contrôle d'intégrité</span>
                    <span className="cert-value font-semibold text-green-400">100% Conforme & Inaltérable</span>
                  </div>
                  <div className="cert-field-row">
                    <span className="cert-label">Statut de validation</span>
                    <span className="cert-value flex items-center gap-1.5 text-green-400 font-semibold">
                      <CheckCircle2 size={16} /> Authentifié & Certifié
                    </span>
                  </div>
                </div>

                <div className="cert-card-footer">
                  <span className="cert-footer-tag">Vérification universelle en temps réel</span>
                  <span className="terminal-pulse-dot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 : CHIFFRES CLÉS & BANNIÈRE SOUVERAINE */}
      <section className="stitch-section">
        <div className="stitch-container">
          {/* Ruban des Chiffres Clés */}
          <div className="stitch-metrics-ribbon">
            <div className="metric-box-card">
              <span className="metric-huge-stat text-blue-900">16</span>
              <p className="metric-stat-name">Académies Régionales</p>
              <p className="metric-stat-sub">Prêtes au déploiement</p>
            </div>

            <div className="metric-box-card">
              <span className="metric-huge-stat text-teal-700">&lt; 2s</span>
              <p className="metric-stat-name">Vérification QR</p>
              <p className="metric-stat-sub">Sans application requise</p>
            </div>

            <div className="metric-box-card">
              <span className="metric-huge-stat text-green-700">0</span>
              <p className="metric-stat-name">Feuille de Papier</p>
              <p className="metric-stat-sub">Empreinte carbone nulle</p>
            </div>

            <div className="metric-box-card">
              <span className="metric-huge-stat text-orange-600">100%</span>
              <p className="metric-stat-name">Autonomie Hors-Ligne</p>
              <p className="metric-stat-sub">Technologie CRDT brevetée</p>
            </div>
          </div>

          {/* Bannière d'Engagement National */}
          <div className="stitch-sovereign-banner">
            <div className="banner-content-wrap">
              <div className="banner-badge-pill">
                <span className="material-symbols-outlined text-[14px]">flag</span>
                <span>Engagement National du Sénégal</span>
              </div>
              <h2 className="banner-title-text">
                Faites entrer votre établissement dans l'ère de la certification infalsifiable
              </h2>
              <p className="banner-desc-text">
                Vous êtes Proviseur, Censeur ou Délégué d'Académie (IA/IEF) ? Accédez dès aujourd'hui au portail officiel sécurisé.
              </p>

              <div className="banner-buttons-row">
                <button 
                  className="btn-banner-primary"
                  onClick={handleAuthAction}
                >
                  <span>Accéder à l'espace de gestion</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Filigrane en arrière-plan */}
            <div className="banner-watermark-bg" aria-hidden="true">
              <span className="material-symbols-outlined text-[320px]">verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER INSTITUTIONNEL SÉNÉGALAIS */}
      <footer className="stitch-footer">
        <div className="stitch-container footer-content-wrap">
          <div className="footer-grid-4cols">
            {/* Col 1 : Identité République */}
            <div className="footer-col-about">
              <div className="footer-rep-badge">
                <div className="footer-flag-box">
                  <div className="flag-stripe-green" />
                  <div className="flag-stripe-yellow">
                    <span className="flag-star">★</span>
                  </div>
                  <div className="flag-stripe-red" />
                </div>
                <span className="footer-ministry-title">
                  Ministère de l'Éducation Nationale
                </span>
              </div>
              <p className="footer-about-text">
                Plateforme souveraine de certification cryptographique des livrets et bulletins scolaires de la République du Sénégal.
              </p>
            </div>

            {/* Col 2 : Plateforme */}
            <div className="footer-col-nav">
              <h4 className="footer-col-heading">Plateforme</h4>
              <ul className="footer-links-list">
                <li><a href="#poles">Les 4 Pôles Éducatifs</a></li>
                <li><a href="#comparatif">Papier vs LéralScolaire</a></li>
                <li><a href="#piliers">Piliers Technologiques</a></li>
                <li><a href="#processus">Processus en 4 Étapes</a></li>
              </ul>
            </div>

            {/* Col 3 : Sécurité & Conformité */}
            <div className="footer-col-nav">
              <h4 className="footer-col-heading">Sécurité & Conformité</h4>
              <ul className="footer-links-list">
                <li><a href="#securite">Architecture cryptographique</a></li>
                <li><a href="#securite">Conformité CDP (Loi 2008-12)</a></li>
                <li><a href="#securite">Datacenter National Diamniadio</a></li>
                <li><a href="#securite">Protection des données scolaires</a></li>
              </ul>
            </div>

            {/* Col 4 : Contact & Support */}
            <div className="footer-col-nav">
              <h4 className="footer-col-heading">Contact & Support</h4>
              <p className="footer-contact-line">Direction des Systèmes d'Information (DSI)</p>
              <p className="footer-contact-line">Sphères Ministérielles de Diamniadio</p>
              <p className="footer-contact-email">contact@leralscolaire.com</p>
            </div>
          </div>

          {/* Barre Inférieure Légale */}
          <div className="footer-bottom-bar">
            <span className="footer-copy-text">
              © {new Date().getFullYear()} LéralScolaire • République du Sénégal. Tous droits réservés.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

