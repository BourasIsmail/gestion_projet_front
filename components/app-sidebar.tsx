"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    ListTodo,
    Bell,
    AlertTriangle,
    FileText,
    Settings,
    Shield,
    LogOut,
    ChevronDown,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { initials } from "@/lib/utils"

const mainNav = [
    { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { title: "Projets", href: "/projets", icon: FolderKanban },
    { title: "Equipes", href: "/equipes", icon: Users },
    { title: "Alertes", href: "/dashboard/alertes", icon: AlertTriangle },
    { title: "Notifications", href: "/notifications", icon: Bell },
    { title: "Rapports", href: "/rapports", icon: FileText },
]

const adminNav = [
    { title: "Utilisateurs", href: "/utilisateurs", icon: Users },
    { title: "Types de projets", href: "/admin/types-projet", icon: Settings },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { user, logout, isAdmin } = useAuth()

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                        <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-sidebar-foreground">GestionProjets</span>
                        <span className="text-[10px] text-sidebar-foreground/60">Entraide Nationale</span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNav.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + "/")}>
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {isAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Administration</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {adminNav.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + "/")}>
                                            <Link href={item.href}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="w-full">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[10px]">
                                            {user ? initials(user.prenom, user.nom) : "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="flex-1 truncate text-left text-sm">
                    {user ? `${user.prenom} ${user.nom}` : "Utilisateur"}
                  </span>
                                    <ChevronDown className="h-3 w-3" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="start" className="w-56">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium">{user?.prenom} {user?.nom}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profil">Profil</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Se deconnecter
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
