import { createContext, useContext, useMemo, useState } from 'react'
import { storage } from '../utils/storage'
import { refreshToken as apiRefresh, logout as apiLogout } from '../api/auth'
import { normalizeRoles } from '../utils/roles'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
    const [tokens, setTokens] = useState(storage.getTokens())

    function login(newTokens) {
        storage.setTokens(newTokens)
        setTokens(newTokens)
    }

    async function refresh() {
        const { refreshToken } = storage.getTokens() || {}
        if (!refreshToken) throw new Error('no refresh token')
        const t = await apiRefresh(refreshToken)
        storage.setTokens(t)
        setTokens(t)
        return t.accessToken
    }

    async function logout() {
        try {
            const t = storage.getTokens()
            storage.clear()
            setTokens(null)
            if (t?.refreshToken) {
                await apiLogout(t.refreshToken)
            }
        } catch { }
        return true
    }

    const value = useMemo(() => {
        const roles = normalizeRoles(tokens?.roles || [])
        const user = tokens ? { userId: tokens.userId, roles } : null
        return { tokens, user, login, refresh, logout }
    }, [tokens])

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
export const useAuth = () => useContext(AuthCtx)
