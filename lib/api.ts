import { cookies } from "./cookies"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || /*"http://localhost:8080/api"*/"http://172.16.10.60:8080/api"

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== "undefined" ? cookies.getToken() : null
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
    }
    if (token) headers["Authorization"] = `Bearer ${token}`

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

    if (res.status === 401) {
        if (typeof window !== "undefined") {
            cookies.clearAll()
            window.location.href = "/login"
        }
        throw new Error("Non autorise")
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `Erreur ${res.status}`)
    }

    const text = await res.text()
    if (!text || res.status === 204) return {} as T
    return JSON.parse(text)
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
    downloadPdf: async (path: string, filename: string) => {
        const token = typeof window !== "undefined" ? cookies.getToken() : null
        const headers: Record<string, string> = {}
        if (token) headers["Authorization"] = `Bearer ${token}`
        const res = await fetch(`${API_BASE}${path}`, { headers })
        if (!res.ok) throw new Error("Erreur lors du telechargement")
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    },
}

export function fetcher<T>(path: string): Promise<T> {
    return api.get<T>(path)
}
