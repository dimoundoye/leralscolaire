import { BookMarked, Paperclip, X, CheckCircle2, RefreshCw, Clock, ShieldCheck, Trash2, Download } from 'lucide-react';

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
  cahierEntries,
}) => {
  const activeTeacherClasses = (classes || []).filter(
    (c) => !profAnneeFilter || !c.annee_scolaire || c.annee_scolaire === profAnneeFilter
  );
  const availableMatieres = (classes || []).filter((c) => !cahierClasse || c.classe_id === cahierClasse);

  return (
    <div className="tab-pane">
      <div className="card-box mb-6">
        <div className="cahier-header-row">
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--primary-blue)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <BookMarked size={22} style={{ color: 'var(--accent-red)', flexShrink: 0 }} /> Cahier de Texte Numérique
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-500)', margin: '4px 0 0' }}>
              Enregistrez le déroulé de vos séances de cours, les devoirs à maison et téléchargez vos supports
              pédagogiques.
            </p>
          </div>
          <span
            style={{
              fontSize: '11px',
              background: '#eff6ff',
              color: 'var(--primary-blue)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              alignSelf: 'flex-start',
            }}
          >
            Session : {profAnneeFilter}
          </span>
        </div>

        {/* FORMULAIRE DE SAISIE D'UNE SÉANCE */}
        <form onSubmit={handleCreateCahierEntry} className="cahier-form-grid">
          <div className="form-group">
            <label>Classe *</label>
            <select
              value={cahierClasse}
              onChange={(e) => {
                setCahierClasse(e.target.value);
                const firstMat = classes.find((c) => c.classe_id === e.target.value);
                if (firstMat) setCahierMatiere(firstMat.matiere_id);
              }}
              className="pill-select"
              required
            >
              <option value="">-- Choisir une classe --</option>
              {activeTeacherClasses.map((c) => (
                <option key={`${c.classe_id}-${c.matiere_id}`} value={c.classe_id}>
                  {c.classe_nom} ({c.annee_scolaire}) - {c.etablissement_nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Matière / Discipline *</label>
            <select
              value={cahierMatiere}
              onChange={(e) => setCahierMatiere(e.target.value)}
              className="pill-select"
              required
            >
              <option value="">-- Choisir la matière --</option>
              {availableMatieres.map((c) => (
                <option key={c.matiere_id} value={c.matiere_id}>
                  {c.matiere_nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date de la séance *</label>
            <input
              type="date"
              value={cahierDateSeance}
              onChange={(e) => setCahierDateSeance(e.target.value)}
              className="pill-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Horaires</label>
            <div className="cahier-time-row">
              <div>
                <input
                  type="time"
                  value={cahierHeureDebut}
                  onChange={(e) => setCahierHeureDebut(e.target.value)}
                  className="pill-input"
                  title="Heure de début"
                />
              </div>
              <div>
                <input
                  type="time"
                  value={cahierHeureFin}
                  onChange={(e) => setCahierHeureFin(e.target.value)}
                  className="pill-input"
                  title="Heure de fin"
                />
              </div>
            </div>
          </div>

          <div className="form-group cahier-col-full">
            <label>Titre de la leçon / Chapitre *</label>
            <input
              type="text"
              placeholder="Ex: Chapitre 3 - Les équations du premier degré"
              value={cahierTitre}
              onChange={(e) => setCahierTitre(e.target.value)}
              className="pill-input"
              required
            />
          </div>

          <div className="form-group cahier-col-full">
            <label>Déroulé & Contenu du cours *</label>
            <textarea
              rows="3"
              placeholder="Résumé des notions abordées en classe, exercices effectués au tableau..."
              value={cahierContenu}
              onChange={(e) => setCahierContenu(e.target.value)}
              className="pill-textarea"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Travail à faire (Devoirs à la maison)</label>
            <textarea
              rows="2"
              placeholder="Exercices à résoudre, lecture à faire pour le prochain cours..."
              value={cahierTravail}
              onChange={(e) => setCahierTravail(e.target.value)}
              className="pill-textarea"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Date de remise du devoir</label>
            <input
              type="date"
              value={cahierDateRemise}
              onChange={(e) => setCahierDateRemise(e.target.value)}
              className="pill-input"
            />
          </div>

          <div className="form-group cahier-actions-row">
            <div className="cahier-file-box">
              <label
                className="secondary-btn"
                style={{
                  cursor: 'pointer',
                  padding: '8px 14px',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Paperclip size={14} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {cahierFile ? cahierFile.fichier_nom : 'Joindre un support PDF/Image'}
                </span>
                <input
                  type="file"
                  onChange={handleCahierFileUpload}
                  style={{ display: 'none' }}
                  disabled={cahierUploading}
                />
              </label>
              {cahierFile && (
                <button
                  type="button"
                  onClick={() => setCahierFile(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '12px',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} /> Supprimer
                </button>
              )}
            </div>

            <button
              type="submit"
              className="primary-btn cahier-submit-btn"
              style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <CheckCircle2 size={16} /> Enregistrer la Séance
            </button>
          </div>
        </form>
      </div>

      {/* HISTORIQUE DES SÉANCES */}
      <div className="card-box">
        <div className="cahier-history-header">
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Historique du Cahier de Texte</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={cahierFilterClasse}
              onChange={(e) => setCahierFilterClasse(e.target.value)}
              className="pill-select"
              style={{ fontSize: '12px', height: '34px' }}
            >
              <option value="">Toutes les classes</option>
              {activeTeacherClasses.map((c) => (
                <option key={`filter-${c.classe_id}`} value={c.classe_id}>
                  {c.classe_nom}
                </option>
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
            cahierEntries.map((entry) => (
              <div key={entry.id} className="cahier-entry-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: 'var(--primary-blue)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: '6px',
                      }}
                    >
                      {entry.classe_nom}
                    </span>
                    <span
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '6px',
                      }}
                    >
                      {entry.matiere_nom}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-slate-500)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Clock size={12} />{' '}
                      {new Date(entry.date_seance).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {entry.heure_debut && ` (${entry.heure_debut} - ${entry.heure_fin})`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {entry.visa_admin ? (
                      <span
                        style={{
                          background: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <ShieldCheck size={12} /> Visé par l'Administration
                      </span>
                    ) : (
                      <span
                        style={{
                          background: '#fffbeb',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        En attente de visa
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Supprimer cette séance du cahier de texte ?')) {
                          await fetch(`/api/cahier-texte/${entry.id}`, { method: 'DELETE', headers: {} });
                          fetchCahierEntries();
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '4px',
                        flexShrink: 0,
                      }}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: 'var(--text-slate-900)' }}>
                  {entry.titre_lecon}
                </h4>

                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-slate-700)',
                    margin: '0 0 12px',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {entry.contenu_seance}
                </p>

                {entry.travail_a_faire && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginBottom: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#15803d',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <CheckCircle2 size={13} /> Travail à faire / Devoir
                      </span>
                      {entry.date_remise_devoir && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#166534' }}>
                          Pour le :{' '}
                          {new Date(entry.date_remise_devoir).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
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
                    href={`${entry.fichier_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="msg-file-attachment file-other"
                    style={{
                      marginTop: '4px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: 'var(--primary-blue)',
                      background: '#eff6ff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe',
                      maxWidth: '100%',
                      wordBreak: 'break-all',
                    }}
                  >
                    <Paperclip size={13} style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 'calc(100% - 30px)',
                      }}
                    >
                      {entry.fichier_nom || 'Support de cours joint'}
                    </span>
                    <Download size={12} style={{ flexShrink: 0 }} />
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
