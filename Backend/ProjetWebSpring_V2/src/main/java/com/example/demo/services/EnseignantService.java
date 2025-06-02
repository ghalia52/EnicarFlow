package com.example.demo.services;



import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.EnseignantDTO;
import com.example.demo.dto.FeedbackDTO;
import com.example.demo.dto.ProjetEncadreDTO;
import com.example.demo.dto.ProjetProposeDTO;
import com.example.demo.entity.Affectation;
import com.example.demo.entity.Document;
import com.example.demo.entity.Enseignant;
import com.example.demo.entity.Feedback;
import com.example.demo.entity.Reunion;
import com.example.demo.entity.Sujet;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.EnseignantRepository;
import com.example.demo.repository.FeedbackRepository;
import com.example.demo.repository.ReunionRepository;
import com.example.demo.repository.SujetRepository;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EnseignantService {

    @Autowired
    private EnseignantRepository enseignantRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private SujetRepository sujetRepository;
    @Autowired
    private FeedbackRepository feedbackRepository;
    
    @Autowired
    private ReunionRepository reunionRepository;
    
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private final DateTimeFormatter displayFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
  

    // R�cup�rer le profil
    public EnseignantDTO getProfilEnseignant(Integer id) {
        Enseignant enseignant = enseignantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouv�"));
        
        return new EnseignantDTO(
                enseignant.getIdEnseignant(),
                enseignant.getPrenom(),
                enseignant.getNom(),
                enseignant.getEmail(),
                enseignant.getDepartement(),
                enseignant.getPosition(),
                enseignant.getBureau(),
                enseignant.getEtudiantsEncadres().size()
        );
    }
    public EnseignantDTO authenticate(String email, String motDePasse) {
        Optional<Enseignant> optional = enseignantRepository.findByEmailAndMotDePasse(email, motDePasse);

        if (optional.isPresent()) {
            Enseignant enseignant = optional.get();
            return new EnseignantDTO(
                enseignant.getIdEnseignant(),
                enseignant.getPrenom(),
                enseignant.getNom(),
                enseignant.getEmail(),
                enseignant.getDepartement(),
                enseignant.getPosition(),
                enseignant.getBureau(),
                enseignant.getEtudiantsEncadres().size()
            );
        }
        return null;
    }
    @Transactional
    public FeedbackDTO envoyerFeedback(Integer enseignantId, Integer projetId, String message, String date) {
        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouv� avec l'ID: " + enseignantId));
        
        Sujet sujet = sujetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouv� avec l'ID: " + projetId));
        
        // V�rifier que l'enseignant encadre bien ce projet
        if (sujet.getEncadrant() == null || !sujet.getEncadrant().getIdEnseignant().equals(enseignantId)) {
            throw new RuntimeException("Vous n'�tes pas autoris� � donner un feedback sur ce projet");
        }
        
        // Cr�er et sauvegarder le feedback
        Feedback feedback = new Feedback();
        feedback.setMessage(message);
        feedback.setDate(date != null && !date.isEmpty() ? LocalDate.parse(date, formatter) : LocalDate.now());
        feedback.setEnseignant(enseignant);
        feedback.setSujet(sujet);
        
        Feedback savedFeedback = feedbackRepository.save(feedback);
        
        sujetRepository.save(sujet);
        
        // Convertir en DTO pour la r�ponse
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(savedFeedback.getId());
        dto.setProjetId(projetId);
        dto.setEnseignantId(enseignantId);
        dto.setMessage(message);
        dto.setDate(savedFeedback.getDate().format(displayFormatter));
        dto.setNomEnseignant(enseignant.getPrenom() + " " + enseignant.getNom());
        
        return dto;
    }

    /**
     * Planifier une r�union
     */
    @Transactional
    public void planifierReunion(Integer enseignantId, Integer projetId, String date, String notes) {
        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouv� avec l'ID: " + enseignantId));
        
        Sujet sujet = sujetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouv� avec l'ID: " + projetId));
        
        // V�rifier que l'enseignant encadre bien ce projet
        if (sujet.getEncadrant() == null || !sujet.getEncadrant().getIdEnseignant().equals(enseignantId)) {
            throw new RuntimeException("Vous n'�tes pas autoris� � planifier une r�union pour ce projet");
        }
        
        // Cr�er et sauvegarder la r�union
        Reunion reunion = new Reunion();
        reunion.setDate(LocalDate.parse(date, formatter));
        reunion.setNotes(notes);
        reunion.setEnseignant(enseignant);
        reunion.setSujet(sujet);
        
        reunionRepository.save(reunion);
    }



    // R�cup�rer les projets encadr�s
   
	// Valider un document
    @Transactional
    public void validerDocument(Integer docId, Integer enseignantId) {
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document non trouv�"));
        
        /*if (!doc.getSujet().getEncadrant().getIdEnseignant().equals(enseignantId)) {
            throw new RuntimeException("Non autoris� : ce n'est pas votre �tudiant");
        }*/
        
        doc.setStatus("VALID�");
        documentRepository.save(doc);
    }

    // Proposer un nouveau sujet

    @Transactional
    public ProjetProposeDTO proposerSujet(Integer enseignantId, ProjetProposeDTO projetDTO) {
        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouv�"));

        Sujet sujet = new Sujet();
        sujet.setTitre(projetDTO.getTitre());
        sujet.setDescription(projetDTO.getDescription());
        sujet.setDomaine(projetDTO.getDomaine());
        sujet.setDifficulte(projetDTO.getDifficulte());
        sujet.setTechnologies(projetDTO.getTechnologies());
        sujet.setDateProposition(LocalDate.now());
        sujet.setEstValide(null); // Par d�faut non valid�
        sujet.setEncadrant(enseignant);

        Sujet savedSujet = sujetRepository.save(sujet);
        return convertToProjetProposeDTO(savedSujet);
    }

    public List<ProjetProposeDTO> getSujetsProposes(Integer enseignantId) {
        return sujetRepository.findByEncadrant_IdEnseignant(enseignantId).stream()
                .map(this::convertToProjetProposeDTO)
                .collect(Collectors.toList());
    }

    private ProjetProposeDTO convertToProjetProposeDTO(Sujet sujet) {
        String status;
        if (sujet.getEstValide() == null) {
            status = "En attente";  // Default status when not validated
        } else if (sujet.getEstValide()) {
            status = "Valid�";      // Status when validated
        } else {
            status = "Rejet�";      // Status when rejected
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

   
 // R�cup�rer les projets encadr�s
    public List<ProjetEncadreDTO> getProjetsEncadres(Integer enseignantId) {
        return sujetRepository.findByEncadrant_IdEnseignantAndAffectationIsNotNull(enseignantId).stream()
                .map(sujet -> {
                    Affectation affectation = sujet.getAffectation();
                    
                    
                    
                    // Construction du nom de l'�tudiant (ou des �tudiants si bin�me)
                    String nomsEtudiants = affectation.getEtudiant1().getNom() + " " + affectation.getEtudiant1().getPrenom();
                    if (affectation.getEtudiant2() != null) {
                        nomsEtudiants += " et " + affectation.getEtudiant2().getNom() + " " + affectation.getEtudiant2().getPrenom();
                    }
                    ProjetEncadreDTO pdo=new ProjetEncadreDTO(
                            sujet.getId(),
                            sujet.getTitre(),
                            nomsEtudiants,
                            affectation.getDateAffectation(),  // Date unique d'affectation
                            affectation.getDateAffectation().plusMonths(6),  // Date de fin calcul�e (6 mois apr�s)
                            0  // Progression par d�faut (� adapter selon votre logique)
                        );
                     
                    return pdo;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
    
}