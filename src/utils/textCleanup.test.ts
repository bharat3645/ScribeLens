import { describe, it, expect } from 'vitest';
import { postProcessText } from './textCleanup';

describe('postProcessText', () => {
  it('collapses runs of whitespace into single spaces', () => {
    expect(postProcessText('hello    world\n\nfoo')).toBe('hello world foo');
  });

  it('trims leading and trailing whitespace', () => {
    expect(postProcessText('   padded text   ')).toBe('padded text');
  });

  it('strips an isolated punctuation character surrounded by whitespace', () => {
    // Only the stray character itself is deleted -- the whitespace on
    // either side of it is left untouched (a pre-existing quirk of the
    // OCR cleanup pass, not something this test set changes).
    expect(postProcessText('this is # a test')).toBe('this is  a test');
  });

  it('corrects a "1" misread as "l" before a lowercase letter', () => {
    expect(postProcessText('he1lo')).toBe('hello');
  });

  it('corrects a "0" misread as "o" before a lowercase letter', () => {
    expect(postProcessText('h0use')).toBe('house');
  });

  it('corrects a "5" misread as "s" before a lowercase letter', () => {
    expect(postProcessText('5ample')).toBe('sample');
  });

  it('replaces a stray pipe character with "l"', () => {
    expect(postProcessText('he|lo')).toBe('hello');
  });

  it('leaves digits that are not followed by a lowercase letter untouched', () => {
    expect(postProcessText('order 105 items')).toBe('order 105 items');
  });

  it('returns an empty string unchanged', () => {
    expect(postProcessText('')).toBe('');
  });
});
