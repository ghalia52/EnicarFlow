package com.example.demo.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "feedbacks")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idFeed;
    
    @Column(nullable = false)
    private String message;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @ManyToOne
    @JoinColumn(name = "idEnseignant", nullable = false)
    private Enseignant enseignant;
    
    @ManyToOne
    @JoinColumn(name = "id", nullable = false)
    private Sujet sujet;
    
    // Constructeurs
    public Feedback() {
    }
    
    public Feedback(String message, LocalDate date, Enseignant enseignant, Sujet sujet) {
        this.message = message;
        this.date = date;
        this.enseignant = enseignant;
        this.sujet = sujet;
    }
    
    // Getters and Setters
    public Integer getId() {
        return idFeed;
    }
    
    public void setId(Integer id) {
        this.idFeed = id;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public Enseignant getEnseignant() {
        return enseignant;
    }
    
    public void setEnseignant(Enseignant enseignant) {
        this.enseignant = enseignant;
    }
    
    public Sujet getSujet() {
        return sujet;
    }
    
    public void setSujet(Sujet sujet) {
        this.sujet = sujet;
    }
}
