export const ReservationsAPI = (client) => ({
    create: async (payload) => {
        const res = await client.post('/api/v1/reservations', payload)
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
    listMine: async () => {
        const res = await client.get('/api/v1/reservations/me')
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
    cancel: async (id) => {
        const res = await client.post(`/api/v1/reservations/${id}/cancel`, {})
        if (!res.ok) throw new Error(await res.text())
    }
})
