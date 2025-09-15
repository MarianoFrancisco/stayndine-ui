export const HotelsAPI = (client) => ({
    listHotels: async () => {
        const res = await client.get('/api/v1/hotels')
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
    createHotel: async (payload) => {
        const res = await client.post('/api/v1/hotels', payload)
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
    listRoomTypesByHotel: async (hotelId) => {
        const res = await client.get(`/api/v1/room-types/by-hotel/${hotelId}`)
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
    createRoomType: async (payload) => {
        const res = await client.post('/api/v1/room-types', payload)
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
    quoteRoomType: async (roomTypeId, checkIn, checkOut) => {
        const params = new URLSearchParams({ checkIn, checkOut }).toString()
        const res = await client.get(`/api/v1/room-types/${roomTypeId}/quote?${params}`)
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    }
})
