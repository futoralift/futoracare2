export function Skeleton({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        backgroundColor: 'var(--border)',
        borderRadius: '6px',
        ...style,
      }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Skeleton style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
        <Skeleton style={{ width: '48px', height: '20px', borderRadius: '99px' }} />
      </div>
      <Skeleton style={{ width: '80px', height: '32px', marginBottom: '8px' }} />
      <Skeleton style={{ width: '120px', height: '14px' }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Skeleton style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
          <Skeleton style={{ flex: 1, height: '18px' }} />
          <Skeleton style={{ width: '100px', height: '18px' }} />
          <Skeleton style={{ width: '80px', height: '18px' }} />
        </div>
      ))}
    </div>
  );
}
