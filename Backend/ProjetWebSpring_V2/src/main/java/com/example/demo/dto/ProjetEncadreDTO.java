package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ProjetEncadreDTO {
    
	private Integer id;
    private String titre;
    private String etudiant;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Integer progress;
    
	public ProjetEncadreDTO(Integer id, String titre, String etudiant, LocalDate dateDebut, LocalDate dateFin,
			Integer progress) {
		super();
		this.id = id;
		this.titre = titre;
		this.etudiant = etudiant;
		this.dateDebut = dateDebut;
		this.dateFin = dateFin;
		this.progress = progress;
	}
    
    
    
}