import { FEATURES } from '@/config/features';

export function logBuilderMutation(event: string, payload?: unknown) {
  if (!FEATURES.debugAuditLog) return;
  // eslint-disable-next-line no-console
  console.info(`[BuilderAudit] ${event}`, payload);
}
