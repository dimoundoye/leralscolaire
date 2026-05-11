import React from 'react';
import { LogIn, UserPlus, BookOpen, ShieldCheck, Zap, BarChart3, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="header">
        <div className="container nav-container">
          <div className="logo">
            <div className="logo-icon">SN</div>
            <span className="logo-text">Leral<span className="text-orange">Scolaire</span></span>
          </div>
          <div className="nav-links">
            <a href="#features">Fonctionnalités</a>
            <a href="#stats">Statistiques</a>
            <a href="#about">À propos</a>
          </div>
          <div className="nav-btns">
            <button className="btn btn-outline" onClick={() => navigate('/auth')}>
              <LogIn size={18} /> Connexion
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/auth')}>
              <UserPlus size={18} /> S'inscrire
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <div className="badge">Gouvernement du Sénégal — MEN</div>
            <h1>Le Futur de la <br /><span className="text-orange">Réussite Scolaire</span></h1>
            <p>
              Dématérialisez le parcours académique de vos élèves de la 6ème à la Terminale. 
              Une plateforme sécurisée, intelligente et accessible partout, même hors-ligne.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-large" onClick={() => navigate('/auth')}>Découvrir la plateforme</button>
              <button className="btn btn-outline btn-large">Voir la démo</button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-image"
          >
            <div className="hero-card-main">
              <div className="card-header">
                <div className="user-info">
                  <div className="avatar"></div>
                  <div>
                    <h4>Abdoulaye DIOP</h4>
                    <p>SN-2025-WSD-000123</p>
                  </div>
                </div>
                <div className="status-badge">Admis</div>
              </div>
              <div className="card-stats">
                <div className="stat-item">
                  <p>Moyenne Générale</p>
                  <h3>16.45</h3>
                </div>
                <div className="stat-item">
                  <p>Rang</p>
                  <h3>2ème</h3>
                </div>
              </div>
            </div>
            <div className="hero-card-accent">
              <ShieldCheck className="text-orange" size={40} />
              <p>Données Certifiées</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section (Inspired by your image) */}
      <section id="stats" className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h2>500k+</h2>
              <p>Élèves Inscrits</p>
            </div>
            <div className="stat-card">
              <h2>5000+</h2>
              <p>Établissements</p>
            </div>
            <div className="stat-card">
              <h2>100%</h2>
              <p>Sécurisé</p>
            </div>
            <div className="stat-card">
              <h2>24/7</h2>
              <p>Accès Hors-ligne</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section section-padding">
        <div className="container">
          <div className="section-header">
            <div className="badge">Pourquoi nous choisir ?</div>
            <h2>Une Solution <span className="text-orange">Tout-en-Un</span></h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="icon-box"><Zap /></div>
              <h3>Saisie Rapide</h3>
              <p>Importation Excel et Scan IA pour une gestion des notes en quelques secondes.</p>
            </div>
            <div className="feature-card">
              <div className="icon-box"><Globe /></div>
              <h3>Mode Hors-ligne</h3>
              <p>Continuez à travailler sans internet. La synchronisation est automatique dès que vous êtes en ligne.</p>
            </div>
            <div className="feature-card">
              <div className="icon-box"><BarChart3 /></div>
              <h3>Analyses IA</h3>
              <p>Détectez le risque de décrochage et recevez des recommandations d'orientation.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
