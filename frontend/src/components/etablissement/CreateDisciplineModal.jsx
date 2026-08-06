import React, { useState } from 'react';
import { X, Send, Calendar, AlertTriangle, MessageSquare, Award, Scale } from 'lucide-react';
import { api } from '../../services/api';

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

    try {
      setSubmitting(true);
      setError('');
      const res = await api.createDiscipline({
        eleve_id: eleveId,
        type_action: typeAction,
        gravite: gravite,
        motif: motif.trim(),
        description: description.trim(),
        date_rendez_vous: typeAction === 'CONVOCATION' ? dateRendezVous : null,
        lieu_rendez_vous: typeAction === 'CONVOCATION' ? lieuRendezVous : null
      });

      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.message || 'Erreur lors de l\'enregistrement.');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion au serveur.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px'
      }}
    >
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '580px',
        boxShadow: '0 20px 48px -8px rgba(19, 30, 108, 0.18)', border: '1px solid #e2e8f0', overflow: 'hidden'
      }}>
        {/* Header - Native LeralScolaire Style */}
        <div style={{
          padding: '20px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#131e6c', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Scale size={22} color="#131e6c" /> Nouvelle Action Vie Scolaire
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#f93f2d', borderRadius: '10px', fontSize: '0.875rem', border: '1px solid #fecaca', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Sélection Type d'action */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.3px' }}>
              Type d'Action *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setTypeAction('SIGNALEMENT'); setGravite('AVERTISSEMENT'); }}
                style={{
                  padding: '12px 10px', borderRadius: '10px', border: typeAction === 'SIGNALEMENT' ? '2px solid #ea580c' : '1px solid #e2e8f0',
                  backgroundColor: typeAction === 'SIGNALEMENT' ? '#fff7ed' : '#f8fafc',
                  color: typeAction === 'SIGNALEMENT' ? '#c2410c' : '#475569',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <AlertTriangle size={16} /> Signalement
              </button>

              <button
                type="button"
                onClick={() => { setTypeAction('CONVOCATION'); setGravite('GRAVE'); }}
                style={{
                  padding: '12px 10px', borderRadius: '10px', border: typeAction === 'CONVOCATION' ? '2px solid #131e6c' : '1px solid #e2e8f0',
                  backgroundColor: typeAction === 'CONVOCATION' ? '#eff6ff' : '#f8fafc',
                  color: typeAction === 'CONVOCATION' ? '#131e6c' : '#475569',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <Calendar size={16} /> Convocation
              </button>

              <button
                type="button"
                onClick={() => { setTypeAction('REMARQUE'); setGravite('ENCOURAGEMENT'); }}
                style={{
                  padding: '12px 10px', borderRadius: '10px', border: typeAction === 'REMARQUE' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                  backgroundColor: typeAction === 'REMARQUE' ? '#f0fdf4' : '#f8fafc',
                  color: typeAction === 'REMARQUE' ? '#15803d' : '#475569',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <Award size={16} /> Remarque
              </button>
            </div>
          </div>

          {/* Sélection Élève */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.3px' }}>
              Sélectionner l'Élève *
            </label>
            <select
              value={eleveId}
              onChange={(e) => setEleveId(e.target.value)}
              disabled={!!defaultEleveId}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                fontSize: '0.9rem', backgroundColor: defaultEleveId ? '#f1f5f9' : '#ffffff', color: '#0f172a', outline: 'none',
                fontWeight: 500
              }}
            >
              <option value="">-- Choisir un élève --</option>
              {elevesList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.prenom} {e.nom} {e.classe_nom ? `(${e.classe_nom})` : ''} - INE: {e.identifiant_national || e.ine || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          {/* Niveau de Gravité */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.3px' }}>
              Niveau de Gravité / Type de remarque
            </label>
            <select
              value={gravite}
              onChange={(e) => setGravite(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                fontSize: '0.9rem', color: '#0f172a', outline: 'none', fontWeight: 500
              }}
            >
              <option value="ENCOURAGEMENT">🟢 Encouragement / Félicitation (Élève exemplaire)</option>
              <option value="INFO">🔵 Information (Observation simple)</option>
              <option value="AVERTISSEMENT">🟠 Avertissement (Bavardage, retard, travail non fait)</option>
              <option value="GRAVE">🔴 Incident Grave / Blâme (Violences, tricherie, insubordination)</option>
            </select>
          </div>

          {/* Motif */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.3px' }}>
              Motif du signalement / convocation *
            </label>
            <input
              type="text"
              placeholder="ex: Élève exemplaire à encourager, Retards répétés, Insubordination..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                fontSize: '0.9rem', color: '#0f172a', outline: 'none', fontWeight: 500
              }}
            />
          </div>

          {/* Champs spécifiques Convocation */}
          {typeAction === 'CONVOCATION' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.3px' }}>
                  Date & Heure du RDV
                </label>
                <input
                  type="datetime-local"
                  value={dateRendezVous}
                  onChange={(e) => setDateRendezVous(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                    fontSize: '0.9rem', color: '#0f172a', outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.3px' }}>
                  Lieu du RDV
                </label>
                <input
                  type="text"
                  placeholder="ex: Bureau du Censeur, Salle 12"
                  value={lieuRendezVous}
                  onChange={(e) => setLieuRendezVous(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                    fontSize: '0.9rem', color: '#0f172a', outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Description détaillée */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.3px' }}>
              Détails & Description
            </label>
            <textarea
              rows={3}
              placeholder="Expliquez en détail les circonstances du signalement ou de l'appréciation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                fontSize: '0.9rem', color: '#0f172a', outline: 'none', resize: 'vertical'
              }}
            />
          </div>

          <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#64748b' }}>
             <strong>Notifications automatiques :</strong> Un SMS et un email seront immédiatement transmis aux parents/tuteurs de l'élève.
          </div>

          {/* Actions Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '11px 20px', borderRadius: '10px', border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '11px 24px', borderRadius: '10px', border: 'none',
                backgroundColor: '#131e6c', color: '#ffffff', fontWeight: 700, cursor: 'pointer',
                fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(19, 30, 108, 0.25)'
              }}
            >
              <Send size={16} /> {submitting ? 'Envoi...' : 'Transmettre & Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDisciplineModal;
