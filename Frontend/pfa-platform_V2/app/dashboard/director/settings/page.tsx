"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"

export default function DirectorSettings() {
  const [formData, setFormData] = useState({
    department: "Informatique",
    academicYear: "2024-2025",
    internshipStartDate: "2025-06-01",
    internshipEndDate: "2025-08-31",
    minInternshipDuration: 8,
    maxStudentsPerSupervisor: 5,
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
    <DashboardLayout userType="director">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Paramètres du Directeur</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Prof. Rachid Benmokhtar</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">Directeur du Département Informatique</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration des stages</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYear">Année académique</Label>
                  <Select
                    value={formData.academicYear}
                    onValueChange={(value) => handleSelectChange("academicYear", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une année" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-2024">2023-2024</SelectItem>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internshipStartDate">Date de début des stages</Label>
                  <Input
                    id="internshipStartDate"
                    name="internshipStartDate"
                    type="date"
                    value={formData.internshipStartDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internshipEndDate">Date de fin des stages</Label>
                  <Input
                    id="internshipEndDate"
                    name="internshipEndDate"
                    type="date"
                    value={formData.internshipEndDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minInternshipDuration">Durée minimale (semaines)</Label>
                  <Input
                    id="minInternshipDuration"
                    name="minInternshipDuration"
                    type="number"
                    min="4"
                    max="12"
                    value={formData.minInternshipDuration}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStudentsPerSupervisor">Étudiants max/superviseur</Label>
                  <Input
                    id="maxStudentsPerSupervisor"
                    name="maxStudentsPerSupervisor"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxStudentsPerSupervisor}
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
      </div>
    </DashboardLayout>
  )
}