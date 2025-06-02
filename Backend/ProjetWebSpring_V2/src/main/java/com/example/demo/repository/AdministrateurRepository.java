package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Administrateur;


public interface AdministrateurRepository extends JpaRepository<Administrateur, Integer> {

	Optional<Administrateur> findByEmail(String email);
    
    // V�rifier si un administrateur existe par email
    boolean existsByEmail(String email);
    
    // Trouver un administrateur par son nom et pr�nom
    Optional<Administrateur> findByNomAndPrenom(String nom, String prenom);

	Optional<Administrateur> findByEmailAndMotDePasse(String email, String motDePasse);
	
	
}
