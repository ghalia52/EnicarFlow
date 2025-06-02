"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"

export default function TeacherSettings() {
  const [formData, setFormData] = useState({
    firstName: "Mohammed",
    lastName: "Alaoui",
    email: "m.alaoui@univ.edu",
    phone: "0612345678",
    department: "Informatique",
    position: "Professeur",
    office: "Bâtiment A, Bureau 203",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Settings saved:", formData)
  }

  return (
    <DashboardLayout userType="teacher">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Paramètres du compte</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Dr. Mohammed Alaoui</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">Professeur</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations professionnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email universitaire</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleSelectChange("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Informatique">Informatique</SelectItem>
                      <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                      <SelectItem value="Physique">Physique</SelectItem>
                      <SelectItem value="Chimie">Chimie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Poste</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => handleSelectChange("position", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un poste" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professeur">Professeur</SelectItem>
                      <SelectItem value="Maître de conférences">Maître de conférences</SelectItem>
                      <SelectItem value="Chargé de cours">Chargé de cours</SelectItem>
                      <SelectItem value="Chercheur">Chercheur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="office">Bureau</Label>
                  <Input
                    id="office"
                    name="office"
                    value={formData.office}
                    onChange={handleChange}
                  />
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Mettre à jour le mot de passe</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}