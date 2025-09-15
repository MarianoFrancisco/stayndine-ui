import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { makeClient } from '../api/client'
import { HotelsAPI } from '../api/hotels'
import { ReservationsAPI } from '../api/reservations'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useToaster } from '../ui/Toaster'

function diffNights(a, b) {
    if (!a || !b) return 0
    const d1 = new Date(a)
    const d2 = new Date(b)
    const ms = d2.getTime() - d1.getTime()
    const nights = Math.floor(ms / 86400000)
    return Number.isFinite(nights) ? Math.max(0, nights) : 0
}

export default function ReservationsCreate() {
    const { refresh } = useAuth()
    const hotelsApi = HotelsAPI(makeClient(import.meta.env.VITE_HOTELS_BASE_URL, { refresh }))
    const resApi = ReservationsAPI(makeClient(import.meta.env.VITE_RESERVATIONS_BASE_URL, { refresh }))
    const { push } = useToaster()

    const [hotels, setHotels] = useState([])
    const [roomTypes, setRoomTypes] = useState([])
    const [form, setForm] = useState({
        hotelId: '', roomTypeId: '', quantity: 1, checkIn: '', checkOut: '', guests: 1, currency: 'USD'
    })
    const [quote, setQuote] = useState(null)
    const [loading, setLoading] = useState(false)
    const [confirming, setConfirming] = useState(false)

    useEffect(() => {
        hotelsApi.listHotels().then(setHotels).catch(() => setHotels([]))
    }, [])

    async function loadRoomTypes(hotelId) {
        if (!hotelId) { setRoomTypes([]); return }
        try {
            const list = await hotelsApi.listRoomTypesByHotel(hotelId)
            setRoomTypes(list || [])
        } catch { setRoomTypes([]) }
    }

    async function doQuote() {
        const { roomTypeId, checkIn, checkOut } = form
        if (!roomTypeId || !checkIn || !checkOut) return
        try {
            const q = await hotelsApi.quoteRoomType(roomTypeId, checkIn, checkOut)
            setQuote(q || null)
        } catch { setQuote(null) }
    }

    const nights = useMemo(() => diffNights(form.checkIn, form.checkOut), [form.checkIn, form.checkOut])
    const computedTotal = useMemo(() => {
        if (!quote) return null
        return (Number(quote.nightlyPrice || 0) * nights * Number(form.quantity || 0)) || 0
    }, [quote, nights, form.quantity])

    async function createReservation() {
        setLoading(true)
        try {
            await resApi.create(form)
            push({ variant: 'success', title: 'Reservation created', message: 'You can review it in My reservations.' })
            setForm({ hotelId: '', roomTypeId: '', quantity: 1, checkIn: '', checkOut: '', guests: 1, currency: 'USD' })
            setQuote(null)
            setConfirming(false)
        } catch {
            push({ variant: 'danger', title: 'Could not create', message: 'Please check the details and try again.' })
        } finally {
            setLoading(false)
        }
    }

    function onSubmit(e) {
        e.preventDefault()
        if (!confirming) {
            setConfirming(true)
            return
        }
        createReservation()
    }

    return (
        <div className="card card--form">
            <h2>New reservation</h2>

            <form className="form" onSubmit={onSubmit}>
                <div className="grid grid-2">
                    <div className="field">
                        <label className="field__label" htmlFor="hotelId">Hotel</label>
                        <select
                            id="hotelId"
                            className="field__control"
                            value={form.hotelId}
                            onChange={(e) => {
                                const v = e.target.value
                                setForm(f => ({ ...f, hotelId: v, roomTypeId: '' }))
                                loadRoomTypes(v)
                                setQuote(null)
                                setConfirming(false)
                            }}
                        >
                            <option value="">Select a hotel</option>
                            {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="roomTypeId">Rooms</label>
                        <select
                            id="roomTypeId"
                            className="field__control"
                            value={form.roomTypeId}
                            onChange={(e) => { setForm(f => ({ ...f, roomTypeId: e.target.value })); setQuote(null); setConfirming(false) }}
                        >
                            <option value="">Select a room</option>
                            {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-2">
                    <Input id="checkIn" type="date" label="Check-in"
                        value={form.checkIn}
                        onChange={e => { setForm({ ...form, checkIn: e.target.value }); setConfirming(false) }}
                        onBlur={doQuote} />
                    <Input id="checkOut" type="date" label="Check-out"
                        value={form.checkOut}
                        onChange={e => { setForm({ ...form, checkOut: e.target.value }); setConfirming(false) }}
                        onBlur={doQuote} />
                </div>

                <div className="grid grid-3">
                    <Input id="quantity" type="number" label="Quantity"
                        value={form.quantity}
                        onChange={e => { setForm({ ...form, quantity: +e.target.value }); setConfirming(false) }} />
                    <Input id="guests" type="number" label="Guests"
                        value={form.guests}
                        onChange={e => { setForm({ ...form, guests: +e.target.value }); setConfirming(false) }} />
                    <div className="field">
                        <label className="field__label" htmlFor="currency">Currency</label>
                        <select id="currency" className="field__control"
                            value={form.currency}
                            onChange={e => { setForm({ ...form, currency: e.target.value }); setConfirming(false) }}>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </div>

                {quote && (
                    <div className="alert alert--info" style={{ marginTop: 14 }}>
                        <div className="alert__body">
                            <div className="alert__title">Quote</div>
                            <div className="quote-inline">
                                <span>Nightly price: <b>{quote.nightlyPrice}</b></span>
                                <span>Total: <b>{computedTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-actions" style={{ display: 'flex', gap: 8 }}>
                    {!confirming ? (
                        <Button type="submit" disabled={loading}>Book now</Button>
                    ) : (
                        <>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Booking…' : 'Confirm booking'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setConfirming(false)} disabled={loading}>
                                Keep editing
                            </Button>
                        </>
                    )}
                </div>
            </form>
        </div>
    )
}
