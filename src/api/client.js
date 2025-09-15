import { storage } from '../utils/storage'

export function makeClient(baseUrl, authApi) {
  let refreshing = null

  async function fetchWithAuth(path, options = {}) {
    const tokens = storage.getTokens()
    const headers = new Headers(options.headers || {})
    headers.set('Content-Type', 'application/json')
    if (tokens?.accessToken) headers.set('Authorization', `Bearer ${tokens.accessToken}`)

    const res = await fetch(`${baseUrl}${path}`, { ...options, headers, credentials: 'omit' })
    if (res.status !== 401) return res

    try {
      if (!refreshing) refreshing = authApi.refresh()
      const newAccess = await refreshing
      refreshing = null
      const retryHeaders = new Headers(options.headers || {})
      retryHeaders.set('Content-Type', 'application/json')
      retryHeaders.set('Authorization', `Bearer ${newAccess}`)
      return await fetch(`${baseUrl}${path}`, { ...options, headers: retryHeaders, credentials: 'omit' })
    } catch {
      refreshing = null
      throw res
    }
  }

  return {
    get: (path) => fetchWithAuth(path, { method: 'GET' }),
    post: (path, body) => fetchWithAuth(path, { method: 'POST', body: JSON.stringify(body) }),
    put:  (path, body) => fetchWithAuth(path, { method: 'PUT',  body: JSON.stringify(body) }),
  }
}
