import { Request, Response, NextFunction } from 'express';
import prisma from '../client';
import {
    getArticleById,
    getAllArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    deleteImageArticle
} from '../controllers/articles';
import fs from 'fs';

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
    const req = {} as Request;

    req.params = { id: '1' };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return the article with the specified id', async () => {
      const mockResult = {
        id: 1,
        title: 'Article 1',
        content: 'This is the first article',
        images: [],
      };
      (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce(mockResult);
  
      await getArticleById(req, res, next);
  
      expect(prisma.article.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.article.findUnique).toHaveBeenCalledWith({
        where: { id: Number(req.params.id) },
        include: { images: true },
      });
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  
    it('should return a 404 error if the article is not found', async () => {
      (prisma.article.findUnique as jest.Mock).mockResolvedValueOnce(null);
  
      await getArticleById(req, res, next);
  
      expect(prisma.article.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.article.findUnique).toHaveBeenCalledWith({
        where: { id: Number(req.params.id) },
        include: { images: true },
      });
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ message: 'article inexistant' });
    });
  
    it('should return a 500 error if an error occurs', async () => {
      (prisma.article.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );
  
      await getArticleById(req, res, next);
  
      expect(prisma.article.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.article.findUnique).toHaveBeenCalledWith({
        where: { id: Number(req.params.id) },
        include: { images: true },
      });
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
  });
  describe('getAllArticles', () => {
    it('should return an array of articles', async () => {
      const articles = [{ id: 1, title: 'Article 1' }, { id: 2, title: 'Article 2' }];
      (prisma.article.findMany as jest.Mock).mockResolvedValue(articles);
  
      const req = {} as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = {} as NextFunction;
  
      await getAllArticles(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(articles);
    });
  
    it('should return an error message on error', async () => {
      (prisma.article.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
  
      const req = {} as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = {} as NextFunction;
  
      await getAllArticles(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
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
    } as Request;
  
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  
    const mockNext = jest.fn() as unknown as NextFunction;
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should create an article with images', async () => {
      const mockArticle = {
        ...mockRequest.body.data.article,
        images: [
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
      };  
      const mockCreate = (prisma.article.create as jest.Mock).mockResolvedValueOnce(mockArticle);
  
      await createArticle(mockRequest, mockResponse, mockNext);
  
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          ...mockRequest.body.data.article,
          ImageRoom: {
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
          },
        },
        include: {
          images: true,
        },
      });
  
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ article: mockArticle });
    });
  
    it('should create an article without images', async () => {
      const mockArticle = {
        ...mockRequest.body.data.article,
      };  
      const mockCreate = (prisma.article.create as jest.Mock).mockResolvedValueOnce({
        title: 'Article title',
        content: 'Article content',
        description: 'Article content',
      });
  
      mockRequest.files = undefined;
  
      await createArticle(mockRequest as Request, mockResponse as Response, mockNext);
  
      expect(prisma.article.create).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        data: mockArticle,
      });
  
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ article: mockArticle });
    });
  
    it('should return an error response', async () => {
      const mockError = new Error('Unexpected error');
      (prisma.article.create as jest.Mock).mockRejectedValueOnce(mockError);
  
      await createArticle(mockRequest, mockResponse, mockNext);
  
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
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
    } as unknown as Request;
  
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should update an article with images', async () => {
      const fakeArticle = {
        id: 1,
        title: 'Old article title',
        description: 'Old article description',
        images: [{}, {}],
      };
      (prisma.article.update as jest.Mock).mockResolvedValueOnce(fakeArticle);
  
      await updateArticle(req, res, jest.fn());
  
      expect(prisma.article.update).toHaveBeenCalledWith({
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
    });
  
    it('should update an article without images', async () => {
        
      const fakeArticle = {
        id: 1,
        title: 'Old article title',
        description: 'Old article description',
      };
      (prisma.article.update as jest.Mock).mockResolvedValueOnce(fakeArticle);
  
      delete req.files;
  
      await updateArticle(req, res, jest.fn());
  
      expect(prisma.article.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'Updated article title',
          description: 'Updated article description',
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ room: fakeArticle });
    });
  
    it('should handle errors', async () => {
      (prisma.article.update as jest.Mock).mockRejectedValueOnce(new Error('Fake error'));
  
      await updateArticle(req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    })
});

describe('deleteArticle', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    const next = jest.fn();

    beforeEach(() => {
        req = { params: {id: "1"} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should delete article', async () => {
      const mockFindMany = prisma.imageArticle.findMany as jest.Mock;
      const mockUpdate = prisma.article.update as jest.Mock;
      const mockDelete = prisma.article.delete as jest.Mock;
  
      // Mock de la requête
      mockFindMany.mockResolvedValueOnce([{ title: 'fake-image.jpg' }]);
      mockUpdate.mockResolvedValueOnce({ id: 1, images: [] });
      mockDelete.mockResolvedValueOnce({ id: 1, title: 'fake-title', content: 'fake-content' });
  
      await deleteArticle(req as Request, res as Response, next);
  
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
    });
  
    it('should handle error', async () => {
      const mockFindMany = prisma.imageArticle.findMany as jest.Mock;
      const mockUpdate = prisma.article.update as jest.Mock;
      const mockDelete = prisma.article.delete as jest.Mock;
  
      // Mock de la requête
      mockFindMany.mockRejectedValueOnce(new Error('Database error'));
  
      await deleteArticle(req as Request, res as Response, next);
  
      // Assertions
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          articleId: 1,
        },
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
  });
  describe('deleteImageArticle', () => {
    const mockRequest = {} as Request;
  mockRequest.params = { id: '1' }
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    afterAll(() => {
      jest.restoreAllMocks();
    });
  
    it('should delete an image article and return a success message', async () => {
      const fakeImage = { id: 1, title: 'fakeImage.jpg' };
      const mockDelete = (prisma.imageArticle.delete as jest.Mock).mockResolvedValueOnce(fakeImage);
      const mockUnlink = jest.fn().mockImplementationOnce((path, callback) => callback());
      (fs.unlink as unknown as jest.Mock).mockImplementationOnce(mockUnlink);
  
      await deleteImageArticle(mockRequest, mockResponse);
  
      expect(mockDelete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockUnlink).toHaveBeenCalledWith(`public/images/${fakeImage.title}`, expect.any(Function));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "l'élément a bien été supprimé" });
    });
  
    it('should return an error message if deleting the image article fails', async () => {
      const errorMessage = 'Error deleting image article';
      (prisma.imageArticle.delete as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
  
      await deleteImageArticle(mockRequest, mockResponse);
  
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
  });
  