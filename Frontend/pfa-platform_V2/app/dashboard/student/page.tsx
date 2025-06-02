"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Users,
  Briefcase,
  BookOpen,
  Tag,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

const API_BASE_URL = "http://localhost:8082/api";

interface Etudiant {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  filiere: string;
  niveau: string;
}

interface Stage {
  id: number;
  entreprise: string;
  projet: string;
  dateDebut?: string;
  dateFin?: string;
  lieu?: string;
  encadrantIndustriel?: string;
  emailEncadrant?: string;
  description?: string;
  status?: string;
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

export default function StudentDashboard() {
  const [etudiant, setEtudiant] = useState<Etudiant | null>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const etudiantId = localStorage.getItem("userId");
        if (!etudiantId) throw new Error("Aucun userId dans localStorage");

        const etuRes = await axios.get<Etudiant>(`${API_BASE_URL}/etudiants/${etudiantId}`);
        setEtudiant(etuRes.data);

        try {
          const stageRes = await axios.get<Stage[]>(`${API_BASE_URL}/stages/etudiant/${etudiantId}`);
          if (stageRes.data.length > 0) {
            setStage(stageRes.data[0]);
          }
        } catch {
          console.log("Aucun stage trouvé");
        }

        const projetsRes = await axios.get<Projet[]>(`${API_BASE_URL}/projets`);
        setProjets(projetsRes.data);

        const affectationsRes = await axios.get<Affectation[]>(`${API_BASE_URL}/affectations`);
        setAffectations(affectationsRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

   const getDifficultyColor = (difficulte?: string) => {
    if (!difficulte) return "text-slate-600 bg-slate-100";
  
    switch (difficulte.toLowerCase()) {
      case "Low": return "text-green-600 bg-green-100";
      case "Meduin": return "text-amber-600 bg-amber-100";
      case "High": return "text-red-600 bg-red-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };
  

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-2 border-b">
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          {etudiant && (
            <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-full">
              <span className="font-medium">{etudiant.prenom} {etudiant.nom}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-500">{etudiant.filiere} - {etudiant.niveau}</span>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Cartes d'aperçu */} 
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Stage */} 
          <Card className="overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-sm font-medium">Stage d'été</CardTitle>
              </div>
              <Calendar className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent className="pt-4">
              {stage ? (
                <>
                  <div className="text-2xl font-bold">{stage.entreprise}</div>
                  <p className="text-xs text-slate-500 mt-1">{stage.projet}</p>
                  <div className="mt-4 flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Status: {stage.status}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">En attente</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Aucun stage confirmé pour le moment
                  </p>
                  <div className="mt-4 flex items-center text-amber-600 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Date limite: 30 mai 2025</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Nombre de projets disponibles */}
          <Card className="overflow-hidden border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-sm font-medium">Sujets disponibles</CardTitle>
              </div>
              <FileText className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{projets.length} projets</div>
              <p className="text-xs text-slate-500 mt-1">
                Consultez les sujets dans l'onglet ci-dessous
              </p>
              <Progress value={60} className="h-2 mt-4" />
            </CardContent>
          </Card>

          {/* Affectations */}
          <Card className="overflow-hidden border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-sm font-medium">Affectations</CardTitle>
              </div>
              <Tag className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{affectations.length}</div>
              <p className="text-xs text-slate-500 mt-1">
                {affectations.length ? "Sujets affectés" : "Aucune affectation pour le moment"}
              </p>
              {affectations.length > 0 && (
                <span className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                  Affectations confirmées
                </span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Onglets Projet / Stage / Affectation */} 
        <Tabs defaultValue="projets" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projets" className="text-center">
              <FileText className="h-4 w-4 mr-2" />
              Sujets
            </TabsTrigger>
            <TabsTrigger value="stage" className="text-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Stage
            </TabsTrigger>
            <TabsTrigger value="affectations" className="text-center">
              <Users className="h-4 w-4 mr-2" />
              Affectations
            </TabsTrigger>
          </TabsList>

          {/* Liste des Projets */}
          <TabsContent value="projets" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {projets.map((projet) => (
                <Card key={projet.id} className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg">{projet.titre}</CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {projet.domaine}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(projet.difficulte)}`}>
                        {projet.difficulte}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 line-clamp-3">{projet.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0 border-t">
                    <div className="flex flex-wrap gap-1 text-xs text-slate-500">
                      {projet.technologies.map((tech, i) => (
                        <span key={i} className="bg-slate-100 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Détails Stage */}
          <TabsContent value="stage" className="mt-4">
            <Card>
              <CardHeader className="bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                  Informations sur le stage
                </CardTitle>
                {stage ? (
                  <CardDescription>
                    {stage.entreprise} – {stage.projet}
                  </CardDescription>
                ) : (
                  <CardDescription>Aucun stage enregistré</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {stage ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-4 rounded">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Entreprise
                        </h3>
                        <p className="text-sm text-slate-600">{stage.entreprise}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Lieu
                        </h3>
                        <p className="text-sm text-slate-600">{stage.lieu ?? "N/A"}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Date de début
                        </h3>
                        <p className="text-sm text-slate-600">
                          {stage.dateDebut
                            ? new Date(stage.dateDebut).toLocaleDateString("fr-FR")
                            : "N/A"}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Date de fin
                        </h3>
                        <p className="text-sm text-slate-600">
                          {stage.dateFin
                            ? new Date(stage.dateFin).toLocaleDateString("fr-FR")
                            : "N/A"}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Encadrant industriel
                        </h3>
                        <p className="text-sm text-slate-600">{stage.encadrantIndustriel ?? "N/A"}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Email encadrant
                        </h3>
                        <p className="text-sm text-slate-600">{stage.emailEncadrant ?? "N/A"}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded">
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-sm text-slate-600">{stage.description ?? "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Status</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {stage.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Pas encore de stage
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Vous n'avez pas encore enregistré de stage.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Liste des affectations */}
          <TabsContent value="affectations" className="mt-4">
            {affectations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {affectations.map((aff) => (
                  <Card key={aff.id} className="hover:shadow-md transition-all">
                    <CardHeader className="bg-slate-50">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        {aff.sujet}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <p className="text-sm font-medium">
                            {aff.etudiant1} {aff.etudiant2 && `et ${aff.etudiant2}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          <p className="text-sm font-medium">
                            Encadré par : {aff.enseignant}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <p className="text-sm text-slate-500">
                            Affecté le : {new Date(aff.dateAffectation).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Aucune affectation
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Les affectations de sujets n'ont pas encore été réalisées.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}