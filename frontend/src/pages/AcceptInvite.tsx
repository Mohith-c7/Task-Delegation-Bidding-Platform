import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, Mail } from 'lucide-react'
import { Button, Card } from '../design-system'
import { orgService } from '../services/orgService'

export default function AcceptInvite() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = useMemo(() => params.get('token') || '', [params])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState(false)

  const accept = async () => {
    if (!token) {
      setError('Invitation token is missing.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await orgService.acceptInvitation(token)
      setAccepted(true)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'This invitation is invalid, expired, or belongs to another email address.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-2 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          {accepted ? <CheckCircle2 className="w-7 h-7 text-success" /> : <Mail className="w-7 h-7 text-primary" />}
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{accepted ? 'Invitation accepted' : 'Accept invitation'}</h1>
          <p className="text-sm text-text-tertiary mt-1">
            {accepted ? 'Your organization access is ready.' : 'Use the account with the invited email address.'}
          </p>
        </div>
        {error && <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl p-3">{error}</p>}
        {accepted ? (
          <Button className="w-full" onClick={() => navigate('/dashboard')}>Go to dashboard</Button>
        ) : (
          <Button className="w-full" onClick={accept} disabled={loading || !token}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept Invite'}
          </Button>
        )}
      </Card>
    </div>
  )
}
