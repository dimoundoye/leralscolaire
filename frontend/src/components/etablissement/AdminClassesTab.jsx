import React from 'react';
import { Plus, School, Calendar, Users, Edit, BookMarked, Copy } from 'lucide-react';

const AdminClassesTab = ({
  selectedYear,
  setEditingClass,
  setNewClass,
  classesAnneeFilter,
  setShowClassModal,
  classes,
  eleves,
  openCoefModal,
  handleCopyRegLink
}) => {
  return (
    <div className="classes-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Classes</h1>
          <p className="page-subtitle">Configurez et gérez les classes de votre établissement</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="school-badge" style={{ fontSize: '11.5px', padding: '6px 12px', background: 'rgba(19, 30, 108, 0.05)', color: 'var(--primary-color)', borderRadius: '6px' }}>
            Année : {selectedYear}
          </span>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setEditingClass(null); 
              setNewClass({ nom: '', niveau: '6ème', annee_scolaire: classesAnneeFilter }); 
              setShowClassModal(true);
            }} 
            style={{ background: 'var(--accent-color)', borderColor: 'var(--accent-color)', fontSize: '11px', padding: '6px 14px', height: '32px' }}
          >
            <Plus size={16} /> Nouvelle Classe
          </button>
        </div>
      </div>

      <div className="classes-grid">
        {classes.filter(c => c.annee_scolaire === classesAnneeFilter).map(c => {
          const classeEleves = eleves.filter(e => e.classe_id === c.id);
          const studentCount = classeEleves.length;
          const fillCount = classeEleves.filter(e => e.sexe === 'F').length;
          const garconCount = studentCount - fillCount;
          return (
            <div key={c.id} className="class-card animate-fade-in">
              <div className="class-card-header">
                <div className="class-icon">
                  <School size={20} />
                </div>
                <div className="class-meta">
                  <h4>{c.nom}</h4>
                  <p>{c.niveau}</p>
                </div>
              </div>

              <div className="class-info-body">
                <div className="class-info-badge year" title="Année Scolaire">
                  <Calendar size={12} />
                  <span>{c.annee_scolaire}</span>
                </div>
                <div className="class-info-badge students" title="Élèves inscrits">
                  <Users size={12} />
                  <span>{studentCount} {studentCount > 1 ? 'élèves' : 'élève'}</span>
                </div>
              </div>

              {studentCount > 0 && (
                <div className="class-info-body" style={{ marginTop: 0 }}>
                  <div className="class-info-badge" title="Garçons" style={{
                    background: '#dbeafe', color: '#1d4ed8',
                    border: '1px solid #93c5fd', fontWeight: 700
                  }}>
                    <span>{garconCount} Garçon{garconCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="class-info-badge" title="Filles" style={{
                    background: '#fce7f3', color: '#be185d',
                    border: '1px solid #f9a8d4', fontWeight: 700
                  }}>
                    <span>{fillCount} Fille{fillCount > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}

              <div className="class-card-footer">
                <div className="flex gap-2 flex-wrap" style={{ width: '100%' }}>
                  <button className="btn-action-text" title="Modifier" onClick={() => {setEditingClass(c); setShowClassModal(true);}} style={{ flex: 1, justifyContent: 'center' }}>
                    <Edit size={12} /> <span>Modifier</span>
                  </button>
                  <button className="btn-action-text" title="Coefficients & Matières" onClick={() => openCoefModal(c)} style={{ flex: 1.2, justifyContent: 'center' }}>
                    <BookMarked size={12} /> <span>Matières</span>
                  </button>
                  <button className="btn-action-text link-btn" title="Copier le lien d'inscription" onClick={() => handleCopyRegLink(c.id)} style={{ flex: 0.8, justifyContent: 'center' }}>
                    <Copy size={12} /> <span>Lien</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminClassesTab;
