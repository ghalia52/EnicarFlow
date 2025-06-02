"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, BookOpen, Calendar, CheckCircle, FileText, Info, Users } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import axios from "axios"

interface SubjectCounts {
  nbSujet: number;
  nbSujetValide: number;
  nbSujetEnAttente: number;
}

interface AdminInfo {
  idAdmin: number; // Correspond à idAdmin dans l'entité
  prenom: string;
  nom: string;
  email: string;
  motDePasse?: string; // Le mot de passe n'est généralement pas renvoyé au frontend pour des raisons de sécurité
  departement?: string;
  anneeUniversitaire?: string;
  nomComplet?: string; // Champ calculé, peut ou non être inclus dans la réponse backend
}

export default function DirectorDashboard() {
  const [nbEnseignants, setNbEnseignants] = useState<number>(0);
  const[nbStage,setNbStage]=useState<number>(0)
  const[nbEtudiantAyantChoisi,setNbEtudiantAyantChoisi]=useState<number>(0)
  const[nbEtudiant,setNbEtudiant]=useState<number>(0)
  const [adminId, setAdminId] = useState<number | null>(null);
  const difference = nbEtudiant - nbEtudiantAyantChoisi;
  const [subjectCounts, setSubjectCounts] = useState<SubjectCounts>({
    nbSujet: 0,
    nbSujetValide: 0,
    nbSujetEnAttente: 0,
});
const [adminInfo, setAdminInfo] = useState<AdminInfo | null>({
  idAdmin: 0, // Correspond à idAdmin dans l'entité
  prenom: " ",
  nom: " ",
  email: " ",
  motDePasse: " ", // Le mot de passe n'est généralement pas renvoyé au frontend pour des raisons de sécurité
  departement: " ",
  anneeUniversitaire: " ",
  nomComplet: " ", // Champ calculé, peut ou non être inclus dans la réponse backend
});

useEffect(() => {
  // Récupérer l'ID de l'administrateur connecté
  const storedAdminId = localStorage.getItem("userId");
  if (storedAdminId) {
      const parsedAdminId = parseInt(storedAdminId, 10);
      setAdminId(parsedAdminId);
      console.log("Admin ID récupéré du localStorage:", parsedAdminId);
  } else {
      console.log("Admin ID non trouvé dans le localStorage.");
  }
}, []);

useEffect(() => {
  const fetchAdminInfo = async () => {
      if (adminId) {
          try {
              const response = await axios.get<AdminInfo>(`http://localhost:8082/api/administrateurs/${adminId}`);
              setAdminInfo(response.data);
          } catch (error: any) {
              console.error("Erreur lors de la récupération des informations de l'administrateur:", error?.response?.data?.message || error.message);
              // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
          }
      }
  };

  fetchAdminInfo();
}, [adminId]);

//récupération du nmbre d'enseignants
    useEffect(() => {
        const fetchNbEnseignants = async () => {
            try {
                const response = await axios.get<number>("http://localhost:8082/api/projets/nbEnseignant");
                setNbEnseignants(response.data);
            } catch (error: any) {
                console.error("Erreur lors de la récupération du nombre d'enseignants:", error?.response?.data?.message || error.message);
                // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
            }
        };

        fetchNbEnseignants();
    }, []);

    //récupération du nombre de stage
    useEffect(() => {
      const fetchNbStage = async () => {
          try {
              const response = await axios.get<number>("http://localhost:8082/api/stages/nbStage");
              setNbStage(response.data);
          } catch (error: any) {
              console.error("Erreur lors de la récupération du nombre d'enseignants:", error?.response?.data?.message || error.message);
              // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
          }
      };

      fetchNbStage();
  }, []);

  //récupération de nbStudent
  useEffect(() => {
    const fetchNbEtd = async () => {
        try {
            const response = await axios.get<number>("http://localhost:8082/api/etudiants/nbEtudiant");
            setNbEtudiant(response.data);
        } catch (error: any) {
            console.error("Erreur lors de la récupération du nombre d'enseignants:", error?.response?.data?.message || error.message);
            // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
        }
    };

    fetchNbEtd();
}, []);


    useEffect(() => {
        const fetchSubjectCounts = async () => {
            try {
                const [proposesResponse, validesResponse, enAttenteResponse] = await Promise.all([
                    axios.get<number>("http://localhost:8082/api/projets/nbSujet"),
                    axios.get<number>("http://localhost:8082/api/projets/nbSujetValide"),
                    axios.get<number>("http://localhost:8082/api/projets/nbSujetEnAttente"),
                ]);

                setSubjectCounts({
                    nbSujet: proposesResponse.data,
                    nbSujetValide: validesResponse.data,
                    nbSujetEnAttente: enAttenteResponse.data,
                });
            } catch (error: any) {
                console.error("Erreur lors de la récupération du nombre de sujets:", error?.response?.data?.message || error.message);
                // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
            }
        };

        fetchSubjectCounts();
    }, []);

    //récupération du nombre d'étudiants ayant choisi
    useEffect(() => {
      const fetchNbEtdChoix = async () => {
          try {
              const response = await axios.get<number>("http://localhost:8082/api/choix/nbEtudiant");
              setNbEtudiantAyantChoisi(response.data);
          } catch (error: any) {
              console.error("Erreur lors de la récupération du nombre d'enseignants:", error?.response?.data?.message || error.message);
              // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
          }
      };
  
      fetchNbEtdChoix();
  }, []);
    
  return (
    <DashboardLayout userType="director">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          {adminInfo ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{adminInfo.nomComplet ? adminInfo.nomComplet : `${adminInfo.prenom} ${adminInfo.nom}`}</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">{adminInfo.departement || "Non spécifié"}</span>
          </div>
          ) : (
            <div>Chargement des informations de l'administrateur...</div>
        )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Alert>
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Action requise</AlertTitle>
            <AlertDescription>{subjectCounts.nbSujetEnAttente} sujets de PFA sont en attente de validation.</AlertDescription>
          </Alert>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>La période d'affectation des projets commence le 20 avril 2025.</AlertDescription>
          </Alert>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sujets proposés</CardTitle>
              <FileText className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjectCounts.nbSujet}</div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-2">
                {subjectCounts.nbSujetValide} validés
                </Badge>
                <Badge variant="outline" className="bg-amber-50">
                {subjectCounts.nbSujetEnAttente} en attente
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
              <Users className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nbEnseignants}</div>
              <p className="text-xs text-slate-500 mt-1">Proposant des sujets de PFA</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
              <BookOpen className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nbEtudiant}</div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-2">
                 {nbEtudiantAyantChoisi} ont fait leur choix
                </Badge>
                <Badge variant="outline" className="bg-red-50">
                  {difference} en attente
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stages</CardTitle>
              <Calendar className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nbStage}</div>
              <p className="text-xs text-slate-500 mt-1">Stages confirmés pour l'été 2025</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects">
          <TabsList>
            <TabsTrigger value="projects">Projets PFA</TabsTrigger>
            <TabsTrigger value="internships">Stages</TabsTrigger>
          </TabsList>
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>État d'avancement global</CardTitle>
                <CardDescription>Vue d'ensemble de l'avancement des projets PFA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Phase de proposition des sujets</span>
                      <span className="font-medium">80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Phase de choix des étudiants</span>
                      <span className="font-medium">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Phase d'affectation</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Phase de réalisation</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>

                <div className="mt-6 border-t pt-6">
                  <h3 className="font-medium mb-4">Projets par domaine</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Intelligence artificielle</span>
                      <Badge>8 projets</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Développement web</span>
                      <Badge>6 projets</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sécurité informatique</span>
                      <Badge>5 projets</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Analyse de données</span>
                      <Badge>3 projets</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Réseaux</span>
                      <Badge>2 projets</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="internships" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suivi des stages</CardTitle>
                <CardDescription>Vue d'ensemble des stages d'été</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Répartition par année</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-sm text-slate-500">Stages de 1ère année</p>
                        <div className="mt-2 flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span>8 posters validés</span>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="text-2xl font-bold">6</div>
                        <p className="text-sm text-slate-500">Stages de 2ème année</p>
                        <div className="mt-2 flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span>4 rapports validés</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Répartition par secteur</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Développement logiciel</span>
                        <Badge>7 stages</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Services IT</span>
                        <Badge>5 stages</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Télécommunications</span>
                        <Badge>3 stages</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Banque & Finance</span>
                        <Badge>2 stages</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Autres secteurs</span>
                        <Badge>1 stage</Badge>
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
