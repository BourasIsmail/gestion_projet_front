import { Badge } from "@/components/ui/badge"
import type { Priorite } from "@/lib/types"

const config: Record<Priorite, { label: string; className: string }> = {
    CRITIQUE: { label: "Critique", className: "bg-destructive/15 text-destructive border-destructive/30" },
    HAUTE: { label: "Haute", className: "bg-[var(--warning)]/15 text-[var(--warning-foreground)] border-[var(--warning)]/30" },
    MOYENNE: { label: "Moyenne", className: "bg-primary/10 text-primary border-primary/30" },
    BASSE: { label: "Basse", className: "bg-muted text-muted-foreground border-border" },
}

export function PriorityBadge({ priority }: { priority: Priorite }) {
    const c = config[priority] || config.MOYENNE
    return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}
