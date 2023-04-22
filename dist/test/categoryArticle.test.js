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
const categoriesArticle_1 = require("../controllers/categoriesArticle");
jest.mock('../client', () => ({
    categorieArticle: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    }
}));
describe('Test categoryById', () => {
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
    it('should return catgory articles and their articles', () => __awaiter(void 0, void 0, void 0, function* () {
        req.params = { id: "1" };
        const mockCategoryArticle = {
            id: 1,
            title: "test",
            description: "description",
            Articles: [{
                    id: 1,
                    title: "curieux",
                    description: "un gros article",
                    content: "bcp bcp de html",
                    date_publish: Date.now(),
                    date_update: Date.now(),
                    images: {},
                    categorieId: 1
                },
                {
                    id: 2,
                    title: "colere",
                    description: "un gros article",
                    content: "bcp bcp de html",
                    date_publish: Date.now(),
                    date_update: Date.now(),
                    images: {},
                    categorieId: 1
                }
            ]
        };
        const id = Number(req.params.id);
        client_1.default.categorieArticle.findUnique.mockResolvedValueOnce(mockCategoryArticle);
        yield (0, categoriesArticle_1.getcategoriesArticleById)(req, res, next);
        expect(client_1.default.categorieArticle.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }, include: {
                articles: true
            }
        });
        expect(res.json).toHaveBeenCalledWith(mockCategoryArticle);
        expect(res.status).toHaveBeenCalledWith(200);
    }));
    it('should return 404 if catgory articles don\'t exist', () => __awaiter(void 0, void 0, void 0, function* () {
        req.params = { id: "1" };
        const mockCategoryArticle = null;
        const id = Number(req.params.id);
        client_1.default.categorieArticle.findUnique.mockResolvedValueOnce(mockCategoryArticle);
        yield (0, categoriesArticle_1.getcategoriesArticleById)(req, res, next);
        expect(client_1.default.categorieArticle.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }, include: {
                articles: true
            }
        });
        expect(res.json).toHaveBeenCalledWith({ message: "la categorie n'existe pas" });
        expect(res.status).toHaveBeenCalledWith(404);
    }));
    it('should return 500 if database error', () => __awaiter(void 0, void 0, void 0, function* () {
        req.params = { id: "1" };
        // const mockCategoryArticle = null;
        const id = Number(req.params.id);
        client_1.default.categorieArticle.findUnique.mockRejectedValueOnce(new Error('Database error'));
        yield (0, categoriesArticle_1.getcategoriesArticleById)(req, res, next);
        expect(client_1.default.categorieArticle.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }, include: {
                articles: true
            }
        });
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
        expect(res.status).toHaveBeenCalledWith(500);
    }));
});
describe('getAllcategoriesArticle', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should return all categories', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockResult = [{ id: 1, name: 'Category 1' }, { id: 2, name: 'Category 2' }];
        client_1.default.categorieArticle.findMany.mockResolvedValue(mockResult);
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        yield (0, categoriesArticle_1.getAllcategoriesArticle)(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockResult);
    }));
    it('should return an error if an error occurs', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockError = new Error('Mock error');
        client_1.default.categorieArticle.findMany.mockRejectedValue(mockError);
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        yield (0, categoriesArticle_1.getAllcategoriesArticle)(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('createcategoriesArticle', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should create a new category', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockResult = { id: 1, name: 'Category 1' };
        client_1.default.categorieArticle.create.mockResolvedValue(mockResult);
        const req = {
            body: {
                data: {
                    name: 'Category 1',
                },
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        yield (0, categoriesArticle_1.createcategoriesArticle)(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockResult);
    }));
    it('should return an error if an error occurs', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockError = new Error('Mock error');
        client_1.default.categorieArticle.create.mockRejectedValue(mockError);
        const req = {
            body: {
                data: {
                    name: 'Category 1',
                },
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        yield (0, categoriesArticle_1.createcategoriesArticle)(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    }));
});
describe('categoriesArticleController', () => {
    describe('updatecategoriesArticle', () => {
        const mockRequest = {};
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockRequest.params = { id: '1' };
        mockRequest.body = { data: { name: 'new name' } };
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should update the category and return the result', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUpdate = client_1.default.categorieArticle.update;
            mockUpdate.mockResolvedValueOnce({ id: 1, name: 'new name' });
            yield (0, categoriesArticle_1.updatecategoriesArticle)(mockRequest, mockResponse, jest.fn());
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { name: 'new name' },
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ id: 1, name: 'new name' });
        }));
        it('should handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUpdate = client_1.default.categorieArticle.update;
            mockUpdate.mockRejectedValueOnce(new Error('DB connection error'));
            yield (0, categoriesArticle_1.updatecategoriesArticle)(mockRequest, mockResponse, jest.fn());
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { name: 'new name' },
            });
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
        }));
    });
    describe('deletecategoriesArticle', () => {
        const mockRequest = {};
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockRequest.params = { id: '1' };
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should delete the category and return the result', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockDelete = client_1.default.categorieArticle.delete;
            mockDelete.mockResolvedValueOnce({ id: 1, name: 'Category 1' });
            yield (0, categoriesArticle_1.deletecategoriesArticle)(mockRequest, mockResponse, jest.fn());
            expect(mockDelete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ id: 1, name: 'Category 1' });
        }));
        it('should handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockDelete = client_1.default.categorieArticle.delete;
            mockDelete.mockRejectedValueOnce(new Error('DB connection error'));
            yield (0, categoriesArticle_1.deletecategoriesArticle)(mockRequest, mockResponse, jest.fn());
            expect(mockDelete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
        }));
    });
});
