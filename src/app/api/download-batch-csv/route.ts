import { regenerateBatchCSV } from '@/actions/dashboard';
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
