import { cn } from '@/lib/utils';
import type { SafetyStatus } from '@/lib/types';

interface SafetyBadgeProps {
  status: SafetyStatus;
  className?: string;
}

const statusConfig: Record<SafetyStatus, { label: string; className: string }> = {
  safe: {
    label: '안전',
    className: 'bg-success text-success-foreground',
  },
  caution: {
    label: '주의',
    className: 'bg-warning text-warning-foreground',
  },
  blocked: {
    label: '반입차단 의심',
    className: 'bg-destructive text-destructive-foreground',
  },
  'user-risk': {
    label: '내 정보 기준 위험',
    className: 'bg-destructive text-destructive-foreground',
  },
  'group-caution': {
    label: '그룹원 주의',
    className: 'bg-warning text-warning-foreground',
  },
};

export function SafetyBadge({ status, className }: SafetyBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
