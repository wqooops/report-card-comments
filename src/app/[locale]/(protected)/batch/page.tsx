'use client';

import { processBatchItemAction } from '@/actions/batch-process';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle2, FileText, Loader2, Download } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

interface StudentData {
  gradeLevel: string;
  pronouns: string;
  strength: string;
  weakness?: string;
  status?: 'pending' | 'generating' | 'completed' | 'error';
  result?: string;
  error?: string;
}

export default function BatchPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { executeAsync } = useAction(processBatchItemAction);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        // const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const parsedData: StudentData[] = [];
        
        // Skip header row (i = 1)
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          // Split by comma, handling quoted values
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          
          const student: StudentData = {
            gradeLevel: values[0] || '9th Grade',
            pronouns: values[1] || '',
            strength: values[2] || '',
            weakness: values[3] || '',
            status: 'pending'
          };
          
          // Only add if required fields are present
          if (student.pronouns && student.strength) {
            parsedData.push(student);
          }
        }
        
        setStudents(parsedData);
        toast.success(`Parsed ${parsedData.length} students from CSV`);
      } catch (error) {
        console.error(error);
        toast.error('Failed to parse CSV file');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateAll = async () => {
    setIsProcessing(true);
    toast.info('Batch generation started');
    
    const MAX_RETRIES = 3;
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < students.length; i++) {
      if (students[i].status === 'completed') {
        successCount++;
        continue;
      }

      let retryCount = 0;
      let success = false;

      // Retry loop (max 3 attempts)
      while (retryCount < MAX_RETRIES && !success) {
        setStudents(prev => {
          const newStudents = [...prev];
          newStudents[i].status = 'generating';
          return newStudents;
        });
        
        try {
          console.log(`[Batch] Processing student ${i + 1}/${students.length}, attempt ${retryCount + 1}/${MAX_RETRIES}`);
          
          const result = await executeAsync({
            gradeLevel: students[i].gradeLevel,
            pronouns: students[i].pronouns,
            strength: students[i].strength,
            weakness: students[i].weakness,
          });

          if (result?.data?.success) {
            setStudents(prev => {
              const newStudents = [...prev];
              newStudents[i].status = 'completed';
              newStudents[i].result = result.data?.comment;
              return newStudents;
            });
            success = true;
            successCount++;
            console.log(`[Batch] ✅ Student ${i + 1} succeeded`);
          } else {
            const errorMsg = result?.data?.error || 'Unknown error';
            console.log(`[Batch] ❌ Student ${i + 1} failed (attempt ${retryCount + 1}): ${errorMsg}`);
            
            // Check if it's a permanent failure (insufficient credits)
            if (errorMsg === 'Insufficient credits') {
              console.log(`[Batch] ⚠️ Insufficient credits, skipping retries for student ${i + 1}`);
              retryCount = MAX_RETRIES; // Skip remaining retries
              setStudents(prev => {
                const newStudents = [...prev];
                newStudents[i].status = 'error';
                newStudents[i].error = errorMsg;
                return newStudents;
              });
              failureCount++;
              break; // Exit retry loop for this student
            }
            
            retryCount++;
            if (retryCount >= MAX_RETRIES) {
              setStudents(prev => {
                const newStudents = [...prev];
                newStudents[i].status = 'error';
                newStudents[i].error = errorMsg;
                return newStudents;
              });
              failureCount++;
            } else {
              // Wait before retry (exponential backoff)
              const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
              console.log(`[Batch] ⏳ Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        } catch (error) {
          console.error(`[Batch] ❌ Network error for student ${i + 1} (attempt ${retryCount + 1}):`, error);
          retryCount++;
          
          if (retryCount >= MAX_RETRIES) {
            setStudents(prev => {
              const newStudents = [...prev];
              newStudents[i].status = 'error';
              newStudents[i].error = 'Network error after 3 retries';
              return newStudents;
            });
            failureCount++;
          } else {
            // Wait before retry
            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    }
    
    setIsProcessing(false);
    console.log(`[Batch] ✅ Complete! Success: ${successCount}, Failed: ${failureCount}`);
    toast.success(`Batch completed! ${successCount} successful, ${failureCount} failed`);
  };

  const exportToCSV = () => {
    // Filter only completed students with results
    const completedStudents = students.filter(s => s.status === 'completed' && s.result);
    
    if (completedStudents.length === 0) {
      toast.error('No completed results to export');
      return;
    }

    // CSV Header
    const headers = ['Grade Level', 'Student Pronouns', 'Areas of Strength', 'Areas for Growth', 'Generated Comment'];
    
    // Helper function to escape CSV values
    const escapeCSV = (value: string) => {
      if (!value) return '';
      // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Build CSV rows
    const rows = completedStudents.map(student => [
      escapeCSV(student.gradeLevel),
      escapeCSV(student.pronouns),
      escapeCSV(student.strength),
      escapeCSV(student.weakness || ''),
      escapeCSV(student.result || '')
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `kriterix_results_${timestamp}.csv`;
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    toast.success(`Exported ${completedStudents.length} results to ${filename}`);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Batch Generation</h1>
          <p className="text-muted-foreground">Import students via CSV and generate report cards in bulk.</p>
        </div>
        <Button onClick={handleGenerateAll} disabled={students.length === 0 || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate All ({students.length})
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Students</CardTitle>
          <CardDescription>
            Upload a CSV file with columns: Grade Level, Student Pronouns, Areas of Strength, Areas for Growth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload}
              disabled={isUploading || isProcessing}
            />
            <Button variant="outline" asChild>
              <a href="/template.csv" download>Download Template</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Students Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pronouns</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{student.pronouns}</TableCell>
                    <TableCell>{student.gradeLevel}</TableCell>
                    <TableCell className="max-w-xs truncate" title={student.strength}>{student.strength}</TableCell>
                    <TableCell>
                      {student.status === 'pending' && <span className="text-slate-500">Pending</span>}
                      {student.status === 'generating' && <span className="text-blue-500 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/> Generating</span>}
                      {student.status === 'completed' && <span className="text-green-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Done</span>}
                      {student.status === 'error' && (
                        <div className="flex flex-col gap-2">
                          <span className="text-red-500 flex items-center gap-1" title={student.error}>
                            <AlertCircle className="h-3 w-3"/> Error
                          </span>
                          {student.error === 'Insufficient credits' && (
                            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 max-w-sm">
                              <p className="text-xs font-semibold text-amber-900 mb-1 flex items-center gap-1">
                                💳 Credits Insufficient
                              </p>
                              <p className="text-xs text-amber-800 mb-2">
                                You don't have enough credits to generate this comment. Purchase more credits to continue.
                              </p>
                              <a 
                                href="/pricing" 
                                className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 hover:text-amber-950 underline underline-offset-2"
                              >
                                View Pricing Plans →
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {students.some(s => s.status === 'completed') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Comments</CardTitle>
                <CardDescription>
                  Review and copy the generated report card comments below.
                </CardDescription>
              </div>
              <Button
                variant="default"
                onClick={exportToCSV}
                className="bg-brand-600 hover:bg-brand-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Results (CSV)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student, index) => {
                if (student.status !== 'completed' || !student.result) return null;
                
                return (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900">
                          {student.pronouns} - {student.gradeLevel}
                        </p>
                        <p className="text-xs text-slate-500">
                          Strength: {student.strength.substring(0, 50)}...
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(student.result || '');
                          toast.success('Comment copied to clipboard');
                        }}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-slate-50 rounded p-3 text-sm text-slate-700 leading-relaxed">
                      {student.result}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
