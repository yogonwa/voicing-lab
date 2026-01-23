/**
 * Key Progress Tests
 */

import {
  createInitialProgress,
  isKeyUnlocked,
  isKeyCompleted,
  getNextKeyToUnlock,
  completeKey,
  getProgressStats,
  KEY_UNLOCK_ORDER,
} from './keyProgress';

describe('createInitialProgress', () => {
  it('starts with only C unlocked', () => {
    const progress = createInitialProgress();

    expect(progress.unlockedKeys).toEqual(['C']);
    expect(progress.completedKeys).toEqual({});
  });
});

describe('isKeyUnlocked', () => {
  it('returns true for C in initial progress', () => {
    const progress = createInitialProgress();
    expect(isKeyUnlocked('C', progress)).toBe(true);
  });

  it('returns false for G in initial progress', () => {
    const progress = createInitialProgress();
    expect(isKeyUnlocked('G', progress)).toBe(false);
  });

  it('returns true for unlocked keys', () => {
    const progress = {
      unlockedKeys: ['C', 'G', 'D'] as any,
      completedKeys: {},
    };

    expect(isKeyUnlocked('C', progress)).toBe(true);
    expect(isKeyUnlocked('G', progress)).toBe(true);
    expect(isKeyUnlocked('D', progress)).toBe(true);
    expect(isKeyUnlocked('A', progress)).toBe(false);
  });
});

describe('isKeyCompleted', () => {
  it('returns false for uncompleted keys', () => {
    const progress = createInitialProgress();
    expect(isKeyCompleted('C', progress)).toBe(false);
  });

  it('returns true for completed keys', () => {
    const progress = {
      unlockedKeys: ['C', 'G'] as any,
      completedKeys: {
        'C': { bestScore: 200, completedAt: '2025-01-01' },
      },
    };

    expect(isKeyCompleted('C', progress)).toBe(true);
    expect(isKeyCompleted('G', progress)).toBe(false);
  });
});

describe('getNextKeyToUnlock', () => {
  it('returns G after C', () => {
    const progress = createInitialProgress();
    expect(getNextKeyToUnlock(progress)).toBe('G');
  });

  it('returns D after C and G are unlocked', () => {
    const progress = {
      unlockedKeys: ['C', 'G'] as any,
      completedKeys: {},
    };

    expect(getNextKeyToUnlock(progress)).toBe('D');
  });

  it('follows circle of fifths order', () => {
    // Verify the unlock order is correct
    expect(KEY_UNLOCK_ORDER).toEqual([
      'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'A#', 'D#', 'G#', 'C#',
    ]);
  });

  it('returns null when all keys unlocked', () => {
    const progress = {
      unlockedKeys: [...KEY_UNLOCK_ORDER],
      completedKeys: {},
    };

    expect(getNextKeyToUnlock(progress)).toBeNull();
  });
});

describe('completeKey', () => {
  it('marks key as completed with score', () => {
    const progress = createInitialProgress();
    const updated = completeKey('C', 225, progress);

    expect(updated.completedKeys['C']).toBeDefined();
    expect(updated.completedKeys['C']!.bestScore).toBe(225);
    expect(updated.completedKeys['C']!.completedAt).toBeDefined();
  });

  it('unlocks next key', () => {
    const progress = createInitialProgress();
    const updated = completeKey('C', 200, progress);

    expect(updated.unlockedKeys).toContain('G');
  });

  it('updates best score if better', () => {
    const progress = {
      unlockedKeys: ['C', 'G'] as any,
      completedKeys: {
        'C': { bestScore: 200, completedAt: '2025-01-01' },
      },
    };

    const updated = completeKey('C', 250, progress);

    expect(updated.completedKeys['C']!.bestScore).toBe(250);
  });

  it('keeps existing score if not better', () => {
    const progress = {
      unlockedKeys: ['C', 'G'] as any,
      completedKeys: {
        'C': { bestScore: 250, completedAt: '2025-01-01' },
      },
    };

    const updated = completeKey('C', 200, progress);

    expect(updated.completedKeys['C']!.bestScore).toBe(250);
  });

  it('does not duplicate unlocked keys', () => {
    const progress = {
      unlockedKeys: ['C', 'G'] as any,
      completedKeys: {},
    };

    const updated = completeKey('C', 200, progress);

    expect(updated.unlockedKeys.filter(k => k === 'G')).toHaveLength(1);
  });
});

describe('getProgressStats', () => {
  it('calculates stats for initial progress', () => {
    const progress = createInitialProgress();
    const stats = getProgressStats(progress);

    expect(stats.totalKeys).toBe(12);
    expect(stats.unlockedCount).toBe(1);
    expect(stats.completedCount).toBe(0);
    expect(stats.percentComplete).toBe(0);
  });

  it('calculates stats for partial progress', () => {
    const progress = {
      unlockedKeys: ['C', 'G', 'D'] as any,
      completedKeys: {
        'C': { bestScore: 200, completedAt: '2025-01-01' },
        'G': { bestScore: 220, completedAt: '2025-01-02' },
      },
    };

    const stats = getProgressStats(progress);

    expect(stats.unlockedCount).toBe(3);
    expect(stats.completedCount).toBe(2);
    expect(stats.percentComplete).toBe(17); // 2/12 = 16.67% rounded
  });

  it('calculates 100% for full completion', () => {
    const progress = {
      unlockedKeys: [...KEY_UNLOCK_ORDER],
      completedKeys: KEY_UNLOCK_ORDER.reduce((acc, key) => {
        acc[key] = { bestScore: 200, completedAt: '2025-01-01' };
        return acc;
      }, {} as any),
    };

    const stats = getProgressStats(progress);

    expect(stats.percentComplete).toBe(100);
  });
});
