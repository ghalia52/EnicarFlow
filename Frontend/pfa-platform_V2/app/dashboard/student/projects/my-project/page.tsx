"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, User, Clock, AlertCircle, CheckCircle, Upload, 
  Loader2, Info, Calendar, Layers, GraduationCap, DownloadCloud, 
  BarChart4, Bookmark, BookOpen
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// HTTPS URL for production, HTTP for local development
const API_BASE = "http://localhost:8082/api"

// Configure axios with default settings
axios.defaults.timeout = 10000; // 10 seconds timeout
axios.defaults.headers.common['Accept'] = 'application/json';

interface UploadedDocument {
  id: number;
  nom: string;
  type: string;
  status: string;
  dateUpload: string;
  etudiantId: number;
  stageId: number;
}

interface Projet {
  id: number;
  titre: string;
  description: string;
  domaine: string;
  difficulte: string;
  technologies: string[];
}

interface Affectation {
  id: number;
  etudiant1: string;
  etudiant2?: string;
  sujet: string;
  enseignant: string;
  dateAffectation: string;
}

export default function MyProject() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projectData, setProjectData] = useState<any>(null)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState("RAPPORT_AVANCEMENT")
  const [studentId, setStudentId] = useState<number | null>(null)
  const [affectation, setAffectation] = useState<Affectation | null>(null)
  const [activeTab, setActiveTab] = useState("apercu")

  // Get student ID
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("userId")
    if (stored) setStudentId(Number(stored))
    else console.warn("No userId in localStorage")
  }, [])

  // Fetch data
  useEffect(() => {
    const fetchStudentProject = async () => {
      if (!studentId) return
      try {
        setLoading(true)
        setError(null)
        
        try {
          const { data: aff } = await axios.get<Affectation>(`${API_BASE}/affectations/etudiant/${studentId}`)
          setAffectation(aff)
        } catch (err: any) {
          console.error("Failed to fetch affectation:", err)
          throw new Error("Impossible de récupérer les données d'affectation")
        }

        let proj = null
        try {
          const { data: allProjects } = await axios.get<Projet[]>(`${API_BASE}/projets`)
          proj = allProjects.find(p => p.titre === affectation?.sujet)
        } catch (err: any) {
          console.error("Failed to fetch projects:", err)
          throw new Error("Impossible de récupérer les données des projets")
        }

        let docs: UploadedDocument[] = []
        try {
          if (affectation) {
            const { data } = await axios.get<UploadedDocument[]>(`${API_BASE}/documents/stage/${affectation.id}`)
            docs = data
            setDocuments(data)
          }
        } catch (err: any) {
          console.error("Failed to fetch documents:", err)
          throw new Error("Impossible de récupérer les documents")
        }

        setProjectData({
          id: proj?.id,
          title: affectation?.sujet || "Non disponible",
          supervisor: affectation?.enseignant || "Non assigné",
          description: proj?.description || "Non disponible",
          domain: proj?.domaine || "Non spécifié",
          difficulty: proj?.difficulte || "Non spécifié",
          technologies: proj?.technologies || [],
          startDate: affectation ? new Date(affectation.dateAffectation).toLocaleDateString() : "Non défini",
          endDate: affectation ? new Date(new Date(affectation.dateAffectation).setMonth(new Date(affectation.dateAffectation).getMonth() + 3)).toLocaleDateString() : "Non défini",
          lastUpdate: docs.length > 0 
            ? new Date(Math.max(...docs.map(d => new Date(d.dateUpload).getTime()))).toLocaleDateString() 
            : affectation ? new Date(affectation.dateAffectation).toLocaleDateString() : "Jamais"
        })

      } catch (err: any) {
        console.error("Error fetching project data:", err)
        setError(err.response?.data?.message || err.message || "Une erreur est survenue lors du chargement du projet")
      } finally {
        setLoading(false)
      }
    }
    
    if (studentId) fetchStudentProject()
  }, [studentId, affectation?.id])

  const calculateProgress = () => {
    if (!documents.length) return 10
    const validated = documents.filter(d => d.status === 'VALIDE').length
    return Math.min(10 + Math.round((validated / 5) * 90), 100)
  }

  const getStatusBadge = () => {
    if (!documents.length) return <Badge variant="secondary" className="h-8 px-3 py-1 text-sm"><Clock className="mr-1 h-4 w-4" />En cours</Badge>
    if (documents.some(d => d.status === 'REFUSE')) return <Badge variant="destructive" className="h-8 px-3 py-1 text-sm"><AlertCircle className="mr-1 h-4 w-4" />Révision</Badge>
    if (documents.length >= 3 && documents.every(d => d.status === 'VALIDE')) return <Badge variant="default" className="bg-green-100 text-green-800 h-8 px-3 py-1 text-sm"><CheckCircle className="mr-1 h-4 w-4" />Validé</Badge>
    return <Badge variant="secondary" className="h-8 px-3 py-1 text-sm"><Clock className="mr-1 h-4 w-4" />En cours</Badge>
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null)
  }

  const handleUploadDocument = async () => {
    if (!selectedFile || !affectation || !studentId) {
      toast({ 
        title: 'Erreur', 
        description: 'Fichier, étudiant ou projet manquant', 
        variant: 'destructive' 
      })
      return
    }
    
    try {
      setUploading(true)
      const form = new FormData()
      form.append("file", selectedFile)
      form.append("type", documentType)
      form.append("stageId", String(affectation.id))
      form.append("etudiantId", String(studentId))

      const { data: newDoc } = await axios.post<UploadedDocument>(
        `${API_BASE}/documents/upload`, 
        form, 
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
          timeout: 30000 // Extended timeout for uploads
        }
      )

      setDocuments(prev => [...prev, newDoc])
      setProjectData((prev: any) => ({ ...prev, lastUpdate: new Date().toLocaleDateString() }))
      toast({ title: 'Document soumis', description: 'Votre document a été téléchargé avec succès.' })
      setShowUploadDialog(false)
      setSelectedFile(null)
    } catch (err: any) {
      console.error("Upload error:", err)
      let errorMessage = "Erreur lors du téléchargement du document"
      
      if (err.response) {
        // Server responded with an error
        errorMessage = err.response.data?.message || `Erreur ${err.response.status}: ${err.response.statusText}`
      } else if (err.request) {
        // Request was made but no response
        errorMessage = "Le serveur n'a pas répondu. Vérifiez votre connexion réseau."
      }
      
      toast({ 
        title: 'Échec du téléchargement', 
        description: errorMessage, 
        variant: 'destructive' 
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadDocument = async (docId: number) => {
    try {
      const res = await axios.get(`${API_BASE}/documents/${docId}/download`, { 
        responseType: 'blob',
        timeout: 30000 // Extended timeout for downloads
      })
      
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      const docItem = documents.find(d => d.id === docId)
      a.download = docItem?.nom || 'document'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url) // Clean up
    } catch (err: any) {
      console.error("Download error:", err)
      let errorMessage = "Impossible de télécharger le document"
      
      if (err.response) {
        errorMessage = `Erreur ${err.response.status}: ${err.response.statusText}`
      } else if (err.request) {
        errorMessage = "Le serveur n'a pas répondu. Vérifiez votre connexion réseau."
      }
      
      toast({ 
        title: 'Échec du téléchargement', 
        description: errorMessage, 
        variant: 'destructive' 
      })
    }
  }

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case "VALIDE": 
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "REFUSE": 
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: 
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "RAPPORT": 
        return <BookOpen className="h-4 w-4" />;
      case "PRESENTATION": 
        return <BarChart4 className="h-4 w-4" />;
      default: 
        return <FileText className="h-4 w-4" />;
    }
  }

  if (loading) return (
    <DashboardLayout userType="student">
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <span className="text-lg font-medium">Chargement du projet en cours...</span>
      </div>
    </DashboardLayout>
  )

  if (error) return (
    <DashboardLayout userType="student">
      <div className="flex flex-col items-center justify-center h-64 space-y-4 p-6 bg-red-50 rounded-lg">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <p className="text-xl font-bold text-red-700">Erreur de chargement</p>
        <p className="text-slate-700 text-center max-w-md">{error}</p>
        <Button 
          variant="default" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Réessayer
        </Button>
      </div>
    </DashboardLayout>
  )

  if (!projectData || projectData.title === "Non disponible" && !affectation?.id) {
    return (
  <DashboardLayout userType="student">
      <div className="container mx-auto px-4 py-8">
        <Card className="border-l-4 border-l-amber-400 shadow-sm mb-6">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-amber-100 rounded-full">
              <Info className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <CardTitle>En attente d'affectation</CardTitle>
              <CardDescription>Votre projet sera bientôt disponible</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Vous n'avez pas encore de projet assigné. Les affectations sont en cours de traitement par l'équipe pédagogique.
            </p>
          </CardContent>
        </Card>
        
        <div className="w-full p-4">
        <div className="flex flex-col gap-4">
          {/* Étape 1 */}
          <div className="w-full bg-slate-50 rounded-lg p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="mt-1">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-700">1</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Attribution du projet</h4>
                <p className="text-sm text-slate-600">Recevez l'attribution de votre projet et les coordonnées de votre encadrant.</p>
              </div>
            </div>
          </div>
  
          {/* Étape 2 */}
          <div className="w-full bg-slate-50 rounded-lg p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="mt-1">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-700">2</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Première rencontre</h4>
                <p className="text-sm text-slate-600">Une fois votre projet attribué, planifiez une première rencontre avec votre encadrant.</p>
              </div>
            </div>
          </div>
  
          {/* Étape 3 */}
          <div className="w-full bg-slate-50 rounded-lg p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="mt-1">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-700">3</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Démarrage</h4>
                <p className="text-sm text-slate-600">Commencez à travailler sur votre projet en suivant les recommandations de votre encadrant.</p>
              </div>
            </div>
          </div>
  
          {/* Étape 4 */}
          <div className="w-full bg-slate-50 rounded-lg p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="mt-1">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-700">4</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Suivi régulier</h4>
                <p className="text-sm text-slate-600">Maintenez un contact régulier avec votre encadrant pour assurer le bon déroulement du projet.</p>
              </div>
            </div>
          </div>
  
          {/* Étape 5 */}
          <div className="w-full bg-slate-50 rounded-lg p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="mt-1">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-700">5</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Finalisation</h4>
                <p className="text-sm text-slate-600">Terminez votre projet et préparez la documentation finale pour la remise.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
    )
}
return (
  <DashboardLayout userType="student">
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="border-b pb-4">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projet de Fin d'Année</h1>
            <p className="text-slate-500 mt-1">Suivi et gestion de votre PFA</p>
          </div>
          
          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-white">
                {(affectation?.etudiant1?.[0] || localStorage.getItem("userName")?.[0] || "E").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{affectation?.etudiant1 || localStorage.getItem("userName") || "Étudiant"}</p>
              <p className="text-xs text-slate-500">
                {localStorage.getItem("userRole") || "Étudiant"} • {projectData.domain}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4">
        {/* Project Header Card */}
        <Card className="mb-6 border-l-4 border-l-primary shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-slate-900">{projectData.title}</CardTitle>
                <CardDescription className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Encadré par <span className="font-medium ml-1">{projectData.supervisor}</span>
                </CardDescription>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          
          <CardContent className="pb-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-3">
              <div className="space-y-1">
                <div className="text-sm text-slate-500 flex items-center">
                  <Layers className="h-4 w-4 mr-1" /> Domaine
                </div>
                <Badge variant="outline" className="bg-slate-50 text-slate-700">
                  {projectData.domain}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-slate-500 flex items-center">
                  <Bookmark className="h-4 w-4 mr-1" /> Difficulté
                </div>
                <Badge variant="outline" className={`
                  ${projectData.difficulty === 'Facile' ? 'bg-green-50 text-green-700 border-green-200' : 
                    projectData.difficulty === 'Moyen' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    'bg-red-50 text-red-700 border-red-200'}
                `}>
                  {projectData.difficulty}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-slate-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Période
                </div>
                <p className="text-sm">
                  {projectData.startDate} - {projectData.endDate}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-slate-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> Dernière mise à jour
                </div>
                <p className="text-sm">
                  {projectData.lastUpdate}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progression du projet</span>
                <span className="text-sm font-bold">{calculateProgress()}%</span>
              </div>
              <Progress 
                value={calculateProgress()} 
                className="h-2"
                style={{
                  background: 'linear-gradient(to right, #f59e0b, #10b981)',
                  borderRadius: '9999px'
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Tabbed Content */}
        <Tabs defaultValue="apercu" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="apercu">Aperçu</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="ressources">Conseils</TabsTrigger>
          </TabsList>
          
          {/* Aperçu Tab */}
          <TabsContent value="apercu" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description du projet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{projectData.description}</p>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Technologies utilisées</h4>
                  <div className="flex flex-wrap gap-2">
                    {projectData.technologies && projectData.technologies.length > 0 ? (
                      projectData.technologies.map((tech: string, index: number) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {tech}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">Non spécifiées</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents récents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-slate-500">Aucun document soumis</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.slice(0, 3).map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                          <div className="flex items-center">
                            {getDocumentStatusIcon(doc.status)}
                            <div className="ml-3">
                              <p className="font-medium text-sm">{doc.nom}</p>
                              <p className="text-xs text-slate-500">{new Date(doc.dateUpload).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {doc.type}
                          </Badge>
                        </div>
                      ))}
                      {documents.length > 3 && (
                        <Button 
                          variant="ghost" 
                          className="w-full text-sm mt-2"
                          onClick={() => setActiveTab("documents")}
                        >
                          Voir tous les documents
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    Échéances importantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 rounded-lg bg-slate-50">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <FileText className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Rapport d'avancement</p>
                        <p className="text-xs text-slate-500">À soumettre avant le {
                          new Date(new Date(projectData.startDate).setDate(new Date(projectData.startDate).getDate() + 30)).toLocaleDateString()
                        }</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-lg bg-slate-50">
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <BarChart4 className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Présentation intermédiaire</p>
                        <p className="text-xs text-slate-500">À soumettre avant le {
                          new Date(new Date(projectData.startDate).setDate(new Date(projectData.startDate).getDate() + 45)).toLocaleDateString()
                        }</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-lg bg-slate-50">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <BookOpen className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Rapport final</p>
                        <p className="text-xs text-slate-500">À soumettre avant le {projectData.endDate}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents du projet</CardTitle>
                <Button 
                  onClick={() => setShowUploadDialog(true)}
                  className="flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Soumettre un document
                </Button>
              </CardHeader>
              
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed flex flex-col items-center">
                    <FileText className="h-16 w-16 text-slate-400 mb-4" />
                    <p className="text-lg font-medium text-slate-700">Aucun document soumis</p>
                    <p className="text-slate-500 max-w-md mt-2">
                      Vous n'avez pas encore soumis de document pour ce projet. 
                      Cliquez sur "Soumettre un document" pour commencer.
                    </p>
                    <Button 
                      onClick={() => setShowUploadDialog(true)}
                      className="mt-4"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Soumettre un document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full 
                            ${doc.status === "VALIDE" ? "bg-green-100" :
                             doc.status === "REFUSE" ? "bg-red-100" : "bg-amber-100"}`
                          }>
                            {getDocumentStatusIcon(doc.status)}
                          </div>
                          <div>
                            <p className="font-medium">{doc.nom}</p>
                            <div className="flex text-xs text-slate-500 space-x-3 mt-1">
                              <span className="flex items-center">
                                {getDocumentTypeIcon(doc.type)}
                                <span className="ml-1">{doc.type}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(doc.dateUpload || "").toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Info className="h-3 w-3 mr-1" />
                                {doc.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="flex items-center"
                          onClick={() => handleDownloadDocument(doc.id)}
                        >
                          <DownloadCloud className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Détails du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Description complète</h3>
                  <p className="text-slate-700 leading-relaxed">{projectData.description}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Affectation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-500">Étudiant(s)</p>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/80 text-white text-xs">
                            {(affectation?.etudiant1?.[0] || "E").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{affectation?.etudiant1}</span>
                      </div>
                      {affectation?.etudiant2 && (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/80 text-white text-xs">
                              {(affectation?.etudiant2?.[0] || "E").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{affectation?.etudiant2}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-slate-500">Encadrant</p>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-amber-500 text-white text-xs">
                            {(projectData.supervisor?.[0] || "P").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span>{projectData.supervisor}</span>
                          <p className="text-xs text-slate-500">Encadrant du projet</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Technologies</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {projectData.technologies && projectData.technologies.length > 0 ? (
                      projectData.technologies.map((tech: string, index: number) => (
                        <div 
                          key={index} 
                          className="bg-slate-50 p-3 rounded-lg flex items-center justify-center text-center"
                        >
                          <span>{tech}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 col-span-4">Technologies non spécifiées</span>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Calendrier du projet</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-blue-700" />
                        </div>
                        <span>Date de démarrage</span>
                      </div>
                      <span className="font-medium">{projectData.startDate}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-red-700" />
                        </div>
                        <span>Date de fin</span>
                      </div>
                      <span className="font-medium">{projectData.endDate}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <Clock className="h-5 w-5 text-amber-700" />
                        </div>
                        <span>Dernière mise à jour</span>
                      </div>
                      <span className="font-medium">{projectData.lastUpdate}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Ressources Tab */}
          <TabsContent value="ressources">
            <Card>
              <CardHeader>
                <CardTitle>Conseils pour réussir votre projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
               
                
                <div>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Respect des délais
                      </h4>
                      <p className="text-sm text-slate-600 mt-1 ml-6">
                        Planifiez votre travail et respectez les échéances imposées pour chaque livrable.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Documentation régulière
                      </h4>
                      <p className="text-sm text-slate-600 mt-1 ml-6">
                        Documentez votre progression et vos choix techniques tout au long du projet.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Communication avec l'encadrant
                      </h4>
                      <p className="text-sm text-slate-600 mt-1 ml-6">
                        N'hésitez pas à communiquer régulièrement avec votre encadrant pour obtenir des conseils.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    
    {/* Upload Document Dialog */}
    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Soumettre un document</DialogTitle>
          <DialogDescription>
            Téléchargez un nouveau document pour votre projet. Votre encadrant pourra le consulter et le valider.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="documentType" className="font-medium">Type de document</Label>
            <select 
              id="documentType"
              className="w-full p-2.5 border rounded-md bg-white" 
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option value="RAPPORT_AVANCEMENT">Rapport d'avancement</option>
              <option value="RAPPORT">Rapport final</option>
              <option value="PRESENTATION">Présentation</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Sélectionnez le type de document que vous souhaitez soumettre</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file" className="font-medium">Fichier</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <Input 
                id="file" 
                type="file" 
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Cliquez pour sélectionner un fichier</p>
                <p className="text-xs text-slate-500 mt-1">ou déposez votre fichier ici</p>
              </label>
            </div>
            {selectedFile && (
              <div className="flex items-center p-2 mt-2 bg-blue-50 rounded-lg text-sm">
                <FileText className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium mr-1">{selectedFile.name}</span>
                <span className="text-slate-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowUploadDialog(false)}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleUploadDocument}
            disabled={!selectedFile || uploading}
            className="min-w-[120px]"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Soumettre
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DashboardLayout>
)
}