import React, { useState } from 'react';
import { Star, CheckCircle, X, ShieldCheck } from 'lucide-react';

export default function EvaluationProfEleveModal({ isOpen, onClose, professeur, etablissementId }) {
  const [q1, setQ1] = useState(5);
  const [q2, setQ2] = useState(5);
  const [q3, setQ3] = useState(5);
  const [q4, setQ4] = useState(5);
  const [q5, setQ5] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/emargement/evaluation-eleve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          profId: professeur?.id || 'prof-demo-1',
          etablissementId: etablissementId || 'default',
          q1, q2, q3, q4, q5, commentaire
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de votre évaluation');
    } finally {
      setLoading(false);
    }
  };

  const renderStarPicker = (val, setVal, label, description) => (
    <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{description}</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setVal(star)}
            style={{
              background: star <= val ? '#fef3c7' : '#ffffff',
              border: star <= val ? '1px solid #f59e0b' : '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 800,
              color: star <= val ? '#b45309' : '#64748b'
            }}
          >
            <Star size={14} fill={star <= val ? '#f59e0b' : 'none'} color={star <= val ? '#f59e0b' : '#94a3b8'} />
            {star}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '20px', maxWidth: '520px', width: '100%',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', pb: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
              <ShieldCheck size={14} /> Vote 100% Anonyme • Fin 2nd Semestre
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: '17px', fontWeight: 900, color: '#131e6c' }}>
              Évaluation de M./Mme {professeur?.nom || 'l\'Enseignant'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#131e6c', margin: '0 0 8px' }}>
              Merci pour votre évaluation !
            </h4>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 20px' }}>
              Votre vote anonyme à 5 questions a été crypté et comptabilisé dans le score national de l'enseignant.
            </p>
            <button
              onClick={onClose}
              style={{ padding: '10px 24px', background: '#131e6c', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            {renderStarPicker(q1, setQ1, '1. Pédagogie & Clarté des Explications', 'Le professeur explique-t-il clairement les notions complexes ?')}
            {renderStarPicker(q2, setQ2, '2. Ponctualité & Respect des Horaires', 'Le professeur est-il ponctuel et assidu à chaque cours ?')}
            {renderStarPicker(q3, setQ3, '3. Écoute & Disponibilité', 'Le professeur répond-il aux questions et aide-t-il les élèves en difficulté ?')}
            {renderStarPicker(q4, setQ4, '4. Qualité des Corrections & Devoirs', 'Les devoirs sont-ils corrigés dans des délais raisonnables ?')}
            {renderStarPicker(q5, setQ5, '5. Climat & Ambiance de Classe', 'Le climat en classe est-il propice au travail et au respect ?')}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Commentaire constructif (Optionnel) :
              </label>
              <textarea
                rows={2}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Votre avis aide à améliorer la qualité de l'enseignement..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Annuler
              </button>
              <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#131e6c', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                {loading ? 'Transmet...' : 'Valider mon Vote Anonyme'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
