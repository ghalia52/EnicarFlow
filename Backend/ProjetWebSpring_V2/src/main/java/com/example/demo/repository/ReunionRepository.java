package com.example.demo.repository;

import com.example.demo.entity.Reunion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReunionRepository extends JpaRepository<Reunion, Integer> {
    // Ajoute ici des m�thodes personnalis�es si n�cessaire
}
