import { Loader2 } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function ExamFormModal({
  editingExam,
  handleAddExam,
  loading,
  matieres,
  newExam,
  setEditingExam,
  setNewExam,
  setShowExamModal,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '500px' }}>
        <h3>{editingExam ? "Modifier l'examen" : 'Planifier un examen'}</h3>
        <form onSubmit={handleAddExam}>
          <div className="input-group">
            <label>Matière</label>
            <select
              required
              value={newExam.matiere_id}
              onChange={(e) => setNewExam({ ...newExam, matiere_id: e.target.value })}
            >
              <option value="">Sélectionner</option>
              {matieres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Type</label>
            <select
              required
              value={newExam.type_examen}
              onChange={(e) => setNewExam({ ...newExam, type_examen: e.target.value })}
            >
              <option value="DEVOIR">Devoir</option>
              <option value="COMPOSITION">Composition</option>
              <option value="EXAMEN">Examen</option>
            </select>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Date</label>
              <input
                type="date"
                required
                value={newExam.date_examen}
                onChange={(e) => setNewExam({ ...newExam, date_examen: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Heure (optionnel)</label>
              <input
                type="time"
                value={newExam.heure_examen}
                onChange={(e) => setNewExam({ ...newExam, heure_examen: e.target.value })}
              />
            </div>
          </div>
          <div className="input-group">
            <label>Salle (optionnel)</label>
            <input
              type="text"
              value={newExam.salle}
              onChange={(e) => setNewExam({ ...newExam, salle: e.target.value })}
              placeholder="ex: Salle 5"
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowExamModal(false);
                setEditingExam(null);
                setNewExam({ matiere_id: '', type_examen: 'DEVOIR', date_examen: '', heure_examen: '', salle: '' });
              }}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : editingExam ? 'Modifier' : 'Planifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
