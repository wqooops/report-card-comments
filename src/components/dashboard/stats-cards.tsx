import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, Zap } from 'lucide-react';

interface StatsCardsProps {
  totalReports: number;
  thisMonth: number;
  batchSessions: number;
}

export function StatsCards({ totalReports, thisMonth, batchSessions }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Reports',
      value: totalReports,
      icon: FileText,
      description: 'All generated comments',
    },
    {
      title: 'This Month',
      value: thisMonth,
      icon: Calendar,
      description: 'Reports this month',
    },
    {
      title: 'Batch Sessions',
      value: batchSessions,
      icon: Zap,
      description: 'Bulk generations',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
