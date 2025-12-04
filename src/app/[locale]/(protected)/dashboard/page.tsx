import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { SingleReports } from '@/components/dashboard/single-reports';
import { BatchSessions } from '@/components/dashboard/batch-sessions';
import { getDashboardStats, getSingleReports, getBatchSessions } from '@/actions/dashboard';
import { getTranslations } from 'next-intl/server';

/**
 * Dashboard page - Redesigned
 * Shows real user data: single generation history and batch generation history
 */
export default async function DashboardPage() {
  const t = await getTranslations();

  const breadcrumbs = [
    {
      label: t('Dashboard.dashboard.title'),
      isCurrentPage: true,
    },
  ];

  // Fetch all dashboard data
  const [stats, singleReports, batchSessions] = await Promise.all([
    getDashboardStats(),
    getSingleReports(5),
    getBatchSessions(10),
  ]);

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 p-6">
            {/* Statistics Cards */}
            <StatsCards
              totalReports={stats.totalReports}
              thisMonth={stats.thisMonth}
              batchSessions={stats.batchSessions}
            />

            {/* Single Reports Section */}
            <SingleReports reports={singleReports} />

            {/* Batch Sessions Section */}
            <BatchSessions sessions={batchSessions} />
          </div>
        </div>
      </div>
    </>
  );
}
