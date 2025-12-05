'use server';

import { getDb } from '@/db';
import { reports, students } from '@/db/schema';
import { getSession } from '@/lib/server';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';

/**
 * Get recent single generation reports (from homepage generator)
 * Single reports are those created one at a time, not in batches
 */
export async function getSingleReports(limit = 5) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const db = await getDb();
  
  // Get single reports - students created individually (not in batches)
  // We identify batch by grouping students created within the same minute
  const singleReports = await db
    .select({
      id: reports.id,
      studentName: students.name,
      grade: students.grade,
      pronouns: sql<string>`jsonb_extract_path_text(${students.attributes}::jsonb, 'pronouns')`,
      content: reports.content,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .innerJoin(students, eq(reports.studentId, students.id))
    .where(eq(students.userId, session.user.id))
    .orderBy(desc(reports.createdAt))
    .limit(limit);

  return singleReports;
}

/**
 * Get batch generation sessions
 * Groups students created within the same minute as a single batch
 */
export async function getBatchSessions(limit = 10) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const db = await getDb();
  
  // Group students by minute to identify batch sessions
  const batchSessions = await db
    .select({
      sessionTime: sql<Date>`DATE_TRUNC('minute', ${students.createdAt})`,
      studentCount: sql<number>`COUNT(*)::int`,
      firstStudentId: sql<string>`MIN(${students.id})`,
      gradeLevel: sql<string>`MIN(${students.grade})`,
    })
    .from(students)
    .where(eq(students.userId, session.user.id))
    .groupBy(sql`DATE_TRUNC('minute', ${students.createdAt})`)
    .having(sql`COUNT(*) > 1`) // Only show batches (more than 1 student)
    .orderBy(desc(sql`DATE_TRUNC('minute', ${students.createdAt})`))
    .limit(limit);

  return batchSessions;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const db = await getDb();
  
  // Total reports count
  const totalReportsResult = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(reports)
    .innerJoin(students, eq(reports.studentId, students.id))
    .where(eq(students.userId, session.user.id));

  // This month's reports
  const thisMonthResult = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(reports)
    .innerJoin(students, eq(reports.studentId, students.id))
    .where(
      and(
        eq(students.userId, session.user.id),
        sql`${reports.createdAt} >= DATE_TRUNC('month', CURRENT_DATE)`
      )
    );

  // Batch sessions count
  const batchSessionsResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT DATE_TRUNC('minute', ${students.createdAt}))::int` })
    .from(students)
    .where(eq(students.userId, session.user.id));

  return {
    totalReports: totalReportsResult[0]?.count || 0,
    thisMonth: thisMonthResult[0]?.count || 0,
    batchSessions: batchSessionsResult[0]?.count || 0,
  };
}

/**
 * Regenerate CSV for a batch session
 */
export async function regenerateBatchCSV(sessionTime: Date) {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const db = await getDb();
  
  try {
    // Get all students from this batch session
    const batchStudents = await db
      .select({
        id: students.id,
        name: students.name,
        grade: students.grade,
        attributes: students.attributes,
      })
      .from(students)
      .where(
        and(
          eq(students.userId, session.user.id),
          sql`DATE_TRUNC('minute', ${students.createdAt}) = DATE_TRUNC('minute', ${sessionTime}::timestamp)`
        )
      );

    // Get corresponding reports
    const studentIds = batchStudents.map(s => s.id);
    
    if (studentIds.length === 0) {
      return {
        success: true,
        csv: '',
        filename: 'empty.csv',
      };
    }

    const batchReports = await db
      .select({
        studentId: reports.studentId,
        content: reports.content,
      })
      .from(reports)
      .where(inArray(reports.studentId, studentIds));

    // Create a map for quick lookup
    const reportsMap = new Map(batchReports.map(r => [r.studentId, r.content]));

    // Build CSV
    const headers = ['Grade Level', 'Student Pronouns', 'Areas of Strength', 'Areas for Growth', 'Generated Comment'];
    
    const escapeCSV = (value: string) => {
      if (!value) return '';
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const rows = batchStudents.map(student => {
      const attrs = student.attributes ? JSON.parse(student.attributes) : {};
      const report = reportsMap.get(student.id) || '';
      
      return [
        escapeCSV(student.grade || ''),
        escapeCSV(attrs.pronouns || ''),
        escapeCSV(attrs.strength || ''),
        escapeCSV(attrs.weakness || ''),
        escapeCSV(report)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return {
      success: true,
      csv: csvContent,
      filename: `kriterix_batch_${new Date(sessionTime).toISOString().replace(/[:.]/g, '-').slice(0, -5)}.csv`
    };
  } catch (error) {
    console.error('CSV regeneration error:', error);
    return { success: false, error: 'Failed to regenerate CSV' };
  }
}
