"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { User } from "./types"
import { api } from "./api"
import { cookies } from "./cookies"

interface AuthState {
    user: User | null
    token: string | null
    loading: boolean
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    isAdmin: boolean
    isChefEquipe: boolean
    isMembre: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true })

    useEffect(() => {
        const token = cookies.getToken()
        const userStr = cookies.getUser()
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr) as User
                setState({ user, token, loading: false })
            } catch {
                setState({ user: null, token: null, loading: false })
            }
        } else {
            setState({ user: null, token: null, loading: false })
        }
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        const data = await api.post<{ accessToken: string; refreshToken: string; user: User }>("/auth/login", { email, password })
        cookies.setToken(data.accessToken)
        cookies.setRefreshToken(data.refreshToken)
        cookies.setUser(JSON.stringify(data.user))
        setState({ user: data.user, token: data.accessToken, loading: false })
    }, [])

    const logout = useCallback(() => {
        cookies.clearAll()
        setState({ user: null, token: null, loading: false })
    }, [])

    const isAdmin = state.user?.roleGlobal === "ADMIN"
    const isChefEquipe = state.user?.roleGlobal === "CHEF_EQUIPE"
    const isMembre = state.user?.roleGlobal === "MEMBRE"

    return (
        <AuthContext.Provider value={{ ...state, login, logout, isAdmin, isChefEquipe, isMembre }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}
