import { Trash2 } from 'lucide-react';

// Fenêtre modale extraite de Dashboard.jsx
export default function ExamDetailsModal({ selectedExam, setSelectedExam }) {
  return (
    <div className="modal-overlay" onClick={() => setSelectedExam(null)}>
      <div className="modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Détails des épreuves</h3>
          <button className="btn-icon-small" onClick={() => setSelectedExam(null)}>
            <Trash2 size={16} />
          </button>
        </div>
        <div className="exam-detail-body">
          <div className="exam-detail-meta">
            <span>
              <strong>Classe :</strong> {selectedExam.classe}{' '}
            </span>
            <span>
              <strong>Date :</strong> {selectedExam.date}
            </span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Matière</th>
                <th>Type</th>
                <th>Horaire</th>
                <th>Salle</th>
              </tr>
            </thead>
            <tbody>
              {selectedExam.exams.map((ex) => {
                const hasTime = ex.date_examen && ex.date_examen.includes('T');
                const timeStr = hasTime
                  ? new Date(ex.date_examen).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  : '--';
                return (
                  <tr key={ex.id}>
                    <td className="font-bold">{ex.matiere_nom}</td>
                    <td>
                      <span
                        className={`status-pill ${ex.type_examen === 'EXAMEN' ? 'status-fail' : ex.type_examen === 'COMPOSITION' ? 'status-warning' : 'status-pass'}`}
                      >
                        {ex.type_examen}
                      </span>
                    </td>
                    <td>{timeStr}</td>
                    <td>{ex.salle || '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setSelectedExam(null)}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
