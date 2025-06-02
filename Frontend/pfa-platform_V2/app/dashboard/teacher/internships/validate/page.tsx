"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Download, FileText, Search, User, X } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

// DTO from backend
interface DocumentDTO {
  id: number
  nom: string
  type: "RAPPORT_STAGE" | "POSTER" | "ATTESTATION"
  status: "En attente" | "Validé" | string
  dateUpload: string    // YYYY-MM-DD
  etudiantId: number
  stageId: number
  nomFichier: string    // path with backslashes
}

// UI shape with stageId
interface Internship {
  id: string
  etudiantId: number
  stageId: number
  fileName: string
  type: "Rapport" | "Poster" | "Attestation"
  submissionDate: string
  status: "En attente" | "Validé" | string
  downloadUrl: string
}

export default function ValidateInternships() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "Rapport_STAGE" | "Poster" | "Attestation">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "En attente" | "Validé" | string>("all")
  const [selected, setSelected] = useState<Internship | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch documents on mount
  useEffect(() => {
    fetch("http://localhost:8082/api/documents/with-stage")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<DocumentDTO[]>
      })
      .then(docs => {
        // Map to UI shape
        const items: Internship[] = docs.map(d => ({
          id: String(d.id),
          etudiantId: d.etudiantId,
          stageId: d.stageId,
          fileName: d.nom,
          type: d.type === "RAPPORT_STAGE" ? "Rapport" : d.type === "POSTER" ? "Poster" : "Attestation",
          submissionDate: new Date(d.dateUpload).toLocaleDateString("fr-FR"),
          status: d.status,
          downloadUrl: `http://localhost:8082/api/documents/${d.id}/download`,
        }))
        setInternships(items)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Handle dialog close - reset selected item
  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  // Cleanup selected state when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setTimeout(() => {
        setSelected(null)
      }, 300) // Clear after close animation
    }
  }, [isDialogOpen])

  if (loading) {
    return (
      <DashboardLayout userType="teacher">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Chargement des documents...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userType="teacher">
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-600">
          <h3 className="font-bold mb-2">Erreur de chargement</h3>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  // Filters
  const filtered = internships.filter(i => {
    const matchSearch = searchTerm === "" || 
      i.id.includes(searchTerm) ||
      String(i.stageId).includes(searchTerm)
    const matchType = typeFilter === "all" || i.type === typeFilter
    const matchStatus = statusFilter === "all" || i.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  // Actions
  const validate = (id: string) => {
    fetch(`http://localhost:8082/api/documents/${id}/validate`, { method: 'PUT' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setInternships(prev => prev.map(i => i.id === id ? {...i, status: 'Validé'} : i))
      })
      .catch(err => {
        setError(`Erreur lors de la validation: ${err.message}`)
      })
      .finally(() => setIsDialogOpen(false))
  }
  
  const reject = (id: string) => {
    fetch(`http://localhost:8082/api/documents/${id}/reject?reason=Refusé`, { method: 'PUT' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setInternships(prev => prev.map(i => i.id === id ? {...i, status: 'Rejeté'} : i))
      })
      .catch(err => {
        setError(`Erreur lors du rejet: ${err.message}`)
      })
      .finally(() => setIsDialogOpen(false))
  }

  // Filter by status for each tab
  const pendingInternships = filtered.filter(i => i.status === "En attente")
  const validatedInternships = filtered.filter(i => i.status === "Validé")
  const rejectedInternships = filtered.filter(i => i.status.startsWith("Rejeté"))

  return (
    <DashboardLayout userType="teacher">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between">
          <h1 className="text-3xl font-bold">Valider les documents</h1>
        </div>

        {error && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-600 flex items-center gap-2">
            <X className="h-5 w-5" />
            <p>{error}</p>
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => setError(null)}>
              Fermer
            </Button>
          </div>
        )}

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="validated">Validés</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés</TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending">
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Rechercher par ID ou stageId…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Rapport">Rapport</SelectItem>
                  <SelectItem value="Poster">Poster</SelectItem>
                  <SelectItem value="Attestation">Attestation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>En attente</CardTitle>
                <CardDescription>{pendingInternships.length} à traiter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingInternships.length > 0 ? (
                  pendingInternships.map(i => (
                    <div key={i.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{i.type} (Stage #{i.stageId})</h3>
                          <p className="text-sm text-slate-500">ID Doc : {i.id}</p>
                        </div>
                        <Badge>{i.status}</Badge>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-sm"><FileText className="inline-block mr-1 h-4 w-4"/> {i.submissionDate}</p>
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelected(i);
                          setIsDialogOpen(true);
                        }}>Détails</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500"/>
                    <p>Aucun document en attente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Validated */}
          <TabsContent value="validated">
            <Card>
              <CardHeader>
                <CardTitle>Validés</CardTitle>
                <CardDescription>{validatedInternships.length} documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {validatedInternships.length > 0 ? (
                  validatedInternships.map(i => (
                    <div key={i.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{i.type} (Stage #{i.stageId})</h3>
                        <p className="text-sm text-slate-500">ID Doc : {i.id}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Validé</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p>Aucun document validé</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rejected */}
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejetés</CardTitle>
                <CardDescription>{rejectedInternships.length} documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rejectedInternships.length > 0 ? (
                  rejectedInternships.map(i => (
                    <div key={i.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{i.type} (Stage #{i.stageId})</h3>
                        <p className="text-sm text-slate-500">ID Doc : {i.id}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p>Aucun document rejeté</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          {selected && (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selected.type} - Stage #{selected.stageId}</DialogTitle>
                <DialogDescription>Doc ID {selected.id} soumis le {selected.submissionDate}</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-2">
                <p>Étudiant ID : {selected.etudiantId}</p>
                <p>Nom fichier : {selected.fileName}</p>
              </div>
              <div className="mt-4">
                <a href={selected.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full">
                    <Download className="mr-1 h-4 w-4"/> Télécharger
                  </Button>
                </a>
              </div>
              <DialogFooter>
                {selected.status === "En attente" ? (
                  <>
                    <Button variant="outline" onClick={() => reject(selected.id)}>Rejeter</Button>
                    <Button onClick={() => validate(selected.id)}>Valider</Button>
                  </>
                ) : (
                  <Button onClick={handleDialogClose}>Fermer</Button>
                )}
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </DashboardLayout>
  )
}