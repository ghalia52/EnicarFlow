package com.example.demo.repository;

import com.example.demo.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    // Ajoute ici des méthodes personnalisées si nécessaire
}
