import { Card } from '@/components/ui/card';
import { ApiHelloResponse } from '@/lib/types';

interface HelloCardProps {
  data: ApiHelloResponse;
}

export default function HelloCard({ data }: HelloCardProps) {
  return (
    <Card className="p-6 bg-card shadow-sm">
      <h2 className="text-lg font-medium text-foreground">Greeting</h2>
      <p className="text-muted-foreground mt-2">{data.message}</p>
      <p className="text-muted-foreground text-sm mt-1">time: {data.time ?? '—'}</p>
    </Card>
  );
}
