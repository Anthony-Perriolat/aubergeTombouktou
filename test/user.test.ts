import { Request, Response, NextFunction } from 'express';
import { getMyUser, updateMyUser, deleteMyUser, updateUser, signUpUser, getAllUsers, login } from '../controllers/users';
import prisma from '../client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { before } from 'node:test';
import { create } from 'node:domain';
const regex = require('../lib/regex');
const { sendMailWelcome } = require('../lib/senderMail');

jest.mock('../lib/regex');
jest.mock('../lib/senderMail');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('prisma')
jest.mock('../client', () => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('getAllUsers', () => {
  it('should return a list of users', async () => {
    const mockUsers = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }];
    (prisma.user.findMany as jest.Mock).mockResolvedValueOnce(mockUsers);

    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getAllUsers(mockReq, mockRes);

    expect(prisma.user.findMany).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
  });

  it('should return an error if something goes wrong', async () => {
    const mockError = new Error('Something went wrong');
    (prisma.user.findMany as jest.Mock).mockRejectedValueOnce(mockError);

    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getAllUsers(mockReq, mockRes);

    expect(prisma.user.findMany).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
  });
});

describe('login', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {
        data: {
          email: 'it@example.com',
          password: 'testpassword',
        },
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return userId and token', async () => {
    mockRequest.body.data.password = 'hashedpassword'
    const mockUser = { id: 1, email: 'it@example.com', password: 'hashedpassword' };
    const mockFindUnique = (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
    const mockCompare = jest.fn().mockResolvedValueOnce(true);
    const mockToken = 'xxx';
    // mockFindUnique.mockResolvedValueOnce(mockUser);
    (bcrypt.compare as jest.Mock).mockImplementationOnce(mockCompare);
    (jwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

    await login(mockRequest as Request, mockResponse as Response);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'it@example.com' } });
    expect(mockCompare).toHaveBeenCalledWith('hashedpassword', 'hashedpassword');
    expect(mockResponse.json).toHaveBeenCalledWith({ userId: 1, token: 'xxx' });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it('should return 400 if email is invalid', async () => {
    mockRequest.body.data.email = 'invalid email';
    await login(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'e-mail invalide' });
  });

  it('should return 401 if user not found', async () => {
    const mockFindUnique = (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const mockCompare = jest.fn().mockResolvedValueOnce(false);
    (bcrypt.compare as jest.Mock).mockImplementationOnce(mockCompare);
    (mockRequest.body as any).data = { email: 'notfound@example.com', password: 'it' };

    await login(mockRequest as Request, mockResponse as Response);
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'notfound@example.com' } });
    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'mauvaise combinaison de mdp et mail' });
  });

  it('should return 401 if password is incorrect', async () => {
    const mockUser = { id: 1, email: 'it@example.com', password: 'hashedpassword' };
    const mockFindUnique = (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
    const mockCompare = jest.fn().mockResolvedValueOnce(false);
    (bcrypt.compare as jest.Mock).mockImplementationOnce(mockCompare);
    // @ts-ignore
    prisma.user.findUnique.mockResolvedValue(mockUser)
    await login(mockRequest as Request, mockResponse as Response);
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'it@example.com' } });
    expect(mockCompare).toHaveBeenCalledWith('testpassword', 'hashedpassword');
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'mauvaise combinaison de mdp et mail' });
  });
})

describe('signUpUser', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@example.com',
          password: 'password123'
        }
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('should return 400 if email is invalid', async () => {
    // mockRequest.body.data.email = "email null"
    const mockValidateEmail = jest.fn().mockReturnValueOnce(false);
    (regex.ValidateEmail as jest.Mock).mockImplementationOnce(mockValidateEmail); 
    await signUpUser(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'e-mail invalide' });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should create user and send welcome email', async () => {
    const mockCompare = jest.fn().mockResolvedValueOnce('hashedpassword');
    (bcrypt.hash as jest.Mock).mockImplementationOnce(mockCompare);
    const mockValidateEmail = jest.fn().mockReturnValueOnce(true);
    (regex.ValidateEmail as jest.Mock).mockImplementationOnce(mockValidateEmail);
    const mockCreate = (prisma.user.create as jest.Mock).mockResolvedValueOnce({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com'
    });
    await signUpUser(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com'
    });
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'hashedpassword'
      }
    });
    expect(sendMailWelcome).toHaveBeenCalledWith({
      name: 'Doe John',
      email: 'johndoe@example.com'
    });
  });

  it('should return 500 if user creation fails', async () => {
    const mockValidateEmail = jest.fn().mockReturnValueOnce(true);
    (regex.ValidateEmail as jest.Mock).mockImplementationOnce(mockValidateEmail); const mockCompare = jest.fn().mockResolvedValueOnce('hashedpassword');
    (bcrypt.hash as jest.Mock).mockImplementationOnce(mockCompare);
    // prisma.user.create.mockRejectedValueOnce(new Error('Something went wrong'));
    const mockCreate = (prisma.user.create as jest.Mock).mockResolvedValueOnce(null);
    await signUpUser(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "l'utilisateur existe déjà ou une erreur c'est produite"
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'hashedpassword'
      }
    });
    expect(sendMailWelcome).not.toHaveBeenCalled();
  });
});

