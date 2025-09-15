import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../ui/Button'
import { isCustomerLike, isManagerLike } from '../utils/roles'

export default function NavBar() {
    const { user, logout } = useAuth()
    const nav = useNavigate()
    const roles = user?.roles || []
    const showCustomer = isCustomerLike(roles)
    const showManager = isManagerLike(roles)

    async function handleLogout() {
        await logout()
        nav('/login', { replace: true })
    }

    return (
        <div className="nav">
            <div className="nav-inner container">
                <div>
                    <Link to="/"><strong>Stayndine</strong></Link>

                    {user && (
                        <>
                            <Link to="/dashboard">Dashboard</Link>

                            {showCustomer && (
                                <>
                                    <Link to="/reservations">My reservations</Link>
                                    <Link to="/reservations/new">New reservation</Link>
                                </>
                            )}

                            {showManager && (
                                <>
                                    <Link to="/manage/hotels">Hotels</Link>
                                    <Link to="/manage/room-types">Rooms</Link>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="right">
                    {!user ? (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Sign up</Link>
                        </>
                    ) : (
                        <>
                            <span className="badge">{user.userId?.slice(0, 8)}</span>
                            <Button onClick={handleLogout}>Logout</Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
