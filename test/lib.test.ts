import { ValidateEmail } from '../lib/regex';

describe('ValidateEmail', () => {
  it('should return true when given a valid email address', () => {
    const email = 'test@example.com';
    expect(ValidateEmail(email)).toBe(true);
  });

  it('should return false when given an invalid email address', () => {
    const email = 'invalid-email';
    expect(ValidateEmail(email)).toBe(false);
  });
});