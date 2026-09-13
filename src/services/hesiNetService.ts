import type { FaceExpressions } from '@vladmandic/face-api';

export type HesiNetState = 'H1C1' | 'H1C0' | 'H0C1' | 'H0C0';

export interface InterventionEventDetail {
  state: HesiNetState;
  hesitationProb: number;
  confusionProb: number;
  timestamp: number;
}

export class HesiNetService {
  private static eventTarget = new EventTarget();
  private static history: { t: number; h: number; c: number }[] = [];
  
  // Settings
  private static readonly HISTORY_WINDOW_MS = 5000; // Look at last 5 seconds
  private static readonly COOLDOWN_MS = 30000; // 30 seconds cooldown between interventions
  private static lastInterventionTime = 0;
  
  // Thresholds
  private static readonly THRESHOLD_H = 0.35; // Hesitation threshold
  private static readonly THRESHOLD_C = 0.35; // Confusion threshold

  public static addEventListener(listener: (e: CustomEvent<InterventionEventDetail>) => void) {
    this.eventTarget.addEventListener('intervention', listener as EventListener);
  }

  public static removeEventListener(listener: (e: CustomEvent<InterventionEventDetail>) => void) {
    this.eventTarget.removeEventListener('intervention', listener as EventListener);
  }

  public static pushDetections(expressions: FaceExpressions | null) {
    if (!expressions) return;
    
    const now = Date.now();
    
    // Simple heuristic mapping since face-api doesn't have 'hesitation'/'confusion'
    // Hesitation: fearful, sad, neutral (frozen)
    const hesitationRaw = (expressions.fearful + expressions.sad) / 2 + (expressions.neutral * 0.2);
    // Confusion: angry (furrowed brow), disgusted (squinting), surprised
    const confusionRaw = (expressions.angry + expressions.disgusted + expressions.surprised) / 3;

    this.history.push({ t: now, h: hesitationRaw, c: confusionRaw });
    
    // Clean up old history
    this.history = this.history.filter(item => now - item.t <= this.HISTORY_WINDOW_MS);
    
    this.evaluateState(now);
  }

  private static evaluateState(now: number) {
    if (this.history.length < 5) return; // Need some data points
    if (now - this.lastInterventionTime < this.COOLDOWN_MS) return; // In cooldown
    
    // Calculate smoothed probabilities over the window
    const sumH = this.history.reduce((acc, curr) => acc + curr.h, 0);
    const sumC = this.history.reduce((acc, curr) => acc + curr.c, 0);
    const avgH = sumH / this.history.length;
    const avgC = sumC / this.history.length;
    
    const isHesitating = avgH >= this.THRESHOLD_H;
    const isConfused = avgC >= this.THRESHOLD_C;
    
    let state: HesiNetState = 'H0C0';
    if (isHesitating && isConfused) state = 'H1C1';
    else if (isHesitating && !isConfused) state = 'H1C0';
    else if (!isHesitating && isConfused) state = 'H0C1';
    
    // We only trigger an intervention if there's an active H/C state
    if (state !== 'H0C0') {
      this.lastInterventionTime = now;
      this.eventTarget.dispatchEvent(new CustomEvent<InterventionEventDetail>('intervention', {
        detail: {
          state,
          hesitationProb: avgH,
          confusionProb: avgC,
          timestamp: now
        }
      }));
    }
  }
}
