import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { expandRequired, normalizeRoles } from '../utils/roles'

export default function ProtectedRoute({ roles }) {
    const { user } = useAuth()
    const loc = useLocation()

    if (!user) {
        return <Navigate to="/login" replace state={{ from: loc }} />
    }

    if (roles && roles.length > 0) {
        const userRoles = normalizeRoles(user.roles)
        const required = expandRequired(roles)
        const allowed = userRoles.some(r => required.includes(r))
        if (!allowed) {
            return (
                <div className="card" style={{ maxWidth: 640, margin: '40px auto' }}>
                    <h2>403 — Not authorized</h2>
                    <p>You don’t have permission to access this page.</p>
                </div>
            )
        }
    }

    return <Outlet />
}
