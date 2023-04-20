import { Request, Response, NextFunction } from 'express'
import prisma from "../client";
import {
  getcategoriesArticleById, getAllcategoriesArticle,
  createcategoriesArticle,
  updatecategoriesArticle,
  deletecategoriesArticle,
} from "../controllers/categoriesArticle"

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

  it('should return catgory articles and their articles', async () => {
    req.params = { id: "1" }
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
    (prisma.categorieArticle.findUnique as jest.Mock).mockResolvedValueOnce(mockCategoryArticle)

    await getcategoriesArticleById(req as Request, res as Response, next as NextFunction)

    expect(prisma.categorieArticle.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }, include: {
        articles: true
      }
    })
    expect(res.json).toHaveBeenCalledWith(mockCategoryArticle)
    expect(res.status).toHaveBeenCalledWith(200)

  })
  it('should return 404 if catgory articles don\'t exist', async () => {
    req.params = { id: "1" }
    const mockCategoryArticle = null;
    const id = Number(req.params.id);
    (prisma.categorieArticle.findUnique as jest.Mock).mockResolvedValueOnce(mockCategoryArticle)

    await getcategoriesArticleById(req as Request, res as Response, next as NextFunction)

    expect(prisma.categorieArticle.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }, include: {
        articles: true
      }
    })
    expect(res.json).toHaveBeenCalledWith({ message: "la categorie n'existe pas" })
    expect(res.status).toHaveBeenCalledWith(404)

  })
  it('should return 500 if database error', async () => {
    req.params = { id: "1" }
    // const mockCategoryArticle = null;
    const id = Number(req.params.id);
    (prisma.categorieArticle.findUnique as jest.Mock).mockRejectedValueOnce(new Error('Database error'))

    await getcategoriesArticleById(req as Request, res as Response, next as NextFunction)

    expect(prisma.categorieArticle.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }, include: {
        articles: true
      }
    })
    expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' })
    expect(res.status).toHaveBeenCalledWith(500)

  })
})

describe('getAllcategoriesArticle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all categories', async () => {
    const mockResult = [{ id: 1, name: 'Category 1' }, { id: 2, name: 'Category 2' }];
    (prisma.categorieArticle.findMany as jest.Mock).mockResolvedValue(mockResult);

    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getAllcategoriesArticle(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should return an error if an error occurs', async () => {
    const mockError = new Error('Mock error');
    (prisma.categorieArticle.findMany as jest.Mock).mockRejectedValue(mockError);

    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getAllcategoriesArticle(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
  });
});

describe('createcategoriesArticle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new category', async () => {
    const mockResult = { id: 1, name: 'Category 1' };
    (prisma.categorieArticle.create as jest.Mock).mockResolvedValue(mockResult);

    const req = {
      body: {
        data: {
          name: 'Category 1',
        },
      },
    } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await createcategoriesArticle(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should return an error if an error occurs', async () => {
    const mockError = new Error('Mock error');
    (prisma.categorieArticle.create as jest.Mock).mockRejectedValue(mockError);

    const req = {
      body: {
        data: {
          name: 'Category 1',
        },
      },
    } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await createcategoriesArticle(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
  });
});

describe('categoriesArticleController', () => {
  describe('updatecategoriesArticle', () => {
    const mockRequest = {} as Request;
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    mockRequest.params = { id: '1' }
    mockRequest.body = { data: { name: 'new name' } };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should update the category and return the result', async () => {
      const mockUpdate = prisma.categorieArticle.update as jest.Mock;
      mockUpdate.mockResolvedValueOnce({ id: 1, name: 'new name' });

      await updatecategoriesArticle(mockRequest, mockResponse, jest.fn());

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'new name' },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ id: 1, name: 'new name' });
    });

    it('should handle errors', async () => {
      const mockUpdate = prisma.categorieArticle.update as jest.Mock;
      mockUpdate.mockRejectedValueOnce(new Error('DB connection error'));

      await updatecategoriesArticle(mockRequest, mockResponse, jest.fn());

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'new name' },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
  });

  describe('deletecategoriesArticle', () => {
    const mockRequest = {} as Request;
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    mockRequest.params = { id: '1' }

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should delete the category and return the result', async () => {
      const mockDelete = prisma.categorieArticle.delete as jest.Mock;
      mockDelete.mockResolvedValueOnce({ id: 1, name: 'Category 1' });

      await deletecategoriesArticle(mockRequest, mockResponse, jest.fn());

      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ id: 1, name: 'Category 1' });
    });

    it('should handle errors', async () => {
      const mockDelete = prisma.categorieArticle.delete as jest.Mock;
      mockDelete.mockRejectedValueOnce(new Error('DB connection error'));

      await deletecategoriesArticle(mockRequest, mockResponse, jest.fn());

      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue.' });
    });
  });
});