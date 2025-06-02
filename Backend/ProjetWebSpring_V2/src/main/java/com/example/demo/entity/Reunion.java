package com.example.demo.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "reunions")
public class Reunion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idReunion;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(nullable = false, length = 1000)
    private String notes;
    
    @ManyToOne
    @JoinColumn(name = "idEnseignant", nullable = false)
    private Enseignant enseignant;
    
    @ManyToOne
    @JoinColumn(name = "id", nullable = false)
    private Sujet sujet;
    
    // Constructeurs
    public Reunion() {
    }
    
    public Reunion(LocalDate date, String notes, Enseignant enseignant, Sujet sujet) {
        this.date = date;
        this.notes = notes;
        this.enseignant = enseignant;
        this.sujet = sujet;
    }
    
    // Getters and Setters
    public Integer getId() {
        return idReunion;
    }
    
    public void setId(Integer id) {
        this.idReunion = id;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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