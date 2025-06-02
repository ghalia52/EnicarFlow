"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, Info, Plus, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface ProjetProposeDTO {
  id: number;
  titre: string;
  description: string;
  domaine: string;
  difficulte: string;
  technologies?: string[];
  status: string;
  dateProposition?: string;
}

export default function ProposeProject() {
  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectDomain, setProjectDomain] = useState("")
  const [projectDifficulty, setProjectDifficulty] = useState("")
  const [technologies, setTechnologies] = useState<string[]>([])
  const [newTechnology, setNewTechnology] = useState("")
  const [submissionStatus, setSubmissionStatus] = useState<null | 'success' | 'error'>(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [proposedProjectsFromApi, setProposedProjectsFromApi] = useState<ProjetProposeDTO[]>([]);
  const [teacherId, setTeacherId] = useState<number | null>(null);

  const backendUrl = 'http://localhost:8082';

  // Retrieve the teacher ID from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTeacherId = localStorage.getItem('userId');
      if (storedTeacherId) {
        setTeacherId(parseInt(storedTeacherId, 10));
      } else {
        console.error('Teacher ID not found in localStorage');
        setSubmissionStatus('error');
        setSubmissionMessage('Erreur: ID de l\'enseignant non trouvé. Veuillez vous reconnecter.');
      }
    }
  }, []);

  // Only define apiUrl when teacherId is available
  const apiUrl = teacherId ? `${backendUrl}/api/enseignants/${teacherId}/sujets-proposes` : null;

  // Fetch proposed projects when apiUrl changes or becomes available
  useEffect(() => {
    const fetchProposedProjects = async () => {
      if (!apiUrl) return;
      
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data: ProjetProposeDTO[] = await response.json();
          setProposedProjectsFromApi(data);
        } else {
          console.error('Erreur lors de la récupération des sujets proposés:', response.status);
        }
      } catch (error) {
        console.error('Erreur de réseau lors de la récupération des sujets proposés:', error);
      }
    };

    fetchProposedProjects();
  }, [apiUrl]);

  const handleAddTechnology = () => {
    if (newTechnology && !technologies.includes(newTechnology)) {
      setTechnologies([...technologies, newTechnology])
      setNewTechnology("")
    }
  }

  const handleRemoveTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!teacherId) {
      setSubmissionStatus('error');
      setSubmissionMessage('ID de l\'enseignant non trouvé. Veuillez vous reconnecter.');
      return;
    }

    const newProjectData = {
      titre: projectTitle,
      description: projectDescription,
      domaine: projectDomain,
      difficulte: projectDifficulty,
      technologies: technologies,
    };

    try {
      const submitUrl = `${backendUrl}/api/enseignants/${teacherId}/proposer-sujet`;
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProjectData),
      });

      if (response.ok) {
        console.log('Sujet proposé avec succès !');
        setSubmissionStatus('success');
        setSubmissionMessage(`Le sujet "${projectTitle}" a été proposé avec succès.`);
        setProjectTitle("");
        setProjectDescription("");
        setProjectDomain("");
        setProjectDifficulty("");
        setTechnologies([]);
        
        // Refresh the list of proposed projects
        if (apiUrl) {
          const refreshResponse = await fetch(apiUrl);
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setProposedProjectsFromApi(refreshData);
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la proposition du sujet:', errorData);
        setSubmissionStatus('error');
        setSubmissionMessage(`Erreur lors de la proposition du sujet: ${errorData?.message || 'Une erreur inconnue est survenue.'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la requête:', error);
      setSubmissionStatus('error');
      setSubmissionMessage('Erreur de communication avec le serveur.');
    }
    
    // Reset status after some time
    setTimeout(() => {
      setSubmissionStatus(null);
      setSubmissionMessage('');
    }, 5000);
  };

  return (
    <DashboardLayout userType="teacher">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Proposer un sujet</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Dr. Mohammed Alaoui</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">Département Informatique</span>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            La période de proposition des sujets de PFA est ouverte jusqu'au 31 mars 2025.
          </AlertDescription>
        </Alert>

        {!teacherId && (
          <Alert className="bg-red-100 border-red-400">
            <AlertTitle className="text-red-800">Erreur d'authentification</AlertTitle>
            <AlertDescription className="text-red-700">
              L'ID de l'enseignant n'a pas été trouvé. Veuillez vous reconnecter pour accéder à cette fonctionnalité.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="new">
          <TabsList>
            <TabsTrigger value="new">Nouveau sujet</TabsTrigger>
            <TabsTrigger value="proposed">Sujets proposés ({proposedProjectsFromApi.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Proposer un nouveau sujet de PFA</CardTitle>
                <CardDescription>Veuillez remplir tous les champs pour soumettre votre proposition</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre du projet</Label>
                    <Input
                      id="title"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="Ex: Système de reconnaissance faciale"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Décrivez le projet, ses objectifs et les résultats attendus..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domaine</Label>
                      <Select value={projectDomain} onValueChange={setProjectDomain} required>
                        <SelectTrigger id="domain">
                          <SelectValue placeholder="Sélectionner un domaine" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Intelligence artificielle">Intelligence artificielle</SelectItem>
                          <SelectItem value="Développement web">Développement web</SelectItem>
                          <SelectItem value="Sécurité informatique">Sécurité informatique</SelectItem>
                          <SelectItem value="Analyse de données">Analyse de données</SelectItem>
                          <SelectItem value="Réseaux">Réseaux</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Niveau de difficulté</Label>
                      <Select value={projectDifficulty} onValueChange={setProjectDifficulty} required>
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Débutant">Débutant</SelectItem>
                          <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                          <SelectItem value="Avancé">Avancé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Technologies requises</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTechnology}
                        onChange={(e) => setNewTechnology(e.target.value)}
                        placeholder="Ex: Python, React, TensorFlow..."
                      />
                      <Button type="button" variant="outline" onClick={handleAddTechnology}>
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                          {tech}
                          <button
                            type="button"
                            onClick={() => handleRemoveTechnology(tech)}
                            className="ml-1 rounded-full hover:bg-slate-200 p-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Supprimer</span>
                          </button>
                        </Badge>
                      ))}
                      {technologies.length === 0 && (
                        <span className="text-sm text-slate-500">Aucune technologie ajoutée</span>
                      )}
                    </div>
                  </div>

                  {submissionStatus === 'success' && (
                    <div className="bg-green-100 text-green-800 border border-green-400 p-4 rounded-md">
                      {submissionMessage}
                    </div>
                  )}
                  {submissionStatus === 'error' && (
                    <div className="bg-red-100 text-red-800 border border-red-400 p-4 rounded-md">
                      {submissionMessage}
                    </div>
                  )}

                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={!teacherId}>
                      Soumettre la proposition
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mes sujets proposés</CardTitle>
                <CardDescription>Liste des sujets que vous avez proposés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposedProjectsFromApi.length > 0 ? (
                    proposedProjectsFromApi.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{project.titre}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{project.domaine}</Badge>
                              <Badge variant="outline">{project.difficulte}</Badge>
                            </div>
                          </div>
                          <Badge
                            className={
                              project.status === "Validé"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-slate-500">
                            <FileText className="h-4 w-4 mr-1" />
                            Proposé le: {project.dateProposition ? new Date(project.dateProposition).toLocaleDateString() : 'N/A'}
                          </div>
                          <Button variant="ghost" size="sm">
                            Voir les détails
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      {teacherId ? "Vous n'avez proposé aucun sujet pour le moment." : "Connectez-vous pour voir vos sujets proposés."}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}