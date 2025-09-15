import { makeClient } from './client'

const BASE = import.meta.env.VITE_IDENTITY_BASE_URL
export const IdentityAPI = (authApi) => {
    const client = makeClient(BASE, authApi)
    return {
        me: async () => {
            const res = await client.get('/api/v1/me')
            if (!res.ok) throw new Error(await res.text())
            return res.json()
        },
        listRoles: async () => {
            const res = await client.get('/api/v1/manager/roles')
            if (!res.ok) throw new Error(await res.text())
            return res.json()
        }
    }
}
