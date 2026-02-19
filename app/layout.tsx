import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "GestionProjets - Entraide Nationale",
    description: "Systeme de gestion de projets, equipes et taches pour l'Entraide Nationale",
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#0a1628",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" className="bg-background">
        <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        <Analytics />
        </body>
        </html>
    )
}
