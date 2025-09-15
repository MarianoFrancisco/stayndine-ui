import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ToasterProvider } from './ui/Toaster'
import './styles.css'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <AuthProvider>
            <ToasterProvider>
                <App />
            </ToasterProvider>
        </AuthProvider>
    </BrowserRouter>
)
