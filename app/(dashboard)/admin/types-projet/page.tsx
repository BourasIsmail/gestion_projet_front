"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
    Plus,
    Search,
    Settings,
    Code,
    Network,
    ShieldAlert,
    Database,
    MoreHorizontal,
    ListTodo,
    Layers,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetcher, api } from "@/lib/api"
import type { TypeProjet } from "@/lib/types"
import { toast } from "sonner"

const typeIcons: Record<string, React.ElementType> = {
    DEVELOPPEMENT: Code,
    RESEAUX_INFRA: Network,
    CYBERSECURITE: ShieldAlert,
    DBA: Database,
    AUTRE: Layers,
}

const typeColors: Record<string, string> = {
    DEVELOPPEMENT: "bg-primary/10 text-primary",
    RESEAUX_INFRA: "bg-[var(--success)]/10 text-[var(--success)]",
    CYBERSECURITE: "bg-destructive/10 text-destructive",
    DBA: "bg-[var(--warning)]/10 text-[var(--warning-foreground)]",
    AUTRE: "bg-muted text-muted-foreground",
}

export default function TypesProjetPage() {
    const { data: types, mutate } = useSWR<TypeProjet[]>("/types-projet", fetcher)
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)

    const filtered = types?.filter(
        (t) =>
            t.libelle.toLowerCase().includes(search.toLowerCase()) ||
            t.code.toLowerCase().includes(search.toLowerCase())
    )

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        try {
            await api.post("/types-projet", {
                code: fd.get("code"),
                libelle: fd.get("libelle"),
                description: fd.get("description"),
            })
            toast.success("Type de projet cree")
            mutate()
            setDialogOpen(false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    async function toggleActif(tp: TypeProjet) {
        try {
            await api.put(`/types-projet/${tp.id}`, { actif: !tp.actif })
            toast.success(tp.actif ? "Type desactive" : "Type active")
            mutate()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Types de projets</h1>
                    <p className="text-sm text-muted-foreground">
                        Gerez les types et leurs taches modeles auto-generees
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau type
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Creer un type de projet</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Code technique</Label>
                                <Input name="code" required placeholder="ex: DEVOPS" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Libelle</Label>
                                <Input name="libelle" required placeholder="ex: DevOps et CI/CD" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Description</Label>
                                <Textarea name="description" />
                            </div>
                            <Button type="submit">Creer</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Rechercher un type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {!filtered ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-5">
                                <div className="h-28 animate-pulse rounded bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16">
                    <Settings className="h-10 w-10 text-muted-foreground" />
                    <p className="text-muted-foreground">Aucun type trouve</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((tp) => {
                        const Icon = typeIcons[tp.code] || Layers
                        return (
                            <Card key={tp.id} className="relative transition-colors hover:border-primary/30">
                                <div className="absolute right-3 top-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => toggleActif(tp)}>
                                                {tp.actif ? "Desactiver" : "Activer"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Link href={`/admin/types-projet/${tp.id}`}>
                                    <CardContent className="flex flex-col gap-4 p-5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                                    typeColors[tp.code] || typeColors["AUTRE"]
                                                }`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-medium">{tp.libelle}</span>
                                                <span className="text-xs text-muted-foreground font-mono">{tp.code}</span>
                                            </div>
                                        </div>
                                        {tp.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">{tp.description}</p>
                                        )}
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <ListTodo className="h-3.5 w-3.5" />
                                                <span>
                          {tp.tachesModeles?.length || 0} tache{(tp.tachesModeles?.length || 0) > 1 ? "s" : ""} modele
                                                    {(tp.tachesModeles?.length || 0) > 1 ? "s" : ""}
                        </span>
                                            </div>
                                            {!tp.actif && (
                                                <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                                                    Inactif
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
