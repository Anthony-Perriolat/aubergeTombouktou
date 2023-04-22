import { Request, Response, NextFunction } from 'express';

import { PrismaClient } from '@prisma/client';

import prisma from '../client';

export const getcategoriesArticleById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    try {
        const result = await prisma.categorieArticle.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                articles: true
            }
        });
        if(!result) {
            res.status(404).json({message: "la categorie n'existe pas"})
        } else {
            res.status(200).json(result);
        }
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    } finally {
        await prisma.$disconnect();
      }
};

export const getAllcategoriesArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await prisma.categorieArticle.findMany();
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    } finally {
        await prisma.$disconnect();
      }
};

interface createCategoriesArticleData {
        title: string,
        description: string,
    }
export const createcategoriesArticle = async (req: Request, res: Response, next: NextFunction) => {
    const dataToCreate = req.body.data;
    try {
        const result = await prisma.categorieArticle.create({
            data: dataToCreate,
        });
        res.status(201).json(result);
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    } finally {
        await prisma.$disconnect();
      }
};
interface updateCategoriesArticleData {
    title?: string,
    description?: string,
}
export const updatecategoriesArticle = async (req: any, res: any, next: any) => {
    const id = req.params.id;
    const dataToUpdate = req.body.data;
    try {
        const result = await prisma.categorieArticle.update({
            where: { id: Number(id) },
            data: dataToUpdate,
        });
        res.status(201).json(result);
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    } finally {
        await prisma.$disconnect();
      }
};

export const deletecategoriesArticle = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const result = await prisma.categorieArticle.delete({
            where: {
                id: Number(id),
            },
        });
        res.status(201).json(result);
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    } finally {
        await prisma.$disconnect();
      }
};