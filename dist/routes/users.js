"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userCrlt = __importStar(require("../controllers/users"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const permission_1 = __importDefault(require("../middleware/permission"));
const router = express_1.default.Router();
router.get('/myUser', authMiddleware_1.authMiddleware, userCrlt.getMyUser);
router.put('/myUser', authMiddleware_1.authMiddleware, userCrlt.updateMyUser);
router.delete('/myUser', authMiddleware_1.authMiddleware, userCrlt.deleteMyUser);
router.get('/', authMiddleware_1.authMiddleware, permission_1.default, userCrlt.getAllUsers);
router.post('/login', userCrlt.login);
router.post('/signUp', userCrlt.signUpUser);
router.put('/:id', authMiddleware_1.authMiddleware, userCrlt.updateUser);
exports.default = router;
