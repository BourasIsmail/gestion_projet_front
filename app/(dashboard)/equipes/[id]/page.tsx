"use client"

import { use, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ArrowLeft, UserPlus, Trash2, Users, Shield, User as UserIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { fetcher, api } from "@/lib/api"
import type { Equipe, User } from "@/lib/types"
import { initials, cn } from "@/lib/utils"
import { toast } from "sonner"

const roleStyles: Record<string, string> = {
    CHEF_EQUIPE: "bg-[var(--warning)]/10 text-[var(--warning-foreground)] border-[var(--warning)]/20",
    MEMBRE: "bg-secondary text-secondary-foreground border-border",
}

export default function EquipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: equipe, mutate } = useSWR<Equipe>(`/equipes/${id}`, fetcher, { revalidateOnFocus: true })
    const { data: users } = useSWR<User[]>("/users", fetcher)
    const [addOpen, setAddOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleAddMember(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        setLoading(true)
        try {
            await api.post(`/equipes/${id}/membres`, {
                userId: Number(fd.get("userId")),
                role: fd.get("role"),
            })
            toast.success("Membre ajoute")
            await mutate(undefined, { revalidate: true })
            setAddOpen(false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        } finally {
            setLoading(false)
        }
    }

    async function handleRemoveMember(userId: number) {
        setLoading(true)
        try {
            await api.delete(`/equipes/${id}/membres/${userId}`)
            toast.success("Membre retire")
            await mutate(undefined, { revalidate: true })
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        } finally {
            setLoading(false)
        }
    }

    if (!equipe) {
        return <div className="flex flex-col gap-6"><div className="h-8 w-48 animate-pulse rounded bg-muted" /><div className="h-60 animate-pulse rounded-lg bg-muted" /></div>
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
                <Button asChild variant="ghost" size="icon" className="mt-1 shrink-0">
                    <Link href="/equipes"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{equipe.nom}</h1>
                            {equipe.description && <p className="text-sm text-muted-foreground">{equipe.description}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-card px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Membres</p>
                    <p className="text-xl font-bold">{equipe.membres?.length || 0}</p>
                </div>
                <div className="rounded-lg border bg-card px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Chefs</p>
                    <p className="text-xl font-bold text-primary">{equipe.membres?.filter(m => m.roleEquipe === "CHEF_EQUIPE").length || 0}</p>
                </div>
                <div className="rounded-lg border bg-card px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Cree le</p>
                    <p className="text-sm font-medium">{new Date(equipe.dateCreation).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Membres de l{"'"}equipe</CardTitle>
                        <Dialog open={addOpen} onOpenChange={setAddOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-2"><UserPlus className="h-4 w-4" />Ajouter un membre</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Ajouter un membre</DialogTitle></DialogHeader>
                                <form onSubmit={handleAddMember} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label>Utilisateur</Label>
                                        <select name="userId" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                            <option value="">Choisir un utilisateur...</option>
                                            {users?.filter(u => u.actif).map((u) => <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Role dans l{"'"}equipe</Label>
                                        <select name="role" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                            <option value="CHEF_EQUIPE">Chef d{"'"}equipe</option>
                                            <option value="MEMBRE">Membre</option>
                                        </select>
                                    </div>
                                    <Button type="submit" disabled={loading}>{loading ? "Ajout..." : "Ajouter"}</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        {equipe.membres?.map((m) => (
                            <div key={m.userId} className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/30">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials(m.prenom, m.nom)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{m.prenom} {m.nom}</p>
                                    <p className="text-xs text-muted-foreground">{m.email}</p>
                                </div>
                                <Badge variant="outline" className={cn("text-[11px]", roleStyles[m.roleEquipe] || "")}>
                                    {m.roleEquipe === "CHEF_EQUIPE" ? "Chef" : "Membre"}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                    disabled={loading}
                                    onClick={() => handleRemoveMember(m.userId)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                        {(!equipe.membres || equipe.membres.length === 0) && (
                            <div className="flex flex-col items-center gap-2 py-8">
                                <Users className="h-8 w-8 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground">Aucun membre dans cette equipe</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
