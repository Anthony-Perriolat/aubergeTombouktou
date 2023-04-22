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
const articles_1 = require("../controllers/articles");
const fs_1 = __importDefault(require("fs"));
process.env.HOSTNAME = 'localhost',
    process.env.PROTOCOL = 'http';
process.env.PORT = '3000';
jest.mock('fs', () => ({
    unlink: jest.fn(),
}));
// Mock de Prisma
jest.mock('../client', () => ({
    article: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    imageArticle: {
        findMany: jest.fn(),
        delete: jest.fn(),
    },
}));
describe('getArticleById', () => {
    const req = {};
    req.params = { id: '1' };
    const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
    };
    const next = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should return the article with the specified id', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockResult = {
            id: 1,
            title: 'Article 1',
            content: 'This is the first article',
            images: [],
        };
        client_1.default.article.findUnique.mockResolvedValueOnce(mockResult);
        yield (0, articles_1.getArticleById)(req, res, next);
        expect(client_1.default.article.findUnique).toHaveBeenCalledTimes(1);
        expect(client_1.default.article.findUnique).toHaveBeenCalledWith({
            where: { id: Number(req.params.id) },
            include: { images: true },
        });
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(mockResult);
    }));
    it('should return a 404 error if the article is not found', () => __awaiter(void 0, void 0, void 0, function* () {
        client_1.default.article.findUnique.mockResolvedValueOnce(null);
        yield (0, articles_1.getArticleById)(req, res, next);
        expect(client_1.default.article.findUnique).toHaveBeenCalledTimes(1);
        expect(client_1.default.article.findUnique).toHaveBeenCalledWith({
            where: { id: Number(req.params.id) },
            include: { images: true },
        });
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ message: 'article inexistant' });
    }));
    it('should return a 500 error if an error occurs', () => __awaiter(void 0, void 0, void 0, function* () {
        client_1.default.article.findUnique.mockRejectedValueOnce(new Error('Database error'));
        yield (0, articles_1.getArticleById)(req, res, next);
        expect(client_1.default.article.findUnique).toHaveBeenCalledTimes(1);
        expect(client_1.default.article.findUnique).toHaveBeenCalledWith({
            where: { id: Number(req.params.id) },
            include: { images: true },
        });
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('getAllArticles', () => {
    it('should return an array of articles', () => __awaiter(void 0, void 0, void 0, function* () {
        const articles = [{ id: 1, title: 'Article 1' }, { id: 2, title: 'Article 2' }];
        client_1.default.article.findMany.mockResolvedValue(articles);
        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = {};
        yield (0, articles_1.getAllArticles)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(articles);
    }));
    it('should return an error message on error', () => __awaiter(void 0, void 0, void 0, function* () {
        client_1.default.article.findMany.mockRejectedValue(new Error('DB error'));
        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = {};
        yield (0, articles_1.getAllArticles)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('createArticle', () => {
    const mockRequest = {
        body: {
            data: {
                article: {
                    title: 'Article title',
                    content: 'Article content',
                    description: 'Article content',
                    // date_publish: Date.now(),
                    // date_update: Date.now(),
                },
            },
        },
        files: [
            { filename: 'image1.jpg' },
            { filename: 'image2.jpg' },
        ],
    };
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    const mockNext = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should create an article with images', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockArticle = Object.assign(Object.assign({}, mockRequest.body.data.article), { images: [
                {
                    title: 'image1.jpg',
                    description: mockRequest.body.data.article.description,
                    urlStorage: `http://localhost:3000/public/images/image1.jpg`,
                },
                {
                    title: 'image2.jpg',
                    description: mockRequest.body.data.article.description,
                    urlStorage: `http://localhost:3000/public/images/image2.jpg`,
                },
            ] });
        const mockCreate = client_1.default.article.create.mockResolvedValueOnce(mockArticle);
        yield (0, articles_1.createArticle)(mockRequest, mockResponse, mockNext);
        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledWith({
            data: Object.assign(Object.assign({}, mockRequest.body.data.article), { ImageRoom: {
                    create: [
                        {
                            title: 'image1.jpg',
                            description: mockRequest.body.data.article.description,
                            urlStorage: `http://localhost:3000/public/images/image1.jpg`,
                        },
                        {
                            title: 'image2.jpg',
                            description: mockRequest.body.data.article.description,
                            urlStorage: `http://localhost:3000/public/images/image2.jpg`,
                        },
                    ],
                } }),
            include: {
                images: true,
            },
        });
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ article: mockArticle });
    }));
    it('should create an article without images', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockArticle = Object.assign({}, mockRequest.body.data.article);
        const mockCreate = client_1.default.article.create.mockResolvedValueOnce({
            title: 'Article title',
            content: 'Article content',
            description: 'Article content',
        });
        mockRequest.files = undefined;
        yield (0, articles_1.createArticle)(mockRequest, mockResponse, mockNext);
        expect(client_1.default.article.create).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledWith({
            data: mockArticle,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ article: mockArticle });
    }));
    it('should return an error response', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockError = new Error('Unexpected error');
        client_1.default.article.create.mockRejectedValueOnce(mockError);
        yield (0, articles_1.createArticle)(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('updateArticle', () => {
    const req = {
        params: { id: '1' },
        body: {
            data: {
                title: 'Updated article title',
                description: 'Updated article description',
            },
        },
        files: [
            { filename: 'image1.jpg' },
            { filename: 'image2.jpg' },
        ],
    };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should update an article with images', () => __awaiter(void 0, void 0, void 0, function* () {
        const fakeArticle = {
            id: 1,
            title: 'Old article title',
            description: 'Old article description',
            images: [{}, {}],
        };
        client_1.default.article.update.mockResolvedValueOnce(fakeArticle);
        yield (0, articles_1.updateArticle)(req, res, jest.fn());
        expect(client_1.default.article.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                title: 'Updated article title',
                description: 'Updated article description',
                images: {
                    upsert: {
                        create: [
                            {
                                title: 'image1.jpg',
                                description: 'Updated article description',
                                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/image1.jpg`,
                            },
                            {
                                title: 'image2.jpg',
                                description: 'Updated article description',
                                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/image2.jpg`,
                            },
                        ],
                        update: [
                            {
                                title: 'image1.jpg',
                                description: 'Updated article description',
                                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/image1.jpg`,
                            },
                            {
                                title: 'image2.jpg',
                                description: 'Updated article description',
                                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/image2.jpg`,
                            },
                        ],
                    },
                },
            },
            include: {
                images: true,
            },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ article: fakeArticle });
    }));
    it('should update an article without images', () => __awaiter(void 0, void 0, void 0, function* () {
        const fakeArticle = {
            id: 1,
            title: 'Old article title',
            description: 'Old article description',
        };
        client_1.default.article.update.mockResolvedValueOnce(fakeArticle);
        delete req.files;
        yield (0, articles_1.updateArticle)(req, res, jest.fn());
        expect(client_1.default.article.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                title: 'Updated article title',
                description: 'Updated article description',
            },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ room: fakeArticle });
    }));
    it('should handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
        client_1.default.article.update.mockRejectedValueOnce(new Error('Fake error'));
        yield (0, articles_1.updateArticle)(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('deleteArticle', () => {
    let req;
    let res;
    const next = jest.fn();
    beforeEach(() => {
        req = { params: { id: "1" } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should delete article', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockFindMany = client_1.default.imageArticle.findMany;
        const mockUpdate = client_1.default.article.update;
        const mockDelete = client_1.default.article.delete;
        // Mock de la requête
        mockFindMany.mockResolvedValueOnce([{ title: 'fake-image.jpg' }]);
        mockUpdate.mockResolvedValueOnce({ id: 1, images: [] });
        mockDelete.mockResolvedValueOnce({ id: 1, title: 'fake-title', content: 'fake-content' });
        yield (0, articles_1.deleteArticle)(req, res, next);
        // Assertions
        expect(mockFindMany).toHaveBeenCalledWith({
            where: {
                articleId: 1,
            },
        });
        expect(mockUpdate).toHaveBeenCalledWith({
            where: {
                id: 1,
            },
            data: {
                images: {
                    deleteMany: {},
                },
            },
        });
        expect(mockDelete).toHaveBeenCalledWith({
            where: {
                id: 1,
            },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: 1, title: 'fake-title', content: 'fake-content' });
    }));
    it('should handle error', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockFindMany = client_1.default.imageArticle.findMany;
        const mockUpdate = client_1.default.article.update;
        const mockDelete = client_1.default.article.delete;
        // Mock de la requête
        mockFindMany.mockRejectedValueOnce(new Error('Database error'));
        yield (0, articles_1.deleteArticle)(req, res, next);
        // Assertions
        expect(mockFindMany).toHaveBeenCalledWith({
            where: {
                articleId: 1,
            },
        });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('deleteImageArticle', () => {
    const mockRequest = {};
    mockRequest.params = { id: '1' };
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterAll(() => {
        jest.restoreAllMocks();
    });
    it('should delete an image article and return a success message', () => __awaiter(void 0, void 0, void 0, function* () {
        const fakeImage = { id: 1, title: 'fakeImage.jpg' };
        const mockDelete = client_1.default.imageArticle.delete.mockResolvedValueOnce(fakeImage);
        const mockUnlink = jest.fn().mockImplementationOnce((path, callback) => callback());
        fs_1.default.unlink.mockImplementationOnce(mockUnlink);
        yield (0, articles_1.deleteImageArticle)(mockRequest, mockResponse);
        expect(mockDelete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockUnlink).toHaveBeenCalledWith(`public/images/${fakeImage.title}`, expect.any(Function));
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "l'élément a bien été supprimé" });
    }));
    it('should return an error message if deleting the image article fails', () => __awaiter(void 0, void 0, void 0, function* () {
        const errorMessage = 'Error deleting image article';
        client_1.default.imageArticle.delete.mockRejectedValueOnce(new Error(errorMessage));
        yield (0, articles_1.deleteImageArticle)(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
