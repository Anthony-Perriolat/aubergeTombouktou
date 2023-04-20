import { Request, Response, NextFunction } from 'express';
import prisma from '../client';
import fs from 'fs';

export const getArticleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = req.params.id;
    try {
        const result = await prisma.article.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                images: true
            }
        });
        if (!result) {
            res.status(404).json({ message: 'article inexistant' })
        } else {
            res.status(200).json(result);
        }
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
};

export const getAllArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await prisma.article.findMany();
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
};

export const createArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const dataToCreateRoom = req.body.data.article;
    try {
        if (req.files) {
            const images = (req.files as Express.Multer.File[]).map(file => ({
                title: file.filename,
                description: dataToCreateRoom.description,
                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/${file.filename}`
            }));
            const result = await prisma.article.create({
                data: {
                    ...dataToCreateRoom,
                    ImageRoom: {
                        create: images
                    }
                },
                include: {
                    images: true
                }
            });
            res.status(201).json({ article: result });
        } else {
            const result = await prisma.article.create({
                data: { ...dataToCreateRoom },
            });
            res.status(201).json({ article: result });

        }
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
};

export const updateArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = Number(req.params.id);
    const dataToUpdate = req.body.data;
    try {
        if (req.files) {
            const images = (req.files as Express.Multer.File[]).map(file => ({
                title: file.filename,
                description: dataToUpdate.description,
                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/${file.filename}`
            }));

            // erreur ici 
            const result = await prisma.article.update({
                where: { id: id },

                data: {
                    ...dataToUpdate,
                    images: {
                        upsert: {
                            create: images,
                            update: images,
                        }
                    }
                },
                include: {
                    images: true
                }
            });
            res.status(200).json({ article: result });
        }
        else {
            const result = await prisma.article.update({
                where: { id: id },
                data: { ...dataToUpdate },
            });
            res.status(201).json({ room: result });
        }
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
};
export const deleteImageArticle = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const imgDel = await prisma.imageArticle.delete({ where: { id: Number(id) } })
        fs.unlink(`public/images/${imgDel.title}`, () => { console.log(`img ${imgDel.title} delete`) })
        res.status(200).json({ message: "l'élément a bien été supprimé" })
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}
export const deleteArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const imgArray = await prisma.imageArticle.findMany({
            where: {
                articleId: Number(id),
            },
        });
        for (const i of imgArray) {
            fs.unlink(`public/images/${i.title}`, () => { console.log(`img ${i.title} delete`) })
        }
        await prisma.article.update({
            where: {
                id: Number(id),
            },
            data: {
                images: {
                    deleteMany: {},
                },
            },
        })
        const result = await prisma.article.delete({
            where: {
                id: Number(id),
            },
        });
        res.status(201).json(result);
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
};
