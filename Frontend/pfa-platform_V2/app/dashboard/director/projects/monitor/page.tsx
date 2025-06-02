"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText, User, AlertCircle, Loader2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface ProjetProposeDTO {
  id: number
  titre: string
  description: string
  domaine: string
  difficulte: string
  technologies: string[]
  status: "Validé" | "Rejeté" | "En attente"
  dateProposition: string
}

interface ProjetEncadreDTO {
  id: number
  titre: string
  etudiant: string
  dateDebut: string
  dateFin: string
  progress: number
  domaine?: string // Ajout du domaine manquant
}

export default function MonitorProjects() {
  const [proposedProjects, setProposedProjects] = useState<ProjetProposeDTO[]>([])
  const [supervisedProjects, setSupervisedProjects] = useState<ProjetEncadreDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch proposed projects
        const proposedResponse = await fetch("http://localhost:8082/api/projets")
        if (!proposedResponse.ok) throw new Error("Failed to fetch proposed projects")
        const proposedData: ProjetProposeDTO[] = await proposedResponse.json()
        
        // Fetch supervised projects
        const supervisedResponse = await fetch("http://localhost:8082/api/projets/encadres")
        if (!supervisedResponse.ok) throw new Error("Failed to fetch supervised projects")
        const supervisedData: ProjetEncadreDTO[] = await supervisedResponse.json()
        
        setProposedProjects(proposedData)
        setSupervisedProjects(supervisedData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Failed to fetch data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Combine both types of projects for display with unique keys
  const allProjects = [
    ...proposedProjects.map(p => ({
      id: `proposed-${p.id}`,
      type: 'proposed' as const,
      data: p
    })),
    ...supervisedProjects.map(p => ({
      id: `supervised-${p.id}-${p.titre.substring(0, 5)}`, // Added the title substring to make keys more unique
      type: 'supervised' as const,
      data: p
    }))
  ]

  const filteredProjects = allProjects.filter(({ data, type }) => {
    const matchesSearch =
      data.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (type === 'supervised' && data.etudiant?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (data.domaine?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || 
      (type === 'proposed' ? data.status === statusFilter : 
       (data.progress < 100 ? "En cours" : "Terminé") === statusFilter);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (project: typeof allProjects[0]) => {
    if (project.type === 'proposed') {
      switch (project.data.status) {
        case "Validé": return <Badge className="bg-green-100 text-green-800">Validé</Badge>
        case "Rejeté": return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
        case "En attente": return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
        default: return <Badge variant="outline">Inconnu</Badge>
      }
    } else {
      return project.data.progress >= 100 
        ? <Badge className="bg-green-100 text-green-800">Terminé</Badge>
        : <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500"
    if (progress < 70) return "bg-amber-500"
    return "bg-green-500"
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Date invalide"
      }
      return date.toLocaleDateString('fr-FR')
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Date invalide"
    }
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout userType="director">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 text-slate-300 animate-spin mb-4" />
          <h3 className="text-lg font-medium">Chargement des projets...</h3>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout userType="director">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur</h3>
          <p className="text-sm text-slate-500">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="director">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Suivi des projets</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Prof. Rachid Benmokhtar</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">Directeur du Département Informatique</span>
          </div>
        </div>

        <Tabs defaultValue="all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="proposed">Proposés</TabsTrigger>
              <TabsTrigger value="supervised">Encadrés</TabsTrigger>
            </TabsList>
            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Rechercher un projet..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Validé">Validé</SelectItem>
                  <SelectItem value="Rejeté">Rejeté</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Terminé">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tous les projets</CardTitle>
                <CardDescription>{filteredProjects.length} projets trouvés</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{project.data.titre}</h3>
                          <div className="text-sm text-slate-500 mt-1">
                            {project.type === 'supervised' ? (
                              <>
                                <User className="inline h-3.5 w-3.5 mr-1" />
                                {project.data.etudiant}
                              </>
                            ) : (
                              project.data.domaine
                            )}
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(project)}
                        </div>
                      </div>

                      {project.type === 'proposed' && (
                        <div className="mt-2">
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {project.data.description}
                          </p>
                        </div>
                      )}

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progression</span>
                          <span>
                            {project.type === 'supervised' 
                              ? `${project.data.progress}%` 
                              : project.data.status === "Validé" 
                                ? "Prêt pour encadrement" 
                                : project.data.status === "Rejeté"
                                  ? "Rejeté"
                                  : "En attente"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              project.type === 'supervised' 
                                ? getProgressColor(project.data.progress)
                                : project.data.status === "Validé" 
                                  ? "bg-green-500" 
                                  : project.data.status === "Rejeté"
                                    ? "bg-red-500"
                                    : "bg-amber-500"
                            }`}
                            style={{
                              width: project.type === 'supervised' 
                                ? `${project.data.progress}%` 
                                : project.data.status === "Validé" || project.data.status === "Rejeté"
                                  ? "100%" 
                                  : "30%"
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">Période</p>
                          <p className="text-sm text-slate-600">
                            {project.type === 'supervised'
                              ? `${formatDate(project.data.dateDebut)} - ${formatDate(project.data.dateFin)}`
                              : `Proposé le ${formatDate(project.data.dateProposition)}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {project.type === 'proposed' ? "Technologies" : "Domaine"}
                          </p>
                          <p className="text-sm text-slate-600">
                            {project.type === 'proposed'
                              ? (project.data.technologies?.join(', ') || "Non spécifiées")
                              : (project.data.domaine || project.data.titre)}
                          </p>
                        </div>
                        <div className="flex items-end justify-end">
                          <Button variant="outline" size="sm">
                            Voir les détails
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
                    <p className="text-sm text-slate-500">
                      Aucun projet ne correspond à vos critères de recherche.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposed" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Projets proposés</CardTitle>
                <CardDescription>
                  {proposedProjects.filter(p => statusFilter === "all" || p.status === statusFilter).length} projets proposés par les étudiants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {proposedProjects
                  .filter(p => 
                    (statusFilter === "all" || p.status === statusFilter) && 
                    (p.titre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     p.domaine?.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .length > 0 ? (
                    proposedProjects
                      .filter(p => 
                        (statusFilter === "all" || p.status === statusFilter) && 
                        (p.titre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.domaine?.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((project) => (
                        <div key={`proposed-${project.id}`} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{project.titre}</h3>
                              <div className="text-sm text-slate-500 mt-1">
                                {project.domaine} • {project.difficulte}
                              </div>
                            </div>
                            <div>
                              {getStatusBadge({ id: `proposed-${project.id}`, type: 'proposed', data: project })}
                            </div>
                          </div>

                          <div className="mt-2">
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {project.description}
                            </p>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Statut</span>
                              <span>{project.status}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  project.status === "Validé" ? "bg-green-500" :
                                  project.status === "Rejeté" ? "bg-red-500" : "bg-amber-500"
                                }`}
                                style={{
                                  width: project.status === "Validé" || project.status === "Rejeté" ? "100%" : "30%"
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium">Date de proposition</p>
                              <p className="text-sm text-slate-600">
                                {formatDate(project.dateProposition)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Technologies</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {project.technologies && project.technologies.length > 0 ? 
                                  project.technologies.map((tech, i) => (
                                    <Badge key={`${project.id}-tech-${i}`} variant="outline">{tech}</Badge>
                                  )) : 
                                  <span className="text-sm text-slate-500">Non spécifiées</span>
                                }
                              </div>
                            </div>
                            <div className="flex items-end justify-end">
                              <Button variant="outline" size="sm">
                                Voir les détails
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucun projet proposé</h3>
                      <p className="text-sm text-slate-500">
                        Aucun projet ne correspond à vos critères de recherche.
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supervised" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Projets encadrés</CardTitle>
                <CardDescription>
                  {supervisedProjects.filter(p => 
                    (statusFilter === "all" || 
                     (statusFilter === "En cours" && p.progress < 100) ||
                     (statusFilter === "Terminé" && p.progress >= 100)) &&
                    (p.titre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     p.etudiant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     (p.domaine?.toLowerCase().includes(searchTerm.toLowerCase())))
                  ).length} projets en cours d'encadrement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {supervisedProjects
                  .filter(p => 
                    (statusFilter === "all" || 
                     (statusFilter === "En cours" && p.progress < 100) ||
                     (statusFilter === "Terminé" && p.progress >= 100)) &&
                    (p.titre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     p.etudiant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     (p.domaine?.toLowerCase().includes(searchTerm.toLowerCase())))
                  )
                  .length > 0 ? (
                    supervisedProjects
                      .filter(p => 
                        (statusFilter === "all" || 
                         (statusFilter === "En cours" && p.progress < 100) ||
                         (statusFilter === "Terminé" && p.progress >= 100)) &&
                        (p.titre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.etudiant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (p.domaine?.toLowerCase().includes(searchTerm.toLowerCase())))
                      )
                      .map((project) => (
                        <div key={`supervised-${project.id}-${project.etudiant.substring(0, 3)}`} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{project.titre}</h3>
                              <div className="text-sm text-slate-500 mt-1">
                                <User className="inline h-3.5 w-3.5 mr-1" />
                                {project.etudiant}
                              </div>
                            </div>
                            <div>
                              {getStatusBadge({ id: `supervised-${project.id}-${project.etudiant.substring(0, 3)}`, type: 'supervised', data: project })}
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progression</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${getProgressColor(project.progress)}`}
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium">Période</p>
                              <p className="text-sm text-slate-600">
                                {formatDate(project.dateDebut)} - {formatDate(project.dateFin)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Domaine</p>
                              <p className="text-sm text-slate-600">
                                {project.domaine || "Non spécifié"}
                              </p>
                            </div>
                            <div className="flex items-end justify-end">
                              <Button variant="outline" size="sm">
                                Voir les détails
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucun projet encadré</h3>
                      <p className="text-sm text-slate-500">
                        Aucun projet ne correspond à vos critères de recherche.
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}