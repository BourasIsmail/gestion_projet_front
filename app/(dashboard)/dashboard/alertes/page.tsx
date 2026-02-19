"use client"

import useSWR from "swr"
import Link from "next/link"
import { AlertTriangle, Clock, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { PriorityBadge } from "@/components/priority-badge"
import { TaskStatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { fetcher } from "@/lib/api"
import type { DashboardAlertes } from "@/lib/types"
import { initialsFromName } from "@/lib/utils"

export default function AlertesPage() {
    const { data } = useSWR<DashboardAlertes>("/dashboard/alertes", fetcher)

    const enRetard = data?.tachesEnRetard || []
    const proches = data?.tachesProchesDeadline || []
    const retardMoyen = enRetard.length > 0 ? Math.round(enRetard.reduce((s, t) => s + Math.abs(t.joursRetard || 0), 0) / enRetard.length) : 0

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon" className="rounded-full"><Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Alertes et retards</h1>
                    <p className="text-sm text-muted-foreground">Suivi des taches en retard et proches de la deadline</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard title="Taches en retard" value={enRetard.length} icon={AlertTriangle} variant="destructive" />
                <StatCard title="Retard moyen" value={`${retardMoyen}j`} icon={Clock} variant="warning" />
                <StatCard title="Proches deadline" value={proches.length} icon={Clock} variant="default" />
            </div>

            <Card className="overflow-hidden">
                <CardHeader className="border-b bg-destructive/5">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        Taches en retard
                        <Badge variant="destructive" className="ml-auto">{enRetard.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b bg-muted/30">
                                <th className="p-3 text-left font-medium text-muted-foreground">Tache</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Projet</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Priorite</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Echeance</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Retard</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Assignees</th>
                            </tr></thead>
                            <tbody>
                            {enRetard.map((t) => (
                                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="p-3"><Link href={`/taches/${t.id}`} className="font-medium text-foreground hover:text-primary transition-colors">{t.titre}</Link></td>
                                    <td className="p-3 text-muted-foreground">{t.projetNom}</td>
                                    <td className="p-3"><PriorityBadge priority={t.priorite} /></td>
                                    <td className="p-3 text-muted-foreground">{t.dateEcheance}</td>
                                    <td className="p-3"><span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">{Math.abs(t.joursRetard || 0)}j</span></td>
                                    <td className="p-3">
                                        <div className="flex -space-x-1">
                                            {t.assignees?.slice(0, 3).map((a) => (
                                                <Avatar key={a.userId} className="h-6 w-6 border-2 border-card">
                                                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{initialsFromName(a.nomComplet)}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {enRetard.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Aucune tache en retard</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="border-b bg-[var(--warning)]/5">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[var(--warning-foreground)]" />
                        Proches de la deadline
                        <Badge className="ml-auto bg-[var(--warning)] text-[var(--warning-foreground)]">{proches.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b bg-muted/30">
                                <th className="p-3 text-left font-medium text-muted-foreground">Tache</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Projet</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Priorite</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Echeance</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Jours restants</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Statut</th>
                            </tr></thead>
                            <tbody>
                            {proches.map((t) => (
                                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="p-3"><Link href={`/taches/${t.id}`} className="font-medium text-foreground hover:text-primary transition-colors">{t.titre}</Link></td>
                                    <td className="p-3 text-muted-foreground">{t.projetNom}</td>
                                    <td className="p-3"><PriorityBadge priority={t.priorite} /></td>
                                    <td className="p-3 text-muted-foreground">{t.dateEcheance}</td>
                                    <td className="p-3"><span className="inline-flex items-center rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--warning-foreground)]">{t.joursRetard}j</span></td>
                                    <td className="p-3"><TaskStatusBadge status={t.statut} /></td>
                                </tr>
                            ))}
                            {proches.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Aucune tache proche de la deadline</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
