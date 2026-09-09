import React, { useState } from 'react';
import { 
  LogIn, 
  Sparkles, 
  Menu, 
  X, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Lock, 
  GraduationCap, 
  Building2, 
  Users, 
  Award, 
  QrCode, 
  CheckCircle2, 
  School, 
  HelpCircle, 
  ChevronDown, 
  BookOpen, 
  Lightbulb, 
  Target, 
  Layers, 
  Check, 
  Clock, 
  Compass, 
  HeartHandshake
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AboutPage.css';

export const AboutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // État de l'accordéon FAQ
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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

  const faqs = [
    {
      question: "Est-ce que LéralScolaire fonctionne sans connexion internet ?",
      answer: "Oui, absolument. LéralScolaire intègre une technologie résiliente hors-ligne. Les enseignants peuvent saisir l'ensemble des notes et appréciations en classe sans accès réseau. Dès qu'une connexion (3G/4G ou Wi-Fi) est détectée, la synchronisation sécurisée s'effectue automatiquement sans conflit de données."
    },
    {
      question: "Comment sont protégées les données et la vie privée des élèves ?",
      answer: "La protection des données est au cœur du système. LéralScolaire respecte scrupuleusement la réglementation nationale relative à la protection des données à caractère personnel. Les informations scolaires sont protégées par des protocoles stricts, et aucun livret ne peut être altéré une fois scellé par l'établissement."
    },
    {
      question: "Comment un jury ou une université vérifie l'authenticité d'un livret ?",
      answer: "Chaque livret ou relevé génère un QR code officiel infalsifiable. Un simple scan avec la caméra d'un smartphone redirige vers le portail public d'authentification de l'État, affichant instantanément le statut certifié et la conformité du dossier sans nécessiter d'application tierce."
    },
    {
      question: "Les établissements d'enseignement privé peuvent-ils adhérer à la plateforme ?",
      answer: "Tout à fait. LéralScolaire a été pensé pour unifier l'ensemble du système scolaire sénégalais. Les collèges et lycées privés reconnus par l'État peuvent être rattachés à la plateforme avec les mêmes garanties de scellement et de transmission officielle vers l'Office du Bac."
    },
    {
      question: "Quel est le coût d'accès pour les élèves et les parents ?",
      answer: "L'accès à l'espace élève et parent est 100% gratuit. Les familles peuvent consulter et télécharger les livrets certifiés de leurs enfants à tout moment, sans aucun frais d'impression ni intermédiaire."
    },
    {
      question: "Que devient le livret scolaire après l'obtention du Baccalauréat ?",
      answer: "Le livret reste archivé et accessible à vie dans le coffre-fort numérique de l'élève grâce à son Identifiant Unique de la Plateforme (IUP). Il sert de référence infalsifiable pour les candidatures universitaires nationales (Campusen) et internationales."
    }
  ];

  return (
    <div className="about-page-wrapper">
      {/* 1. NAVBAR CAPSULE UNIFIÉE */}
      <header className="capsule-header">
        <div className="capsule-container">
          <Link to="/" className="capsule-brand">
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

          <nav className="capsule-nav">
            <Link to="/" className="nav-link">Accueil</Link>
            <Link to="/a-propos" className="nav-link active">À Propos</Link>
            <a href="/#poles" className="nav-link">4 Pôles</a>
            <a href="/#comparatif" className="nav-link">Souveraineté</a>
            <a href="/#piliers" className="nav-link">Fonctionnalités</a>
            <a href="/#processus" className="nav-link">Processus</a>
            <a href="/#securite" className="nav-link">Sécurité</a>
          </nav>

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

            <button 
              className="capsule-burger" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="capsule-mobile-drawer">
            <Link to="/" onClick={closeMobileMenu} className="mobile-nav-link">Accueil</Link>
            <Link to="/a-propos" onClick={closeMobileMenu} className="mobile-nav-link active">À Propos du Projet</Link>
            <a href="/#poles" onClick={closeMobileMenu} className="mobile-nav-link">Les 4 Pôles Éducatifs</a>
            <a href="/#comparatif" onClick={closeMobileMenu} className="mobile-nav-link">Papier vs LéralScolaire</a>
            <a href="/#piliers" onClick={closeMobileMenu} className="mobile-nav-link">Piliers Technologiques</a>
            <a href="/#processus" onClick={closeMobileMenu} className="mobile-nav-link">Processus en 4 Étapes</a>
            <a href="/#securite" onClick={closeMobileMenu} className="mobile-nav-link">Sécurité & Souveraineté</a>
            <div className="mobile-drawer-btn">
              <button className="btn-capsule-primary w-full" onClick={() => { closeMobileMenu(); handleAuthAction(); }}>
                {user ? 'Accéder à mon espace' : 'Se connecter'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO DE LA PAGE À PROPOS */}
      <section className="about-hero-section">
        <div className="about-hero-glow" />
        <div className="about-container">
          <div className="about-hero-content text-center">
            <h1 className="about-hero-title">
              L'Histoire, la Vision et l'Engagement de léralscolaire.
            </h1>
            <p className="about-hero-subtitle">
              Une plateforme républicaine innovante pour unifier, sécuriser et pérenniser le livret scolaire numérique au Sénégal de la 6ème au Baccalauréat.
            </p>
          </div>
        </div>
      </section>

      {/* 3. QU'EST-CE QUE LÉRAL SCOLAIRE ? */}
      <section className="about-section bg-white">
        <div className="about-container">
          <div className="grid-2cols items-center gap-12">
            <div>
              <span className="about-tag">Définition & Portée Pédagogique</span>
              <h2 className="about-section-title">Qu'est-ce que LéralScolaire ?</h2>
              <p className="about-paragraph">
                <strong>LéralScolaire</strong> est la plateforme numérique nationale de gestion, de certification et de pilotage pédagogique du système éducatif sénégalais, couvrant l'ensemble du cursus de la 6<sup>e</sup> à la Terminale.
              </p>
              <p className="about-paragraph">
                Le mot <em>« Léral »</em> incarne la <strong>« Lumière »</strong>, la <strong>« Transparence »</strong> et la <strong>« Clarté »</strong> en Wolof. Bien plus qu'un simple livret de notes dématérialisé, LéralScolaire est un écosystème complet de suivi pédagogique conçu pour :
              </p>
              <ul className="about-bullet-list">
                <li>
                  <strong>Le suivi rigoureux des programmes scolaires :</strong> Permettre aux équipes pédagogiques, aux proviseurs et aux corps d'inspection de mesurer en temps réel la progression des cours, le respect du calendrier ministériel et le taux d'exécution des programmes par discipline et par niveau.
                </li>
                <li>
                  <strong>L'accompagnement des enseignants et des élèves :</strong> Faciliter la saisie continue des devoirs, la gestion des évaluations, le cahier de texte numérique et le suivi de l'assiduité scolaire.
                </li>
                <li>
                  <strong>La certification infalsifiable :</strong> Sceller numériquement les bulletins et livrets scolaires dès la clôture des conseils de classe pour éliminer définitivement les risques de falsification ou de perte d'archives.
                </li>
                <li>
                  <strong>Le pilotage stratégique des établissements :</strong> Offrir aux chefs d'établissement et aux académies (IA / IEF) des tableaux de bord analytiques pour anticiper les délibérations et soutenir la réussite des élèves.
                </li>
              </ul>
            </div>

            <div className="about-card-visual">
              <div className="visual-inner-box">
                <img 
                  src="/logo_leralscolaire.png" 
                  alt="Logo LéralScolaire" 
                  className="visual-logo-large"
                />
                <h3 className="visual-box-title">LéralScolaire</h3>
                <p className="visual-box-sub">Système Intégré de Suivi Pédagogique & Certification</p>
                <div className="visual-seal-badge">
                  <ShieldCheck size={16} /> Sceau Numérique d'État
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUI EST À L'ORIGINE DU PROJET ? */}
      <section className="about-section bg-slate-50">
        <div className="about-container">
          <div className="section-header-center">
            <span className="about-tag">Origine & Initiative</span>
            <h2 className="about-section-title">Qui est à l'origine du projet ?</h2>
            <p className="about-section-subtitle">
              Une démarche d'ingénierie citoyenne et patriotique dédiée à la modernisation du Sénégal.
            </p>
          </div>

          <div className="author-presentation-card">
            <div className="author-info-content">
              <h3 className="author-name">Khadim Ndoye</h3>
              <p className="author-title-sub">Développeur Fullstack & DevOps • Étudiant-Ingénieur à l'ESMT Dakar</p>

              <div className="author-text-paragraphs">
                <p>
                  <strong>LéralScolaire</strong> est le fruit d'un travail de mémoire de fin d'études en <strong>Licence de Développement d'Applications Réparties (DAR)</strong> à l'<strong>ESMT Dakar (École Supérieure Multinationale des Télécommunications)</strong> sous la direction de Dr Moustapha Der enseignant chercheur à l'ESMT.
                </p>
                <p>
                  Ce projet s'inscrit dans une vision claire : mettre l'ingénierie logicielle avancée et les pratiques modernes du DevOps au service direct de la modernisation de nos secteurs stratégiques, en particulier l'<strong>Éducation Nationale</strong>. En tant que jeune développeur sénégalais, j'ai la conviction profonde que notre génération a un rôle déterminant à jouer et une contribution majeure à apporter pour accompagner le développement socio-économique de notre pays.
                </p>
                <p>
                  Face aux défis récurrents du système scolaire — bulletins modifiés manuellement, lourdeur des archives papier, difficultés de suivi pédagogique dans les zones reculées et délais d'attente lors des examens officiels —, j'ai conçu LéralScolaire comme une réponse technologique souveraine, résiliente hors-ligne et accessible à tous, pour aider notre pays à franchir un nouveau cap vers l'excellence numérique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NOS OBJECTIFS */}
      <section className="about-section bg-white">
        <div className="about-container">
          <div className="section-header-center">
            <span className="about-tag">Engagements Fondamentaux</span>
            <h2 className="about-section-title">Nos Objectifs</h2>
            <p className="about-section-subtitle">
              Trois piliers indissociables pour transformer durablement l'expérience scolaire.
            </p>
          </div>

          <div className="grid-3cols gap-8">
            {/* 1. Transparence Totale */}
            <div className="objective-card objective-card-blue">
              <div className="objective-icon-wrap bg-blue-900 text-white">
                <ShieldCheck size={26} />
              </div>
              <h3 className="objective-title">Transparence Totale</h3>
              <p className="objective-desc">
                Garantir une exactitude rigoureuse dans le calcul des moyennes selon les barèmes officiels du MEN. Rendre les délibérations incontestables, éliminer toute tentative d'altération et permettre aux familles de suivre les résultats en toute confiance.
              </p>
              <ul className="objective-bullets">
                <li><Check size={16} className="text-blue-700" /> Calculs automatisés sans erreur de formule</li>
                <li><Check size={16} className="text-blue-700" /> Scellement numérique officiel inaltérable</li>
                <li><Check size={16} className="text-blue-700" /> Traçabilité intégrale de la 6e au Bac</li>
              </ul>
            </div>

            {/* 2. Efficacité Accrue */}
            <div className="objective-card objective-card-teal">
              <div className="objective-icon-wrap bg-teal-700 text-white">
                <Clock size={26} />
              </div>
              <h3 className="objective-title">Efficacité Accrue</h3>
              <p className="objective-desc">
                Alléger drastiquement la charge administrative des équipes pédagogiques. Les conseils de classe délibèrent en quelques minutes, les proviseurs économisent plus de 80h par session et les coûts d'impression papier sont totalement supprimés.
              </p>
              <ul className="objective-bullets">
                <li><Check size={16} className="text-teal-700" /> Gain de plus de 80h par session d'examen</li>
                <li><Check size={16} className="text-teal-700" /> Zéro papier et zéro frais d'impression</li>
                <li><Check size={16} className="text-teal-700" /> Vérification en moins de 2s au Bac et Campusen</li>
              </ul>
            </div>

            {/* 3. Accessibilité Universelle */}
            <div className="objective-card objective-card-orange">
              <div className="objective-icon-wrap bg-orange-600 text-white">
                <HeartHandshake size={26} />
              </div>
              <h3 className="objective-title">Accessibilité Universelle</h3>
              <p className="objective-desc">
                Permettre à chaque enseignant de travailler sereinement même sans connexion internet (Offline-First). Offrir aux parents un accès direct, gratuit et universel aux bulletins de leurs enfants sur n'importe quel smartphone par simple scan QR Code.
              </p>
              <ul className="objective-bullets">
                <li><Check size={16} className="text-orange-600" /> 100% fonctionnel en mode hors-ligne</li>
                <li><Check size={16} className="text-orange-600" /> Consultation gratuite à vie pour les parents</li>
                <li><Check size={16} className="text-orange-600" /> Vérification QR sans application requise</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NOTRE VISION POUR L'ÉCOLE SÉNÉGALAISE */}
      <section className="about-section about-vision-section">
        <div className="about-container">
          <div className="grid-2cols items-center gap-12">
            <div className="vision-text-col">
              <div className="vision-badge-pill">
                <Lightbulb size={16} />
                <span>Cap vers l'Excellence Républicaine</span>
              </div>
              <h2 className="vision-main-title">
                Notre Vision pour l'École Sénégalaise
              </h2>
              <p className="vision-main-desc">
                L'éducation est le socle de toute nation émergente. Notre vision est de bâtir un système scolaire moderne, équitable et résilient, où la technologie agit comme un puissant vecteur d'égalité des chances pour chaque jeune Sénégalais, de Dakar jusqu'aux établissements les plus isolés du pays.
              </p>
              <p className="vision-main-desc">
                Nous voulons qu'aucun élève ne voit son avenir compromis par la disparition d'un dossier papier, qu'aucun professeur ne perde son temps précieux dans des tâches administratives répétitives, et qu'aucune université — au Sénégal comme à l'étranger — n'ait le moindre doute sur l'authenticité d'un bulletin sénégalais.
              </p>
              <p className="vision-main-desc-light">
                En unifiant l'Identifiant Unique de la Plateforme (IUP) avec des mécanismes de certification infalsifiables, LéralScolaire ambitionne de positionner le Sénégal comme un pionnier en Afrique subsaharienne dans la transformation numérique souveraine de l'éducation.
              </p>
            </div>

            <div className="vision-pillars-box">
              <div className="vision-item">
                <div className="vision-num">01</div>
                <div>
                  <h4 className="vision-item-title">Souveraineté des Données</h4>
                  <p className="vision-item-desc">Un patrimoine éducatif protégé et géré exclusivement selon les normes républicaines de l'État du Sénégal.</p>
                </div>
              </div>

              <div className="vision-item">
                <div className="vision-num">02</div>
                <div>
                  <h4 className="vision-item-title">Équité Territoriale</h4>
                  <p className="vision-item-desc">Les mêmes standards d'excellence, de suivi et de certification pour chaque lycée et collège du territoire.</p>
                </div>
              </div>

              <div className="vision-item">
                <div className="vision-num">03</div>
                <div>
                  <h4 className="vision-item-title">Pérennité du Parcours</h4>
                  <p className="vision-item-desc">Un historique scolaire conservé à vie, facilitant l'orientation post-bac, l'insertion professionnelle et les bourses.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMMENT ÇA MARCHE ? */}
      <section className="about-section bg-slate-50">
        <div className="about-container">
          <div className="section-header-center">
            <span className="about-tag">Fonctionnement Simplifié</span>
            <h2 className="about-section-title">Comment ça marche ?</h2>
            <p className="about-section-subtitle">
              Un protocole structuré en 4 temps, du conseil de classe à l'examen officiel.
            </p>
          </div>

          <div className="workflow-steps-grid">
            <div className="workflow-step-card">
              <span className="step-badge">Étape 1</span>
              <h3 className="step-title">Saisie des Notes</h3>
              <p className="step-text">Les professeurs renseignent les notes et appréciations sur leur espace, avec ou sans connexion internet.</p>
            </div>

            <div className="workflow-step-card">
              <span className="step-badge">Étape 2</span>
              <h3 className="step-title">Calcul & Scellement</h3>
              <p className="step-text">Le proviseur délibère le conseil et appose le sceau officiel d'établissement qui verrouille le livret.</p>
            </div>

            <div className="workflow-step-card">
              <span className="step-badge">Étape 3</span>
              <h3 className="step-title">Mise à Disposition</h3>
              <p className="step-text">Les parents et élèves accèdent gratuitement au relevé certifié muni de son QR Code officiel.</p>
            </div>

            <div className="workflow-step-card">
              <span className="step-badge">Étape 4</span>
              <h3 className="step-title">Vérification Bac</h3>
              <p className="step-text">L'Office du Bac et les universités valident l'authenticité de l'intégralité du cursus en 1 clic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. QUESTIONS FRÉQUENTES (FAQ ACCORDÉON) */}
      <section className="about-section bg-white">
        <div className="about-container max-w-4xl">
          <div className="section-header-center">
            <span className="about-tag">Réponses Claires</span>
            <h2 className="about-section-title">Questions Fréquentes (FAQ)</h2>
            <p className="about-section-subtitle">
              Tout ce que vous devez savoir sur l'utilisation et la sécurité de LéralScolaire.
            </p>
          </div>

          <div className="faq-accordion-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item-card ${openFaq === index ? 'active' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-item-question">
                  <span className="faq-question-text">{faq.question}</span>
                  <ChevronDown size={20} className={`faq-arrow-icon ${openFaq === index ? 'rotate' : ''}`} />
                </div>
                {openFaq === index && (
                  <div className="faq-item-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. BANNIÈRE D'APPEL À L'ACTION */}
      <section className="about-section pt-0">
        <div className="about-container">
          <div className="stitch-sovereign-banner">
            <div className="banner-content-wrap">
              <div className="banner-badge-pill">
                <span className="material-symbols-outlined text-[14px]">flag</span>
                <span>Engagement National du Sénégal</span>
              </div>
              <h2 className="banner-title-text">
                Prêt à moderniser la gestion scolaire de votre établissement ?
              </h2>
              <p className="banner-desc-text">
                Rejoignez le réseau national des collèges et lycées connectés au standard officiel LéralScolaire.
              </p>

              <div className="banner-buttons-row">
                <button 
                  className="btn-banner-primary"
                  onClick={handleAuthAction}
                >
                  <span>Accéder à mon espace sécurisé</span>
                  <ArrowRight size={16} />
                </button>
                <Link 
                  to="/" 
                  className="btn-banner-secondary"
                >
                  <span>Retour à la page d'accueil</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            <div className="banner-watermark-bg" aria-hidden="true">
              <span className="material-symbols-outlined text-[320px]">verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER INSTITUTIONNEL */}
      <footer className="stitch-footer">
        <div className="stitch-container footer-content-wrap">
          <div className="footer-grid-4cols">
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

            <div className="footer-col-nav">
              <h4 className="footer-col-heading">Navigation</h4>
              <ul className="footer-links-list">
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/a-propos">À Propos du Projet</Link></li>
                <li><a href="/#poles">Les 4 Pôles Éducatifs</a></li>
                <li><a href="/#piliers">Piliers Technologiques</a></li>
              </ul>
            </div>

            <div className="footer-col-nav">
              <h4 className="footer-col-heading">Sécurité & Conformité</h4>
              <ul className="footer-links-list">
                <li><a href="/#securite">Protection des Données</a></li>
                <li><a href="/#securite">Conformité Légale</a></li>
                <li><a href="/#securite">Scellement d'État</a></li>
                <li><a href="/#securite">Vérification QR Code</a></li>
              </ul>
            </div>

            <div className="footer-col-nav">
              <h4 className="footer-col-heading">Contact & Support</h4>
              <p className="footer-contact-line">Direction des Systèmes d'Information (DSI)</p>
              <p className="footer-contact-line">Sphères Ministérielles de Diamniadio</p>
              <p className="footer-contact-email">contact@leralscolaire.com</p>
            </div>
          </div>

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

export default AboutPage;
