"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, User, FileText, Plus, X, ListOrdered, ArrowRight, Users, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"

interface Student {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  section: string;
  groupe: string;
  moyenne: number;
  ordreMerite: number;
  encadrantId: number | null;
  encadrantNom: string | null;
  cin?: string;
  cne?: string;
  niveau?: string;
  choixSujets?: { sujetId: number }[];
  sujetPropose?: {
    id: number;
    titre: string;
    domaine: string;
    description: string;
    encadrantPropose: string;
    estValide: boolean | null;
  };
  idPartenaireBinome?: number | null;
}

interface Project {
  id: number;
  titre: string;
  domaine: string;
  difficulte: string;
  capacite: number;
  filieres: string[];
  typeTravail: "INDIVIDUEL" | "BINOME";
  estPropose: boolean;
  idEtudiantProposant?: number | null;
  status: "Validé" | "Rejeté" | "En attente";
  encadrant?: string;
}

interface Assignment {
  id: number;
  etudiant1: string; // "Prenom Nom"
  etudiant2: string | null; // "Prenom Nom" or null
  sujet: string; // project title
  enseignant: string; // "Prenom Nom"
  dateAffectation: string; // ISO date
}

interface Supervisor {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  departement: string;
  position: string;
  bureau: string;
  nombreEtudiants: number;
}

