import { regenerateBatchCSV } from '@/actions/dashboard';
import { uploadFile } from '@/storage';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { batchFiles } from '@/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import { getSession } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { sessionTime?: string };
    const { sessionTime } = body;

    if (!sessionTime) {
      return NextResponse.json(
        { success: false, error: 'Session time is required' },
        { status: 400 }
      );
    }

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const sessionDate = new Date(sessionTime);

    // 1. Check if file already exists in R2 and is not expired
    const existingFiles = await db
      .select()
      .from(batchFiles)
      .where(
        and(
          eq(batchFiles.userId, session.user.id),
          eq(batchFiles.sessionTime, sessionDate),
          gt(batchFiles.expiresAt, new Date())
        )
      )
      .limit(1);

    const existingFile = existingFiles[0];

    if (existingFile) {
      // File exists in R2, return URL directly
      return NextResponse.json({
        success: true,
        url: existingFile.r2Url,
        filename: existingFile.filename,
        fromCache: true,
      });
    }

    // 2. File doesn't exist or expired, regenerate CSV
    const result = await regenerateBatchCSV(sessionDate);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // 3. Upload to R2
    let r2Url = '';
    let r2Key = '';
    try {
      const csvBuffer = Buffer.from(result.csv || '', 'utf-8');
      const uploadResult = await uploadFile(
        csvBuffer,
        result.filename || 'batch-export.csv',
        'text/csv',
        'template-res'
      );
      r2Url = uploadResult.url;
      r2Key = uploadResult.key;
      console.log('CSV uploaded to R2:', r2Url);
    } catch (uploadError) {
      console.error('R2 upload error:', uploadError);
      // Return CSV directly if upload fails
      return NextResponse.json({
        success: true,
        csv: result.csv,
        filename: result.filename,
        uploadFailed: true,
      });
    }

    // 4. Save to database
    try {
      // Count students for this batch
      const studentCount = (result.csv?.split('\n').length || 2) - 2; // Exclude header and last empty line

      await db.insert(batchFiles).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        sessionTime: sessionDate,
        filename: result.filename || 'batch-export.csv',
        r2Url,
        r2Key,
        studentCount,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    } catch (dbError) {
      console.error('DB save error:', dbError);
      // Continue even if DB save fails
    }

    // 5. Return R2 URL
    return NextResponse.json({
      success: true,
      url: r2Url,
      filename: result.filename,
      fromCache: false,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
