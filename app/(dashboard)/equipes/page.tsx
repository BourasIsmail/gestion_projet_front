"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Plus, Users, Search, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fetcher, api } from "@/lib/api"
import type { Equipe } from "@/lib/types"
import { initials } from "@/lib/utils"
import { toast } from "sonner"

export default function EquipesPage() {
    const { data: equipes, mutate } = useSWR<Equipe[]>("/equipes", fetcher)
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)

    const filtered = equipes?.filter((e) => e.nom.toLowerCase().includes(search.toLowerCase()))

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        try {
            await api.post("/equipes", { nom: fd.get("nom"), description: fd.get("description") })
            toast.success("Equipe creee avec succes")
            mutate()
            setDialogOpen(false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Equipes</h1>
                    <p className="text-sm text-muted-foreground">{filtered?.length || 0} equipes</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nouvelle equipe</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Creer une equipe</DialogTitle></DialogHeader>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2"><Label>Nom de l{"'"}equipe</Label><Input name="nom" required placeholder="Ex: Equipe DevOps" /></div>
                            <div className="flex flex-col gap-2"><Label>Description</Label><Textarea name="description" placeholder="Decrivez l'equipe..." /></div>
                            <Button type="submit">Creer l{"'"}equipe</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Rechercher une equipe..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>

            {!filtered ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => <Card key={i}><CardContent className="p-5"><div className="h-24 animate-pulse rounded-lg bg-muted" /></CardContent></Card>)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16">
                    <Users className="h-12 w-12 text-muted-foreground/40" />
                    <div className="text-center">
                        <p className="font-medium text-muted-foreground">Aucune equipe trouvee</p>
                        <p className="text-sm text-muted-foreground/70">Creez une nouvelle equipe pour commencer</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((e) => (
                        <Link key={e.id} href={`/equipes/${e.id}`}>
                            <Card className="group h-full transition-all hover:shadow-md hover:border-primary/20">
                                <CardContent className="flex flex-col gap-4 p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                                <Users className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold group-hover:text-primary transition-colors">{e.nom}</h3>
                                                <p className="text-xs text-muted-foreground">{e.nombreMembres} membre{e.nombreMembres > 1 ? "s" : ""}</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                    </div>

                                    {e.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{e.description}</p>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <div className="flex -space-x-2">
                                            {e.membres?.slice(0, 5).map((m) => (
                                                <Avatar key={m.userId} className="h-7 w-7 border-2 border-card">
                                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">{initials(m.prenom, m.nom)}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {(e.membres?.length || 0) > 5 && (
                                                <Avatar className="h-7 w-7 border-2 border-card">
                                                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">+{e.membres.length - 5}</AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-muted-foreground">
                      {new Date(e.dateCreation).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
