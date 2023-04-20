import { Request, Response } from 'express';
import { getRoomById, getAllRooms, createRoom, updateRoom, deleteRoom, deleteImageRoom } from '../controllers/rooms';
import prisma from '../client';
import fs from 'fs';
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
    let req: Partial<Request>;
    let res: Partial<Response>;
    const next = jest.fn();

    beforeEach(() => {
        req = { params: { id: '1' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return room and images when room exists', async () => {
        const mockRoom = { id: 1, name: 'test room', ImageRoom:{ id: 1, roomId: 1, url: 'test image' } };

        const mockFindUnique = (prisma.room.findUnique as jest.Mock).mockResolvedValueOnce(mockRoom);

        await getRoomById(req as Request, res as Response, next);

        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { id: 1 }, include: {
                ImageRoom: true
            }
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ room: mockRoom });
    });

    it('should return 404 when room does not exist', async () => {
        (prisma.room.findUnique as jest.Mock).mockResolvedValueOnce(null);

        await getRoomById(req as Request, res as Response, next);

        expect(prisma.room.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }, include: {
                ImageRoom: true
            }
        });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Pas d'enregistrement pour cette id" });
    });

    it('should return 500 when there is an error', async () => {
        // (prisma.room.findUnique as jest.Mock).mockRejectedValueOnce(mockError);
        const mockFindUnique = (prisma.room.findUnique as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

        await getRoomById(req as Request, res as Response, next);

        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { id: 1 }, include: {
                ImageRoom: true
            }
        });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
});

