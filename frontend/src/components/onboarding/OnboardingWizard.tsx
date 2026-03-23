import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Building2, Users, CheckSquare, PartyPopper, ChevronRight, SkipForward, Loader2 } from 'lucide-react'
import { Button, Card, Input } from '../../design-system'
import { useAuthStore } from '../../store/authStore'
import { orgService } from '../../services/orgService'
import { cn } from '../../design-system/utils'

interface Step {
  id: number
  title: string
  description: string
  icon: React.ReactNode
}

const steps: Step[] = [
  { id: 1, title: 'Set up your organization', description: 'Give your workspace a name and identity', icon: <Building2 className="w-6 h-6" /> },
  { id: 2, title: 'Invite your team', description: 'Bring your colleagues on board', icon: <Users className="w-6 h-6" /> },
  { id: 3, title: 'Create your first task', description: 'Start delegating work right away', icon: <CheckSquare className="w-6 h-6" /> },
  { id: 4, title: "You're all set!", description: 'Your workspace is ready to use', icon: <PartyPopper className="w-6 h-6" /> },
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [orgName, setOrgName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const navigate = useNavigate()
  const orgID = useAuthStore(s => s.orgID)

  const completeOnboarding = useMutation({
    mutationFn: (status: 'complete' | 'skipped') =>
      orgService.updateOnboarding(orgID!, status),
    onSuccess: () => navigate('/dashboard'),
  })

  const next = () => {
    if (currentStep < steps.length) setCurrentStep(s => s + 1)
  }

  const skip = () => {
    completeOnboarding.mutate('skipped')
  }

  const complete = () => {
    completeOnboarding.mutate('complete')
  }

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary-container)] via-[var(--color-surface)] to-[var(--color-secondary-container)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-on-surface)]">Step {currentStep} of {steps.length}</span>
            <button onClick={skip} className="flex items-center gap-1 text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              <SkipForward className="w-4 h-4" /> Skip setup
            </button>
          </div>
          <div className="h-2 bg-[var(--color-surface-variant)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                currentStep > step.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : currentStep === step.id
                    ? 'bg-[var(--color-primary-container)] text-[var(--color-primary)] ring-2 ring-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'
              )}>
                {currentStep > step.id ? '✓' : step.icon}
              </div>
              {i < steps.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-2 transition-all', currentStep > step.id ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-variant)]')} style={{ width: '40px' }} />
              )}
            </div>
          ))}
        </div>

        <Card className="p-8">
          {/* Step 1: Org setup */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-container)] flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]">
                  <Building2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-on-surface)]">{steps[0].title}</h2>
                <p className="text-[var(--color-on-surface-variant)] mt-1">{steps[0].description}</p>
              </div>
              <Input
                label="Organization Name"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="Acme Corp"
              />
              <Button className="w-full flex items-center justify-center gap-2" onClick={next} disabled={!orgName.trim()}>
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Invite team */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-secondary-container)] flex items-center justify-center mx-auto mb-4 text-[var(--color-secondary)]">
                  <Users className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-on-surface)]">{steps[1].title}</h2>
                <p className="text-[var(--color-on-surface-variant)] mt-1">{steps[1].description}</p>
              </div>
              <Input
                label="Team member email"
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
              />
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={next}>Skip for now</Button>
                <Button className="flex-1 flex items-center justify-center gap-2" onClick={next}>
                  Send & Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: First task */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-tertiary-container)] flex items-center justify-center mx-auto mb-4 text-[var(--color-tertiary)]">
                  <CheckSquare className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-on-surface)]">{steps[2].title}</h2>
                <p className="text-[var(--color-on-surface-variant)] mt-1">{steps[2].description}</p>
              </div>
              <div className="bg-[var(--color-surface-variant)] rounded-xl p-4 text-sm text-[var(--color-on-surface-variant)]">
                You can create tasks from the Dashboard after setup is complete.
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={next}>Skip for now</Button>
                <Button className="flex-1 flex items-center justify-center gap-2" onClick={next}>
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-tertiary)] flex items-center justify-center mx-auto">
                <PartyPopper className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">You're all set!</h2>
                <p className="text-[var(--color-on-surface-variant)] mt-2">Your workspace is ready. Start delegating tasks and growing your team.</p>
              </div>
              <Button
                className="w-full flex items-center justify-center gap-2"
                onClick={complete}
                disabled={completeOnboarding.isPending}
              >
                {completeOnboarding.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PartyPopper className="w-4 h-4" />}
                Go to Dashboard
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
