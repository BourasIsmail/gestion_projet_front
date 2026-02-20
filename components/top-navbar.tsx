"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    AlertTriangle,
    FileText,
    Shield,
    LogOut,
    User as UserIcon,
    Settings,
    ChevronDown,
    Repeat,
    Menu,
    X,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { NotificationPopover } from "@/components/notification-popover"
import { useAuth } from "@/lib/auth-context"
import { initials } from "@/lib/utils"
import { cn } from "@/lib/utils"

export function TopNavbar() {
    const pathname = usePathname()
    const { user, logout, isAdmin, isMembre } = useAuth()

    const navLinks = [
        { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { title: "Projets", href: "/projets", icon: FolderKanban },
        { title: "Equipes", href: "/equipes", icon: Users },
        { title: "Alertes", href: "/dashboard/alertes", icon: AlertTriangle },
        ...(!isMembre ? [{ title: "Rapports", href: "/rapports", icon: FileText }] : []),
    ]
    const [mobileOpen, setMobileOpen] = useState(false)

    function isActive(href: string) {
        if (href === "/dashboard") return pathname === "/dashboard"
        return pathname === href || pathname.startsWith(href + "/")
    }

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b bg-[var(--navbar)] backdrop-blur supports-[backdrop-filter]:bg-[var(--navbar)]/95">
                <div className="mx-auto flex h-14 max-w-screen-2xl items-center px-4 lg:px-6">
                    {/* Logo */}
                    <Link href="/dashboard" className="mr-6 flex items-center gap-2.5 lg:mr-8">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Shield className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="hidden text-sm font-semibold sm:inline-block">GestionProjets</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden flex-1 items-center gap-1 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                    isActive(link.href)
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.title}
                            </Link>
                        ))}

                        {isAdmin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className={cn(
                                            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                            (pathname.startsWith("/utilisateurs") || pathname.startsWith("/admin"))
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        )}
                                    >
                                        <Settings className="h-4 w-4" />
                                        Admin
                                        <ChevronDown className="h-3 w-3" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" sideOffset={8}>
                                    <DropdownMenuItem asChild>
                                        <Link href="/utilisateurs" className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Utilisateurs
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin/types-projet" className="flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            Types de projets
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="ml-auto flex items-center gap-1">
                        <NotificationPopover />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-9 gap-2 px-2">
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                                            {user ? initials(user.prenom, user.nom) : "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden text-sm font-medium sm:inline-block">
                    {user ? user.prenom : ""}
                  </span>
                                    <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                                <DropdownMenuLabel className="font-normal">
                                    <p className="text-sm font-medium">{user?.prenom} {user?.nom}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profil" className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4" />
                                        Mon profil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Se deconnecter
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile menu toggle */}
                        <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            <span className="sr-only">Menu</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile nav */}
                {mobileOpen && (
                    <div className="border-t md:hidden">
                        <div className="flex flex-col gap-1 px-4 py-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive(link.href)
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    )}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.title}
                                </Link>
                            ))}
                            {isAdmin && (
                                <>
                                    <div className="my-1 border-t" />
                                    <Link href="/utilisateurs" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                                        <Users className="h-4 w-4" />Utilisateurs
                                    </Link>
                                    <Link href="/admin/types-projet" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                                        <Settings className="h-4 w-4" />Types de projets
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    )
}
