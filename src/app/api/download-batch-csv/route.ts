import { regenerateBatchCSV } from '@/actions/dashboard';
import { uploadFile } from '@/storage';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { batchFiles } from '@/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import { getSession } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[Download CSV] API called');
    const body = (await request.json()) as { sessionTime?: string };
    const { sessionTime } = body;

    if (!sessionTime) {
      console.log('[Download CSV] Error: No session time provided');
      return NextResponse.json(
        { success: false, error: 'Session time is required' },
        { status: 400 }
      );
    }

    const session = await getSession();
    if (!session?.user) {
      console.log('[Download CSV] Error: User not authenticated');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Download CSV] User:', session.user.id, 'SessionTime:', sessionTime);

    const db = await getDb();
    const sessionDate = new Date(sessionTime);

    // 1. Check if file already exists in R2 and is not expired
    console.log('[Download CSV] Checking database for existing R2 file...');
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
      console.log('[Download CSV] ✅ Found existing R2 file:', existingFile.r2Url);
      return NextResponse.json({
        success: true,
        url: existingFile.r2Url,
        filename: existingFile.filename,
        fromCache: true,
      });
    }

    console.log('[Download CSV] No existing R2 file found, regenerating CSV...');

    // 2. File doesn't exist or expired, regenerate CSV
    const result = await regenerateBatchCSV(sessionDate);

    if (!result.success) {
      console.log('[Download CSV] Error: CSV regeneration failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log('[Download CSV] ✅ CSV regenerated, size:', result.csv?.length, 'bytes');

    // 3. Upload to R2
    let r2Url = '';
    let r2Key = '';
    try {
      console.log('[Download CSV] Starting R2 upload...');
      console.log('[Download CSV] Filename:', result.filename);
      console.log('[Download CSV] Folder: template-res');
      
      const csvBuffer = Buffer.from(result.csv || '', 'utf-8');
      console.log('[Download CSV] Buffer size:', csvBuffer.length, 'bytes');
      
      const uploadResult = await uploadFile(
        csvBuffer,
        result.filename || 'batch-export.csv',
        'text/csv',
        'template-res'
      );
      r2Url = uploadResult.url;
      r2Key = uploadResult.key;
      console.log('[Download CSV] ✅ R2 upload successful!');
      console.log('[Download CSV] R2 URL:', r2Url);
      console.log('[Download CSV] R2 Key:', r2Key);
    } catch (uploadError) {
      console.error('[Download CSV] ❌ R2 upload error:', uploadError);
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
      console.log('[Download CSV] Saving to database...');
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
      console.log('[Download CSV] ✅ Database record saved');
    } catch (dbError) {
      console.error('[Download CSV] ❌ DB save error:', dbError);
      // Continue even if DB save fails
    }

    // 5. Return R2 URL
    console.log('[Download CSV] ✅ Complete! Returning R2 URL to frontend');
    return NextResponse.json({
      success: true,
      url: r2Url,
      filename: result.filename,
      fromCache: false,
    });
  } catch (error) {
    console.error('[Download CSV] ❌ Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
