import { Badge } from '@/components/ui/badge';

interface FuelStatusBadgeProps {
  status: string;
}

export function FuelStatusBadge({ status }: FuelStatusBadgeProps) {
  const isActive = status === 'ACTIVE';

  return (
    <Badge 
      variant={isActive ? 'default' : 'secondary'}
      className={
        isActive 
          ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
          : 'bg-muted text-muted-foreground'
      }
    >
      {status}
    </Badge>
  );
}
