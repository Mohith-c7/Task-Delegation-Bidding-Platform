import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MyTasks from './pages/MyTasks'
import MyBids from './pages/MyBids'
import Analytics from './pages/Analytics'
import MyAnalytics from './pages/MyAnalytics'
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
            <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/my-tasks"     element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
            <Route path="/my-bids"      element={<ProtectedRoute><MyBids /></ProtectedRoute>} />
            <Route path="/analytics"    element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/my-analytics" element={<ProtectedRoute><MyAnalytics /></ProtectedRoute>} />
          </Routes>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
