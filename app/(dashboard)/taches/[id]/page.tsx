"use client"

import { use, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
    ArrowLeft, Calendar, Clock, Users, RefreshCw, Send,
    Repeat, AlertTriangle, CheckCircle2, Layers,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PriorityBadge } from "@/components/priority-badge"
import { TaskStatusBadge } from "@/components/status-badge"
import { fetcher, api } from "@/lib/api"
import type { Tache } from "@/lib/types"
import { initials, initialsFromName, cn } from "@/lib/utils"
import { toast } from "sonner"

interface Commentaire {
    id: number
    contenu: string
    auteurNom: string
    auteurPrenom: string
    dateCreation: string
}

const periodiciteLabels: Record<string, string> = {
    CONTINU: "Continu",
    HEBDOMADAIRE: "Hebdomadaire",
    MENSUEL: "Mensuel",
    TRIMESTRIEL: "Trimestriel",
    SEMESTRIEL: "Semestriel",
    ANNUEL: "Annuel",
    A_LA_DEMANDE: "A la demande",
}

export default function TacheDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: tache, mutate } = useSWR<Tache>(`/taches/${id}`, fetcher)
    const { data: commentaires, mutate: mutateComments } = useSWR<Commentaire[]>(`/taches/${id}/commentaires`, fetcher)
    const { data: occurrences } = useSWR<Tache[]>(tache?.estRecurrente ? `/taches/${id}/occurrences` : null, fetcher)
    const [comment, setComment] = useState("")
    const [sending, setSending] = useState(false)

    async function handleStatusChange(newStatut: string) {
        try {
            await api.put(`/taches/${id}`, { statut: newStatut })
            toast.success("Statut mis a jour")
            mutate()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    async function handleComment(e: React.FormEvent) {
        e.preventDefault()
        if (!comment.trim()) return
        setSending(true)
        try {
            await api.post(`/taches/${id}/commentaires`, { contenu: comment })
            setComment("")
            mutateComments()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        } finally {
            setSending(false)
        }
    }

    async function handleGenerateOccurrence() {
        try {
            await api.post(`/taches/${id}/generer-occurrence`)
            toast.success("Nouvelle occurrence generee")
            mutate()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    if (!tache) {
        return (
            <div className="flex flex-col gap-6">
                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="h-60 animate-pulse rounded-lg bg-muted lg:col-span-2" />
                    <div className="h-60 animate-pulse rounded-lg bg-muted" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button asChild variant="ghost" size="icon" className="mt-1 shrink-0">
                    <Link href={`/projets/${tache.projetId}`}><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">{tache.titre}</h1>
                        {tache.estRecurrente && (
                            <Badge variant="outline" className="bg-[var(--chart-5)]/10 text-[var(--chart-5)] border-[var(--chart-5)]/20 gap-1">
                                <Repeat className="h-3 w-3" />Recurrente
                            </Badge>
                        )}
                        {tache.enRetard && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                                <AlertTriangle className="h-3 w-3" />{Math.abs(tache.joursRetard || 0)}j retard
                            </Badge>
                        )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href={`/projets/${tache.projetId}`} className="hover:text-primary transition-colors hover:underline">{tache.projetNom}</Link>
                        {tache.typeProjetLibelle && (
                            <>
                                <span className="text-muted-foreground/40">/</span>
                                <span>{tache.typeProjetLibelle}</span>
                            </>
                        )}
                    </div>
                </div>
                <PriorityBadge priority={tache.priorite} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main content */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                    {tache.description && (
                        <Card>
                            <CardContent className="p-5">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{tache.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recurring tasks section */}
                    {tache.estRecurrente && (
                        <Card className="border-l-[3px] border-l-[var(--chart-5)]">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Repeat className="h-4 w-4 text-[var(--chart-5)]" />
                                        Tache periodique
                                    </CardTitle>
                                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleGenerateOccurrence}>
                                        <RefreshCw className="h-3 w-3" />Generer occurrence
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="rounded-lg border p-3">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Periodicite</p>
                                        <p className="mt-1 text-sm font-semibold">{tache.periodicite ? periodiciteLabels[tache.periodicite] || tache.periodicite : "-"}</p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Occurrence</p>
                                        <p className="mt-1 text-sm font-semibold">#{tache.occurrenceNumero || 0}</p>
                                    </div>
                                    {tache.prochaineOccurrence && (
                                        <div className="rounded-lg border p-3">
                                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Prochaine</p>
                                            <p className="mt-1 text-sm font-semibold">{new Date(tache.prochaineOccurrence).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
                                        </div>
                                    )}
                                    {tache.dureeEstimeeHeures != null && (
                                        <div className="rounded-lg border p-3">
                                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Duree estimee</p>
                                            <p className="mt-1 text-sm font-semibold">{tache.dureeEstimeeHeures}h</p>
                                        </div>
                                    )}
                                </div>

                                {tache.regleRecurrence && (
                                    <div className="rounded-lg bg-accent/50 px-3 py-2 text-sm">
                                        <span className="text-muted-foreground">Regle: </span>
                                        <span className="font-medium">{tache.regleRecurrence}</span>
                                    </div>
                                )}

                                {occurrences && occurrences.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                            Historique ({occurrences.length} occurrences)
                                        </p>
                                        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto rounded-lg border p-2">
                                            {occurrences.map((o) => (
                                                <Link key={o.id} href={`/taches/${o.id}`} className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent/50 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-muted-foreground">#{o.occurrenceNumero}</span>
                                                        <span className="font-medium">{o.titre}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {o.dateEcheance && <span className="text-xs text-muted-foreground">{new Date(o.dateEcheance).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>}
                                                        <TaskStatusBadge status={o.statut} />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Sub-tasks */}
                    {tache.sousTaches && tache.sousTaches.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Layers className="h-4 w-4" />
                                    Sous-taches ({tache.sousTaches.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    {tache.sousTaches.map((st) => (
                                        <Link key={st.id} href={`/taches/${st.id}`} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/30">
                                            <div className={cn("h-2 w-2 rounded-full shrink-0", st.statut === "TERMINEE" ? "bg-[var(--success)]" : st.enRetard ? "bg-destructive" : "bg-primary")} />
                                            <span className="flex-1 text-sm font-medium">{st.titre}</span>
                                            <TaskStatusBadge status={st.statut} />
                                            <PriorityBadge priority={st.priorite} />
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Comments */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Commentaires ({commentaires?.length || 0})</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <form onSubmit={handleComment} className="flex gap-2">
                                <Textarea
                                    placeholder="Ajouter un commentaire..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="min-h-[60px] resize-none"
                                />
                                <Button type="submit" size="icon" className="shrink-0 self-end" disabled={sending || !comment.trim()}>
                                    <Send className="h-4 w-4" />
                                    <span className="sr-only">Envoyer</span>
                                </Button>
                            </form>
                            {(!commentaires || commentaires.length === 0) && (
                                <p className="py-4 text-center text-sm text-muted-foreground">Aucun commentaire</p>
                            )}
                            {commentaires?.map((c) => (
                                <div key={c.id} className="flex gap-3 rounded-lg border p-3">
                                    <Avatar className="h-7 w-7 shrink-0">
                                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">{initials(c.auteurPrenom, c.auteurNom)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">{c.auteurPrenom} {c.auteurNom}</span>
                                            <span className="text-[11px] text-muted-foreground">
                        {new Date(c.dateCreation).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{c.contenu}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-4">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">Details</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Statut</p>
                                <Select value={tache.statut} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PLANIFIEE">Planifiee</SelectItem>
                                        <SelectItem value="A_FAIRE">A faire</SelectItem>
                                        <SelectItem value="EN_COURS">En cours</SelectItem>
                                        <SelectItem value="EN_REVUE">En revue</SelectItem>
                                        <SelectItem value="TERMINEE">Terminee</SelectItem>
                                        <SelectItem value="BLOQUEE">Bloquee</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Progression</p>
                                <div className="flex items-center gap-3">
                                    <Progress value={tache.pourcentage} className="h-2 flex-1" />
                                    <span className="text-sm font-bold">{tache.pourcentage}%</span>
                                </div>
                            </div>

                            <div className="space-y-3 border-t pt-3">
                                <div className="flex items-center gap-2.5 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-[11px] text-muted-foreground">Date de debut</p>
                                        <p className="font-medium">{tache.dateDebut ? new Date(tache.dateDebut).toLocaleDateString("fr-FR") : "Non definie"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-[11px] text-muted-foreground">Echeance</p>
                                        <p className={cn("font-medium", tache.enRetard && "text-destructive")}>
                                            {tache.dateEcheance ? new Date(tache.dateEcheance).toLocaleDateString("fr-FR") : "Non definie"}
                                        </p>
                                    </div>
                                </div>
                                {tache.dateFinReelle && (
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
                                        <div>
                                            <p className="text-[11px] text-muted-foreground">Completee le</p>
                                            <p className="font-medium">{new Date(tache.dateFinReelle).toLocaleDateString("fr-FR")}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4" /> Assignees
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!tache.assignees || tache.assignees.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-4">
                                    <Users className="h-6 w-6 text-muted-foreground/30" />
                                    <p className="text-xs text-muted-foreground">Aucun assignee</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {tache.assignees.map((a) => (
                                        <div key={a.userId} className="flex items-center gap-2.5 rounded-lg border p-2.5">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">{initialsFromName(a.nomComplet)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{a.nomComplet}</p>
                                                <p className="text-[11px] text-muted-foreground">{a.email}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] shrink-0">{a.roleTache}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
