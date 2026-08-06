import React from 'react';
import {
  BookMarked, Paperclip, X, CheckCircle2, RefreshCw, Clock, ShieldCheck, Trash2, Download
} from 'lucide-react';

const TeacherCahierTexteTab = ({
  classes,
  profAnneeFilter,
  handleCreateCahierEntry,
  cahierClasse,
  setCahierClasse,
  cahierMatiere,
  setCahierMatiere,
  cahierDateSeance,
  setCahierDateSeance,
  cahierHeureDebut,
  setCahierHeureDebut,
  cahierHeureFin,
  setCahierHeureFin,
  cahierTitre,
  setCahierTitre,
  cahierContenu,
  setCahierContenu,
  cahierTravail,
  setCahierTravail,
  cahierDateRemise,
  setCahierDateRemise,
  cahierFile,
  setCahierFile,
  handleCahierFileUpload,
  cahierUploading,
  cahierFilterClasse,
  setCahierFilterClasse,
  fetchCahierEntries,
  cahierLoading,
  cahierEntries
}) => {
  const activeTeacherClasses = (classes || []).filter(c => !profAnneeFilter || !c.annee_scolaire || c.annee_scolaire === profAnneeFilter);
  const availableMatieres = (classes || []).filter(c => !cahierClasse || c.classe_id === cahierClasse);

  return (
    <div className="tab-pane">
      <div className="card-box mb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-blue)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookMarked size={22} style={{ color: 'var(--accent-red)' }} /> Cahier de Texte Numérique
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-500)', margin: '4px 0 0' }}>
              Enregistrez le déroulé de vos séances de cours, les devoirs à maison et téléchargez vos supports pédagogiques.
            </p>
          </div>
          <span style={{ fontSize: '11px', background: '#eff6ff', color: 'var(--primary-blue)', padding: '4px 12px', borderRadius: '20px', fontWeight: 700 }}>
            Session : {profAnneeFilter}
          </span>
        </div>

        {/* FORMULAIRE DE SAISIE D'UNE SÉANCE */}
        <form onSubmit={handleCreateCahierEntry} className="cahier-form-grid" style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          
          <div className="form-group">
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-700)' }}>Classe *</label>
            <select 
              value={cahierClasse} 
              onChange={e => {
                setCahierClasse(e.target.value);
                const firstMat = classes.find(c => c.classe_id === e.target.value);
                if (firstMat) setCahierMatiere(firstMat.matiere_id);
              }}
              className="pill-select w-full"
              required
            >
              <option value="">-- Choisir une classe --</option>
              {activeTeacherClasses.map(c => (
                <option key={`${c.classe_id}-${c.matiere_id}`} value={c.classe_id}>
                  {c.classe_nom} ({c.annee_scolaire}) - {c.etablissement_nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-700)' }}>Matière / Discipline *</label>
            <select 
              value={cahierMatiere} 
              onChange={e => setCahierMatiere(e.target.value)}
              className="pill-select w-full"
              required
            >
              <option value="">-- Choisir la matière --</option>
              {availableMatieres.map(c => (
                <option key={c.matiere_id} value={c.matiere_id}>
                  {c.matiere_nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-700)' }}>Date de la séance *</label>
            <input 
              type="date" 
              value={cahierDateSeance} 
              onChange={e => setCahierDateSeance(e.target.value)}
              className="pill-input w-full"
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-700)' }}>Début</label>
              <input 
                type="time" 
                value={cahierHeureDebut} 
                onChange={e => setCahierHeureDebut(e.target.value)}
                className="pill-input w-full"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-700)' }}>Fin</label>
              <input 
                type="time" 
                value={cahierHeureFin} 
                onChange={e => setCahierHeureFin(e.target.value)}
                className="pill-input w-full"
              />
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-700)' }}>Titre de la leçon / Chapitre *</label>
            <input 
              type="text" 
              placeholder="Ex: Chapitre 3 - Les équations du premier degré" 
              value={cahierTitre} 
              onChange={e => setCahierTitre(e.target.value)}
              className="pill-input w-full"
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-700)' }}>Déroulé & Contenu du cours *</label>
            <textarea 
              rows="3" 
              placeholder="Résumé des notions abordées en classe, exercices effectués au tableau..." 
              value={cahierContenu} 
              onChange={e => setCahierContenu(e.target.value)}
              className="pill-textarea w-full"
              required
            ></textarea>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-700)' }}>Travail à faire (Devoirs à la maison)</label>
            <textarea 
              rows="2" 
              placeholder="Exercices à résoudre, lecture à faire pour le prochain cours..." 
              value={cahierTravail} 
              onChange={e => setCahierTravail(e.target.value)}
              className="pill-textarea w-full"
            ></textarea>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-slate-700)' }}>Date de remise du devoir</label>
            <input 
              type="date" 
              value={cahierDateRemise} 
              onChange={e => setCahierDateRemise(e.target.value)}
              className="pill-input w-full"
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label className="secondary-btn" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Paperclip size={14} /> {cahierFile ? cahierFile.fichier_nom : 'Joindre un support PDF/Image'}
                <input type="file" onChange={handleCahierFileUpload} style={{ display: 'none' }} disabled={cahierUploading} />
              </label>
              {cahierFile && (
                <button type="button" onClick={() => setCahierFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>
                  <X size={14} /> Supprimer le fichier
                </button>
              )}
            </div>

            <button type="submit" className="primary-btn" style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> Enregistrer la Séance
            </button>
          </div>

        </form>
      </div>

      {/* HISTORIQUE DES SÉANCES */}
      <div className="card-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Historique du Cahier de Texte</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select 
              value={cahierFilterClasse} 
              onChange={e => setCahierFilterClasse(e.target.value)}
              className="pill-select"
              style={{ fontSize: '12px', height: '32px' }}
            >
              <option value="">Toutes les classes</option>
              {activeTeacherClasses.map(c => (
                <option key={`filter-${c.classe_id}`} value={c.classe_id}>{c.classe_nom}</option>
              ))}
            </select>
            <button type="button" onClick={fetchCahierEntries} className="icon-action-btn" title="Rafraîchir">
              <RefreshCw size={14} className={cahierLoading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        <div className="cahier-entries-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {cahierLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-slate-400)' }}>Chargement...</div>
          ) : cahierEntries.length > 0 ? (
            cahierEntries.map(entry => (
              <div key={entry.id} className="cahier-entry-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--primary-blue)', color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 9px', borderRadius: '6px' }}>
                      {entry.classe_nom}
                    </span>
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '6px' }}>
                      {entry.matiere_nom}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(entry.date_seance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {entry.heure_debut && ` (${entry.heure_debut} - ${entry.heure_fin})`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {entry.visa_admin ? (
                      <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} /> Visé par l'Administration
                      </span>
                    ) : (
                      <span style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                        En attente de visa
                      </span>
                    )}

                    <button 
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Supprimer cette séance du cahier de texte ?')) {
                          const token = localStorage.getItem('token');
                          await fetch(`http://localhost:5002/api/cahier-texte/${entry.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                          fetchCahierEntries();
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: 'var(--text-slate-900)' }}>
                  {entry.titre_lecon}
                </h4>

                <p style={{ fontSize: '13px', color: 'var(--text-slate-700)', margin: '0 0 12px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {entry.contenu_seance}
                </p>

                {entry.travail_a_faire && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CheckCircle2 size={13} /> Travail à faire / Devoir
                      </span>
                      {entry.date_remise_devoir && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#166534' }}>
                          Pour le : {new Date(entry.date_remise_devoir).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: '#14532d', margin: 0, whiteSpace: 'pre-line' }}>
                      {entry.travail_a_faire}
                    </p>
                  </div>
                )}

                {entry.fichier_url && (
                  <a 
                    href={`http://localhost:5002${entry.fichier_url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="msg-file-attachment file-other"
                    style={{ marginTop: '4px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary-blue)', background: '#eff6ff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}
                  >
                    <Paperclip size={13} />
                    <span>{entry.fichier_nom || 'Support de cours joint'}</span>
                    <Download size={12} />
                  </a>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-slate-400)', fontSize: '13px' }}>
              <BookMarked size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p>Aucune séance enregistrée dans le cahier de texte pour cette sélection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherCahierTexteTab;
