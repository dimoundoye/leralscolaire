import React from 'react';
import {
  Brain, FileUp, FileDown, Plus, ArrowRightLeft, User, Edit, BookOpenCheck,
  Printer, MoveHorizontal, Trash2, Loader2, Venus, Mars
} from 'lucide-react';

const AdminElevesTab = ({
  classes,
  eleves,
  elevesAnneeFilter,
  selectedClasseFilter,
  setSelectedClasseFilter,
  eleveStatusFilter,
  setEleveStatusFilter,
  eleveSearch,
  setEleveSearch,
  chatFileInputRef,
  scanInputRef,
  fileInputRef,
  handleImportExcel,
  handleScanStudents,
  handleExportExcel,
  setEditingEleve,
  setShowEleveModal,
  eleveSubTab,
  setEleveSubTab,
  selectedEleveIds,
  setSelectedEleveIds,
  setTransferEleve,
  handleOpenGradesModal,
  handleAssignClass,
  loading,
  handleOpenBulletinPreview,
  handleOpenDossierPreview,
  handleDeleteEleve,
  rankingClasseId,
  setRankingClasseId,
  rankingPeriod,
  setRankingPeriod,
  handleDownloadRankingPDF,
  rankingLoading,
  rankingData
}) => {
  const yearClassIds = classes.filter(c => c.annee_scolaire === elevesAnneeFilter).map(c => c.id);
  const yearEleves = eleves.filter(e => !e.classe_id || yearClassIds.includes(e.classe_id));
  const filteredEleves = yearEleves
    .filter(e => {
      if (!selectedClasseFilter) return true;
      if (selectedClasseFilter === 'unassigned') return !e.classe_id;
      return e.classe_id === selectedClasseFilter;
    })
    .filter(e => {
      if (eleveStatusFilter === 'apte') return e.statut === 'APTE';
      if (eleveStatusFilter === 'inapte') return e.statut !== 'APTE';
      return true;
    })
    .filter(e => {
      if (!eleveSearch) return true;
      const term = eleveSearch.toLowerCase();
      return (
        (e.nom || '').toLowerCase().includes(term) ||
        (e.prenom || '').toLowerCase().includes(term) ||
        (e.identifiant_national || '').toLowerCase().includes(term)
      );
    });

  return (
    <div className="eleves-view">
      <div className="page-header flex-wrap gap-4">
        <div>
          <h1 className="page-title">Élèves</h1>
          <p className="page-subtitle">{yearEleves.length} élèves enregistrés ({elevesAnneeFilter})</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="search-bar-box">
            <input 
              type="text" 
              placeholder="Rechercher un élève..." 
              value={eleveSearch} 
              onChange={e => setEleveSearch(e.target.value)} 
              className="search-input"
            />
          </div>
          <input type="file" ref={chatFileInputRef} style={{display: 'none'}} onChange={handleImportExcel} accept=".xlsx,.xls" />
          <input type="file" ref={scanInputRef} style={{display: 'none'}} onChange={handleScanStudents} accept="image/*" />
          <button className="btn btn-outline" onClick={() => scanInputRef.current.click()} style={{ fontSize: '11px', padding: '6px 12px' }}><Brain size={14} /> Scan IA</button>
          <button className="btn btn-outline" onClick={() => fileInputRef.current.click()} style={{ fontSize: '11px', padding: '6px 12px' }}><FileUp size={14} /> Importer</button>
          <button className="btn btn-outline" onClick={handleExportExcel} style={{ fontSize: '11px', padding: '6px 12px' }}><FileDown size={14} /> Exporter</button>
          <button className="btn btn-primary" onClick={() => {setEditingEleve(null); setShowEleveModal(true);}} style={{ background: 'var(--primary-color)', fontSize: '11px', padding: '6px 14px' }}><Plus size={14} /> Inscrire</button>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="sub-tabs-bar mb-4" style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button 
          type="button"
          className={`sub-tab-btn ${eleveSubTab === 'liste' ? 'active' : ''}`}
          onClick={() => setEleveSubTab('liste')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem 1rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: eleveSubTab === 'liste' ? 'var(--primary-color)' : '#64748b',
            borderBottom: eleveSubTab === 'liste' ? '3px solid var(--primary-color)' : 'none',
            marginBottom: '-0.6rem',
            transition: 'all 0.15s ease'
          }}
        >
          Liste des Élèves
        </button>
        <button 
          type="button"
          className={`sub-tab-btn ${eleveSubTab === 'classement' ? 'active' : ''}`}
          onClick={() => setEleveSubTab('classement')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem 1rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: eleveSubTab === 'classement' ? 'var(--primary-color)' : '#64748b',
            borderBottom: eleveSubTab === 'classement' ? '3px solid var(--primary-color)' : 'none',
            marginBottom: '-0.6rem',
            transition: 'all 0.15s ease'
          }}
        >
          Palmarès & Classement
        </button>
      </div>

      {eleveSubTab === 'liste' ? (
        /* Table Block Container */
        <div className="table-block animate-fade-in">
          {/* Floating Bulk Action Bar */}
          {selectedEleveIds.length > 0 && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '10px 16px', margin: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <strong style={{ color: '#1e40af', fontSize: '13px' }}>{selectedEleveIds.length} élève(s) sélectionné(s)</strong>
                <button type="button" onClick={() => setSelectedEleveIds([])} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
                  Tout désélectionner
                </button>
              </div>
              <button className="btn btn-primary" onClick={() => setTransferEleve({ bulk: true })} style={{ background: '#2563eb', fontSize: '12px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowRightLeft size={14} /> Demander le transfert groupé ({selectedEleveIds.length})
              </button>
            </div>
          )}

          <div className="table-block-header">
            <div className="table-block-title">
              <h3>Liste des élèves</h3>
            </div>
            <div className="table-block-filters flex gap-3 items-center">
              <select value={selectedClasseFilter} onChange={e => setSelectedClasseFilter(e.target.value)} className="pill-select">
                <option value="">Toutes les classes</option>
                <option value="unassigned">⚠️ Non assignés / Transférés ({yearEleves.filter(e => !e.classe_id).length})</option>
                {classes.filter(c => c.annee_scolaire === elevesAnneeFilter).map(c => <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>)}
              </select>

              <div className="status-toggle-pill">
                <button className={`status-toggle-btn ${eleveStatusFilter === 'all' ? 'active' : ''}`} onClick={() => setEleveStatusFilter('all')}>
                  Tous ({yearEleves.length})
                </button>
                <button className={`status-toggle-btn ${eleveStatusFilter === 'apte' ? 'active' : ''}`} onClick={() => setEleveStatusFilter('apte')}>
                  Apte ({yearEleves.filter(e => e.statut === 'APTE').length})
                </button>
                <button className={`status-toggle-btn ${eleveStatusFilter === 'inapte' ? 'active' : ''}`} onClick={() => setEleveStatusFilter('inapte')}>
                  Inapte ({yearEleves.filter(e => e.statut !== 'APTE').length})
                </button>
              </div>
            </div>
          </div>

          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '38px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={filteredEleves.length > 0 && selectedEleveIds.length === filteredEleves.length} 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedEleveIds(filteredEleves.map(el => el.id));
                        else setSelectedEleveIds([]);
                      }}
                    />
                  </th>
                  <th>Photo</th>
                  <th>Identifiant</th>
                  <th>Civilité / Sexe</th>
                  <th>Nom & Prénom</th>
                  <th>Classe</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEleves.map(e => (
                  <tr key={e.id}>
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedEleveIds.includes(e.id)} 
                        onChange={() => {
                          if (selectedEleveIds.includes(e.id)) setSelectedEleveIds(selectedEleveIds.filter(id => id !== e.id));
                          else setSelectedEleveIds([...selectedEleveIds, e.id]);
                        }}
                      />
                    </td>
                    <td onClick={() => handleOpenGradesModal(e.id)} style={{ cursor: 'pointer' }} title="Cliquer pour voir les notes">
                      {e.photo_url ? (
                        <img src={`${e.photo_url}`} alt="Photo" className="student-photo-mini student-photo-hover" />
                      ) : (
                        <div className="user-avatar-small user-avatar-hover"><User size={14}/></div>
                      )}
                    </td>
                    <td><code className="text-orange" style={{fontSize: '11px'}}>{e.identifiant_national}</code></td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: e.sexe === 'F' ? '#fce7f3' : '#e0f2fe',
                        color: e.sexe === 'F' ? '#9d174d' : '#0369a1',
                        border: `1px solid ${e.sexe === 'F' ? '#fbcfe8' : '#7dd3fc'}`
                      }}>
                        {e.sexe === 'F' ? 'F' : 'M'}
                      </span>
                    </td>
                    <td className="font-bold student-name-clickable" onClick={() => handleOpenGradesModal(e.id)} title="Cliquer pour voir les notes" style={{ cursor: 'pointer' }}>
                      {e.nom} {e.prenom}
                    </td>
                    <td>
                      {e.classe_nom ? (
                        <span className="font-bold" style={{ fontSize: '13px', color: 'var(--slate-800)' }}>{e.classe_nom}</span>
                      ) : (
                        <select
                          onChange={(event) => handleAssignClass(e, event.target.value)}
                          defaultValue=""
                          disabled={loading}
                          style={{
                            background: '#fff7ed',
                            border: '1px solid #fdba74',
                            color: '#c2410c',
                            fontSize: '11px',
                            fontWeight: 700,
                            borderRadius: '8px',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                          title="Cliquer pour affecter cet élève à une classe"
                        >
                          <option value="" disabled>➕ Affecter une classe...</option>
                          {classes.filter(c => c.annee_scolaire === elevesAnneeFilter).map(c => (
                            <option key={c.id} value={c.id}>
                              {c.nom} ({c.niveau})
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`status-pill ${e.statut === 'APTE' ? 'status-pass' : 'status-fail'}`}>
                          {e.statut}
                        </span>
                        {e.statut_transfert_en_attente === 'EN_ATTENTE' && (
                          <span className="status-pill" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', fontSize: '10px' }}>
                            Transfert en attente
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        <button className="btn-action-text modifier" onClick={() => setEditingEleve(e)} title="Modifier">
                          <Edit size={12} /> <span>Modifier</span>
                        </button>
                        <button className="btn-action-text notes-btn" onClick={() => handleOpenGradesModal(e.id)} title="Visualiser les Notes" style={{ borderColor: 'rgba(99,102,241,0.2)', color: '#6366f1' }}>
                          <BookOpenCheck size={12} /> <span>Notes</span>
                        </button>
                        <button className="btn-action-text bulletin" onClick={() => handleOpenBulletinPreview(e)} title="Générer & Aperçu Bulletin">
                          <Printer size={12} /> <span>Bulletin</span>
                        </button>
                        <button className="btn-action-text transferer" onClick={() => setTransferEleve(e)} title="Transférer">
                          <MoveHorizontal size={12} /> <span>Transférer</span>
                        </button>
                        <button className="btn-action-text dossier" onClick={() => handleOpenDossierPreview(e)} title="Générer & Aperçu Dossier">
                          <FileDown size={12} /> <span>Dossier</span>
                        </button>
                        <button className="btn-action-text delete-btn" onClick={() => handleDeleteEleve(e.id)} title="Supprimer" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', padding: '6px 10px' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEleves.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-400">Aucun élève trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Ranking Block Container */
        <div className="table-block animate-fade-in">
          <div className="table-block-header flex-wrap gap-4">
            <div className="table-block-title">
              <h3>Classement Général & Palmarès</h3>
            </div>
            <div className="ranking-filters">
              <div className="ranking-filter-item">
                <span className="ranking-filter-label">Classe :</span>
                <select 
                  value={rankingClasseId} 
                  onChange={e => setRankingClasseId(e.target.value)} 
                  className="pill-select"
                  style={{ minWidth: '130px' }}
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.filter(c => c.annee_scolaire === elevesAnneeFilter).map(c => <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>)}
                </select>
              </div>

              <div className="ranking-filter-item">
                <span className="ranking-filter-label">Période :</span>
                <select 
                  value={rankingPeriod} 
                  onChange={e => setRankingPeriod(e.target.value)} 
                  className="pill-select"
                  style={{ minWidth: '130px' }}
                >
                  <option value="Semestre 1">Semestre 1</option>
                  <option value="Semestre 2">Semestre 2</option>
                </select>
              </div>

              <button 
                type="button"
                onClick={handleDownloadRankingPDF}
                className="btn btn-outline flex items-center gap-1.5"
                style={{ fontSize: '11px', padding: '6px 14px', background: '#fff', marginLeft: '8px' }}
                disabled={!rankingClasseId || rankingLoading}
              >
                <FileDown size={14} /> <span>Imprimer Classement (PDF)</span>
              </button>
            </div>
          </div>

          {rankingLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} style={{ color: 'var(--primary-color)' }} />
              <p className="mt-4 text-slate-500 font-semibold">Calcul des moyennes et classement de la classe...</p>
            </div>
          ) : rankingData.length > 0 ? (
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Rang</th>
                    <th style={{ width: '80px' }}>Photo</th>
                    <th>Identifiant</th>
                    <th>Nom & Prénom</th>
                    <th>Moyenne Générale</th>
                    <th>Décision du Jury</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 'bold' }}>
                        {e.rang ? (
                          <span style={{ 
                            color: e.rang === 1 ? '#b45309' : e.rang === 2 ? '#475569' : e.rang === 3 ? '#78350f' : 'inherit',
                            fontWeight: e.rang <= 3 ? '800' : 'bold',
                            fontSize: e.rang <= 3 ? '1.05rem' : 'inherit'
                          }}>
                            {e.rang}{e.rang === 1 ? 'er' : 'e'}
                          </span>
                        ) : '--'}
                      </td>
                      <td>
                        {e.photo_url ? (
                          <img src={`${e.photo_url}`} alt="Photo" className="student-photo-mini student-photo-hover" onClick={() => handleOpenGradesModal(e.id)} style={{ cursor: 'pointer' }} title="Cliquer pour voir les notes" />
                        ) : (
                          <div className="user-avatar-small user-avatar-hover" onClick={() => handleOpenGradesModal(e.id)} style={{ cursor: 'pointer' }} title="Cliquer pour voir les notes"><User size={14} /></div>
                        )}
                      </td>
                      <td><code className="text-orange" style={{fontSize: '11px'}}>{e.identifiant_national}</code></td>
                      <td className="font-bold student-name-clickable" onClick={() => handleOpenGradesModal(e.id)} title="Cliquer pour voir les notes" style={{ cursor: 'pointer' }}>
                        {e.nom.toUpperCase()} {e.prenom}
                      </td>
                      <td style={{ fontWeight: 'bold' }}>
                        {e.moyenne_generale !== null ? (
                          <span style={{ color: e.moyenne_generale >= 10 ? '#059669' : '#dc2626' }}>
                            {e.moyenne_generale.toFixed(2)}/20
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal italic">Pas de notes</span>
                        )}
                      </td>
                      <td>
                        {e.decision_detail ? (
                          <span className={`status-pill ${e.decision_detail.toLowerCase().includes('passage') ? 'status-pass' : 'status-fail'}`}>
                            {e.decision_detail}
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-grades-view" style={{ margin: '2rem' }}>
              <p>Sélectionnez une classe ci-dessus pour afficher le palmarès et classement général des élèves.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminElevesTab;
