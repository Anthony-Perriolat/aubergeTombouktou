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
    } finally {
        await prisma.$disconnect();
      }
};
export const getAllArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const categorieIdQuery = req.query.categorieId;
        const where = categorieIdQuery ? { categorieId: Number(categorieIdQuery) } : {};
    
        const result = await prisma.article.findMany({ where });
    
        res.status(200).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Une erreur est survenue." });
      } finally {
        await prisma.$disconnect();
      }
};

interface createArticleData {
    title: string,
    description: string,
    content: string,
    categorieId: number,
}
export const createArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const dataToCreateArticle: createArticleData = req.body.data;
    try {
        if (req.files) {
            const images = (req.files as Express.Multer.File[]).map(file => ({
                title: file.filename,
                description: dataToCreateArticle.description,
                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/${file.filename}`
            }));
            const result = await prisma.article.create({
                data: {
                    ...dataToCreateArticle,
                    images: {
                        create: images
                    },
                    categorieId: dataToCreateArticle.categorieId
                },
                include: {
                    images: true
                }
            });
            res.status(201).json(result);
        } else {
            const result = await prisma.article.create({
                data: { ...dataToCreateArticle },

            });
            res.status(201).json(result);

        }
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }  finally {
        await prisma.$disconnect();
      }
};

interface updateArticleData {
    title: string,
    description: string,
    content: string,
    categorieId: number,
}
export const updateArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = Number(req.params.id);
    const dataToUpdate: updateArticleData = req.body.data;
    try {
        if (req.files) {
            const images = (req.files as Express.Multer.File[]).map(file => ({
                title: file.filename,
                description: dataToUpdate.description,
                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/${file.filename}`
            }));
            const result = await prisma.article.update({
                where: { id: id },

                data: {
                    ...dataToUpdate,
                    images: {
                        upsert: images.map(image => ({
                            where: { title: image.title },
                            create: {
                                title: image.title,
                                description: image.description,
                                urlStorage: image.urlStorage,
                            },
                            update: {
                                title: image.title,
                                description: image.description,
                                urlStorage: image.urlStorage,
                            },
                        })),
                    },
                },
                include: {
                    images: true
                }
            });
            res.status(200).json(result);
        }
        else {
            const result = await prisma.article.update({
                where: { id: id },
                data: { ...dataToUpdate },
            });
            res.status(201).json(result);
        }
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }  finally {
        await prisma.$disconnect();
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
    } finally {
        await prisma.$disconnect();
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
    } finally {
        await prisma.$disconnect();
      }
};