describe('getAllRooms', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    const next = jest.fn();

    beforeEach(() => {
        //   req = ;
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return all rooms and their images', async () => {
        const rooms = [{ id: 1, name: 'Room 1', images: { id: 1, url: 'image1.jpg' } }, { id: 2, name: 'Room 2', images: { id: 2, url: 'image2.jpg' } }];
        (prisma.room.findMany as jest.Mock).mockResolvedValueOnce(rooms);
        await getAllRooms(req as Request, res as Response, next);

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
    });

    it('should return a server error if prisma query fails', async () => {
        (prisma.room.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

        await getAllRooms(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
});

describe('createRoom', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    const next = jest.fn();

    beforeEach(() => {
        req = { body: { data: { room: {} } } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a room without image', async () => {
        const mockCreate = (prisma.room.create as jest.Mock).mockResolvedValueOnce({
            id: 1,
            name: 'Room1',
            description: 'Description1',
        });

        const roomData =
        {
            name: 'Room1',
            description: 'Description1',
        };
        req.body.data.room = roomData

        await createRoom(req as Request, res as Response, next);

        expect(mockCreate).toHaveBeenCalledWith({
            data: {
                name: 'Room1',
                description: 'Description1',
            }
        })

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            room: {
                id: 1,
                name: 'Room1',
                description: 'Description1',
            }
        });
    });

    it('should create a room with image', async () => {
        const mockCreate = (prisma.room.create as jest.Mock).mockResolvedValueOnce({
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

        req.body = {
            ...roomData,
        };
        req.files = mockFiles as any;

        await createRoom(req as Request, res as Response, next);

        expect(mockCreate).toHaveBeenCalledWith({
            data: {
                ...roomData.data.room,
                ImageRoom: {
                    create: [
                        {
                            title: mockFiles[0].filename,
                            description: roomData.data.imageRoom.description,
                            urlStorage: `http://localhost:3000/public/images/${mockFiles[0].filename}`,
                        },
                    ],
                },
            },
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
    });

    it('should handle errors', async () => {
        (prisma.room.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

        await createRoom(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
});

describe('updateRoom', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
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

    it('should update the room without images', async () => {
        (prisma.room.update as jest.Mock).mockResolvedValueOnce({
            id: 1,
            name: 'Updated Room',
            description: 'Updated Room Description'
        });

        await updateRoom(mockReq as Request, mockRes as Response, mockNext);

        expect(prisma.room.update).toHaveBeenCalledWith({
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
    });

    it('should update the room with images', async () => {
        mockReq.files = [
            { filename: 'image1.jpg' },
            { filename: 'image2.jpg' }
        ] as Express.Multer.File[];

        (prisma.room.update as jest.Mock).mockResolvedValueOnce({
            id: 1,
            name: 'Updated Room',
            description: 'Updated Room Description',
            ImageRoom: [
                { id: 1, title: 'image1.jpg', description: 'Updated Room Description', urlStorage: 'http://localhost:3000/public/images/image1.jpg' },
                { id: 2, title: 'image2.jpg', description: 'Updated Room Description', urlStorage: 'http://localhost:3000/public/images/image2.jpg' }
            ]
        });

        await updateRoom(mockReq as Request, mockRes as Response, mockNext);

        expect(prisma.room.update).toHaveBeenCalledWith({
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
    })
});

describe('deleteRoom', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    const next = jest.fn();

    beforeEach(() => {
        req = {} as Request;
        res = {} as Response;
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete a room and its images', async () => {
        const roomId = 1;
        const images = [{ id: 1, title: 'image1.jpg' }, { id: 2, title: 'image2.jpg' },];
        const room = { id: roomId };

        (prisma.imageRoom.findMany as jest.Mock).mockResolvedValue(images);
        (prisma.room.update as jest.Mock).mockResolvedValue(room);
        (prisma.room.delete as jest.Mock).mockResolvedValue(room);
        //   @ts-ignore
        (fs.unlink as jest.Mock).mockResolvedValue((path: string, callback: () => void) => {
            callback();
        });

        req.params = { id: String(roomId) };

        await deleteRoom(req as Request, res as Response, next);

        expect(prisma.imageRoom.findMany).toHaveBeenCalledWith({
            where: { roomId: roomId },
        });
        expect(prisma.room.update).toHaveBeenCalledWith({
            where: { id: roomId },
            data: { ImageRoom: { deleteMany: {} } },
        });
        expect(prisma.room.delete).toHaveBeenCalledWith({ where: { id: roomId } });
        expect(fs.unlink).toHaveBeenCalledTimes(images.length);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(room);
    });

    it('should return 500 error when an error occurs', async () => {
        const roomId = 1;

        (prisma.imageRoom.findMany as jest.Mock).mockRejectedValue('Database error');

        req.params = { id: String(roomId) };

        await deleteRoom(req as Request, res as Response, next);

        expect(prisma.imageRoom.findMany).toHaveBeenCalledWith({
            where: { roomId: roomId },
        });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
});

describe('deleteImageRoom', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    const next = jest.fn();

    beforeEach(() => {
        mockRequest = { body: { data: { room: {} } } };
        mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete image and return success message', async () => {
        const mockRequest = {
            params: { id: '1' },
        } as unknown as Request;

        const mockImage = {
            id: 1,
            title: 'test.jpg',
            // add other properties as needed
        };

        const mockDelete = jest.fn().mockResolvedValueOnce(mockImage);
        (prisma.imageRoom.delete as jest.Mock).mockImplementationOnce(mockDelete);

        const mockUnlink = jest.fn().mockImplementationOnce((_, cb) => cb());
        jest.spyOn(fs, 'unlink').mockImplementationOnce(mockUnlink);

        await deleteImageRoom(mockRequest as Request, mockResponse as Response);

        expect(mockDelete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockUnlink).toHaveBeenCalledWith('public/images/test.jpg', expect.any(Function));
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "l'élément a bien été supprimé" });
    });

    it('should return error message when delete operation fails', async () => {
        const mockRequest = {
            params: { id: '1' },
        } as unknown as Request;

        const mockError = new Error('Something went wrong');
        const mockDelete = jest.fn().mockRejectedValueOnce(mockError);
        (prisma.imageRoom.delete as jest.Mock).mockImplementationOnce(mockDelete);

        await deleteImageRoom(mockRequest as Request, mockResponse as Response);

        expect(mockDelete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
});