describe('updateUser', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      params: {
        id: '1',
      },
      body: {
        data: {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should update a user successfully', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };
    const mockUpdate = (prisma.user.update as jest.Mock).mockResolvedValueOnce(mockUser);

    // const mockUpdate = jest.spyOn(prisma.user, 'update').mockResolvedValueOnce({
    //   id: 1,
    //   email: 'test@example.com',
    //   firstName: 'John',
    //   lastName: 'Doe',
    // });

    await updateUser(mockRequest as Request, mockResponse as Response);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should return a 400 status code for an invalid email', async () => {
    mockRequest.body.data.email = 'invalid-email';

    await updateUser(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'e-mail invalide' });
  });

  it('should return a 500 status code for an error', async () => {
    jest.spyOn(prisma.user, 'update').mockRejectedValueOnce(new Error('Database error'));

    await updateUser(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
  });
});

describe('deleteMyUser', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should delete the user and return the deleted user without password', async () => {
    // Arrange
    const mockUserId = 1;
    mockRequest.auth = { userId: mockUserId };

    const mockDeletedUser = { id: mockUserId, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'hashedpassword' };
    (prisma.user.delete as jest.Mock).mockResolvedValueOnce(mockDeletedUser);

    // Act
    await deleteMyUser(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: mockUserId } });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({ id: mockUserId, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' });
  });

  it('should return a 500 error if an error occurs', async () => {
    // Arrange
    mockRequest.auth = { userId: 1 };

    (prisma.user.delete as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    // Act
    await deleteMyUser(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
  });
});

describe('updateMyUser', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should update the user and return the updated user', async () => {
    // Arrange
    const mockUserId = 1;
    const mockDataToUpdate = { firstName: 'John', lastName: 'Doe' };
    const mockUpdatedUser = { id: mockUserId, email: 'test@example.com', ...mockDataToUpdate };
    const mockRequestData = { data: mockDataToUpdate };
    mockRequest = {body: mockRequestData, auth:{userId: mockUserId} } as Request;
    // mockRequest.auth = { userId: mockUserId };

    (prisma.user.update as jest.Mock).mockResolvedValueOnce(mockUpdatedUser);

    await updateMyUser(mockRequest as Request, mockResponse as Response);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: mockUserId },
      data: mockDataToUpdate,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedUser);
  });

  it('should send a 400 response if email is invalid', async () => {
    const mockRequestData = { data: { email: 'invalid-email' } };
    const mockUserId = 1;
    mockRequest = { body: mockRequestData, auth:{userId: mockUserId} } as Request;

    await updateMyUser(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'e-mail invalide' });
  });

  it('should send a 500 response if an error occurs', async () => {
    const mockRequestData = { data: { firstName: 'John', lastName: 'Doe' } };
    const mockUserId = 1;
    mockRequest = { body: mockRequestData, auth:{userId: mockUserId} } as Request;
    (prisma.user.update as jest.Mock).mockRejectedValueOnce(new Error('An error occurred'));


    await updateMyUser(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
  });
});

describe('getMyUser', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('devrait retourner l\'utilisateur correspondant à l\'ID authentifié', async () => {
    const mockUserId = 1;
    mockRequest = { auth:{userId: mockUserId} } as Request;

    // Mock de la réponse de Prisma
    const mockUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'hashedpassword',
    };
    const mockFindUnique = (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

    await getMyUser(mockRequest as Request, mockResponse as Response);

    expect(mockFindUnique).toHaveBeenCalledTimes(1);
    // expect(mockFindUnique).toHaveBeenCalledWith({
    //   where: { id: mockRequest.auth.userId },
    // });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      id: mockUser.id,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      email: mockUser.email,
    });
  });

  it('devrait retourner une erreur 404 si l\'utilisateur n\'existe pas', async () => {
    const mockUserId = 1;
    mockRequest = { auth:{userId: mockUserId} } as Request;
    // Mock de la réponse de Prisma
    const mockFindUnique = (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    await getMyUser(mockRequest as Request, mockResponse as Response);

    expect(mockFindUnique).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Utilisateur non trouvé.' });
  });

  it('devrait retourner une erreur 500 en cas d\'erreur interne', async () => {
    const mockUserId = 1;
    mockRequest = { auth:{userId: mockUserId} } as Request;
    // Mock de la réponse de Prisma
    const mockFindUnique = (prisma.user.findUnique as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    await getMyUser(mockRequest as Request, mockResponse as Response);

    expect(mockFindUnique).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
  });
});