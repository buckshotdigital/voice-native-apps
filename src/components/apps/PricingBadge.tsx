import { PRICING_MODELS } from '@/lib/constants';
import type { PricingModel } from '@/types';

export default function PricingBadge({ model }: { model: PricingModel }) {
  const config = PRICING_MODELS.find((p) => p.value === model);
  if (!config) return null;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
