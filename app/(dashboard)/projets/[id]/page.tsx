"use client"

import { use, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft, Plus, Users, Calendar, LayoutGrid, List,
    Clock, Repeat, CheckCircle2, AlertTriangle, Ban, Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PriorityBadge } from "@/components/priority-badge"
import { ProjectStatusBadge, TaskStatusBadge } from "@/components/status-badge"
import { KanbanBoard } from "@/components/kanban-board"
import { fetcher, api } from "@/lib/api"
import type { Projet, Tache } from "@/lib/types"
import { initialsFromName } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function ProjetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { isAdmin, isMembre } = useAuth()
    const router = useRouter()
    const { data: projet, mutate } = useSWR<Projet>(`/projets/${id}`, fetcher)
    const { data: taches, mutate: mutateTaches } = useSWR<Tache[]>(`/taches?projetId=${id}`, fetcher)
    const [addDialogOpen, setAddDialogOpen] = useState(false)

    const recurrentes = taches?.filter((t) => t.estRecurrente) || []
    const enRetard = taches?.filter((t) => t.enRetard) || []

    async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        try {
            await api.post("/taches", {
                titre: fd.get("titre"),
                description: fd.get("description"),
                projetId: Number(id),
                priorite: fd.get("priorite"),
                dateDebut: fd.get("dateDebut") || null,
                dateEcheance: fd.get("dateEcheance") || null,
                estRecurrente: fd.get("estRecurrente") === "on",
                periodicite: fd.get("periodicite") || null,
            })
            toast.success("Tache creee avec succes")
            mutateTaches()
            setAddDialogOpen(false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    async function handleCancel() {
        if (!projet || !confirm("Annuler ce projet ? Le statut sera change en ANNULE.")) return
        try {
            await api.put(`/projets/${projet.id}`, { ...projet, statut: "ANNULE" })
            toast.success("Projet annule")
            mutate()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur lors de l'annulation")
        }
    }

    async function handleDeleteProjet() {
        if (!projet || !confirm("Supprimer definitivement ce projet ? Cette action est irreversible.")) return
        try {
            await api.delete(`/projets/${projet.id}`)
            toast.success("Projet supprime")
            router.push("/projets")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression")
        }
    }

    if (!projet) {
        return (
            <div className="flex flex-col gap-6">
                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button asChild variant="ghost" size="icon" className="mt-1 shrink-0">
                    <Link href="/projets"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">{projet.nom}</h1>
                        <ProjectStatusBadge status={projet.statut} />
                        <PriorityBadge priority={projet.priorite} />
                        {isAdmin && (
                            <div className="ml-auto flex items-center gap-1">
                                {projet.statut !== "ANNULE" && (
                                    <Button variant="outline" size="sm" className="gap-1.5 text-[var(--warning-foreground)] border-[var(--warning)]/30 hover:bg-[var(--warning)]/10" onClick={handleCancel}>
                                        <Ban className="h-3.5 w-3.5" />Annuler
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleDeleteProjet}>
                                    <Trash2 className="h-3.5 w-3.5" />Supprimer
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{projet.typeProjetLibelle}</Badge>
                        <span>{projet.equipeNom}</span>
                    </div>
                </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Card className="border-l-[3px] border-l-primary">
                    <CardContent className="p-4">
                        <p className="text-xs font-medium text-muted-foreground">Progression</p>
                        <p className="text-xl font-bold">{projet.pourcentageProgression}%</p>
                        <Progress value={projet.pourcentageProgression} className="mt-2 h-1.5" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--info)]/10">
                            <CheckCircle2 className="h-4 w-4 text-[var(--info)]" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Taches</p>
                            <p className="text-lg font-bold">{projet.tachesTerminees}<span className="text-sm font-normal text-muted-foreground">/{projet.nombreTaches}</span></p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">En retard</p>
                            <p className="text-lg font-bold text-destructive">{enRetard.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Echeance</p>
                            <p className="text-sm font-medium">{projet.dateFinPrevue ? new Date(projet.dateFinPrevue).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "Non definie"}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-2">Membres</p>
                        <div className="flex -space-x-1.5">
                            {projet.membres?.slice(0, 6).map((m) => (
                                <Avatar key={m.userId} className="h-7 w-7 border-2 border-card" title={m.nomComplet}>
                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">{initialsFromName(m.nomComplet)}</AvatarFallback>
                                </Avatar>
                            ))}
                            {(projet.membres?.length || 0) > 6 && (
                                <Avatar className="h-7 w-7 border-2 border-card">
                                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">+{projet.membres.length - 6}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {projet.description && (
                <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground leading-relaxed">{projet.description}</p></CardContent></Card>
            )}

            {/* Recurring tasks summary */}
            {recurrentes.length > 0 && (
                <Card className="border-l-[3px] border-l-[var(--chart-5)]">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Repeat className="h-4 w-4 text-[var(--chart-5)]" />
                            <h3 className="text-sm font-semibold">Taches recurrentes</h3>
                            <Badge variant="outline" className="bg-[var(--chart-5)]/10 text-[var(--chart-5)] border-[var(--chart-5)]/20 text-[10px]">
                                {recurrentes.length}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recurrentes.map((t) => (
                                <Link key={t.id} href={`/taches/${t.id}`} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent/50">
                                    <span className="font-medium">{t.titre}</span>
                                    <Badge variant="outline" className="text-[9px] px-1 py-0">{t.periodicite?.replace("_", " ").toLowerCase()}</Badge>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="kanban">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="kanban" className="gap-1.5"><LayoutGrid className="h-3.5 w-3.5" />Kanban</TabsTrigger>
                        <TabsTrigger value="liste" className="gap-1.5"><List className="h-3.5 w-3.5" />Liste</TabsTrigger>
                    </TabsList>
                    {!isMembre && <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Ajouter une tache</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Nouvelle tache</DialogTitle></DialogHeader>
                            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2"><Label>Titre</Label><Input name="titre" required placeholder="Titre de la tache" /></div>
                                <div className="flex flex-col gap-2"><Label>Description</Label><Textarea name="description" placeholder="Decrivez la tache..." /></div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label>Priorite</Label>
                                        <select name="priorite" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                            <option value="BASSE">Basse</option><option value="MOYENNE">Moyenne</option>
                                            <option value="HAUTE">Haute</option><option value="CRITIQUE">Critique</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2"><Label>Debut</Label><Input type="date" name="dateDebut" /></div>
                                    <div className="flex flex-col gap-2"><Label>Echeance</Label><Input type="date" name="dateEcheance" /></div>
                                </div>
                                <div className="flex items-center gap-4 border rounded-lg p-3">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" name="estRecurrente" className="rounded border-input" />
                                        <Repeat className="h-3.5 w-3.5 text-[var(--chart-5)]" />
                                        Tache recurrente
                                    </label>
                                    <select name="periodicite" className="flex h-8 rounded-md border border-input bg-transparent px-2 text-xs">
                                        <option value="">Periodicite...</option>
                                        <option value="HEBDOMADAIRE">Hebdomadaire</option>
                                        <option value="MENSUEL">Mensuel</option>
                                        <option value="TRIMESTRIEL">Trimestriel</option>
                                        <option value="SEMESTRIEL">Semestriel</option>
                                        <option value="ANNUEL">Annuel</option>
                                    </select>
                                </div>
                                <Button type="submit">Creer la tache</Button>
                            </form>
                        </DialogContent>
                    </Dialog>}
                </div>

                <TabsContent value="kanban" className="mt-4">
                    <div className="overflow-x-auto -mx-2 px-2 pb-2">
                        <KanbanBoard
                            taches={taches || []}
                            onUpdate={() => mutateTaches()}
                            visibleColumns={["PLANIFIEE", "A_FAIRE", "EN_COURS", "EN_REVUE", "TERMINEE", "BLOQUEE"]}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="liste" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Titre</th>
                                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priorite</th>
                                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Echeance</th>
                                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignees</th>
                                        <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">%</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {taches?.map((t) => (
                                        <tr key={t.id} className="border-b last:border-0 transition-colors hover:bg-accent/30">
                                            <td className="p-3">
                                                <Link href={`/taches/${t.id}`} className="flex items-center gap-2 font-medium hover:text-primary transition-colors">
                                                    {t.titre}
                                                    {t.estRecurrente && <Repeat className="h-3 w-3 text-[var(--chart-5)]" />}
                                                </Link>
                                            </td>
                                            <td className="p-3"><TaskStatusBadge status={t.statut} /></td>
                                            <td className="p-3"><PriorityBadge priority={t.priorite} /></td>
                                            <td className="p-3">
                                                {t.dateEcheance ? (
                                                    <span className={t.enRetard ? "text-destructive font-medium" : "text-muted-foreground"}>
                              {new Date(t.dateEcheance).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                            </span>
                                                ) : <span className="text-muted-foreground">-</span>}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex -space-x-1">
                                                    {t.assignees?.slice(0, 3).map((a) => (
                                                        <Avatar key={a.userId} className="h-5 w-5 border border-card">
                                                            <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{initialsFromName(a.nomComplet)}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Progress value={t.pourcentage} className="h-1.5 w-12" />
                                                    <span className="text-xs text-muted-foreground">{t.pourcentage}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
