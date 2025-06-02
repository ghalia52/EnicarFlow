package com.example.demo.services;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.ProjetEncadreDTO;
import com.example.demo.dto.ProjetProposeDTO;
import com.example.demo.entity.Affectation;
import com.example.demo.entity.Etudiant;
import com.example.demo.entity.Sujet;
import com.example.demo.repository.SujetRepository;

/**
 * Service de gestion des sujets et mapping vers DTO.
 */
@Service
@Transactional
public class SujetService {

    @Autowired
    private SujetRepository sujetRepository;

    /**
     * Récupère tous les sujets et les convertit en DTO.
     */
    @Transactional(readOnly = true)
    public List<ProjetProposeDTO> getAllSujets() {
        return sujetRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les sujets en attente et les convertit en DTO.
     */
    @Transactional(readOnly = true)
    public List<ProjetProposeDTO> getSujetsEnAttente() {
        return sujetRepository.findByEstValideIsNull().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ProjetEncadreDTO> getProjetsEncadres() {
        return sujetRepository.findAll().stream()
                .filter(sujet -> sujet.getAffectation() != null)
                .flatMap(sujet -> {
                    Affectation aff = sujet.getAffectation();
                    List<ProjetEncadreDTO> dtos = new ArrayList<>();

                    if (aff.getEtudiant1() != null) {
                        Etudiant etu1 = aff.getEtudiant1();
                        dtos.add(new ProjetEncadreDTO(
                                sujet.getId(),
                                sujet.getTitre(),
                                etu1.getNomComplet(),
                                aff.getDateAffectation(),
                                null, // ou aff.getDateFin() si tu l'ajoutes
                                0     // progress par défaut, à adapter si champ disponible
                        ));
                    }

                    if (aff.getEtudiant2() != null) {
                        Etudiant etu2 = aff.getEtudiant2();
                        dtos.add(new ProjetEncadreDTO(
                                sujet.getId(),
                                sujet.getTitre(),
                                etu2.getNomComplet(),
                                aff.getDateAffectation(),
                                null,
                                0
                        ));
                    }

                    return dtos.stream();
                })
                .collect(Collectors.toList());
    }



    /**
     * Récupère les sujets validés et les convertit en DTO.
     */
    @Transactional(readOnly = true)
    public List<ProjetProposeDTO> getSujetsValides() {
        return sujetRepository.findByEstValideIsTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les sujets rejetés et les convertit en DTO.
     */
    @Transactional(readOnly = true)
    public List<ProjetProposeDTO> getSujetsRejetes() {
        return sujetRepository.findByEstValideIsFalse().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les sujets validés non encore affectés et les convertit en DTO.
     */
    @Transactional(readOnly = true)
    public List<ProjetProposeDTO> getSujetsValidesNonAffectes() {
        return sujetRepository.findSujetsValidesNonAffectes().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Sauvegarde ou met à jour un sujet.
     */
    public Sujet saveSujet(Sujet sujet) {
        return sujetRepository.save(sujet);
    }

    /**
     * Supprime un sujet par son ID.
     */
    public void deleteSujet(Integer id) {
        sujetRepository.deleteById(id);
    }

    /**
     * Récupère un sujet par son ID ou lance une exception si non trouvé.
     */
    @Transactional(readOnly = true)
    public Sujet getSujetById(Integer id) {
        return sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé avec l'ID : " + id));
    }

    /**
     * Valide un sujet (estValide = true) et renvoie l'entité mise à jour.
     */
    public Sujet validerSujet(Integer id) {
        Sujet sujet = getSujetById(id);
        sujet.setEstValide(true);
        return sujetRepository.save(sujet);
    }

    /**
     * Rejette un sujet (estValide = false) et renvoie l'entité mise à jour.
     */
    public Sujet rejeterSujet(Integer id) {
        Sujet sujet = getSujetById(id);
        sujet.setEstValide(false);
        return sujetRepository.save(sujet);
    }

    /**
     * Convertit une entité Sujet en ProjetProposeDTO.
     */
    private ProjetProposeDTO convertToDTO(Sujet sujet) {
        String status;
        if (sujet.getEstValide() == null) {
            status = "En attente";
        } else if (sujet.getEstValide()) {
            status = "Validé";
        } else {
            status = "Rejeté";
        }
        return new ProjetProposeDTO(
                sujet.getId(),
                sujet.getTitre(),
                sujet.getDescription(),
                sujet.getDomaine(),
                sujet.getDifficulte(),
                sujet.getTechnologies(),
                status,
                sujet.getDateProposition()
        );
    }
    
    //Nombre total de sujet
    public int sujetsProposes() {
    	return sujetRepository.nbSujet();
    }
    
    
    //nombre de sujets validés
    
    public int sujetsValides() {
    	return sujetRepository.nbSujetsValides();
    }
    
    //nombre de sujets en attente
    
    public int sujetsEnAtt() {
    	return sujetRepository.nbSujetsEnAttente();
    }
     
    public int nbEns() {
    	return sujetRepository.nbEnseignants();
    }
    
    public int nbSujetParEncadant(Long idEnseignant) {
    	return sujetRepository.nbSujetEncadres(idEnseignant);
    }
    
    public int nbSujetEnattenteParEncadrant(Long idEnseignant) {
    	return sujetRepository.nbSujetEncadresEnAttente(idEnseignant);
    }
    
    public int nbSujetValideParEncadrant(Long idEnseignant) {
    	return sujetRepository.nbSujetEncadresValides(idEnseignant);
    }
}
