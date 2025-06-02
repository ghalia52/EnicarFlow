"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, User, FileText, AlertCircle, CheckCircle, Clock, MessageSquare, Download, Calendar } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import axios from "axios"

interface EnseignantDTO {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  departement: string;
  position: string;
  bureau: string;
  nombreEtudiants: number;
  nomComplet?: string; // Champ calculé
}

interface ProjetEncadreDTO {
  id: number;
  titre: string;
  etudiant: string;
  dateDebut: string;
  dateFin: string;
  progress: number;
  status: string;
  lastUpdate: string;
  documents: DocumentDTO[];
  meetings: MeetingDTO[];
}

interface DocumentDTO {
  id: number;
  name: string;
  date: string;
  type: string;
  status: string;
}

interface MeetingDTO {
  id?: number;
  date: string;
  notes: string;
}

export default function TeacherSupervise() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("projects")
  const [feedback, setFeedback] = useState("")
  const [selectedProject, setSelectedProject] = useState<ProjetEncadreDTO | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<DocumentDTO | null>(null)
  const [projects, setProjects] = useState<ProjetEncadreDTO[]>([])
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(new Date())
  const [meetingNotes, setMeetingNotes] = useState("")
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [showMeetingDialog, setShowMeetingDialog] = useState(false)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [teacherInfo, setTeacherInfo] = useState<EnseignantDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Récupérer l'ID de l'enseignant depuis le localStorage
    const storedId = localStorage.getItem("userId")
    if (storedId) {
      setTeacherId(storedId)
    }
  }, [])

  // Récupération des infos de l'enseignant connecté
  useEffect(() => {
    const fetchTeacherInfo = async () => {
      if (teacherId) {
        try {
          setIsLoading(true)
          const response = await axios.get<EnseignantDTO>(`http://localhost:8082/api/enseignants/${teacherId}/profil`)
          setTeacherInfo(response.data)
        } catch (error: any) {
          console.error("Erreur lors de la récupération des informations de l'enseignant:", 
            error?.response?.data?.message || error.message)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    if (teacherId) {
      fetchTeacherInfo()
    }
  }, [teacherId])

  // Récupération des projets encadrés
  useEffect(() => {
    const fetchSupervisedProjects = async () => {
      if (teacherId) {
        try {
          setIsLoading(true)
          const response = await axios.get<ProjetEncadreDTO[]>(
            `http://localhost:8082/api/enseignants/${teacherId}/projets-encadres`
          )
          
          // Transformer les données si nécessaire
          const formattedProjects = response.data.map(project => ({
            ...project,
            // S'assurer que les documents et meetings sont initialisés s'ils sont null
            documents: project.documents || [],
            meetings: project.meetings || [],
            // Convertir le progress en nombre si c'est une chaîne
            progress: typeof project.progress === 'string' ? parseInt(project.progress) : project.progress,
          }))
          
          setProjects(formattedProjects)
        } catch (error: any) {
          console.error("Erreur lors de la récupération des projets encadrés:", 
            error?.response?.data?.message || error.message)
          setProjects([])
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (teacherId) {
      fetchSupervisedProjects()
    }
  }, [teacherId])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.etudiant.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Validé":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-4 w-4 mr-1" />Validé</Badge>
      case "En retard":
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-4 w-4 mr-1" />En retard</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-4 w-4 mr-1" />En cours</Badge>
    }
  }

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case "Validé":
        return <Badge className="bg-green-100 text-green-800">Validé</Badge>
      case "Rejeté":
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
      default:
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
    }
  }

  const handleValidateDocument = async (document: DocumentDTO) => {
    if (!teacherId || !document.id) return;
    
    try {
      // Appel API pour valider le document
      await axios.post(`http://localhost:8082/api/enseignants/${teacherId}/documents/${document.id}/valider`);
      
      // Mise à jour locale après succès de l'API
      const updatedProjects = projects.map(project => {
        const updatedDocuments = project.documents.map(doc => {
          if (doc.id === document.id) {
            return { ...doc, status: "Validé" }
          }
          return doc
        })
        return { ...project, documents: updatedDocuments }
      })
      
      setProjects(updatedProjects);
      setShowDocumentDialog(false);
    } catch (error) {
      console.error("Erreur lors de la validation du document:", error);
      // Afficher une notification d'erreur si nécessaire
    }
  }

  const handleRejectDocument = async (document: DocumentDTO) => {
    if (!teacherId || !document.id) return;
    
    try {
      // Appel API pour rejeter le document (à implémenter côté backend)
      await axios.post(`http://localhost:8082/api/enseignants/${teacherId}/documents/${document.id}/rejeter`);
      
      // Mise à jour locale après succès de l'API
      const updatedProjects = projects.map(project => {
        const updatedDocuments = project.documents.map(doc => {
          if (doc.id === document.id) {
            return { ...doc, status: "Rejeté" }
          }
          return doc
        })
        return { ...project, documents: updatedDocuments }
      })
      
      setProjects(updatedProjects);
      setShowDocumentDialog(false);
    } catch (error) {
      console.error("Erreur lors du rejet du document:", error);
      // Si l'API n'existe pas encore, mise à jour locale uniquement
      const updatedProjects = projects.map(project => {
        const updatedDocuments = project.documents.map(doc => {
          if (doc.id === document.id) {
            return { ...doc, status: "Rejeté" }
          }
          return doc
        })
        return { ...project, documents: updatedDocuments }
      })
      
      setProjects(updatedProjects);
      setShowDocumentDialog(false);
    }
  }

  const handleSubmitFeedback = async () => {
    if (!selectedProject || !feedback || !teacherId) return;
    
    try {
      // Appel API pour envoyer un feedback (à implémenter côté backend)
      await axios.post(`http://localhost:8082/api/enseignants/${teacherId}/projets/${selectedProject.id}/feedback`, {
        message: feedback,
        date: format(new Date(), 'yyyy-MM-dd')
      });
      
      // Mise à jour locale après succès de l'API
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject.id) {
          return { 
            ...project, 
            lastUpdate: format(new Date(), 'dd/MM/yyyy'),
            // Mise à jour du statut en fonction du contenu du feedback
            status: feedback.toLowerCase().includes("retard") ? "En retard" : 
                   feedback.toLowerCase().includes("bon travail") ? "Validé" : project.status
          }
        }
        return project
      });
      
      setProjects(updatedProjects);
      setFeedback("");
      setShowFeedbackDialog(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi du feedback:", error);
      // Si l'API n'existe pas encore, mise à jour locale uniquement
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject.id) {
          return { 
            ...project, 
            lastUpdate: format(new Date(), 'dd/MM/yyyy'),
            // Mise à jour du statut en fonction du contenu du feedback
            status: feedback.toLowerCase().includes("retard") ? "En retard" : 
                   feedback.toLowerCase().includes("bon travail") ? "Validé" : project.status
          }
        }
        return project
      });
      
      setProjects(updatedProjects);
      setFeedback("");
      setShowFeedbackDialog(false);
    }
  }

  const handleScheduleMeeting = async () => {
    if (!selectedProject || !meetingDate || !meetingNotes || !teacherId) return;
    
    try {
      // Appel API pour planifier une réunion (à implémenter côté backend)
      await axios.post(`http://localhost:8082/api/enseignants/${teacherId}/projets/${selectedProject.id}/reunions`, {
        date: format(meetingDate, 'yyyy-MM-dd'),
        notes: meetingNotes
      });
      
      // Mise à jour locale après succès de l'API
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject.id) {
          const newMeeting = {
            date: format(meetingDate, 'dd/MM/yyyy'),
            notes: meetingNotes
          };
          
          return { 
            ...project, 
            meetings: [...project.meetings, newMeeting],
            lastUpdate: format(new Date(), 'dd/MM/yyyy')
          }
        }
        return project
      });
      
      setProjects(updatedProjects);
      setMeetingNotes("");
      setMeetingDate(new Date());
      setShowMeetingDialog(false);
    } catch (error) {
      console.error("Erreur lors de la planification de la réunion:", error);
      // Si l'API n'existe pas encore, mise à jour locale uniquement
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject.id) {
          const newMeeting = {
            date: format(meetingDate, 'dd/MM/yyyy'),
            notes: meetingNotes
          };
          
          return { 
            ...project, 
            meetings: [...project.meetings, newMeeting],
            lastUpdate: format(new Date(), 'dd/MM/yyyy')
          }
        }
        return project
      });
      
      setProjects(updatedProjects);
      setMeetingNotes("");
      setMeetingDate(new Date());
      setShowMeetingDialog(false);
    }
  }

  const handleDownloadDocument = (document: DocumentDTO) => {
    // Dans une application réelle, cela déclencherait un téléchargement du document
    console.log(`Téléchargement du document avec l'ID: ${document.id}`);
    alert(`Téléchargement du document: ${document.name}`);
    
    // Généralement, cela utiliserait une API comme:
    // window.open(`http://localhost:8082/api/documents/${document.id}/download`, '_blank');
  }

  // Afficher un indicateur de chargement pendant la récupération des données
  if (isLoading) {
    return (
      <DashboardLayout userType="teacher">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des données...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="teacher">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Projets Encadrés</h1>
          {teacherInfo ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {teacherInfo.nomComplet ? teacherInfo.nomComplet : `${teacherInfo.prenom} ${teacherInfo.nom}`}
              </span>
              <span className="text-sm text-slate-500">•</span>
              <span className="text-sm text-slate-500">
                Département {teacherInfo.departement || "Non spécifié"}
              </span>
            </div>
          ) : (
            <div>Informations non disponibles</div>
          )}
        </div>

        <Tabs defaultValue="projects" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="projects">Mes projets</TabsTrigger>
            <TabsTrigger value="documents">Documents à valider</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Rechercher un projet ou étudiant..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="En retard">En retard</SelectItem>
                  <SelectItem value="Validé">Validé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{project.titre}</CardTitle>
                          <CardDescription className="mt-2">
                            <User className="h-4 w-4 inline mr-1" />
                            {project.etudiant}
                          </CardDescription>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium">Période</p>
                            <p className="text-sm text-slate-600">
                              {project.dateDebut} - {project.dateFin}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Progression</p>
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    project.progress < 30 ? "bg-red-500" :
                                    project.progress < 70 ? "bg-amber-500" : "bg-green-500"
                                  }`}
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">{project.progress}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Dernière mise à jour</p>
                            <p className="text-sm text-slate-600">{project.lastUpdate}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Documents</h4>
                            {project.documents && project.documents.length > 0 ? (
                              <div className="space-y-2">
                                {project.documents.map((doc, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                                    <div className="flex items-center">
                                      <FileText className="h-4 w-4 mr-2 text-slate-500" />
                                      <span className="text-sm">{doc.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {getDocumentStatusBadge(doc.status)}
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleDownloadDocument(doc)}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500">Aucun document disponible</p>
                            )}
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Réunions</h4>
                            {project.meetings && project.meetings.length > 0 ? (
                              <div className="space-y-2">
                                {project.meetings.map((meeting, index) => (
                                  <div key={index} className="p-2 border rounded">
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium">{meeting.date}</span>
                                      <Button variant="ghost" size="sm">
                                        <MessageSquare className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{meeting.notes}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500">Aucune réunion planifiée</p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSelectedProject(project)
                              setShowMeetingDialog(true)
                            }}
                          >
                            Planifier une réunion
                          </Button>
                          <Button 
                            onClick={() => {
                              setSelectedProject(project)
                              setShowFeedbackDialog(true)
                            }}
                          >
                            Donner un feedback
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-12 w-12 mx-auto mb-4">
                  <FileText className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
                <p className="text-sm text-slate-500">
                  {searchTerm || statusFilter !== "all" 
                    ? "Essayez de modifier vos filtres de recherche." 
                    : "Vous n'avez pas encore de projets à encadrer."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents à valider</CardTitle>
                <CardDescription>
                  {projects.flatMap(p => p.documents || []).filter(d => d.status === "En attente").length} documents en attente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.flatMap(project => 
                    (project.documents || [])
                      .filter(doc => doc.status === "En attente")
                      .map(doc => ({ ...doc, projectTitle: project.titre, student: project.etudiant }))
                  ).map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{doc.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">
                            Projet: {doc.projectTitle} • Étudiant: {doc.student}
                          </p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800">À valider</Badge>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center text-sm text-slate-500">
                          <FileText className="h-4 w-4 mr-1" />
                          Soumis le: {doc.date}
                        </div>
                        <div className="space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedDocument(doc)
                              setShowDocumentDialog(true)
                            }}
                          >
                            Prévisualiser
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleValidateDocument(doc)}
                          >
                            Valider
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500" 
                            onClick={() => handleRejectDocument(doc)}
                          >
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {projects.flatMap(p => p.documents || []).filter(d => d.status === "En attente").length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucun document à valider</h3>
                      <p className="text-sm text-slate-500">Tous les documents ont été traités.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donner un feedback</DialogTitle>
            <DialogDescription>
              Feedback pour le projet: {selectedProject?.titre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Écrivez votre feedback ici..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitFeedback}>Envoyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Dialog */}
      <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planifier une réunion</DialogTitle>
            <DialogDescription>
              Réunion pour le projet: {selectedProject?.titre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date de la réunion</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {meetingDate ? format(meetingDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={meetingDate}
                    onSelect={setMeetingDate}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                placeholder="Ajoutez des notes pour la réunion..."
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMeetingDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleScheduleMeeting}>Planifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prévisualisation du document</DialogTitle>
            <DialogDescription>
              {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">{selectedDocument?.name}</p>
                <p className="text-sm text-slate-500">Soumis le: {selectedDocument?.date}</p>
              </div>
              <Badge variant="outline">{selectedDocument?.type}</Badge>
            </div>
            <div className="h-64 bg-slate-50 rounded flex items-center justify-center">
              <p className="text-slate-400">Aperçu du document {selectedDocument?.name}</p>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <div className="space-x-2">
              <Button variant="destructive" onClick={() => selectedDocument && handleRejectDocument(selectedDocument)}>
                Rejeter
              </Button>
              <Button onClick={() => selectedDocument && handleValidateDocument(selectedDocument)}>
                Valider
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}