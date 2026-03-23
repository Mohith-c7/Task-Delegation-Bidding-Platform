import { useAuthStore } from '../store/authStore'

type Action =
  | 'create_task'
  | 'delete_task'
  | 'manage_members'
  | 'send_invitation'
  | 'change_role'
  | 'view_analytics'
  | 'manage_billing'
  | 'view_audit_log'

const rolePermissions: Record<string, Action[]> = {
  org_admin: [
    'create_task', 'delete_task', 'manage_members', 'send_invitation',
    'change_role', 'view_analytics', 'manage_billing', 'view_audit_log',
  ],
  manager: ['create_task', 'delete_task', 'send_invitation', 'view_analytics'],
  employee: ['view_analytics'],
}

export function useRBAC() {
  const role = useAuthStore((s) => s.role)

  const isOrgAdmin = role === 'org_admin'
  const isManager = role === 'manager'
  const isEmployee = role === 'employee'

  const can = (action: Action): boolean => {
    if (!role) return false
    return rolePermissions[role]?.includes(action) ?? false
  }

  return { isOrgAdmin, isManager, isEmployee, can, role }
}
