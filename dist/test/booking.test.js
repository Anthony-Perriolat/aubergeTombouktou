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
const client_1 = __importDefault(require("../client"));
const bookings_1 = require("../controllers/bookings");
process.env.HOSTNAME = 'localhost',
    process.env.PROTOCOL = 'http';
process.env.PORT = '3000';
jest.mock('fs', () => ({
    unlink: jest.fn(),
}));
// Mock de Prisma
jest.mock('../client', () => ({
    booking: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        updateMany: jest.fn(),
    },
}));
let req;
let res;
let next;
beforeEach(() => {
    req = {};
    res = {
        status: jest.fn(() => res),
        json: jest.fn(),
    };
    next = jest.fn();
});
afterEach(() => {
    jest.clearAllMocks();
});
describe('bookings controller', () => {
    describe('getBookingById', () => {
        it('should return 404 if booking does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const req = { params: { id: '1' }, auth: { userId: 1 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            client_1.default.booking.findFirst.mockResolvedValueOnce(null);
            // Act
            yield (0, bookings_1.getBookingById)(req, res, jest.fn());
            // Assert
            expect(client_1.default.booking.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    userId: 1,
                },
                include: {
                    room: true,
                    user: true,
                },
            });
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'La reservation n\'existe pas' });
        }));
        it('should return the booking if it exists', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const req = { params: { id: '1' }, auth: { userId: 1 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const mockBooking = { id: 1, userId: 1, room: { id: 2 }, user: { id: 1 } };
            client_1.default.booking.findFirst.mockResolvedValueOnce(mockBooking);
            // Act
            yield (0, bookings_1.getBookingById)(req, res, jest.fn());
            // Assert
            expect(client_1.default.booking.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    userId: 1,
                },
                include: {
                    room: true,
                    user: true,
                },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockBooking);
        }));
    });
    describe('getMyBookings', () => {
        it('should return the user\'s bookings', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const req = { auth: { userId: 1 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const mockBookings = [{ id: 1 }, { id: 2 }];
            client_1.default.booking.findMany.mockResolvedValueOnce(mockBookings);
            // Act
            yield (0, bookings_1.getMyBookings)(req, res, jest.fn());
            // Assert
            expect(client_1.default.booking.findMany).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockBookings);
        }));
    });
    describe('getAllBookings()', () => {
        test('should return all bookings', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRequest = {};
            const mockResponse = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
            };
            const mockBookings = [
                { id: 1, name: 'booking1' },
                { id: 2, name: 'booking2' },
            ];
            client_1.default.booking.findMany.mockResolvedValueOnce(mockBookings);
            yield (0, bookings_1.getAllBookings)(mockRequest, mockResponse, {});
            expect(client_1.default.booking.findMany).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockBookings);
        }));
        test('should handle error', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRequest = {};
            const mockResponse = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
            };
            const mockError = new Error('Database error');
            client_1.default.booking.findMany.mockRejectedValueOnce(mockError);
            yield (0, bookings_1.getAllBookings)(mockRequest, mockResponse, {});
            expect(client_1.default.booking.findMany).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Une erreur est survenue.',
            });
        }));
    });
    describe('createBooking', () => {
        let req;
        let res;
        const next = jest.fn();
        beforeEach(() => {
            req = {
                body: {
                    data: {
                        roomId: 1,
                        dateCheckIn: new Date('2023-04-22'),
                        dateCheckOut: new Date('2023-04-25'),
                        email: 'test@example.com',
                    },
                },
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should create a booking when the room is available', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock de la fonction findFirst pour simuler qu'aucune réservation n'existe pour le créneau demandé
            client_1.default.booking.findFirst.mockResolvedValueOnce(null);
            yield (0, bookings_1.createBooking)(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalled();
            expect(client_1.default.booking.create).toHaveBeenCalledWith({
                data: {
                    roomId: 1,
                    dateCheckIn: new Date('2023-04-22'),
                    dateCheckOut: new Date('2023-04-25'),
                    email: 'test@example.com',
                },
            });
        }));
        it('should return a 409 status code when the room is unavailable', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock de la fonction findFirst pour simuler qu'une réservation existe pour le créneau demandé
            client_1.default.booking.findFirst.mockResolvedValueOnce({ toto: "ffd" });
            yield (0, bookings_1.createBooking)(req, res, next);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: "Une reservation est déjà en place pour les dates demandés" });
            expect(client_1.default.booking.create).not.toHaveBeenCalled();
        }));
        it('should return a 400 status code when the check-in date is after the check-out date', () => __awaiter(void 0, void 0, void 0, function* () {
            req.body.data.dateCheckIn = new Date('2023-04-26');
            yield (0, bookings_1.createBooking)(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "DateCheckIn doit être inferieur à DateCheckOut" });
            expect(client_1.default.booking.create).not.toHaveBeenCalled();
        }));
        it('should return a 400 status code when the email is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            req.body.data.email = 'invalidemail';
            yield (0, bookings_1.createBooking)(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "e-mail invalide" });
            expect(client_1.default.booking.create).not.toHaveBeenCalled();
        }));
        it('should return a 500 status code when an error occurs', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock de la fonction findFirst pour simuler une erreur
            client_1.default.booking.findFirst.mockRejectedValueOnce(new Error('Database error'));
        }));
    });
    // describe('updateBooking', () => {
    //   let req: Partial<Request>;
    //   let res: Partial<Response>;
    //   const next = jest.fn();
    //   beforeEach(() => {
    //     req = {
    //       params: { id: "1" },
    //       body: {
    //         data: {
    //           dateCheckIn: new Date('2023-04-22'),
    //           dateCheckOut: new Date('2023-04-25'),
    //           email: 'test@example.com',
    //           roomId: 1,
    //         },
    //       },
    //       auth: { userId: 1 }
    //     };
    //     res = {
    //       status: jest.fn().mockReturnThis(),
    //       json: jest.fn(),
    //     };
    //   });
    //   afterEach(() => {
    //     jest.clearAllMocks();
    //   });
    //   it('should update a booking when the room is available', async () => {
    //     // Mock de la fonction findFirst pour simuler qu'aucune réservation n'existe pour le créneau demandé
    //     (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce(null);
    //     await updateBooking(req as Request, res as Response, next);
    //     expect(res.status).toHaveBeenCalledWith(201);
    //     expect(res.json).toHaveBeenCalled();
    //     expect(prisma.booking.updateMany).toHaveBeenCalledWith({
    //       where: { id: 1, userId: 1 },
    //       data: {
    //         dateCheckIn: new Date('2023-04-22'),
    //         dateCheckOut: new Date('2023-04-25'),
    //         email: 'test@example.com',
    //       },
    //     });
    //   });
    //   it('should return a 409 status code when the room is unavailable', async () => {
    //     // Mock de la fonction findFirst pour simuler qu'une réservation existe pour le créneau demandé
    //     (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce({ toto: "ffd" });
    //     await updateBooking(req as Request, res as Response, next);
    //     expect(prisma.booking.updateMany).not.toHaveBeenCalled();
    //     expect(res.status).toHaveBeenCalledWith(409);
    //     expect(res.json).toHaveBeenCalledWith({ message: "Une reservation est déjà en place pour les dates demandés" });
    //   });
    //   it('should return a 400 status code when the check-in date is after the check-out date', async () => {
    //     req.body.data.dateCheckIn = new Date('2023-04-26');
    //     await updateBooking(req as Request, res as Response, next);
    //     expect(res.status).toHaveBeenCalledWith(400);
    //     expect(res.json).toHaveBeenCalledWith({ message: "DateCheckIn doit être inferieur à DateCheckOut" });
    //     expect(prisma.booking.updateMany).not.toHaveBeenCalled();
    //   });
    //   it('should return a 400 status code when the email is invalid', async () => {
    //     req.body.data.email = 'invalidemail';
    //     await updateBooking(req as Request, res as Response, next);
    //     expect(res.status).toHaveBeenCalledWith(400);
    //     expect(res.json).toHaveBeenCalledWith({ message: "e-mail invalide" });
    //     expect(prisma.booking.updateMany).not.toHaveBeenCalled();
    //   });
    //   it('should return a 500 status code when an error occurs', async () => {
    //     // Mock de la fonction findFirst pour simuler une erreur
    //     (prisma.booking.findFirst as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
    //   })
    // })
});
