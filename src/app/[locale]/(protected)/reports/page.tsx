import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDb } from '@/db';
import { reports, students } from '@/db/schema';
import { getSession } from '@/lib/server';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const db = await getDb();
  const userReports = await db
    .select({
      id: reports.id,
      studentName: students.name,
      grade: students.grade,
      content: reports.content,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .innerJoin(students, eq(reports.studentId, students.id))
    .where(eq(students.userId, session.user.id))
    .orderBy(desc(reports.createdAt));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports History</h1>
        <p className="text-muted-foreground">View all your generated report card comments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>
            A list of all report card comments generated for your students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No reports found. Go to Batch Import to generate some!
                  </TableCell>
                </TableRow>
              ) : (
                userReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="whitespace-nowrap">
                      {report.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{report.studentName}</TableCell>
                    <TableCell className="max-w-2xl">
                      <p className="line-clamp-2 hover:line-clamp-none transition-all cursor-pointer" title={report.content}>
                        {report.content}
                      </p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
