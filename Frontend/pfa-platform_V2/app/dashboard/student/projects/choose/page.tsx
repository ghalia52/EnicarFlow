"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { AlertCircle, BookOpen, Check, Info, Search, User, Plus } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import axios from "axios"

interface Projet {
  id: number;
  titre: string;
  description: string;
  domaine: string;
  difficulte: string;
  technologies: string[];
  encadrantNom: string;
  estValide: boolean;
}

interface Etudiant {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  section: string;
  groupe: string;
  moyenne: number;
  ordreMerite: number;
  nomComplet: string;
}

export default function ChooseProjects() {
  // State for projects and students data
  const [projets, setProjets] = useState<Projet[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [currentEtudiant, setCurrentEtudiant] = useState<Etudiant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [workType, setWorkType] = useState("individual");
  const [selectedPartner, setSelectedPartner] = useState("");
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);
  const [proposedProject, setProposedProject] = useState({
    titre: "",
    description: "",
    domaine: "",
    encadrantNom: "",
    technologies: "",
  });
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch projects and students data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects - Using the correct endpoint from ProjectController
        const projetResponse = await axios.get('http://localhost:8082/api/projets/valides');
        setProjets(projetResponse.data);
        
        // Extract unique domains for filter
        const domains = Array.from(new Set(projetResponse.data.map((projet: Projet) => projet.domaine)));
        setAvailableDomains(domains as string[]);
        
        // Fetch students for pair selection
        const etudiantResponse = await axios.get('http://localhost:8082/api/etudiants');
        setEtudiants(etudiantResponse.data);
        
        // Fetch current logged in student (this would normally come from auth context or similar)
        // For now, we'll simulate by taking the first student from the list
        if (etudiantResponse.data.length > 0) {
          setCurrentEtudiant(etudiantResponse.data[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors de la récupération des données. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleValidateChoices = () => {
    if (selectedProjects.length < 3) {
      setError("Vous devez sélectionner au moins 5 projets avant de valider.");
      return;
    }
    
    if (workType === "binome" && !selectedPartner) {
      setError("Veuillez sélectionner un partenaire pour le travail en binôme.");
      return;
    }
    
    setShowValidationDialog(true);
    // Clear any previous error
    setError(null);
  };

  const confirmValidation = async () => {
    try {
      if (!currentEtudiant) {
        setError("Aucun étudiant connecté");
        return;
      }
      
      setSubmitting(true);
      
      // Submit each project choice individually - match the API expected format
      for (let i = 0; i < selectedProjects.length; i++) {
        const projectId = selectedProjects[i];
        
        const payload = {
          etudiant: {
            idEtudiant: currentEtudiant.id
          },
          sujet: {
            id: projectId
          },
          ordrePreference: i + 1,  // Order of preference starting from 1
          binome: workType === "binome" && selectedPartner ? {
            idEtudiant: parseInt(selectedPartner)
          } : null,
          estPropose: false  // This is not a proposed project
        };
        
        // Send each choice to backend
        await axios.post('http://localhost:8082/api/choix', payload);
      }
      
      setShowValidationDialog(false);
      setSuccessMessage("Vos choix de projets ont été validés avec succès!");
      setSubmitting(false);
      
      // Clear selected projects after successful submission
      setSelectedProjects([]);
    } catch (err: any) {
      console.error("Error submitting choices:", err);
      setError(`Erreur lors de la validation de vos choix: ${err.message || "Erreur inconnue"}`);
      setSubmitting(false);
    }
  };

  const filteredProjects = projets.filter((project) => {
    const matchesSearch =
      project.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.encadrantNom.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDomain = domainFilter === "all" || project.domaine === domainFilter;

    return matchesSearch && matchesDomain;
  });

  const handleAddProject = (projectId: number) => {
    if (selectedProjects.length < 10 && !selectedProjects.includes(projectId)) {
      setSelectedProjects([...selectedProjects, projectId]);
      // Reset any error message
      if (error) setError(null);
    }
  };

  const handleRemoveProject = (projectId: number) => {
    setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedProjects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedProjects(items);
  };

  const getProjectById = (id: number) => {
    return projets.find((project) => project.id === id);
  };

  const handleSubmitProposal = async () => {
    try {
      // Validate required fields
      if (!proposedProject.titre || !proposedProject.description || !proposedProject.domaine || !proposedProject.encadrantNom) {
        setError("Veuillez remplir tous les champs obligatoires pour la proposition de projet.");
        return;
      }
      
      if (!currentEtudiant) {
        setError("Aucun étudiant connecté");
        return;
      }
      
      setSubmitting(true);
      
      // Parse technologies string to array
      const technologiesArray = proposedProject.technologies
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech !== '');
      
      // Create payload for new project proposal
      const payload = {
        titre: proposedProject.titre,
        description: proposedProject.description,
        domaine: proposedProject.domaine,
        encadrantNom: proposedProject.encadrantNom,
        technologies: technologiesArray,
        estValide: false,
        estPropose: true,
        dateProposition: new Date().toISOString().split('T')[0]
      };
      
      // First create the project
      const projectResponse = await axios.post('http://localhost:8082/api/projets/proposer', payload);
      
      // Then create the choice with the new project
      if (projectResponse.data && projectResponse.data.id) {
        const choixPayload = {
          etudiant: {
            idEtudiant: currentEtudiant.id
          },
          sujet: {
            id: projectResponse.data.id
          },
          ordrePreference: null,  // No preference order for proposed project
          binome: workType === "binome" && selectedPartner ? {
            idEtudiant: parseInt(selectedPartner)
          } : null,
          estPropose: true  // This is a proposed project
        };
        
        await axios.post('http://localhost:8082/api/choix', choixPayload);
      }
      
      setIsProposalDialogOpen(false);
      setProposedProject({
        titre: "",
        description: "",
        domaine: "",
        encadrantNom: "",
        technologies: "",
      });
      
      setSuccessMessage("Votre proposition de projet a été soumise avec succès et est en attente de validation.");
      setSubmitting(false);
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error("Error submitting proposal:", err);
      setError(`Erreur lors de la soumission de votre proposition: ${err.message || "Erreur inconnue"}`);
      setSubmitting(false);
    }
  };

  const resetSuccessMessage = () => {
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  // Reset success message when changing tabs or making changes
  useEffect(() => {
    resetSuccessMessage();
  }, [selectedProjects, workType, selectedPartner]);

  if (loading) {
    return (
      <DashboardLayout userType="student">
        <div className="flex items-center justify-center h-64">
          <p>Chargement des projets...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        {successMessage && (
          <Alert className="bg-green-50 border-green-500">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Succès</AlertTitle>
            <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Choisir un projet</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{currentEtudiant?.nomComplet}</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">{currentEtudiant?.section} - {currentEtudiant?.groupe}</span>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            Veuillez sélectionner entre 5 et 10 sujets par ordre de préférence. Vous pouvez réorganiser vos choix par
            glisser-déposer.
          </AlertDescription>
        </Alert>

        {/* Section choix de travail (binôme/individuel) */}
        <Card>
          <CardHeader>
            <CardTitle>Type de travail</CardTitle>
            <CardDescription>Choisissez si vous souhaitez travailler seul ou en binôme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant={workType === "individual" ? "default" : "outline"}
                  onClick={() => setWorkType("individual")}
                >
                  Travail individuel
                </Button>
                <Button
                  variant={workType === "binome" ? "default" : "outline"}
                  onClick={() => setWorkType("binome")}
                >
                  Travail en binôme
                </Button>
              </div>

              {workType === "binome" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sélectionnez votre partenaire de binôme</p>
                  <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Choisissez un étudiant" />
                    </SelectTrigger>
                    <SelectContent>
                      {etudiants
                        .filter(etudiant => etudiant.id !== currentEtudiant?.id) // Exclure l'étudiant actuel
                        .map(etudiant => (
                          <SelectItem key={etudiant.id} value={etudiant.id.toString()}>
                            {etudiant.nomComplet} - {etudiant.section} {etudiant.groupe}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {selectedPartner && (
                    <p className="text-sm text-green-600">
                      Binôme sélectionné: {etudiants.find(s => s.id === parseInt(selectedPartner))?.nomComplet}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="available" onChange={resetSuccessMessage}>
          <TabsList>
            <TabsTrigger value="available">Sujets disponibles</TabsTrigger>
            <TabsTrigger value="selected">Mes choix ({selectedProjects.length}/10)</TabsTrigger>
            <TabsTrigger value="proposal">Proposer un sujet</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Rechercher un sujet..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Tous les domaines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les domaines</SelectItem>
                  {availableDomains.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {filteredProjects.length > 0 ? filteredProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{project.titre}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <User className="h-3.5 w-3.5 mr-1" />
                          {project.encadrantNom}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge>{project.domaine}</Badge>
                        {project.difficulte && <Badge variant="outline">{project.difficulte}</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.technologies && project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddProject(project.id)}
                      disabled={selectedProjects.includes(project.id) || selectedProjects.length >= 10}
                    >
                      {selectedProjects.includes(project.id) ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Ajouté
                        </>
                      ) : (
                        "Ajouter à mes choix"
                      )}
                    </Button>
                    <span className="text-xs text-slate-500">ID: {project.id}</span>
                  </CardFooter>
                </Card>
              )) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun sujet trouvé</h3>
                  <p className="text-sm text-slate-500">Aucun sujet ne correspond à vos critères de recherche.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="selected" className="space-y-4">
            {selectedProjects.length < 3 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>
                  Vous devez sélectionner au moins 3 sujets. Actuellement: {selectedProjects.length}/5 minimum.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Mes choix de projets</CardTitle>
                <CardDescription>Glissez-déposez pour réorganiser vos choix par ordre de préférence</CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="projects">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {selectedProjects.length === 0 ? (
                          <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Aucun projet sélectionné</h3>
                            <p className="text-sm text-slate-500">
                              Veuillez sélectionner au moins 5 projets dans l'onglet "Sujets disponibles".
                            </p>
                          </div>
                        ) : (
                          selectedProjects.map((projectId, index) => {
                            const project = getProjectById(projectId);
                            if (!project) return null;

                            return (
                              <Draggable key={projectId.toString()} draggableId={projectId.toString()} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="border rounded-lg p-4 bg-white"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-start gap-3">
                                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-sm font-medium">
                                          {index + 1}
                                        </div>
                                        <div>
                                          <h3 className="font-medium">{project.titre}</h3>
                                          <p className="text-sm text-slate-500">{project.encadrantNom}</p>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveProject(projectId)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        Retirer
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={selectedProjects.length < 3 || submitting}
                  onClick={handleValidateChoices}
                >
                  {submitting ? "En cours..." : "Valider mes choix"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="proposal">
            <Card>
              <CardHeader>
                <CardTitle>Proposer un nouveau sujet</CardTitle>
                <CardDescription>
                  Vous pouvez proposer votre propre sujet de projet qui sera soumis à validation par l'administration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Instructions</AlertTitle>
                    <AlertDescription>
                      Veuillez fournir des informations détaillées sur votre proposition. Un encadrant devra être
                      spécifié et devra valider votre proposition.
                    </AlertDescription>
                  </Alert>

                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setIsProposalDialogOpen(true);
                      setError(null); // Clear any errors when opening dialog
                    }}
                  >
                    <Plus size={16} />
                    Proposer un nouveau sujet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog pour la proposition de nouveau projet */}
        <Dialog open={isProposalDialogOpen} onOpenChange={setIsProposalDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Proposer un nouveau sujet</DialogTitle>
              <DialogDescription>
                Remplissez ce formulaire pour proposer votre propre sujet de projet.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">
                  Titre du projet <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={proposedProject.titre}
                  onChange={(e) => setProposedProject({ ...proposedProject, titre: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">
                  Description détaillée <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="description"
                  rows={4}
                  value={proposedProject.description}
                  onChange={(e) => setProposedProject({ ...proposedProject, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="domain" className="block text-sm font-medium">
                    Domaine <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="domain"
                    value={proposedProject.domaine}
                    onChange={(e) => setProposedProject({ ...proposedProject, domaine: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="supervisor" className="block text-sm font-medium">
                    Encadrant proposé <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="supervisor"
                    value={proposedProject.encadrantNom}
                    onChange={(e) => setProposedProject({ ...proposedProject, encadrantNom: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="technologies" className="block text-sm font-medium">
                  Technologies envisagées (séparées par des virgules)
                </label>
                <Input
                  id="technologies"
                  value={proposedProject.technologies}
                  onChange={(e) => setProposedProject({ ...proposedProject, technologies: e.target.value })}
                />
              </div>

              {workType === "binome" && selectedPartner && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    Ce projet sera proposé en binôme avec:{" "}
                    <span className="font-medium">
                      {etudiants.find(s => s.id === parseInt(selectedPartner))?.nomComplet}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProposalDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmitProposal} disabled={submitting}>
                {submitting ? "En cours..." : "Soumettre la proposition"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialogue de confirmation de validation */}
        <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer vos choix</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir valider ces choix de projets ? Une fois validés, vous ne pourrez plus les modifier.
              </DialogDescription>
            </DialogHeader>
            <div className="py-3">
              <p className="font-medium">Vous avez sélectionné {selectedProjects.length} projets :</p>
              <ol className="mt-2 space-y-1 pl-5 list-decimal">
                {selectedProjects.map((projectId) => {
                  const project = getProjectById(projectId);
                  return project ? (
                    <li key={projectId}>
                      {project.titre}
                    </li>
                  ) : null;
                })}
              </ol>
              
              {workType === "binome" && selectedPartner && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    Ces choix seront enregistrés en binôme avec:{" "}
                    <span className="font-medium">
                      {etudiants.find(s => s.id === parseInt(selectedPartner))?.nomComplet || "Partenaire inconnu"}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowValidationDialog(false)}>
                Annuler
              </Button>
              <Button onClick={confirmValidation} disabled={submitting}>
                {submitting ? "En cours..." : "Confirmer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}