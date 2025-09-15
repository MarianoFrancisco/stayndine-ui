import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { makeClient } from '../api/client'
import { CustomersAPI } from '../api/customers'
import { IdentityAPI } from '../api/identity'
import { isCustomerLike, isManagerLike } from '../utils/roles'

const HERO_IMAGES = [
    // hotel / travel vibes
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop', // resort pool
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1600&auto=format&fit=crop', // hotel lobby
    'https://images.unsplash.com/photo-1548685913-fe6679df1cef?q=80&w=1600&auto=format&fit=crop', // room interior
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop', // boutique hotel
    'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop', // beach sunset
]

export default function Dashboard() {
    const { user, refresh } = useAuth()
    const showCustomer = isCustomerLike(user?.roles || [])
    const showManager = isManagerLike(user?.roles || [])

    const customers = CustomersAPI(makeClient(import.meta.env.VITE_CUSTOMERS_BASE_URL, { refresh }))
    const identity = IdentityAPI({ refresh })

    const [meUser, setMeUser] = useState(null)
    const [meCustomer, setMeCustomer] = useState(null)

    const hero = useMemo(() => HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)], [])

    const displayName = useMemo(() => {
        const full = [meCustomer?.firstName, meCustomer?.lastName].filter(Boolean).join(' ')
        if (full) return full
        const mail = meUser?.email || ''
        return mail ? mail.split('@')[0] : 'Guest'
    }, [meCustomer, meUser])

    const accountType = useMemo(() => {
        if (showManager && !showCustomer) return 'Manager'
        if (showCustomer && !showManager) return 'Customer'
        if (showManager && showCustomer) return 'Manager & Customer'
        return 'User'
    }, [showCustomer, showManager])

    useEffect(() => {
        ; (async () => {
            try { setMeUser(await identity.me()) } catch { }
            if (showCustomer) {
                try { setMeCustomer(await customers.me()) } catch { }
            }
        })()
    }, [showCustomer])

    return (
        <div className="dashboard">
            <div className="dashboard__hero">
                <img className="dashboard__hero-img" src={hero} alt="Welcome to Stayndine" />
                <div className="dashboard__overlay">
                    <h2 className="dashboard__title">Welcome, {displayName}</h2>
                    <p className="dashboard__subtitle">{accountType} account</p>
                </div>
            </div>

            <div className="dashboard__grid container">
                <section className="card">
                    <h3>Account</h3>
                    {!meUser ? (
                        <p>Loading…</p>
                    ) : (
                        <div className="kv">
                            <div className="kv__row"><div className="kv__k">Email</div><div className="kv__v">{meUser.email || '—'}</div></div>
                            <div className="kv__row"><div className="kv__k">Account type</div><div className="kv__v">{accountType}</div></div>
                        </div>
                    )}
                </section>

                {meCustomer && (
                    <section className="card">
                        <h3>Customer profile</h3>
                        <div className="kv">
                            <div className="kv__row"><div className="kv__k">Name</div><div className="kv__v">{[meCustomer.firstName, meCustomer.lastName].filter(Boolean).join(' ') || '—'}</div></div>
                            <div className="kv__row"><div className="kv__k">Phone</div><div className="kv__v">{meCustomer.phone || '—'}</div></div>
                            <div className="kv__row"><div className="kv__k">Birth date</div><div className="kv__v">{meCustomer.birthDate || '—'}</div></div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
