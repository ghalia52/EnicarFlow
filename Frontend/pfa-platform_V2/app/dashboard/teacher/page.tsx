"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, FileText, Info, Users } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import axios from "axios"

interface SubjectCounts {
  nbSujet: number;
  nbSujetValide: number;
  nbSujetEnAttente: number;
}

interface EnseignantDTO {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  departement: string;
  position: string;
  bureau: string;
  nombreEtudiants: number;
  nomComplet?: string;
}

interface ProjetEncadreDTO {
  id: number;
  titre: String;
  etudiant: String;
  dateDebut: String;
  dateFin: String;
  progress: String;
}

export default function TeacherDashboard() {
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [nbSujetsEncadres, setNbSujetsEncadres] = useState<number>(0);
  const [nbSujetsEnAtttente, setNbSujetsEnAtttente] = useState<number>(0);
  const difference = nbSujetsEncadres - nbSujetsEnAtttente;
  const tauxValid = nbSujetsEncadres > 0 ? (nbSujetsEnAtttente / nbSujetsEncadres) * 100 : 0;
  const [nbEtd, setNbEtd] = useState<number>(0);
  const [nbSuj, setNbSuj] = useState<number>(0);
  const [nbStage, setNbStage] = useState<number>(0);
  const [projects, setProjets] = useState<ProjetEncadreDTO[]>([]);
  const [teacherInfo, setTeacherInfo] = useState<EnseignantDTO | null>({
    id: 0,
    prenom: " ",
    nom: " ",
    email: " ",
    departement: " ",
    position: " ",
    bureau: " ",
    nombreEtudiants: 0,
    nomComplet: " ",
  });

  useEffect(() => {
    const storedTeacherId = localStorage.getItem("userId");
    if (storedTeacherId) {
      const parsedTeacherId = parseInt(storedTeacherId, 10);
      setTeacherId(parsedTeacherId);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) return;
      
      try {
        const [profileRes, subjetsEncadresRes, sujetsValideRes, etudiantsRes, sujetsRes, projetsRes] = await Promise.all([
          axios.get<EnseignantDTO>(`http://localhost:8082/api/enseignants/${teacherId}/profil`),
          axios.get<number>(`http://localhost:8082/api/projets/enseignant/${teacherId}/nbSujetsEncadres`),
          axios.get<number>(`http://localhost:8082/api/projets/enseignant/${teacherId}/nbSujetsValide`),
          axios.get<number>(`http://localhost:8082/api/affectations/etudiants/${teacherId}`),
          axios.get<number>(`http://localhost:8082/api/affectations/sujets/${teacherId}`),
          axios.get<ProjetEncadreDTO[]>(`http://localhost:8082/api/enseignants/${teacherId}/projets-encadres`)
        ]);

        setTeacherInfo(profileRes.data);
        setNbSujetsEncadres(subjetsEncadresRes.data);
        setNbSujetsEnAtttente(sujetsValideRes.data);
        setNbEtd(etudiantsRes.data);
        setNbSuj(sujetsRes.data);
        setProjets(projetsRes.data);
      } catch (error: any) {
        console.error("Erreur lors de la récupération des données:", error?.response?.data?.message || error.message);
      }
    };

    fetchData();
    
    // Cette requête ne dépend pas de teacherId
    axios.get<number>("http://localhost:8082/api/stages/nbStageAValider")
      .then(res => setNbStage(res.data))
      .catch(error => console.error("Erreur lors de la récupération du nombre de stages:", error));
  }, [teacherId]);
  const getIndicatorColor = (progress: number) => {
    if (progress > 75) return 'bg-green-500';
    if (progress > 50) return 'bg-blue-500';
    if (progress > 25) return 'bg-amber-500';
    return 'bg-red-500';
  };
  

  return (
    <DashboardLayout userType="teacher">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-2 border-b border-slate-200">
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          {teacherInfo ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border-2 border-slate-100">
                <AvatarFallback className="bg-slate-100 text-slate-800">
                  {teacherInfo.prenom?.[0]}{teacherInfo.nom?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{teacherInfo.nomComplet || `${teacherInfo.prenom} ${teacherInfo.nom}`}</div>
                <div className="text-sm text-slate-500">Département {teacherInfo.departement || "Non spécifié"}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">Chargement des informations...</div>
          )}
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-500" />
          <AlertTitle className="font-medium text-blue-700">Information importante</AlertTitle>
          <AlertDescription className="text-blue-600">
            La période de proposition des sujets de PFA est ouverte jusqu'au 31 mars 2025.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50">
              <CardTitle className="text-sm font-medium">Sujets proposés</CardTitle>
              <FileText className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-slate-800">{nbSujetsEncadres}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {nbSujetsEnAtttente} validés
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {difference} en attente
                </Badge>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">Taux de validation</span>
                  <span className="font-bold">{tauxValid.toFixed(0)}%</span>
                </div>
                <Progress value={tauxValid} className="h-2 bg-slate-100 [&>div]:bg-blue-500" />
                </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50">
              <CardTitle className="text-sm font-medium">Étudiants encadrés</CardTitle>
              <Users className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-slate-800">{nbEtd}</div>
              <p className="text-sm text-slate-500 mt-1 font-medium">{nbSuj} projets en cours</p>
              <div className="flex -space-x-3 mt-4">
                <Avatar className="border-2 border-white h-8 w-8 ring-2 ring-slate-100">
                  <AvatarFallback className="bg-blue-500 text-white">AB</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-white h-8 w-8 ring-2 ring-slate-100">
                  <AvatarFallback className="bg-indigo-500 text-white">CD</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-white h-8 w-8 ring-2 ring-slate-100">
                  <AvatarFallback className="bg-teal-500 text-white">EF</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-white h-8 w-8 ring-2 ring-slate-100">
                  <AvatarFallback className="bg-amber-500 text-white">+{Math.max(0, nbEtd-3)}</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50">
              <CardTitle className="text-sm font-medium">Stages à valider</CardTitle>
              <Calendar className="h-5 w-5 text-teal-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-slate-800">{nbStage}</div>
              <p className="text-sm text-slate-500 mt-1 font-medium">Rapports en attente de validation</p>
              <div className="mt-4 flex items-center text-amber-600 text-sm bg-amber-50 px-3 py-2 rounded-md">
                <Bell className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="font-medium">Date limite: 15 juillet 2025</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="mt-8">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="projects" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Projets encadrés</TabsTrigger>
            <TabsTrigger value="internships" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Stages à valider</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-4 mt-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle>Projets en cours</CardTitle>
                <CardDescription>Liste des projets que vous encadrez actuellement</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {projects.length > 0 ? (
                  <div className="space-y-6">
                    {projects.map((projet) => (
                      <div key={projet.id} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-slate-800">{projet.titre}</h3>
                            <p className="text-sm text-slate-500 mt-1">{projet.etudiant}</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">En cours</Badge>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium">Progression</span>
                            <span className="font-bold">{projet.progress}%</span>
                          </div>
                          <Progress 
                             value={Number(projet.progress)} 
                             className={`h-2 bg-slate-100 [&>div]:${getIndicatorColor(Number(projet.progress))}`} 
  />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                            <span>Début: {projet.dateDebut}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                            <span>Fin: {projet.dateFin}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-slate-700">
                      Aucun projet encadré
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Les affectations de sujets n'ont pas encore été réalisées.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internships" className="space-y-4 mt-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle>Stages à valider</CardTitle>
                <CardDescription>Rapports et posters de stage en attente de validation</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-slate-800">Rapport de stage - Développement web</h3>
                        <p className="text-sm text-slate-500 mt-1">Youssef Benjelloun (2ème année)</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        En attente
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="text-slate-600">Soumis le: 10 avril 2025</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="font-medium text-slate-700">Entreprise: TechMaroc</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-slate-800">Poster de stage - Analyse de données</h3>
                        <p className="text-sm text-slate-500 mt-1">Nadia El Fassi (1ère année)</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        En attente
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="text-slate-600">Soumis le: 8 avril 2025</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="font-medium text-slate-700">Entreprise: DataInsight</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}