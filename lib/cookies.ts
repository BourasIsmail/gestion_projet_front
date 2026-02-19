/**
 * Client-side cookie utilities for secure token storage.
 * Cookies use Secure, SameSite=Strict, and a configurable path.
 */

const DEFAULT_PATH = "/"
const TOKEN_MAX_AGE = 60 * 60 * 24 // 1 day in seconds
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

function setCookie(name: string, value: string, maxAge: number): void {
    const secure = window.location.protocol === "https:" ? ";Secure" : ""
    document.cookie = `${name}=${encodeURIComponent(value)};path=${DEFAULT_PATH};max-age=${maxAge};SameSite=Strict${secure}`
}

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string): void {
    document.cookie = `${name}=;path=${DEFAULT_PATH};max-age=0`
}

export const cookies = {
    getToken: () => getCookie("token"),
    setToken: (token: string) => setCookie("token", token, TOKEN_MAX_AGE),
    removeToken: () => deleteCookie("token"),

    getRefreshToken: () => getCookie("refreshToken"),
    setRefreshToken: (token: string) => setCookie("refreshToken", token, REFRESH_MAX_AGE),
    removeRefreshToken: () => deleteCookie("refreshToken"),

    getUser: (): string | null => getCookie("user"),
    setUser: (user: string) => setCookie("user", user, TOKEN_MAX_AGE),
    removeUser: () => deleteCookie("user"),

    clearAll: () => {
        deleteCookie("token")
        deleteCookie("refreshToken")
        deleteCookie("user")
    },
}
