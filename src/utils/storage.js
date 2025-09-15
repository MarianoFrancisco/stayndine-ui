const TOKENS_KEY = 'stay_tokens'
const USER_KEY = 'stay_user'

export const storage = {
    getTokens: () => {
        const raw = localStorage.getItem(TOKENS_KEY)
        return raw ? JSON.parse(raw) : null
    },
    setTokens: (t) => {
        if (!t) localStorage.removeItem(TOKENS_KEY)
        else localStorage.setItem(TOKENS_KEY, JSON.stringify(t))
    },
    getUser: () => {
        const raw = localStorage.getItem(USER_KEY)
        return raw ? JSON.parse(raw) : null
    },
    setUser: (u) => {
        if (!u) localStorage.removeItem(USER_KEY)
        else localStorage.setItem(USER_KEY, JSON.stringify(u))
    },
    clear: () => { localStorage.removeItem(TOKENS_KEY); localStorage.removeItem(USER_KEY); }
}
