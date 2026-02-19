"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Plus, Search, FolderKanban, Calendar, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PriorityBadge } from "@/components/priority-badge"
import { ProjectStatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fetcher, api } from "@/lib/api"
import type { Projet, Equipe, TypeProjet } from "@/lib/types"
import { initialsFromName } from "@/lib/utils"
import { toast } from "sonner"

export default function ProjetsPage() {
    const { data: projets, mutate } = useSWR<Projet[]>("/projets", fetcher)
    const { data: equipes } = useSWR<Equipe[]>("/equipes", fetcher)
    const { data: types } = useSWR<TypeProjet[]>("/types-projet", fetcher)
    const [search, setSearch] = useState("")
    const [filterStatut, setFilterStatut] = useState<string>("all")
    const [filterType, setFilterType] = useState<string>("all")
    const [dialogOpen, setDialogOpen] = useState(false)

    const filtered = projets?.filter((p) => {
        const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase())
        const matchStatut = filterStatut === "all" || p.statut === filterStatut
        const matchType = filterType === "all" || String(p.typeProjetId) === filterType
        return matchSearch && matchStatut && matchType
    })

    const statCounts = {
        total: projets?.length || 0,
        enCours: projets?.filter((p) => p.statut === "EN_COURS").length || 0,
        termines: projets?.filter((p) => p.statut === "TERMINE").length || 0,
        enRetard: projets?.filter((p) => p.tachesEnRetard > 0).length || 0,
    }

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        try {
            await api.post("/projets", {
                nom: fd.get("nom"),
                description: fd.get("description"),
                equipeId: Number(fd.get("equipeId")),
                typeProjetId: Number(fd.get("typeProjetId")),
                priorite: fd.get("priorite"),
                dateDebut: fd.get("dateDebut") || null,
                dateFinPrevue: fd.get("dateFinPrevue") || null,
            })
            toast.success("Projet cree avec succes")
            mutate()
            setDialogOpen(false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur lors de la creation")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
                    <p className="text-sm text-muted-foreground">{statCounts.total} projets au total, {statCounts.enCours} en cours</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nouveau projet</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Creer un projet</DialogTitle></DialogHeader>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="nom">Nom du projet</Label>
                                <Input id="nom" name="nom" required placeholder="Ex: Migration serveurs" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" placeholder="Decrivez le projet..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label>Equipe</Label>
                                    <select name="equipeId" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                        <option value="">Choisir...</option>
                                        {equipes?.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>Type</Label>
                                    <select name="typeProjetId" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                        <option value="">Choisir...</option>
                                        {types?.map((t) => <option key={t.id} value={t.id}>{t.libelle}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label>Priorite</Label>
                                    <select name="priorite" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                        <option value="BASSE">Basse</option>
                                        <option value="MOYENNE">Moyenne</option>
                                        <option value="HAUTE">Haute</option>
                                        <option value="CRITIQUE">Critique</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>Date debut</Label>
                                    <Input type="date" name="dateDebut" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>Date fin prevue</Label>
                                    <Input type="date" name="dateFinPrevue" />
                                </div>
                            </div>
                            <Button type="submit" className="mt-1">Creer le projet</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border bg-card px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{statCounts.total}</p>
                </div>
                <div className="rounded-lg border bg-card px-4 py-3 border-l-[3px] border-l-primary">
                    <p className="text-xs font-medium text-muted-foreground">En cours</p>
                    <p className="text-xl font-bold text-primary">{statCounts.enCours}</p>
                </div>
                <div className="rounded-lg border bg-card px-4 py-3 border-l-[3px] border-l-[var(--success)]">
                    <p className="text-xs font-medium text-muted-foreground">Termines</p>
                    <p className="text-xl font-bold text-[var(--success)]">{statCounts.termines}</p>
                </div>
                <div className="rounded-lg border bg-card px-4 py-3 border-l-[3px] border-l-destructive">
                    <p className="text-xs font-medium text-muted-foreground">Avec retards</p>
                    <p className="text-xl font-bold text-destructive">{statCounts.enRetard}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Rechercher un projet..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
                </div>
                <Select value={filterStatut} onValueChange={setFilterStatut}>
                    <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="A_FAIRE">A faire</SelectItem>
                        <SelectItem value="EN_COURS">En cours</SelectItem>
                        <SelectItem value="EN_PAUSE">En pause</SelectItem>
                        <SelectItem value="TERMINE">Termine</SelectItem>
                        <SelectItem value="ANNULE">Annule</SelectItem>
                    </SelectContent>
                </Select>
                {types && types.length > 0 && (
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            {types.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.libelle}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Grid */}
            {!filtered ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[...Array(6)].map((_, i) => <Card key={i}><CardContent className="p-5"><div className="h-32 animate-pulse rounded-lg bg-muted" /></CardContent></Card>)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <FolderKanban className="h-12 w-12 text-muted-foreground/40" />
                    <div>
                        <p className="font-medium text-muted-foreground">Aucun projet trouve</p>
                        <p className="text-sm text-muted-foreground/70">Modifiez les filtres ou creez un nouveau projet</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((p) => (
                        <Link key={p.id} href={`/projets/${p.id}`}>
                            <Card className="group transition-all hover:shadow-md hover:border-primary/20">
                                <CardContent className="flex flex-col gap-4 p-5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1 min-w-0">
                                            <h3 className="font-semibold leading-tight truncate group-hover:text-primary transition-colors">{p.nom}</h3>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">{p.typeProjetLibelle}</Badge>
                                                <span className="text-xs text-muted-foreground truncate">{p.equipeNom}</span>
                                            </div>
                                        </div>
                                        <PriorityBadge priority={p.priorite} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Progression</span>
                                            <span className="font-semibold">{p.pourcentageProgression}%</span>
                                        </div>
                                        <Progress value={p.pourcentageProgression} className="h-2" />
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{p.tachesTerminees}/{p.nombreTaches} taches</span>
                                            {p.tachesEnRetard > 0 && (
                                                <span className="text-destructive font-medium">{p.tachesEnRetard} en retard</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 border-t">
                                        <ProjectStatusBadge status={p.statut} />
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-1.5">
                                                {p.membres?.slice(0, 3).map((m) => (
                                                    <Avatar key={m.userId} className="h-6 w-6 border-2 border-card">
                                                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-medium">{initialsFromName(m.nomComplet)}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {(p.membres?.length || 0) > 3 && (
                                                    <Avatar className="h-6 w-6 border-2 border-card">
                                                        <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">+{p.membres.length - 3}</AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                            {p.dateFinPrevue && (
                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(p.dateFinPrevue).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
