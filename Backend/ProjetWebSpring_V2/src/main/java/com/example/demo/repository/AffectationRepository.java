package com.example.demo.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.Affectation;
import com.example.demo.entity.Etudiant;


public interface AffectationRepository extends JpaRepository<Affectation, Long> {
    
    // V�rifie si un �tudiant est d�j� affect� (en tant qu'�tudiant1 OU �tudiant2)
    boolean existsByEtudiant1OrEtudiant2(Etudiant etudiant1, Etudiant etudiant2);
    
    // Trouver toutes les affectations d'un encadrant
    List<Affectation> findByEncadrant_IdEnseignant(Integer encadrantId);
    
    // Trouver les affectations d'un �tudiant
    @Query("SELECT a FROM Affectation a WHERE a.etudiant1.id = :etudiantId OR a.etudiant2.id = :etudiantId")
    List<Affectation> findByEtudiantId(@Param("etudiantId") Integer etudiantId);
    
 // Nouvelles m�thodes n�cessaires
    Optional<Affectation> findByEtudiant1_IdEtudiantOrEtudiant2_IdEtudiant(Long etudiant1Id, Long etudiant2Id);
    
    // Si vous avez besoin de plus de flexibilit�
    @Query("SELECT a FROM Affectation a WHERE a.etudiant1.id = :etudiantId OR a.etudiant2.id = :etudiantId")
    Optional<Affectation> trouverParEtudiant(@Param("etudiantId") Long etudiantId);
    
    @Query("SELECT COUNT(CASE WHEN a.etudiant1 IS NOT NULL THEN 1 ELSE NULL END) + " +
    	       "COUNT(CASE WHEN a.etudiant2 IS NOT NULL THEN 1 ELSE NULL END) " +
    	       "FROM Affectation a WHERE a.encadrant.idEnseignant = :idEnseignant")
    	int countTotalEtudiantsByEnseignantId(@Param("idEnseignant") Long idEnseignant);
    
    @Query("select count(distinct a.encadrant.idEnseignant) from Affectation a")
    	int countNbProjet(@Param("idEnseignant") Long idEnseignant);
}