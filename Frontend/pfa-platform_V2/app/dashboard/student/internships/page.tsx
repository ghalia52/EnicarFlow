"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Info, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

interface Stage {
  id: number;
  entreprise: string | null;
  projet: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  lieu: string | null;
  encadrantIndustriel: string | null;
  emailEncadrant: string | null;
  description: string | null;
  status: string;
  etudiant: { id: number };
}

interface Document {
  id?: number;
  nom: string;
  type: string;
  status?: string;
  dateUpload?: string;
  nomFichier?: string;
  etudiantId?: number;
  stageId?: number;
}

export default function StudentInternship() {
  // Hardcode or replace with your own auth logic
  const [studentId, setStudentId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("userId");
    if (stored) setStudentId(Number(stored));
  }, []);
  const [hasInternship, setHasInternship] = useState(false);
  const [stageId, setStageId] = useState<number | null>(null);
  const [internshipData, setInternshipData] = useState({
    entreprise: "",
    projet: "",
    dateDebut: "",
    dateFin: "",
    lieu: "",
    encadrantIndustriel: "",
    emailEncadrant: "",
    description: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState("RAPPORT");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (studentId === null) return; // Skip if studentId is null
    
    axios
      .get<Stage[]>(`http://localhost:8082/api/stages/etudiant/${studentId}`)
      .then((res) => {
        if (res.data.length > 0) {
          setHasInternship(true);
          setStageId(res.data[0].id);
          const s = res.data[0];
          setInternshipData({
            entreprise: s.entreprise ?? "",
            projet: s.projet ?? "",
            dateDebut: s.dateDebut ?? "",
            dateFin: s.dateFin ?? "",
            lieu: s.lieu ?? "",
            encadrantIndustriel: s.encadrantIndustriel ?? "",
            emailEncadrant: s.emailEncadrant ?? "",
            description: s.description ?? "",
          });
          
          // Fetch documents for this stage
          if (s.id) {
            fetchDocuments(s.id);
          }
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [studentId]);
  
  const fetchDocuments = async (stageId: number) => {
    try {
      setIsLoading(true);
      const response = await axios.get<Document[]>(
        `http://localhost:8082/api/documents/stage/${stageId}`
      );
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (studentId === null) {
      alert("Erreur: Utilisateur non identifié");
      return;
    }
  
    const payload = {
      entreprise: internshipData.entreprise,
      projet: internshipData.projet,
      dateDebut: internshipData.dateDebut,
      dateFin: internshipData.dateFin,
      lieu: internshipData.lieu,
      encadrantIndustriel: internshipData.encadrantIndustriel,
      emailEncadrant: internshipData.emailEncadrant,
      description: internshipData.description,
      status: "en attente", // Using the enum constant name, not the label
      etudiantId: studentId
    };
  
    try {
      // Corrected the endpoint URL to use port 8082 to match the GET request
      const res = await axios.post(
        "http://localhost:8082/api/stages", 
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (res.status === 200 || res.status === 201) {
        setHasInternship(true);
        setStageId(res.data.id);
        alert("Stage enregistré avec succès !");
      }
    } catch (err: any) {
      console.error("API error:", err.response?.data || err);
      alert("Erreur lors de l'enregistrement du stage");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadDocuments = async () => {
    if (!stageId) {
      setUploadStatus("Vous devez d'abord enregistrer un stage");
      return;
    }
    
    if (selectedFiles.length === 0) {
      setUploadStatus("Veuillez sélectionner au moins un fichier");
      return;
    }
    
    if (studentId === null) {
      setUploadStatus("Erreur: Utilisateur non identifié");
      return;
    }
  
    // Upload files one by one as the backend API expects a single file per request
    try {
      setUploadStatus("Téléchargement en cours...");
      
      // Process uploads sequentially
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file); // Vérifie bien que `file` est un fichier valide
        formData.append("type", documentType); // Use the state variable which contains uppercase values
        formData.append("stageId", stageId.toString()); // doit être une string
        formData.append("etudiantId", studentId.toString());
        
        await axios.post(
          "http://localhost:8082/api/documents/upload",
          formData
        );
      }
      
      // If all uploads completed without throwing an error
      setUploadStatus(`${selectedFiles.length} document(s) téléchargé(s) avec succès !`);
      setSelectedFiles([]);
      
      // Re-fetch documents to show the newly uploaded ones
      fetchDocuments(stageId);
    } catch (error: any) {
      console.error("Erreur lors du téléchargement:", error);
      setUploadStatus(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold">Mon stage</h1>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            La période de soumission est ouverte jusqu'au 30 mai 2025.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue={hasInternship ? "details" : "register"}>
          <TabsList>
            <TabsTrigger value="register">Enregistrer un stage</TabsTrigger>
            <TabsTrigger value="details" disabled={!hasInternship}>
              Détails
            </TabsTrigger>
            <TabsTrigger value="documents" disabled={!hasInternship}>
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Enregistrer un stage</CardTitle>
                  <CardDescription>Remplis les infos de ton stage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="entreprise">Entreprise</Label>
                    <Input
                      id="entreprise"
                      value={internshipData.entreprise}
                      onChange={(e) =>
                        setInternshipData({ ...internshipData, entreprise: e.target.value })
                      }
                      placeholder="Nom de l'entreprise"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projet">Poste / Fonction</Label>
                    <Input
                      id="projet"
                      value={internshipData.projet}
                      onChange={(e) =>
                        setInternshipData({ ...internshipData, projet: e.target.value })
                      }
                      placeholder="Ex: Développeur web..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateDebut">Date de début</Label>
                      <Input
                        id="dateDebut"
                        type="date"
                        value={internshipData.dateDebut}
                        onChange={(e) =>
                          setInternshipData({ ...internshipData, dateDebut: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFin">Date de fin</Label>
                      <Input
                        id="dateFin"
                        type="date"
                        value={internshipData.dateFin}
                        onChange={(e) =>
                          setInternshipData({ ...internshipData, dateFin: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lieu">Lieu</Label>
                    <Input
                      id="lieu"
                      value={internshipData.lieu}
                      onChange={(e) =>
                        setInternshipData({ ...internshipData, lieu: e.target.value })
                      }
                      placeholder="Ville, Pays"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encadrantIndustriel">Encadrant en entreprise</Label>
                    <Input
                      id="encadrantIndustriel"
                      value={internshipData.encadrantIndustriel}
                      onChange={(e) =>
                        setInternshipData({ ...internshipData, encadrantIndustriel: e.target.value })
                      }
                      placeholder="Nom et prénom"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailEncadrant">Email de l'encadrant</Label>
                    <Input
                      id="emailEncadrant"
                      type="email"
                      value={internshipData.emailEncadrant}
                      onChange={(e) =>
                        setInternshipData({ ...internshipData, emailEncadrant: e.target.value })
                      }
                      placeholder="email@exemple.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description du stage</Label>
                    <Textarea
                      id="description"
                      value={internshipData.description}
                      onChange={(e) =>
                        setInternshipData({ ...internshipData, description: e.target.value })
                      }
                      placeholder="Tâches et responsabilités"
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    Enregistrer
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Détails du stage</CardTitle>
                <CardDescription>Informations de votre stage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Entreprise :</strong> {internshipData.entreprise}</p>
                <p><strong>Poste :</strong> {internshipData.projet}</p>
                <p><strong>Période :</strong> {internshipData.dateDebut} → {internshipData.dateFin}</p>
                <p><strong>Lieu :</strong> {internshipData.lieu}</p>
                <p><strong>Encadrant :</strong> {internshipData.encadrantIndustriel}</p>
                <p><strong>Email :</strong> {internshipData.emailEncadrant}</p>
                <p><strong>Description :</strong> {internshipData.description}</p>
                <p><strong>Status :</strong> En attente</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Ajouter vos documents de stage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Type de document</Label>
                  <select
                    id="documentType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="RAPPORT">Rapport de stage</option>
                    <option value="CONVENTION">Convention de stage</option>
                    <option value="ATTESTATION">Attestation de stage</option>
                    <option value="AUTRE">Autre document</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fileUpload">Sélectionner des fichiers</Label>
                  <Input 
                    id="fileUpload" 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                  />
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium mb-2">Fichiers sélectionnés ({selectedFiles.length}):</p>
                    <ul className="text-sm space-y-1">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          {file.name} ({Math.round(file.size / 1024)}Ko)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {uploadStatus && (
                  <Alert className={uploadStatus.includes("succès") ? "bg-green-50" : uploadStatus.includes("Erreur") ? "bg-red-50" : "bg-blue-50"}>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Status</AlertTitle>
                    <AlertDescription>{uploadStatus}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={handleUploadDocuments} 
                  disabled={selectedFiles.length === 0 || !stageId}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Documents soumis</h3>
                  
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p>Chargement des documents...</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucun document soumis pour le moment</p>
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {documents.map((doc) => (
                            <tr key={doc.id}>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-900">{doc.nom}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.type}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.dateUpload}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {doc.status === 'Validé' ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                      <span className="text-sm text-green-500">Validé</span>
                                    </>
                                  ) : doc.status === 'En attente' ? (
                                    <>
                                      <Clock className="h-4 w-4 text-amber-500 mr-1" />
                                      <span className="text-sm text-amber-500">En attente</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                      <span className="text-sm text-red-500">{doc.status}</span>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}