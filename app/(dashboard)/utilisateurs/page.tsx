"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Search, UserCog, MoreHorizontal, UserCheck, UserX, Users, Shield, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatCard } from "@/components/stat-card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { fetcher, api } from "@/lib/api"
import type { User, RoleGlobal } from "@/lib/types"
import { initials } from "@/lib/utils"
import { toast } from "sonner"

const roleLabels: Record<RoleGlobal, string> = {
    ADMIN: "Administrateur",
    CHEF_EQUIPE: "Chef d'equipe",
    MEMBRE: "Membre",
}

const roleColors: Record<RoleGlobal, string> = {
    ADMIN: "bg-destructive/10 text-destructive",
    CHEF_EQUIPE: "bg-[var(--warning)]/10 text-[var(--warning-foreground)]",
    MEMBRE: "bg-primary/10 text-primary",
}

export default function UtilisateursPage() {
    const { data: users, mutate } = useSWR<User[]>("/users", fetcher)
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("ALL")
    const [dialogOpen, setDialogOpen] = useState(false)

    const filtered = users?.filter((u) => {
        const matchSearch =
            u.nom.toLowerCase().includes(search.toLowerCase()) ||
            u.prenom.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        const matchRole = roleFilter === "ALL" || u.roleGlobal === roleFilter
        return matchSearch && matchRole
    })

    const stats = users
        ? {
            total: users.length,
            actifs: users.filter((u) => u.actif).length,
            admins: users.filter((u) => u.roleGlobal === "ADMIN").length,
            chefs: users.filter((u) => u.roleGlobal === "CHEF_EQUIPE").length,
        }
        : { total: 0, actifs: 0, admins: 0, chefs: 0 }

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        try {
            await api.post("/auth/register", {
                nom: fd.get("nom"),
                prenom: fd.get("prenom"),
                email: fd.get("email"),
                password: fd.get("password"),
                roleGlobal: fd.get("roleGlobal"),
            })
            toast.success("Utilisateur cree avec succes")
            mutate()
            setDialogOpen(false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    async function toggleActif(user: User) {
        try {
            await api.put(`/users/${user.id}`, { actif: !user.actif })
            toast.success(user.actif ? "Utilisateur desactive" : "Utilisateur active")
            mutate()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    async function changeRole(user: User, role: RoleGlobal) {
        try {
            await api.put(`/users/${user.id}`, { roleGlobal: role })
            toast.success("Role mis a jour")
            mutate()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des utilisateurs</h1>
                    <p className="text-sm text-muted-foreground">Administrez les comptes et les permissions</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" />Nouvel utilisateur</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Creer un utilisateur</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label>Prenom</Label>
                                    <Input name="prenom" required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>Nom</Label>
                                    <Input name="nom" required />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Email</Label>
                                <Input name="email" type="email" required />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Mot de passe</Label>
                                <Input name="password" type="password" required minLength={6} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Role</Label>
                                <Select name="roleGlobal" defaultValue="MEMBRE">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                                        <SelectItem value="CHEF_EQUIPE">Chef d{"'"}equipe</SelectItem>
                                        <SelectItem value="MEMBRE">Membre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit">Creer</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard title="Total utilisateurs" value={stats.total} icon={Users} variant="default" />
                <StatCard title="Actifs" value={stats.actifs} icon={UserCheck} variant="success" />
                <StatCard title="Administrateurs" value={stats.admins} icon={Shield} variant="destructive" />
                <StatCard title="Chefs d'equipe" value={stats.chefs} icon={Crown} variant="warning" />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Rechercher un utilisateur..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par role" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous les roles</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                        <SelectItem value="CHEF_EQUIPE">Chef d{"'"}equipe</SelectItem>
                        <SelectItem value="MEMBRE">Membre</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!filtered ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={5}><div className="h-10 animate-pulse rounded bg-muted" /></TableCell></TableRow>
                                ))
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                    <UserCog className="mx-auto mb-2 h-8 w-8" />Aucun utilisateur trouve
                                </TableCell></TableRow>
                            ) : (
                                filtered.map((u) => (
                                    <TableRow key={u.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials(u.prenom, u.nom)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{u.prenom} {u.nom}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                        <TableCell><Badge variant="outline" className={roleColors[u.roleGlobal]}>{roleLabels[u.roleGlobal]}</Badge></TableCell>
                                        <TableCell>
                                            {u.actif ? (
                                                <Badge variant="outline" className="bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30">Actif</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-muted text-muted-foreground">Inactif</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => changeRole(u, "ADMIN")}>Passer Administrateur</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => changeRole(u, "CHEF_EQUIPE")}>Passer Chef d{"'"}equipe</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => changeRole(u, "MEMBRE")}>Passer Membre</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => toggleActif(u)}>
                                                        {u.actif ? (
                                                            <span className="flex items-center gap-2 text-destructive"><UserX className="h-4 w-4" />Desactiver</span>
                                                        ) : (
                                                            <span className="flex items-center gap-2 text-[var(--success)]"><UserCheck className="h-4 w-4" />Activer</span>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
