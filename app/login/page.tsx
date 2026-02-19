"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            await login(email, password)
            router.push("/dashboard")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur de connexion")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Left panel - branding */}
            <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex lg:w-[480px]">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur">
                        <Shield className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-semibold">GestionProjets</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold leading-tight text-balance">
                        Gerez vos projets, equipes et taches en un seul endroit.
                    </h1>
                    <p className="text-sm leading-relaxed text-primary-foreground/80">
                        Plateforme de gestion de projets pour l{"'"}Entraide Nationale. Suivi des taches,
                        alertes automatiques, rapports PDF et gestion des taches recurrentes.
                    </p>
                </div>
                <p className="text-xs text-primary-foreground/50">Entraide Nationale - 2026</p>
            </div>

            {/* Right panel - form */}
            <div className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-[380px]">
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                            <Shield className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-semibold">GestionProjets</span>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">Connexion</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Entrez vos identifiants pour continuer</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {error && (
                            <div className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
                                {error}
                            </div>
                        )}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@entraide.ma"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                                className="h-10"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Votre mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-10"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="mt-2 h-10 w-full gap-2">
                            {loading ? "Connexion..." : "Se connecter"}
                            {!loading && <ArrowRight className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
