import React, { useState } from 'react';
import { Search, ShieldCheck, Award, Star, CheckCircle, Clock, BookOpen, User, Download, FileText, Building, MapPin } from 'lucide-react';

export default function ProfCarteIdentiteOfficeBac() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [selectedProfId, setSelectedProfId] = useState(null);
  const [profCarte, setProfCarte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([
    {
      id: 'prof-demo-1',
      nom: 'NDOYE',
      prenom: 'Rassoul',
      matricule_national: 'MEN-784920-SN',
      matiere_principale: 'Mathématiques',
      diplome_eleve: 'Master 2 & CAPES Mathématiques',
      note_inspection: 18.5,
      scoreInfo: {
        totalScore: 920,
        gradeTier: 'OR',
        badgeLabel: 'Professeur Émérite (Prioritaire Président de Jury)'
      }
    },
    {
      id: 'prof-demo-2',
      nom: 'DIOP',
      prenom: 'Moussa',
      matricule_national: 'MEN-452109-SN',
      matiere_principale: 'Sciences de la Vie et de la Terre (SVT)',
      diplome_eleve: 'Doctorat Biologie / Agrégation',
      note_inspection: 17.0,
      scoreInfo: {
        totalScore: 840,
        gradeTier: 'ARGENT',
        badgeLabel: 'Professeur Senior (Éligible Correcteur Principal)'
      }
    }
  ]);

  const handleFetchCarte = async (profId) => {
    setSelectedProfId(profId);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/emargement/office/carte-identite/${profId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProfCarte(data.carte);
      } else {
        // Fallback demo data
        setProfCarte({
          professeur: {
            nom: 'NDOYE',
            prenom: 'Rassoul',
            matricule_national: 'MEN-784920-SN',
            email: 'rassoul.ndoye@education.sn',
            telephone: '+221 77 849 20 00',
            matiere_principale: 'Mathématiques',
            diplome_eleve: 'Master 2 Mathématiques Pures & CAPES (UCAD)',
            note_inspection: 18.5,
            nombre_participations_bac: 5,
            photo_url: null
          },
          score1000: {
            totalScore: 920,
            gradeTier: 'OR',
            badgeLabel: 'Professeur Émérite • Prioritaire Président de Jury BAC',
            breakdown: {
              ptsAssiduite: 340,
              ptsCahier: 245,
              ptsInspection: 185,
              ptsEleves: 92,
              ptsExperience: 90,
              avgGlobalScore: '4.7'
            }
          },
          classesEnseignees: [
            { id: '1', classe_nom: 'Terminale S2', niveau: 'Terminale', nom_etablissement: 'Lycée Lamine Guèye', ville: 'Dakar' },
            { id: '2', classe_nom: 'Terminale S1', niveau: 'Terminale', nom_etablissement: 'Lycée Lamine Guèye', ville: 'Dakar' },
            { id: '3', classe_nom: '1ère S2', niveau: '1ère', nom_etablissement: 'Lycée Delafosse', ville: 'Dakar' },
            { id: '4', classe_nom: '3ème A', niveau: '3ème', nom_etablissement: 'Collège Sacré-Cœur', ville: 'Dakar' }
          ],
          evaluationsElevesDetail: {
            q1: 4.8, q2: 4.9, q3: 4.5, q4: 4.6, q5: 4.7, total_votes: 142
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'Poppins, system-ui, sans-serif' }}>
      
      {/* Header Office du BAC */}
      <div style={{
        background: 'linear-gradient(135deg, #131e6c 0%, #1e1b4b 100%)',
        borderRadius: '20px',
        padding: '28px',
        color: '#ffffff',
        marginBottom: '24px',
        boxShadow: '0 10px 25px rgba(19, 30, 108, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <Award size={36} color="#f59e0b" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#ffffff' }}>
              Office du BAC • Fiches Nationales & Score des Enseignants (1 000 Pts)
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#cbd5e1' }}>
              Moteur de recherche national pour la désignation des Présidents de Jury et Correcteurs du Baccalauréat.
            </p>
          </div>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: 2, minWidth: '240px', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Rechercher un prof (Nom, Prénom, Matricule MEN...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            style={{
              padding: '10px 20px',
              background: '#131e6c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Search size={16} /> Rechercher
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Liste des résultats */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#131e6c' }}>
            Professeurs Référencés ({searchResults.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {searchResults.map((p) => (
              <div
                key={p.id}
                onClick={() => handleFetchCarte(p.id)}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: selectedProfId === p.id ? '2px solid #131e6c' : '1px solid #e2e8f0',
                  background: selectedProfId === p.id ? '#f0f4ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    Prof. {p.prenom} {p.nom}
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 900, padding: '3px 8px', borderRadius: '12px',
                    background: p.scoreInfo.gradeTier === 'OR' ? '#fef3c7' : '#e2e8f0',
                    color: p.scoreInfo.gradeTier === 'OR' ? '#b45309' : '#475569'
                  }}>
                    {p.scoreInfo.totalScore} Pts ({p.scoreInfo.gradeTier})
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  {p.matiere_principale} • <span style={{ fontFamily: 'monospace' }}>{p.matricule_national}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                  Note Inspection: {p.note_inspection}/20
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détail de la Fiche Nationale Enseignant */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          {profCarte ? (
            <div>
              {/* Entête Fiche */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', pb: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#131e6c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900 }}>
                    {profCarte.professeur.nom[0]}{profCarte.professeur.prenom[0]}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#131e6c' }}>
                      Prof. {profCarte.professeur.prenom} {profCarte.professeur.nom}
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                      Matricule National : <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>{profCarte.professeur.matricule_national}</span>
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#4f46e5', fontWeight: 700 }}>
                      {profCarte.professeur.diplome_eleve}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => alert('Ordre de Mission Officiel de l\'Office du BAC généré en PDF !')}
                  style={{
                    padding: '8px 14px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Download size={14} /> Télécharger Ordre de Mission (PDF)
                </button>
              </div>

              {/* Score breakdown 1000 Pts */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#131e6c' }}>Score National de Performance</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#d97706' }}>
                    {profCarte.score1000.totalScore} / 1000 Points
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '11.5px' }}>
                  <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b' }}>Assiduité & Émargement</div>
                    <div style={{ fontWeight: 800, color: '#131e6c' }}>{profCarte.score1000.breakdown.ptsAssiduite} / 350 pts</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b' }}>Cahier de Texte</div>
                    <div style={{ fontWeight: 800, color: '#131e6c' }}>{profCarte.score1000.breakdown.ptsCahier} / 250 pts</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b' }}>Inspection MEN</div>
                    <div style={{ fontWeight: 800, color: '#131e6c' }}>{profCarte.score1000.breakdown.ptsInspection} / 200 pts</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b' }}>Évaluation Élèves (5 Qs)</div>
                    <div style={{ fontWeight: 800, color: '#131e6c' }}>{profCarte.score1000.breakdown.ptsEleves} / 100 pts ({profCarte.score1000.breakdown.avgGlobalScore}/5)</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b' }}>Expérience BAC</div>
                    <div style={{ fontWeight: 800, color: '#131e6c' }}>{profCarte.score1000.breakdown.ptsExperience} / 100 pts</div>
                  </div>
                </div>
              </div>

              {/* Historique complet des classes (6ème à Terminale) */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 800, color: '#131e6c' }}>
                  Historique Exhaustif des Classes Enseignées (6ème à Terminale)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {profCarte.classesEnseignees.map((c) => (
                    <div key={c.id} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px', fontSize: '12px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{c.classe_nom} ({c.niveau})</div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>{c.nom_etablissement} • {c.ville}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <User size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ fontSize: '13px', fontWeight: 600 }}>Sélectionnez un enseignant pour afficher sa fiche d'identité nationale complète.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
