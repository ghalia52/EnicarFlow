package com.example.demo.dto;

import java.time.LocalDate;

public class FeedbackDTO {
    private Integer id;
    private Integer projetId;
    private Integer enseignantId;
    private String message;
    private String date;
    private String nomEnseignant;

    // Constructeurs
    public FeedbackDTO() {
    }

    public FeedbackDTO(Integer id, Integer projetId, Integer enseignantId, String message, String date, String nomEnseignant) {
        this.id = id;
        this.projetId = projetId;
        this.enseignantId = enseignantId;
        this.message = message;
        this.date = date;
        this.nomEnseignant = nomEnseignant;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getProjetId() {
        return projetId;
    }

    public void setProjetId(Integer projetId) {
        this.projetId = projetId;
    }

    public Integer getEnseignantId() {
        return enseignantId;
    }

    public void setEnseignantId(Integer enseignantId) {
        this.enseignantId = enseignantId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getNomEnseignant() {
        return nomEnseignant;
    }

    public void setNomEnseignant(String nomEnseignant) {
        this.nomEnseignant = nomEnseignant;
    }
}
