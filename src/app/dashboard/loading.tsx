/* eslint-disable */
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full max-w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-4 w-64 bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-[400px] w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="col-span-3 h-[400px] w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
