

"use client" // Add this line at the top

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText, User } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import Link from "next/link"

import axios from "axios"

interface StageDTO {
  id: number;
  etudiant: string;
  encadrantAcademique: string;
  entreprise: string;
  projet: string;
  dateDebut: string;
  dateFin: string;
  status: string;
  reportStatus: string;
}

export default function InternshipsOverview() {
  const [stages, setStages] = useState<StageDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    axios.get<StageDTO[]>("http://localhost:8082/api/stages")
      .then(res => {
        setStages(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError("Échec du chargement des stages")
        setLoading(false)
      })
  }, [])

  const filteredInternships = stages.filter((internship) => {
    const search = searchTerm.trim().toLowerCase()

    const etudiant = internship.etudiant?.toLowerCase() || ""
    const encadrantAcademique = internship.encadrantAcademique?.toLowerCase() || ""
    const entreprise = internship.entreprise?.toLowerCase() || ""
    const status = internship.status?.toLowerCase() || ""

    const matchesSearch =
      etudiant.includes(search) ||
      encadrantAcademique.includes(search) ||
      entreprise.includes(search)

    const matchesStatus = statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VALIDE":
        return <Badge className="bg-green-100 text-green-800">Validé</Badge> // Green for Validé
      case "EN_COURS":
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge> // Blue for En cours
      case "EN_ATTENTE":
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
      case "Annule":
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case "Soumis":
        return <Badge variant="outline" className="border-green-200 text-green-800">Soumis</Badge>
      case "Non soumis":
        return <Badge variant="outline" className="border-amber-200 text-amber-800">Non soumis</Badge>
      case "Non applicable":
        return <Badge variant="outline" className="border-slate-200 text-slate-800">Non applicable</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderInternshipCards = (internships: StageDTO[]) => {
    return internships.map((internship) => (
      <div key={internship.id} className="border rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{internship.etudiant}</h3>
            <div className="flex items-center text-sm text-slate-500 mt-1">
              <User className="h-3.5 w-3.5 mr-1" />
              {internship.encadrantAcademique} • {internship.entreprise}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(internship.status)}
            {getReportStatusBadge(internship.reportStatus)}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium">Projet</p>
            <p className="text-sm text-slate-600">{internship.projet}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Période</p>
            <p className="text-sm text-slate-600">{internship.dateDebut} - {internship.dateFin}</p>
          </div>
        </div>
      </div>
    ))
  }

  if (loading) return <p className="p-4">Chargement des stages...</p>
  if (error) return <p className="p-4 text-red-500">{error}</p>

  return (
    <DashboardLayout userType="director">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Vue d'ensemble des stages</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Prof. Rachid Benmokhtar</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">Directeur du Département Informatique</span>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="current">En cours</TabsTrigger>
            <TabsTrigger value="upcoming">À venir</TabsTrigger>
            <TabsTrigger value="completed">Terminés</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Rechercher un stage..."
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
                  <SelectItem value="Validé">Validé</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Annulé">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tous les stages</CardTitle>
                <CardDescription>{filteredInternships.length} stages trouvés</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredInternships.length > 0 ? (
                  <div className="space-y-4">{renderInternshipCards(filteredInternships)}</div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucun stage trouvé</h3>
                    <p className="text-sm text-slate-500">Aucun stage ne correspond à vos critères de recherche.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>En cours</CardTitle>
              </CardHeader>
              <CardContent>
                {renderInternshipCards(stages.filter(stage => stage.status === "EN_COURS"))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>À venir</CardTitle>
              </CardHeader>
              <CardContent>
                {renderInternshipCards(stages.filter(stage => stage.status === "EN_ATTENTE"))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Terminés</CardTitle>
              </CardHeader>
              <CardContent>
                {renderInternshipCards(stages.filter(stage => stage.status === "VALIDE"))}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  )
}
