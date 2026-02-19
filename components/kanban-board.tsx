"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { GripVertical, Clock, AlertTriangle, RotateCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PriorityBadge } from "@/components/priority-badge"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { Tache, StatutTache } from "@/lib/types"
import { initialsFromName } from "@/lib/utils"

interface KanbanColumn {
    key: StatutTache
    label: string
    color: string
    dotColor: string
}

const COLUMNS: KanbanColumn[] = [
    { key: "PLANIFIEE", label: "Planifiee", color: "bg-muted/40", dotColor: "bg-muted-foreground" },
    { key: "A_FAIRE", label: "A faire", color: "bg-secondary/30", dotColor: "bg-secondary-foreground" },
    { key: "EN_COURS", label: "En cours", color: "bg-primary/5", dotColor: "bg-primary" },
    { key: "EN_REVUE", label: "En revue", color: "bg-[var(--chart-5)]/5", dotColor: "bg-[var(--chart-5)]" },
    { key: "TERMINEE", label: "Terminee", color: "bg-[var(--success)]/5", dotColor: "bg-[var(--success)]" },
    { key: "BLOQUEE", label: "Bloquee", color: "bg-destructive/5", dotColor: "bg-destructive" },
]

interface KanbanBoardProps {
    taches: Tache[]
    onUpdate: () => void
    visibleColumns?: StatutTache[]
}

export function KanbanBoard({ taches, onUpdate, visibleColumns }: KanbanBoardProps) {
    const [draggedId, setDraggedId] = useState<number | null>(null)
    const [dragOverCol, setDragOverCol] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<number | null>(null)

    const columns = visibleColumns
        ? COLUMNS.filter((c) => visibleColumns.includes(c.key))
        : COLUMNS

    const handleDragStart = useCallback((e: React.DragEvent, tacheId: number) => {
        setDraggedId(tacheId)
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", String(tacheId))
        const target = e.currentTarget as HTMLElement
        target.style.opacity = "0.4"
    }, [])

    const handleDragEnd = useCallback((e: React.DragEvent) => {
        setDraggedId(null)
        setDragOverCol(null)
        const target = e.currentTarget as HTMLElement
        target.style.opacity = "1"
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent, colKey: string) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        setDragOverCol(colKey)
    }, [])

    const handleDragLeave = useCallback(() => {
        setDragOverCol(null)
    }, [])

    const handleDrop = useCallback(async (e: React.DragEvent, newStatus: StatutTache) => {
        e.preventDefault()
        setDragOverCol(null)
        const tacheId = Number(e.dataTransfer.getData("text/plain"))
        const tache = taches.find((t) => t.id === tacheId)
        if (!tache || tache.statut === newStatus) return

        setUpdatingId(tacheId)
        try {
            await api.put(`/taches/${tacheId}`, { statut: newStatus })
            toast.success(`Tache deplacee vers "${COLUMNS.find(c => c.key === newStatus)?.label}"`)
            onUpdate()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur lors du deplacement")
        } finally {
            setUpdatingId(null)
        }
    }, [taches, onUpdate])

    return (
        <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))` }}
        >
            {columns.map((col) => {
                const colTasks = taches.filter((t) => t.statut === col.key)
                const isOver = dragOverCol === col.key
                return (
                    <div key={col.key} className="flex flex-col gap-3 min-w-[220px]">
                        {/* Column header */}
                        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${col.color}`}>
                            <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                            <span className="text-sm font-medium">{col.label}</span>
                            <Badge variant="secondary" className="ml-auto h-5 min-w-5 justify-center rounded-full text-[10px] font-semibold">
                                {colTasks.length}
                            </Badge>
                        </div>

                        {/* Drop zone */}
                        <div
                            className={`flex flex-col gap-2 min-h-[120px] rounded-lg border-2 border-dashed p-2 transition-all duration-200 ${
                                isOver
                                    ? "border-primary bg-primary/5 scale-[1.01]"
                                    : "border-transparent"
                            }`}
                            onDragOver={(e) => handleDragOver(e, col.key)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col.key)}
                        >
                            {colTasks.length === 0 && (
                                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-muted-foreground/20 py-8">
                                    <p className="text-xs text-muted-foreground/50">Aucune tache</p>
                                </div>
                            )}

                            {colTasks.map((t) => (
                                <KanbanCard
                                    key={t.id}
                                    tache={t}
                                    isDragged={draggedId === t.id}
                                    isUpdating={updatingId === t.id}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

interface KanbanCardProps {
    tache: Tache
    isDragged: boolean
    isUpdating: boolean
    onDragStart: (e: React.DragEvent, id: number) => void
    onDragEnd: (e: React.DragEvent) => void
}

function KanbanCard({ tache, isDragged, isUpdating, onDragStart, onDragEnd }: KanbanCardProps) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, tache.id)}
            onDragEnd={onDragEnd}
            className={`group cursor-grab active:cursor-grabbing ${isDragged ? "opacity-40" : ""}`}
        >
            <Card className={`transition-all duration-150 hover:border-primary/30 hover:shadow-sm ${
                isUpdating ? "animate-pulse border-primary/40" : ""
            }`}>
                <CardContent className="flex flex-col gap-2.5 p-3">
                    {/* Drag handle + title */}
                    <div className="flex items-start gap-1.5">
                        <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground" />
                        <Link
                            href={`/taches/${tache.id}`}
                            className="flex-1 text-sm font-medium leading-snug hover:underline"
                            onClick={(e) => e.stopPropagation()}
                            draggable={false}
                        >
                            {tache.titre}
                        </Link>
                    </div>

                    {/* Priority + deadline row */}
                    <div className="flex items-center gap-2">
                        <PriorityBadge priority={tache.priorite} />
                        {tache.dateEcheance && (
                            <span className={`flex items-center gap-1 text-[10px] ${
                                tache.enRetard ? "text-destructive font-semibold" : "text-muted-foreground"
                            }`}>
                <Clock className="h-2.5 w-2.5" />
                                {tache.dateEcheance}
              </span>
                        )}
                    </div>

                    {/* Progress bar */}
                    {tache.pourcentage > 0 && (
                        <div className="flex items-center gap-2">
                            <Progress value={tache.pourcentage} className="h-1 flex-1" />
                            <span className="text-[10px] font-medium text-muted-foreground">{tache.pourcentage}%</span>
                        </div>
                    )}

                    {/* Bottom row: alerts + recurrence + assignees */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            {tache.enRetard && (
                                <span className="flex items-center gap-0.5 rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-semibold text-destructive">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Retard
                </span>
                            )}
                            {tache.estRecurrente && (
                                <span className="flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                  <RotateCw className="h-2.5 w-2.5" />
                                    {tache.periodicite?.toLowerCase().replace("_", " ")}
                </span>
                            )}
                        </div>
                        <div className="flex -space-x-1.5">
                            {tache.assignees?.slice(0, 3).map((a) => (
                                <Avatar key={a.userId} className="h-5 w-5 border-2 border-card">
                                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-medium">
                                        {initialsFromName(a.nomComplet)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {tache.assignees && tache.assignees.length > 3 && (
                                <Avatar className="h-5 w-5 border-2 border-card">
                                    <AvatarFallback className="text-[8px] bg-muted text-muted-foreground">
                                        +{tache.assignees.length - 3}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
