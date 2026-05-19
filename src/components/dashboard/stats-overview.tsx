import * as React from 'react'
import { Users, AlertTriangle, Clock, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Stat {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  bgColor: string
  description?: string
}

interface StatsOverviewProps {
  totalClients: number
  highPriorityTasks: number
  overdueTasks: number
  clientsAtRisk: number
}

export function StatsOverview({
  totalClients,
  highPriorityTasks,
  overdueTasks,
  clientsAtRisk,
}: StatsOverviewProps) {
  const stats: Stat[] = [
    {
      label: 'Total Clients',
      value: totalClients,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Active client accounts',
    },
    {
      label: 'High Priority Tasks',
      value: highPriorityTasks,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Across all clients',
    },
    {
      label: 'Overdue Tasks',
      value: overdueTasks,
      icon: Clock,
      color: overdueTasks > 0 ? 'text-red-600' : 'text-gray-400',
      bgColor: overdueTasks > 0 ? 'bg-red-50' : 'bg-gray-50',
      description: 'Need immediate attention',
    },
    {
      label: 'Clients at Risk',
      value: clientsAtRisk,
      icon: TrendingDown,
      color: clientsAtRisk > 0 ? 'text-red-600' : 'text-gray-400',
      bgColor: clientsAtRisk > 0 ? 'bg-red-50' : 'bg-gray-50',
      description: 'High or critical risk level',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p
                  className={cn(
                    'text-3xl font-bold mt-1 tabular-nums',
                    stat.value === 0 ? 'text-gray-300' : 'text-gray-900'
                  )}
                >
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                )}
              </div>
              <div className={cn('p-2.5 rounded-xl', stat.bgColor)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
