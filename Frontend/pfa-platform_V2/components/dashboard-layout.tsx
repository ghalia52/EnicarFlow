"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BookOpen, Calendar, ClipboardList, FileText, Home, LogOut, Menu, Settings, Users } from "lucide-react"
import Image from "next/image"
interface NavItemProps {
  href: string
  icon: React.ReactNode
  title: string
  isActive: boolean
  isChild?: boolean
}

function NavItem({ href, icon, title, isActive, isChild = false }: NavItemProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={`w-full justify-start ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-600"} ${
          isChild ? "pl-10" : ""
        }`}
      >
        {icon}
        <span className="ml-2">{title}</span>
      </Button>
    </Link>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userType: "student" | "teacher" | "director"
}

export default function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isProjectsOpen, setIsProjectsOpen] = useState(false)
  const [isInternshipsOpen, setIsInternshipsOpen] = useState(false)

  const userName = userType === "student" ? "Étudiant" : userType === "teacher" ? "Enseignant" : "Directeur"

  const handleLogout = () => {
    // Ici vous pourriez ajouter une logique pour effacer le token d'authentification
    // ou tout autre donnée de session si nécessaire
    
    // Redirection vers la page de login
    router.push('/login')
  }

  const renderNavItems = () => {
    const baseItems = [
      {
        href: `/dashboard/${userType}`,
        icon: <Home size={20} />,
        title: "Tableau de bord",
      },
    ]

    const studentItems = [
      {
        href: `/dashboard/${userType}/projects/choose`,
        icon: <BookOpen size={20} />,
        title: "Choisir un projet",
      },
      {
        href: `/dashboard/${userType}/projects/my-project`,
        icon: <ClipboardList size={20} />,
        title: "Mon projet",
      },
      {
        href: `/dashboard/${userType}/internships`,
        icon: <Calendar size={20} />,
        title: "Mon stage",
      },
    ]

    const teacherItems = [
      {
        href: `/dashboard/${userType}/projects/propose`,
        icon: <FileText size={20} />,
        title: "Proposer un sujet",
      },
      {
        href: `/dashboard/${userType}/projects/supervise`,
        icon: <ClipboardList size={20} />,
        title: "Projets encadrés",
      },
      {
        href: `/dashboard/${userType}/internships/validate`,
        icon: <Calendar size={20} />,
        title: "Valider les stages",
      },
    ]

    const directorItems = [
      {
        href: `/dashboard/${userType}/projects/validate`,
        icon: <FileText size={20} />,
        title: "Valider les sujets",
      },
      {
        href: `/dashboard/${userType}/projects/assign`,
        icon: <Users size={20} />,
        title: "Affecter les projets",
      },
      {
        href: `/dashboard/${userType}/projects/monitor`,
        icon: <ClipboardList size={20} />,
        title: "Suivi des projets",
      },
      {
        href: `/dashboard/${userType}/internships/overview`,
        icon: <Calendar size={20} />,
        title: "Suivi des stages",
      },
    ]

    const settingsItem = [
      {
        href: `/dashboard/${userType}/settings`,
        icon: <Settings size={20} />,
        title: "Paramètres",
      },
    ]

    let items = [...baseItems]

    if (userType === "student") {
      items = [...items, ...studentItems]
    } else if (userType === "teacher") {
      items = [...items, ...teacherItems]
    } else if (userType === "director") {
      items = [...items, ...directorItems]
    }

    items = [...items, ...settingsItem]

    return items.map((item) => (
      <NavItem key={item.href} href={item.href} icon={item.icon} title={item.title} isActive={pathname === item.href} />
    ))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="py-4">
                <div className="px-4 mb-6 flex justify-center">
                  <div className="relative w-[100px] h-[80px]">
                    <Image 
                      src="/logo.png" 
                      alt="ENICARPROFLOW Logo" 
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <nav className="space-y-1">{renderNavItems()}</nav>
              </div>
            </SheetContent>
          </Sheet>
          <div className="ml-2 relative w-[100px] h-[80px]">
            <Image 
              src="/logo.png" 
              alt="ENICARPROFLOW Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut size={18} className="mr-2" />
          Déconnexion
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r min-h-screen">
          <div className="p-6">
            <div className="relative w-[120px] h-[150px] mx-auto">
              <Image 
                src="/logo.png" 
                alt="ENICARPROFLOW Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="text-sm text-slate-500 mt-1 text-center">Espace {userName}</p>
          </div>
          <nav className="px-3 py-2 space-y-1">{renderNavItems()}</nav>
          <div className="absolute bottom-0 w-64 p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-600"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span className="ml-2">Déconnexion</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}