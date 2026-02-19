"use client"

import { useState } from "react"
import { Mail, Shield, Lock, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { initials } from "@/lib/utils"
import { api } from "@/lib/api"
import { toast } from "sonner"

const roleLabels: Record<string, { label: string; className: string }> = {
    ADMIN: { label: "Administrateur", className: "bg-[var(--warning)]/10 text-[var(--warning-foreground)] border-[var(--warning)]/20" },
    CHEF_EQUIPE: { label: "Chef d'equipe", className: "bg-primary/10 text-primary border-primary/20" },
    MEMBRE: { label: "Membre", className: "bg-secondary text-secondary-foreground border-border" },
}

export default function ProfilPage() {
    const { user } = useAuth()
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [changing, setChanging] = useState(false)

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault()
        setChanging(true)
        try {
            await api.put("/users/me/password", { oldPassword, newPassword })
            toast.success("Mot de passe modifie avec succes")
            setOldPassword("")
            setNewPassword("")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur")
        } finally {
            setChanging(false)
        }
    }

    if (!user) return null

    const role = roleLabels[user.roleGlobal] || roleLabels.MEMBRE

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mon profil</h1>
                <p className="text-sm text-muted-foreground">Gerez vos informations et votre mot de passe</p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-5">
                        <Avatar className="h-18 w-18">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold h-18 w-18">{initials(user.prenom, user.nom)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <h2 className="text-xl font-bold">{user.prenom} {user.nom}</h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {user.email}
                            </div>
                            <Badge variant="outline" className={`gap-1 ${role.className}`}>
                                <Shield className="h-3 w-3" />
                                {role.label}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Lock className="h-4 w-4" />
                        Changer le mot de passe
                    </CardTitle>
                    <CardDescription>Modifiez votre mot de passe de connexion</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-sm">
                        <div className="flex flex-col gap-2">
                            <Label>Ancien mot de passe</Label>
                            <div className="relative">
                                <Input type={showOld ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className="pr-10" />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10" onClick={() => setShowOld(!showOld)}>
                                    {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    <span className="sr-only">{showOld ? "Masquer" : "Afficher"}</span>
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Nouveau mot de passe</Label>
                            <div className="relative">
                                <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="pr-10" />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10" onClick={() => setShowNew(!showNew)}>
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    <span className="sr-only">{showNew ? "Masquer" : "Afficher"}</span>
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" disabled={changing} className="self-start">
                            {changing ? "Modification..." : "Modifier le mot de passe"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
