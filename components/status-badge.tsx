import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const taskStatusMap: Record<string, { label: string; className: string }> = {
    PLANIFIEE:  { label: "Planifiee",  className: "bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20" },
    A_FAIRE:    { label: "A faire",    className: "bg-secondary text-secondary-foreground border-border" },
    EN_COURS:   { label: "En cours",   className: "bg-primary/10 text-primary border-primary/20" },
    EN_REVUE:   { label: "En revue",   className: "bg-[var(--chart-5)]/10 text-[var(--chart-5)] border-[var(--chart-5)]/20" },
    TERMINEE:   { label: "Terminee",   className: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20" },
    BLOQUEE:    { label: "Bloquee",    className: "bg-destructive/10 text-destructive border-destructive/20" },
}

const projetStatusMap: Record<string, { label: string; className: string }> = {
    A_FAIRE:   { label: "A faire",   className: "bg-secondary text-secondary-foreground border-border" },
    EN_COURS:  { label: "En cours",  className: "bg-primary/10 text-primary border-primary/20" },
    EN_PAUSE:  { label: "En pause",  className: "bg-[var(--warning)]/10 text-[var(--warning-foreground)] border-[var(--warning)]/20" },
    TERMINE:   { label: "Termine",   className: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20" },
    ANNULE:    { label: "Annule",    className: "bg-destructive/10 text-destructive border-destructive/20" },
}

export function TaskStatusBadge({ status }: { status: string }) {
    const config = taskStatusMap[status] || { label: status, className: "bg-muted text-muted-foreground" }
    return <Badge variant="outline" className={cn("text-[11px] font-medium", config.className)}>{config.label}</Badge>
}

export function ProjectStatusBadge({ status }: { status: string }) {
    const config = projetStatusMap[status] || { label: status, className: "bg-muted text-muted-foreground" }
    return <Badge variant="outline" className={cn("text-[11px] font-medium", config.className)}>{config.label}</Badge>
}
