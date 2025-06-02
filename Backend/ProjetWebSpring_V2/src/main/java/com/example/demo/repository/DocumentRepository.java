package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Document;

public interface DocumentRepository extends JpaRepository<Document, Integer> {

    // Trouver tous les documents d'un �tudiant donn�
    List<Document> findByEtudiant_IdEtudiant(Integer etudiantId);

    // Trouver tous les documents d'un type sp�cifique (rapport, poster, attestation)
    List<Document> findByType(String type);
    List<Document> findByStageId(Integer stageId);
    List<Document> findByStageIsNotNull();

    List<Document> findByStageIsNull();

}