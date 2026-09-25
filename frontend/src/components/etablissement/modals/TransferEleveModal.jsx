import { AlertTriangle, SearchIcon } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function TransferEleveModal({
  handleTransferEleve,
  loading,
  selectedEleveIds,
  selectedTargetEtab,
  setSelectedTargetEtab,
  setTransferEleve,
  setTransferMotif,
  setTransferResults,
  setTransferSearch,
  transferEleve,
  transferMotif,
  transferResults,
  transferSearch,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '520px', width: '90%' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--slate-900)' }}>
          {selectedEleveIds.length > 0
            ? `Transférer un lot d'élèves (${selectedEleveIds.length})`
            : "Transférer l'élève"}
        </h3>
        <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '13px', fontWeight: 600 }}>
          {selectedEleveIds.length > 0
            ? `${selectedEleveIds.length} élèves sélectionnés dans la liste`
            : `${transferEleve.prenom} ${transferEleve.nom} (${transferEleve.identifiant_national})`}
        </p>

        {/* Informative notice on transfer of editing rights */}
        <div
          style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            padding: '10px 14px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#c2410c',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <AlertTriangle size={18} style={{ color: '#ea580c', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Droits d'édition :</strong> La demande de transfert sera transmise au statut{' '}
            <strong>EN ATTENTE</strong>. Votre établissement conservera tous les droits d'édition jusqu'à l'acceptation
            finale par l'établissement d'accueil.
          </div>
        </div>

        <form onSubmit={handleTransferEleve}>
          <div className="input-group" style={{ position: 'relative' }}>
            <label
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--slate-700)',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              Chercher l'établissement destinataire
            </label>
            <div className="search-input-wrapper">
              <SearchIcon size={18} className="search-icon-abs" />
              <input
                type="text"
                value={transferSearch}
                onChange={(e) => {
                  setTransferSearch(e.target.value);
                  if (selectedTargetEtab) setSelectedTargetEtab(null);
                }}
                placeholder="Rechercher par nom ou code d'établissement..."
                style={{ width: '100%', borderRadius: '10px', height: '42px', fontSize: '13px' }}
              />
            </div>

            {/* Real-time search results dropdown */}
            {transferSearch.trim().length > 0 && !selectedTargetEtab && (
              <div
                className="search-results-dropdown"
                style={{
                  maxH: '200px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px',
                  marginTop: '4px',
                }}
              >
                {transferResults.length > 0 ? (
                  transferResults.map((etab) => (
                    <div
                      key={etab.id}
                      className="search-result-item"
                      onClick={() => {
                        setSelectedTargetEtab(etab);
                        setTransferSearch(etab.nom);
                        setTransferResults([]);
                      }}
                      style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--slate-800)' }}>{etab.nom}</strong>
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          {etab.code_etablissement || etab.id.substring(0, 8)}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--slate-500)' }}>
                        {etab.ville}, {etab.region}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', fontSize: '12px', color: 'var(--slate-400)', textAlign: 'center' }}>
                    Aucun établissement trouvé pour "{transferSearch}".
                  </div>
                )}
              </div>
            )}

            {/* Selected establishment badge */}
            {selectedTargetEtab && (
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #6ee7b7',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      color: '#047857',
                      fontWeight: 800,
                      display: 'block',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Établissement destinataire sélectionné :
                  </span>
                  <strong style={{ fontSize: '14px', color: '#064e3b' }}>{selectedTargetEtab.nom}</strong>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#047857',
                      marginTop: '2px',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ background: '#d1fae5', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      Code: {selectedTargetEtab.code_etablissement || selectedTargetEtab.id}
                    </span>
                    <span>
                      {selectedTargetEtab.ville}, {selectedTargetEtab.region}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTargetEtab(null);
                    setTransferSearch('');
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #a7f3d0',
                    borderRadius: '6px',
                    color: '#047857',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                  }}
                >
                  Modifier
                </button>
              </div>
            )}
          </div>

          <div className="input-group mt-4">
            <label
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--slate-700)',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              Motif du transfert
            </label>
            <textarea
              required
              rows="3"
              value={transferMotif}
              onChange={(e) => setTransferMotif(e.target.value)}
              placeholder="Ex: Déménagement de la famille, demande des parents..."
              style={{
                width: '100%',
                borderRadius: '10px',
                padding: '0.8rem',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
              }}
            ></textarea>
          </div>

          <div
            className="modal-actions"
            style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setTransferEleve(null);
                setTransferSearch('');
                setTransferResults([]);
                setSelectedTargetEtab(null);
                setTransferMotif('');
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !selectedTargetEtab}
              style={{ background: 'var(--primary-color)' }}
            >
              Confirmer le Transfert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
