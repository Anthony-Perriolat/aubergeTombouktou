"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regex_1 = require("../lib/regex");
describe('ValidateEmail', () => {
    it('should return true when given a valid email address', () => {
        const email = 'test@example.com';
        expect((0, regex_1.ValidateEmail)(email)).toBe(true);
    });
    it('should return false when given an invalid email address', () => {
        const email = 'invalid-email';
        expect((0, regex_1.ValidateEmail)(email)).toBe(false);
    });
});
