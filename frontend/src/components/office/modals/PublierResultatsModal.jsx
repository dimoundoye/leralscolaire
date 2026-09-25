import { X, AlertCircle, Send } from 'lucide-react';

// Fenêtre modale extraite de OfficeBacDashboard.jsx
export default function PublierResultatsModal({ handlePublier, publierForm, setPublierForm, setShowPublierModal }) {
  return (
    <div className="ob-modal-overlay" onClick={() => setShowPublierModal(false)}>
      <div className="ob-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ob-modal-header">
          <h3> Publier les résultats officiels</h3>
          <button onClick={() => setShowPublierModal(false)}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handlePublier} className="ob-modal-body">
          <div className="ob-publi-warning">
            <AlertCircle size={18} />
            <p>
              Une fois publiés, les résultats seront certifiés et consultables immédiatement sur le portail candidat des
              élèves avec notifications.
            </p>
          </div>

          <div className="ob-form-row">
            <div className="ob-form-group">
              <label>Type d'examen *</label>
              <select
                value={publierForm.type_examen}
                onChange={(e) => setPublierForm((f) => ({ ...f, type_examen: e.target.value }))}
              >
                <option value="BAC">BAC</option>
                <option value="BFEM">BFEM</option>
              </select>
            </div>
            <div className="ob-form-group">
              <label>Année de session *</label>
              <input
                type="number"
                value={publierForm.annee}
                onChange={(e) => setPublierForm((f) => ({ ...f, annee: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="ob-form-group">
            <label>Série (laisser vide = toutes les séries)</label>
            <select
              value={publierForm.serie}
              onChange={(e) => setPublierForm((f) => ({ ...f, serie: e.target.value }))}
            >
              <option value="">Toutes les séries</option>
              {['S1', 'S2', 'S3', 'L1', 'L2', 'G', 'STEG', 'T'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="ob-modal-footer">
            <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setShowPublierModal(false)}>
              Annuler
            </button>
            <button type="submit" className="ob-btn ob-btn-publish">
              <Send size={16} /> Confirmer la publication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
