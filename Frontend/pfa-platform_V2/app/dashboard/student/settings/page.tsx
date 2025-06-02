"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation" // Pour la redirection

const API_URL = "http://localhost:8082/api/etudiants"

export default function StudentSettings() {
  const [studentId, setStudentId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    motDePasseActuel: "",
    nouveauMotDePasse: "",
    confirmerMotDePasse: "",
  })
  
  const [studentData, setStudentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Récupération du studentId depuis le localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("userId")
    if (stored) {
      setStudentId(Number(stored))
    } else {
      console.warn("No userId in localStorage")
      // Rediriger vers la page de connexion si l'ID est manquant
      router.push("/login")
    }
  }, [])

  // Récupération des données de l'étudiant, mais seulement après que studentId soit défini
  useEffect(() => {
    if (!studentId) return // Ne pas faire l'appel API si studentId est inexistant

    const fetchStudentData = async () => {
      try {
        const response = await fetch(`${API_URL}/${studentId}`)
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des données : ${response.statusText}`)
        }

        const data = await response.json()
        setStudentData(data)
        setFormData({
          prenom: data.prenom || "",
          nom: data.nom || "",
          email: data.email || "",
          telephone: data.telephone || "",
          adresse: data.adresse || "",
          motDePasseActuel: "",
          nouveauMotDePasse: "",
          confirmerMotDePasse: "",
        })
        setIsLoading(false)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur inconnue"
        setError(message)
        setIsLoading(false)
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
      }
    }

    fetchStudentData()
  }, [studentId]) // Assurez-vous que l'effet se déclenche seulement après la mise à jour du studentId

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentId || !studentData) return

    try {
      const updatedStudent = {
        ...studentData,
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone,
        adresse: formData.adresse,
      }

      const response = await fetch(`${API_URL}/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour : ${response.statusText}`)
      }

      const data = await response.json()
      setStudentData(data)

      toast({
        title: "Succès",
        description: "Vos informations ont été mises à jour avec succès.",
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue"
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentId || !studentData) return

    if (formData.nouveauMotDePasse !== formData.confirmerMotDePasse) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    try {
      const loginResponse = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: studentData.email,
          motDePasse: formData.motDePasseActuel,
        }),
      })

      if (!loginResponse.ok) {
        throw new Error("Mot de passe actuel incorrect")
      }

      const updatedStudent = {
        ...studentData,
        motDePasse: formData.nouveauMotDePasse,
      }

      const response = await fetch(`${API_URL}/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour du mot de passe : ${response.statusText}`)
      }

      setFormData(prev => ({
        ...prev,
        motDePasseActuel: "",
        nouveauMotDePasse: "",
        confirmerMotDePasse: "",
      }))

      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour avec succès.",
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue"
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout userType="student">
        <div className="flex items-center justify-center h-full">
          <p>Chargement des données...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userType="student">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-red-500">Erreur: {error}</p>
            <Button onClick={() => window.location.href = "/login"}>
              Retourner à la page de connexion
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Paramètres du compte</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{`${studentData?.prenom} ${studentData?.nom}`}</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">{studentData?.section} - {studentData?.groupe}</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInfoSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email universitaire</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" name="telephone" type="tel" value={formData.telephone} onChange={handleChange} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input id="adresse" name="adresse" value={formData.adresse} onChange={handleChange} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Enregistrer les modifications</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="motDePasseActuel">Mot de passe actuel</Label>
                  <Input id="motDePasseActuel" name="motDePasseActuel" type="password" value={formData.motDePasseActuel} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nouveauMotDePasse">Nouveau mot de passe</Label>
                  <Input id="nouveauMotDePasse" name="nouveauMotDePasse" type="password" value={formData.nouveauMotDePasse} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmerMotDePasse">Confirmer le mot de passe</Label>
                  <Input id="confirmerMotDePasse" name="confirmerMotDePasse" type="password" value={formData.confirmerMotDePasse} onChange={handleChange} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Changer le mot de passe</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
