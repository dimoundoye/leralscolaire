import { PlusCircle } from 'lucide-react';

// Onglet extrait de ProfDashboardEmargement.jsx
export default function EmargementRattrapageTab({
  classesList,
  handleRattrapageSubmit,
  loading,
  rattrapageClassId,
  rattrapageDate,
  rattrapageHeureDeb,
  rattrapageHeureFin,
  rattrapageMotif,
  selectedClassId,
  setRattrapageClassId,
  setRattrapageDate,
  setRattrapageHeureDeb,
  setRattrapageHeureFin,
  setRattrapageMotif,
}) {
  return (
    <form onSubmit={handleRattrapageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h3
          style={{
            margin: '0 0 4px',
            fontSize: '16px',
            fontWeight: 800,
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <PlusCircle size={20} /> Demande de Cours de Rattrapage
        </h3>
        <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
          Proposez un créneau au Censeur pour remplacer une séance manquée.
        </p>
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#334155',
            marginBottom: '4px',
          }}
        >
          Classe Concernée :
        </label>
        <select
          value={rattrapageClassId || selectedClassId}
          onChange={(e) => setRattrapageClassId(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '12.5px',
          }}
        >
          {classesList.map((c, idx) => (
            <option key={c.id || c.classe_id || idx} value={c.id || c.classe_id}>
              {c.nom || c.classe_nom} ({c.matiere_nom || c.matiere || 'Matière'})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#334155',
            marginBottom: '4px',
          }}
        >
          Date Proposée :
        </label>
        <input
          type="date"
          value={rattrapageDate}
          onChange={(e) => setRattrapageDate(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#334155',
              marginBottom: '4px',
            }}
          >
            Heure Début :
          </label>
          <input
            type="time"
            value={rattrapageHeureDeb}
            onChange={(e) => setRattrapageHeureDeb(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#334155',
              marginBottom: '4px',
            }}
          >
            Heure Fin :
          </label>
          <input
            type="time"
            value={rattrapageHeureFin}
            onChange={(e) => setRattrapageHeureFin(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
            }}
          />
        </div>
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#334155',
            marginBottom: '4px',
          }}
        >
          Motif du rattrapage :
        </label>
        <input
          type="text"
          value={rattrapageMotif}
          onChange={(e) => setRattrapageMotif(e.target.value)}
          placeholder="Ex : Rattrapage du cours manqué le jeudi pour cause de mission pédagogique"
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '12px',
          background: '#d97706',
          color: '#ffffff',
          border: 'none',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
        }}
      >
        {loading ? 'Transmission...' : 'Soumettre au Censeur'}
      </button>
    </form>
  );
}
