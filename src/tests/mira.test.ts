/**
 * MIRA + HESI-NET Structural Tests
 * Browser-compatible — no Node.js require/module needed.
 * Run from browser console or a test harness to verify decision engine behavior.
 */
import { HesiNetService } from '../services/hesiNetService';

export const runMiraTests = () => {
  const results: { pass: boolean; name: string }[] = [];

  const assert = (condition: boolean, name: string) => {
    results.push({ pass: condition, name });
    if (!condition) console.error(`[FAIL] ${name}`);
    else console.log(`[PASS] ${name}`);
  };

  // ── HESI-NET Decision Engine ─────────────────────────────────────────────
  let interventionState = '';
  const listener = (e: Event) => {
    const customEvent = e as CustomEvent<{ state: string }>;
    interventionState = customEvent.detail.state;
  };

  HesiNetService.addEventListener(listener);

  // Neutral face — should NOT trigger intervention
  HesiNetService.pushDetections({
    neutral: 1,
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
    asSortedArray: () => [],
  } as any);

  assert(interventionState === '', 'H0C0: neutral face should not trigger intervention');

  HesiNetService.removeEventListener(listener);

  console.log('\n──────────────────────────────');
  console.log(`Results: ${results.filter(r => r.pass).length}/${results.length} passed`);
  console.log('Note: Language, Boss identity, and humor tests require manual UI verification.');
  console.log('──────────────────────────────\n');

  return results;
};
