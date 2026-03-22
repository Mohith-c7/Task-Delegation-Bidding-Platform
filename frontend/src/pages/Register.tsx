import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { Button, Input, useToast } from '../design-system'

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()
  const setAuth  = useAuthStore((state) => state.setAuth)
  const toast    = useToast()

  const passwordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 8)  score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    const map = [
      { label: 'Too short', color: 'bg-error' },
      { label: 'Weak',      color: 'bg-error' },
      { label: 'Fair',      color: 'bg-warning' },
      { label: 'Good',      color: 'bg-info' },
      { label: 'Strong',    color: 'bg-success' },
    ]
    return { score, ...map[score] }
  }

  const strength = passwordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', 'Please make sure both passwords are identical')
      return
    }
    if (formData.password.length < 6) {
      toast.error('Password too short', 'Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { confirmPassword: _, ...registerData } = formData
      const response = await authService.register(registerData)
      setAuth(response.user, response.access_token)
      toast.success('Account created!', `Welcome to TaskFlow, ${response.user.name}`)
      navigate('/dashboard')
    } catch (err: any) {
      toast.error('Registration failed', err.response?.data?.error || 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0D47A1] via-[#1A73E8] to-[#34A853] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">TaskFlow</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Start delegating<br />in minutes.
            </h1>
            <p className="text-white/70 text-lg mt-4">
              Join thousands of teams already using TaskFlow to get more done.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '10k+', label: 'Active users' },
              { value: '50k+', label: 'Tasks completed' },
              { value: '99.9%', label: 'Uptime' },
              { value: '4.9★', label: 'User rating' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/50 text-sm">Free to start. No credit card required.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface-2 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text-primary">Create your account</h2>
            <p className="text-text-secondary mt-2">Get started for free — no credit card needed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              value={formData.name}
              onChange={update('name')}
              placeholder="John Doe"
              leftIcon={<User size={16} />}
              required
              disabled={loading}
              autoComplete="name"
            />

            <Input
              label="Work email"
              type="email"
              value={formData.email}
              onChange={update('email')}
              placeholder="you@company.com"
              leftIcon={<Mail size={16} />}
              required
              disabled={loading}
              autoComplete="email"
            />

            <div className="space-y-1.5">
              <Input
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={formData.password}
                onChange={update('password')}
                placeholder="Min. 6 characters"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPwd(s => !s)} tabIndex={-1}
                    className="text-text-tertiary hover:text-text-primary transition-colors">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
                disabled={loading}
              />
              {/* Password strength bar */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : 'bg-border'
                      }`} />
                    ))}
                  </div>
                  <p className="text-xs text-text-secondary">{strength.label}</p>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              type={showPwd ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={update('confirmPassword')}
              placeholder="Repeat your password"
              leftIcon={<Lock size={16} />}
              rightIcon={
                formData.confirmPassword && formData.password === formData.confirmPassword
                  ? <CheckCircle2 size={16} className="text-success" />
                  : undefined
              }
              error={
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'Passwords do not match'
                  : undefined
              }
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              rightIcon={!loading ? <ArrowRight size={18} /> : undefined}
              className="mt-2"
            >
              Create account
            </Button>
          </form>

          <p className="mt-4 text-xs text-text-tertiary text-center">
            By creating an account, you agree to our{' '}
            <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
          </p>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/" className="text-primary font-semibold hover:text-primary-hover transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
