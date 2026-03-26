import { useState } from 'react'
import { Building2, Sparkles, X, AtSign } from 'lucide-react'
import { Modal, Button, Input } from '../../design-system'
import { useToast } from '../../design-system'
import { orgService } from '../../services/orgService'
import { useAuthStore } from '../../store/authStore'

interface CreateOrgModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
}

export default function CreateOrgModal({ open, onClose, onSuccess }: CreateOrgModalProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { success, error: toastError } = useToast()
  const setOrg = useAuthStore(s => s.setOrg)

  const slug = toSlug(name)

  const handleClose = () => {
    if (loading) return
    setName('')
    setError('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Organization name is required'); return }
    if (trimmed.length < 2) { setError('Name must be at least 2 characters'); return }

    setError('')
    setLoading(true)
    try {
      const { org, accessToken } = await orgService.createOrg(trimmed)
      // Store the fresh token (now contains org_id + role in claims)
      if (accessToken) {
        localStorage.setItem('access_token', accessToken)
        // Update default axios header so in-flight requests use the new token
        const api = (await import('../../services/api')).default
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      }
      // Set org in auth store as admin (creator is always org_admin)
      setOrg(org.id, 'org_admin', 'free')
      success(`Organization "${org.name}" created successfully!`)
      handleClose()
      onSuccess?.()
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to create organization'
      setError(msg)
      toastError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} size="md" hideClose>
      {/* Header */}
      <div className="-mx-6 -mt-6 px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent rounded-t-2xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Create Organization</h2>
            <p className="text-xs text-text-tertiary">Set up your team workspace</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-xl bg-surface-3 hover:bg-surface-2 border border-border flex items-center justify-center transition-colors"
        >
          <X size={15} className="text-text-secondary" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-error/8 border border-error/20 text-error text-sm rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
            {error}
          </div>
        )}

        {/* Org name */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <Sparkles size={11} className="text-text-tertiary" />
            Organization Name
          </label>
          <Input
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="e.g., Acme Corp, My Startup"
            required
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Slug preview */}
        {slug && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <AtSign size={11} className="text-text-tertiary" />
              Slug <span className="font-normal text-text-tertiary">(auto-generated)</span>
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-3 border border-border rounded-lg">
              <AtSign size={13} className="text-text-tertiary shrink-0" />
              <code className="text-sm text-text-secondary font-mono">{slug}</code>
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl text-xs text-text-secondary space-y-1">
          <p className="font-semibold text-primary">You'll be set as Admin</p>
          <p>You can invite team members, manage roles, and configure billing from Organization Settings.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1 border-t border-border">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!name.trim() || loading}
            leftIcon={<Building2 size={15} />}
            className="flex-1"
          >
            Create Organization
          </Button>
        </div>
      </form>
    </Modal>
  )
}
