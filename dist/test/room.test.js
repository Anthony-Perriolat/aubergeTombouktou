"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rooms_1 = require("../controllers/rooms");
const client_1 = __importDefault(require("../client"));
const fs_1 = __importDefault(require("fs"));
// jest.mock('prisma')
process.env.HOSTNAME = 'localhost',
    process.env.PROTOCOL = 'http';
process.env.PORT = '3000';
jest.mock('fs', () => ({
    unlink: jest.fn(),
}));
jest.mock('../client', () => ({
    room: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn()
    },
    imageRoom: {
        findMany: jest.fn(),
        delete: jest.fn()
    },
}));
describe('getRoomById', () => {
    let req;
    let res;
    const next = jest.fn();
    beforeEach(() => {
        req = { params: { id: '1' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should return room and images when room exists', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRoom = { id: 1, name: 'test room', ImageRoom: { id: 1, roomId: 1, url: 'test image' } };
        const mockFindUnique = client_1.default.room.findUnique.mockResolvedValueOnce(mockRoom);
        yield (0, rooms_1.getRoomById)(req, res, next);
        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { id: 1 }, include: {
                ImageRoom: true
            }
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ room: mockRoom });
    }));
    it('should return 404 when room does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        client_1.default.room.findUnique.mockResolvedValueOnce(null);
        yield (0, rooms_1.getRoomById)(req, res, next);
        expect(client_1.default.room.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }, include: {
                ImageRoom: true
            }
        });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Pas d'enregistrement pour cette id" });
    }));
    it('should return 500 when there is an error', () => __awaiter(void 0, void 0, void 0, function* () {
        // (prisma.room.findUnique as jest.Mock).mockRejectedValueOnce(mockError);
        const mockFindUnique = client_1.default.room.findUnique.mockRejectedValueOnce(new Error('Database error'));
        yield (0, rooms_1.getRoomById)(req, res, next);
        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { id: 1 }, include: {
                ImageRoom: true
            }
        });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('getAllRooms', () => {
    let req;
    let res;
    const next = jest.fn();
    beforeEach(() => {
        //   req = ;
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should return all rooms and their images', () => __awaiter(void 0, void 0, void 0, function* () {
        const rooms = [{ id: 1, name: 'Room 1', images: { id: 1, url: 'image1.jpg' } }, { id: 2, name: 'Room 2', images: { id: 2, url: 'image2.jpg' } }];
        client_1.default.room.findMany.mockResolvedValueOnce(rooms);
        yield (0, rooms_1.getAllRooms)(req, res, next);
        expect(res.json).toHaveBeenCalledWith([
            {
                id: 1,
                name: 'Room 1',
                images: { id: 1, url: 'image1.jpg' },
            },
            {
                id: 2,
                name: 'Room 2',
                images: { id: 2, url: 'image2.jpg' },
            },
        ]);
        expect(res.status).toHaveBeenCalledWith(200);
    }));
    it('should return a server error if prisma query fails', () => __awaiter(void 0, void 0, void 0, function* () {
        client_1.default.room.findMany.mockRejectedValueOnce(new Error('Database error'));
        yield (0, rooms_1.getAllRooms)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('createRoom', () => {
    let req;
    let res;
    const next = jest.fn();
    beforeEach(() => {
        req = { body: { data: { room: {} } } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should create a room without image', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockCreate = client_1.default.room.create.mockResolvedValueOnce({
            id: 1,
            name: 'Room1',
            description: 'Description1',
        });
        const roomData = {
            name: 'Room1',
            description: 'Description1',
        };
        req.body.data.room = roomData;
        yield (0, rooms_1.createRoom)(req, res, next);
        expect(mockCreate).toHaveBeenCalledWith({
            data: {
                name: 'Room1',
                description: 'Description1',
            }
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            room: {
                id: 1,
                name: 'Room1',
                description: 'Description1',
            }
        });
    }));
    it('should create a room with image', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockCreate = client_1.default.room.create.mockResolvedValueOnce({
            id: 1,
            name: 'Room1',
            description: 'Description1',
            ImageRoom: [{ title: 'image1.jpg', description: 'Description1', urlStorage: 'http://localhost:3000/public/images/image1.jpg' }],
        });
        const mockFiles = [
            {
                filename: 'image1.jpg',
            },
        ];
        const roomData = {
            data: {
                room: {
                    name: 'Room1',
                    description: 'Description1',
                },
                imageRoom: {
                    description: 'Description1',
                },
            },
        };
        req.body = Object.assign({}, roomData);
        req.files = mockFiles;
        yield (0, rooms_1.createRoom)(req, res, next);
        expect(mockCreate).toHaveBeenCalledWith({
            data: Object.assign(Object.assign({}, roomData.data.room), { ImageRoom: {
                    create: [
                        {
                            title: mockFiles[0].filename,
                            description: roomData.data.imageRoom.description,
                            urlStorage: `http://localhost:3000/public/images/${mockFiles[0].filename}`,
                        },
                    ],
                } }),
            include: {
                ImageRoom: true,
            },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            room: {
                id: 1,
                name: 'Room1',
                description: 'Description1',
                ImageRoom: [{ title: 'image1.jpg', description: 'Description1', urlStorage: 'http://localhost:3000/public/images/image1.jpg' }],
            }
        });
    }));
    it('should handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
        client_1.default.room.create.mockRejectedValueOnce(new Error('Database error'));
        yield (0, rooms_1.createRoom)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('updateRoom', () => {
    let mockReq;
    let mockRes;
    const mockNext = jest.fn();
    beforeEach(() => {
        mockReq = {
            params: {
                id: '1'
            },
            body: {
                data: {
                    name: 'Updated Room',
                    description: 'Updated Room Description'
                }
            },
            // files: []
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('should update the room without images', () => __awaiter(void 0, void 0, void 0, function* () {
        client_1.default.room.update.mockResolvedValueOnce({
            id: 1,
            name: 'Updated Room',
            description: 'Updated Room Description'
        });
        yield (0, rooms_1.updateRoom)(mockReq, mockRes, mockNext);
        expect(client_1.default.room.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                name: 'Updated Room',
                description: 'Updated Room Description'
            },
        });
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
            room: {
                id: 1,
                name: 'Updated Room',
                description: 'Updated Room Description'
            }
        });
    }));
    it('should update the room with images', () => __awaiter(void 0, void 0, void 0, function* () {
        mockReq.files = [
            { filename: 'image1.jpg' },
            { filename: 'image2.jpg' }
        ];
        client_1.default.room.update.mockResolvedValueOnce({
            id: 1,
            name: 'Updated Room',
            description: 'Updated Room Description',
            ImageRoom: [
                { id: 1, title: 'image1.jpg', description: 'Updated Room Description', urlStorage: 'http://localhost:3000/public/images/image1.jpg' },
                { id: 2, title: 'image2.jpg', description: 'Updated Room Description', urlStorage: 'http://localhost:3000/public/images/image2.jpg' }
            ]
        });
        yield (0, rooms_1.updateRoom)(mockReq, mockRes, mockNext);
        expect(client_1.default.room.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                name: 'Updated Room',
                description: 'Updated Room Description',
                ImageRoom: {
                    upsert: {
                        create: [
                            { title: 'image1.jpg', description: 'Updated Room Description', urlStorage: 'http://localhost:3000/public/images/image1.jpg' },
                            { title: 'image2.jpg', description: 'Updated Room Description', urlStorage: 'http://localhost:3000/public/images/image2.jpg' }
                        ],
                        update: [
                            { title: 'image1.jpg', description: 'Updated Room Description', urlStorage: 'http://localhost:3000/public/images/image1.jpg' },
                            { title: 'image2.jpg', description: 'Updated Room Description', urlStorage: 'http://localhost:3000/public/images/image2.jpg' }
                        ]
                    }
                }
            },
            include: {
                ImageRoom: true
            }
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            room: {
                id: 1,
                name: 'Updated Room',
                description: 'Updated Room Description',
                ImageRoom: [
                    { id: 1, title: 'image1.jpg', description: 'Updated Room Description', urlStorage: 'http://localhost:3000/public/images/image1.jpg' },
                    { id: 2, title: 'image2.jpg', description: 'Updated Room Description', urlStorage: 'http://localhost:3000/public/images/image2.jpg' }
                ],
            }
        });
    }));
});
describe('deleteRoom', () => {
    let req;
    let res;
    const next = jest.fn();
    beforeEach(() => {
        req = {};
        res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should delete a room and its images', () => __awaiter(void 0, void 0, void 0, function* () {
        const roomId = 1;
        const images = [{ id: 1, title: 'image1.jpg' }, { id: 2, title: 'image2.jpg' },];
        const room = { id: roomId };
        client_1.default.imageRoom.findMany.mockResolvedValue(images);
        client_1.default.room.update.mockResolvedValue(room);
        client_1.default.room.delete.mockResolvedValue(room);
        //   @ts-ignore
        fs_1.default.unlink.mockResolvedValue((path, callback) => {
            callback();
        });
        req.params = { id: String(roomId) };
        yield (0, rooms_1.deleteRoom)(req, res, next);
        expect(client_1.default.imageRoom.findMany).toHaveBeenCalledWith({
            where: { roomId: roomId },
        });
        expect(client_1.default.room.update).toHaveBeenCalledWith({
            where: { id: roomId },
            data: { ImageRoom: { deleteMany: {} } },
        });
        expect(client_1.default.room.delete).toHaveBeenCalledWith({ where: { id: roomId } });
        expect(fs_1.default.unlink).toHaveBeenCalledTimes(images.length);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(room);
    }));
    it('should return 500 error when an error occurs', () => __awaiter(void 0, void 0, void 0, function* () {
        const roomId = 1;
        client_1.default.imageRoom.findMany.mockRejectedValue('Database error');
        req.params = { id: String(roomId) };
        yield (0, rooms_1.deleteRoom)(req, res, next);
        expect(client_1.default.imageRoom.findMany).toHaveBeenCalledWith({
            where: { roomId: roomId },
        });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('deleteImageRoom', () => {
    let mockRequest;
    let mockResponse;
    const next = jest.fn();
    beforeEach(() => {
        mockRequest = { body: { data: { room: {} } } };
        mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should delete image and return success message', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequest = {
            params: { id: '1' },
        };
        const mockImage = {
            id: 1,
            title: 'test.jpg',
            // add other properties as needed
        };
        const mockDelete = jest.fn().mockResolvedValueOnce(mockImage);
        client_1.default.imageRoom.delete.mockImplementationOnce(mockDelete);
        const mockUnlink = jest.fn().mockImplementationOnce((_, cb) => cb());
        jest.spyOn(fs_1.default, 'unlink').mockImplementationOnce(mockUnlink);
        yield (0, rooms_1.deleteImageRoom)(mockRequest, mockResponse);
        expect(mockDelete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockUnlink).toHaveBeenCalledWith('public/images/test.jpg', expect.any(Function));
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "l'élément a bien été supprimé" });
    }));
    it('should return error message when delete operation fails', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequest = {
            params: { id: '1' },
        };
        const mockError = new Error('Something went wrong');
        const mockDelete = jest.fn().mockRejectedValueOnce(mockError);
        client_1.default.imageRoom.delete.mockImplementationOnce(mockDelete);
        yield (0, rooms_1.deleteImageRoom)(mockRequest, mockResponse);
        expect(mockDelete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
