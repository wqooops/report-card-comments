'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface BatchSession {
  sessionTime: Date;
  studentCount: number;
  firstStudentId: string;
  gradeLevel: string;
}

interface BatchSessionsProps {
  sessions: BatchSession[];
}

interface DownloadResponse {
  success: boolean;
  csv?: string;
  filename?: string;
  error?: string;
}

export function BatchSessions({ sessions }: BatchSessionsProps) {
  const handleDownload = async (sessionTime: Date) => {
    try {
      const response = await fetch('/api/download-batch-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionTime: sessionTime.toISOString() }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const data: DownloadResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Download failed');
      }

      // Check if we have a direct R2 URL
      if ((data as any).url) {
        // Direct download from R2
        const link = document.createElement('a');
        link.href = (data as any).url;
        link.download = data.filename || 'batch-export.csv';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Batch CSV downloaded from cloud storage');
        return;
      }

      // Fallback: Download from CSV content (backward compatibility)
      if (!data.csv || !data.filename) {
        throw new Error('Invalid response from server');
      }

      // Create blob and download
      const blob = new Blob([data.csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = data.filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success('Batch CSV downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download CSV');
    }
  };

  const formatBatchName = (sessionTime: Date, count: number) => {
    const date = new Date(sessionTime);
    const formatted = date.toISOString().replace(/[:.]/g, '-').slice(0, 16);
    return `Batch_${formatted}_${count}students`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Generation History</CardTitle>
        <CardDescription>
          View and download your bulk-generated report card comments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No batch generations yet. Visit the Batch Import page to get started!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Batch Name</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session, index) => (
                <TableRow key={index}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(session.sessionTime).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatBatchName(session.sessionTime, session.studentCount)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {session.studentCount} students
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(session.sessionTime)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download CSV
                    </Button>
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
