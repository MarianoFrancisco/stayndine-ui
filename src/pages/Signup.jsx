import { useForm } from 'react-hook-form'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useToaster } from '../ui/Toaster'
import { signup as apiSignup, login as apiLogin } from '../api/auth'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
    const { push } = useToaster()
    const nav = useNavigate()
    const { login } = useAuth()

    async function onSubmit(values) {
        try {
            await apiSignup(values)
            const tokens = await apiLogin(values.email, values.password)
            login(tokens)
            push({ variant: 'success', title: 'Account created', message: 'Welcome to Stayndine!' })
            nav('/dashboard', { replace: true })
        } catch {
            push({ variant: 'danger', title: 'Sign up failed', message: 'Please verify the information and try again.' })
        }
    }

    return (
        <div className="card card--form" style={{ maxWidth: 720, margin: '40px auto' }}>
            <h2>Create your account</h2>
            <form className="form" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-2">
                    <Input
                        id="firstName"
                        label="First name"
                        placeholder="Mariano"
                        required
                        {...register('firstName', { required: 'First name is required' })}
                        error={errors.firstName?.message}
                    />
                    <Input
                        id="lastName"
                        label="Last name"
                        placeholder="Camposeco"
                        required
                        {...register('lastName', { required: 'Last name is required' })}
                        error={errors.lastName?.message}
                    />
                </div>

                <div className="grid">
                    <Input
                        id="email"
                        type="email"
                        label="Email"
                        placeholder="mariano.camposeco@example.com"
                        required
                        {...register('email', { required: 'Email is required' })}
                        error={errors.email?.message}
                    />
                </div>

                <div className="grid">
                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="Choose a secure password"
                        required
                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                        error={errors.password?.message}
                    />
                </div>

                <div className="grid grid-2">
                    <Input
                        id="phone"
                        label="Mobile number"
                        placeholder="31840649"
                        {...register('phone')}
                        error={errors.phone?.message}
                    />
                    <Input
                        id="birthDate"
                        type="date"
                        label="Date of birth"
                        {...register('birthDate')}
                        error={errors.birthDate?.message}
                    />
                </div>

                <div className="form-actions">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating…' : 'Create account'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
