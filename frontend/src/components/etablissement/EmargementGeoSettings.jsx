import { useEffect, useState } from 'react';
import { MapPin, Crosshair, Trash2, Plus, Loader2, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { getCurrentPosition, mapUrl } from '../../utils/geolocation';

const labelStyle = { fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' };
const inputStyle = { width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid var(--border-color)', padding: '0 12px', fontSize: '12px', outline: 'none' };
const buttonStyle = { height: '38px', padding: '0 16px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' };

const emptyTerrain = { nom: '', latitude: '', longitude: '', rayon_metres: 300 };

// Paramètres GPS de l'émargement : position de l'établissement (cours en salle)
// et terrains d'EPS (cours en extérieur, parfois loin de l'établissement).
const EmargementGeoSettings = () => {
  const [position, setPosition] = useState({ latitude: '', longitude: '', rayon_metres: 200 });
  const [terrains, setTerrains] = useState([]);
  const [newTerrain, setNewTerrain] = useState(emptyTerrain);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api.getGeolocalisation()
      .then((data) => {
        setPosition({
          latitude: data.position?.latitude ?? '',
          longitude: data.position?.longitude ?? '',
          rayon_metres: data.position?.rayon_emargement_metres ?? 200,
        });
        setTerrains(data.terrains || []);
      })
      .catch((err) => setMessage({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  // Capture la position actuelle de l'appareil dans le formulaire ciblé
  const capture = async (target) => {
    setBusy(`capture-${target}`);
    setMessage({ type: '', text: '' });
    try {
      const pos = await getCurrentPosition();
      const coords = { latitude: pos.latitude.toFixed(6), longitude: pos.longitude.toFixed(6) };
      if (target === 'etablissement') setPosition((p) => ({ ...p, ...coords }));
      else setNewTerrain((t) => ({ ...t, ...coords }));
      setMessage({ type: 'info', text: `Position capturée (précision ± ${Math.round(pos.precision)} m). Vérifiez-la sur la carte avant d'enregistrer.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(null);
    }
  };

  const savePosition = async (e) => {
    e.preventDefault();
    setBusy('position');
    try {
      const data = await api.updatePositionEtablissement(position);
      setPosition({ latitude: data.position.latitude, longitude: data.position.longitude, rayon_metres: data.position.rayon_emargement_metres });
      setMessage({ type: 'success', text: data.message });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(null);
    }
  };

  const addTerrain = async (e) => {
    e.preventDefault();
    setBusy('terrain');
    try {
      const data = await api.createTerrainEps(newTerrain);
      setTerrains((list) => [...list, data.terrain].sort((a, b) => a.nom.localeCompare(b.nom)));
      setNewTerrain(emptyTerrain);
      setMessage({ type: 'success', text: data.message });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(null);
    }
  };

  const removeTerrain = async (terrain) => {
    if (!window.confirm(`Supprimer le terrain « ${terrain.nom} » ?`)) return;
    setBusy(`delete-${terrain.id}`);
    try {
      await api.deleteTerrainEps(terrain.id);
      setTerrains((list) => list.filter((t) => t.id !== terrain.id));
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <div className="table-block" style={{ maxWidth: '680px', padding: '24px' }}><Loader2 className="animate-spin" /></div>;
  }

  const messageColor = { error: '#b91c1c', success: '#15803d', info: 'var(--slate-600)' }[message.type];
  const hasPosition = position.latitude !== '' && position.longitude !== '';

  return (
    <div className="table-block" style={{ maxWidth: '680px', padding: '24px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} /> Géolocalisation de l'émargement
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--slate-500)', margin: '6px 0 0' }}>
          Un professeur ne peut émarger un cours que s'il se trouve dans le rayon défini autour de l'établissement,
          ou autour du terrain d'EPS choisi pour une séance d'EPS.
        </p>
      </div>

      {message.text && <div style={{ fontSize: '12px', fontWeight: 600, color: messageColor }}>{message.text}</div>}

      {/* Position de l'établissement */}
      <form onSubmit={savePosition} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>Position de l'établissement (cours en salle)</h3>
        {!hasPosition && (
          <p style={{ fontSize: '12px', color: '#b45309', margin: 0 }}>
            Position non définie : l'émargement par QR Code est bloqué tant qu'elle n'est pas enregistrée.
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '12px' }}>
          <div><label style={labelStyle}>Latitude</label>
            <input type="number" step="any" required value={position.latitude} onChange={(e) => setPosition({ ...position, latitude: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Longitude</label>
            <input type="number" step="any" required value={position.longitude} onChange={(e) => setPosition({ ...position, longitude: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Rayon (m)</label>
            <input type="number" min="50" max="2000" required value={position.rayon_metres} onChange={(e) => setPosition({ ...position, rayon_metres: e.target.value })} style={inputStyle} /></div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="btn" onClick={() => capture('etablissement')} disabled={busy !== null} style={buttonStyle}>
            {busy === 'capture-etablissement' ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />} Utiliser ma position actuelle
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy !== null} style={{ ...buttonStyle, background: 'var(--primary-color)' }}>
            {busy === 'position' ? <Loader2 size={14} className="animate-spin" /> : 'Enregistrer la position'}
          </button>
          {hasPosition && (
            <a href={mapUrl(position.latitude, position.longitude)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Voir sur la carte <ExternalLink size={12} />
            </a>
          )}
        </div>
      </form>

      {/* Terrains d'EPS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>Terrains d'EPS</h3>
        {terrains.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--slate-500)', margin: 0 }}>Aucun terrain enregistré : l'émargement EPS est impossible tant qu'aucun terrain n'est déclaré.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {terrains.map((terrain) => (
              <li key={terrain.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px' }}>
                <span><strong>{terrain.nom}</strong> — rayon {terrain.rayon_metres} m</span>
                <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <a href={mapUrl(terrain.latitude, terrain.longitude)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Carte <ExternalLink size={12} />
                  </a>
                  <button type="button" onClick={() => removeTerrain(terrain)} disabled={busy !== null} title="Supprimer" aria-label={`Supprimer ${terrain.nom}`}
                    style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', display: 'inline-flex' }}>
                    {busy === `delete-${terrain.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addTerrain} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
          <div><label style={labelStyle}>Nom du terrain</label>
            <input type="text" required maxLength={150} placeholder="Ex : Stade municipal de Ouakam" value={newTerrain.nom} onChange={(e) => setNewTerrain({ ...newTerrain, nom: e.target.value })} style={inputStyle} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '12px' }}>
            <div><label style={labelStyle}>Latitude</label>
              <input type="number" step="any" required value={newTerrain.latitude} onChange={(e) => setNewTerrain({ ...newTerrain, latitude: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Longitude</label>
              <input type="number" step="any" required value={newTerrain.longitude} onChange={(e) => setNewTerrain({ ...newTerrain, longitude: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Rayon (m)</label>
              <input type="number" min="50" max="2000" required value={newTerrain.rayon_metres} onChange={(e) => setNewTerrain({ ...newTerrain, rayon_metres: e.target.value })} style={inputStyle} /></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={() => capture('terrain')} disabled={busy !== null} style={buttonStyle}>
              {busy === 'capture-terrain' ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />} Utiliser ma position actuelle
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy !== null} style={{ ...buttonStyle, background: 'var(--primary-color)' }}>
              {busy === 'terrain' ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Ajouter le terrain</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmargementGeoSettings;
