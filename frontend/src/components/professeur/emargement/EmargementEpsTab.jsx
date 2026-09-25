import { Compass, MapPin } from 'lucide-react';

// Onglet extrait de ProfDashboardEmargement.jsx
export default function EmargementEpsTab({
  gpsStatus,
  handleEpsGpsEmargement,
  loading,
  selectedTerrainId,
  setSelectedTerrainId,
  terrainsEps,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3
          style={{
            margin: '0 0 4px',
            fontSize: '16px',
            fontWeight: 800,
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Compass size={20} /> Mode Terrain EPS (Stade & Géofencing GPS)
        </h3>
        <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
          Émargement automatique par coordonnées satellites pour les enseignants d'Éducation Physique en extérieur.
        </p>
      </div>

      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '14px',
          borderRadius: '12px',
          fontSize: '12.5px',
          color: '#166534',
          lineHeight: 1.5,
        }}
      >
        📍 Ce mode vérifie que votre appareil se trouve dans le périmètre du terrain d'EPS choisi (stade, plateau
        sportif…), qui peut être éloigné de l'établissement.
      </div>

      {terrainsEps.length === 0 ? (
        <div
          style={{
            fontSize: '12.5px',
            color: '#b45309',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '10px 14px',
            borderRadius: '8px',
          }}
        >
          Aucun terrain d'EPS n'est enregistré pour cet établissement. Demandez à l'administration de le déclarer dans
          ses paramètres.
        </div>
      ) : (
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#334155',
          }}
        >
          Terrain de la séance
          <select
            value={selectedTerrainId}
            onChange={(e) => setSelectedTerrainId(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            {terrainsEps.map((terrain) => (
              <option key={terrain.id} value={terrain.id}>
                {terrain.nom} (rayon {terrain.rayon_metres} m)
              </option>
            ))}
          </select>
        </label>
      )}

      {gpsStatus && (
        <div
          style={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#166534',
            background: '#dcfce7',
            padding: '10px 14px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <MapPin size={16} /> {gpsStatus}
        </div>
      )}

      <button
        type="button"
        onClick={handleEpsGpsEmargement}
        disabled={loading || !selectedTerrainId}
        style={{
          padding: '13px',
          background: '#059669',
          color: '#ffffff',
          border: 'none',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)',
        }}
      >
        <MapPin size={16} />
        {loading ? 'Géolocalisation satellite en cours...' : 'Valider ma Présence sur le Terrain EPS'}
      </button>
    </div>
  );
}
