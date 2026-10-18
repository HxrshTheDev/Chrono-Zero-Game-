import { CONFIG } from '../GameConfig.ts';

export interface PlayerHistorySample {
  timestamp: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  isGrounded: boolean;
  action?: 'idle' | 'walk' | 'jump' | 'fall';
}

/**
 * High-precision 5-second rolling buffer for time rewind and Echo recording.
 * Discards samples older than CONFIG.MAX_REWIND_SECONDS (5.0s).
 */
export class TimeRecorder {
  private buffer: PlayerHistorySample[] = [];
  private lastSampleTime: number = -1;

  public record(currentTime: number, state: Omit<PlayerHistorySample, 'timestamp'>): void {
    if (this.lastSampleTime < 0 || currentTime - this.lastSampleTime >= CONFIG.SAMPLE_INTERVAL) {
      this.lastSampleTime = currentTime;
      this.buffer.push({
        timestamp: currentTime,
        ...state,
      });

      // Discard samples older than 5 seconds
      const cutoff = currentTime - CONFIG.MAX_REWIND_SECONDS;
      while (this.buffer.length > 0 && this.buffer[0].timestamp < cutoff) {
        this.buffer.shift();
      }
    }
  }

  public getDuration(): number {
    if (this.buffer.length < 2) return 0;
    return this.buffer[this.buffer.length - 1].timestamp - this.buffer[0].timestamp;
  }

  public getPercentage(): number {
    return Math.min(100, Math.round((this.getDuration() / CONFIG.MAX_REWIND_SECONDS) * 100));
  }

  public getOldestState(): PlayerHistorySample | null {
    if (this.buffer.length === 0) return null;
    return this.buffer[0];
  }

  public getLatestState(): PlayerHistorySample | null {
    if (this.buffer.length === 0) return null;
    return this.buffer[this.buffer.length - 1];
  }

  /**
   * Clones current chronological recording sequence for Echo playback.
   */
  public cloneTimeline(): PlayerHistorySample[] {
    return this.buffer.map((sample) => ({ ...sample }));
  }

  public clear(): void {
    this.buffer = [];
    this.lastSampleTime = -1;
  }

  public getSampleCount(): number {
    return this.buffer.length;
  }
}
