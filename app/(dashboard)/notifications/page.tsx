"use client"

import useSWR from "swr"
import { Bell, Check, CheckCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetcher, api } from "@/lib/api"
import type { Notification } from "@/lib/types"
import { toast } from "sonner"

interface PageResponse<T> {
    content: T[]
    totalPages: number
    totalElements: number
    number: number
}

const typeIcons: Record<string, string> = {
    ALERTE: "bg-destructive/10 text-destructive",
    TACHE: "bg-primary/10 text-primary",
    PROJET: "bg-[var(--chart-2)]/10 text-[var(--chart-2)]",
    RECURRENCE: "bg-[var(--chart-3)]/10 text-[var(--chart-3)]",
    INFO: "bg-muted text-muted-foreground",
    SYSTEME: "bg-muted text-muted-foreground",
    COMMENTAIRE: "bg-[var(--chart-5)]/10 text-[var(--chart-5)]",
}

export default function NotificationsPage() {
    const { data, mutate } = useSWR<PageResponse<Notification>>("/notifications?size=50&sort=dateCreation,desc", fetcher)
    const notifications = data?.content || []
    const unreadCount = notifications.filter((n) => !n.lue).length

    async function markAsRead(id: number) {
        try {
            await api.put(`/notifications/${id}/lue`)
            mutate()
        } catch { /* ignore */ }
    }

    async function markAllRead() {
        try {
            await api.put("/notifications/tout-lire")
            toast.success("Toutes les notifications marquees comme lues")
            mutate()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
                    <p className="text-sm text-muted-foreground">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllRead}>
                        <CheckCheck className="mr-2 h-4 w-4" />Tout marquer comme lu
                    </Button>
                )}
            </div>

            {!data ? (
                <div className="flex flex-col gap-2">
                    {[...Array(5)].map((_, i) => <Card key={i}><CardContent className="p-4"><div className="h-12 animate-pulse rounded bg-muted" /></CardContent></Card>)}
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16">
                    <Bell className="h-10 w-10 text-muted-foreground" />
                    <p className="text-muted-foreground">Aucune notification</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {notifications.map((n) => (
                        <Card key={n.id} className={!n.lue ? "border-primary/20 bg-primary/[0.02]" : ""}>
                            <CardContent className="flex items-start gap-3 p-4">
                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${typeIcons[n.type] || typeIcons.SYSTEME}`}>
                                    <Bell className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{n.titre}</p>
                                        {!n.lue && <Badge className="h-4 px-1 text-[10px] bg-primary text-primary-foreground">Nouveau</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{n.message}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(n.dateCreation).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                                </div>
                                {!n.lue && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(n.id)}>
                                        <Check className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
