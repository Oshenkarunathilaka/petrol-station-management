import { Progress } from '@/components/ui/progress'

export function FuelStock() {
  const tanks = [
    { name: 'Tank 1 (Petrol 95)', current: 8500, capacity: 10000, color: 'bg-green-500' },
    { name: 'Tank 2 (Diesel)', current: 2000, capacity: 15000, color: 'bg-red-500' },
    { name: 'Tank 3 (Premium)', current: 4000, capacity: 5000, color: 'bg-blue-500' },
  ]

  return (
    <div className="space-y-6">
      {tanks.map((tank) => {
        const percentage = (tank.current / tank.capacity) * 100
        return (
          <div key={tank.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{tank.name}</span>
              <span className="text-muted-foreground">
                {tank.current.toLocaleString()}L / {tank.capacity.toLocaleString()}L
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        )
      })}
    </div>
  )
}
