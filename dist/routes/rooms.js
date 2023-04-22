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
const express_1 = require("express");
const roomCrlt = __importStar(require("../controllers/rooms"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const permission_1 = __importDefault(require("../middleware/permission"));
const multer_config_1 = __importDefault(require("../middleware/multer-config"));
const router = (0, express_1.Router)();
router.get('/:id', roomCrlt.getRoomById);
router.get('/', roomCrlt.getAllRooms);
router.post('/', authMiddleware_1.authMiddleware, permission_1.default, multer_config_1.default.array('images', 5), roomCrlt.createRoom);
router.put('/:id', authMiddleware_1.authMiddleware, permission_1.default, multer_config_1.default.array('images', 5), roomCrlt.updateRoom);
router.delete('/:id', authMiddleware_1.authMiddleware, permission_1.default, roomCrlt.deleteRoom);
router.delete('img/:id', authMiddleware_1.authMiddleware, permission_1.default, roomCrlt.deleteImageRoom);
exports.default = router;
