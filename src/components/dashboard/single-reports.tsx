import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SingleReport {
  id: string;
  studentName: string;
  grade: string | null;
  pronouns: string;
  content: string;
  createdAt: Date;
}

interface SingleReportsProps {
  reports: SingleReport[];
}

export function SingleReports({ reports }: SingleReportsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Single Reports</CardTitle>
        <CardDescription>
          Latest report card comments generated from the homepage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reports yet. Use the generator on the homepage to create your first one!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {report.pronouns || report.studentName}
                  </TableCell>
                  <TableCell>{report.grade || 'N/A'}</TableCell>
                  <TableCell className="max-w-2xl">
                    <p className="line-clamp-2 hover:line-clamp-none transition-all cursor-pointer text-sm" title={report.content}>
                      {report.content}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
