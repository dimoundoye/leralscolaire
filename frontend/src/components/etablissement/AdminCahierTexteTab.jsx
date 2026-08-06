import React from 'react';
import { BookMarked, RefreshCw, Clock, ShieldCheck, Paperclip, Download } from 'lucide-react';

const AdminCahierTexteTab = ({
  cahierFilterClasse,
  setCahierFilterClasse,
  cahierAnneeFilter,
  classes,
  cahierFilterProf,
  setCahierFilterProf,
  profs,
  fetchCahierAdmin,
  cahierLoading,
  cahierEntries,
  handleToggleVisa
}) => {
  return (
    <div className="tab-pane">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookMarked size={24} style={{ color: 'var(--accent-color)' }} /> Inspection & Visa des Cahiers de Texte
          </h1>
          <p className="page-subtitle">
            Contrôlez la saisie du déroulement des cours par classe et apposez le visa administratif d'inspection.
          </p>
        </div>
      </div>

      {/* FILTRES & BARRE D'ACTION */}
      <div className="card-box mb-6" style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* SÉLECTEUR DE CLASSE */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-600)', marginBottom: '4px', display: 'block' }}>Classe</label>
            <select 
              value={cahierFilterClasse} 
              onChange={e => setCahierFilterClasse(e.target.value)}
              className="pill-select"
              style={{ fontSize: '12px', height: '34px', minWidth: '150px' }}
            >
              <option value="">Toutes les classes ({cahierAnneeFilter})</option>
              {classes.filter(c => c.annee_scolaire === cahierAnneeFilter).map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          {/* SÉLECTEUR D'ENSEIGNANT */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-600)', marginBottom: '4px', display: 'block' }}>Enseignant</label>
            <select 
              value={cahierFilterProf} 
              onChange={e => setCahierFilterProf(e.target.value)}
              className="pill-select"
              style={{ fontSize: '12px', height: '34px', minWidth: '160px' }}
            >
              <option value="">Tous les professeurs</option>
              {profs.map(p => (
                <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="button" onClick={fetchCahierAdmin} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          <RefreshCw size={14} className={cahierLoading ? 'spinning' : ''} /> Actualiser
        </button>
      </div>

      {/* LISTE DES FICHES */}
      <div className="card-box" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div className="cahier-admin-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cahierLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-400)' }}>Chargement des fiches...</div>
          ) : (() => {
            const displayedEntries = cahierEntries.filter(e => !cahierAnneeFilter || e.annee_scolaire === cahierAnneeFilter);
            return displayedEntries.length > 0 ? (
              displayedEntries.map(entry => (
                <div key={entry.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'var(--primary-color)', color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 9px', borderRadius: '6px' }}>
                        {entry.classe_nom} ({entry.annee_scolaire})
                      </span>
                      <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '6px' }}>
                        {entry.matiere_nom}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--slate-500)', fontWeight: 600 }}>
                        Prof. {entry.professeur_nom}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {new Date(entry.date_seance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {entry.heure_debut && ` (${entry.heure_debut} - ${entry.heure_fin})`}
                      </span>
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleToggleVisa(entry.id)}
                      className={entry.visa_admin ? "btn btn-success" : "btn btn-outline"}
                      style={{ 
                        padding: '5px 14px', fontSize: '11px', fontWeight: 800, borderRadius: '20px',
                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                        background: entry.visa_admin ? '#10b981' : '#ffffff',
                        color: entry.visa_admin ? '#ffffff' : '#047857',
                        border: '1px solid #059669'
                      }}
                    >
                      <ShieldCheck size={14} /> {entry.visa_admin ? "Visé par l'Admin (Cliquer pour annuler)" : "Viser le Cahier de Texte"}
                    </button>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: 'var(--slate-900)' }}>
                    {entry.titre_lecon}
                  </h4>

                  <p style={{ fontSize: '13px', color: 'var(--slate-700)', margin: '0 0 10px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {entry.contenu_seance}
                  </p>

                  {entry.travail_a_faire && (
                    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-color)' }}>
                        Devoir à la maison (pour le {entry.date_remise_devoir ? new Date(entry.date_remise_devoir).toLocaleDateString('fr-FR') : 'N/A'}) :
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--slate-700)', margin: '2px 0 0', whiteSpace: 'pre-line' }}>
                        {entry.travail_a_faire}
                      </p>
                    </div>
                  )}

                  {entry.fichier_url && (
                    <a 
                      href={`http://localhost:5002${entry.fichier_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ marginTop: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary-color)', background: '#eff6ff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', fontWeight: 600 }}
                    >
                      <Paperclip size={13} /> {entry.fichier_nom || 'Support de cours joint'} <Download size={12} />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-400)' }}>
                <BookMarked size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <p>Aucun registre de cours trouvé pour les filtres sélectionnés.</p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default AdminCahierTexteTab;
