import { useForm } from 'react-hook-form'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToaster } from '../ui/Toaster'
import { login as apiLogin } from '../api/auth'

export default function Login() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
    const { login } = useAuth()
    const nav = useNavigate()
    const loc = useLocation()
    const { push } = useToaster()

    async function onSubmit({ email, password }) {
        try {
            const tokens = await apiLogin(email, password)
            login(tokens)

            push({ variant: 'success', title: 'Welcome back', message: 'You are now signed in.' })
            const dest = loc.state?.from?.pathname || '/dashboard'
            nav(dest, { replace: true })
        } catch {
            push({ variant: 'danger', title: 'Login failed', message: 'Please check your credentials.' })
        }
    }

    return (
        <div className="card" style={{ maxWidth: 440, margin: '40px auto' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input id="email" type="email" label="Email" placeholder="you@example.com" required
                    {...register('email', { required: 'Email is required' })}
                    error={errors.email?.message} />
                <Input id="password" type="password" label="Password" placeholder="Enter your password" required
                    {...register('password', { required: 'Password is required' })}
                    error={errors.password?.message} />
                <div style={{ marginTop: 16 }}>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in…' : 'Sign in'}
                    </Button>
                </div>
                <p style={{ marginTop: 12 }}>
                    No account? <Link to="/signup">Create one</Link>
                </p>
            </form>
        </div>
    )
}
