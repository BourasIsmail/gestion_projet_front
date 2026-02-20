"use client"

import { useState } from "react"
import useSWR from "swr"
import { Download, FolderKanban, Users, AlertTriangle, Globe, User, FileBarChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, fetcher } from "@/lib/api"
import type { Projet, Equipe, User as UserType } from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { ShieldAlert } from "lucide-react"

const reports = [
    { id: "global", title: "Rapport global", description: "Vue d'ensemble de tous les projets, equipes et taches", icon: Globe, needsParam: false, color: "text-primary bg-primary/10" },
    { id: "projet", title: "Rapport projet", description: "Details et progression d'un projet specifique", icon: FolderKanban, needsParam: true, paramType: "projet" as const, color: "text-[var(--info)] bg-[var(--info)]/10" },
    { id: "equipe", title: "Rapport equipe", description: "Performance et charge de travail d'une equipe", icon: Users, needsParam: true, paramType: "equipe" as const, color: "text-[var(--chart-5)] bg-[var(--chart-5)]/10" },
    { id: "alertes", title: "Rapport alertes", description: "Taches en retard et proches de la deadline", icon: AlertTriangle, needsParam: false, color: "text-destructive bg-destructive/10" },
    { id: "utilisateur", title: "Rapport utilisateur", description: "Taches et activites d'un utilisateur", icon: User, needsParam: true, paramType: "user" as const, color: "text-[var(--success)] bg-[var(--success)]/10" },
]

export default function RapportsPage() {
    const { isMembre } = useAuth()
    const { data: projets } = useSWR<Projet[]>(isMembre ? null : "/projets", fetcher)
    const { data: equipes } = useSWR<Equipe[]>(isMembre ? null : "/equipes", fetcher)
    const { data: users } = useSWR<UserType[]>(isMembre ? null : "/users", fetcher)
    const [params, setParams] = useState<Record<string, string>>({})
    const [generating, setGenerating] = useState<string | null>(null)

    if (isMembre) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold">Acces restreint</h2>
                    <p className="text-sm text-muted-foreground">Vous n{"'"}avez pas les permissions pour acceder aux rapports.</p>
                </div>
            </div>
        )
    }

    async function handleDownload(reportId: string) {
        setGenerating(reportId)
        try {
            let path = ""
            switch (reportId) {
                case "global": path = "/rapports/global"; break
                case "projet": path = `/rapports/projet/${params.projet}`; break
                case "equipe": path = `/rapports/equipe/${params.equipe}`; break
                case "alertes": path = "/rapports/alertes"; break
                case "utilisateur": path = `/rapports/utilisateur/${params.user}`; break
            }
            await api.downloadPdf(path, `rapport-${reportId}.pdf`)
            toast.success("Rapport telecharge avec succes")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur lors de la generation")
        } finally {
            setGenerating(null)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
                    <p className="text-sm text-muted-foreground">Generez et telechargez des rapports PDF detailles</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <FileBarChart className="h-5 w-5 text-primary" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {reports.map((r) => (
                    <Card key={r.id} className="group transition-all hover:shadow-md hover:border-primary/20">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", r.color)}>
                                    <r.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{r.title}</CardTitle>
                                    <CardDescription className="text-xs">{r.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex items-end gap-3">
                            {r.needsParam && r.paramType === "projet" && (
                                <div className="flex-1">
                                    <Select value={params.projet || ""} onValueChange={(v) => setParams((p) => ({ ...p, projet: v }))}>
                                        <SelectTrigger className="h-9"><SelectValue placeholder="Choisir un projet" /></SelectTrigger>
                                        <SelectContent>
                                            {projets?.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nom}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {r.needsParam && r.paramType === "equipe" && (
                                <div className="flex-1">
                                    <Select value={params.equipe || ""} onValueChange={(v) => setParams((p) => ({ ...p, equipe: v }))}>
                                        <SelectTrigger className="h-9"><SelectValue placeholder="Choisir une equipe" /></SelectTrigger>
                                        <SelectContent>
                                            {equipes?.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.nom}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {r.needsParam && r.paramType === "user" && (
                                <div className="flex-1">
                                    <Select value={params.user || ""} onValueChange={(v) => setParams((p) => ({ ...p, user: v }))}>
                                        <SelectTrigger className="h-9"><SelectValue placeholder="Choisir un utilisateur" /></SelectTrigger>
                                        <SelectContent>
                                            {users?.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.prenom} {u.nom}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {!r.needsParam && <div className="flex-1" />}
                            <Button
                                size="sm"
                                className="gap-2"
                                onClick={() => handleDownload(r.id)}
                                disabled={generating === r.id || (r.needsParam && !params[r.paramType!])}
                            >
                                <Download className="h-3.5 w-3.5" />
                                {generating === r.id ? "Generation..." : "Telecharger PDF"}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
