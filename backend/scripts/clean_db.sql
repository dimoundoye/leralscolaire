-- ====================================================================
-- Script SQL : Nettoyage complet de la base de données LeralScolaire
-- Conserve UNIQUEMENT le compte OFFICE_BAC et les matières de référence
-- ====================================================================

BEGIN;

-- 1. Vider toutes les tables opérationnelles avec cascade
TRUNCATE TABLE 
  absences,
  bulletins,
  bulletins_autorises,
  bulletins_telechargements,
  cahier_de_texte,
  campagnes_evaluation_eleves,
  centres_examen_bac,
  classe_matieres,
  demandes_attestation,
  demandes_inscription_office,
  documents_partages,
  emargements,
  emplois_du_temps,
  evaluations_eleves,
  examens_planification,
  historique_notes,
  inscription_classes,
  jurys_bac,
  livrets_scolaires_bac,
  messages,
  notes,
  notes_candidats_bac,
  notifications,
  portfolio_items,
  pre_inscriptions,
  professeur_matieres,
  professeurs_etablissements,
  professeurs,
  regles_passage,
  resultats_examens_nationaux,
  seances_cours,
  signalements_discipline,
  transferts_eleves,
  eleves,
  classes,
  etablissements
CASCADE;

-- 2. Supprimer tous les utilisateurs (élèves, enseignants, établissements, etc.) sauf l'Office du Bac
DELETE FROM users 
WHERE role != 'OFFICE_BAC';

-- 3. Réinitialiser les compteurs auto-incrémentés (SERIAL)
DO $$ 
DECLARE 
  seq RECORD;
BEGIN 
  FOR seq IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') 
  LOOP 
    EXECUTE 'ALTER SEQUENCE ' || quote_ident(seq.sequence_name) || ' RESTART WITH 1;'; 
  END LOOP; 
END $$;

COMMIT;

-- 4. Affichage de contrôle du compte Office du Bac préservé
SELECT id, email, role, identifiant_national FROM users;
