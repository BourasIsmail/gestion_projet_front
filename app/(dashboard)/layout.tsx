"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopNavbar } from "@/components/top-navbar"
import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) router.replace("/login")
    }, [loading, user, router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="flex min-h-screen flex-col">
            <TopNavbar />
            <main className="flex-1">
                <div className="mx-auto max-w-screen-2xl px-4 py-6 lg:px-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
