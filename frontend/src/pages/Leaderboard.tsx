import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Trophy, Star, Medal, CheckCircle, Loader2 } from 'lucide-react'
import Layout from '../components/common/Layout'
import { Card } from '../design-system'
import api from '../services/api'
import { cn } from '../design-system/utils'

interface LeaderboardUser {
  id: string
  name: string
  avatar_url: string
  total_points: number
  avg_rating: number
  tasks_done: number
}

export default function Leaderboard() {
  const { data: users, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await api.get('/leaderboard')
      return res.data.data
    },
  })

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-warning/20 rounded-2xl flex items-center justify-center text-warning">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Leaderboard</h1>
            <p className="text-text-secondary mt-1">Top contributors ranked by total points</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !users || users.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-medium text-text-primary">No data yet</h3>
            <p className="text-sm text-text-secondary mt-2">Complete tasks to appear on the leaderboard!</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-2 border-b border-border text-xs uppercase font-semibold text-text-tertiary">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl">Rank</th>
                    <th className="px-6 py-4">Contributor</th>
                    <th className="px-6 py-4 text-center">Points</th>
                    <th className="px-6 py-4 text-center">Avg Rating</th>
                    <th className="px-6 py-4 text-center rounded-tr-xl">Tasks Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user, index) => {
                    const isTop1 = index === 0
                    const isTop2 = index === 1
                    const isTop3 = index === 2

                    return (
                      <tr key={user.id} className={cn(
                        "group transition-colors hover:bg-surface-2",
                        isTop1 ? "bg-warning/5" : ""
                      )}>
                        <td className="px-6 py-4 flex items-center font-bold">
                          {isTop1 && <Medal className="w-5 h-5 text-warning mr-2" />}
                          {isTop2 && <Medal className="w-5 h-5 text-slate-400 mr-2" />}
                          {isTop3 && <Medal className="w-5 h-5 text-amber-600 mr-2" />}
                          {!isTop1 && !isTop2 && !isTop3 && <span className="text-text-tertiary w-7 text-center">{index + 1}</span>}
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/profile/${user.id}`} className="flex items-center gap-3 group/link">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-border" />
                            ) : (
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm",
                                isTop1 ? "bg-gradient-to-br from-warning to-amber-500" :
                                isTop2 ? "bg-gradient-to-br from-slate-400 to-slate-600" :
                                isTop3 ? "bg-gradient-to-br from-amber-600 to-amber-800" :
                                "bg-gradient-to-br from-primary to-secondary"
                              )}>
                                {user.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-text-primary group-hover/link:text-primary transition-colors">{user.name}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "font-black text-lg",
                            isTop1 ? "text-warning" : "text-text-primary"
                          )}>
                            {user.total_points.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <Star className={cn("w-4 h-4", user.avg_rating > 0 ? "text-warning fill-warning" : "text-border")} />
                            <span className="font-medium text-text-secondary">{user.avg_rating ? user.avg_rating.toFixed(1) : '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-text-secondary">
                            <CheckCircle className="w-4 h-4 text-success" />
                            {user.tasks_done}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
