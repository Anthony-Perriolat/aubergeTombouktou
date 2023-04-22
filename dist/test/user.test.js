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
const users_1 = require("../controllers/users");
const client_1 = __importDefault(require("../client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const regex = require('../lib/regex');
const { sendMailWelcome } = require('../lib/senderMail');
jest.mock('../lib/regex');
jest.mock('../lib/senderMail');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('prisma');
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
    it('should return a list of users', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUsers = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }];
        client_1.default.user.findMany.mockResolvedValueOnce(mockUsers);
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        yield (0, users_1.getAllUsers)(mockReq, mockRes);
        expect(client_1.default.user.findMany).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    }));
    it('should return an error if something goes wrong', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockError = new Error('Something went wrong');
        client_1.default.user.findMany.mockRejectedValueOnce(mockError);
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        yield (0, users_1.getAllUsers)(mockReq, mockRes);
        expect(client_1.default.user.findMany).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('login', () => {
    let mockRequest;
    let mockResponse;
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
    it('should return userId and token', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest.body.data.password = 'hashedpassword';
        const mockUser = { id: 1, email: 'it@example.com', password: 'hashedpassword' };
        const mockFindUnique = client_1.default.user.findUnique.mockResolvedValueOnce(mockUser);
        const mockCompare = jest.fn().mockResolvedValueOnce(true);
        const mockToken = 'xxx';
        // mockFindUnique.mockResolvedValueOnce(mockUser);
        bcrypt_1.default.compare.mockImplementationOnce(mockCompare);
        jsonwebtoken_1.default.sign.mockReturnValueOnce(mockToken);
        yield (0, users_1.login)(mockRequest, mockResponse);
        expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'it@example.com' } });
        expect(mockCompare).toHaveBeenCalledWith('hashedpassword', 'hashedpassword');
        expect(mockResponse.json).toHaveBeenCalledWith({ userId: 1, token: 'xxx' });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
    }));
    it('should return 400 if email is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest.body.data.email = 'invalid email';
        yield (0, users_1.login)(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'e-mail invalide' });
    }));
    it('should return 401 if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockFindUnique = client_1.default.user.findUnique.mockResolvedValueOnce(null);
        const mockCompare = jest.fn().mockResolvedValueOnce(false);
        bcrypt_1.default.compare.mockImplementationOnce(mockCompare);
        mockRequest.body.data = { email: 'notfound@example.com', password: 'it' };
        yield (0, users_1.login)(mockRequest, mockResponse);
        expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'notfound@example.com' } });
        expect(mockCompare).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'mauvaise combinaison de mdp et mail' });
    }));
    it('should return 401 if password is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = { id: 1, email: 'it@example.com', password: 'hashedpassword' };
        const mockFindUnique = client_1.default.user.findUnique.mockResolvedValueOnce(mockUser);
        const mockCompare = jest.fn().mockResolvedValueOnce(false);
        bcrypt_1.default.compare.mockImplementationOnce(mockCompare);
        // @ts-ignore
        client_1.default.user.findUnique.mockResolvedValue(mockUser);
        yield (0, users_1.login)(mockRequest, mockResponse);
        expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'it@example.com' } });
        expect(mockCompare).toHaveBeenCalledWith('testpassword', 'hashedpassword');
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'mauvaise combinaison de mdp et mail' });
    }));
});
describe('signUpUser', () => {
    let mockRequest;
    let mockResponse;
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
    it('should return 400 if email is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        // mockRequest.body.data.email = "email null"
        const mockValidateEmail = jest.fn().mockReturnValueOnce(false);
        regex.ValidateEmail.mockImplementationOnce(mockValidateEmail);
        yield (0, users_1.signUpUser)(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'e-mail invalide' });
        expect(client_1.default.user.create).not.toHaveBeenCalled();
    }));
    it('should create user and send welcome email', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockCompare = jest.fn().mockResolvedValueOnce('hashedpassword');
        bcrypt_1.default.hash.mockImplementationOnce(mockCompare);
        const mockValidateEmail = jest.fn().mockReturnValueOnce(true);
        regex.ValidateEmail.mockImplementationOnce(mockValidateEmail);
        const mockCreate = client_1.default.user.create.mockResolvedValueOnce({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com'
        });
        yield (0, users_1.signUpUser)(mockRequest, mockResponse);
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
    }));
    it('should return 500 if user creation fails', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockValidateEmail = jest.fn().mockReturnValueOnce(true);
        regex.ValidateEmail.mockImplementationOnce(mockValidateEmail);
        const mockCompare = jest.fn().mockResolvedValueOnce('hashedpassword');
        bcrypt_1.default.hash.mockImplementationOnce(mockCompare);
        // prisma.user.create.mockRejectedValueOnce(new Error('Something went wrong'));
        const mockCreate = client_1.default.user.create.mockResolvedValueOnce(null);
        yield (0, users_1.signUpUser)(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "l'utilisateur existe déjà ou une erreur c'est produite"
        });
        expect(client_1.default.user.create).toHaveBeenCalledWith({
            data: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
                password: 'hashedpassword'
            }
        });
        expect(sendMailWelcome).not.toHaveBeenCalled();
    }));
});
describe('updateUser', () => {
    let mockRequest;
    let mockResponse;
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
    it('should update a user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
        };
        const mockUpdate = client_1.default.user.update.mockResolvedValueOnce(mockUser);
        // const mockUpdate = jest.spyOn(prisma.user, 'update').mockResolvedValueOnce({
        //   id: 1,
        //   email: 'test@example.com',
        //   firstName: 'John',
        //   lastName: 'Doe',
        // });
        yield (0, users_1.updateUser)(mockRequest, mockResponse);
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
    }));
    it('should return a 400 status code for an invalid email', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest.body.data.email = 'invalid-email';
        yield (0, users_1.updateUser)(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'e-mail invalide' });
    }));
    it('should return a 500 status code for an error', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(client_1.default.user, 'update').mockRejectedValueOnce(new Error('Database error'));
        yield (0, users_1.updateUser)(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('deleteMyUser', () => {
    let mockRequest;
    let mockResponse;
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
    it('should delete the user and return the deleted user without password', () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const mockUserId = 1;
        mockRequest.auth = { userId: mockUserId };
        const mockDeletedUser = { id: mockUserId, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'hashedpassword' };
        client_1.default.user.delete.mockResolvedValueOnce(mockDeletedUser);
        // Act
        yield (0, users_1.deleteMyUser)(mockRequest, mockResponse);
        // Assert
        expect(client_1.default.user.delete).toHaveBeenCalledWith({ where: { id: mockUserId } });
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ id: mockUserId, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' });
    }));
    it('should return a 500 error if an error occurs', () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        mockRequest.auth = { userId: 1 };
        client_1.default.user.delete.mockRejectedValueOnce(new Error('Database error'));
        // Act
        yield (0, users_1.deleteMyUser)(mockRequest, mockResponse);
        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('updateMyUser', () => {
    let mockRequest;
    let mockResponse;
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
    it('should update the user and return the updated user', () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const mockUserId = 1;
        const mockDataToUpdate = { firstName: 'John', lastName: 'Doe' };
        const mockUpdatedUser = Object.assign({ id: mockUserId, email: 'test@example.com' }, mockDataToUpdate);
        const mockRequestData = { data: mockDataToUpdate };
        mockRequest = { body: mockRequestData, auth: { userId: mockUserId } };
        // mockRequest.auth = { userId: mockUserId };
        client_1.default.user.update.mockResolvedValueOnce(mockUpdatedUser);
        yield (0, users_1.updateMyUser)(mockRequest, mockResponse);
        expect(client_1.default.user.update).toHaveBeenCalledWith({
            where: { id: mockUserId },
            data: mockDataToUpdate,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedUser);
    }));
    it('should send a 400 response if email is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequestData = { data: { email: 'invalid-email' } };
        const mockUserId = 1;
        mockRequest = { body: mockRequestData, auth: { userId: mockUserId } };
        yield (0, users_1.updateMyUser)(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'e-mail invalide' });
    }));
    it('should send a 500 response if an error occurs', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequestData = { data: { firstName: 'John', lastName: 'Doe' } };
        const mockUserId = 1;
        mockRequest = { body: mockRequestData, auth: { userId: mockUserId } };
        client_1.default.user.update.mockRejectedValueOnce(new Error('An error occurred'));
        yield (0, users_1.updateMyUser)(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('getMyUser', () => {
    let mockRequest;
    let mockResponse;
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
    it('devrait retourner l\'utilisateur correspondant à l\'ID authentifié', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUserId = 1;
        mockRequest = { auth: { userId: mockUserId } };
        // Mock de la réponse de Prisma
        const mockUser = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            password: 'hashedpassword',
        };
        const mockFindUnique = client_1.default.user.findUnique.mockResolvedValueOnce(mockUser);
        yield (0, users_1.getMyUser)(mockRequest, mockResponse);
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
    }));
    it('devrait retourner une erreur 404 si l\'utilisateur n\'existe pas', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUserId = 1;
        mockRequest = { auth: { userId: mockUserId } };
        // Mock de la réponse de Prisma
        const mockFindUnique = client_1.default.user.findUnique.mockResolvedValueOnce(null);
        yield (0, users_1.getMyUser)(mockRequest, mockResponse);
        expect(mockFindUnique).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Utilisateur non trouvé.' });
    }));
    it('devrait retourner une erreur 500 en cas d\'erreur interne', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUserId = 1;
        mockRequest = { auth: { userId: mockUserId } };
        // Mock de la réponse de Prisma
        const mockFindUnique = client_1.default.user.findUnique.mockRejectedValueOnce(new Error('Database error'));
        yield (0, users_1.getMyUser)(mockRequest, mockResponse);
        expect(mockFindUnique).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