export default function AssignProjects() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [autoAssignStatus, setAutoAssignStatus] = useState("")
  const [sections, setSections] = useState(["Infotronique", "Mécatronique", "GSIL"])
  const [activeSection, setActiveSection] = useState("Infotronique")
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false)
  const [selectedProjectToValidate, setSelectedProjectToValidate] = useState<Project | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [selectedSupervisor, setSelectedSupervisor] = useState("")
  const [loading, setLoading] = useState({
    students: true,
    projects: true,
    assignments: true,
    supervisors: true
  })
  
  const backendUrl = 'http://localhost:8082'

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(prev => ({ ...prev, students: true }))
        const response = await fetch(`${backendUrl}/api/etudiants`)
        if (response.ok) {
          const data: Student[] = await response.json()
          setStudents(data)
        } else {
          console.error("Failed to fetch students data")
        }
      } catch (error) {
        console.error("Error fetching students data:", error)
      } finally {
        setLoading(prev => ({ ...prev, students: false }))
      }
    }

    fetchStudents()
  }, [backendUrl])

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(prev => ({ ...prev, projects: true }))
        // Fetch approved projects
        const approvedResponse = await fetch(`${backendUrl}/api/projets/valides`)
        // Fetch pending projects
        const pendingResponse = await fetch(`${backendUrl}/api/projets/est-valide-null`)
        
        if (approvedResponse.ok && pendingResponse.ok) {
          const approvedData: Project[] = await approvedResponse.json()
          const pendingData: Project[] = await pendingResponse.json()
          
          // Combine approved and pending projects
          setProjects([...approvedData, ...pendingData])
        } else {
          console.error("Failed to fetch projects data")
        }
      } catch (error) {
        console.error("Error fetching projects data:", error)
      } finally {
        setLoading(prev => ({ ...prev, projects: false }))
      }
    }

    fetchProjects()
  }, [backendUrl])

  // Fetch assignments data
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(prev => ({ ...prev, assignments: true }))
        const response = await fetch(`${backendUrl}/api/affectations`)
        
        if (response.ok) {
          const data: Assignment[] = await response.json()
          setAssignments(data)
        } else {
          console.error("Failed to fetch assignments data")
        }
      } catch (error) {
        console.error("Error fetching assignments data:", error)
      } finally {
        setLoading(prev => ({ ...prev, assignments: false }))
      }
    }

    fetchAssignments()
  }, [backendUrl])

  // Fetch supervisors data
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        setLoading(prev => ({ ...prev, supervisors: true }))
        const response = await fetch(`${backendUrl}/api/enseignants`)
        
        if (response.ok) {
          const data: Supervisor[] = await response.json()
          setSupervisors(data)
        } else {
          console.error("Failed to fetch supervisors data")
        }
      } catch (error) {
        console.error("Error fetching supervisors data:", error)
      } finally {
        setLoading(prev => ({ ...prev, supervisors: false }))
      }
    }

    fetchSupervisors()
  }, [backendUrl])

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      `${student.prenom} ${student.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.cin?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (student.cne?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

    const matchesSection = student.section === activeSection

    return matchesSearch && matchesSection
  })

  const filteredProjects = projects.filter((project) => {
    // Check if filieres exists and is an array before calling includes
    return project.filieres && Array.isArray(project.filieres) && 
           project.filieres.includes(activeSection) && 
           (project.status === "Validé" || project.estPropose)
  })

  const pendingProjects = projects.filter((project) => {
    // Check if filieres exists and is an array before calling includes
    return project.status === "En attente" && 
           project.filieres && Array.isArray(project.filieres) && 
           project.filieres.includes(activeSection)
  })

  const handleAutoAssign = async () => {
    setAutoAssignStatus("Attribution en cours...");
  
    try {
      const response = await fetch(`${backendUrl}/api/affectations/automatique`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const data = await response.text();
        setAutoAssignStatus(data);
        
        // Refresh assignments after auto-assign
        const assignmentsResponse = await fetch(`${backendUrl}/api/affectations`);
        if (assignmentsResponse.ok) {
          const newAssignments: Assignment[] = await assignmentsResponse.json();
          setAssignments(newAssignments);
        }
      } else {
        const errorData = await response.text();
        setAutoAssignStatus(`Erreur lors de l'affectation automatique: ${errorData}`);
      }
    } catch (error) {
      setAutoAssignStatus(`Erreur de connexion avec le serveur: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const getStudentAssignment = (studentId: number) => {
    return assignments.find(a => {
      const student = students.find(s => s.id === studentId);
      if (!student) return false;
      
      return a.etudiant1.includes(student.prenom) || 
             (a.etudiant2 && a.etudiant2.includes(student.prenom));
    });
  }

  const getProjectAssignments = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];
    
    return assignments.filter(a => a.sujet === project.titre);
  }

  const handleValidateProject = async (project: Project, status: "Validé" | "Rejeté") => {
    if (!project) return;
    
    try {
      const endpoint = status === "Validé" ? 
        `${backendUrl}/api/sujets/${project.id}/valider` : 
        `${backendUrl}/api/sujets/${project.id}/rejeter`;
      
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          encadrantId: supervisors.find(s => `${s.prenom} ${s.nom}` === selectedSupervisor)?.id
        })
      });
      
      if (response.ok) {
        // Update the project status in local state
        setProjects(prev => prev.map(p => {
          if (p.id === project.id) {
            return {
              ...p,
              status: status,
              encadrant: status === "Validé" ? selectedSupervisor : p.encadrant
            };
          }
          return p;
        }));
      } else {
        console.error("Failed to update project status");
      }
    } catch (error) {
      console.error("Error updating project status:", error);
    }
    
    setIsValidationDialogOpen(false);
    setSelectedProjectToValidate(null);
    setSelectedSupervisor("");
  }

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      const response = await fetch(`${backendUrl}/api/affectations/${assignmentId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      } else {
        console.error("Failed to remove assignment");
      }
    } catch (error) {
      console.error("Error removing assignment:", error);
    }
  }

  const findStudentByName = (name: string): Student | undefined => {
    if (!name) return undefined;
    
    // Extract first name from the full name string
    const firstName = name.split(' ')[0];
    
    return students.find(s => name.includes(s.prenom) && name.includes(s.nom));
  }

  return (
    <DashboardLayout userType="director">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Attribution des projets</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Prof. Rachid Benmokhtar</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">Directeur du Département</span>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid grid-cols-3 w-full">
            {sections.map((section) => (
              <TabsTrigger key={section} value={section}>
                {section}
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((section) => (
            <TabsContent key={section} value={section} className="space-y-6">
              <div className="flex justify-end gap-4">
                <Button onClick={handleAutoAssign} className="gap-2">
                  <ListOrdered size={18} />
                  Attribution automatique ({section})
                </Button>
              </div>

              {autoAssignStatus && (
                <div className={`p-4 rounded-md ${
                  autoAssignStatus.includes("succès") ? "bg-green-100 text-green-800" : 
                  autoAssignStatus.includes("Aucun") ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {autoAssignStatus}
                </div>
              )}

              {/* Pending projects validation section */}
              {pendingProjects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Projets étudiants à valider</CardTitle>
                    <CardDescription>
                      {pendingProjects.length} projets proposés par les étudiants en attente de validation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingProjects.map((project) => {
                        const proposingStudent = students.find(s => s.id === project.idEtudiantProposant)
                        return (
                          <div key={project.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{project.titre}</h3>
                                <div className="text-sm text-slate-500 mt-1">
                                  Domaine: {project.domaine}
                                </div>
                                <div className="mt-2 text-sm">
                                  <p className="font-medium">Description:</p>
                                  <p className="text-slate-600">
                                    {proposingStudent?.sujetPropose?.description}
                                  </p>
                                </div>
                                <div className="mt-2 text-sm">
                                  <p className="font-medium">Encadrant proposé:</p>
                                  <p className="text-slate-600">
                                    {proposingStudent?.sujetPropose?.encadrantPropose || "Non spécifié"}
                                  </p>
                                </div>
                                {proposingStudent?.idPartenaireBinome && (
                                  <div className="mt-2 text-sm">
                                    <p className="font-medium">Binôme proposé:</p>
                                    <p className="text-slate-600">
                                      {students.find(s => s.id === proposingStudent.idPartenaireBinome)?.prenom} {students.find(s => s.id === proposingStudent.idPartenaireBinome)?.nom}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant="outline">Proposé par: {proposingStudent?.prenom} {proposingStudent?.nom}</Badge>
                                <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedProjectToValidate(project)
                                  setIsValidationDialogOpen(true)
                                }}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Valider le projet
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleValidateProject(project, "Rejeté")}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Rejeter
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Étudiants - {section}</CardTitle>
                    <CardDescription>
                      {filteredStudents.length} étudiants - Classement par mérite
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                          placeholder="Rechercher un étudiant..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        {loading.students ? (
                          <div className="text-center py-8">
                            <p>Chargement des étudiants...</p>
                          </div>
                        ) : filteredStudents.length > 0 ? (
                          filteredStudents
                            .sort((a, b) => a.ordreMerite - b.ordreMerite)
                            .map((student) => {
                              const assignment = getStudentAssignment(student.id)
                              const partner = student.idPartenaireBinome ? students.find(s => s.id === student.idPartenaireBinome) : null
                              
                              return (
                                <div
                                  key={student.id}
                                  className={`border rounded-lg p-4 cursor-pointer ${
                                    assignment ? "bg-green-50 border-green-200" : ""
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-medium">{student.prenom} {student.nom}</h3>
                                      <div className="text-sm text-slate-500 mt-1">
                                        {student.cne} • {student.cin}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <Badge variant="outline">{student.niveau}</Badge>
                                      <Badge className="bg-blue-100 text-blue-800">
                                        Moyenne: {student.moyenne} (Mérite: #{student.ordreMerite})
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  {partner && (
                                    <div className="mt-2 text-sm text-purple-600">
                                      <span className="font-medium">Binôme avec:</span> {partner.prenom} {partner.nom}
                                    </div>
                                  )}
                                  
                                  <div className="mt-2">
                                    <p className="text-sm font-medium">Choix de projets:</p>
                                    <ol className="text-sm text-slate-600 list-decimal pl-5">
                                      {student.choixSujets?.map((choice, index) => {
                                        const project = projects.find(p => p.id === choice.sujetId)
                                        return (
                                          <li key={index}>
                                            {project?.titre || "Projet inconnu"} 
                                            {project?.status !== "Validé" && " (En attente)"}
                                          </li>
                                        )
                                      })}
                                    </ol>
                                  </div>
                                  
                                  {student.sujetPropose && (
                                    <div className={`mt-2 text-sm ${
                                      student.sujetPropose.estValide === true ? "text-green-600" :
                                      student.sujetPropose.estValide === null ? "text-amber-600" : "text-red-600"
                                    }`}>
                                      <span className="font-medium">Proposition:</span> {student.sujetPropose.titre} (
                                      {student.sujetPropose.estValide === true ? "Validé" : 
                                       student.sujetPropose.estValide === null ? "En attente" : "Rejeté"})
                                    </div>
                                  )}
                                  
                                  {assignment && (
                                    <div className="mt-3 pt-3 border-t">
                                      <div className="flex items-center text-sm text-green-600">
                                        <ArrowRight size={16} className="mr-1" />
                                        Assigné à: {assignment.sujet} ({assignment.etudiant2 ? "Binôme" : "Individuel"})
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })
                        ) : (
                          <div className="text-center py-8">
                            <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Aucun étudiant trouvé</h3>
                            <p className="text-sm text-slate-500">
                              Aucun étudiant ne correspond à vos critères de recherche.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Projets disponibles - {section}</CardTitle>
                    <CardDescription>
                      {filteredProjects.filter(p => p.status === "Validé").length} projets validés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {loading.projects ? (
                          <div className="text-center py-8">
                            <p>Chargement des projets...</p>
                          </div>
                        ) : filteredProjects.length > 0 ? (
                          filteredProjects.map((project) => {
                            const projectAssignments = getProjectAssignments(project.id)
                            const isFull = projectAssignments.length >= project.capacite
                            const isApproved = project.status === "Validé"
                            
                            return (
                              <div
                                key={project.id}
                                className={`border rounded-lg p-4 ${
                                  isFull && isApproved ? "bg-amber-50 border-amber-200" : ""
                                } ${
                                  !isApproved ? "bg-slate-50 border-slate-200 opacity-75" : ""
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{project.titre}</h3>
                                    <div className="text-sm text-slate-500 mt-1">
                                      {project.encadrant ? (
                                        <>
                                          <User className="h-3.5 w-3.5 inline mr-1" />
                                          {project.encadrant}
                                        </>
                                      ) : project.estPropose ? (
                                        <span className="text-purple-600">Proposé par étudiant</span>
                                      ) : (
                                        <span className="text-red-600">Superviseur non attribué</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <Badge variant="outline">{project.difficulte}</Badge>
                                    {isApproved ? (
                                      <Badge className={isFull ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                                        {projectAssignments.length}/{project.capacite} places
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-amber-100 text-amber-800">
                                        En attente de validation
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge>{project.domaine}</Badge>
                                  {project.filieres.map(section => (
                                    <Badge key={section} variant="secondary">{section}</Badge>
                                  ))}
                                  {project.estPropose && (
                                    <Badge className="bg-purple-100 text-purple-800">Proposition étudiante</Badge>
                                  )}
                                </div>
                                
                                {isApproved && projectAssignments.length > 0 && (
                                  <div className="mt-3 pt-3 border-t">
                                    <p className="text-xs font-medium text-slate-500 mb-1">Étudiants assignés:</p>
                                    <ul className="text-xs text-slate-600 space-y-1">
                                      {projectAssignments.map((a, i) => (
                                        <li key={i} className="flex items-center">
                                          <ArrowRight size={12} className="mr-1" />
                                          {a.etudiant1} ({a.etudiant2 ? "Binôme" : "Individuel"})
                                          {a.etudiant2 && (
                                            <span className="ml-2 text-slate-400">+ {a.etudiant2}</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Aucun projet disponible</h3>
                            <p className="text-sm text-slate-500">
                              Tous les projets ont été attribués ou aucun projet n'a été validé.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {assignments.filter(a => {
                const student = findStudentByName(a.etudiant1);
                return student?.section === section;
              }).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Attributions récentes - {section}</CardTitle>
                    <CardDescription>
                      {assignments.filter(a => {
                        const student = findStudentByName(a.etudiant1);
                        return student?.section === section;
                      }).length} projets attribués
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignments
                        .filter(a => {
                          const student = findStudentByName(a.etudiant1);
                          return student?.section === section;
                        })
                        .sort((a, b) => {
                          const studentA = findStudentByName(a.etudiant1);
                          const studentB = findStudentByName(b.etudiant1);
                          return (studentA?.ordreMerite || 0) - (studentB?.ordreMerite || 0);
                        })
                        .map((assignment, index) => {
                          const student = findStudentByName(assignment.etudiant1);
                          const partner = assignment.etudiant2 ? 
                            findStudentByName(assignment.etudiant2) : null;
                          const project = projects.find(p => p.titre === assignment.sujet);
                          
                          return (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{assignment.etudiant1}</h3>
                                  <div className="text-sm text-slate-500 mt-1">
                                    {student?.cne} • Moyenne: {student?.moyenne} (Mérite: #{student?.ordreMerite})
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleRemoveAssignment(assignment.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Projet attribué</p>
                                  <p className="text-sm text-slate-600">{assignment.sujet}</p>
                                  <p className="text-sm text-slate-500 mt-1">
                                    {assignment.enseignant && (
                                      <>
                                        <User className="h-3.5 w-3.5 inline mr-1" />
                                        {assignment.enseignant} • 
                                      </>
                                    )}
                                    {project?.domaine} • Type: {assignment.etudiant2 ? "Binôme" : "Individuel"}
                                  </p>
                                </div>
                                <div className="flex items-end justify-end">
                                  <Badge variant="outline">Attribué le: {new Date(assignment.dateAffectation).toLocaleDateString()}</Badge>
                                </div>
                              </div>
                              {partner && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-sm font-medium">Partenaire de binôme:</p>
                                  <p className="text-sm text-slate-600">
                                    {partner.prenom} {partner.nom} ({partner.cne}) - Moyenne: {partner.moyenne} (Mérite: #{partner.ordreMerite})
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Dialog for project validation */}
      <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider le projet étudiant</DialogTitle>
            <DialogDescription>
              Attribuez un encadrant et validez le projet proposé par l'étudiant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="font-medium">{selectedProjectToValidate?.titre}</p>
              <p className="text-sm text-slate-600">{selectedProjectToValidate?.domaine}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Description:</p>
              <p className="text-sm text-slate-600">
                {students.find(s => s.id === selectedProjectToValidate?.idEtudiantProposant)?.sujetPropose?.description}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Proposé par:</p>
              <p className="text-sm text-slate-600">
                {students.find(s => s.id === selectedProjectToValidate?.idEtudiantProposant)?.prenom} {students.find(s => s.id === selectedProjectToValidate?.idEtudiantProposant)?.nom}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Encadrant proposé:</p>
              <p className="text-sm text-slate-600">
                {students.find(s => s.id === selectedProjectToValidate?.idEtudiantProposant)?.sujetPropose?.encadrantPropose || "Non spécifié"}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Encadrant attribué:</p>
              <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un encadrant" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map(supervisor => (
                    <SelectItem key={supervisor.id} value={`${supervisor.prenom} ${supervisor.nom}`}>
                      {supervisor.prenom} {supervisor.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleValidateProject(selectedProjectToValidate!, "Rejeté")}
            >
              Rejeter
            </Button>
            <Button 
              onClick={() => handleValidateProject(selectedProjectToValidate!, "Validé")}
              disabled={!selectedSupervisor}
            >
              Valider et attribuer l'encadrant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )}