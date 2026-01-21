import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';

export interface DiffResult {
  hasChanged: boolean;
  oldHash: string;
  newHash: string;
  textDiff?: string;
  changePercentage?: number;
}

@Injectable()
export class DiffEngineService {
  private readonly logger = new Logger(DiffEngineService.name);

  calculateHash(text: string): string {
    const normalizedText = this.normalizeText(text);
    return createHash('sha256').update(normalizedText, 'utf8').digest('hex');
  }

  compareTexts(oldText: string, newText: string, oldHash?: string): DiffResult {
    const newHash = this.calculateHash(newText);
    const computedOldHash = oldHash || this.calculateHash(oldText);

    const hasChanged = computedOldHash !== newHash;

    if (!hasChanged) {
      return {
        hasChanged: false,
        oldHash: computedOldHash,
        newHash
      };
    }

    const textDiff = this.generateSimpleDiff(oldText, newText);
    const changePercentage = this.calculateChangePercentage(oldText, newText);

    this.logger.log(`Content changed: ${changePercentage.toFixed(2)}% difference detected`);

    return {
      hasChanged: true,
      oldHash: computedOldHash,
      newHash,
      textDiff,
      changePercentage
    };
  }

  private normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\r\n/g, '\n')
      .trim()
      .toLowerCase();
  }

  private generateSimpleDiff(oldText: string, newText: string): string {
    const oldLines = oldText.split('\n').filter(line => line.trim().length > 0);
    const newLines = newText.split('\n').filter(line => line.trim().length > 0);

    const added: string[] = [];
    const removed: string[] = [];

    const oldSet = new Set(oldLines.map(line => line.trim()));
    const newSet = new Set(newLines.map(line => line.trim()));

    newLines.forEach(line => {
      const trimmed = line.trim();
      if (!oldSet.has(trimmed) && trimmed.length > 20) {
        added.push(trimmed);
      }
    });

    oldLines.forEach(line => {
      const trimmed = line.trim();
      if (!newSet.has(trimmed) && trimmed.length > 20) {
        removed.push(trimmed);
      }
    });

    let diff = '';
    
    if (removed.length > 0) {
      diff += '=== REMOVED ===\n';
      diff += removed.slice(0, 5).map(line => `- ${line.substring(0, 200)}`).join('\n');
      if (removed.length > 5) {
        diff += `\n... and ${removed.length - 5} more removed lines`;
      }
      diff += '\n\n';
    }

    if (added.length > 0) {
      diff += '=== ADDED ===\n';
      diff += added.slice(0, 5).map(line => `+ ${line.substring(0, 200)}`).join('\n');
      if (added.length > 5) {
        diff += `\n... and ${added.length - 5} more added lines`;
      }
    }

    return diff || 'Content structure changed significantly';
  }

  private calculateChangePercentage(oldText: string, newText: string): number {
    const oldLength = oldText.length;
    const newLength = newText.length;

    if (oldLength === 0 && newLength === 0) return 0;
    if (oldLength === 0) return 100;

    const lengthDiff = Math.abs(oldLength - newLength);
    const maxLength = Math.max(oldLength, newLength);

    return (lengthDiff / maxLength) * 100;
  }

  isSignificantChange(changePercentage: number): boolean {
    return changePercentage > 5;
  }
}
