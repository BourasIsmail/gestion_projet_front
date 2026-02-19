import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: string | number
    description?: string
    icon: LucideIcon
    variant?: "default" | "success" | "warning" | "destructive" | "info"
}

const variantStyles = {
    default:     { icon: "bg-primary/10 text-primary", border: "border-l-primary" },
    success:     { icon: "bg-[var(--success)]/10 text-[var(--success)]", border: "border-l-[var(--success)]" },
    warning:     { icon: "bg-[var(--warning)]/10 text-[var(--warning-foreground)]", border: "border-l-[var(--warning)]" },
    destructive: { icon: "bg-destructive/10 text-destructive", border: "border-l-destructive" },
    info:        { icon: "bg-[var(--info)]/10 text-[var(--info)]", border: "border-l-[var(--info)]" },
}

export function StatCard({ title, value, description, icon: Icon, variant = "default" }: StatCardProps) {
    const styles = variantStyles[variant]
    return (
        <Card className={cn("border-l-[3px]", styles.border)}>
            <CardContent className="flex items-center gap-4 p-5">
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", styles.icon)}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            </CardContent>
        </Card>
    )
}
