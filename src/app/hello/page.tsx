import HelloCard from '@/components/HelloCard';
import type { ApiHelloResponse } from '@/lib/types';
import Link from 'next/link';

async function getHello(): Promise<ApiHelloResponse> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const res = await fetch(`${base}/api/hello`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch hello');
  }
  return res.json();
}

export default async function HelloPage() {
  let data: ApiHelloResponse | null = null;
  try {
    data = await getHello();
  } catch (e) {
    data = null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="space-y-4 max-w-xl w-full">
        {data ? (
          <HelloCard data={data} />
        ) : (
          <div className="p-6 rounded-md border border-border bg-card text-card-foreground">
            <h2 className="text-lg font-medium">Greeting</h2>
            <p className="text-muted-foreground mt-2">Failed to load message. Please try again.</p>
          </div>
        )}
        <Link href="/" className="text-foreground underline underline-offset-4 hover:opacity-80 transition-opacity">
          ← Back
        </Link>
      </div>
    </main>
  );
}
