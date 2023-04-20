import { Request, Response, NextFunction } from 'express';
import prisma from '../client';
import {
  getBookingById,
  getAllBookings,
  getMyBookings,
  createBooking,
  updateBooking,
  deleteBooking
} from '../controllers/bookings';
import fs from 'fs';

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
let req: Request;
let res: Response;
let next: NextFunction;

beforeEach(() => {
  req = {} as Request;
  res = {
    status: jest.fn(() => res),
    json: jest.fn(),
  } as unknown as Response;
  next = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks()
})

describe('bookings controller', () => {
  describe('getBookingById', () => {
    it('should return 404 if booking does not exist', async () => {
      // Arrange
      const req = { params: { id: '1' }, auth: { userId: 1 } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce(null);

      // Act
      await getBookingById(req, res, jest.fn());

      // Assert
      expect(prisma.booking.findFirst).toHaveBeenCalledWith({
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
    });

    it('should return the booking if it exists', async () => {
      // Arrange
      const req = { params: { id: '1' }, auth: { userId: 1 } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const mockBooking = { id: 1, userId: 1, room: { id: 2 }, user: { id: 1 } };
      (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce(mockBooking);

      // Act
      await getBookingById(req, res, jest.fn());

      // Assert
      expect(prisma.booking.findFirst).toHaveBeenCalledWith({
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
    });
  });

  describe('getMyBookings', () => {
    it('should return the user\'s bookings', async () => {
      // Arrange
      const req = { auth: { userId: 1 } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const mockBookings = [{ id: 1 }, { id: 2 }];
      (prisma.booking.findMany as jest.Mock).mockResolvedValueOnce(mockBookings);

      // Act
      await getMyBookings(req, res, jest.fn());

      // Assert
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockBookings);
    });
  });

  describe('getAllBookings()', () => {
    test('should return all bookings', async () => {
      const mockRequest = {} as Request;
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;
      const mockBookings = [
        { id: 1, name: 'booking1' },
        { id: 2, name: 'booking2' },
      ];
      (prisma.booking.findMany as jest.Mock).mockResolvedValueOnce(mockBookings);

      await getAllBookings(mockRequest, mockResponse, {} as NextFunction);

      expect(prisma.booking.findMany).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBookings);
    });

    test('should handle error', async () => {
      const mockRequest = {} as Request;
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;
      const mockError = new Error('Database error');
      (prisma.booking.findMany as jest.Mock).mockRejectedValueOnce(mockError);

      await getAllBookings(mockRequest, mockResponse, {} as NextFunction);

      expect(prisma.booking.findMany).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Une erreur est survenue.',
      });
    });
  });
  describe('createBooking', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
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

    it('should create a booking when the room is available', async () => {
      // Mock de la fonction findFirst pour simuler qu'aucune réservation n'existe pour le créneau demandé
      (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await createBooking(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      expect(prisma.booking.create).toHaveBeenCalledWith({
        data: {
          roomId: 1,
          dateCheckIn: new Date('2023-04-22'),
          dateCheckOut: new Date('2023-04-25'),
          email: 'test@example.com',
        },
      });
    });

    it('should return a 409 status code when the room is unavailable', async () => {
      // Mock de la fonction findFirst pour simuler qu'une réservation existe pour le créneau demandé
      (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce({ toto: "ffd" });

      await createBooking(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Une reservation est déjà en place pour les dates demandés" });
      expect(prisma.booking.create).not.toHaveBeenCalled();
    });

    it('should return a 400 status code when the check-in date is after the check-out date', async () => {
      req.body.data.dateCheckIn = new Date('2023-04-26');

      await createBooking(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "DateCheckIn doit être inferieur à DateCheckOut" });
      expect(prisma.booking.create).not.toHaveBeenCalled();
    });

    it('should return a 400 status code when the email is invalid', async () => {
      req.body.data.email = 'invalidemail';
      await createBooking(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "e-mail invalide" });
      expect(prisma.booking.create).not.toHaveBeenCalled();
    });

    it('should return a 500 status code when an error occurs', async () => {
      // Mock de la fonction findFirst pour simuler une erreur
      (prisma.booking.findFirst as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
    })
  })

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

