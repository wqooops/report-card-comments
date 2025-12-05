import { regenerateBatchCSV } from '@/actions/dashboard';
import { uploadFile } from '@/storage';
import { NextRequest, NextResponse } from 'next/server';

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

    const result = await regenerateBatchCSV(new Date(sessionTime));

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Upload CSV to R2 storage
    try {
      const csvBuffer = Buffer.from(result.csv || '', 'utf-8');
      const uploadResult = await uploadFile(
        csvBuffer,
        result.filename || 'batch-export.csv',
        'text/csv',
        'template-res'
      );
      console.log('CSV uploaded to R2:', uploadResult.url);
    } catch (uploadError) {
      // Don't fail the request if upload fails, user still gets the CSV
      console.error('R2 upload error:', uploadError);
    }

    return NextResponse.json({
      success: true,
      csv: result.csv,
      filename: result.filename,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
