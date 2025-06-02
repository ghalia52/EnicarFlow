"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [userType, setUserType] = useState<"student" | "teacher" | "director">("student")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !motDePasse) {
      setError("Veuillez remplir tous les champs.")
      return
    }

    setLoading(true)
    try {
      // Call the unified login endpoint
      const response = await axios.post(
        "http://localhost:8082/api/login",
        { email, motDePasse },
        { headers: { "Content-Type": "application/json" } }
      )
      
      const { userId, userType: authenticatedUserType } = response.data
      console.log("Login succeeded, user ID =", userId, "type =", authenticatedUserType)

      // Store both userType and userId for later API calls
      localStorage.setItem("userType", authenticatedUserType)
      localStorage.setItem("userId", String(userId))

      // Redirect based on the authenticated user type returned from the server
      switch (authenticatedUserType) {
        case "student":
          router.push("/dashboard/student")
          break
        case "teacher":
          router.push("/dashboard/teacher")
          break
        case "director":
          router.push("/dashboard/director")
          break
        default:
          setError("Type d'utilisateur non reconnu.")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      if (err.response?.status === 401) {
        setError("Email ou mot de passe invalide.")
      } else {
        setError("Une erreur est survenue, veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
          <CardDescription className="text-center">
            Entrez vos identifiants pour accéder à votre espace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@enicar.ucart.tn"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={motDePasse}
                onChange={e => setMotDePasse(e.target.value)}
                required
              />
            </div>

        

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Chargement..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            Retour à l'accueil
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}