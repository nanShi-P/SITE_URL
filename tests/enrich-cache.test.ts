import { describe, it, expect } from 'vitest';
import { needsRefresh } from '../scripts/enrich';
import { sha256 } from '../scripts/lib/hash';

describe('needsRefresh', () => {
  it('returns true when no cache', () => {
    expect(needsRefresh(null, 'h1')).toBe(true);
  });
  it('returns false when hash matches', () => {
    expect(needsRefresh({ source_hash: 'h1' } as any, 'h1')).toBe(false);
  });
  it('returns true when hash differs', () => {
    expect(needsRefresh({ source_hash: 'h1' } as any, 'h2')).toBe(true);
  });
  it('hash is stable for same input', () => {
    expect(sha256('abc')).toBe(sha256('abc'));
  });
});
