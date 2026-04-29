import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MyTasks from './pages/MyTasks'
import MyBids from './pages/MyBids'
import Analytics from './pages/Analytics'
import MyAnalytics from './pages/MyAnalytics'
import TaskDetail from './pages/TaskDetail'
import OrgSettings from './pages/OrgSettings'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import Leaderboard from './pages/Leaderboard'
import Notifications from './pages/Notifications'
import ManagerQueue from './pages/ManagerQueue'
import AcceptInvite from './pages/AcceptInvite'
import { OnboardingWizard } from './components/onboarding/OnboardingWizard'
import { useAuthStore } from './store/authStore'
import { ToastProvider } from './design-system'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/accept-invite" element={<ProtectedRoute><AcceptInvite /></ProtectedRoute>} />
            <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/my-tasks"     element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
            <Route path="/my-bids"      element={<ProtectedRoute><MyBids /></ProtectedRoute>} />
            <Route path="/analytics"    element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/my-analytics" element={<ProtectedRoute><MyAnalytics /></ProtectedRoute>} />
            <Route path="/tasks/:id"    element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
            <Route path="/org/settings" element={<ProtectedRoute><OrgSettings /></ProtectedRoute>} />
            <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:id"  element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
            <Route path="/leaderboard"  element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/manager/queue" element={<ProtectedRoute><ManagerQueue /></ProtectedRoute>} />
            <Route path="/onboarding"    element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />
          </Routes>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
