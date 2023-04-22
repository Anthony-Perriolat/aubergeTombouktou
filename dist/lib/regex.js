"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateEmail = void 0;
function ValidateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
exports.ValidateEmail = ValidateEmail;
