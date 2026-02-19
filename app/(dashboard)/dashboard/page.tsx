"use client"

import useSWR from "swr"
import Link from "next/link"
import {
    FolderKanban, ListTodo, AlertTriangle, CheckCircle2, Clock,
    TrendingUp, Users2, Repeat, ArrowRight, Calendar,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/stat-card"
import { PriorityBadge } from "@/components/priority-badge"
import { TaskStatusBadge } from "@/components/status-badge"
import { fetcher } from "@/lib/api"
import type { DashboardStats, DashboardAlertes, Tache } from "@/lib/types"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts"

export default function DashboardPage() {
    const { data: stats, isLoading } = useSWR<DashboardStats>("/dashboard/stats", fetcher)
    const { data: mesTaches } = useSWR<Tache[]>("/dashboard/mes-taches", fetcher)
    const { data: alertesData } = useSWR<DashboardAlertes>("/dashboard/alertes", fetcher)
    const { data: recurrentes } = useSWR<Tache[]>("/taches/recurrentes", fetcher)

    const alertes = [
        ...(alertesData?.tachesEnRetard || []),
        ...(alertesData?.tachesProchesDeadline || []),
    ]

    if (isLoading || !stats) {
        return (
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}><CardContent className="p-5"><div className="h-16 animate-pulse rounded-lg bg-muted" /></CardContent></Card>
                    ))}
                </div>
            </div>
        )
    }

    const tauxCompletion = stats.totalTaches > 0
        ? Math.round((stats.tachesTerminees / stats.totalTaches) * 100)
        : 0

    const chartData = [
        { name: "Actifs", value: stats.projetsActifs, fill: "var(--color-chart-1)" },
        { name: "Termines", value: stats.projetsTermines, fill: "var(--color-chart-2)" },
        { name: "Retard", value: stats.tachesEnRetard, fill: "var(--color-chart-4)" },
        { name: "Equipes", value: stats.totalEquipes, fill: "var(--color-chart-3)" },
    ]

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
                    <p className="text-sm text-muted-foreground">Vue d{"'"}ensemble de vos projets et taches</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/rapports">Generer un rapport</Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/projets">Voir les projets</Link>
                    </Button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Projets actifs" value={stats.projetsActifs} icon={FolderKanban} description={`${stats.totalProjets} au total`} />
                <StatCard title="Taches en cours" value={stats.totalTaches - stats.tachesTerminees} icon={ListTodo} variant="info" description={`${stats.totalTaches} au total`} />
                <StatCard title="En retard" value={stats.tachesEnRetard} icon={AlertTriangle} variant="destructive" />
                <StatCard title="Completion" value={`${tauxCompletion}%`} icon={TrendingUp} variant="success" />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Chart */}
                <Card className="xl:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Indicateurs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData} barSize={32}>
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                                <Tooltip cursor={{ fill: "var(--color-accent)", radius: 4 }} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={index} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* My tasks */}
                <Card className="xl:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Mes taches</CardTitle>
                                <CardDescription>{mesTaches?.length || 0} taches assignees</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                                <Link href="/projets">Voir tout <ArrowRight className="h-3 w-3" /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!mesTaches || mesTaches.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Aucune tache assignee</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {mesTaches.slice(0, 5).map((t) => (
                                    <Link key={t.id} href={`/taches/${t.id}`} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50">
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium leading-none truncate">{t.titre}</p>
                                                {t.estRecurrente && <Repeat className="h-3 w-3 shrink-0 text-[var(--chart-5)]" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{t.projetNom}</p>
                                        </div>
                                        <TaskStatusBadge status={t.statut} />
                                        <PriorityBadge priority={t.priorite} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Alerts */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                Alertes
                                {alertes.length > 0 && (
                                    <Badge variant="outline" className="ml-1 bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                                        {alertes.length}
                                    </Badge>
                                )}
                            </CardTitle>
                            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                                <Link href="/dashboard/alertes">Voir toutes <ArrowRight className="h-3 w-3" /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {alertes.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8">
                                <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
                                <p className="text-sm text-muted-foreground">Aucune alerte active</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {alertes.slice(0, 4).map((t) => (
                                    <Link key={t.id} href={`/taches/${t.id}`} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50">
                                        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${t.enRetard ? "bg-destructive" : "bg-[var(--warning)]"}`} />
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                            <p className="text-sm font-medium truncate">{t.titre}</p>
                                            <p className="text-xs text-muted-foreground">{t.projetNom}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs shrink-0">
                                            <Clock className="h-3 w-3" />
                                            <span className={t.enRetard ? "text-destructive font-medium" : "text-[var(--warning-foreground)]"}>
                        {t.enRetard ? `${Math.abs(t.joursRetard || 0)}j retard` : `${t.joursRetard}j`}
                      </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recurring tasks */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Repeat className="h-4 w-4 text-[var(--chart-5)]" />
                                Taches recurrentes
                                {recurrentes && recurrentes.length > 0 && (
                                    <Badge variant="outline" className="ml-1 bg-[var(--chart-5)]/10 text-[var(--chart-5)] border-[var(--chart-5)]/20 text-[10px]">
                                        {recurrentes.length}
                                    </Badge>
                                )}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!recurrentes || recurrentes.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8">
                                <Repeat className="h-8 w-8 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground">Aucune tache recurrente</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {recurrentes.slice(0, 4).map((t) => (
                                    <Link key={t.id} href={`/taches/${t.id}`} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--chart-5)]/10">
                                            <Calendar className="h-3.5 w-3.5 text-[var(--chart-5)]" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                            <p className="text-sm font-medium truncate">{t.titre}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                    {t.periodicite?.replace("_", " ").toLowerCase()}
                                                </Badge>
                                                {t.prochaineOccurrence && (
                                                    <span className="text-[11px] text-muted-foreground">
                            Prochaine: {new Date(t.prochaineOccurrence).toLocaleDateString("fr-FR")}
                          </span>
                                                )}
                                            </div>
                                        </div>
                                        <TaskStatusBadge status={t.statut} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
