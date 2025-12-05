import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await getCreditBalanceAction();
    
    if (result?.data?.success) {
      return NextResponse.json({ credits: result.data.credits });
    } else {
      return NextResponse.json(
        { error: result?.data?.error || 'Failed to get credits' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API] get-credit-balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
