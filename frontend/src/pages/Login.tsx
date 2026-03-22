import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Zap, ArrowRight } from 'lucide-react'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { Button, Input, useToast } from '../design-system'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((state) => state.setAuth)
  const toast     = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authService.login({ email, password })
      setAuth(response.user, response.access_token)
      toast.success('Welcome back!', `Signed in as ${response.user.name}`)
      navigate('/dashboard')
    } catch (err: any) {
      toast.error('Sign in failed', err.response?.data?.error || 'Please check your credentials')
    } finally {
      setLoading(false)
    }
  }

  const fillTestCredentials = () => {
    setEmail('john@example.com')
    setPassword('password123')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TaskFlow</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Delegate smarter,<br />deliver faster.
            </h1>
            <p className="text-white/70 text-lg mt-4 leading-relaxed">
              The modern task delegation platform built for high-performing teams.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-3">
            {[
              'Real-time task tracking and bidding',
              'Smart analytics and performance insights',
              'Team collaboration at scale',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-white/80 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/50 text-sm">Trusted by teams worldwide</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface-2">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text-primary">Welcome back</h2>
            <p className="text-text-secondary mt-2">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              leftIcon={<Mail size={16} />}
              required
              disabled={loading}
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
              disabled={loading}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              rightIcon={!loading ? <ArrowRight size={18} /> : undefined}
            >
              Sign in
            </Button>
          </form>

          {/* Test credentials */}
          <div className="mt-4 p-4 bg-primary-light rounded-xl border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary mb-1">Test credentials</p>
                <p className="text-xs text-text-secondary">john@example.com · password123</p>
              </div>
              <Button variant="secondary" size="sm" onClick={fillTestCredentials}>
                Fill in
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:text-primary-hover transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
