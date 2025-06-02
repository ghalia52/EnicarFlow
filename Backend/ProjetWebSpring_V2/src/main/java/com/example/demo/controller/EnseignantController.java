package com.example.demo.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.EnseignantDTO;
import com.example.demo.dto.EtudiantDTO;
import com.example.demo.dto.FeedbackDTO;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.ProjetEncadreDTO;
import com.example.demo.dto.ProjetProposeDTO;
import com.example.demo.entity.Enseignant;
import com.example.demo.repository.EnseignantRepository;
import com.example.demo.services.EnseignantService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enseignants")
@CrossOrigin(origins = "http://localhost:3000")
public class EnseignantController {

    private final EnseignantService enseignantService;
    @Autowired
    private EnseignantRepository enseignantRepository;

    public EnseignantController(EnseignantService enseignantService) {
        this.enseignantService = enseignantService;
    }
    @GetMapping
    public List<Enseignant> getAllEnseignants() {
        try {
            return enseignantRepository.findAll();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of(); // retourne une liste vide en cas d'erreur
        }
    }


    // Récupérer le profil enseignant
    @GetMapping("/{id}/profil")
    public ResponseEntity<?> getProfilEnseignant(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(enseignantService.getProfilEnseignant(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Récupérer les projets encadrés
    @GetMapping("/{id}/projets-encadres")
    public ResponseEntity<List<ProjetEncadreDTO>> getProjetsEncadres(@PathVariable Integer id) {
        return ResponseEntity.ok(enseignantService.getProjetsEncadres(id));
    }

    // Valider un document
    @PostMapping("/{enseignantId}/documents/{docId}/valider")
    public ResponseEntity<?> validerDocument(
            @PathVariable Integer enseignantId,
            @PathVariable Integer docId) {
        try {
            enseignantService.validerDocument(docId, enseignantId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // Envoyer un feedback sur un projet
    @PostMapping("/{enseignantId}/projets/{projetId}/feedback")
    public ResponseEntity<?> envoyerFeedback(
            @PathVariable Integer enseignantId,
            @PathVariable Integer projetId,
            @RequestBody Map<String, String> feedbackData) {
        try {
            String message = feedbackData.get("message");
            String date = feedbackData.get("date");
            
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le message de feedback ne peut pas être vide");
            }
            
            FeedbackDTO feedback = enseignantService.envoyerFeedback(enseignantId, projetId, message, date);
            return ResponseEntity.ok(feedback);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Planifier une réunion
    @PostMapping("/{enseignantId}/projets/{projetId}/reunions")
    public ResponseEntity<?> planifierReunion(
            @PathVariable Integer enseignantId,
            @PathVariable Integer projetId,
            @RequestBody Map<String, String> reunionData) {
        try {
            String date = reunionData.get("date");
            String notes = reunionData.get("notes");
            
            if (date == null || date.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("La date de réunion ne peut pas être vide");
            }
            
            if (notes == null || notes.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Les notes de réunion ne peuvent pas être vides");
            }
            
            enseignantService.planifierReunion(enseignantId, projetId, date, notes);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // Proposer un nouveau sujet
    @PostMapping("/{id}/proposer-sujet")
    public ResponseEntity<?> proposerSujet(
            @PathVariable Integer id,
            @RequestBody ProjetProposeDTO projetDTO) {
        try {
            return ResponseEntity.ok(enseignantService.proposerSujet(id, projetDTO));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lister les sujets proposés
    @GetMapping("/{id}/sujets-proposes")
    public ResponseEntity<List<ProjetProposeDTO>> getSujetsProposes(@PathVariable Integer id) {
        // Ensure the service returns a list of ProjetProposeDTO objects
        List<ProjetProposeDTO> sujetsProposes = enseignantService.getSujetsProposes(id);
        return ResponseEntity.ok(sujetsProposes);
    }

}