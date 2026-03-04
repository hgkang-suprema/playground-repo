import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ApiHelloResponse } from '@/lib/types';

async function getHello(): Promise<ApiHelloResponse> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const url = `${base}/api/hello`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json() as Promise<ApiHelloResponse>;
}

export default async function Page() {
  const data = await getHello().catch(() => null);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <Card className="max-w-xl w-full p-6 bg-card border border-border shadow-sm">
        <h1 className="text-2xl font-semibold mb-2 text-foreground">Hello</h1>
        <p className="text-muted-foreground mb-4">
          {data ? data.message : 'Failed to load greeting.'}
        </p>
        <p className="text-muted-foreground text-sm">Server time: {data?.time ?? '—'}</p>
        <div className="mt-6">
          <Link
            href="/hello"
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium transition-colors hover:opacity-90"
          >
            Open /hello
          </Link>
        </div>
      </Card>
    </main>
  );
}
