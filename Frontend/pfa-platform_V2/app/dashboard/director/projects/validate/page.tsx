"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, User, CheckCircle, X } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProjetProposeDTO {
    id: number;
    titre: string;
    description: string;
    domaine: string;
    difficulte: string;
    technologies?: string[];
    status: 'En attente' | 'Validé' | 'Refusé' | null;
    dateProposition?: string;
    // ... autres propriétés de votre DTO
}

export default function ValidateProjects() {
    const [enAttenteProjects, setEnAttenteProjects] = useState<ProjetProposeDTO[]>([]);
    const [validatedProjects, setValidatedProjects] = useState<ProjetProposeDTO[]>([]);
    const [rejectedProjects, setRejectedProjects] = useState<ProjetProposeDTO[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjetProposeDTO | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const backendUrl = 'http://localhost:8082'; // Utilisez le port de votre backend


    const fetchProjectsByStatus = async (status: 'en-attente' | 'valides' | 'rejetes', setState: React.Dispatch<React.SetStateAction<ProjetProposeDTO[]>>) => {
      try {
          const response = await fetch(`${backendUrl}/api/administrateurs/${status}`);
          if (response.ok) {
              const data: ProjetProposeDTO[] = await response.json();
              setState(data);
          } else {
              console.error(`Erreur lors de la récupération des sujets ${status}:`, response.status);
              // Gérer l'erreur d'affichage à l'utilisateur si nécessaire
          }
      } catch (error) {
          console.error(`Erreur de réseau lors de la récupération des sujets ${status}:`, error);
          // Gérer l'erreur d'affichage à l'utilisateur si nécessaire
      }
  };

    useEffect(() => {
        fetchProjectsByStatus('en-attente', setEnAttenteProjects);
        fetchProjectsByStatus('valides', setValidatedProjects);
        fetchProjectsByStatus('rejetes', setRejectedProjects);
    }, [backendUrl]);

    const handleViewDetails = (project: ProjetProposeDTO) => {
        setSelectedProject(project);
        setIsDialogOpen(true);
    };

    const handleValidate = async (projectId: number) => {
      try {
        const response = await fetch(`${backendUrl}/api/administrateurs/${projectId}/valider`, {
          method: 'PATCH', // Utilisez la méthode PATCH comme défini dans votre backend
          headers: {
            'Content-Type': 'application/json',
            // Ajoutez d'autres headers si nécessaire (token d'authentification, etc.)
          },
          // Pas de body nécessaire pour ces endpoints dans votre backend actuel
        });
    
        if (response.ok) {
          console.log(`Projet ${projectId} validé avec succès`);
          // Après une validation réussie, refetcher les listes de projets pour mettre à jour l'UI
          fetchProjectsByStatus('valides', setValidatedProjects);
          fetchProjectsByStatus('en-attente', setEnAttenteProjects);
          setIsDialogOpen(false); // Fermer la boîte de dialogue
        } else if (response.status === 404) {
          console.error(`Le projet avec l'ID ${projectId} n'a pas été trouvé sur le serveur.`);
          // Gérez l'erreur d'affichage à l'utilisateur (ex: un message d'alerte)
        } else {
          console.error(`Erreur lors de la validation du projet ${projectId}:`, response.status);
          // Gérez d'autres erreurs de réponse du serveur
        }
      } catch (error) {
        console.error('Erreur réseau lors de la validation:', error);
        // Gérez l'erreur réseau
      }
    };

    const handleReject = async (projectId: number) => {
      try {
        const response = await fetch(`${backendUrl}/api/administrateurs/${projectId}/rejeter`, {
          method: 'PATCH', // Utilisez la méthode PATCH
          headers: {
            'Content-Type': 'application/json',
            // Ajoutez d'autres headers si nécessaire
          },
          // Pas de body nécessaire
        });
    
        if (response.ok) {
          console.log(`Projet ${projectId} rejeté avec succès`);
          // Après un rejet réussi, refetcher les listes
          fetchProjectsByStatus('rejetes', setRejectedProjects);
          fetchProjectsByStatus('en-attente', setEnAttenteProjects);
          setIsDialogOpen(false);
        } else if (response.status === 404) {
          console.error(`Le projet avec l'ID ${projectId} n'a pas été trouvé sur le serveur.`);
          // Gérez l'erreur d'affichage
        } else {
          console.error(`Erreur lors du rejet du projet ${projectId}:`, response.status);
          // Gérez d'autres erreurs
        }
      } catch (error) {
        console.error('Erreur réseau lors du rejet:', error);
        // Gérez l'erreur réseau
      }
    };

    return (
        <DashboardLayout userType="director">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Validation des projets</h1>
                    {/* ... Infos de l'admin si nécessaire */}
                </div>

                <Tabs defaultValue="en-attente">
                    <TabsList>
                        <TabsTrigger value="en-attente">En attente ({enAttenteProjects.length})</TabsTrigger>
                        <TabsTrigger value="valides">Validés ({validatedProjects.length})</TabsTrigger>
                        <TabsTrigger value="refuses">Refusés ({rejectedProjects.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="en-attente" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sujets en attente de validation</CardTitle>
                                <CardDescription>Liste des sujets proposés par les enseignants qui n'ont pas encore été validés.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {enAttenteProjects.length > 0 ? (
                                    enAttenteProjects.map((project) => (
                                        <div key={project.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium">{project.titre}</h3>
                                                    <div className="flex items-center text-sm text-slate-500 mt-1">
                                                        <span className="italic text-slate-400">Encadrant non disponible dans ce DTO</span>
                                                    </div>
                                                </div>
                                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">En attente</Badge>
                                            </div>
                                            <div className="mt-4 flex justify-between items-center">
                                                <div className="flex items-center text-sm text-slate-500">
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    Proposé le: {project.dateProposition ? new Date(project.dateProposition).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(project)}>
                                                    Voir les détails
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Aucun sujet en attente</h3>
                                        <p className="text-sm text-slate-500">Il n'y a aucun sujet en attente de validation pour le moment.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="valides" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sujets validés</CardTitle>
                                <CardDescription>Liste des sujets qui ont été validés par l'administration.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {validatedProjects.length > 0 ? (
                                    validatedProjects.map((project) => (
                                        <div key={project.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium">{project.titre}</h3>
                                                    <div className="flex items-center text-sm text-slate-500 mt-1">
                                                        <span className="italic text-slate-400">Encadrant non disponible dans ce DTO</span>
                                                    </div>
                                                </div>
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Validé</Badge>
                                            </div>
                                            <div className="mt-4 flex justify-between items-center">
                                                <div className="flex items-center text-sm text-slate-500">
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    Validé le: {project.dateProposition ? new Date(project.dateProposition).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(project)}>
                                                    Voir les détails
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Aucun sujet validé</h3>
                                        <p className="text-sm text-slate-500">Il n'y a aucun sujet validé pour le moment.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="refuses" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sujets refusés</CardTitle>
                                <CardDescription>Liste des sujets qui ont été refusés par l'administration.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {rejectedProjects.length > 0 ? (
                                    rejectedProjects.map((project) => (
                                        <div key={project.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium">{project.titre}</h3>
                                                    <div className="flex items-center text-sm text-slate-500 mt-1">
                                                        <span className="italic text-slate-400">Encadrant non disponible dans ce DTO</span>
                                                    </div>
                                                </div>
                                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Refusé</Badge>
                                            </div>
                                            <div className="mt-4 flex justify-between items-center">
                                                <div className="flex items-center text-sm text-slate-500">
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    Refusé le: {project.dateProposition ? new Date(project.dateProposition).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(project)}>
                                                    Voir les détails
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Aucun sujet refusé</h3>
                                        <p className="text-sm text-slate-500">Il n'y a aucun sujet refusé à afficher pour le moment.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {selectedProject && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{selectedProject.titre}</DialogTitle>
                                <DialogDescription>
                                    Proposé le {selectedProject.dateProposition ? new Date(selectedProject.dateProposition).toLocaleDateString() : 'N/A'}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Description</h4>
                                    <p className="text-sm text-slate-600">{selectedProject.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Domaine</h4>
                                        <Badge>{selectedProject.domaine}</Badge>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Difficulté</h4>
                                        <Badge variant="outline">{selectedProject.difficulte}</Badge>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-1">Technologies</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.technologies?.map((tech: string) => (
                                            <Badge key={tech} variant="secondary">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-1">Statut</h4>
                                    <Badge
                                        className={
                                            selectedProject.status === "Validé"
                                                ? "bg-green-100 text-green-800"
                                                : selectedProject.status === "Refusé"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-amber-100 text-amber-800" // En attente
                                        }
                                    >
                                        {selectedProject.status === null ? "En attente" : selectedProject.status}
                                    </Badge>
                                </div>
                            </div>

                            <DialogFooter>
                                {(selectedProject.status === null || selectedProject.status === 'Refusé' || selectedProject.status?.toUpperCase() === 'EN ATTENTE') && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleReject(selectedProject.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Rejeter
                                        </Button>
                                        <Button
                                            onClick={() => handleValidate(selectedProject.id)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Valider
                                        </Button>
                                    </>
                                )}
                                {(selectedProject.status === 'Validé' || selectedProject.status === 'Refusé') && (
                                    <Button onClick={() => setIsDialogOpen(false)}>Fermer</Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </DashboardLayout>
    )
}