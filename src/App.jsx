import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import HotelsManage from './pages/HotelsManage'
import RoomTypeCreate from './pages/RoomTypeCreate'
import ReservationsCreate from './pages/ReservationsCreate'
import ReservationsList from './pages/ReservationsList'
import NotFound from './pages/NotFound'
import ProtectedRoute from './routes/ProtectedRoute'
import { useAuth } from './context/AuthContext'

export default function App() {
    const { user } = useAuth()
    return (
        <>
            <NavBar />
            <div className="container">
                <Routes>
                    <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Route>

                    <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
                        <Route path="/reservations/new" element={<ReservationsCreate />} />
                        <Route path="/reservations" element={<ReservationsList />} />
                    </Route>

                    <Route element={<ProtectedRoute roles={['MANAGER', 'EMPLOYEE']} />}>
                        <Route path="/manage/hotels" element={<HotelsManage />} />
                        <Route path="/manage/room-types" element={<RoomTypeCreate />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </>
    )
}
