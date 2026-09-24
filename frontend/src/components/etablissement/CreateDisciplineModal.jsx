import React, { useState } from 'react';
import { X, Send, Calendar, AlertTriangle, MessageSquare, Award, Scale } from 'lucide-react';
import { api } from '../../services/api';
import './CreateDisciplineModal.css';

const CreateDisciplineModal = ({ elevesList = [], defaultEleveId = null, onClose, onSuccess }) => {
  const [eleveId, setEleveId] = useState(defaultEleveId || '');
  const [typeAction, setTypeAction] = useState('SIGNALEMENT'); // 'SIGNALEMENT', 'CONVOCATION', 'REMARQUE'
  const [gravite, setGravite] = useState('AVERTISSEMENT'); // 'ENCOURAGEMENT', 'INFO', 'AVERTISSEMENT', 'GRAVE'
  const [motif, setMotif] = useState('');
  const [description, setDescription] = useState('');
  const [dateRendezVous, setDateRendezVous] = useState('');
  const [lieuRendezVous, setLieuRendezVous] = useState('Bureau du Censeur');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eleveId) {
      setError('Veuillez sélectionner un élève.');
      return;
    }
    if (!motif.trim()) {
      setError('Veuillez préciser le motif.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.createIncident({
        eleve_id: eleveId,
        type_incident: typeAction,
        gravite,
        motif: motif.trim(),
        description: description.trim(),
        date_rendez_vous: typeAction === 'CONVOCATION' && dateRendezVous ? dateRendezVous : null,
        lieu_rendez_vous: typeAction === 'CONVOCATION' ? lieuRendezVous : null,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de l'enregistrement de l'action.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="discipline-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="discipline-modal-container">
        {/* Header - Native LeralScolaire Style */}
        <div className="discipline-modal-header">
          <h3>
            <Scale size={22} color="#131e6c" /> Nouvelle Action Vie Scolaire
          </h3>
          <button onClick={onClose} className="discipline-modal-close-btn" title="Fermer">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="discipline-modal-form">
          {error && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                color: '#f93f2d',
                borderRadius: '10px',
                fontSize: '0.875rem',
                border: '1px solid #fecaca',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {/* Sélection Type d'action */}
          <div>
            <label className="discipline-modal-label">Type d'Action *</label>
            <div className="discipline-type-grid">
              <button
                type="button"
                onClick={() => {
                  setTypeAction('SIGNALEMENT');
                  setGravite('AVERTISSEMENT');
                }}
                className="discipline-type-btn"
                style={{
                  border: typeAction === 'SIGNALEMENT' ? '2px solid #ea580c' : '1px solid #e2e8f0',
                  backgroundColor: typeAction === 'SIGNALEMENT' ? '#fff7ed' : '#f8fafc',
                  color: typeAction === 'SIGNALEMENT' ? '#c2410c' : '#475569',
                }}
              >
                <AlertTriangle size={16} /> Signalement
              </button>

              <button
                type="button"
                onClick={() => {
                  setTypeAction('CONVOCATION');
                  setGravite('GRAVE');
                }}
                className="discipline-type-btn"
                style={{
                  border: typeAction === 'CONVOCATION' ? '2px solid #131e6c' : '1px solid #e2e8f0',
                  backgroundColor: typeAction === 'CONVOCATION' ? '#eff6ff' : '#f8fafc',
                  color: typeAction === 'CONVOCATION' ? '#131e6c' : '#475569',
                }}
              >
                <Calendar size={16} /> Convocation
              </button>

              <button
                type="button"
                onClick={() => {
                  setTypeAction('REMARQUE');
                  setGravite('ENCOURAGEMENT');
                }}
                className="discipline-type-btn"
                style={{
                  border: typeAction === 'REMARQUE' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                  backgroundColor: typeAction === 'REMARQUE' ? '#f0fdf4' : '#f8fafc',
                  color: typeAction === 'REMARQUE' ? '#15803d' : '#475569',
                }}
              >
                <Award size={16} /> Remarque
              </button>
            </div>
          </div>

          {/* Sélection Élève */}
          <div>
            <label className="discipline-modal-label">Sélectionner l'Élève *</label>
            <select
              value={eleveId}
              onChange={(e) => setEleveId(e.target.value)}
              disabled={!!defaultEleveId}
              className="discipline-select"
              style={{
                backgroundColor: defaultEleveId ? '#f1f5f9' : '#ffffff',
                fontWeight: 500,
              }}
            >
              <option value="">-- Choisir un élève --</option>
              {elevesList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.prenom} {e.nom} {e.classe_nom ? `(${e.classe_nom})` : ''} - IUP:{' '}
                  {e.identifiant_national || e.ine || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          {/* Niveau de Gravité */}
          <div>
            <label className="discipline-modal-label">Niveau de Gravité / Type de remarque</label>
            <select
              value={gravite}
              onChange={(e) => setGravite(e.target.value)}
              className="discipline-select"
              style={{ fontWeight: 500 }}
            >
              <option value="ENCOURAGEMENT">🟢 Encouragement / Félicitation (Élève exemplaire)</option>
              <option value="INFO">🔵 Information (Observation simple)</option>
              <option value="AVERTISSEMENT">🟠 Avertissement (Bavardage, retard, travail non fait)</option>
              <option value="GRAVE">🔴 Incident Grave / Blâme (Violences, tricherie, insubordination)</option>
            </select>
          </div>

          {/* Motif */}
          <div>
            <label className="discipline-modal-label">Motif du signalement / convocation *</label>
            <input
              type="text"
              placeholder="ex: Élève exemplaire à encourager, Retards répétés, Insubordination..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="discipline-input"
              style={{ fontWeight: 500 }}
            />
          </div>

          {/* Champs spécifiques Convocation */}
          {typeAction === 'CONVOCATION' && (
            <div className="convocation-fields-grid">
              <div>
                <label className="discipline-modal-label">Date & Heure du RDV</label>
                <input
                  type="datetime-local"
                  value={dateRendezVous}
                  onChange={(e) => setDateRendezVous(e.target.value)}
                  className="discipline-input"
                />
              </div>

              <div>
                <label className="discipline-modal-label">Lieu du RDV</label>
                <input
                  type="text"
                  placeholder="ex: Bureau du Censeur, Salle 12"
                  value={lieuRendezVous}
                  onChange={(e) => setLieuRendezVous(e.target.value)}
                  className="discipline-input"
                />
              </div>
            </div>
          )}

          {/* Description détaillée */}
          <div>
            <label className="discipline-modal-label">Détails & Description</label>
            <textarea
              rows={3}
              placeholder="Expliquez en détail les circonstances du signalement ou de l'appréciation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="discipline-textarea"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.825rem',
              color: '#64748b',
            }}
          >
            <strong>Notifications automatiques :</strong> Un SMS et un email seront immédiatement transmis aux
            parents/tuteurs de l'élève.
          </div>

          {/* Actions Footer */}
          <div className="discipline-modal-footer">
            <button type="button" onClick={onClose} className="discipline-btn-cancel">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="discipline-btn-submit">
              <Send size={16} /> {submitting ? 'Envoi...' : 'Transmettre & Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDisciplineModal;
