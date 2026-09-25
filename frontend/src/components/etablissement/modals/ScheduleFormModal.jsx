import { Loader2 } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function ScheduleFormModal({
  handleAddSchedule,
  loading,
  matieres,
  newSchedule,
  profs,
  scheduleMatieres,
  setNewSchedule,
  setShowScheduleModal,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '500px' }}>
        <h3>Ajouter un créneau</h3>
        <form onSubmit={handleAddSchedule}>
          <div className="input-group">
            <label>Matière</label>
            <select
              required
              value={newSchedule.matiere_id}
              onChange={(e) => setNewSchedule({ ...newSchedule, matiere_id: e.target.value })}
            >
              <option value="">Sélectionner</option>
              {/* Matières de la classe choisie ; toutes les matières si aucune n'est encore affectée */}
              {(scheduleMatieres.length > 0 ? scheduleMatieres : matieres).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Professeur</label>
            <select
              required
              value={newSchedule.professeur_id}
              onChange={(e) => setNewSchedule({ ...newSchedule, professeur_id: e.target.value })}
            >
              <option value="">Sélectionner</option>
              {profs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.email}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Jour</label>
            <select
              required
              value={newSchedule.jour_semaine}
              onChange={(e) => setNewSchedule({ ...newSchedule, jour_semaine: e.target.value })}
            >
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Début</label>
              <input
                type="time"
                required
                value={newSchedule.heure_debut}
                onChange={(e) => setNewSchedule({ ...newSchedule, heure_debut: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Fin</label>
              <input
                type="time"
                required
                value={newSchedule.heure_fin}
                onChange={(e) => setNewSchedule({ ...newSchedule, heure_fin: e.target.value })}
              />
            </div>
          </div>
          <div className="input-group">
            <label>Salle (optionnel)</label>
            <input
              type="text"
              value={newSchedule.salle}
              onChange={(e) => setNewSchedule({ ...newSchedule, salle: e.target.value })}
              placeholder="ex: Salle 12"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowScheduleModal(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
