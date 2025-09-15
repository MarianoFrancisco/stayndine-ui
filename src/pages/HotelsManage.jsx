import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { makeClient } from '../api/client'
import { HotelsAPI } from '../api/hotels'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useToaster } from '../ui/Toaster'

export default function HotelsManage() {
    const { refresh } = useAuth()
    const api = HotelsAPI(makeClient(import.meta.env.VITE_HOTELS_BASE_URL, { refresh }))
    const { push } = useToaster()

    const [items, setItems] = useState([])
    const [form, setForm] = useState({
        code: '',
        name: '',
        country: '',
        city: '',
        addressLine1: '',
        addressLine2: '',
        timezone: '',
        starRating: 0
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirming, setConfirming] = useState(false)

    function nextHotelCode(list) {
        const codes = list
            .map(h => h.code)
            .filter(Boolean)
            .map(c => {
                const m = /^HTL(\d+)$/.exec(c)
                return m ? parseInt(m[1], 10) : 0
            })
        const max = codes.length > 0 ? Math.max(...codes) : 0
        const next = (max + 1).toString().padStart(3, '0')
        return `HTL${next}`
    }

    async function load() {
        try {
            const hotels = await api.listHotels()
            setItems(hotels)
            setForm(f => ({ ...f, code: nextHotelCode(hotels) }))
        } catch {
            setItems([])
            setForm(f => ({ ...f, code: 'HTL001' }))
        }
    }

    useEffect(() => { load() }, [])

    async function createHotel() {
        setIsSubmitting(true)
        try {
            await api.createHotel(form)
            push({ variant: 'success', title: 'Hotel added', message: 'The hotel has been created.' })
            setConfirming(false)
            await load()
            setForm({
                code: nextHotelCode(items),
                name: '',
                country: '',
                city: '',
                addressLine1: '',
                addressLine2: '',
                timezone: '',
                starRating: 0
            })
        } catch {
            push({ variant: 'danger', title: 'Failed to add hotel', message: 'Please verify the data and try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    function onSubmit(e) {
        e.preventDefault()
        if (!confirming) { setConfirming(true); return }
        createHotel()
    }

    function handleStarChange(e) {
        let val = +e.target.value
        if (val < 0) val = 0
        if (val > 5) val = 5
        setForm({ ...form, starRating: val })
        setConfirming(false)
    }

    return (
        <div className="card card--form">
            <h2>Create Hotel</h2>

            <form className="form" onSubmit={onSubmit}>
                <input type="hidden" value={form.code} readOnly />

                <Input
                    id="name" label="Hotel name" placeholder="Hotel Central 2"
                    value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setConfirming(false) }} required
                />
                <div className="grid grid-2">
                    <Input
                        id="country" label="Country" placeholder="MX"
                        value={form.country} onChange={e => { setForm({ ...form, country: e.target.value }); setConfirming(false) }} required
                    />
                    <Input
                        id="city" label="City" placeholder="Ciudad de México"
                        value={form.city} onChange={e => { setForm({ ...form, city: e.target.value }); setConfirming(false) }} required
                    />
                </div>
                <Input
                    id="addressLine1" label="Address line 1" placeholder="Av. Reforma 123"
                    value={form.addressLine1} onChange={e => { setForm({ ...form, addressLine1: e.target.value }); setConfirming(false) }} required
                />
                <Input
                    id="addressLine2" label="Address line 2" placeholder="Piso 4"
                    value={form.addressLine2} onChange={e => { setForm({ ...form, addressLine2: e.target.value }); setConfirming(false) }}
                />
                <Input
                    id="timezone" label="Timezone" placeholder="America/Mexico_City"
                    value={form.timezone} onChange={e => { setForm({ ...form, timezone: e.target.value }); setConfirming(false) }} required
                />
                <Input
                    id="starRating" type="number" label="Star rating" placeholder="5"
                    value={form.starRating}
                    onChange={handleStarChange}
                    min={0} max={5}
                />

                <div className="form-actions">
                    {!confirming ? (
                        <Button type="submit" disabled={isSubmitting}>Add hotel</Button>
                    ) : (
                        <>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding…' : 'Confirm add'}</Button>
                            <Button type="button" variant="ghost" onClick={() => setConfirming(false)} disabled={isSubmitting}>Keep editing</Button>
                        </>
                    )}
                </div>
            </form>

            <div className="hotel-list">
                <h3>Existing hotels</h3>
                {items.length === 0 ? (
                    <p>No hotels yet.</p>
                ) : (
                    <div className="hotel-cards">
                        {items.map(h => (
                            <div key={h.id} className="hotel-card">
                                <div className="hotel-card__header">
                                    <div className="hotel-card__title">{h.name}</div>
                                    <span className="badge">{h.code}</span>
                                </div>
                                <div className="hotel-card__body">
                                    <div className="hotel-card__line">{h.city || '—'}, {h.country || '—'}</div>
                                    <div className="hotel-card__line">{h.addressLine1}{h.addressLine2 ? `, ${h.addressLine2}` : ''}</div>
                                    <div className="hotel-card__line">Timezone: {h.timezone || '—'}</div>
                                    <div className="hotel-card__line">
                                        {h.starRating ? '⭐'.repeat(Math.min(h.starRating, 5)) : 'No rating'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
