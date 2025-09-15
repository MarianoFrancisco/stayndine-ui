import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { makeClient } from '../api/client'
import { HotelsAPI } from '../api/hotels'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useToaster } from '../ui/Toaster'

export default function RoomTypeCreate() {
    const { refresh } = useAuth()
    const hotelsApi = HotelsAPI(makeClient(import.meta.env.VITE_HOTELS_BASE_URL, { refresh }))
    const { push } = useToaster()

    const [hotels, setHotels] = useState([])
    const [roomTypes, setRoomTypes] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirming, setConfirming] = useState(false)

    const [form, setForm] = useState({
        hotelId: '',
        code: '',
        name: '',
        capacityAdults: 1,
        capacityChildren: 0,
        totalUnits: 1,
        basePrice: 0
    })

    useEffect(() => {
        hotelsApi.listHotels().then(setHotels).catch(() => setHotels([]))
    }, [])

    function setF(patch) {
        setForm(prev => ({ ...prev, ...patch }))
        setConfirming(false)
    }

    function nextRoomCode(list) {
        const codes = list
            .map(rt => rt.code)
            .filter(Boolean)
            .map(c => {
                const m = /^R(\d+)$/.exec(c)
                return m ? parseInt(m[1], 10) : 0
            })
        const max = codes.length > 0 ? Math.max(...codes) : 0
        const next = (max + 1).toString().padStart(4, '0')
        return `R${next}`
    }

    async function onHotelChange(hotelId) {
        setF({ hotelId, code: '' })
        if (!hotelId) return
        try {
            const list = await hotelsApi.listRoomTypesByHotel(hotelId)
            setRoomTypes(list)
            setF({ code: nextRoomCode(list) })
        } catch {
            setRoomTypes([])
            setF({ code: 'R0001' })
        }
    }

    async function createRoomType() {
        setIsSubmitting(true)
        try {
            await hotelsApi.createRoomType(form)
            push({ variant: 'success', title: 'Room created', message: 'The room is now available.' })
            setConfirming(false)
            const list = await hotelsApi.listRoomTypesByHotel(form.hotelId)
            setRoomTypes(list)
            setForm({
                hotelId: form.hotelId,
                code: nextRoomCode(list),
                name: '',
                capacityAdults: 1,
                capacityChildren: 0,
                totalUnits: 1,
                basePrice: 0
            })
        } catch {
            push({ variant: 'danger', title: 'Failed to create', message: 'Please check the form and try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    function onSubmit(e) {
        e.preventDefault()
        if (!confirming) { setConfirming(true); return }
        createRoomType()
    }

    function clampNumber(val, { min = 0, max = Infinity } = {}) {
        const n = Number(val)
        if (!Number.isFinite(n)) return min
        return Math.min(max, Math.max(min, n))
    }

    return (
        <div className="card card--form">
            <h2>Create Room</h2>

            <form className="form" onSubmit={onSubmit}>
                <div className="field">
                    <label className="field__label" htmlFor="hotelId">Hotel</label>
                    <select
                        id="hotelId"
                        className="field__control"
                        value={form.hotelId}
                        onChange={(e) => onHotelChange(e.target.value)}
                        required
                    >
                        <option value="">Select a hotel</option>
                        {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                </div>

                <input type="hidden" value={form.code} readOnly />

                <Input
                    id="name"
                    label="Room name"
                    placeholder="Standard Double Room"
                    value={form.name}
                    onChange={e => setF({ name: e.target.value })}
                    required
                />

                <div className="grid grid-3">
                    <Input
                        id="capacityAdults"
                        type="number"
                        label="Adults"
                        value={form.capacityAdults}
                        onChange={e => setF({ capacityAdults: clampNumber(e.target.value, { min: 0, max: 10 }) })}
                    />
                    <Input
                        id="capacityChildren"
                        type="number"
                        label="Children"
                        value={form.capacityChildren}
                        onChange={e => setF({ capacityChildren: clampNumber(e.target.value, { min: 0, max: 10 }) })}
                    />
                    <Input
                        id="totalUnits"
                        type="number"
                        label="Total units"
                        value={form.totalUnits}
                        onChange={e => setF({ totalUnits: clampNumber(e.target.value, { min: 1, max: 999 }) })}
                    />
                </div>

                <div className="grid">
                    <Input
                        id="basePrice"
                        type="number"
                        step="0.01"
                        label="Base price"
                        placeholder="1200.50"
                        value={form.basePrice}
                        onChange={e => setF({ basePrice: Number(e.target.value) })}
                    />
                </div>

                <div className="form-actions">
                    {!confirming ? (
                        <Button type="submit" disabled={isSubmitting}>Create</Button>
                    ) : (
                        <>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Confirm create'}</Button>
                            <Button type="button" variant="ghost" onClick={() => setConfirming(false)} disabled={isSubmitting}>Keep editing</Button>
                        </>
                    )}
                </div>
            </form>
        </div>
    )
}
