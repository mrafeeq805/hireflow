import { describe, it, expect } from 'vitest';
import { formatCurrency, getInitials, formatDate } from '../src/lib/utils';

describe('Web Utility Functions', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(120000)).toBe('$120,000');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('extracts initials from full names', () => {
    expect(getInitials('Alex Morgan')).toBe('AM');
    expect(getInitials('Sarah Jenkins')).toBe('SJ');
    expect(getInitials('David')).toBe('DA');
  });

  it('formats date to readable format', () => {
    const formatted = formatDate(new Date('2026-10-15T12:00:00Z'));
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Oct');
  });
});

