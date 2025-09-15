const EDGE = import.meta.env.VITE_EDGE_BASE_URL

export async function login(email, password) {
    const res = await fetch(`${EDGE}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export async function refreshToken(refreshToken) {
    const res = await fetch(`${EDGE}/api/v1/auth/refresh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export async function logout(refreshToken) {
    const res = await fetch(`${EDGE}/api/v1/auth/logout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    })
    if (!res.ok) throw new Error(await res.text())
}

export async function signup(payload) {
    const res = await fetch(`${EDGE}/api/v1/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(await res.text())
    try { return await res.json() } catch { return null }
}
