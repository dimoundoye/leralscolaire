import React from 'react';
import {
  BookMarked, Calendar, BookOpen, ClipboardList, Clock, User, Paperclip, Download,
  CheckCircle, ShieldCheck
} from 'lucide-react';

const StudentCahierTexteTab = ({
  cahierEntries,
  cahierSubTab,
  setCahierSubTab,
  cahierLoading,
  API_BASE_URL
}) => {
  const devoirsAfaire = cahierEntries.filter(e => e.travail_a_faire && e.travail_a_faire.trim() !== '');

  return (
    <div className="tab-pane">
      <div className="schedule-hero-banner card-box" style={{ marginBottom: '20px' }}>
        <div className="sched-hero-left">
          <div className="sched-title-row">
            <h2><BookMarked size={22} style={{ color: 'var(--accent-red)' }} /> Cahier de Texte Numérique</h2>
            <span className="sched-badge-tag"><Calendar size={14} /> Suivi des cours et devoirs</span>
          </div>
          <p className="sched-hero-sub">
            Retrouvez l'ensemble des cours dispensés par vos enseignants ainsi que les devoirs et exercices à rendre.
          </p>
        </div>
      </div>

      {/* SUB-TABS SWITCHER */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          type="button" 
          onClick={() => setCahierSubTab('cours')} 
          className={`secondary-btn ${cahierSubTab === 'cours' ? 'active' : ''}`}
          style={{ 
            padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
            background: cahierSubTab === 'cours' ? 'var(--primary-blue)' : '#f1f5f9',
            color: cahierSubTab === 'cours' ? '#ffffff' : 'var(--text-slate-700)',
            border: 'none', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <BookOpen size={16} /> Journal des Cours ({cahierEntries.length})
        </button>
        <button 
          type="button" 
          onClick={() => setCahierSubTab('devoirs')} 
          className={`secondary-btn ${cahierSubTab === 'devoirs' ? 'active' : ''}`}
          style={{ 
            padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
            background: cahierSubTab === 'devoirs' ? 'var(--primary-blue)' : '#f1f5f9',
            color: cahierSubTab === 'devoirs' ? '#ffffff' : 'var(--text-slate-700)',
            border: 'none', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <ClipboardList size={16} /> Devoirs & Travaux à faire ({devoirsAfaire.length})
        </button>
      </div>

      {/* CONTENT */}
      <div className="card-box">
        {cahierLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>Chargement du cahier de texte...</div>
        ) : cahierSubTab === 'devoirs' ? (
          <div className="devoirs-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {devoirsAfaire.length > 0 ? (
              devoirsAfaire.map(entry => (
                <div key={entry.id} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: '#166534', color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '6px' }}>
                      {entry.matiere_nom}
                    </span>
                    {entry.date_remise_devoir && (
                      <span style={{ background: '#dcfce7', color: '#14532d', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> À rendre pour le : {new Date(entry.date_remise_devoir).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: '#14532d' }}>
                    {entry.titre_lecon}
                  </h4>

                  <p style={{ fontSize: '13px', color: '#166534', margin: '0 0 10px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {entry.travail_a_faire}
                  </p>

                  <div style={{ fontSize: '11px', color: 'var(--text-slate-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={12} /> Enseignant : {entry.professeur_nom}
                  </div>

                  {entry.fichier_url && (
                    <a 
                      href={`${API_BASE_URL.replace('/api', '')}${entry.fichier_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ marginTop: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary-blue)', background: '#ffffff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', fontWeight: 600 }}
                    >
                      <Paperclip size={13} /> {entry.fichier_nom || 'Télécharger le support de cours'} <Download size={12} />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-slate-400)' }}>
                <CheckCircle size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <p>Aucun devoir à faire pour le moment. Vous êtes à jour !</p>
              </div>
            )}
          </div>
        ) : (
          <div className="cours-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cahierEntries.length > 0 ? (
              cahierEntries.map(entry => (
                <div key={entry.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'var(--primary-blue)', color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 9px', borderRadius: '6px' }}>
                        {entry.matiere_nom}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {new Date(entry.date_seance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {entry.heure_debut && ` (${entry.heure_debut} - ${entry.heure_fin})`}
                      </span>
                    </div>

                    {entry.visa_admin && (
                      <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} /> Visé par l'Admin
                      </span>
                    )}
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: 'var(--text-slate-900)' }}>
                    {entry.titre_lecon}
                  </h4>

                  <p style={{ fontSize: '13px', color: 'var(--text-slate-700)', margin: '0 0 10px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {entry.contenu_seance}
                  </p>

                  <div style={{ fontSize: '11px', color: 'var(--text-slate-500)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: entry.travail_a_faire ? '10px' : '0' }}>
                    <User size={12} /> Professeur : {entry.professeur_nom}
                  </div>

                  {entry.travail_a_faire && (
                    <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px 12px', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-blue)' }}>
                        Devoir associé :
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--text-slate-700)', margin: '2px 0 0', whiteSpace: 'pre-line' }}>
                        {entry.travail_a_faire}
                      </p>
                    </div>
                  )}

                  {entry.fichier_url && (
                    <a 
                      href={`${API_BASE_URL.replace('/api', '')}${entry.fichier_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ marginTop: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary-blue)', background: '#eff6ff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', fontWeight: 600 }}
                    >
                      <Paperclip size={13} /> {entry.fichier_nom || 'Support de cours joint'} <Download size={12} />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-10 color-slate-400">
                <BookOpen size={36} className="opacity-30 mb-2" />
                <p>Aucune séance enregistrée dans le cahier de texte de votre classe pour l'instant.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCahierTexteTab;
