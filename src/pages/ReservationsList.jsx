import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { makeClient } from '../api/client'
import { ReservationsAPI } from '../api/reservations'
import { HotelsAPI } from '../api/hotels'
import Button from '../ui/Button'
import { useToaster } from '../ui/Toaster'

export default function ReservationsList() {
    const { refresh } = useAuth()
    const resApi = ReservationsAPI(makeClient(import.meta.env.VITE_RESERVATIONS_BASE_URL, { refresh }))
    const hotelsApi = HotelsAPI(makeClient(import.meta.env.VITE_HOTELS_BASE_URL, { refresh }))
    const { push } = useToaster()

    const [rows, setRows] = useState([])
    const [error, setError] = useState(null)
    const [loadingId, setLoadingId] = useState(null)
    const [confirmId, setConfirmId] = useState(null)

    async function load() {
        try {
            const reservations = await resApi.listMine()
            const hotelIds = Array.from(new Set(reservations.map(r => r.hotelId)))
            const hotels = await hotelsApi.listHotels()

            const hotelMap = new Map(hotels.map(h => [h.id, h]))
            const roomTypeMaps = new Map()
            for (const hid of hotelIds) {
                try {
                    const list = await hotelsApi.listRoomTypesByHotel(hid)
                    roomTypeMaps.set(hid, new Map(list.map(rt => [rt.id, rt])))
                } catch {
                    roomTypeMaps.set(hid, new Map())
                }
            }

            const enriched = reservations.map(r => {
                const hotel = hotelMap.get(r.hotelId)
                const item = (r.items && r.items[0]) || null
                const roomType = item ? (roomTypeMaps.get(r.hotelId)?.get(item.roomTypeId) || null) : null
                return {
                    id: r.id,
                    code: r.code,
                    status: r.status,
                    checkIn: r.checkIn,
                    checkOut: r.checkOut,
                    guests: r.guests,
                    currency: r.currency,
                    totalAmount: r.totalAmount,
                    hotelName: hotel?.name || '—',
                    roomTypeName: roomType?.name || '—',
                }
            })

            setRows(enriched)
            setError(null)
        } catch (e) {
            setError(String(e))
            setRows([])
        }
    }

    useEffect(() => { load() }, [])

    async function confirmCancel(id) {
        setLoadingId(id)
        try {
            await resApi.cancel(id)
            push({ variant: 'success', title: 'Cancelled', message: 'Reservation was cancelled.' })
            await load()
        } catch {
            push({ variant: 'danger', title: 'Error', message: 'Could not cancel this reservation.' })
        } finally {
            setLoadingId(null)
            setConfirmId(null)
        }
    }

    return (
        <div className="card" style={{ marginTop: 20 }}>
            <h2>My reservations</h2>
            {error && <p>Failed to load: {error}</p>}
            {rows.length === 0 ? (
                <p>No reservations yet.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Code</th>
                                <th>Hotel</th>
                                <th>Room</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Guests</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={r.id}>
                                    <td>{i + 1}</td>
                                    <td>{r.code}</td>
                                    <td>{r.hotelName}</td>
                                    <td>{r.roomTypeName}</td>
                                    <td>{r.checkIn}</td>
                                    <td>{r.checkOut}</td>
                                    <td>{r.guests}</td>
                                    <td>{r.currency} {Number(r.totalAmount).toLocaleString()}</td>
                                    <td>{r.status}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        {r.status !== 'CANCELLED' && (
                                            confirmId === r.id ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => confirmCancel(r.id)}
                                                        disabled={loadingId === r.id}
                                                    >
                                                        {loadingId === r.id ? 'Cancelling…' : 'Confirm cancel'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        style={{ marginLeft: 8 }}
                                                        onClick={() => setConfirmId(null)}
                                                        disabled={loadingId === r.id}
                                                    >
                                                        Keep
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => setConfirmId(r.id)}
                                                >
                                                    Cancel
                                                </Button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
