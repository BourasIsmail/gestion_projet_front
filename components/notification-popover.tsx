"use client"

import { useState } from "react"
import useSWR from "swr"
import { Bell, CheckCheck, Clock, AlertTriangle, MessageSquare, Repeat, Info, Cog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { fetcher, api } from "@/lib/api"
import type { Notification } from "@/lib/types"

interface PageResponse<T> {
    content: T[]
    totalPages: number
    totalElements: number
    number: number
}

const typeConfig: Record<string, { icon: typeof Bell; className: string }> = {
    ALERTE: { icon: AlertTriangle, className: "text-destructive bg-destructive/10" },
    TACHE: { icon: Clock, className: "text-primary bg-primary/10" },
    PROJET: { icon: Info, className: "text-[var(--info)] bg-[var(--info)]/10" },
    RECURRENCE: { icon: Repeat, className: "text-[var(--chart-5)] bg-[var(--chart-5)]/10" },
    INFO: { icon: Info, className: "text-[var(--info)] bg-[var(--info)]/10" },
    SYSTEME: { icon: Cog, className: "text-muted-foreground bg-muted" },
    COMMENTAIRE: { icon: MessageSquare, className: "text-[var(--chart-3)] bg-[var(--chart-3)]/10" },
}

function buildLink(n: Notification): string | null {
    if (!n.referenceType || !n.referenceId) return null
    const map: Record<string, string> = {
        PROJET: "/projets",
        TACHE: "/taches",
        EQUIPE: "/equipes",
    }
    const base = map[n.referenceType]
    return base ? `${base}/${n.referenceId}` : null
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "A l'instant"
    if (mins < 60) return `${mins}min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}j`
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export function NotificationPopover() {
    const [open, setOpen] = useState(false)
    const { data, mutate } = useSWR<PageResponse<Notification>>(
        "/notifications?size=20&sort=dateCreation,desc",
        fetcher,
        { refreshInterval: 30000 }
    )
    const notifications = data?.content || []
    const unreadCount = notifications.filter((n) => !n.lue).length

    async function markAsRead(id: number) {
        await api.put(`/notifications/${id}/lue`)
        mutate()
    }

    async function markAllRead() {
        await api.put("/notifications/tout-lire")
        mutate()
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-[18px] w-[18px]" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0" sideOffset={8}>
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs text-primary" onClick={markAllRead}>
                            <CheckCheck className="mr-1 h-3 w-3" />
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                <ScrollArea className="max-h-[420px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12">
                            <Bell className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">Aucune notification</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => {
                                const config = typeConfig[n.type] || typeConfig.SYSTEME
                                const Icon = config.icon
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => {
                                            if (!n.lue) markAsRead(n.id)
                                            const href = buildLink(n)
                                            if (href) {
                                                setOpen(false)
                                                window.location.href = href
                                            }
                                        }}
                                        className={cn(
                                            "flex gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 border-b border-border/50 last:border-0",
                                            !n.lue && "bg-primary/[0.03]"
                                        )}
                                    >
                                        <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config.className)}>
                                            <Icon className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn("text-sm leading-tight", !n.lue ? "font-medium" : "text-muted-foreground")}>
                                                    {n.titre}
                                                </p>
                                                {!n.lue && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                            <p className="mt-1 text-[11px] text-muted-foreground/70">{timeAgo(n.dateCreation)}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <div className="border-t px-4 py-2.5 text-center">
                        <span className="text-[11px] text-muted-foreground">{data?.totalElements || 0} notification(s) au total</span>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
