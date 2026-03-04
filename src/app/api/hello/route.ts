import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ApiHelloResponse } from '@/lib/types';

export async function GET(req: NextRequest) {
  const payload: ApiHelloResponse = {
    message: 'Hello, World!',
    time: new Date().toISOString(),
  };
  return NextResponse.json(payload);
}

export default {} as never;
