"use client"

import { useState } from "react"
import useSWR from "swr"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Plus,
    GripVertical,
    Pencil,
    Trash2,
    ListTodo,
    Clock,
    Save,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PriorityBadge } from "@/components/priority-badge"
import { fetcher, api } from "@/lib/api"
import type { TypeProjet } from "@/lib/types"
import { toast } from "sonner"
import Link from "next/link"

export default function TypeProjetDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { data: typeProjet, mutate } = useSWR<TypeProjet>(`/types-projet/${id}`, fetcher)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)

    async function handleCreateModele(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        try {
            await api.post(`/types-projet/${id}/taches-modeles`, {
                titre: fd.get("titre"),
                description: fd.get("description"),
                priorite: fd.get("priorite"),
                ordre: Number(fd.get("ordre")) || 0,
                delaiJours: fd.get("delaiJours") ? Number(fd.get("delaiJours")) : null,
            })
            toast.success("Tache modele ajoutee")
            mutate()
            setDialogOpen(false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    async function handleUpdateModele(modeleId: number, e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        try {
            await api.put(`/taches-modeles/${modeleId}`, {
                titre: fd.get("titre"),
                description: fd.get("description"),
                priorite: fd.get("priorite"),
                ordre: Number(fd.get("ordre")) || 0,
                delaiJours: fd.get("delaiJours") ? Number(fd.get("delaiJours")) : null,
            })
            toast.success("Tache modele mise a jour")
            mutate()
            setEditingId(null)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    async function handleDeleteModele(modeleId: number) {
        try {
            await api.delete(`/taches-modeles/${modeleId}`)
            toast.success("Tache modele supprimee")
            mutate()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    async function handleUpdateType(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        try {
            await api.put(`/types-projet/${id}`, {
                libelle: fd.get("libelle"),
                description: fd.get("description"),
            })
            toast.success("Type mis a jour")
            mutate()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        }
    }

    if (!typeProjet) {
        return (
            <div className="flex flex-col gap-6">
                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                <div className="h-64 animate-pulse rounded bg-muted" />
            </div>
        )
    }

    const modeles = [...(typeProjet.tachesModeles || [])].sort((a, b) => a.ordre - b.ordre)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href="/admin/types-projet">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{typeProjet.libelle}</h1>
                    <p className="text-sm text-muted-foreground font-mono">{typeProjet.code}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Informations du type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateType} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Libelle</Label>
                                <Input name="libelle" defaultValue={typeProjet.libelle} required />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Description</Label>
                                <Textarea name="description" defaultValue={typeProjet.description || ""} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground">Code</Label>
                                <Input value={typeProjet.code} disabled />
                            </div>
                            <Button type="submit" size="sm">
                                <Save className="mr-2 h-4 w-4" />
                                Enregistrer
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">
                                Taches modeles ({modeles.length})
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                Ces taches sont auto-generees a la creation d{"'"}un projet de ce type
                            </p>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nouvelle tache modele</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateModele} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label>Titre</Label>
                                        <Input name="titre" required />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Description</Label>
                                        <Textarea name="description" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label>Priorite</Label>
                                            <Select name="priorite" defaultValue="MOYENNE">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CRITIQUE">Critique</SelectItem>
                                                    <SelectItem value="HAUTE">Haute</SelectItem>
                                                    <SelectItem value="MOYENNE">Moyenne</SelectItem>
                                                    <SelectItem value="BASSE">Basse</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label>Ordre</Label>
                                            <Input name="ordre" type="number" defaultValue={modeles.length + 1} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Delai (jours depuis debut)</Label>
                                        <Input name="delaiJours" type="number" placeholder="ex: 15" />
                                    </div>
                                    <Button type="submit">Ajouter</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {modeles.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                                <ListTodo className="h-10 w-10" />
                                <p>Aucune tache modele pour ce type</p>
                                <p className="text-xs">
                                    Les projets de type {`"${typeProjet.libelle}"`} seront crees vides
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {modeles.map((m) =>
                                        editingId === m.id ? (
                                            <form
                                                key={m.id}
                                                onSubmit={(e) => handleUpdateModele(m.id, e)}
                                                className="rounded-lg border border-primary/30 bg-primary/5 p-3"
                                            >
                                                <div className="flex flex-col gap-3">
                                                    <Input name="titre" defaultValue={m.titre} required />
                                                    <Textarea name="description" defaultValue={m.description || ""} rows={2} />
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <Select name="priorite" defaultValue={m.priorite}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="CRITIQUE">Critique</SelectItem>
                                                                <SelectItem value="HAUTE">Haute</SelectItem>
                                                                <SelectItem value="MOYENNE">Moyenne</SelectItem>
                                                                <SelectItem value="BASSE">Basse</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Input name="ordre" type="number" defaultValue={m.ordre} />
                                                        <Input name="delaiJours" type="number" defaultValue={m.delaiJours ?? ""} placeholder="Delai" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button type="submit" size="sm">
                                                            Enregistrer
                                                        </Button>
                                                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                            Annuler
                                                        </Button>
                                                    </div>
                                                </div>
                                            </form>
                                        ) : (
                                            <div
                                                key={m.id}
                                                className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                            >
                                                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {m.ordre}
                      </span>
                                                <div className="flex flex-1 flex-col gap-0.5">
                                                    <span className="text-sm font-medium">{m.titre}</span>
                                                    {m.description && (
                                                        <span className="text-xs text-muted-foreground line-clamp-1">
                            {m.description}
                          </span>
                                                    )}
                                                </div>
                                                <PriorityBadge priority={m.priorite as "CRITIQUE" | "HAUTE" | "MOYENNE" | "BASSE"} />
                                                {m.delaiJours != null && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        <span>J+{m.delaiJours}</span>
                                                    </div>
                                                )}
                                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => setEditingId(m.id)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteModele(m.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
