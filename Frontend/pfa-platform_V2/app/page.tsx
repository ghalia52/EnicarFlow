import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 flex flex-col">
      {/* Header modernisé */}
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative w-[100px] h-[60px]">
              <Image
                src="/logo.png"
                alt="ENICARPROFLOW Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent hidden sm:block">
              ENICARPROFLOW
            </h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white">
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section améliorée */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Plateforme de Suivi d'affectation et déroulement des Projets de Fin d'Année et des Stages
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Une solution complète pour la gestion des projets de fin d'année et des stages
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal avec cartes améliorées */}
      <main className="flex-1 container mx-auto py-12 px-4">
        <h3 className="text-2xl font-semibold text-center mb-10 text-slate-800">
          Notre plateforme s'adapte à tous les utilisateurs
        </h3>

        {/* Cartes des fonctionnalités avec design amélioré */}
        <div className="grid md:grid-cols-3 gap-8 mt-6">
          {/* Carte Étudiant */}
          <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mb-2 flex justify-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-center">Pour les Étudiants</CardTitle>
              <CardDescription className="text-center">Gérez vos projets et stages efficacement</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Choisissez vos sujets de PFA préférés
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Suivez l'avancement de votre projet
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Communiquez avec votre encadrant
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Soumettez vos rapports et documents
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Espace Étudiant</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Carte Enseignant */}
          <Card className="border-t-4 border-t-indigo-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mb-2 flex justify-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
              </div>
              <CardTitle className="text-center">Pour les Enseignants</CardTitle>
              <CardDescription className="text-center">Proposez et encadrez des projets</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Proposez des sujets de PFA
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Suivez l'avancement des projets encadrés
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Validez les étapes de progression
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Évaluez les rapports et posters
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Espace Enseignant</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Carte Direction */}
          <Card className="border-t-4 border-t-purple-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mb-2 flex justify-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </div>
              </div>
              <CardTitle className="text-center">Pour la Direction</CardTitle>
              <CardDescription className="text-center">Supervisez l'ensemble des projets</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Validez les sujets proposés
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Affectez les projets selon l'ordre de mérite
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Supervisez l'avancement global
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Générez des rapports et statistiques
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Espace Direction</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Section stats */}
        <div className="mt-20 py-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg text-white">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold text-center mb-10">Notre plateforme en chiffres</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold mb-2">250+</p>
                <p className="text-blue-100">Projets réalisés</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">120+</p>
                <p className="text-blue-100">Enseignants encadrants</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">500+</p>
                <p className="text-blue-100">Étudiants actifs</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">30+</p>
                <p className="text-blue-100">Partenaires industriels</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer amélioré */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative w-[60px] h-[40px] mr-2">
                <Image
                  src="/logo.png"
                  alt="ENICARPROFLOW Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-slate-800">ENICARPROFLOW</span>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-600 hover:text-blue-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 6c0-.667-.333-1-1-1h-2.333c-.111 0-.167-.056-.167-.167v-2.5c0-.667-.333-1-1-1h-3c-.667 0-1 .333-1 1v2.5c0 .111-.056.167-.167.167h-2.333c-.667 0-1 .333-1 1v2.5c0 .111.056.167.167.167h2.333c.111 0 .167.056.167.167v6.666c0 .111-.056.167-.167.167h-2.333c-.667 0-1 .333-1 1v2.5c0 .111.056.167.167.167h2.333c.111 0 .167.056.167.167v2.5c0 .667.333 1 1 1h3c.667 0 1-.333 1-1v-2.5c0-.111.056-.167.167-.167h2.333c.111 0 .167-.056.167-.167v-2.5c0-.667-.333-1-1-1h-2.333c-.111 0-.167-.056-.167-.167v-6.666c0-.111.056-.167.167-.167h2.333c.111 0 .167-.056.167-.167v-2.5z" />
                </svg>
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3c0-1.8-1.13-2.67-2.83-2.67-1.3 0-1.9.7-2.27 1.4v-1.2h-2.5v7.7h2.5v-4.17c0-.9.67-1.43 1.47-1.43.8 0 1.13.6 1.13 1.4v4.2h2.5M6.5 8.3h2.5v7.7h-2.5V8.3z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-slate-600">
            <p>© {new Date().getFullYear()} ENICARPROFLOW - Plateforme de Suivi des Projets de Fin d'Année et des Stages</p>
          </div>
        </div>
      </footer>
    </div>
  )
}