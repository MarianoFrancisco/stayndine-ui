export const CustomersAPI = (client) => ({
    me: async () => {
        const res = await client.get('/api/v1/customers/me')
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
    update: async (id, payload) => {
        const res = await client.put(`/api/v1/customers/${id}`, payload)
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    }
})
